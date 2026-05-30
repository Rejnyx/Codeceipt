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
});
export type CriterionResult = z.infer<typeof CriterionResult>;

/** The gate is binary: a PR either passes or it's blocked. */
export const Overall = z.enum(["pass", "fail"]);
export type Overall = z.infer<typeof Overall>;

/**
 * Engine output contract: `diff in -> Verdict out`. Single source of truth
 * shared by the engine, the web app, and the CLI/Action.
 */
export const Verdict = z.object({
  verdict: Overall,
  criteria: z.array(CriterionResult),
  cost_usd: z.number(),
  duration_ms: z.number(),
  engine_version: z.string(),
});
export type Verdict = z.infer<typeof Verdict>;

export const ENGINE_VERSION = "0.1.0";
