import { parseDiff, addedLineCount } from "./diff";
import {
  type CriteriaContext,
  noHardcodedSecrets,
  declaredFilesPresent,
  readSetCoverage,
  testsExecute,
  earsWellFormed,
} from "./criteria";
import { ENGINE_VERSION, type CriterionResult, type Verdict } from "./types";

export * from "./types";
export { parseDiff } from "./diff";

export interface VerifyOptions extends CriteriaContext {}

const MAX_DIFF_BYTES = 2_000_000;

/** A gate: FAIL only when a blocking check fails; advisory/skipped never block. */
function rollUp(criteria: CriterionResult[]): "pass" | "fail" {
  return criteria.some((c) => c.blocking && c.status === "fail") ? "fail" : "pass";
}

/**
 * Verify a unified diff. In static (paste) mode runs diff-only criteria; with a
 * `workingDir` it additionally runs executable criteria (tests, on-disk files).
 */
export async function verifyDiff(diff: string, opts: VerifyOptions = {}): Promise<Verdict> {
  const startedAt = performance.now();

  if (diff.length > MAX_DIFF_BYTES) {
    return {
      verdict: "fail",
      criteria: [
        {
          kind: "file_predicate",
          blocking: true,
          label: "Diff size within limits",
          status: "fail",
          detail: `Diff is ${Math.round(diff.length / 1024)}KB, over the ${Math.round(
            MAX_DIFF_BYTES / 1024,
          )}KB limit — refusing to bless an unscanned change. Split the PR or run via the Action.`,
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
  // Mirror verifyDiff's static criterion set + roll-up so demo and real can't diverge.
  const criteria: CriterionResult[] = [
    noHardcodedSecrets(files),
    {
      kind: "file_predicate",
      blocking: false,
      label: "Declared files are present",
      status: files.length ? "pass" : "warn",
      detail: `${files.length} file(s) declared in the diff (demo).`,
    },
    readSetCoverage(files),
    {
      kind: "shell",
      blocking: false,
      label: "Test suite exits clean",
      status: "skipped",
      detail: "Tests run via the GitHub Action (demo).",
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
