import { describe, it, expect } from "vitest";
import { verifyDiff, mockVerdict, summarizeDiff, Verdict } from "./index";

const clean = `diff --git a/x.ts b/x.ts\n--- a/x.ts\n+++ b/x.ts\n@@ -1 +1 @@\n+const sum = a + b\n`;
const withSecret = `diff --git a/x.ts b/x.ts\n--- /dev/null\n+++ b/x.ts\n+const k = "sk-ABCDEFGHIJKLMNOP1234567890"\n`;

describe("verifyDiff", () => {
  it("returns a verdict that satisfies the Verdict schema", async () => {
    const v = await verifyDiff(clean);
    expect(() => Verdict.parse(v)).not.toThrow();
  });

  it("fails when a secret is present", async () => {
    const v = await verifyDiff(withSecret);
    expect(v.verdict).toBe("fail");
    expect(v.criteria.find((c) => c.kind === "regex")?.status).toBe("fail");
  });

  it("rolls up to pass for a clean diff (no blocking failures)", async () => {
    const v = await verifyDiff(clean);
    expect(v.verdict).toBe("pass");
  });

  it("fails (won't bless) an oversized diff instead of scanning it", async () => {
    const huge = "+".padEnd(2_000_001, "x");
    const v = await verifyDiff(huge);
    expect(v.verdict).toBe("fail");
    expect(v.criteria[0].detail).toMatch(/too large|limit/i);
  });

  it("never emits an llm_judge criterion in static mode", async () => {
    const v = await verifyDiff(clean);
    expect(v.criteria.some((c) => c.kind === "llm_judge")).toBe(false);
  });
});

describe("verdict label + fingerprint (the re-verify trust primitives)", () => {
  it("derives FAILED when a blocking criterion fails", async () => {
    expect((await verifyDiff(withSecret)).label).toBe("FAILED");
  });

  it("derives PARTIAL for a clean diff in static mode (tests can't run)", async () => {
    const v = await verifyDiff(clean);
    expect(v.verdict).toBe("pass");
    expect(v.label).toBe("PARTIAL");
  });

  it("produces a deterministic fingerprint — same diff, same value", async () => {
    const a = await verifyDiff(clean);
    const b = await verifyDiff(clean);
    expect(a.fingerprint).toBe(b.fingerprint);
    expect(a.fingerprint).toMatch(/^cc1:[0-9a-f]{16}$/);
  });

  it("counts claims_met / claims_total (skipped excluded from the total)", async () => {
    const v = await verifyDiff(clean);
    expect(v.claims_total).toBe(v.criteria.filter((c) => c.status !== "skipped").length);
    expect(v.claims_met).toBe(v.criteria.filter((c) => c.status === "pass").length);
  });

  it("fingerprint changes when a criterion flips blocking (gate-determining field)", async () => {
    // Same kind/status/detail, different blocking → must NOT share a fingerprint.
    const blockingPass = await verifyDiff(clean, { spec: "criteria:\n  - regex: const\n" });
    const advisoryPass = await verifyDiff(clean, {
      spec: "criteria:\n  - regex: const\n    blocking: false\n",
    });
    expect(blockingPass.criteria[1].status).toBe(advisoryPass.criteria[1].status);
    expect(blockingPass.fingerprint).not.toBe(advisoryPass.fingerprint);
  });
});

describe("summarizeDiff", () => {
  it("counts files and additions, and samples the hunk", () => {
    const s = summarizeDiff(withSecret);
    expect(s.files).toBe(1);
    expect(s.additions).toBeGreaterThan(0);
    expect(s.sample[0].t).toBe("meta");
  });
});

describe("mockVerdict", () => {
  it("mirrors the static criterion set (no fabricated llm_judge)", () => {
    const v = mockVerdict(clean);
    expect(v.criteria.some((c) => c.kind === "llm_judge")).toBe(false);
    expect(v.engine_version).toMatch(/-mock$/);
  });

  it("fails closed on a secret (shares roll-up with verifyDiff)", () => {
    expect(mockVerdict(withSecret).verdict).toBe("fail");
  });

  it("satisfies the Verdict schema", () => {
    expect(() => Verdict.parse(mockVerdict(clean))).not.toThrow();
  });
});
