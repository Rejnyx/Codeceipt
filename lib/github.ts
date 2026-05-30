import { Readable } from "node:stream";
import { createGunzip } from "node:zlib";
import { extract as tarExtract } from "tar-stream";

const ALLOWED_HOSTS = new Set(["github.com", "www.github.com"]);
const SEGMENT = /^[A-Za-z0-9_.-]+$/;
const MAX_DIFF_BYTES = 2_000_000;

// Whole-repo scan budgets. The engine refuses any diff over its own cap, so the
// synthesized "every text file as added" diff is built up to a budget safely
// under it. Always honest about coverage when a cap is hit.
const REPO_DIFF_BUDGET = 1_900_000; // ceiling for the synthesized diff (< engine cap)
const REPO_PER_FILE_BYTES = 256 * 1024; // skip individual files larger than this
const REPO_MAX_ARCHIVE_BYTES = 100 * 1024 * 1024; // refuse absurdly large tarballs
const SPEC_NAMES = new Set(["codeceipt.yml", "codeceipt.yaml", ".github/codeceipt.yml"]);
const BINARY_EXT = new Set([
  "png", "jpg", "jpeg", "gif", "webp", "ico", "bmp", "pdf", "woff", "woff2", "ttf",
  "otf", "eot", "mp4", "mov", "webm", "mp3", "wav", "ogg", "flac", "aac", "zip", "gz",
  "tgz", "bz2", "xz", "tar", "rar", "7z", "exe", "dll", "so", "dylib", "bin", "wasm",
  "class", "jar", "pyc", "pyo", "node", "icns", "ds_store", "heic", "avif", "psd",
]);

// GitHub serves the diff media type as a 302 to one of these hosts. We follow
// the redirect manually and only to a known GitHub-owned host — this keeps the
// SSRF guard (an attacker can't make us fetch an arbitrary location) while
// still resolving the legitimate redirect.
const REDIRECT_HOSTS = new Set([
  "codeload.github.com",
  "objects.githubusercontent.com",
  "api.github.com",
  "github.com",
]);

/** Parse a GitHub PR URL into its parts. Returns null if it is not a PR URL. */
export function parsePrUrl(
  url: string,
): { owner: string; repo: string; number: number } | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" || !ALLOWED_HOSTS.has(u.hostname)) return null;
  const m = u.pathname.match(/^\/([^/]+)\/([^/]+)\/pull\/(\d+)\/?$/);
  if (!m) return null;
  const [, owner, repo, number] = m;
  if (!okSeg(owner) || !okSeg(repo)) return null;
  return { owner, repo, number: Number(number) };
}

/** Parse a bare GitHub repo URL (no /pull/...). Returns null otherwise. */
export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" || !ALLOWED_HOSTS.has(u.hostname)) return null;
  // owner/repo with nothing meaningful after (allow trailing slash or .git).
  const m = u.pathname.match(/^\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
  if (!m) return null;
  const [, owner, repo] = m;
  if (!okSeg(owner) || !okSeg(repo)) return null;
  return { owner, repo };
}

function okSeg(s: string): boolean {
  return SEGMENT.test(s) && s !== ".." && s !== ".";
}

function authHeaders(accept: string): Record<string, string> {
  const h: Record<string, string> = { Accept: accept, "User-Agent": "codeceipt" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

/**
 * Fetch a URL following up to `maxHops` redirects MANUALLY, allowing only
 * GitHub-owned hosts at each hop (SSRF-safe). The diff endpoint 302-redirects
 * to codeload.github.com, so plain `redirect: "error"` would fail.
 */
async function fetchFollowingGithub(
  url: string,
  headers: Record<string, string>,
  signal: AbortSignal,
  maxHops = 3,
): Promise<Response> {
  let current = url;
  for (let hop = 0; hop <= maxHops; hop++) {
    const res = await fetch(current, { headers, redirect: "manual", signal });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) throw new Error(`GitHub redirect without a location (${res.status}).`);
      let next: URL;
      try {
        next = new URL(loc, current);
      } catch {
        throw new Error("GitHub redirect to an invalid URL.");
      }
      if (next.protocol !== "https:" || !REDIRECT_HOSTS.has(next.hostname)) {
        throw new Error("GitHub redirect to a non-GitHub host — refusing to follow.");
      }
      current = next.toString();
      continue;
    }
    return res;
  }
  throw new Error("Too many redirects fetching from GitHub.");
}

function withTimeout(ms: number): { signal: AbortSignal; done: () => void } {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return { signal: c.signal, done: () => clearTimeout(t) };
}

