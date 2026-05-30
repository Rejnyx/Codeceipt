/**
 * Lightweight per-IP rate limiter. Best-effort: uses a fixed-window counter in
 * KV when configured (shared across serverless instances), else an in-memory
 * map (per-instance — fine for local dev and a soft guard in prod). Never
 * throws; on any backend error it fails OPEN (allows the request) so a limiter
 * outage can't take the API down.
 */
const useKv = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

const memory = new Map<string, { count: number; resetAt: number }>();

async function kvClient() {
  const { kv } = await import("@vercel/kv");
  return kv;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfter: number; // seconds until the window resets
}

/**
 * @param key    a stable identifier (e.g. `scan:<ip>`)
 * @param limit  max requests per window
 * @param windowSec window length in seconds
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  const now = Date.now();

  if (useKv) {
    try {
      const kv = await kvClient();
      const k = `rl:${key}`;
      const count = await kv.incr(k);
      if (count === 1) await kv.expire(k, windowSec);
      const ttl = await kv.ttl(k);
      const retryAfter = ttl > 0 ? ttl : windowSec;
      return { ok: count <= limit, remaining: Math.max(0, limit - count), retryAfter };
    } catch {
      return { ok: true, remaining: limit, retryAfter: 0 }; // fail open
    }
  }

  const entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return { ok: true, remaining: limit - 1, retryAfter: windowSec };
  }
  entry.count += 1;
  const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
  return { ok: entry.count <= limit, remaining: Math.max(0, limit - entry.count), retryAfter };
}

/** Best-effort client IP from standard proxy headers. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
