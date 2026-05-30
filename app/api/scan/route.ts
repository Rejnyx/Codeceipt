import { NextResponse } from "next/server";
import { runScan } from "@/lib/scan";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  // Anonymous endpoint — rate-limit per IP so a public scanner can't be abused
  // to hammer GitHub or flood storage. 20 scans / 5 min.
  const rl = await rateLimit(`scan:${clientIp(req)}`, 20, 300);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many scans. Try again in a minute." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = await runScan(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ id: result.id }, { status: 201 });
}
