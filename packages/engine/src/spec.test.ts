import { describe, it, expect } from "vitest";
import { parseSpec, extractSpecBlock, kindOf, verifyDeclared } from "./spec";
import { parseDiff } from "./diff";
import { verifyDiff } from "./index";

const diffWith = (path: string, ...lines: string[]) =>
  parseDiff(
    `diff --git a/${path} b/${path}\n--- /dev/null\n+++ b/${path}\n` +
      lines.map((l) => `+${l}`).join("\n") +
      "\n",
  );

describe("parseSpec", () => {
  it("parses YAML criteria", () => {
    const s = parseSpec("criteria:\n  - shell: pnpm test\n  - file: src/a.ts\n");
    expect(s?.criteria.length).toBe(2);
    expect(s?.criteria[0].shell).toBe("pnpm test");
  });

  it("parses JSON (YAML is a JSON superset)", () => {
    const s = parseSpec('{"criteria":[{"regex":"idempotency","in":"src/x.ts"}]}');
    expect(s?.criteria[0].regex).toBe("idempotency");
  });

  it("returns null on empty / garbage", () => {
    expect(parseSpec("")).toBeNull();
    expect(parseSpec("::: not yaml : : :")).toBeNull();
  });
});

describe("extractSpecBlock", () => {
  it("pulls a ```codeceipt block out of a PR body", () => {
    const body = "Adds idempotency.\n\n```codeceipt\ncriteria:\n  - shell: pnpm test\n```\n\nThanks!";
    const block = extractSpecBlock(body);
    expect(block).toContain("shell: pnpm test");
    expect(parseSpec(block!)?.criteria[0].shell).toBe("pnpm test");
  });

  it("returns null when there's no block", () => {
    expect(extractSpecBlock("just a normal PR description")).toBeNull();
  });
});

describe("kindOf", () => {
  it("maps each declared key to its criterion kind", () => {
    expect(kindOf({ shell: "x" })).toBe("shell");
    expect(kindOf({ file: "x" })).toBe("file_predicate");
    expect(kindOf({ regex: "x" })).toBe("regex");
    expect(kindOf({ read: "x" })).toBe("read_set");
    expect(kindOf({ judge: "x" })).toBe("llm_judge");
    expect(kindOf({ ears: "x" })).toBe("ears");
    expect(kindOf({ label: "x" })).toBeNull();
  });
});

