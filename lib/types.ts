import { z } from "zod";
import { Verdict } from "@codeceipt/engine";

// Engine domain types are the SSOT in @codeceipt/engine. Re-export the ones the
// web uses so app code can keep importing from "@/lib/types".
export {
  CriterionKind,
  CriterionStatus,
  CriterionResult,
  Verdict,
} from "@codeceipt/engine";

/** A stored, shareable Receipt = an engine Verdict plus its provenance. */
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
    diff: z.string().min(1).max(2_000_000).optional(),
  })
  .refine((v) => v.pr_url || v.diff, {
    message: "Provide either pr_url or diff.",
  });
export type ScanRequest = z.infer<typeof ScanRequest>;
