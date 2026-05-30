import { IngestRequest, type Receipt } from "./types";
import { saveReceipt } from "./store";

export type IngestResult =
  | { ok: true; id: string; url: string }
  | { ok: false; status: number; error: string };

function shortId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

/**
 * Store a pre-computed receipt submitted by the GitHub Action. Decoupled from
 * HTTP for testability. If CODECEIPT_INGEST_TOKEN is set, a matching Bearer
 * token is required (so only your Action can publish under your instance).
 */
export async function ingestReceipt(
  body: unknown,
  authHeader?: string | null,
): Promise<IngestResult> {
  const required = process.env.CODECEIPT_INGEST_TOKEN;
  // Fail closed in production: an unauthenticated ingest lets anyone publish a
  // forged "VERIFIED" receipt, which destroys the product's core trust claim.
  if (!required && process.env.NODE_ENV === "production") {
    return {
      ok: false,
      status: 503,
      error: "Ingest is not configured. Set CODECEIPT_INGEST_TOKEN to publish receipts.",
    };
  }
  if (required) {
    const got = authHeader?.replace(/^Bearer\s+/i, "");
    if (got !== required) {
      return { ok: false, status: 401, error: "Invalid or missing ingest token." };
    }
  }

  const parsed = IngestRequest.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      error: parsed.error.issues[0]?.message ?? "Invalid receipt payload.",
    };
  }

  const id = shortId();
  const receipt: Receipt = {
    ...parsed.data,
    id,
    created_at: new Date().toISOString(),
    pr_url: parsed.data.pr_url ?? null,
    repo: parsed.data.repo ?? null,
  };
  await saveReceipt(receipt);

  const base = process.env.CODECEIPT_PUBLIC_URL ?? "";
  return { ok: true, id, url: `${base}/r/${id}` };
}
