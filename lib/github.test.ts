import { describe, it, expect } from "vitest";
import { parsePrUrl, fetchPrDiff, isProbablyBinaryPath, buildAddedFileDiff } from "./github";
import { parseDiff, verifyDiff } from "@codeceipt/engine";

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

describe("isProbablyBinaryPath (repo-scan asset filter)", () => {
  it("flags binary/asset extensions", () => {
    for (const p of ["logo.png", "Inter.woff2", "video.MP4", "archive.tar.gz", "app.wasm"]) {
      expect(isProbablyBinaryPath(p)).toBe(true);
    }
  });

  it("flags minified bundles and source maps", () => {
    expect(isProbablyBinaryPath("vendor.min.js")).toBe(true);
    expect(isProbablyBinaryPath("styles.min.css")).toBe(true);
    expect(isProbablyBinaryPath("bundle.js.map")).toBe(true);
  });

  it("keeps real text files (incl. extensionless and svg)", () => {
    for (const p of ["src/index.ts", "README.md", "config.json", "Dockerfile", "icon.svg"]) {
      expect(isProbablyBinaryPath(p)).toBe(false);
    }
  });
});

describe("buildAddedFileDiff (whole-repo synthetic diff)", () => {
  it("round-trips through the engine's diff parser as a new file", () => {
    const d = buildAddedFileDiff("src/a.ts", "const x = 1;\nexport {};\n");
    const files = parseDiff(d);
    expect(files).toHaveLength(1);
    expect(files[0].path).toBe("src/a.ts");
    expect(files[0].isNew).toBe(true);
    expect(files[0].added).toEqual(["const x = 1;", "export {};"]);
  });

  it("preserves content lines that begin with + or -", () => {
    const files = parseDiff(buildAddedFileDiff("x.c", "+a\n-b\n  c"));
    expect(files[0].added).toEqual(["+a", "-b", "  c"]);
  });

  it("concatenates into a multi-file diff", () => {
    const diff = buildAddedFileDiff("a.txt", "one") + buildAddedFileDiff("b.txt", "two");
    const files = parseDiff(diff);
    expect(files.map((f) => f.path)).toEqual(["a.txt", "b.txt"]);
  });

  it("emits only a header for an empty file (no phantom line)", () => {
    const files = parseDiff(buildAddedFileDiff("empty.txt", ""));
    expect(files[0]?.added ?? []).toEqual([]);
  });
});

describe("whole-repo scan → engine verdict", () => {
  it("FAILS when any file in the synthesized tree carries a secret", async () => {
    const diff = buildAddedFileDiff("config/prod.env", "AWS_KEY=AKIAIOSFODNN7EXAMPLE\n");
    const v = await verifyDiff(diff);
    expect(v.verdict).toBe("fail");
    expect(v.label).toBe("FAILED");
  });

  it("PASSES on a clean synthesized tree", async () => {
    const diff = buildAddedFileDiff("src/util.ts", "export const add = (a: number, b: number) => a + b;\n");
    const v = await verifyDiff(diff);
    expect(v.verdict).toBe("pass");
  });
});
