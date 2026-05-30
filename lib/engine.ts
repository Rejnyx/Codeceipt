import { spawn } from "node:child_process";
import { Verdict, type CriterionResult, type CriterionStatus } from "./types";

const ENGINE_VERSION = "0.3.0";

/**
 * Engine boundary. The web app only ever calls runEngine() — it never knows
 * whether the verdict came from a mock or the real codeceipt-engine CLI.
 *
 * Switch with CODECEIPT_ENGINE_MODE = "mock" (default) | "cli".
 * When "cli", CODECEIPT_ENGINE_BIN must point at the extracted cortex-x binary.
 */
export async function runEngine(diff: string): Promise<Verdict> {
  const mode = process.env.CODECEIPT_ENGINE_MODE ?? "mock";
  if (mode === "cli") return runCli(diff);
  return mockVerdict(diff);
}

/** Spawn the real engine: `codeceipt-engine --diff-stdin` -> JSON verdict on stdout. */
async function runCli(diff: string): Promise<Verdict> {
  const bin = process.env.CODECEIPT_ENGINE_BIN;
  if (!bin) throw new Error("CODECEIPT_ENGINE_BIN not set while CODECEIPT_ENGINE_MODE=cli");

  const stdout = await new Promise<string>((resolve, reject) => {
    const child = spawn(bin, ["--diff-stdin"], { stdio: ["pipe", "pipe", "inherit"] });
    let out = "";
    child.stdout.on("data", (c) => (out += c.toString()));
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolve(out) : reject(new Error(`engine exited ${code}`)),
    );
    child.stdin.write(diff);
    child.stdin.end();
  });

  return Verdict.parse(JSON.parse(stdout));
}

/**
 * Deterministic mock — same diff always yields the same verdict, so the demo is
 * stable. Wired to look real: paste a clean diff -> pass; a diff with a leaked
 * secret or no test changes -> fail/warn.
 */
function mockVerdict(diff: string): Verdict {
  const touchesTests = /(\.test\.|\.spec\.|__tests__|\btest\/)/i.test(diff);
  const hasSecret = /(sk-[a-z0-9]{16,}|api[_-]?key\s*[:=]|AKIA[0-9A-Z]{16})/i.test(diff);
  const declaresFiles = /^\+\+\+ /m.test(diff);
  const addedLines = (diff.match(/^\+(?!\+\+)/gm) ?? []).length;

  const criteria: CriterionResult[] = [
    {
      kind: "shell",
      label: "Test suite exits clean",
      status: touchesTests ? "pass" : "warn",
      detail: touchesTests
        ? "npm test exited 0 against the changed files."
        : "No test files touched by this diff — coverage of the change is unproven.",
    },
    {
      kind: "file_predicate",
      label: "Declared files exist with expected content",
      status: declaresFiles ? "pass" : "warn",
      detail: declaresFiles
        ? "All files named in the diff header are present."
        : "Could not resolve declared file set from the diff.",
    },
    {
      kind: "regex",
      label: "No hardcoded secrets",
      status: hasSecret ? "fail" : "pass",
      detail: hasSecret
        ? "Matched a secret-shaped token in an added line."
        : "No secret-shaped tokens in added lines.",
    },
    {
      kind: "read_set",
      label: "Agent read the files it modified",
      status: "pass",
      detail: `Read-set covers ${addedLines} added line(s) across the touched files.`,
    },
    {
      kind: "llm_judge",
      label: "Change matches declared intent",
      status: "pass",
      detail: "A second model confirmed the diff implements the stated change.",
    },
  ];

  const verdict: CriterionStatus = criteria.some((c) => c.status === "fail")
    ? "fail"
    : criteria.some((c) => c.status === "warn")
      ? "warn"
      : "pass";

  return {
    verdict,
    criteria,
    cost_usd: 0.0012,
    duration_ms: 1850 + (addedLines % 50) * 37,
    engine_version: `${ENGINE_VERSION}-mock`,
  };
}
