/**
 * Web-side types. Re-exports the engine's Verdict contract (the SSOT) and
 * extends it into a stored, shareable Receipt.
 */
import { z } from "zod";
import { Verdict, DiffSummary } from "@codeceipt/engine";

export type {
  Verdict,
  CriterionResult,
  CriterionStatus,
  VerdictLabel,
  DiffSummary,
  DiffLine,
  CostLine,
} from "@codeceipt/engine";

/** Pull-request identity shown on the receipt (gathered by the web layer). */
export const PrMeta = z.object({
  platform: z.string(), // "GitHub" | "GitLab"
  repo: z.string(),
  number: z.number().optional(),
  title: z.string().optional(),
  author: z.string().optional(),
  authorKind: z.string().optional(), // "AI agent" | "Human" | "Human + AI assist"
  branch: z.string().optional(),
  baseSha: z.string().optional(),
  headSha: z.string().optional(),
});
export type PrMeta = z.infer<typeof PrMeta>;

/** A stored, shareable receipt = a verdict + how/where it was produced. */
export const Receipt = Verdict.extend({
  id: z.string(),
  created_at: z.string(),
  pr_url: z.string().nullable(),
  repo: z.string().nullable(),
  pr: PrMeta.optional(),
  diff: DiffSummary.optional(),
  env: z.string().optional(),
  requested_by: z.string().optional(),
});
export type Receipt = z.infer<typeof Receipt>;

/** Request body for POST /api/scan (trust boundary). */
export const ScanRequest = z
  .object({
    pr_url: z.string().url().optional(),
    diff: z.string().max(2_000_000).optional(),
  })
  .refine((b) => b.pr_url || b.diff, {
    message: "Provide either pr_url or diff.",
  });
export type ScanRequest = z.infer<typeof ScanRequest>;

/**
 * Request body for POST /api/ingest (the GitHub Action surface). The Action has
 * already verified by execution in the user's runner, so it submits the full
 * pre-computed Verdict + provenance — the web layer stores it as-is rather than
 * re-running statically (which would discard the real cmd/out evidence). The id
 * and created_at are assigned server-side.
 */
export const IngestRequest = Verdict.extend({
  // http(s)-only: `z.string().url()` alone still accepts `javascript:` (it's a
  // valid URL), which would smuggle an XSS href onto the public receipt page
  // (the value is rendered as an <a href>). Restrict the scheme explicitly.
  pr_url: z
    .string()
    .url()
    .refine((u) => /^https?:\/\//i.test(u), "pr_url must be an http(s) URL.")
    .optional(),
  repo: z.string().max(140).optional(),
  pr: PrMeta.optional(),
  diff: DiffSummary.optional(),
  env: z.string().max(200).optional(),
  requested_by: z.string().max(200).optional(),
}).refine((r) => r.criteria.length <= 200, {
  message: "Too many criteria in one receipt (max 200).",
});
export type IngestRequest = z.infer<typeof IngestRequest>;
