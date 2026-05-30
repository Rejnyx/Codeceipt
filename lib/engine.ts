import { verifyDiff, mockVerdict, type Verdict, type Spec } from "@codeceipt/engine";

/**
 * Web → engine boundary. The app only calls runEngine(); it never reaches into
 * the engine's internals. The engine lives in this repo at packages/engine.
 *
 * CODECEIPT_ENGINE_MODE = "static" (default) | "mock".
 *   static — real diff-based verification via @codeceipt/engine.
 *   mock   — deterministic offline verdict for a no-network demo.
 */
export interface RunEngineOptions {
  /** Declared acceptance criteria (e.g. parsed from codeceipt.yml). */
  spec?: Spec | string;
  /** PR body to scan for a ```codeceipt block when no spec is given. */
  prBody?: string;
}

export async function runEngine(diff: string, opts: RunEngineOptions = {}): Promise<Verdict> {
  const mode = process.env.CODECEIPT_ENGINE_MODE ?? "static";
  if (mode === "mock") return mockVerdict(diff);
  return verifyDiff(diff, { spec: opts.spec, prBody: opts.prBody });
}
