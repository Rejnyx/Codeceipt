import { parseDiff, addedLineCount } from "./diff.js";
import {
  type CriteriaContext,
  noHardcodedSecrets,
  declaredFilesPresent,
  readSetCoverage,
  testsExecute,
  earsWellFormed,
} from "./criteria.js";
import { ENGINE_VERSION, type CriterionResult, type CriterionStatus, type Verdict } from "./types.js";

export * from "./types.js";
export { parseDiff } from "./diff.js";

export interface VerifyOptions extends CriteriaContext {}

function rollUp(criteria: CriterionResult[]): CriterionStatus {
  if (criteria.some((c) => c.status === "fail")) return "fail";
  if (criteria.some((c) => c.status === "warn")) return "warn";
  return "pass";
}

/**
 * Verify a unified diff. In static (paste) mode runs diff-only criteria; with a
 * `workingDir` it additionally runs executable criteria (tests, on-disk files).
 */
const MAX_DIFF_BYTES = 2_000_000;

export async function verifyDiff(diff: string, opts: VerifyOptions = {}): Promise<Verdict> {
  const startedAt = performance.now();

  if (diff.length > MAX_DIFF_BYTES) {
    return {
      verdict: "warn",
      criteria: [
        {
          kind: "file_predicate",
          label: "Diff size within limits",
          status: "warn",
          detail: `Diff is ${Math.round(diff.length / 1024)}KB, over the ${Math.round(
            MAX_DIFF_BYTES / 1024,
          )}KB limit — skipped to avoid resource exhaustion. Split the PR or run via the Action.`,
        },
      ],
      cost_usd: 0,
      duration_ms: Math.round(performance.now() - startedAt),
      engine_version: ENGINE_VERSION,
    };
  }

  const files = parseDiff(diff);

  const criteria: CriterionResult[] = [
    noHardcodedSecrets(files),
    await declaredFilesPresent(files, opts),
    readSetCoverage(files),
    await testsExecute(files, opts),
  ];
  const ears = earsWellFormed(opts);
  if (ears) criteria.push(ears);

  return {
    verdict: rollUp(criteria),
    criteria,
    cost_usd: 0,
    duration_ms: Math.round(performance.now() - startedAt),
    engine_version: ENGINE_VERSION,
  };
}

/**
 * Deterministic offline demo verdict — same diff always yields the same result.
 * Use only when network/working-tree are unavailable (e.g. a flaky stage demo).
 */
export function mockVerdict(diff: string): Verdict {
  const files = parseDiff(diff);
  // Mirror verifyDiff's static criterion set (no fabricated llm_judge), reuse the
  // real deterministic checks, and share rollUp so demo and real can't diverge.
  const criteria: CriterionResult[] = [
    noHardcodedSecrets(files),
    {
      kind: "file_predicate",
      label: "Declared files are present",
      status: files.length ? "pass" : "warn",
      detail: `${files.length} file(s) declared in the diff (demo).`,
    },
    readSetCoverage(files),
    {
      kind: "shell",
      label: "Test suite exits clean",
      status: "pass",
      detail: "npm test exited 0 (demo).",
    },
  ];
  return {
    verdict: rollUp(criteria),
    criteria,
    cost_usd: 0.0012,
    duration_ms: 1850 + (addedLineCount(files) % 50) * 37,
    engine_version: `${ENGINE_VERSION}-mock`,
  };
}
