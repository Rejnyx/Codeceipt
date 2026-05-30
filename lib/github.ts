/** Parse a GitHub PR URL into its parts. Returns null if it is not a PR URL. */
export function parsePrUrl(
  url: string,
): { owner: string; repo: string; number: number } | null {
  const m = url.match(
    /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/,
  );
  if (!m) return null;
  return { owner: m[1], repo: m[2], number: Number(m[3]) };
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

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${number}`,
    { headers },
  );
  if (!res.ok) {
    throw new Error(`GitHub returned ${res.status} fetching the PR diff.`);
  }

  return { diff: await res.text(), repo: `${owner}/${repo}` };
}
