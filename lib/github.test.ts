import { describe, it, expect } from "vitest";
import { parsePrUrl, fetchPrDiff } from "./github";

describe("parsePrUrl (security-critical URL validation)", () => {
  it("parses a valid github.com PR URL", () => {
    expect(parsePrUrl("https://github.com/vercel/next.js/pull/42")).toEqual({
      owner: "vercel",
      repo: "next.js",
      number: 42,
    });
  });

  it("allows www.github.com", () => {
    expect(parsePrUrl("https://www.github.com/o/r/pull/1")?.owner).toBe("o");
  });

  it("allows a trailing slash", () => {
    expect(parsePrUrl("https://github.com/o/r/pull/7/")?.number).toBe(7);
  });

  it("rejects non-https", () => {
    expect(parsePrUrl("http://github.com/o/r/pull/1")).toBeNull();
  });

  it("rejects a non-github host even if the path contains github.com", () => {
    expect(parsePrUrl("https://attacker.example/github.com/o/r/pull/1")).toBeNull();
  });

  it("rejects the userinfo-@-host trick", () => {
    // hostname here is attacker.example, not github.com
    expect(parsePrUrl("https://github.com@attacker.example/o/r/pull/1")).toBeNull();
  });

  it("rejects path-traversal segments", () => {
    expect(parsePrUrl("https://github.com/../../etc/pull/1")).toBeNull();
  });

  it("rejects a malformed path", () => {
    expect(parsePrUrl("https://github.com/o/r/issues/1")).toBeNull();
    expect(parsePrUrl("not a url")).toBeNull();
  });
});

describe("fetchPrDiff", () => {
  it("throws on an invalid PR URL before any network call", async () => {
    await expect(fetchPrDiff("https://example.com/nope")).rejects.toThrow(
      /valid GitHub pull request/i,
    );
  });
});
