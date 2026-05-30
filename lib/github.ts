const ALLOWED_HOSTS = new Set(["github.com", "www.github.com"]);
const SEGMENT = /^[A-Za-z0-9_.-]+$/;

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
  if (!SEGMENT.test(owner) || !SEGMENT.test(repo) || owner === ".." || repo === "..") {
    return null;
  }
  return { owner, repo, number: Number(number) };
}

/**
 * Fetch the unified diff for a PR. Uses GITHUB_TOKEN when present (required for
 * private repos + higher rate limits). The diff media type returns raw text.
 */
export async function fetchPrDiff(prUrl: string): Promise<{ diff: string; repo: string }> {
  const parsed = parsePrUrl(prUrl);
  if (!parsed) throw new Error("Not a valid GitHub pull request URL.");

  const { owner, repo, number } = parsed;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3.diff",
    "User-Agent": "codeceipt",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const MAX_DIFF_BYTES = 2_000_000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  let res: Response;
  try {
    res = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${number}`,
      { headers, redirect: "error", signal: controller.signal },
    );
  } finally {
    clearTimeout(timeout);
  }
  if (!res.ok) {
    throw new Error(`GitHub returned ${res.status} fetching the PR diff.`);
  }
  if (Number(res.headers.get("content-length") ?? 0) > MAX_DIFF_BYTES) {
    throw new Error("PR diff is too large to scan.");
  }
  const diff = await res.text();
  if (diff.length > MAX_DIFF_BYTES) {
    throw new Error("PR diff is too large to scan.");
  }

  return { diff, repo: `${owner}/${repo}` };
}
