import type { CriteriaContext } from "./criteria";
import type { CriterionResult } from "./types";
import type { DiffFile } from "./diff";

/**
 * llm_judge — the ONE place a model is consulted. Deterministic-first by design:
 * the engine never *requires* a model. If no API key is configured, the judge
 * is reported honestly as `skipped` (non-blocking) rather than guessed. When a
 * key is present, a single juror rules yes/no on whether the change plausibly
 * satisfies the natural-language claim. One juror, advisory by default — we do
 * not sell "an AI judging an AI"; this is a supporting check, never the gate.
 */

interface JudgeOpts {
  blocking: boolean;
  label?: string;
}

const MAX_DIFF_CHARS = 12_000;

export async function judgeClaim(
  claim: string,
  files: DiffFile[],
  ctx: CriteriaContext,
  opts: JudgeOpts,
): Promise<CriterionResult> {
  const label = opts.label ?? `Intent match: "${truncate(claim, 60)}"`;
  const apiKey = ctx.llmApiKey ?? process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      kind: "llm_judge",
      blocking: false,
      label,
      status: "skipped",
      detail:
        "No model configured — the engine is deterministic-first and won't guess. Set OPENAI_API_KEY to enable the intent check.",
      evidence: "llm_judge is opt-in; not run.",
    };
  }

  const diffText = renderDiff(files).slice(0, MAX_DIFF_CHARS);
  const model = ctx.llmModel ?? process.env.CODECEIPT_JUDGE_MODEL ?? "gpt-4o-mini";

  let result: { verdict: "yes" | "no" | "unclear"; reason: string; tokens: number };
  try {
    result = await callOpenAI(apiKey, model, claim, diffText);
  } catch (err) {
    return {
      kind: "llm_judge",
      blocking: false,
      label,
      status: "skipped",
      detail: `Intent check could not run (${err instanceof Error ? err.message : "model error"}). Deterministic checks are unaffected.`,
      evidence: "llm_judge errored; treated as non-blocking.",
    };
  }

  const status = result.verdict === "yes" ? "pass" : result.verdict === "no" ? "fail" : "warn";
  return {
    kind: "llm_judge",
    // Even when the author marks the claim blocking, an LLM "no" should not be
    // the sole gate — downgrade a judge failure to advisory unless explicitly
    // forced. Defensible positioning: machines verify, AI advises.
    blocking: opts.blocking && status !== "fail",
    label,
    status,
    out: result.verdict,
    detail: result.reason,
    evidence: `Single-juror intent check (${model}).`,
  };
}

interface OpenAIChoice {
  message?: { content?: string };
}
interface OpenAIResponse {
  choices?: OpenAIChoice[];
  usage?: { total_tokens?: number };
}

async function callOpenAI(
  apiKey: string,
  model: string,
  claim: string,
  diff: string,
): Promise<{ verdict: "yes" | "no" | "unclear"; reason: string; tokens: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              'You are a strict code-change auditor. Given a unified diff and a claim about what the change does, decide whether the diff plausibly satisfies the claim. Be conservative: answer "no" if the diff does not clearly support the claim. Respond ONLY as JSON: {"verdict":"yes|no|unclear","reason":"one sentence"}.',
          },
          { role: "user", content: `CLAIM:\n${claim}\n\nDIFF:\n${diff}` },
        ],
      }),
    });
    if (!res.ok) throw new Error(`model HTTP ${res.status}`);
    const data = (await res.json()) as OpenAIResponse;
    const content = data.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as { verdict?: string; reason?: string };
    const verdict =
      parsed.verdict === "yes" || parsed.verdict === "no" ? parsed.verdict : "unclear";
    return {
      verdict,
      reason: parsed.reason ?? "No reason provided by the juror.",
      tokens: data.usage?.total_tokens ?? 0,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function renderDiff(files: DiffFile[]): string {
  return files
    .map((f) => {
      const adds = f.added.map((l) => `+${l}`).join("\n");
      const dels = f.removed.map((l) => `-${l}`).join("\n");
      return `--- ${f.path}\n${dels}\n${adds}`;
    })
    .join("\n\n");
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}
