import { kv } from "@vercel/kv";
import { Receipt } from "./types";

/**
 * Receipt storage. Uses Vercel KV in production; falls back to an in-memory
 * map for local dev so the app runs with zero config (receipts are ephemeral).
 */
const useKv = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

const memory = new Map<string, Receipt>();
const key = (id: string) => `receipt:${id}`;

export async function saveReceipt(receipt: Receipt): Promise<void> {
  if (useKv) {
    await kv.set(key(receipt.id), receipt);
    return;
  }
  memory.set(receipt.id, receipt);
}

export async function getReceipt(id: string): Promise<Receipt | null> {
  if (useKv) {
    const raw = await kv.get(key(id));
    if (!raw) return null;
    return Receipt.parse(raw);
  }
  return memory.get(id) ?? null;
}

export function storageMode(): "kv" | "memory" {
  return useKv ? "kv" : "memory";
}
