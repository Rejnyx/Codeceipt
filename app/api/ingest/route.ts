import { NextRequest, NextResponse } from "next/server";
import { ingestReceipt } from "@/lib/ingest";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * POST /api/ingest — the GitHub Action submits a fully-verified Verdict + PR
 * provenance; we store it and return { id, url }. The Action already ran the
 * checks by execution, so we never re-run here.
 */
export async function POST(req: NextRequest) {
  // 60 receipts / 5 min per IP — generous for a busy CI, a brake on spam.
  const rl = await rateLimit(`ingest:${clientIp(req)}`, 60, 300);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many receipts. Slow down." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const body = await req.json().catch(() => null);
  const result = await ingestReceipt(body, req.headers.get("authorization"));
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ id: result.id, url: result.url }, { status: 201 });
}
