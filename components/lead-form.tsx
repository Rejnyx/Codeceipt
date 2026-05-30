"use client";

import { useState } from "react";
import type { VerdictLabel } from "@/lib/types";

/**
 * Lead capture shown on any non-VERIFIED receipt. A failed hand-off is a warm
 * lead — the client already knows the delivery is broken; this is the one click
 * from "it's broken" to "fix it for me". Posts to /api/lead.
 */
export function LeadForm({
  receiptId,
  repo,
  label,
}: {
  receiptId: string;
  repo?: string | null;
  label: VerdictLabel;
}) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const failed = label === "FAILED";
  const accent = failed ? "var(--fail)" : "var(--warn)";
  const accentBg = failed ? "var(--fail-bg)" : "var(--warn-bg)";
  const accentLine = failed ? "var(--fail-line)" : "var(--warn-line)";

  const heading = failed ? "Tohle repo neprošlo. Chceš to opravit?" : "Nejste si jistí dodávkou?";
  const sub = failed
    ? "Nech kontakt — projdeme přesně, co selhalo, a ozveme se s opravou."
    : "Nech kontakt a my se na dodávku podíváme a ozveme se.";
  const cta = failed ? "Opravte mi to" : "Ozvěte se mi";

  const inputStyle: React.CSSProperties = {
    background: "var(--bg-0)",
    border: "1px solid var(--border)",
    borderRadius: 9,
    padding: "11px 13px",
    color: "var(--text-hi)",
    fontSize: 14,
    outline: "none",
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          message: message.trim() || undefined,
          receipt_id: receiptId,
          repo: repo || undefined,
          verdict: label,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Něco se pokazilo. Zkus to znovu.");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setError("Něco se pokazilo. Zkus to znovu.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div
        className="card fade-up"
        style={{
          borderColor: "var(--green-line)",
          background: "var(--green-soft)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 18px",
        }}
      >
        <span
          style={{
            width: 32,
            height: 32,
            flex: "none",
            borderRadius: 8,
            background: "var(--bg-0)",
            border: "1px solid var(--green-line)",
            color: "var(--green-400)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✓
        </span>
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text-hi)" }}>
            Díky! Ozveme se na {email}.
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-mid)" }}>
            Vezmeme přesně to, co tady selhalo, a vrátíme se s opravou.
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={submit} style={{ borderColor: accentLine, overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          padding: "15px 18px",
          borderBottom: "1px solid var(--border)",
          background: accentBg,
        }}
      >
        <span
          style={{
            width: 32,
            height: 32,
            flex: "none",
            borderRadius: 8,
            background: "var(--bg-0)",
            border: `1px solid ${accentLine}`,
            color: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
          }}
        >
          ✉
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text-hi)" }}>{heading}</div>
          <div style={{ fontSize: 12.5, color: "var(--text-lo)" }}>{sub}</div>
        </div>
      </div>

      <div style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vas@email.cz"
            style={{ ...inputStyle, flex: "1 1 220px", minWidth: 0 }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={status === "sending"}
            style={{ whiteSpace: "nowrap", opacity: status === "sending" ? 0.6 : 1 }}
          >
            {status === "sending" ? "Odesílám…" : cta}
          </button>
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nepovinné: pár slov o projektu nebo deadline"
          rows={2}
          style={{ ...inputStyle, width: "100%", marginTop: 10, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", fontSize: 13 }}
        />

        {error && (
          <div className="mono" style={{ marginTop: 8, fontSize: 12.5, color: "var(--fail)" }}>
            {error}
          </div>
        )}
        <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--text-lo)" }}>
          Bez spamu. Kontakt použijeme jen k téhle jedné opravě.
        </div>
      </div>
    </form>
  );
}
