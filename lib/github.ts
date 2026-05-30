const ALLOWED_HOSTS = new Set(["github.com", "www.github.com"]);
const SEGMENT = /^[A-Za-z0-9_.-]+$/;
const MAX_DIFF_BYTES = 2_000_000;

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

/** Best-effort fetch of codeceipt.yml/.yaml from a repo's default branch. */
async function fetchSpecFile(owner: string, repo: string, ref: string): Promise<string | undefined> {
  for (const name of ["codeceipt.yml", "codeceipt.yaml", ".github/codeceipt.yml"]) {
    const { signal, done } = withTimeout(10_000);
    try {
      const res = await fetchFollowingGithub(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${name}?ref=${encodeURIComponent(ref)}`,
        authHeaders("application/vnd.github.raw"),
        signal,
      );
      if (res.ok) {
        const text = await res.text();
        if (text.trim()) return text;
      }
    } catch {
      /* try the next candidate */
    } finally {
      done();
    }
  }
  return undefined;
}

/**
 * Scan a whole repo: take the default branch's latest commit as the delivered
 * diff and pull codeceipt.yml if present. Honest about scope — the web sees the
 * latest commit; full-tree test execution is the GitHub Action's job.
 */
export async function fetchRepoScan(repoUrl: string): Promise<ResolvedTarget> {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) throw new Error("Not a valid GitHub repository URL.");
  const { owner, repo } = parsed;

  // 1) default branch
  const meta = await (async () => {
    const { signal, done } = withTimeout(10_000);
    try {
      const res = await fetchFollowingGithub(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
        authHeaders("application/vnd.github+json"),
        signal,
      );
      if (!res.ok) throw new Error(`GitHub returned ${res.status} for the repository.`);
      return (await res.json()) as { default_branch?: string };
    } finally {
      done();
    }
  })();
  const branch = meta.default_branch ?? "main";

  // 2) latest commit diff on that branch
  const { signal, done } = withTimeout(15_000);
  let diff: string;
  try {
    const res = await fetchFollowingGithub(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(branch)}`,
      authHeaders("application/vnd.github.v3.diff"),
      signal,
    );
    if (!res.ok) throw new Error(`GitHub returned ${res.status} fetching the branch diff.`);
    diff = capDiff(await res.text(), res.headers.get("content-length"));
  } finally {
    done();
  }

  // 3) declared criteria, if the repo ships them
  const spec = await fetchSpecFile(owner, repo, branch);

  return {
    diff,
    repo: `${owner}/${repo}`,
    url: repoUrl,
    kind: "repo",
    spec,
    env: `static · repo scan · latest commit on ${branch}${spec ? " · codeceipt.yml found" : ""}`,
  };
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