describe("verifyDeclared (static mode — diff only)", () => {
  it("regex: passes when the pattern is in added lines", async () => {
    const files = diffWith("src/webhook.ts", "const key = idempotencyKey(event)");
    const r = await verifyDeclared({ regex: "idempotency" }, files, {});
    expect(r.kind).toBe("regex");
    expect(r.status).toBe("pass");
    expect(r.out).toMatch(/match/);
  });

  it("regex: fails when the pattern is absent", async () => {
    const files = diffWith("src/webhook.ts", "const x = 1");
    const r = await verifyDeclared({ regex: "idempotency" }, files, {});
    expect(r.status).toBe("fail");
    expect(r.blocking).toBe(true);
  });

  it("regex scoped with `in` only searches that file's added lines", async () => {
    const files = [
      ...diffWith("src/a.ts", "idempotency here"),
      ...diffWith("src/b.ts", "nothing"),
    ];
    const hit = await verifyDeclared({ regex: "idempotency", in: "src/b.ts" }, files, {});
    expect(hit.status).toBe("fail");
  });

  it("read_set: passes when all declared files are touched, warns otherwise", async () => {
    const files = [...diffWith("src/a.ts", "x"), ...diffWith("src/b.ts", "y")];
    const ok = await verifyDeclared({ read: ["src/a.ts", "src/b.ts"] }, files, {});
    expect(ok.status).toBe("pass");
    const miss = await verifyDeclared({ read: ["src/a.ts", "src/c.ts"] }, files, {});
    expect(miss.status).toBe("warn");
    expect(miss.blocking).toBe(false);
  });

  it("file_predicate: static mode is non-blocking (on-disk checked by the Action)", async () => {
    const files = diffWith("src/auth.ts", "export function login() {}");
    const r = await verifyDeclared({ file: "src/auth.ts" }, files, {});
    expect(r.kind).toBe("file_predicate");
    expect(r.blocking).toBe(false);
    expect(r.status).toBe("pass");
  });

  it("file_predicate + contains: matches the snippet in added lines", async () => {
    const files = diffWith("src/auth.ts", "export function login() {}");
    const r = await verifyDeclared(
      { file: "src/auth.ts", contains: "export function login" },
      files,
      {},
    );
    expect(r.status).toBe("pass");
  });

  it("shell: skipped + non-blocking in static mode", async () => {
    const r = await verifyDeclared({ shell: "pnpm test" }, [], {});
    expect(r.kind).toBe("shell");
    expect(r.status).toBe("skipped");
    expect(r.blocking).toBe(false);
    expect(r.cmd).toBe("pnpm test");
  });

  it("ears: passes well-formed, warns malformed", async () => {
    const ok = await verifyDeclared(
      { ears: "When a duplicate event arrives, the system shall return already_processed." },
      [],
      {},
    );
    expect(ok.status).toBe("pass");
    const bad = await verifyDeclared({ ears: "make it good" }, [], {});
    expect(bad.status).toBe("warn");
  });

  it("llm_judge: skipped (not guessed) when no API key is configured", async () => {
    const files = diffWith("src/x.ts", "const x = 1");
    const r = await verifyDeclared(
      { judge: "Adds idempotency keys" },
      files,
      { llmApiKey: undefined },
    );
    expect(r.kind).toBe("llm_judge");
    expect(r.status).toBe("skipped");
    expect(r.blocking).toBe(false);
  });

  it("unknown kind → advisory warn, never crashes", async () => {
    const r = await verifyDeclared({ label: "huh" }, [], {});
    expect(r.status).toBe("warn");
    expect(r.blocking).toBe(false);
  });

  it("multiple kinds on one entry → warn (never silently drops a claim)", async () => {
    const files = diffWith("src/a.ts", "x");
    const r = await verifyDeclared({ shell: "pnpm test", file: "src/a.ts" }, files, {});
    expect(r.status).toBe("warn");
    expect(r.blocking).toBe(false);
    expect(r.detail).toMatch(/multiple kinds/i);
  });

  it("`contains` paired with a non-file kind → warn (not silently ignored)", async () => {
    const files = diffWith("src/a.ts", "needle");
    const r = await verifyDeclared({ regex: "needle", contains: "needle" }, files, {});
    expect(r.status).toBe("warn");
    expect(r.detail).toMatch(/contains/i);
  });

  it("regex `in:` a file NOT in the diff → warn, not a blocking fail", async () => {
    const files = diffWith("src/a.ts", "idempotency");
    const r = await verifyDeclared({ regex: "idempotency", in: "src/other.ts" }, files, {});
    expect(r.status).toBe("warn");
    expect(r.blocking).toBe(false); // a wrong scope path must not FAIL a good PR
  });

  it("read: [] → warn (no vacuous pass)", async () => {
    const r = await verifyDeclared({ read: [] }, [], {});
    expect(r.status).toBe("warn");
  });

  it("path matching: slashed declared path does not cross-dir over-match", async () => {
    const files = [...diffWith("lib/a.ts", "x")];
    // declared src/a.ts must NOT be satisfied by lib/a.ts
    const r = await verifyDeclared({ read: ["src/a.ts"] }, files, {});
    expect(r.status).toBe("warn");
  });

  it("path matching: bare basename can match at any depth, case-insensitively", async () => {
    const files = [...diffWith("src/Auth.ts", "x")];
    const r = await verifyDeclared({ read: ["auth.ts"] }, files, {});
    expect(r.status).toBe("pass");
  });

  it("an over-long regex pattern is rejected as warn (ReDoS guard)", async () => {
    const r = await verifyDeclared({ regex: "a".repeat(400) }, [], {});
    expect(r.status).toBe("warn");
    expect(r.detail).toMatch(/invalid or too long/i);
  });
});

describe("verifyDiff with a declared spec (the spec-verifier path)", () => {
  const diff = `diff --git a/src/webhook.ts b/src/webhook.ts\n--- /dev/null\n+++ b/src/webhook.ts\n+export function handle(e) {\n+  const k = idempotencyKey(e);\n+  return ok(k);\n+}\n`;

  it("verifies declared criteria + always-on secret net, derives label", async () => {
    const spec =
      "criteria:\n  - regex: idempotency\n    label: Uses idempotency keys\n  - shell: pnpm test\n  - read: src/webhook.ts\n";
    const v = await verifyDiff(diff, { spec });
    // secret net + 3 declared
    expect(v.criteria.length).toBe(4);
    expect(v.criteria.some((c) => c.kind === "regex" && c.status === "pass")).toBe(true);
    // shell can't run in static → skipped → label PARTIAL, gate still passes
    expect(v.verdict).toBe("pass");
    expect(v.label).toBe("PARTIAL");
  });

  it("blocks when a declared blocking regex isn't satisfied", async () => {
    const v = await verifyDiff(diff, { spec: "criteria:\n  - regex: NONEXISTENT_PATTERN\n" });
    expect(v.verdict).toBe("fail");
    expect(v.label).toBe("FAILED");
  });

  it("reads a spec out of a PR body block", async () => {
    const prBody = "Adds idempotency.\n\n```codeceipt\ncriteria:\n  - regex: idempotency\n```\n";
    const v = await verifyDiff(diff, { prBody });
    expect(v.criteria.some((c) => c.kind === "regex" && c.status === "pass")).toBe(true);
  });

  it("falls back to the heuristic baseline when no spec is present", async () => {
    const v = await verifyDiff(diff, {});
    // baseline = secrets + files + read_set + shell(skipped) (+ ears if spec)
    expect(v.criteria.some((c) => c.kind === "file_predicate")).toBe(true);
    expect(v.criteria.some((c) => c.kind === "read_set")).toBe(true);
  });
});
