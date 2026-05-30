import { describe, it, expect } from "vitest";
import { parseDiff } from "./diff";
import {
  noHardcodedSecrets,
  declaredFilesPresent,
  readSetCoverage,
  testsExecute,
  earsWellFormed,
} from "./criteria";

const filesOf = (diff: string) => parseDiff(diff);
const added = (line: string) => filesOf(`diff --git a/x.ts b/x.ts\n+++ b/x.ts\n+${line}\n`);

describe("noHardcodedSecrets", () => {
  it.each([
    ['const k = "sk-ABCDEFGHIJKLMNOP1234567890"', "OpenAI key"],
    ["const k = AKIAIOSFODNN7EXAMPLE", "AWS key"],
    ['key = "AIzaSyB1234567890abcdefghijklmnopqrstuv"', "Google key"],
    ["const t = ghp_0123456789012345678901234567890123456789", "GitHub token"],
    ['const p = { password: "supersecret123" }', "assigned secret literal"],
  ])("fails on %s", (line) => {
    expect(noHardcodedSecrets(added(line)).status).toBe("fail");
  });

  it("passes clean code", () => {
    expect(noHardcodedSecrets(added("const sum = a + b")).status).toBe("pass");
  });

  it("ignores secrets in REMOVED lines (only scans added)", () => {
    const d = `diff --git a/x.ts b/x.ts\n--- a/x.ts\n+++ b/x.ts\n@@ -1 +1 @@\n-const k = "sk-ABCDEFGHIJKLMNOP1234567890"\n+const k = process.env.KEY\n`;
    expect(noHardcodedSecrets(parseDiff(d)).status).toBe("pass");
  });
});

describe("readSetCoverage", () => {
  it("passes and counts when files are touched", () => {
    const r = readSetCoverage(added("x"));
    expect(r.status).toBe("pass");
    expect(r.detail).toContain("1 file");
  });
  it("warns on an empty diff", () => {
    expect(readSetCoverage([]).status).toBe("warn");
  });
});

describe("declaredFilesPresent (static mode)", () => {
  it("passes when files are declared, without touching disk", async () => {
    const r = await declaredFilesPresent(added("x"), {});
    expect(r.status).toBe("pass");
    expect(r.detail).toMatch(/static mode/i);
  });
  it("warns when nothing is declared", async () => {
    const r = await declaredFilesPresent([], {});
    expect(r.status).toBe("warn");
  });
});

describe("testsExecute (static mode)", () => {
  it("warns because tests cannot run from a diff alone", async () => {
    const r = await testsExecute(added("x"), {});
    expect(r.status).toBe("warn");
    expect(r.kind).toBe("shell");
  });
});

describe("earsWellFormed", () => {
  it("returns null when no criteria spec is given", () => {
    expect(earsWellFormed({})).toBeNull();
  });
  it("passes well-formed EARS lines", () => {
    const r = earsWellFormed({ criteriaSpec: "When the user submits, the system shall save." });
    expect(r?.status).toBe("pass");
  });
  it("warns on malformed criteria", () => {
    const r = earsWellFormed({ criteriaSpec: "make it good" });
    expect(r?.status).toBe("warn");
  });
});
