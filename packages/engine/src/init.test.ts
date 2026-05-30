import { describe, it, expect } from "vitest";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { planInit, renderWorkflow, renderSpec, runInit } from "./init";

function scratch(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "cc-init-"));
  for (const [rel, content] of Object.entries(files)) {
    writeFileSync(join(dir, rel), content, "utf8");
  }
  return dir;
}

describe("codeceipt init — detection", () => {
  it("detects npm + test script + lockfile", () => {
    const dir = scratch({
      "package.json": JSON.stringify({ name: "x", scripts: { test: "vitest run" } }),
      "package-lock.json": "{}",
    });
    const plan = planInit(dir);
    expect(plan.pm).toBe("npm");
    expect(plan.testCommand).toBe("npm test");
    expect(plan.install).toBe("npm ci");
    expect(plan.needsPnpmSetup).toBe(false);
  });

  it("detects pnpm and adds pnpm/action-setup", () => {
    const dir = scratch({
      "package.json": JSON.stringify({ name: "x", scripts: { test: "vitest run" } }),
      "pnpm-lock.yaml": "lockfileVersion: 9",
    });
    const plan = planInit(dir);
    expect(plan.pm).toBe("pnpm");
    expect(plan.testCommand).toBe("pnpm test");
    expect(plan.install).toBe("pnpm install --frozen-lockfile");
    expect(plan.needsPnpmSetup).toBe(true);
  });

  it("treats npm's no-test placeholder as no test command", () => {
    const dir = scratch({
      "package.json": JSON.stringify({
        name: "x",
        scripts: { test: 'echo "Error: no test specified" && exit 1' },
      }),
    });
    expect(planInit(dir).testCommand).toBeNull();
  });

  it("no lockfile → no install step", () => {
    const dir = scratch({ "package.json": JSON.stringify({ name: "x" }) });
    expect(planInit(dir).install).toBeNull();
  });
});

describe("codeceipt init — rendered files", () => {
  it("workflow pins the Action, gates on blocking, and runs the install step", () => {
    const wf = renderWorkflow({ pm: "npm", install: "npm ci", needsPnpmSetup: false });
    expect(wf).toContain("uses: Rejnyx/Codeceipt@v1");
    expect(wf).toContain("on:\n  pull_request:");
    expect(wf).toContain("fetch-depth: 0");
    expect(wf).toContain("- run: npm ci");
    expect(wf).toContain('fail-on-block: "true"');
    expect(wf).not.toContain("pnpm/action-setup");
  });

  it("pnpm workflow includes pnpm/action-setup", () => {
    const wf = renderWorkflow({ pm: "pnpm", install: "pnpm install --frozen-lockfile", needsPnpmSetup: true });
    expect(wf).toContain("uses: pnpm/action-setup@v4");
    expect(wf).toContain("- run: pnpm install --frozen-lockfile");
  });

  it("spec always ships a blocking secret check", () => {
    const spec = renderSpec({ testCommand: null });
    expect(spec).toContain("id: no-secrets");
    expect(spec).toContain("kind: regex");
    expect(spec).toContain("blocking: true");
  });

  it("spec wires the real test command as a blocking shell criterion", () => {
    const spec = renderSpec({ testCommand: "pnpm test" });
    expect(spec).toContain("kind: shell");
    expect(spec).toContain('command: "pnpm test"');
    expect(spec).toContain("expect: exit_zero");
  });

  it("spec leaves a commented placeholder when no test command", () => {
    const spec = renderSpec({ testCommand: null });
    expect(spec).toContain("# No test script detected");
    expect(spec).not.toMatch(/^\s*command:/m);
  });
});

describe("codeceipt init — writing", () => {
  it("--dry-run writes nothing", () => {
    const dir = scratch({ "package.json": JSON.stringify({ name: "x" }) });
    const res = runInit(dir, { dryRun: true });
    expect(res.files.every((f) => f.status.startsWith("would"))).toBe(true);
    expect(existsSync(join(dir, "codeceipt.yml"))).toBe(false);
    expect(existsSync(join(dir, ".github/workflows/codeceipt.yml"))).toBe(false);
  });

  it("writes both files and skips an existing one", () => {
    const dir = scratch({
      "package.json": JSON.stringify({ name: "x", scripts: { test: "vitest run" } }),
      "codeceipt.yml": "version: 1\ncriteria: []\n",
    });
    const res = runInit(dir);
    const byPath = Object.fromEntries(res.files.map((f) => [f.path, f.status]));
    expect(byPath["codeceipt.yml"]).toBe("skipped (exists)");
    expect(byPath[".github/workflows/codeceipt.yml"]).toBe("written");
    expect(existsSync(join(dir, ".github/workflows/codeceipt.yml"))).toBe(true);
    // existing spec is left untouched
    expect(readFileSync(join(dir, "codeceipt.yml"), "utf8")).toContain("criteria: []");
  });

  it("--force overwrites an existing file", () => {
    const dir = scratch({
      "package.json": JSON.stringify({ name: "x" }),
      "codeceipt.yml": "old",
    });
    const res = runInit(dir, { force: true });
    expect(res.files.find((f) => f.path === "codeceipt.yml")?.status).toBe("written");
    expect(readFileSync(join(dir, "codeceipt.yml"), "utf8")).toContain("id: no-secrets");
  });
});
