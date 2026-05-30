import { summarizeDiff } from "@codeceipt/engine";
import { ScanRequest, type Receipt } from "./types";
import { runEngine } from "./engine";
import { saveReceipt } from "./store";
import { fetchPrDiff } from "./github";

export type ScanResult =
  | { ok: true; id: string }
  | { ok: false; status: number; error: string };

function shortId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

/**
 * Core scan flow, decoupled from the HTTP layer so it is unit-testable:
 * validate → resolve diff (PR URL or pasted) → run engine → store → return id.
 */
export async function runScan(body: unknown): Promise<ScanResult> {
  const parsed = ScanRequest.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      error: parsed.error.issues[0]?.message ?? "Invalid request.",
    };
  }

  let diff: string;
  let repo: string | null = null;
  let prUrl: string | null = null;

  try {
    if (parsed.data.pr_url) {
      prUrl = parsed.data.pr_url;
      const fetched = await fetchPrDiff(prUrl);
      diff = fetched.diff;
      repo = fetched.repo;
    } else {
      diff = parsed.data.diff!;
    }
  } catch (err) {
    // Log the real error server-side only; return a generic message so the
    // server token's private-repo access can't be probed via status differences.
    console.error("[codeceipt] diff fetch failed:", err);
    return {
      ok: false,
      status: 422,
      error:
        "Could not load the PR diff. Check it's a public PR URL (or that access is configured).",
    };
  }

  const verdict = await runEngine(diff);
  const receipt: Receipt = {
    ...verdict,
    id: shortId(),
    pr_url: prUrl,
    repo,
    created_at: new Date().toISOString(),
    diff: summarizeDiff(diff),
    env: "static · paste mode (diff-only)",
    pr: repo ? { platform: "GitHub", repo } : undefined,
  };
  await saveReceipt(receipt);
  return { ok: true, id: receipt.id };
}
