import { parseDiff, addedLineCount } from "./diff";
import {
  type CriteriaContext,
  noHardcodedSecrets,
  declaredFilesPresent,
  readSetCoverage,
  testsExecute,
  earsWellFormed,
} from "./criteria";
import {
  type Spec,
  parseSpec,
  extractSpecBlock,
  verifyDeclared,
} from "./spec";
import {
  ENGINE_VERSION,
  type CostLine,
  type CriterionResult,
  type DiffSummary,
  type Verdict,
  type VerdictLabel,
} from "./types";

export * from "./types";
export { parseDiff } from "./diff";
export {
  type Spec,
  type DeclaredCriterion,
  parseSpec,
  extractSpecBlock,
} from "./spec";
export { renderMarkdown, type RenderOptions } from "./render";
export { badgeSvg, badgeForVerdict } from "./badge";
export { buildFixPrompt, type FixPromptOptions } from "./remediation";
export {
  runAction,
  loadSpecFile,
  type ActionOptions,
  type ActionResult,
} from "./action";

export interface VerifyOptions extends CriteriaContext {
  /**
   * Declared acceptance criteria. Either a parsed Spec, or raw YAML/JSON text
   * (e.g. the contents of codeceipt.yml or a ```codeceipt PR-body block). When
   * present, the engine verifies the DECLARED criteria (the spec-verifier path)
   * plus the always-on secret safety net. When absent, it falls back to the
   * heuristic baseline (files/read-set/tests/ears).
   */
  spec?: Spec | string;
  /** A PR body to scan for a ```codeceipt block when `spec` isn't given. */
  prBody?: string;
}

const MAX_DIFF_BYTES = 2_000_000;

/** A gate: FAIL only when a blocking check fails; advisory/skipped never block. */
function rollUp(criteria: CriterionResult[]): "pass" | "fail" {
  return criteria.some((c) => c.blocking && c.status === "fail") ? "fail" : "pass";
}

