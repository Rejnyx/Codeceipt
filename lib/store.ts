import { Receipt } from "./types";

/**
 * Receipt storage. Uses Vercel KV (Upstash Redis under the hood) in production;
 * falls back to an in-memory map for local dev so the app runs with zero config
 * (receipts are ephemeral).
 *
 * The KV client is imported lazily, only on the prod path — so the in-memory
 * fallback and the test suite never evaluate `@vercel/kv` (which expects KV env
 * vars at import time on some versions).
 */
const useKv = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

if (!useKv && process.env.NODE_ENV === "production") {
  // In-memory is a local-dev convenience; on serverless the save and the later
  // read can hit different instances, 404-ing a just-created receipt.
  console.warn(
    "[codeceipt] KV not configured in production — receipts use per-instance memory and may 404 across instances. Set KV_REST_API_URL + KV_REST_API_TOKEN.",
  );
}

const memory = new Map<string, Receipt>();

/** Restrict ids to a safe key charset before they touch the KV namespace. */
function key(id: string): string {
  return `receipt:${id.replace(/[^\w-]/g, "")}`;
}

async function kvClient() {
  const { kv } = await import("@vercel/kv");
  return kv;
}

export async function saveReceipt(receipt: Receipt): Promise<void> {
  if (useKv) {
    const kv = await kvClient();
    await kv.set(key(receipt.id), receipt);
    return;
  }
  memory.set(receipt.id, receipt);
}

export async function getReceipt(id: string): Promise<Receipt | null> {
  if (useKv) {
    const kv = await kvClient();
    const raw = await kv.get(key(id));
    if (!raw) return null;
    const parsed = Receipt.safeParse(raw);
    return parsed.success ? parsed.data : null;
  }
  return memory.get(id) ?? null;
}

export function storageMode(): "kv" | "memory" {
  return useKv ? "kv" : "memory";
}
