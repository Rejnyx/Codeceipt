import { describe, it, expect } from "vitest";
import { runAction, loadSpecFile } from "./action";

const diff = `diff --git a/src/webhook.ts b/src/webhook.ts
--- /dev/null
+++ b/src/webhook.ts
+export function handle(e) {
+  const k = idempotencyKey(e);
+  return ok(k);
+}
`;

// A working dir with no spec file, so the PR-body block is the only spec source
// and no on-disk file_predicate/shell surprises occur (allowExec: false).
const NO_SPEC_DIR = "packages/engine/src";

describe("runAction (working-tree surface, diff supplied directly)", () => {
  it("verifies a spec from a ```codeceipt PR-body block", async () => {
    const prBody = [
      "Adds webhook idempotency.",
      "",
      "```codeceipt",
      "criteria:",
      "  - regex: idempotency",
      "    label: Uses idempotency keys",
      "  - read: src/webhook.ts",
      "  - shell: pnpm test",
      "```",
    ].join("\n");

    const { verdict, specSource } = await runAction({
      workingDir: NO_SPEC_DIR,
      diff,
      prBody,
      allowExec: false, // don't actually run shell in the unit test
    });

    expect(specSource).toBe("pr-body");
    expect(verdict.criteria.some((c) => c.kind === "regex" && c.status === "pass")).toBe(true);
    // shell can't/shouldn't run here → skipped → PARTIAL, gate still passes
    expect(verdict.criteria.some((c) => c.kind === "shell" && c.status === "skipped")).toBe(true);
    expect(verdict.verdict).toBe("pass");
    expect(verdict.label).toBe("PARTIAL");
  });

  it("falls back to the heuristic baseline when there is no spec", async () => {
    const { verdict, specSource } = await runAction({
      workingDir: NO_SPEC_DIR,
      diff,
      prBody: "just a normal description",
      allowExec: false,
    });
    expect(specSource).toBe("none");
    expect(verdict.criteria.some((c) => c.kind === "read_set")).toBe(true);
  });

  it("loadSpecFile finds the repo's own codeceipt.yml (dogfood spec)", async () => {
    // vitest runs with cwd = repo root, which ships a real codeceipt.yml.
    const found = await loadSpecFile(".");
    expect(found).not.toBeNull();
    expect(found?.path).toMatch(/codeceipt\.ya?ml$/);
    expect(found?.spec.criteria.length).toBeGreaterThan(0);
  });
});
