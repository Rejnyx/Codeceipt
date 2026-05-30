import { verifyDiff, mockVerdict, type Verdict } from "@codeceipt/engine";

/**
 * Web → engine boundary. The app only calls runEngine(); it never reaches into
 * the engine's internals. The engine lives in this repo at packages/engine.
 *
 * CODECEIPT_ENGINE_MODE = "static" (default) | "mock".
 *   static — real diff-based verification via @codeceipt/engine.
 *   mock   — deterministic offline verdict for a no-network demo.
 */
export async function runEngine(diff: string): Promise<Verdict> {
  const mode = process.env.CODECEIPT_ENGINE_MODE ?? "static";
  if (mode === "mock") return mockVerdict(diff);
  return verifyDiff(diff);
}
