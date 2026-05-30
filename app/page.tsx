"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [prUrl, setPrUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function scan(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pr_url: prUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scan failed.");
      router.push(`/r/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed.");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
        <span className="size-1.5 rounded-full bg-[--color-pass]" />
        Codeceipt — pre-merge proof for AI code
      </span>

      <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
        Ship AI code.
        <br />
        Not AI slop.
      </h1>

      <p className="mt-5 max-w-xl text-lg text-white/60">
        Agents say <span className="text-white/90">&ldquo;done.&rdquo;</span>{" "}
        Codeceipt verifies it — by execution, not by trusting the agent — and
        hands you a public receipt you can send a client.
      </p>

      <form onSubmit={scan} className="mt-10 flex flex-col gap-3 sm:flex-row">
        <input
          type="url"
          required
          value={prUrl}
          onChange={(e) => setPrUrl(e.target.value)}
          placeholder="https://github.com/owner/repo/pull/42"
          className="flex-1 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-white/40"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[--color-paper] px-6 py-3 text-sm font-medium text-[--color-ink] transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Verifying…" : "Verify PR"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-[--color-fail]">{error}</p>}

      <div className="mt-16 grid gap-6 text-sm text-white/50 sm:grid-cols-3">
        <div>
          <p className="font-medium text-white/80">Proof, not a comment</p>
          <p className="mt-1">
            Six criterion kinds checked by execution. Fails closed.
          </p>
        </div>
        <div>
          <p className="font-medium text-white/80">Public receipt</p>
          <p className="mt-1">
            A shareable URL anyone can verify — even a non-technical client.
          </p>
        </div>
        <div>
          <p className="font-medium text-white/80">From the first commit</p>
          <p className="mt-1">A verified history, not one check at the end.</p>
        </div>
      </div>
    </main>
  );
}
