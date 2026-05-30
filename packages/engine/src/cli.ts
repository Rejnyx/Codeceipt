#!/usr/bin/env node
import { verifyDiff } from "./index.js";

/**
 * codeceipt-engine — reads a unified diff on stdin, prints a JSON Verdict on stdout.
 *
 *   git diff main | codeceipt-engine
 *   codeceipt-engine --working-dir . < pr.diff
 *
 * Exit code is always 0 on a successful run; the pass/fail verdict is carried in
 * the JSON so callers parse the result rather than branching on the exit code.
 */
async function main() {
  const args = process.argv.slice(2);
  const workingDirFlag = args.indexOf("--working-dir");
  const workingDir = workingDirFlag >= 0 ? args[workingDirFlag + 1] : undefined;

  const diff = await readStdin();
  if (!diff.trim()) {
    process.stderr.write("codeceipt-engine: no diff on stdin\n");
    process.exit(2);
  }

  const verdict = await verifyDiff(diff, { workingDir });
  process.stdout.write(JSON.stringify(verdict, null, 2) + "\n");
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (c) => (data += c));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

main().catch((err) => {
  process.stderr.write(`codeceipt-engine: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
