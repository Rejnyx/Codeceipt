import { notFound } from "next/navigation";
import Link from "next/link";
import { getReceipt } from "@/lib/store";
import type { CriterionStatus } from "@/lib/types";

const STATUS_COLOR: Record<CriterionStatus, string> = {
  pass: "var(--color-pass)",
  fail: "var(--color-fail)",
  warn: "var(--color-warn)",
  skipped: "#6b7280",
};

const STATUS_LABEL: Record<CriterionStatus, string> = {
  pass: "passed",
  fail: "failed",
  warn: "warning",
  skipped: "not run",
};

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const receipt = await getReceipt(id);
  if (!receipt) notFound();

  const blockingFails = receipt.criteria.filter(
    (c) => c.blocking && c.status === "fail",
  ).length;
  const advisories = receipt.criteria.filter((c) => c.status === "warn").length;
  const notRun = receipt.criteria.filter((c) => c.status === "skipped").length;
  const summary =
    receipt.verdict === "pass"
      ? `Passed all blocking checks${
          advisories || notRun
            ? ` — ${advisories} advisory, ${notRun} not run in this mode`
            : ""
        }.`
      : `Blocked — ${blockingFails} blocking check${blockingFails === 1 ? "" : "s"} failed.`;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-white/40 hover:text-white/70">
        ← Codeceipt
      </Link>

      <header className="mt-6 flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <p className="text-sm text-white/40">Receipt #{receipt.id}</p>
          <h1 className="mt-1 text-2xl font-semibold">
            {receipt.repo ?? "Pasted diff"}
          </h1>
          {receipt.pr_url && (
            <a
              href={receipt.pr_url}
              className="text-sm text-white/50 underline hover:text-white/80"
            >
              {receipt.pr_url}
            </a>
          )}
        </div>
        <span
          className="rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wide"
          style={{
            color: STATUS_COLOR[receipt.verdict],
            border: `1px solid ${STATUS_COLOR[receipt.verdict]}`,
          }}
        >
          {STATUS_LABEL[receipt.verdict]}
        </span>
      </header>

      <p className="mt-6 text-white/70">{summary}</p>

      <ul className="mt-8 space-y-3">
        {receipt.criteria.map((c, i) => (
          <li
            key={i}
            className="flex gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-4"
          >
            <span
              className="mt-1 size-2.5 shrink-0 rounded-full"
              style={{ background: STATUS_COLOR[c.status] }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{c.label}</span>
                <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-white/50">
                  {c.kind}
                </code>
                {!c.blocking && (
                  <span className="text-xs text-white/30">advisory</span>
                )}
              </div>
              <p className="mt-1 text-sm text-white/55">{c.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      <footer className="mt-8 flex flex-wrap gap-x-6 gap-y-1 border-t border-white/10 pt-6 text-xs text-white/40">
        <span>engine {receipt.engine_version}</span>
        <span>cost ${receipt.cost_usd.toFixed(4)}</span>
        <span>{receipt.duration_ms} ms</span>
        <span>
          {Number.isNaN(new Date(receipt.created_at).getTime())
            ? "—"
            : new Date(receipt.created_at).toUTCString()}
        </span>
      </footer>
    </main>
  );
}
