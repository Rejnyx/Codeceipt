import { NextResponse } from "next/server";
import { getReceipt } from "@/lib/store";
import { getSampleReceipt } from "@/lib/sample-receipts";

export const runtime = "nodejs";

/** GET /r/<id>/data.json — the machine-readable receipt (the verifiable artifact). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const receipt = (await getReceipt(id)) ?? getSampleReceipt(id);
  if (!receipt) {
    return NextResponse.json({ error: "Receipt not found." }, { status: 404 });
  }
  return NextResponse.json(receipt, {
    headers: { "Cache-Control": "public, max-age=60, s-maxage=60" },
  });
}
