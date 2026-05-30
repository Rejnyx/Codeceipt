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

export const CriterionStatus = z.enum(["pass", "fail", "warn"]);
export type CriterionStatus = z.infer<typeof CriterionStatus>;

export const CriterionResult = z.object({
  kind: CriterionKind,
  label: z.string(),
  status: CriterionStatus,
  detail: z.string(),
});
export type CriterionResult = z.infer<typeof CriterionResult>;

/**
 * Engine output contract: `diff in -> Verdict out`. This schema is the single
 * source of truth shared by the engine, the web app, and the CLI/Action.
 */
export const Verdict = z.object({
  verdict: CriterionStatus,
  criteria: z.array(CriterionResult),
  cost_usd: z.number(),
  duration_ms: z.number(),
  engine_version: z.string(),
});
export type Verdict = z.infer<typeof Verdict>;

export const ENGINE_VERSION = "0.1.0";
