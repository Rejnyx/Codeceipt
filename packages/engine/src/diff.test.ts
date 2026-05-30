import { describe, it, expect } from "vitest";
import { parseDiff, addedLineCount } from "./diff";

describe("parseDiff", () => {
  it("returns [] for an empty diff", () => {
    expect(parseDiff("")).toEqual([]);
  });

  it("parses a new file (/dev/null source)", () => {
    const d = `diff --git a/x.ts b/x.ts\nnew file mode 100644\n--- /dev/null\n+++ b/x.ts\n@@ -0,0 +1 @@\n+export const a = 1\n`;
    const files = parseDiff(d);
    expect(files).toHaveLength(1);
    expect(files[0].path).toBe("x.ts");
    expect(files[0].isNew).toBe(true);
    expect(files[0].added).toEqual(["export const a = 1"]);
  });

  it("counts added and removed content lines on a modify", () => {
    const d = `diff --git a/x.ts b/x.ts\n--- a/x.ts\n+++ b/x.ts\n@@ -1,2 +1,2 @@\n-const old = 1\n+const next = 2\n unchanged\n`;
    const [f] = parseDiff(d);
    expect(f.added).toEqual(["const next = 2"]);
    expect(f.removed).toEqual(["const old = 1"]);
  });

  it("keeps content lines whose body starts with ++ or --", () => {
    const d = `diff --git a/x.ts b/x.ts\n--- a/x.ts\n+++ b/x.ts\n@@ -1 +1 @@\n---count;\n+++i;\n`;
    const [f] = parseDiff(d);
    expect(f.added).toEqual(["++i;"]);
    expect(f.removed).toEqual(["--count;"]);
  });

  it("keeps a rename-only file (path seeded from the diff --git header)", () => {
    const d = `diff --git a/old.ts b/new.ts\nsimilarity index 100%\nrename from old.ts\nrename to new.ts\n`;
    const files = parseDiff(d);
    expect(files).toHaveLength(1);
    expect(files[0].path).toBe("new.ts");
  });

  it("marks binary files and does not count content", () => {
    const d = `diff --git a/img.png b/img.png\nnew file mode 100644\nBinary files /dev/null and b/img.png differ\n`;
    const [f] = parseDiff(d);
    expect(f.isBinary).toBe(true);
    expect(f.added).toEqual([]);
  });

  it("handles CRLF line endings", () => {
    const d = `diff --git a/x.ts b/x.ts\r\n--- a/x.ts\r\n+++ b/x.ts\r\n@@ -1 +1 @@\r\n+added\r\n`;
    const [f] = parseDiff(d);
    expect(f.added).toEqual(["added"]);
  });

  it("separates multiple files", () => {
    const d = `diff --git a/a.ts b/a.ts\n--- a/a.ts\n+++ b/a.ts\n@@ -1 +1 @@\n+a\ndiff --git a/b.ts b/b.ts\n--- a/b.ts\n+++ b/b.ts\n@@ -1 +1 @@\n+b\n`;
    const files = parseDiff(d);
    expect(files.map((f) => f.path)).toEqual(["a.ts", "b.ts"]);
  });

  it("addedLineCount sums across files", () => {
    const d = `diff --git a/a.ts b/a.ts\n+++ b/a.ts\n+1\n+2\ndiff --git a/b.ts b/b.ts\n+++ b/b.ts\n+3\n`;
    expect(addedLineCount(parseDiff(d))).toBe(3);
  });
});
