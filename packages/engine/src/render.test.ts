import { describe, it, expect } from "vitest";
import { renderMarkdown } from "./render";
import type { Verdict } from "./types";

const base: Verdict = {
  verdict: "pass",
  label: "VERIFIED",
  claims_met: 2,
  claims_total: 2,
  fingerprint: "cc1:dead0000beef1111",
  cost_usd: 0,
  duration_ms: 12_300,
  engine_version: "0.2.0",
  criteria: [
    {
      kind: "shell",
      blocking: true,
      label: "Tests pass",
      status: "pass",
      detail: "exit 0",
      cmd: "pnpm test",
      out: "exit 0 · 12.3s",
    },
    {
      kind: "read_set",
      blocking: false,
      label: "Touches declared files",
      status: "pass",
      detail: "1/1",
    },
  ],
};

describe("renderMarkdown", () => {
  it("renders the verdict header + claim ratio + fingerprint", () => {
    const md = renderMarkdown(base, { receiptUrl: "https://codeceipt.dev/r/abc" });
    expect(md).toContain("## Codeceipt — VERIFIED");
    expect(md).toContain("2/2 criteria reproduced");
    expect(md).toContain("cc1:dead0000beef1111");
    expect(md).toContain("https://codeceipt.dev/r/abc");
  });

  it("renders a row per criterion with the executed result", () => {
    const md = renderMarkdown(base);
    expect(md).toContain("Tests pass");
    expect(md).toContain("exit 0 · 12.3s");
    expect(md).toContain("`shell`");
    expect(md).toContain("_(advisory)_"); // the non-blocking read_set
  });

  it("escapes pipe characters so the table can't break", () => {
    const md = renderMarkdown({
      ...base,
      criteria: [{ kind: "regex", blocking: true, label: "a | b", status: "pass", detail: "" }],
    });
    expect(md).toContain("a \\| b");
  });

  it("uses the right headline per label", () => {
    expect(renderMarkdown({ ...base, label: "FAILED" })).toContain("**FAILED**");
    expect(renderMarkdown({ ...base, label: "PARTIAL" })).toContain("**PARTIAL**");
  });
});
