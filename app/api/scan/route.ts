import { NextResponse } from "next/server";
import { ScanRequest, type Receipt } from "@/lib/types";
import { runEngine } from "@/lib/engine";
import { saveReceipt } from "@/lib/store";
import { fetchPrDiff, parsePrUrl } from "@/lib/github";

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
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not load the diff." },
      { status: 422 },
    );
  }

  const verdict = await runEngine(diff);

  const receipt: Receipt = {
    ...verdict,
    id: shortId(),
    pr_url: prUrl,
    repo: repo ?? (prUrl ? parsePrUrl(prUrl)?.repo ?? null : null),
    created_at: new Date().toISOString(),
  };

  await saveReceipt(receipt);

  return NextResponse.json({ id: receipt.id }, { status: 201 });
}
