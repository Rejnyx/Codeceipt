import { getReceipt } from "@/lib/store";
import { getSampleReceipt } from "@/lib/sample-receipts";
import { badgeSvg } from "@codeceipt/engine";

export const runtime = "nodejs";

/** GET /r/<id>/badge.svg — a live shields-style SVG badge for the verdict. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const receipt = (await getReceipt(id)) ?? getSampleReceipt(id);
  const svg = badgeSvg(receipt?.label ?? "PARTIAL");
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      // Short cache: a re-verified receipt should update the badge promptly.
      "Cache-Control": "public, max-age=60, s-maxage=60",
    },
  });
}
