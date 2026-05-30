import { summarizeDiff } from "@codeceipt/engine";
import { ScanRequest, type Receipt } from "./types";
import { runEngine } from "./engine";
import { saveReceipt } from "./store";
import { resolveTarget, parsePrUrl, parseRepoUrl } from "./github";

export type ScanResult =
  | { ok: true; id: string }
  | { ok: false; status: number; error: string };

function shortId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

/**
 * Core scan flow, decoupled from the HTTP layer so it is unit-testable:
 * validate → resolve diff (PR URL, repo URL, or pasted) → run engine → store.
 */
export async function runScan(body: unknown): Promise<ScanResult> {
  const parsed = ScanRequest.safeParse(body);
  if (!parsed.success) {
    return { ok: false, status: 400, error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  // Pasted diff path — no network, verify as-is.
  if (parsed.data.diff && !parsed.data.pr_url) {
    const diff = parsed.data.diff;
    const verdict = await runEngine(diff);
    const receipt: Receipt = {
      ...verdict,
      id: shortId(),
      pr_url: null,
      repo: null,
      created_at: new Date().toISOString(),
      diff: summarizeDiff(diff),
      env: "static · pasted diff",
    };
    await saveReceipt(receipt);
    return { ok: true, id: receipt.id };
  }

  const url = parsed.data.pr_url!;

  // Reject anything that's neither a PR nor a repo URL with a clear message,
  // BEFORE any network call (and before the generic catch below).
  if (!parsePrUrl(url) && !parseRepoUrl(url)) {
    return {
      ok: false,
      status: 400,
      error:
        "That doesn't look like a GitHub PR or repo URL. Use …/owner/repo/pull/42 for a PR, or …/owner/repo to scan a repository.",
    };
  }

  try {
    const target = await resolveTarget(url);
    const verdict = await runEngine(target.diff, { spec: target.spec });
    const receipt: Receipt = {
      ...verdict,
      id: shortId(),
      pr_url: target.url,
      repo: target.repo,
      created_at: new Date().toISOString(),
      diff: summarizeDiff(target.diff),
      env: target.env,
      pr: {
        platform: "GitHub",
        repo: target.repo,
        number: target.prNumber,
      },
    };
    await saveReceipt(receipt);
    return { ok: true, id: receipt.id };
  } catch (err) {
    // Surface the engine/GitHub message (it's already user-safe — host-validated,
    // no token probing) so "repo not found" vs "too large" is distinguishable.
    console.error("[codeceipt] scan failed:", err);
    const msg = err instanceof Error ? err.message : "Could not load the target from GitHub.";
    return { ok: false, status: 422, error: msg };
  }
}
