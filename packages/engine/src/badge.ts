import type { Verdict, VerdictLabel } from "./types";

/**
 * Pure, dependency-free SVG badge generator (shields.io style). Lives in the
 * engine so it's testable in isolation; the web route just sets the right
 * headers around it. Deterministic — same label always yields the same SVG.
 */

const COLOR: Record<VerdictLabel, string> = {
  VERIFIED: "#4ade80",
  FAILED: "#f87171",
  PARTIAL: "#fbbf24",
};

const RIGHT_TEXT: Record<VerdictLabel, string> = {
  VERIFIED: "verified",
  FAILED: "failed",
  PARTIAL: "partial",
};

const LEFT_TEXT = "codeceipt";
const LEFT_BG = "#24262b";

// Approximate Verdana advance width at 11px — good enough for shields-style
// padding without measuring fonts. (shields.io uses the same heuristic.)
function textWidth(s: string): number {
  let w = 0;
  for (const ch of s) {
    if (/[ilIjt.,:;'!|]/.test(ch)) w += 3.5;
    else if (/[mwMW]/.test(ch)) w += 9;
    else if (/[A-Z]/.test(ch)) w += 7.5;
    else w += 6.2;
  }
  return Math.ceil(w);
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Build an SVG badge for a verdict label. */
export function badgeSvg(label: VerdictLabel): string {
  const right = RIGHT_TEXT[label];
  const rightBg = COLOR[label];
  const pad = 12;
  const lw = textWidth(LEFT_TEXT) + pad * 2;
  const rw = textWidth(right) + pad * 2;
  const w = lw + rw;
  const h = 20;
  // Dark text on the bright right side reads better than white for these hues.
  const rightFg = label === "VERIFIED" || label === "PARTIAL" ? "#06230f" : "#3b0a0a";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" role="img" aria-label="${LEFT_TEXT}: ${right}">
  <title>${LEFT_TEXT}: ${right}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".10"/>
    <stop offset="1" stop-opacity=".10"/>
  </linearGradient>
  <clipPath id="r"><rect width="${w}" height="${h}" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${lw}" height="${h}" fill="${LEFT_BG}"/>
    <rect x="${lw}" width="${rw}" height="${h}" fill="${rightBg}"/>
    <rect width="${w}" height="${h}" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${lw / 2}" y="14" fill="#cfd3d8">${escapeXml(LEFT_TEXT)}</text>
    <text x="${lw + rw / 2}" y="14" fill="${rightFg}">${escapeXml(right)}</text>
  </g>
</svg>`;
}

/** Convenience: badge straight from a verdict. */
export function badgeForVerdict(v: Pick<Verdict, "label">): string {
  return badgeSvg(v.label);
}
