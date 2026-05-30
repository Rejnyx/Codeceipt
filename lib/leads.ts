import { z } from "zod";

/**
 * Lead capture. When a receipt is anything but VERIFIED, the client can leave a
 * contact to get the delivered work fixed — the conversion the mentor flagged:
 * a broken hand-off is a warm lead, not a dead end. Leads are stored next to the
 * receipt id + repo so we know exactly what they want fixed.
 *
 * KV in prod (a Redis list, newest first); in-memory fallback for local dev so
 * the app runs with zero config. The KV client is imported lazily on the prod
 * path only (see lib/store.ts for the same rationale).
 */
const useKv = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

/** Trust-boundary schema for POST /api/lead. */
export const Lead = z.object({
  email: z.string().email("Zadej platný e-mail.").max(160),
  message: z.string().max(1000).optional(),
  receipt_id: z.string().max(64).optional(),
  repo: z.string().max(160).optional(),
  verdict: z.string().max(16).optional(),
});
export type Lead = z.infer<typeof Lead>;

export interface StoredLead extends Lead {
  id: string;
  created_at: string;
}

// Pin to globalThis so every route bundle in the same process shares one list
// (same reason as the receipt store — Next bundles routes separately).
const g = globalThis as typeof globalThis & { __ccLeads?: StoredLead[] };
const memory: StoredLead[] = (g.__ccLeads ??= []);

const LIST_KEY = "leads";

async function kvClient() {
  const { kv } = await import("@vercel/kv");
  return kv;
}

export async function saveLead(input: Lead): Promise<StoredLead> {
  const stored: StoredLead = {
    ...input,
    id: crypto.randomUUID().replace(/-/g, "").slice(0, 12),
    created_at: new Date().toISOString(),
  };
  if (useKv) {
    const kv = await kvClient();
    await kv.lpush(LIST_KEY, stored);
  } else {
    memory.unshift(stored);
  }
  return stored;
}

export async function getLeads(limit = 100): Promise<StoredLead[]> {
  if (useKv) {
    const kv = await kvClient();
    const raw = await kv.lrange<StoredLead>(LIST_KEY, 0, limit - 1);
    return raw ?? [];
  }
  return memory.slice(0, limit);
}
