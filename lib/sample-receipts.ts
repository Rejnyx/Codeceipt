/**
 * Sample receipts for the landing demo, the showcase, and the scenario chips.
 * These are illustrative (clearly-fictional repos) — they let the UI render a
 * full, polished receipt without a live scan. Mapped onto the real `Receipt`
 * type so the same components render samples and real receipts identically.
 */
import type { Receipt, CriterionResult, CriterionStatus } from "./types";

type RawCriterion = {
  label: string;
  status: CriterionStatus;
  evidence: string;
  cmd: string;
  out: string;
};

/** Infer a criterion kind from its command (display-only heuristic). */
function inferKind(cmd: string): CriterionResult["kind"] {
  if (/\b(test|tsc|lint|bench|migrate|spec|jest|vitest|playwright)\b/i.test(cmd))
    return "shell";
  if (/\b(psql|select|count|query)\b/i.test(cmd)) return "shell";
  if (/^(test |ls |stat |grep -F)/.test(cmd)) return "file_predicate";
  if (/^grep/.test(cmd)) return "regex";
  return "shell";
}

function toCriterion(c: RawCriterion): CriterionResult {
  return {
    kind: inferKind(c.cmd),
    blocking: c.status !== "warn", // advisory rows don't gate
    label: c.label,
    status: c.status,
    detail: c.evidence,
    evidence: c.evidence,
    cmd: c.cmd,
    out: c.out,
  };
}

const VERIFIED: Receipt = {
  id: "rcpt_a1f93c2e",
  created_at: "2026-05-30T14:22:07Z",
  fingerprint: "cc1:8f3a2e9d4b7c1056",
  verdict: "pass",
  label: "VERIFIED",
  claims_met: 8,
  claims_total: 8,
  pr_url: "https://github.com/acme-pay/checkout-service/pull/482",
  repo: "acme-pay/checkout-service",
  requested_by: "maya@northbeam.dev",
  env: "ubuntu-22.04 · node 20.11 · postgres 16",
  duration_ms: 161_000,
  cost_usd: 0.038,
  tokens: 184_920,
  engine_version: "0.2.0",
  pr: {
    platform: "GitHub",
    repo: "acme-pay/checkout-service",
    number: 482,
    title: "Add idempotency keys to the payment webhook handler",
    author: "devin-bot",
    authorKind: "AI agent",
    branch: "feat/webhook-idempotency",
    baseSha: "a3c9f01",
    headSha: "e7b2d48",
  },
  criteria: [
    toCriterion({ label: "Webhook handler rejects duplicate event IDs", status: "pass", evidence: "Replayed 3 identical Stripe events → 1 processed, 2 returned 200 with already_processed. No duplicate ledger rows.", cmd: "pnpm test webhook/idempotency.spec.ts", out: "14 passed (14)" }),
    toCriterion({ label: "Idempotency keys persisted to Postgres", status: "pass", evidence: "Row written to webhook_events with a unique constraint on (provider, event_id). Verified via direct query.", cmd: "psql -c 'select count(*) from webhook_events'", out: "3" }),
    toCriterion({ label: "Replayed events do not double-charge", status: "pass", evidence: "Charge mock asserted called exactly once across 3 deliveries of the same event.", cmd: "pnpm test billing/no-double-charge.spec.ts", out: "6 passed (6)" }),
    toCriterion({ label: "Integration test for concurrent delivery added", status: "pass", evidence: "New test fires 10 concurrent identical webhooks; exactly one is processed under a row lock.", cmd: "pnpm test --grep 'concurrent delivery'", out: "1 passed (1)" }),
    toCriterion({ label: "Migration is reversible", status: "pass", evidence: "Ran up → down → up; schema diff is empty, no data loss on rollback.", cmd: "pnpm migrate:up && pnpm migrate:down && pnpm migrate:up", out: "OK · reversible" }),
    toCriterion({ label: "No new type errors", status: "pass", evidence: "Full project typecheck clean against the PR head.", cmd: "pnpm tsc --noEmit", out: "0 errors" }),
    toCriterion({ label: "No new lint violations", status: "pass", evidence: "ESLint diff vs base shows 0 added problems.", cmd: "pnpm lint --max-warnings 0", out: "0 problems" }),
    toCriterion({ label: "P95 webhook latency stays under 120 ms", status: "pass", evidence: "Load test (500 req) measured P95 = 96 ms, within the stated 120 ms budget.", cmd: "pnpm bench webhook --n 500", out: "p95 96ms · p99 142ms" }),
  ],
  diff: {
    files: 6,
    additions: 214,
    deletions: 23,
    sample: [
      { t: "meta", s: "src/webhooks/handler.ts" },
      { t: "ctx", s: "  export async function handleEvent(req: Request) {" },
      { t: "ctx", s: "    const event = parse(req);" },
      { t: "add", s: "    const seen = await db.webhookEvents.findUnique({" },
      { t: "add", s: "      where: { provider_eventId: { provider, eventId: event.id } }," },
      { t: "add", s: "    });" },
      { t: "add", s: '    if (seen) return ok({ status: "already_processed" });' },
      { t: "ctx", s: "    const result = await processCharge(event);" },
      { t: "del", s: "    return ok(result);" },
      { t: "add", s: "    await db.webhookEvents.create({ data: { provider, eventId: event.id } });" },
      { t: "add", s: "    return ok(result);" },
      { t: "ctx", s: "  }" },
    ],
  },
  cost_breakdown: [
    { label: "Clone + restore cache", detail: "11s", usd: 0.001 },
    { label: "Criteria extraction (LLM)", detail: "184.9k tok", usd: 0.024 },
    { label: "Deterministic execution", detail: "2m 18s", usd: 0.012 },
    { label: "Receipt build + sign", detail: "12s", usd: 0.001 },
  ],
};

