import { z } from "zod";
import { parse as parseYaml } from "yaml";
import type { CriteriaContext } from "./criteria";
import type { CriterionResult } from "./types";
import type { DiffFile } from "./diff";

/**
 * A single declared acceptance criterion. The PR author (or agent) declares
 * "these must hold for this change to count as done"; the verifier checks each
 * one independently and reports per-criterion evidence. Exactly one of the kind
 * keys (shell/file/regex/read/judge/ears) is expected per entry.
 */
export const DeclaredCriterion = z
  .object({
    /** shell: a command that must exit 0 (typically the test suite). */
    shell: z.string().optional(),
    /** file_predicate: a path that must exist (+ optional `contains`). */
    file: z.string().optional(),
    /** Substring/snippet that must appear in `file` (pairs with `file`). */
    contains: z.string().optional(),
    /** regex: a pattern that must be present (optionally scoped to `in`). */
    regex: z.string().optional(),
    /** Path scope for `regex` (only added lines of this file are searched). */
    in: z.string().optional(),
    /** read_set: file(s) the change must actually touch. */
    read: z.union([z.string(), z.array(z.string())]).optional(),
    /** llm_judge: a natural-language claim a model rules yes/no on. */
    judge: z.string().optional(),
    /** ears: a requirement that must be well-formed ("When … shall …"). */
    ears: z.string().optional(),
    /** Human label override (otherwise derived from the kind). */
    label: z.string().optional(),
    /** Override blocking. Defaults per-kind (see KIND_DEFAULT_BLOCKING). */
    blocking: z.boolean().optional(),
  })
  .strict();
export type DeclaredCriterion = z.infer<typeof DeclaredCriterion>;

export const Spec = z.object({
  criteria: z.array(DeclaredCriterion).default([]),
});
export type Spec = z.infer<typeof Spec>;

const FENCE = /```codeceipt\s*\n([\s\S]*?)```/i;

/**
 * Extract a declared spec from free text (a PR body). Looks for a fenced
 * ```codeceipt … ``` block containing YAML or JSON. Returns null if absent.
 */
export function extractSpecBlock(prBody: string): string | null {
  const m = FENCE.exec(prBody);
  return m ? m[1].trim() : null;
}

/**
 * Parse a spec from YAML or JSON text. Tolerant: returns null on empty/invalid
 * input (the caller falls back to heuristic verification). Throws only never —
 * a malformed spec is surfaced as a verification criterion, not a crash.
 */
export function parseSpec(text: string): Spec | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  let raw: unknown;
  try {
    raw = parseYaml(trimmed); // YAML is a JSON superset, so this covers both.
  } catch {
    return null;
  }
  const parsed = Spec.safeParse(raw);
  if (!parsed.success) return null;
  return parsed.data;
}

/** Which kind a declared entry expresses (first key wins, checked in order). */
export function kindOf(c: DeclaredCriterion):
  | "shell"
  | "file_predicate"
  | "regex"
  | "read_set"
  | "llm_judge"
  | "ears"
  | null {
  if (c.shell !== undefined) return "shell";
  if (c.file !== undefined) return "file_predicate";
  if (c.regex !== undefined) return "regex";
  if (c.read !== undefined) return "read_set";
  if (c.judge !== undefined) return "llm_judge";
  if (c.ears !== undefined) return "ears";
  return null;
}

const KIND_KEYS = ["shell", "file", "regex", "read", "judge", "ears"] as const;

/** All kind-bearing keys actually set on an entry (to detect ambiguity). */
export function presentKinds(c: DeclaredCriterion): string[] {
  const rec = c as Record<string, unknown>;
  return KIND_KEYS.filter((k) => rec[k] !== undefined);
}

const KIND_DEFAULT_BLOCKING: Record<string, boolean> = {
  shell: true, // proven by execution — the hard signal
  file_predicate: true,
  regex: true,
  read_set: false, // advisory: coverage, not correctness
  llm_judge: false, // one juror, never gate on AI alone (positioning)
  ears: false, // structural quality, advisory
};

function added(files: DiffFile[]): string[] {
  return files.flatMap((f) => f.added);
}

