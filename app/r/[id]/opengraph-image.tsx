import { ImageResponse } from "next/og";
import { getReceipt } from "@/lib/store";
import { getSampleReceipt } from "@/lib/sample-receipts";

export const runtime = "nodejs";
export const alt = "Codeceipt verification receipt";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COLOR = {
  VERIFIED: "#4ade80",
  FAILED: "#f87171",
  PARTIAL: "#fbbf24",
} as const;

/** Dynamic OG share image for /r/<id> — the verdict, repo, and claim ratio. */
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const receipt = (await getReceipt(id)) ?? getSampleReceipt(id);
  const label = receipt?.label ?? "PARTIAL";
  const color = COLOR[label];
  const repo = receipt?.repo ?? "Pasted diff";
  const ratio = receipt ? `${receipt.claims_met}/${receipt.claims_total} criteria reproduced` : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#08090a",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#9ca0a8", fontSize: 30 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(74,222,128,0.12)", border: "2px solid rgba(74,222,128,0.45)" }} />
          <span style={{ color: "#ededed", fontWeight: 600 }}>Codeceipt</span>
          <span>verification receipt</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ fontSize: 96, fontWeight: 700, color, letterSpacing: "-3px" }}>{label}</div>
          </div>
          <div style={{ fontSize: 40, color: "#ededed" }}>{repo}</div>
          {ratio && <div style={{ fontSize: 30, color: "#9ca0a8" }}>{ratio}</div>}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7078", fontSize: 26 }}>
          <span>Verified by execution — not self-report.</span>
          {receipt?.fingerprint && <span>{receipt.fingerprint}</span>}
        </div>
      </div>
    ),
    size,
  );
}