const FAILED: Receipt = {
  id: "rcpt_4d20be77",
  created_at: "2026-05-29T09:08:51Z",
  fingerprint: "cc1:b09c71fe23aa84d1",
  verdict: "fail",
  label: "FAILED",
  claims_met: 5,
  claims_total: 7,
  pr_url: "https://github.com/acme-pay/search-api/pull/119",
  repo: "acme-pay/search-api",
  requested_by: "lee@orbit.studio",
  env: "ubuntu-22.04 · node 20.11 · redis 7",
  duration_ms: 192_000,
  cost_usd: 0.041,
  tokens: 142_300,
  engine_version: "0.2.0",
  pr: {
    platform: "GitHub",
    repo: "acme-pay/search-api",
    number: 119,
    title: "Cache product search results in Redis",
    author: "sweep-ai",
    authorKind: "AI agent",
    branch: "feat/search-cache",
    baseSha: "7712aab",
    headSha: "0c4e9f1",
  },
  criteria: [
    toCriterion({ label: "Search results cached in Redis", status: "pass", evidence: "Cache hit observed on the second identical query; TTL set to 300s.", cmd: "pnpm test cache.spec.ts", out: "8 passed (8)" }),
    toCriterion({ label: "Cache invalidated on product update", status: "fail", evidence: "Updating a product left the stale entry in cache — assertion failed. Cache key not busted on write.", cmd: "pnpm test invalidation.spec.ts", out: "1 failed, 2 passed" }),
    toCriterion({ label: "Falls back to DB on Redis outage", status: "pass", evidence: "With Redis killed mid-test, the query served from Postgres with no error.", cmd: "pnpm test fallback.spec.ts", out: "4 passed (4)" }),
    toCriterion({ label: "No new type errors", status: "pass", evidence: "Typecheck clean.", cmd: "pnpm tsc --noEmit", out: "0 errors" }),
    toCriterion({ label: "P95 latency improved vs baseline", status: "pass", evidence: "P95 dropped from 210ms to 74ms on a warm cache.", cmd: "pnpm bench search", out: "p95 74ms" }),
    toCriterion({ label: "Integration test for cache stampede", status: "fail", evidence: "Claimed test does not exist in the diff. No file matched the described stampede scenario.", cmd: "pnpm test --grep 'stampede'", out: "0 tests found" }),
    toCriterion({ label: "No new lint violations", status: "pass", evidence: "ESLint diff clean.", cmd: "pnpm lint", out: "0 problems" }),
  ],
  diff: {
    files: 4,
    additions: 96,
    deletions: 12,
    sample: [
      { t: "meta", s: "src/search/cache.ts" },
      { t: "add", s: "  const cached = await redis.get(key);" },
      { t: "add", s: "  if (cached) return JSON.parse(cached);" },
      { t: "ctx", s: "  const rows = await db.search(q);" },
      { t: "add", s: '  await redis.set(key, JSON.stringify(rows), "EX", 300);' },
    ],
  },
  cost_breakdown: [
    { label: "Clone + restore cache", detail: "14s", usd: 0.001 },
    { label: "Criteria extraction (LLM)", detail: "142.3k tok", usd: 0.019 },
    { label: "Deterministic execution", detail: "2m 44s", usd: 0.02 },
    { label: "Receipt build + sign", detail: "10s", usd: 0.001 },
  ],
};

