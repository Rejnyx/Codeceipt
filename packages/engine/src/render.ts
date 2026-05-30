import type { CriterionResult, Verdict } from "./types";

const GLYPH: Record<CriterionResult["status"], string> = {
  pass: "✓",
  fail: "✗",
  warn: "!",
  skipped: "⊘",
};

const LABEL_LINE: Record<Verdict["label"], string> = {
  VERIFIED: "✅ **VERIFIED** — every declared criterion passed.",
  FAILED: "❌ **FAILED** — a blocking criterion did not reproduce.",
  PARTIAL: "🟡 **PARTIAL** — passed, but a check couldn't be executed here (run the Action for a full result).",
};

export interface RenderOptions {
  receiptUrl?: string;
  repo?: string;
  prNumber?: number;
}

/** Render a Verdict as a GitHub PR-comment / step-summary markdown block. */
export function renderMarkdown(verdict: Verdict, opts: RenderOptions = {}): string {
  const lines: string[] = [];
  lines.push(`## Codeceipt — ${verdict.label}`);
  lines.push("");
  lines.push(LABEL_LINE[verdict.label]);
  lines.push("");
  lines.push(
    `> ${verdict.claims_met}/${verdict.claims_total} criteria reproduced · \`${verdict.fingerprint}\` · ${(verdict.duration_ms / 1000).toFixed(1)}s`,
  );
  lines.push("");
  lines.push("| | Criterion | Kind | Result |");
  lines.push("|---|---|---|---|");
  for (const c of verdict.criteria) {
    const result = c.out ?? statusWord(c.status);
    const tag = c.blocking ? "" : " _(advisory)_";
    lines.push(
      `| ${GLYPH[c.status]} | ${escapePipes(c.label)}${tag} | \`${c.kind}\` | ${escapePipes(result)} |`,
    );
  }
  lines.push("");
  if (opts.receiptUrl) {
    lines.push(`**Public receipt:** ${opts.receiptUrl}`);
    lines.push("");
  }
  lines.push(
    `<sub>Verified by execution — not the agent's self-report. Engine ${verdict.engine_version} · Apache-2.0</sub>`,
  );
  return lines.join("\n");
}

function statusWord(s: CriterionResult["status"]): string {
  return s === "pass"
    ? "reproduced"
    : s === "fail"
      ? "not reproduced"
      : s === "skipped"
        ? "not run here"
        : "advisory";
}

function escapePipes(s: string): string {
  return s.replace(/\|/g, "\\|").replace(/\n/g, " ");
}
