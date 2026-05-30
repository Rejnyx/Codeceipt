import { describe, it, expect, afterEach, vi } from "vitest";
import { ingestReceipt } from "./ingest";
import { getReceipt } from "./store";
import type { Verdict } from "./types";

const verdict: Verdict = {
  verdict: "pass",
  label: "VERIFIED",
  claims_met: 1,
  claims_total: 1,
  fingerprint: "cc1:0123456789abcdef",
  cost_usd: 0,
  duration_ms: 5,
  engine_version: "0.2.0",
  criteria: [
    { kind: "shell", blocking: true, label: "Tests pass", status: "pass", detail: "exit 0" },
  ],
};

afterEach(() => {
  delete process.env.CODECEIPT_INGEST_TOKEN;
  vi.unstubAllEnvs();
});

describe("ingestReceipt (GitHub Action publish path)", () => {
  it("stores a pre-computed receipt and returns a retrievable id", async () => {
    const res = await ingestReceipt({
      ...verdict,
      repo: "acme/app",
      pr: { platform: "GitHub", repo: "acme/app", number: 7 },
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      const stored = await getReceipt(res.id);
      expect(stored?.label).toBe("VERIFIED");
      expect(stored?.repo).toBe("acme/app");
      expect(stored?.pr?.number).toBe(7);
      // The Action's evidence is preserved verbatim (not re-run statically).
      expect(stored?.fingerprint).toBe("cc1:0123456789abcdef");
    }
  });

  it("rejects an invalid payload with 400", async () => {
    const res = await ingestReceipt({ not: "a verdict" });
    expect(res).toMatchObject({ ok: false, status: 400 });
  });

  it("rejects a non-URL pr_url (anti-XSS on the public href)", async () => {
    const res = await ingestReceipt({ ...verdict, pr_url: "javascript:alert(1)" });
    expect(res).toMatchObject({ ok: false, status: 400 });
  });

  it("fails closed in production when no ingest token is configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const res = await ingestReceipt(verdict);
    expect(res).toMatchObject({ ok: false, status: 503 });
  });

  it("requires a matching token when one is configured", async () => {
    process.env.CODECEIPT_INGEST_TOKEN = "s3cret";
    expect(await ingestReceipt(verdict, null)).toMatchObject({ ok: false, status: 401 });
    expect(await ingestReceipt(verdict, "Bearer wrong")).toMatchObject({ ok: false, status: 401 });
    const ok = await ingestReceipt(verdict, "Bearer s3cret");
    expect(ok.ok).toBe(true);
  });
});
