import type { CriterionResult } from "./types";
import { type DiffFile, addedLineCount } from "./diff";

export interface CriteriaContext {
  /** When set, shell/file_predicate run against a real checked-out tree. */
  workingDir?: string;
  /** Declared acceptance criteria text (for the EARS check). */
  criteriaSpec?: string;
  /**
   * Allow executing declared `shell` commands. Requires `workingDir`. Set by
   * the GitHub Action surface (the command runs in the user's own runner); the
   * web/static path leaves this false so commands are reported as skipped.
   */
  allowExec?: boolean;
  /** API key for the optional `llm_judge` intent check (else it's skipped). */
  llmApiKey?: string;
  /** Model id for `llm_judge` (default: gpt-4o-mini). */
  llmModel?: string;
}

const SECRET_PATTERNS: { name: string; re: RegExp }[] = [
  { name: "OpenAI-style key", re: /\bsk-[A-Za-z0-9]{16,}\b/ },
  { name: "AWS access key", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "Google API key", re: /\bAIza[0-9A-Za-z\-_]{35}\b/ },
  { name: "GitHub token", re: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/ },
  { name: "Slack token", re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  { name: "private key block", re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: "assigned secret literal", re: /\b(?:api[_-]?key|secret|password|token)\b\s*[:=]\s*["'][^"']{8,}["']/i },
];

const SENSITIVE_ENV = /(TOKEN|SECRET|KEY|PASSWORD|CREDENTIAL|KV_|GITHUB_|OPENAI|OPENROUTER|AWS_|VERCEL|STRIPE)/i;

/** Strip secret-bearing vars so an untrusted repo's test script can't read them. */
export function scrubEnv(env: NodeJS.ProcessEnv): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(env)) if (!SENSITIVE_ENV.test(k)) out[k] = v;
  return out;
}

/** regex (blocking): no secret-shaped tokens in ADDED lines. */
export function noHardcodedSecrets(files: DiffFile[]): CriterionResult {
  const hits: string[] = [];
  for (const f of files) {
    for (const line of f.added) {
      for (const { name, re } of SECRET_PATTERNS) {
        if (re.test(line)) hits.push(`${f.path}: ${name}`);
      }
    }
  }
  return {
    kind: "regex",
    blocking: true,
    label: "No hardcoded secrets in the change",
    status: hits.length ? "fail" : "pass",
    detail: hits.length
      ? `Found ${hits.length} secret-shaped token(s): ${hits.slice(0, 3).join("; ")}${hits.length > 3 ? "…" : ""}`
      : "No secret-shaped tokens in added lines.",
  };
}

/** file_predicate: declared files exist. Blocking only with a working tree. */
export async function declaredFilesPresent(
  files: DiffFile[],
  ctx: CriteriaContext,
): Promise<CriterionResult> {
  const declared = files.filter((f) => !f.isDelete && f.path);
  if (!ctx.workingDir) {
    return {
      kind: "file_predicate",
      blocking: false,
      label: "Declared files are present",
      status: declared.length ? "pass" : "warn",
      detail: declared.length
        ? `${declared.length} file(s) declared in the diff. (Static mode — on-disk existence is checked by the GitHub Action.)`
        : "No files declared in the diff.",
    };
  }
  const { existsSync } = await import("node:fs");
  const { join } = await import("node:path");
  const missing = declared.filter((f) => !existsSync(join(ctx.workingDir!, f.path)));
  return {
    kind: "file_predicate",
    blocking: true,
    label: "Declared files are present",
    status: missing.length ? "fail" : "pass",
    detail: missing.length
      ? `Missing on disk: ${missing.map((f) => f.path).slice(0, 3).join(", ")}`
      : `All ${declared.length} declared file(s) exist on disk.`,
  };
}

/** read_set (advisory): the change covers the files it touches. */
export function readSetCoverage(files: DiffFile[]): CriterionResult {
  const touched = files.length;
  const added = addedLineCount(files);
  return {
    kind: "read_set",
    blocking: false,
    label: "Change covers the files it claims to touch",
    status: touched ? "pass" : "warn",
    detail: touched
      ? `Read-set covers ${touched} file(s), ${added} added line(s).`
      : "Empty diff — nothing to cover.",
  };
}

/**
 * shell: the test suite exits clean. Blocking + real pass/fail only with a
 * working tree; in static (paste) mode it is reported as skipped (non-blocking).
 */
export async function testsExecute(
  files: DiffFile[],
  ctx: CriteriaContext,
): Promise<CriterionResult> {
  const touchesTests = files.some((f) =>
    /(\.test\.|\.spec\.|__tests__|(^|\/)tests?\/)/i.test(f.path),
  );

  if (!ctx.workingDir || !ctx.allowExec) {
    return {
      kind: "shell",
      blocking: false,
      label: "Test suite exits clean",
      status: "skipped",
      detail: touchesTests
        ? "Test files are touched, but tests can't run from a diff alone. Enable the GitHub Action (checked-out repo) for a real pass/fail."
        : "No test files touched, and tests can't run in static mode. Enable the GitHub Action for a real result.",
    };
  }

  // NOTE: a working tree may be an UNTRUSTED repo. shell:false (no shell re-parse),
  // secrets scrubbed from the child env, hard timeout. Full isolation (sandbox,
  // network egress off, read-only FS) is required before running attacker repos.
  const { spawn } = await import("node:child_process");
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const code = await new Promise<number>((resolve) => {
    const child = spawn(npmCmd, ["test", "--silent"], {
      cwd: ctx.workingDir,
      shell: false,
      stdio: "ignore",
      env: scrubEnv(process.env) as NodeJS.ProcessEnv,
      timeout: 120_000,
      killSignal: "SIGKILL",
    });
    child.on("error", () => resolve(1));
    child.on("close", (c) => resolve(c ?? 1));
  });

  return {
    kind: "shell",
    blocking: true,
    label: "Test suite exits clean",
    status: code === 0 ? "pass" : "fail",
    detail: code === 0 ? "`npm test` exited 0." : `\`npm test\` exited ${code}.`,
  };
}

const EARS_RE = /\b(when|while|where|if)\b.+\b(the\s+\w+\s+)?shall\b/i;

/** ears (advisory): declared acceptance criteria are well-formed. */
export function earsWellFormed(ctx: CriteriaContext): CriterionResult | null {
  if (!ctx.criteriaSpec) return null;
  const lines = ctx.criteriaSpec.split(/\r?\n/).filter((l) => l.trim());
  const malformed = lines.filter((l) => !EARS_RE.test(l));
  return {
    kind: "ears",
    blocking: false,
    label: "Acceptance criteria are well-formed (EARS)",
    status: malformed.length ? "warn" : "pass",
    detail: malformed.length
      ? `${malformed.length}/${lines.length} criteria are not in EARS form ("When/While/If … shall …").`
      : `All ${lines.length} criteria are well-formed.`,
  };
}
