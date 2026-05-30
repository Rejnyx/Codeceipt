#!/usr/bin/env node
import { appendFileSync, readFileSync } from "node:fs";
import { runAction } from "./action";
import { renderMarkdown } from "./render";

/**
 * Entry point invoked by action.yml inside a GitHub runner. Reads the PR
 * context from the standard GITHUB_* env, runs a real working-tree
 * verification, writes the job summary + outputs, and (best-effort) posts the
 * receipt to the Codeceipt API and a PR comment.
 *
 * Always exits 0 by default — the verdict is the artifact, not the exit code.
 * Set CODECEIPT_FAIL_ON_BLOCK=true to fail the check when the gate is `fail`.
 */
interface PrEvent {
  pull_request?: {
    number?: number;
    body?: string;
    base?: { sha?: string };
    head?: { sha?: string };
  };
  repository?: { full_name?: string };
}

function readEvent(): PrEvent {
  const path = process.env.GITHUB_EVENT_PATH;
  if (!path) return {};
  try {
    return JSON.parse(readFileSync(path, "utf8")) as PrEvent;
  } catch {
    return {};
  }
}

function setOutput(name: string, value: string): void {
  const out = process.env.GITHUB_OUTPUT;
  if (out) appendFileSync(out, `${name}=${value}\n`);
}

function writeSummary(md: string): void {
  const summary = process.env.GITHUB_STEP_SUMMARY;
  if (summary) appendFileSync(summary, md + "\n");
}

async function postReceipt(
  apiUrl: string,
  payload: unknown,
): Promise<string | null> {
  try {
    const res = await fetch(`${apiUrl.replace(/\/$/, "")}/api/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.CODECEIPT_INGEST_TOKEN
          ? { Authorization: `Bearer ${process.env.CODECEIPT_INGEST_TOKEN}` }
          : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { id?: string; url?: string };
    return data.url ?? (data.id ? `${apiUrl.replace(/\/$/, "")}/r/${data.id}` : null);
  } catch {
    return null;
  }
}

async function postComment(repo: string, prNumber: number, body: string): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return;
  try {
    await fetch(`https://api.github.com/repos/${repo}/issues/${prNumber}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "codeceipt-action",
      },
      body: JSON.stringify({ body }),
    });
  } catch {
    /* comment is best-effort */
  }
}

async function main(): Promise<void> {
  const workingDir = process.env.GITHUB_WORKSPACE ?? process.cwd();
  const apiUrl = process.env.CODECEIPT_API_URL ?? "https://codeceipt.dev";
  const event = readEvent();
  const pr = event.pull_request;
  const repo = event.repository?.full_name ?? process.env.GITHUB_REPOSITORY ?? "";

  const { verdict, specSource, specFile } = await runAction({
    workingDir,
    base: pr?.base?.sha,
    head: pr?.head?.sha,
    prBody: pr?.body ?? undefined,
    allowExec: true,
    llmApiKey: process.env.OPENAI_API_KEY,
  });

  const receiptUrl =
    repo && pr
      ? await postReceipt(apiUrl, {
          ...verdict,
          pr_url: `https://github.com/${repo}/pull/${pr.number}`,
          repo,
          pr: {
            platform: "GitHub",
            repo,
            number: pr.number,
            baseSha: pr.base?.sha?.slice(0, 7),
            headSha: pr.head?.sha?.slice(0, 7),
          },
          env: `${process.env.RUNNER_OS ?? "linux"} · node ${process.versions.node}`,
        })
      : null;

  const md = renderMarkdown(verdict, {
    receiptUrl: receiptUrl ?? undefined,
    repo,
    prNumber: pr?.number,
  });

  writeSummary(md);
  setOutput("verdict", verdict.verdict);
  setOutput("label", verdict.label);
  setOutput("fingerprint", verdict.fingerprint);
  if (receiptUrl) setOutput("receipt_url", receiptUrl);

  if (repo && pr?.number) await postComment(repo, pr.number, md);

  process.stdout.write(
    `Codeceipt: ${verdict.label} (${verdict.claims_met}/${verdict.claims_total}) · spec:${specSource}${specFile ? ` (${specFile})` : ""}\n`,
  );

  if (process.env.CODECEIPT_FAIL_ON_BLOCK === "true" && verdict.verdict === "fail") {
    process.exit(1);
  }
}

main().catch((err) => {
  process.stderr.write(`codeceipt-action: ${err instanceof Error ? err.message : String(err)}\n`);
  // Don't fail the user's CI on an internal error unless they opted in.
  process.exit(process.env.CODECEIPT_FAIL_ON_BLOCK === "true" ? 1 : 0);
});