/** FNV-1a (32-bit) — small, dependency-free, stable across runtimes. */
function fnv1a(str: string, seed = 0x811c9dc5): number {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * Deterministic fingerprint of a verification: the same criteria always yield
 * the same value. This is the re-verify trust primitive — anyone can re-run and
 * confirm the fingerprint matches. Excludes timing/cost (those vary per run).
 */
function fingerprintOf(verdict: string, criteria: CriterionResult[]): string {
  // Include `blocking` — it's the field that decides the gate, so two runs that
  // differ only in blocking (e.g. a criterion that's advisory in static mode
  // but blocking on-disk) must NOT share a fingerprint.
  const canon =
    verdict +
    "|" +
    criteria.map((c) => `${c.kind}:${c.blocking ? "B" : "A"}:${c.status}:${c.detail}`).join("|");
  const a = fnv1a(canon).toString(16).padStart(8, "0");
  const b = fnv1a(canon, 0x9e3779b1).toString(16).padStart(8, "0");
  return `cc1:${a}${b}`;
}

/** Derive the client-facing label from the binary gate + skipped checks. */
function labelOf(verdict: "pass" | "fail", criteria: CriterionResult[]): VerdictLabel {
  if (verdict === "fail") return "FAILED";
  if (criteria.some((c) => c.status === "skipped")) return "PARTIAL";
  return "VERIFIED";
}

interface FinalizeMeta {
  cost_usd: number;
  duration_ms: number;
  engine_version?: string;
  cost_breakdown?: CostLine[];
  tokens?: number;
}

/** Assemble a full Verdict from criteria — the single place gate/label/claims/fingerprint are computed. */
function finalize(criteria: CriterionResult[], meta: FinalizeMeta): Verdict {
  const verdict = rollUp(criteria);
  return {
    verdict,
    label: labelOf(verdict, criteria),
    claims_met: criteria.filter((c) => c.status === "pass").length,
    // Exclude skipped (not-run-here) checks from the denominator so a clean
    // result reads "3/3", not a misleading "3/4". Skipped checks render as
    // their own rows but don't depress the reproduced ratio.
    claims_total: criteria.filter((c) => c.status !== "skipped").length,
    criteria,
    fingerprint: fingerprintOf(verdict, criteria),
    cost_usd: meta.cost_usd,
    cost_breakdown: meta.cost_breakdown,
    tokens: meta.tokens,
    duration_ms: meta.duration_ms,
    engine_version: meta.engine_version ?? ENGINE_VERSION,
  };
}

/**
 * Summarize a unified diff for the receipt — file count, +/- totals, and a
 * representative sample hunk. Reuses the same parser the verifier runs on.
 */
export function summarizeDiff(diff: string, maxSample = 16): DiffSummary {
  const files = parseDiff(diff);
  const additions = files.reduce((n, f) => n + f.added.length, 0);
  const deletions = files.reduce((n, f) => n + f.removed.length, 0);
  const sample: DiffSummary["sample"] = [];
  for (const f of files) {
    if (sample.length >= maxSample) break;
    sample.push({ t: "meta", s: f.path });
    for (const a of f.added) {
      if (sample.length >= maxSample) break;
      sample.push({ t: "add", s: a });
    }
    for (const d of f.removed) {
      if (sample.length >= maxSample) break;
      sample.push({ t: "del", s: d });
    }
  }
  return { files: files.length, additions, deletions, sample };
}

/**
 * Verify a unified diff. In static (paste) mode runs diff-only criteria; with a
 * `workingDir` it additionally runs executable criteria (tests, on-disk files).
 */
export async function verifyDiff(diff: string, opts: VerifyOptions = {}): Promise<Verdict> {
  const startedAt = performance.now();

  if (diff.length > MAX_DIFF_BYTES) {
    return finalize(
      [
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
      { cost_usd: 0, duration_ms: Math.round(performance.now() - startedAt) },
    );
  }

  const files = parseDiff(diff);

  // Resolve a declared spec: explicit opts.spec wins, else a ```codeceipt block
  // in the PR body. A spec switches the engine into the spec-verifier path.
  const spec = resolveSpec(opts);

  let criteria: CriterionResult[];
  if (spec && spec.criteria.length) {
    // Spec-verifier path: the secret check is always-on (safety net), then each
    // declared criterion is verified independently with its own evidence.
    criteria = [noHardcodedSecrets(files)];
    for (const c of spec.criteria) {
      criteria.push(await verifyDeclared(c, files, opts));
    }
  } else {
    // Heuristic baseline (no declared criteria): infer what we can from a diff.
    criteria = [
      noHardcodedSecrets(files),
      await declaredFilesPresent(files, opts),
      readSetCoverage(files),
      await testsExecute(files, opts),
    ];
    const ears = earsWellFormed(opts);
    if (ears) criteria.push(ears);
  }

  return finalize(criteria, {
    cost_usd: 0,
    duration_ms: Math.round(performance.now() - startedAt),
  });
}

/** Resolve declared criteria from opts.spec (Spec|string) or a PR-body block. */
function resolveSpec(opts: VerifyOptions): Spec | null {
  if (opts.spec) {
    return typeof opts.spec === "string" ? parseSpec(opts.spec) : opts.spec;
  }
  if (opts.prBody) {
    const block = extractSpecBlock(opts.prBody);
    if (block) return parseSpec(block);
  }
  return null;
}

/**
 * Deterministic offline demo verdict — same diff always yields the same result.
 * Use only when network/working-tree are unavailable (e.g. a flaky stage demo).
 */
export function mockVerdict(diff: string): Verdict {
  const files = parseDiff(diff);
  // Mirrors verifyDiff's static criterion SET + roll-up, but the detail strings
  // are demo copy, so a mock fingerprint is NOT byte-identical to a real static
  // one — that's intentional and flagged by the `-mock` engine_version suffix.
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
  return finalize(criteria, {
    cost_usd: 0.0012,
    duration_ms: 1850 + (addedLineCount(files) % 50) * 37,
    engine_version: `${ENGINE_VERSION}-mock`,
  });
}
