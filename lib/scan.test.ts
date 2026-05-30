import { describe, it, expect } from "vitest";
import { runScan } from "./scan";
import { getReceipt } from "./store";

describe("runScan (full flow: validate → engine → store)", () => {
  it("creates a fail receipt for a secret diff", async () => {
    const r = await runScan({
      diff: "diff --git a/x.ts b/x.ts\n--- /dev/null\n+++ b/x.ts\n+const k = sk-ABCDEFGHIJKLMNOP1234567890\n",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      const rec = await getReceipt(r.id);
      expect(rec?.verdict).toBe("fail");
      expect(
        rec?.criteria.some((c) => c.kind === "regex" && c.status === "fail"),
      ).toBe(true);
    }
  });

  it("creates a pass receipt for a clean diff (no blocking failures)", async () => {
    const r = await runScan({
      diff: "diff --git a/x.ts b/x.ts\n--- a/x.ts\n+++ b/x.ts\n@@ -1 +1 @@\n+const sum = a + b\n",
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect((await getReceipt(r.id))?.verdict).toBe("pass");
  });

  it("rejects a body with neither pr_url nor diff (400)", async () => {
    expect(await runScan({})).toMatchObject({ ok: false, status: 400 });
  });
});
