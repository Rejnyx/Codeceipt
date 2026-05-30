import { NextResponse } from "next/server";
import { ScanRequest, type Receipt } from "@/lib/types";
import { runEngine } from "@/lib/engine";
import { saveReceipt } from "@/lib/store";
import { fetchPrDiff } from "@/lib/github";

export const runtime = "nodejs";
export const maxDuration = 60;

function shortId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = ScanRequest.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
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
    return NextResponse.json(
      { error: "Could not load the PR diff. Check it's a public PR URL (or that access is configured)." },
      { status: 422 },
    );
  }

  const verdict = await runEngine(diff);

  const receipt: Receipt = {
    ...verdict,
    id: shortId(),
    pr_url: prUrl,
    repo,
    created_at: new Date().toISOString(),
  };

  await saveReceipt(receipt);

  return NextResponse.json({ id: receipt.id }, { status: 201 });
}
