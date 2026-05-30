import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { verifyDiff } from "@codeceipt/engine";

const load = (name: string) =>
  readFileSync(fileURLToPath(new URL(`./${name}`, import.meta.url)), "utf8");

describe("fixtures (deliberately-bad PRs prove the gate works)", () => {
  it("flags leaked secrets as fail", async () => {
    const v = await verifyDiff(load("bad-leaked-secret.diff"));
    expect(v.verdict).toBe("fail");
    expect(v.criteria.find((c) => c.kind === "regex")?.status).toBe("fail");
  });

  it("passes a feature without tests (advisory, not blocking) but flags it", async () => {
    const v = await verifyDiff(load("bad-no-tests.diff"));
    expect(v.verdict).toBe("pass");
    expect(v.criteria.some((c) => c.status === "skipped" || c.status === "warn")).toBe(true);
  });

  it("passes a clean change with tests", async () => {
    const v = await verifyDiff(load("good-with-tests.diff"));
    expect(v.verdict).toBe("pass");
  });
});