/** Normalize a path for comparison: backslashes→/, strip leading ./, lowercase. */
function normPath(p: string): string {
  return p.replace(/\\/g, "/").replace(/^\.?\//, "").toLowerCase();
}

/**
 * Resolve a declared path to the diff files it refers to. Exact (normalized)
 * match wins. Only when the declared path has NO directory part do we fall back
 * to a basename suffix match — so `read: "src/a.ts"` never matches `lib/a.ts`,
 * while a bare `read: "a.ts"` can still match `src/a.ts`. Case-insensitive so
 * authors on macOS/Windows aren't false-failed by casing.
 */
function matchFiles(files: DiffFile[], path: string): DiffFile[] {
  const norm = normPath(path);
  const exact = files.filter((f) => normPath(f.path) === norm);
  if (exact.length) return exact;
  if (!norm.includes("/")) {
    return files.filter((f) => normPath(f.path).endsWith("/" + norm));
  }
  return [];
}

function addedIn(files: DiffFile[], path: string): string[] {
  return matchFiles(files, path).flatMap((f) => f.added);
}
function touches(files: DiffFile[], path: string): boolean {
  return matchFiles(files, path).length > 0;
}

const EARS_RE = /\b(when|while|where|if)\b.+\b(the\s+\w+\s+)?shall\b/i;

/**
 * Verify one declared criterion against the diff (and, with a working tree,
 * the on-disk checkout). Returns a CriterionResult carrying evidence/cmd/out.
 * Async because shell/judge may execute.
 */
export async function verifyDeclared(
  c: DeclaredCriterion,
  files: DiffFile[],
  ctx: CriteriaContext,
): Promise<CriterionResult> {
  const present = presentKinds(c);

  // No kind → can't verify anything. Surface it, never silently pass.
  if (present.length === 0) {
    return {
      kind: "ears",
      blocking: false,
      label: c.label ?? "Malformed criterion",
      status: "warn",
      detail:
        "This declared criterion names no known kind (shell/file/regex/read/judge/ears).",
    };
  }

  // Multiple kinds on one entry → only one would run; that silently drops the
  // others. For a verifier, a dropped declared claim is the worst failure mode
  // — warn instead, and tell the author to split the entry.
  if (present.length > 1) {
    return {
      kind: kindOf(c) ?? "ears",
      blocking: false,
      label: c.label ?? "Ambiguous criterion",
      status: "warn",
      detail: `Declares multiple kinds (${present.join(", ")}). Split into separate criteria — only one check runs per entry, so the rest would be skipped.`,
    };
  }

  const kind = kindOf(c)!;

  // `contains` is only meaningful with a `file:` criterion. If it's paired with
  // anything else it would be silently ignored — warn instead of dropping it.
  if (c.contains !== undefined && kind !== "file_predicate") {
    return {
      kind,
      blocking: false,
      label: c.label ?? "Misplaced `contains`",
      status: "warn",
      detail: "`contains` only applies to a `file:` criterion; it was ignored here.",
    };
  }

  const blocking = c.blocking ?? KIND_DEFAULT_BLOCKING[kind];

  switch (kind) {
    case "shell":
      return verifyShell(c, ctx, blocking);
    case "file_predicate":
      return verifyFile(c, files, ctx, blocking);
    case "regex":
      return verifyRegex(c, files, blocking);
    case "read_set":
      return verifyRead(c, files, blocking);
    case "ears":
      return verifyEars(c, blocking);
    case "llm_judge":
      return verifyJudge(c, files, ctx, blocking);
  }
}

async function verifyShell(
  c: DeclaredCriterion,
  ctx: CriteriaContext,
  blocking: boolean,
): Promise<CriterionResult> {
  const cmd = c.shell!;
  const label = c.label ?? `\`${cmd}\` exits clean`;

  // Static (paste) mode can't execute. Honest: report skipped, non-blocking.
  if (!ctx.workingDir || !ctx.allowExec) {
    return {
      kind: "shell",
      blocking: false,
      label,
      status: "skipped",
      cmd,
      detail:
        "Commands can't run from a diff alone — enable the GitHub Action (checked-out repo) for a real pass/fail.",
      evidence: "Not executed in static mode.",
    };
  }

  const { spawn } = await import("node:child_process");
  const { scrubEnv } = await import("./criteria");
  const start = Date.now();
  const code = await new Promise<number>((resolve) => {
    // shell:true is acceptable here — the command comes from the repo's own
    // codeceipt.yml and runs in the user's own runner (the Action surface).
    // Secrets are scrubbed from the child env; hard timeout caps runaway runs.
    const child = spawn(cmd, {
      cwd: ctx.workingDir,
      shell: true,
      stdio: "ignore",
      env: scrubEnv(process.env) as NodeJS.ProcessEnv,
      timeout: 180_000,
      killSignal: "SIGKILL",
    });
    child.on("error", () => resolve(127));
    child.on("close", (x) => resolve(x ?? 1));
  });
  const secs = ((Date.now() - start) / 1000).toFixed(1);

  return {
    kind: "shell",
    blocking,
    label,
    status: code === 0 ? "pass" : "fail",
    cmd,
    out: code === 0 ? `exit 0 · ${secs}s` : `exit ${code} · ${secs}s`,
    detail:
      code === 0
        ? `Command exited 0 in the checked-out tree (${secs}s).`
        : `Command exited ${code} — the claim is not reproduced.`,
    evidence: `Ran \`${cmd}\` in an isolated checkout.`,
  };
}

async function verifyFile(
  c: DeclaredCriterion,
  files: DiffFile[],
  ctx: CriteriaContext,
  blocking: boolean,
): Promise<CriterionResult> {
  const path = c.file!;
  const label = c.label ?? `File present: ${path}`;

  if (ctx.workingDir) {
    const { existsSync, readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const abs = join(ctx.workingDir, path);
    const exists = existsSync(abs);
    if (!exists) {
      return {
        kind: "file_predicate",
        blocking,
        label,
        status: "fail",
        cmd: `test -f ${path}`,
        out: "missing",
        detail: `Declared file is missing on disk: ${path}`,
        evidence: "Checked the on-disk checkout.",
      };
    }
    if (c.contains) {
      const body = readFileSync(abs, "utf8");
      const ok = body.includes(c.contains);
      return {
        kind: "file_predicate",
        blocking,
        label,
        status: ok ? "pass" : "fail",
        cmd: `grep -F ${JSON.stringify(c.contains)} ${path}`,
        out: ok ? "match" : "no match",
        detail: ok
          ? `${path} exists and contains the declared snippet.`
          : `${path} exists but does not contain: ${c.contains}`,
        evidence: "Read the file from the on-disk checkout.",
      };
    }
    return {
      kind: "file_predicate",
      blocking,
      label,
      status: "pass",
      cmd: `test -f ${path}`,
      out: "exists",
      detail: `${path} exists on disk.`,
      evidence: "Checked the on-disk checkout.",
    };
  }

  // Static mode: we can only assert the diff touches the file (+ contains in
  // added lines). On-disk existence is non-blocking here (proven by the Action).
  const touched = touches(files, path);
  if (c.contains) {
    const hit = addedIn(files, path).some((l) => l.includes(c.contains!));
    return {
      kind: "file_predicate",
      blocking: false,
      label,
      status: hit ? "pass" : touched ? "warn" : "warn",
      detail: hit
        ? `Added lines in ${path} contain the declared snippet (static mode; full file checked by the Action).`
        : `Could not confirm the snippet in ${path}'s added lines from the diff. The Action checks the full file.`,
      evidence: "Scanned the diff's added lines (static mode).",
    };
  }
  return {
    kind: "file_predicate",
    blocking: false,
    label,
    status: touched ? "pass" : "warn",
    detail: touched
      ? `${path} is present in the change (static mode; on-disk existence checked by the Action).`
      : `${path} is not touched by this diff. On-disk existence is checked by the Action.`,
    evidence: "Scanned the diff (static mode).",
  };
}

function verifyRegex(
  c: DeclaredCriterion,
  files: DiffFile[],
  blocking: boolean,
): CriterionResult {
  const re = compile(c.regex!);
  const label = c.label ?? `Pattern present: /${c.regex}/`;
  if (!re) {
    return {
      kind: "regex",
      blocking: false,
      label,
      status: "warn",
      detail: `Declared regex is invalid or too long to evaluate safely: ${c.regex}`,
    };
  }

  // Scoped to a file that isn't in this change → we CAN'T evaluate the claim.
  // Reporting a blocking "fail" here would FAIL a correct PR because of the
  // author's scope path, which is the worst outcome for a trust product. Warn.
  if (c.in && !touches(files, c.in)) {
    return {
      kind: "regex",
      blocking: false,
      label,
      status: "warn",
      detail: `Scope file ${c.in} is not part of this change — the pattern can't be evaluated here.`,
      evidence: "Declared scope not present in the diff.",
    };
  }

  const scope = c.in ? addedIn(files, c.in) : added(files);
  const matches = scope.filter((l) => safeTest(re, l)).length;
  return {
    kind: "regex",
    blocking,
    label,
    status: matches ? "pass" : "fail",
    cmd: c.in ? `grep -E ${JSON.stringify(c.regex)} ${c.in}` : `grep -E ${JSON.stringify(c.regex)}`,
    out: `${matches} match${matches === 1 ? "" : "es"}`,
    detail: matches
      ? `Pattern found in ${matches} added line(s)${c.in ? ` of ${c.in}` : ""}.`
      : `Pattern not found in added lines${c.in ? ` of ${c.in}` : ""}.`,
    evidence: "Scanned the diff's added lines.",
  };
}

function verifyRead(
  c: DeclaredCriterion,
  files: DiffFile[],
  blocking: boolean,
): CriterionResult {
  const want = (Array.isArray(c.read) ? c.read : [c.read!]).filter(
    (p) => typeof p === "string" && p.trim(),
  );
  if (!want.length) {
    return {
      kind: "read_set",
      blocking: false,
      label: c.label ?? "Declared read-set",
      status: "warn",
      detail: "No files declared in the read-set — nothing to check.",
    };
  }
  const present = want.filter((p) => touches(files, p));
  const missing = want.filter((p) => !touches(files, p));
  const ok = missing.length === 0;
  return {
    kind: "read_set",
    blocking,
    label: c.label ?? `Change touches its declared files (${want.length})`,
    status: ok ? "pass" : "warn",
    detail: ok
      ? `All ${want.length} declared file(s) appear in the change.`
      : `Missing from the change: ${missing.slice(0, 4).join(", ")}${missing.length > 4 ? "…" : ""}`,
    evidence: `${present.length}/${want.length} declared files are present in the diff.`,
  };
}

function verifyEars(c: DeclaredCriterion, blocking: boolean): CriterionResult {
  const text = c.ears!;
  const ok = EARS_RE.test(text);
  return {
    kind: "ears",
    blocking,
    label: c.label ?? "Requirement is well-formed (EARS)",
    status: ok ? "pass" : "warn",
    detail: ok
      ? "Requirement follows the EARS form (When/While/If … shall …)."
      : `Not in EARS form: "${text.slice(0, 80)}${text.length > 80 ? "…" : ""}"`,
    evidence: "Structural check of the requirement text.",
  };
}

async function verifyJudge(
  c: DeclaredCriterion,
  files: DiffFile[],
  ctx: CriteriaContext,
  blocking: boolean,
): Promise<CriterionResult> {
  const { judgeClaim } = await import("./judge");
  return judgeClaim(c.judge!, files, ctx, { blocking, label: c.label });
}

const MAX_REGEX_PATTERN = 300;
const MAX_REGEX_LINE = 2000;

/**
 * Compile an author-supplied pattern. Rejects over-long patterns (a crude but
 * effective first guard against pathological regexes). NOTE: JS has no regex
 * timeout, so a catastrophic-backtracking pattern could still be slow on a long
 * line — `safeTest` caps line length to bound that. On the Action surface the
 * pattern comes from the repo's own codeceipt.yml (first-party); before wiring
 * PR-body specs into the public web path, switch to a linear-time engine (re2).
 */
function compile(pattern: string): RegExp | null {
  if (pattern.length > MAX_REGEX_PATTERN) return null;
  try {
    return new RegExp(pattern);
  } catch {
    return null;
  }
}

/** Test a line with a length cap so a pathological pattern can't run unbounded. */
function safeTest(re: RegExp, line: string): boolean {
  return re.test(line.length > MAX_REGEX_LINE ? line.slice(0, MAX_REGEX_LINE) : line);
}
