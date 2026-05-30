import { describe, it, expect } from "vitest";
import { buildFixPrompt } from "./remediation";
import type { Verdict } from "./types";

const base: Verdict = {
  verdict: "fail",
  label: "FAILED",
  claims_met: 1,
  claims_total: 3,
  fingerprint: "cc1:0000000011111111",
  cost_usd: 0,
  duration_ms: 10,
  engine_version: "0.2.0",
  criteria: [
    { kind: "regex", blocking: true, label: "Uses idempotency keys", status: "fail", detail: "Pattern not found in added lines.", out: "0 matches", cmd: "grep -E idempotency" },
    { kind: "read_set", blocking: false, label: "A test was added", status: "warn", detail: "Missing: webhook.spec.ts" },
    { kind: "shell", blocking: true, label: "Tests pass", status: "pass", detail: "exit 0" },
  ],
};

describe("buildFixPrompt", () => {
  it("produces an actionable prompt from the failed criteria", () => {
    const p = buildFixPrompt(base, { subject: "acme/app#42" });
    expect(p).not.toBeNull();
    expect(p).toContain("did NOT pass");
    expect(p).toContain("acme/app#42");
    // includes the failed criterion + its reproduce command
    expect(p).toContain("Uses idempotency keys");
    expect(p).toContain("grep -E idempotency");
    expect(p).toContain("BLOCKING");
    // does NOT include the passing criterion
    expect(p).not.toContain("Tests pass");
  });

  it("returns null for a passing verdict with no failures", () => {
    const passing: Verdict = {
      ...base,
      verdict: "pass",
      label: "VERIFIED",
      criteria: [{ kind: "shell", blocking: true, label: "Tests pass", status: "pass", detail: "ok" }],
    };
    expect(buildFixPrompt(passing)).toBeNull();
  });

  it("returns null when only advisory warns remain (nothing failed)", () => {
    const advisory: Verdict = {
      ...base,
      verdict: "pass",
      label: "PARTIAL",
      criteria: [{ kind: "read_set", blocking: false, label: "coverage", status: "warn", detail: "low" }],
    };
    expect(buildFixPrompt(advisory)).toBeNull();
  });

  it("works without a subject", () => {
    const p = buildFixPrompt(base);
    expect(p).toContain("The pull request was verified");
  });
});
