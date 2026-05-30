import { verifyDiff } from "./index";
import { parseSpec, extractSpecBlock, type Spec } from "./spec";
import type { Verdict } from "./types";

/**
 * The GitHub Action / working-tree surface. This is where Codeceipt's central
 * claim — "verified by execution, not self-report" — becomes literally true:
 * the repo is checked out in the user's own runner, so declared `shell`
 * criteria actually run and the receipt carries real `cmd → out` evidence.
 */
export interface ActionOptions {
  /** The checked-out repository root (GITHUB_WORKSPACE). */
  workingDir: string;
  /** Pre-computed unified diff. If omitted, computed via `git diff base...head`. */
  diff?: string;
  /** Base ref/sha (the PR's merge base). */
  base?: string;
  /** Head ref/sha (the PR head). */
  head?: string;
  /** PR description — scanned for a ```codeceipt block if no spec file exists. */
  prBody?: string;
  /** Execute declared shell commands. Default true on this surface. */
  allowExec?: boolean;
  /** Optional API key for the llm_judge intent check. */
  llmApiKey?: string;
  llmModel?: string;
}

export interface ActionResult {
  verdict: Verdict;
  /** Where the declared criteria came from. */
  specSource: "file" | "pr-body" | "none";
  /** The spec file used, if any (e.g. "codeceipt.yml"). */
  specFile?: string;
  diffBytes: number;
}

const SPEC_FILES = [
  "codeceipt.yml",
  "codeceipt.yaml",
  "codeceipt.json",
  ".codeceipt.yml",
  ".github/codeceipt.yml",
];

/** Find and parse the first codeceipt spec file in the checkout, if present. */
export async function loadSpecFile(
  workingDir: string,
): Promise<{ spec: Spec; path: string } | null> {
  const { existsSync, readFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  for (const name of SPEC_FILES) {
    const p = join(workingDir, name);
    if (existsSync(p)) {
      const spec = parseSpec(readFileSync(p, "utf8"));
      if (spec) return { spec, path: name };
    }
  }
  return null;
}

async function computeDiff(workingDir: string, base?: string, head?: string): Promise<string> {
  const { spawnSync } = await import("node:child_process");
  // base...head (three-dot) = changes introduced on head since the merge base —
  // the same semantics as a GitHub PR diff. Falls back to the last commit.
  const range =
    base && head ? `${base}...${head}` : base ? `${base}...HEAD` : "HEAD~1...HEAD";
  const res = spawnSync("git", ["diff", range], {
    cwd: workingDir,
    encoding: "utf8",
    maxBuffer: 50_000_000,
  });
  if (res.status !== 0) {
    throw new Error(`git diff ${range} failed: ${(res.stderr ?? "").slice(0, 200)}`);
  }
  return res.stdout ?? "";
}

/**
 * Run a full working-tree verification: load the declared spec, resolve the
 * diff, then verify with execution enabled. Pass `opts.diff` to avoid git
 * (used in tests); otherwise the diff is computed from base/head.
 */
export async function runAction(opts: ActionOptions): Promise<ActionResult> {
  const fileSpec = await loadSpecFile(opts.workingDir);
  const diff = opts.diff ?? (await computeDiff(opts.workingDir, opts.base, opts.head));

  const verdict = await verifyDiff(diff, {
    workingDir: opts.workingDir,
    allowExec: opts.allowExec ?? true,
    llmApiKey: opts.llmApiKey,
    llmModel: opts.llmModel,
    spec: fileSpec?.spec,
    prBody: opts.prBody,
  });

  // Report "pr-body" only when a block was actually extracted (not merely when
  // the text mentions ```codeceipt), so the provenance on the receipt is honest.
  const specSource: ActionResult["specSource"] = fileSpec
    ? "file"
    : opts.prBody && extractSpecBlock(opts.prBody)
      ? "pr-body"
      : "none";

  return { verdict, specSource, specFile: fileSpec?.path, diffBytes: diff.length };
}