function capDiff(diff: string, contentLength: string | null): string {
  if (Number(contentLength ?? 0) > MAX_DIFF_BYTES || diff.length > MAX_DIFF_BYTES) {
    throw new Error("Diff is too large to scan from the web — run the GitHub Action instead.");
  }
  return diff;
}

/** What a resolved scan target carries into the engine + receipt. */
export interface ResolvedTarget {
  diff: string;
  repo: string;
  url: string;
  /** "pr" | "repo" — drives the receipt's framing. */
  kind: "pr" | "repo";
  prNumber?: number;
  /** codeceipt.yml contents found in the repo, if any (declared criteria). */
  spec?: string;
  /** Human label for the receipt's environment line. */
  env: string;
}

/** Fetch the unified diff for a single PR (follows GitHub's 302). */
export async function fetchPrDiff(prUrl: string): Promise<{ diff: string; repo: string; number: number }> {
  const parsed = parsePrUrl(prUrl);
  if (!parsed) throw new Error("Not a valid GitHub pull request URL.");
  const { owner, repo, number } = parsed;
  const { signal, done } = withTimeout(15_000);
  try {
    const res = await fetchFollowingGithub(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${number}`,
      authHeaders("application/vnd.github.v3.diff"),
      signal,
    );
    if (!res.ok) throw new Error(`GitHub returned ${res.status} fetching the PR diff.`);
    const diff = capDiff(await res.text(), res.headers.get("content-length"));
    return { diff, repo: `${owner}/${repo}`, number };
  } finally {
    done();
  }
}

/** True if a path almost certainly points at a binary/asset we shouldn't scan as text. */
export function isProbablyBinaryPath(path: string): boolean {
  const lower = path.toLowerCase();
  if (lower.endsWith(".min.js") || lower.endsWith(".min.css") || lower.endsWith(".map")) {
    return true;
  }
  const dot = lower.lastIndexOf(".");
  return dot !== -1 && BINARY_EXT.has(lower.slice(dot + 1));
}

/** Synthesize the unified-diff hunk for a file as if every line were newly added. */
export function buildAddedFileDiff(path: string, content: string): string {
  const lines = content.split("\n");
  // A trailing newline leaves a final "" element; drop it so we don't emit a phantom line.
  if (lines.length && lines[lines.length - 1] === "") lines.pop();
  const header =
    `diff --git a/${path} b/${path}\n` +
    "new file mode 100644\n" +
    "--- /dev/null\n" +
    `+++ b/${path}\n` +
    `@@ -0,0 +1,${lines.length} @@\n`;
  if (!lines.length) return header;
  return header + lines.map((l) => "+" + l).join("\n") + "\n";
}

/** Heuristic: a NUL byte in the head of a buffer means it's binary, not text. */
function looksBinary(buf: Buffer): boolean {
  const n = Math.min(buf.length, 8000);
  for (let i = 0; i < n; i++) if (buf[i] === 0) return true;
  return false;
}

/** Strip the "owner-repo-sha/" prefix GitHub puts on every tarball entry. */
function stripTopDir(name: string): string {
  const i = name.indexOf("/");
  return i === -1 ? "" : name.slice(i + 1);
}

interface RepoTarballResult {
  diff: string;
  spec?: string;
  scannedFiles: number;
  totalFiles: number;
  skipped: number; // binary/large files not scanned
  capped: boolean; // hit REPO_DIFF_BUDGET before finishing the tree
}

/**
 * Walk a gzipped repo tarball, synthesizing an "every text file as added" diff up
 * to REPO_DIFF_BUDGET so the engine scans the whole tree (secrets, declared
 * criteria) in one pass. Always captures codeceipt.yml — even past the budget —
 * since it drives the declared criteria. Skips binaries and oversized files.
 */
function readRepoTarball(archive: Buffer): Promise<RepoTarballResult> {
  return new Promise((resolve, reject) => {
    const extract = tarExtract();
    let diff = "";
    let spec: string | undefined;
    let scannedFiles = 0;
    let totalFiles = 0;
    let skipped = 0;
    let capped = false;

    const drain = (stream: Readable, next: () => void) => {
      stream.resume();
      stream.on("end", next);
    };

    extract.on("entry", (header, stream, next) => {
      if (header.type !== "file") return drain(stream, next);
      const path = stripTopDir(header.name);
      if (!path) return drain(stream, next);
      totalFiles++;

      const isSpec = SPEC_NAMES.has(path);
      const skippable =
        capped || (header.size ?? 0) > REPO_PER_FILE_BYTES || isProbablyBinaryPath(path);
      // A spec file's bytes must be read even past budget; otherwise skip cheaply.
      if (!isSpec && skippable) {
        if (!capped) skipped++;
        return drain(stream, next);
      }

      const chunks: Buffer[] = [];
      stream.on("data", (c: Buffer) => chunks.push(c));
      stream.on("error", reject);
      stream.on("end", () => {
        const buf = Buffer.concat(chunks);
        if (isSpec && spec === undefined) spec = buf.toString("utf8");
        if (capped) return next();
        if (looksBinary(buf)) {
          if (!isSpec) skipped++;
          return next();
        }
        const piece = buildAddedFileDiff(path, buf.toString("utf8"));
        if (diff.length + piece.length <= REPO_DIFF_BUDGET) {
          diff += piece;
          scannedFiles++;
        } else {
          capped = true; // tree is bigger than the engine cap — stop scanning, stay honest
        }
        next();
      });
    });

    extract.on("finish", () =>
      resolve({ diff, spec, scannedFiles, totalFiles, skipped, capped }),
    );
    extract.on("error", reject);

    const gunzip = createGunzip();
    gunzip.on("error", reject);
    Readable.from(archive).pipe(gunzip).pipe(extract);
  });
}

/**
 * Scan a whole repo: download the default branch as a tarball (one request) and
 * verify every text file's contents against the engine. Honest about scope — the
 * web scans up to a 2MB budget; full-tree TEST EXECUTION is the Action's job.
 */
export async function fetchRepoScan(repoUrl: string): Promise<ResolvedTarget> {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) throw new Error("Not a valid GitHub repository URL.");
  const { owner, repo } = parsed;

  // 1) default branch
  const branch = await (async () => {
    const { signal, done } = withTimeout(10_000);
    try {
      const res = await fetchFollowingGithub(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
        authHeaders("application/vnd.github+json"),
        signal,
      );
      if (!res.ok) throw new Error(`GitHub returned ${res.status} for the repository.`);
      const meta = (await res.json()) as { default_branch?: string };
      return meta.default_branch ?? "main";
    } finally {
      done();
    }
  })();

  // 2) whole tree as a tarball — one request, scanned locally
  const { signal, done } = withTimeout(30_000);
  let archive: Buffer;
  try {
    const res = await fetchFollowingGithub(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/tarball/${encodeURIComponent(branch)}`,
      authHeaders("application/vnd.github+json"),
      signal,
    );
    if (!res.ok) throw new Error(`GitHub returned ${res.status} fetching the repository archive.`);
    if (Number(res.headers.get("content-length") ?? 0) > REPO_MAX_ARCHIVE_BYTES) {
      throw new Error("Repository is too large to scan from the web — run the GitHub Action instead.");
    }
    archive = Buffer.from(await res.arrayBuffer());
    if (archive.length > REPO_MAX_ARCHIVE_BYTES) {
      throw new Error("Repository is too large to scan from the web — run the GitHub Action instead.");
    }
  } finally {
    done();
  }

  const t = await readRepoTarball(archive);
  if (!t.diff) throw new Error("No scannable text files found in the repository.");

  const coverage = t.capped
    ? `scanned ${t.scannedFiles}/${t.totalFiles} files (2MB cap — run the Action for the full tree)`
    : `scanned all ${t.scannedFiles} text files`;
  const env =
    `static · repo scan · ${branch} · ${coverage}` +
    (t.skipped ? ` · ${t.skipped} binary/large skipped` : "") +
    (t.spec ? " · codeceipt.yml found" : "");

  return { diff: t.diff, repo: `${owner}/${repo}`, url: repoUrl, kind: "repo", spec: t.spec, env };
}

/**
 * Resolve any GitHub URL the user pastes: a PR URL → that PR's diff; a bare
 * repo URL → a repo scan. Throws a clear, user-facing error otherwise.
 */
export async function resolveTarget(url: string): Promise<ResolvedTarget> {
  if (parsePrUrl(url)) {
    const { diff, repo, number } = await fetchPrDiff(url);
    return {
      diff,
      repo,
      url,
      kind: "pr",
      prNumber: number,
      env: "static · paste mode · PR diff",
    };
  }
  if (parseRepoUrl(url)) {
    return fetchRepoScan(url);
  }
  throw new Error(
    "Paste a GitHub pull-request URL (…/pull/42) or a repository URL (…/owner/repo).",
  );
}
