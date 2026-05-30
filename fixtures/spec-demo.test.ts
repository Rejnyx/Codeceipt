import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { verifyDiff } from "@codeceipt/engine";

const load = (name: string) =>
  readFileSync(fileURLToPath(new URL(`./${name}`, import.meta.url)), "utf8");

// The agent claims: "added idempotency keys + a test, all passing." These are
// the declared acceptance criteria a Codeceipt user would put in codeceipt.yml.
// The spec-verifier checks each one against the actual diff — not the claim.
const spec = `
criteria:
  - regex: idempotency
    in: src/webhooks/handler.ts
    label: Handler actually implements idempotency
  - read: src/webhooks/idempotency.spec.ts
    label: A test for it was actually added
  - shell: pnpm test
    label: The suite passes
`;

describe("spec-verifier demo (declared criteria vs the agent's word)", () => {
  // The always-on secret check is also kind "regex", so select declared
  // criteria by their label, not by kind.
  const byLabel = (v: Awaited<ReturnType<typeof verifyDiff>>, needle: string) =>
    v.criteria.find((c) => c.label.includes(needle));

  it("VERIFIES the honest PR — the diff backs up every diff-checkable claim", async () => {
    const v = await verifyDiff(load("spec-demo-good.diff"), { spec });
    // secret-net + 3 declared
    const regex = byLabel(v, "implements idempotency");
    const read = byLabel(v, "test for it");
    const shell = byLabel(v, "suite passes");
    expect(regex?.status).toBe("pass"); // idempotency really is in the handler
    expect(read?.status).toBe("pass"); // the test file really was added
    expect(shell?.status).toBe("skipped"); // can't run from a diff → PARTIAL, honest
    expect(v.verdict).toBe("pass");
    expect(v.label).toBe("PARTIAL");
  });

  it("CATCHES the slop PR — the claims don't match the diff", async () => {
    const v = await verifyDiff(load("spec-demo-slop.diff"), { spec });
    const regex = byLabel(v, "implements idempotency");
    const read = byLabel(v, "test for it");
    // "added idempotency" — but the handler has no such logic
    expect(regex?.status).toBe("fail");
    // "added a test" — but no test file is in the diff
    expect(read?.status).toBe("warn");
    // a blocking declared criterion failed → the gate blocks, label FAILED
    expect(v.verdict).toBe("fail");
    expect(v.label).toBe("FAILED");
  });
});