const PARTIAL: Receipt = {
  id: "rcpt_77c1aa90",
  created_at: "2026-05-30T11:47:00Z",
  fingerprint: "cc1:5ad7c4901bb2e6f8",
  verdict: "pass",
  label: "PARTIAL",
  claims_met: 6,
  claims_total: 6,
  pr_url: "https://gitlab.com/northbeam/billing-portal/-/merge_requests/73",
  repo: "northbeam/billing-portal",
  requested_by: "sam@northbeam.dev",
  env: "ubuntu-22.04 · node 20.11",
  duration_ms: 118_000,
  cost_usd: 0.022,
  tokens: 98_400,
  engine_version: "0.2.0",
  pr: {
    platform: "GitLab",
    repo: "northbeam/billing-portal",
    number: 73,
    title: "Add Stripe customer portal deep-link",
    author: "m.okafor",
    authorKind: "Human + AI assist",
    branch: "feat/portal-link",
    baseSha: "d91ee20",
    headSha: "fa30c7b",
  },
  criteria: [
    toCriterion({ label: "Generates a valid portal session URL", status: "pass", evidence: "Mock Stripe returned a session; URL shape validated.", cmd: "pnpm test portal.spec.ts", out: "5 passed (5)" }),
    toCriterion({ label: "Requires an authenticated session", status: "pass", evidence: "Anonymous request returns 401.", cmd: "pnpm test auth.spec.ts", out: "3 passed (3)" }),
    toCriterion({ label: "Handles Stripe API errors gracefully", status: "pass", evidence: "Forced 500 → user sees retry, no crash.", cmd: "pnpm test errors.spec.ts", out: "4 passed (4)" }),
    toCriterion({ label: "No new type errors", status: "pass", evidence: "Typecheck clean.", cmd: "pnpm tsc --noEmit", out: "0 errors" }),
    toCriterion({ label: "Unit coverage above 80%", status: "pass", evidence: "Coverage 84% on changed files.", cmd: "pnpm test --coverage", out: "84.1%" }),
    { kind: "shell", blocking: false, label: "E2E click-through verified in staging", status: "skipped", detail: "Skipped — requires staging secrets not available to the sandbox. Cannot execute, so not certified.", evidence: "Not executed — no staging env.", cmd: "playwright test e2e/portal", out: "skipped (no env)" },
  ],
  diff: {
    files: 3,
    additions: 71,
    deletions: 4,
    sample: [
      { t: "meta", s: "src/billing/portal.ts" },
      { t: "add", s: "  const session = await stripe.billingPortal.sessions.create({" },
      { t: "add", s: "    customer: customerId, return_url: returnUrl," },
      { t: "add", s: "  });" },
      { t: "add", s: "  return session.url;" },
    ],
  },
  cost_breakdown: [
    { label: "Clone + restore cache", detail: "9s", usd: 0.001 },
    { label: "Criteria extraction (LLM)", detail: "98.4k tok", usd: 0.013 },
    { label: "Deterministic execution", detail: "1m 38s", usd: 0.007 },
    { label: "Receipt build + sign", detail: "11s", usd: 0.001 },
  ],
};

const SAMPLES: Record<string, Receipt> = {
  [VERIFIED.id]: VERIFIED,
  [FAILED.id]: FAILED,
  [PARTIAL.id]: PARTIAL,
};

export const SAMPLE_IDS = {
  verified: VERIFIED.id,
  failed: FAILED.id,
  partial: PARTIAL.id,
} as const;

/** A receipt by id, if it's one of the built-in samples. */
export function getSampleReceipt(id: string): Receipt | null {
  return SAMPLES[id] ?? null;
}

/** All samples, for the live hero card switcher. */
export function allSamples(): Receipt[] {
  return [VERIFIED, FAILED, PARTIAL];
}
