import type { Verdict, CriterionResult } from "./types";

/**
 * Turn a FAILED verdict into a copy-paste prompt the user feeds back to their
 * AI agent to fix the work. The fail path stops being a dead-end "red" and
 * becomes actionable: the receipt already knows exactly which declared claims
 * didn't reproduce and why (cmd → out), so we hand that back as instructions.
 *
 * Deterministic + offline — this is just structured text, no model call.
 * Returns null when there's nothing actionable (the gate passed, or only
 * advisory/skipped issues remain).
 */

function isActionable(c: CriterionResult): boolean {
  // A blocking fail is the gate-breaker; a non-blocking fail/warn is still worth
  // surfacing as a "you also claimed this and it didn't hold" note.
  return c.status === "fail";
}

function bullet(c: CriterionResult): string {
  const what = c.label;
  const why = c.out ? `${c.detail} (got: ${c.out})` : c.detail;
  const how = c.cmd ? ` — reproduce with: \`${c.cmd}\`` : "";
  const tag = c.blocking ? "BLOCKING" : "advisory";
  return `- [${tag}] ${what}: ${why}${how}`;
}

export interface FixPromptOptions {
  /** Repo / PR identifier to anchor the prompt (optional). */
  subject?: string;
}

/**
 * Build the remediation prompt, or null if the verdict isn't a fixable fail.
 */
export function buildFixPrompt(verdict: Verdict, opts: FixPromptOptions = {}): string | null {
  const failed = verdict.criteria.filter(isActionable);
  if (verdict.verdict !== "fail" && failed.length === 0) return null;
  if (failed.length === 0) return null;

  const subject = opts.subject ? ` for ${opts.subject}` : "";
  const lines: string[] = [];
  lines.push(
    `The pull request${subject} was verified by execution and did NOT pass. ${failed.length} declared criterion/criteria could not be reproduced. Fix the code so every item below holds, then re-run the checks. Do not change the criteria — change the code to satisfy them.`,
  );
  lines.push("");
  lines.push("Criteria that failed:");
  for (const c of failed) lines.push(bullet(c));
  lines.push("");
  lines.push(
    "For each item: make the minimal change that makes the stated check pass, then confirm by running the listed command. Report what you changed per item.",
  );
  return lines.join("\n");
}
