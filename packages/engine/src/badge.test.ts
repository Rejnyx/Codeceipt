import { describe, it, expect } from "vitest";
import { badgeSvg, badgeForVerdict } from "./badge";

describe("badgeSvg", () => {
  it("is a well-formed SVG with the codeceipt label", () => {
    const svg = badgeSvg("VERIFIED");
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain("</svg>");
    expect(svg).toContain("codeceipt");
    expect(svg).toContain("verified");
  });

  it("uses the verdict color per label", () => {
    expect(badgeSvg("VERIFIED")).toContain("#4ade80");
    expect(badgeSvg("FAILED")).toContain("#f87171");
    expect(badgeSvg("PARTIAL")).toContain("#fbbf24");
  });

  it("renders the right-side word per label", () => {
    expect(badgeSvg("FAILED")).toContain(">failed<");
    expect(badgeSvg("PARTIAL")).toContain(">partial<");
  });

  it("is deterministic", () => {
    expect(badgeSvg("VERIFIED")).toBe(badgeSvg("VERIFIED"));
  });

  it("badgeForVerdict reads the label off a verdict", () => {
    expect(badgeForVerdict({ label: "FAILED" })).toContain(">failed<");
  });

  it("escapes nothing unsafe (static text only) but stays valid xml", () => {
    const svg = badgeSvg("VERIFIED");
    expect(svg).not.toContain("&&");
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });
});
