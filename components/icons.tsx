import type { CSSProperties, JSX } from "react";

export interface IconProps {
  s?: number;
  w?: number;
  style?: CSSProperties;
  className?: string;
}

type Icon = (p: IconProps) => JSX.Element;

const stroke = (p: IconProps, d: string, dflt = 16, w = 2): JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    width={p.s ?? dflt}
    height={p.s ?? dflt}
    fill="none"
    stroke="currentColor"
    strokeWidth={p.w ?? w}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={p.style}
    className={p.className}
    dangerouslySetInnerHTML={{ __html: d }}
  />
);

const fill = (p: IconProps, d: string, dflt = 16): JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    width={p.s ?? dflt}
    height={p.s ?? dflt}
    fill="currentColor"
    style={p.style}
    className={p.className}
    dangerouslySetInnerHTML={{ __html: d }}
  />
);

export const Ic: Record<string, Icon> = {
  check: (p) => stroke({ ...p, w: p.w ?? 2.4 }, '<path d="M4 12.5l5 5L20 6" />'),
  x: (p) => stroke({ ...p, w: p.w ?? 2.4 }, '<path d="M6 6l12 12M18 6L6 18" />'),
  minus: (p) => stroke({ ...p, w: p.w ?? 2.4 }, '<path d="M5 12h14" />'),
  arrow: (p) => stroke(p, '<path d="M5 12h14M13 6l6 6-6 6" />'),
  chevron: (p) => stroke(p, '<path d="M6 9l6 6 6-6" />'),
  arrowUpRight: (p) => stroke(p, '<path d="M7 17L17 7M8 7h9v9" />'),
  link: (p) =>
    stroke(
      p,
      '<path d="M10 13a4 4 0 0 0 5.6.4l2.7-2.7a4 4 0 0 0-5.6-5.6L11.5 6.4"/><path d="M14 11a4 4 0 0 0-5.6-.4L5.7 13.3a4 4 0 0 0 5.6 5.6L12.5 17.6"/>',
    ),
  copy: (p) =>
    stroke(p, '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>'),
  refresh: (p) => stroke(p, '<path d="M21 12a9 9 0 1 1-2.64-6.36M21 4v4h-4"/>'),
  shield: (p) => stroke(p, '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z"/>'),
  terminal: (p) =>
    stroke(p, '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M13 15h4"/>'),
  bolt: (p) => stroke(p, '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>'),
  doc: (p) =>
    stroke(p, '<path d="M14 3v5h5M7 3h8l5 5v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/>'),
  download: (p) => stroke(p, '<path d="M12 3v12M7 11l5 5 5-5M5 21h14"/>'),
  lock: (p) => stroke(p, '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'),
  clock: (p) => stroke(p, '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  fingerprint: (p) =>
    stroke(
      { ...p, w: p.w ?? 1.8 },
      '<path d="M12 4a8 8 0 0 0-8 8M20 12a8 8 0 0 0-4-6.9"/><path d="M8 12a4 4 0 0 1 8 0v2M12 12v4M16 14a8 8 0 0 1-1 4M8 14v2a6 6 0 0 0 .5 2.5"/>',
    ),
  receipt: (p) =>
    stroke(
      p,
      '<path d="M5 3v18l2-1.2L9 21l2-1.2L13 21l2-1.2L17 21l2-1.2V3l-2 1.2L15 3l-2 1.2L11 3 9 4.2 7 3 5 4.2z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    ),
  github: (p) =>
    fill(
      p,
      '<path d="M12 1.5A10.5 10.5 0 0 0 1.5 12c0 4.64 3.01 8.57 7.18 9.96.53.1.72-.23.72-.5v-1.9c-2.92.63-3.54-1.25-3.54-1.25-.48-1.22-1.17-1.54-1.17-1.54-.95-.65.07-.64.07-.64 1.06.07 1.61 1.09 1.61 1.09.94 1.6 2.46 1.14 3.06.87.1-.68.37-1.14.66-1.4-2.33-.27-4.78-1.17-4.78-5.2 0-1.15.41-2.09 1.08-2.83-.11-.27-.47-1.34.1-2.8 0 0 .88-.28 2.88 1.08a10 10 0 0 1 5.24 0c2-1.36 2.88-1.08 2.88-1.08.57 1.46.21 2.53.1 2.8.68.74 1.08 1.68 1.08 2.83 0 4.04-2.46 4.93-4.8 5.19.38.33.71.97.71 1.96v2.9c0 .28.19.61.73.5A10.5 10.5 0 0 0 22.5 12 10.5 10.5 0 0 0 12 1.5Z"/>',
      18,
    ),
  gitlab: (p) =>
    fill(
      p,
      '<path d="M12 21.6l3.3-10.1H8.7L12 21.6zM3.6 11.5L2.3 15.5c-.1.4 0 .8.3 1l9.4 5.1-8.4-9.6zm16.8 0l-8.4 9.6 9.4-5.1c.3-.2.4-.6.3-1l-1.3-4zM8.7 11.5L7 6.2c-.1-.3-.5-.3-.6 0L4.7 11.5h4zM19.3 11.5L17.6 6.2c-.1-.3-.5-.3-.6 0l-1.7 5.3h4z"/>',
      18,
    ),
  star: (p) =>
    fill(p, '<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.6L12 18.5 6.1 20.6l1.2-6.6L2.5 9.4l6.6-.9 2.9-6z"/>'),
  logo: (p) => (
    <svg
      viewBox="0 0 28 28"
      width={p.s ?? 26}
      height={p.s ?? 26}
      fill="none"
      style={p.style}
      className={p.className}
    >
      <rect
        x="2.5"
        y="2.5"
        width="23"
        height="23"
        rx="7"
        fill="#4ADE80"
        fillOpacity="0.12"
        stroke="#4ADE80"
        strokeOpacity="0.45"
      />
      <path
        d="M9 14.5l3.4 3.4L19.5 10.5"
        stroke="#4ADE80"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

export type CriterionDisplayStatus = "pass" | "fail" | "warn" | "skipped";

export function StatusIcon({ status, s = 16 }: { status: CriterionDisplayStatus; s?: number }) {
  if (status === "pass") return <Ic.check s={s} style={{ color: "var(--pass)" }} />;
  if (status === "fail") return <Ic.x s={s} style={{ color: "var(--fail)" }} />;
  return <Ic.minus s={s} style={{ color: "var(--warn)" }} />;
}

export function StarStat({ n = "2.4k" }: { n?: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        color: "var(--text-mid)",
        fontSize: 13.5,
        fontWeight: 500,
      }}
    >
      <Ic.star s={13} style={{ color: "#E3B341" }} /> {n}
    </span>
  );
}
