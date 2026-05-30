import type { CriterionResult } from "./types.js";
import { type DiffFile, addedLineCount } from "./diff.js";

export interface CriteriaContext {
  /** When set, shell/file_predicate run against a real checked-out tree. */
  workingDir?: string;
  /** Declared acceptance criteria text (for the EARS check). */
  criteriaSpec?: string;
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
function scrubEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const out: NodeJS.ProcessEnv = {};
  for (const [k, v] of Object.entries(env)) if (!SENSITIVE_ENV.test(k)) out[k] = v;
  return out;
}

/** regex: no secret-shaped tokens in ADDED lines. */
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
    label: "No hardcoded secrets in the change",
    status: hits.length ? "fail" : "pass",
    detail: hits.length
      ? `Found ${hits.length} secret-shaped token(s): ${hits.slice(0, 3).join("; ")}${hits.length > 3 ? "…" : ""}`
      : "No secret-shaped tokens in added lines.",
  };
}

/** file_predicate: declared files exist (on disk when a working tree is given). */
export async function declaredFilesPresent(
  files: DiffFile[],
  ctx: CriteriaContext,
): Promise<CriterionResult> {
  const declared = files.filter((f) => !f.isDelete && f.path);
  if (!ctx.workingDir) {
    return {
      kind: "file_predicate",
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
    label: "Declared files are present",
    status: missing.length ? "fail" : "pass",
    detail: missing.length
      ? `Missing on disk: ${missing.map((f) => f.path).slice(0, 3).join(", ")}`
      : `All ${declared.length} declared file(s) exist on disk.`,
  };
}

/** read_set: the change actually covers the files it touches. */
export function readSetCoverage(files: DiffFile[]): CriterionResult {
  const touched = files.length;
  const added = addedLineCount(files);
  return {
    kind: "read_set",
    label: "Change covers the files it claims to touch",
    status: touched ? "pass" : "warn",
    detail: touched
      ? `Read-set covers ${touched} file(s), ${added} added line(s).`
      : "Empty diff — nothing to cover.",
  };
}

/**
 * shell: the test suite exits clean. Only truly executable with a working tree;
 * in static (paste) mode we honestly report it cannot be run here.
 */
export async function testsExecute(
  files: DiffFile[],
  ctx: CriteriaContext,
): Promise<CriterionResult> {
  const touchesTests = files.some((f) =>
    /(\.test\.|\.spec\.|__tests__|(^|\/)tests?\/)/i.test(f.path),
  );

  if (!ctx.workingDir) {
    return {
      kind: "shell",
      label: "Test suite exits clean",
      status: touchesTests ? "warn" : "warn",
      detail: touchesTests
        ? "Test files are touched, but tests cannot be executed from a diff alone. Run via the GitHub Action (checked-out repo) for a real pass/fail."
        : "No test files touched, and tests cannot be executed in static mode. Run via the GitHub Action for a real result.",
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
      env: scrubEnv(process.env),
      timeout: 120_000,
      killSignal: "SIGKILL",
    });
    child.on("error", () => resolve(1));
    child.on("close", (c) => resolve(c ?? 1));
  });

  return {
    kind: "shell",
    label: "Test suite exits clean",
    status: code === 0 ? "pass" : "fail",
    detail: code === 0 ? "`npm test` exited 0." : `\`npm test\` exited ${code}.`,
  };
}

const EARS_RE =
  /\b(when|while|where|if)\b.+\b(the\s+\w+\s+)?shall\b/i;

/** ears: declared acceptance criteria are well-formed (EARS syntax). */
export function earsWellFormed(ctx: CriteriaContext): CriterionResult | null {
  if (!ctx.criteriaSpec) return null;
  const lines = ctx.criteriaSpec.split(/\r?\n/).filter((l) => l.trim());
  const malformed = lines.filter((l) => !EARS_RE.test(l));
  return {
    kind: "ears",
    label: "Acceptance criteria are well-formed (EARS)",
    status: malformed.length ? "warn" : "pass",
    detail: malformed.length
      ? `${malformed.length}/${lines.length} criteria are not in EARS form ("When/While/If … shall …").`
      : `All ${lines.length} criteria are well-formed.`,
  };
}
