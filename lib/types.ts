import { z } from "zod";

/** The six criterion kinds inherited from the cortex-x spec-verifier. */
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

/** Engine output contract: `diff in -> verdict out`. Stable across mock + real CLI. */
export const Verdict = z.object({
  verdict: CriterionStatus,
  criteria: z.array(CriterionResult),
  cost_usd: z.number(),
  duration_ms: z.number(),
  engine_version: z.string(),
});
export type Verdict = z.infer<typeof Verdict>;

/** A stored, shareable Receipt = a verdict plus its provenance. */
export const Receipt = Verdict.extend({
  id: z.string(),
  pr_url: z.string().nullable(),
  repo: z.string().nullable(),
  created_at: z.string(),
});
export type Receipt = z.infer<typeof Receipt>;

export const ScanRequest = z
  .object({
    pr_url: z.string().url().optional(),
    diff: z.string().min(1).optional(),
  })
  .refine((v) => v.pr_url || v.diff, {
    message: "Provide either pr_url or diff.",
  });
export type ScanRequest = z.infer<typeof ScanRequest>;
