import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { Lead, saveLead } from "@/lib/leads";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limited = await rateLimit(`lead:${ip}`, 10, 300);
  if (!limited.ok) {
    return NextResponse.json(
      { error: `Příliš mnoho pokusů. Zkus to za ${limited.retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = Lead.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Neplatný kontakt." },
      { status: 400 },
    );
  }

  try {
    const lead = await saveLead(parsed.data);
    // Structured trace so leads are visible in the deploy logs even before a
    // dashboard exists; the full record is in KV.
    console.log(
      `[codeceipt] lead ${lead.id}: ${lead.email} · ${lead.verdict ?? "?"} · ${lead.repo ?? "n/a"} · ${lead.receipt_id ?? "n/a"}`,
    );
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[codeceipt] lead save failed:", err);
    return NextResponse.json({ error: "Nepodařilo se uložit kontakt." }, { status: 500 });
  }
}
