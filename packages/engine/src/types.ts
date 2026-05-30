import { z } from "zod";

/** The six criterion kinds the verifier can check. */
export const CriterionKind = z.enum([
  "shell",
  "file_predicate",
  "regex",
  "read_set",
  "llm_judge",
  "ears",
]);
export type CriterionKind = z.infer<typeof CriterionKind>;

/** Per-criterion outcome. `skipped` = could not be evaluated in this mode. */
export const CriterionStatus = z.enum(["pass", "fail", "warn", "skipped"]);
export type CriterionStatus = z.infer<typeof CriterionStatus>;

export const CriterionResult = z.object({
  kind: CriterionKind,
  /** A blocking criterion's failure fails the whole gate; advisory ones don't. */
  blocking: z.boolean(),
  label: z.string(),
  status: CriterionStatus,
  detail: z.string(),
  /** One-line, human-readable account of what was checked / found. */
  evidence: z.string().optional(),
  /** The exact command executed to verify this criterion (working-tree mode). */
  cmd: z.string().optional(),
  /** That command's result line (e.g. "14 passed (14)"). */
  out: z.string().optional(),
});
export type CriterionResult = z.infer<typeof CriterionResult>;

/** The gate is binary: a PR either passes or it's blocked. */
export const Overall = z.enum(["pass", "fail"]);
export type Overall = z.infer<typeof Overall>;

/**
 * Client-facing verdict label, DERIVED from the binary gate + skipped checks:
 *   FAILED   — a blocking criterion failed (the gate is `fail`)
 *   PARTIAL  — the gate passed but a check couldn't be executed here (skipped)
 *   VERIFIED — the gate passed and every criterion was actually evaluated
 */
export const VerdictLabel = z.enum(["VERIFIED", "FAILED", "PARTIAL"]);
export type VerdictLabel = z.infer<typeof VerdictLabel>;

/** One row of the transparent compute-cost ledger. */
export const CostLine = z.object({
  label: z.string(),
  detail: z.string(),
  usd: z.number(),
});
export type CostLine = z.infer<typeof CostLine>;

/**
 * Engine output contract: `diff in -> Verdict out`. Single source of truth
 * shared by the engine, the web app, the CLI and the GitHub Action.
 */
export const Verdict = z.object({
  /** The binary gate — driven only by blocking criteria. */
  verdict: Overall,
  /** Client-facing label, derived from `verdict` + skipped checks. */
  label: VerdictLabel,
  /** Criteria reproduced (status === "pass"). */
  claims_met: z.number(),
  /** Total declared / checked criteria. */
  claims_total: z.number(),
  criteria: z.array(CriterionResult),
  /** Deterministic fingerprint — re-running the same verification reproduces it. */
  fingerprint: z.string(),
  cost_usd: z.number(),
  /** Optional transparent cost breakdown for the receipt ledger. */
  cost_breakdown: z.array(CostLine).optional(),
  /** Optional LLM token count (present only when llm_judge ran). */
  tokens: z.number().optional(),
  duration_ms: z.number(),
  engine_version: z.string(),
});
export type Verdict = z.infer<typeof Verdict>;

/** A single rendered line of the executed diff (for the receipt sample). */
export const DiffLine = z.object({
  t: z.enum(["meta", "ctx", "add", "del"]),
  s: z.string(),
});
export type DiffLine = z.infer<typeof DiffLine>;

/** Summary of the diff that was verified — files, +/- counts, a sample hunk. */
export const DiffSummary = z.object({
  files: z.number(),
  additions: z.number(),
  deletions: z.number(),
  sample: z.array(DiffLine),
});
export type DiffSummary = z.infer<typeof DiffSummary>;

export const ENGINE_VERSION = "0.2.0";
