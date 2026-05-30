"use client";

import { useState } from "react";
import { buildFixPrompt } from "@codeceipt/engine";
import { Ic, StatusIcon } from "./icons";
import type { Receipt, CriterionResult, VerdictLabel } from "@/lib/types";
import { LeadForm } from "@/components/lead-form";

/* ---- verdict meta ---- */
type Meta = { cls: string; color: string; bg: string; line: string; icon: string; word: string };
export function verdictMeta(v: VerdictLabel): Meta {
  if (v === "VERIFIED")
    return { cls: "pass", color: "var(--pass)", bg: "var(--pass-bg)", line: "var(--pass-line)", icon: "check", word: "Verified" };
  if (v === "FAILED")
    return { cls: "fail", color: "var(--fail)", bg: "var(--fail-bg)", line: "var(--fail-line)", icon: "x", word: "Failed" };
  return { cls: "warn", color: "var(--warn)", bg: "var(--warn-bg)", line: "var(--warn-line)", icon: "minus", word: "Partial" };
}

/* perforated edge */
function Perf({ top }: { top?: boolean }) {
  return (
    <div
      aria-hidden
      style={{
        height: 10,
        width: "100%",
        background: `radial-gradient(circle at 8px ${top ? "bottom" : "top"}, transparent 0 7px, var(--bg-1) 7px) 0 0 / 18px 10px repeat-x`,
      }}
    />
  );
}

function statusWord(s: CriterionResult["status"]): string {
  return s === "pass" ? "reproduced" : s === "fail" ? "not reproduced" : s === "skipped" ? "not run here" : "advisory";
}

function CriterionRow({ c, defaultOpen }: { c: CriterionResult; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const color =
    c.status === "pass" ? "var(--pass)" : c.status === "fail" ? "var(--fail)" : "var(--warn)";
  return (
    <div style={{ borderTop: "1px solid var(--border)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 13, padding: "15px 4px", textAlign: "left" }}
      >
        <span
          style={{
            width: 26,
            height: 26,
            flex: "none",
            borderRadius: 7,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `color-mix(in oklab, ${color} 14%, transparent)`,
            color,
          }}
        >
          <StatusIcon status={c.status} s={15} />
        </span>
        <span style={{ flex: 1, fontSize: 14.5, color: "var(--text-hi)", fontWeight: 450 }}>
          {c.label}
          {!c.blocking && <span style={{ marginLeft: 8, fontSize: 11, color: "var(--text-dim)" }}>advisory</span>}
        </span>
        <span
          className="mono"
          style={{ fontSize: 11.5, color, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500 }}
        >
          {statusWord(c.status)}
        </span>
        <Ic.chevron
          s={16}
          style={{ color: "var(--text-lo)", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", flex: "none" }}
        />
      </button>
      {open && (
        <div className="fade-up" style={{ padding: "0 4px 18px 43px" }}>
          <p style={{ fontSize: 13.5, color: "var(--text-mid)", lineHeight: 1.55, marginBottom: 12 }}>
            {c.evidence ?? c.detail}
          </p>
          {(c.cmd || c.out) && (
            <div style={{ background: "var(--bg-0)", border: "1px solid var(--border)", borderRadius: 9, overflow: "hidden" }}>
              {c.cmd && (
                <div
                  className="mono"
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", fontSize: 12.5, color: "var(--text-mid)", borderBottom: c.out ? "1px solid var(--border)" : "none" }}
                >
                  <span style={{ color: "var(--green-400)" }}>$</span> {c.cmd}
                </div>
              )}
              {c.out && (
                <div className="mono" style={{ padding: "9px 12px", fontSize: 12.5, color }}>
                  <span style={{ color: "var(--text-lo)" }}>→ </span>
                  {c.out}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DiffView({ diff }: { diff: NonNullable<Receipt["diff"]> }) {
  const [open, setOpen] = useState(false);
  const lineColor = (t: string) =>
    t === "add" ? "var(--green-300)" : t === "del" ? "var(--fail)" : "var(--text-mid)";
  const lineBg = (t: string) =>
    t === "add" ? "rgba(74,222,128,0.07)" : t === "del" ? "rgba(248,113,113,0.07)" : "transparent";
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "15px 18px", textAlign: "left" }}
      >
        <Ic.terminal s={17} style={{ color: "var(--text-mid)" }} />
        <span style={{ flex: 1, fontSize: 14.5, fontWeight: 500 }}>Executed diff</span>
        <span className="mono" style={{ fontSize: 12, color: "var(--text-lo)" }}>
          {diff.files} files <span style={{ color: "var(--green-400)" }}>+{diff.additions}</span>{" "}
          <span style={{ color: "var(--fail)" }}>−{diff.deletions}</span>
        </span>
        <Ic.chevron s={16} style={{ color: "var(--text-lo)", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
      </button>
      {open && (
        <div className="fade-up" style={{ borderTop: "1px solid var(--border)", background: "var(--bg-0)" }}>
          {diff.sample.map((l, i) => (
            <div
              key={i}
              className="mono"
              style={{
                display: "flex",
                gap: 12,
                padding: "2px 16px",
                fontSize: 12.5,
                lineHeight: 1.7,
                background: lineBg(l.t),
                color: lineColor(l.t),
                fontWeight: l.t === "meta" ? 600 : 400,
                borderTop: l.t === "meta" && i > 0 ? "1px solid var(--border)" : "none",
              }}
            >
              <span style={{ width: 10, color: "var(--text-dim)", flex: "none" }}>
                {l.t === "add" ? "+" : l.t === "del" ? "−" : ""}
              </span>
              <span style={{ whiteSpace: "pre-wrap" }}>{l.s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CostLedger({ receipt }: { receipt: Receipt }) {
  const rows = receipt.cost_breakdown ?? [
    { label: "Deterministic execution", detail: `${(receipt.duration_ms / 1000).toFixed(1)}s`, usd: receipt.cost_usd },
  ];
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "15px 18px", borderBottom: "1px solid var(--border)" }}>
        <Ic.receipt s={17} style={{ color: "var(--text-mid)" }} />
        <span style={{ flex: 1, fontSize: 14.5, fontWeight: 500 }}>Cost ledger</span>
        <span className="mono" style={{ fontSize: 12, color: "var(--text-lo)" }}>transparent compute</span>
      </div>
      <div>
        {rows.map((b, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderTop: i ? "1px solid var(--border-faint)" : "none" }}>
            <span style={{ flex: 1, fontSize: 13.5, color: "var(--text-mid)" }}>{b.label}</span>
            <span className="mono tnum" style={{ fontSize: 12.5, color: "var(--text-lo)", minWidth: 84, textAlign: "right" }}>{b.detail}</span>
            <span className="mono tnum" style={{ fontSize: 13, color: "var(--text-hi)", minWidth: 56, textAlign: "right" }}>${b.usd.toFixed(3)}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", borderTop: "1px solid var(--border)", background: "var(--bg-0)" }}>
          <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>Total</span>
          {receipt.tokens != null && (
            <span className="mono tnum" style={{ fontSize: 12.5, color: "var(--text-lo)" }}>{receipt.tokens.toLocaleString("en-US")} tok</span>
          )}
          <span className="mono tnum" style={{ fontSize: 14, fontWeight: 600, color: "var(--green-400)", minWidth: 56, textAlign: "right" }}>${receipt.cost_usd.toFixed(3)}</span>
        </div>
      </div>
    </div>
  );
}

function IdentityRow({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 14, padding: "11px 0", borderTop: "1px solid var(--border-faint)" }}>
      <span className="mono" style={{ width: 110, flex: "none", fontSize: 12.5, color: "var(--text-lo)", textTransform: "uppercase", letterSpacing: "0.03em" }}>{k}</span>
      <span style={{ fontSize: 13.5, color: "var(--text-hi)" }}>{children}</span>
    </div>
  );
}

/**
 * Fix-prompt panel — only on a fail. Turns the red verdict into an action:
 * a copy-paste prompt the user drops back into their AI agent to fix the work.
 */
function FixPrompt({ receipt }: { receipt: Receipt }) {
  const subject = receipt.repo
    ? `${receipt.repo}${receipt.pr?.number ? `#${receipt.pr.number}` : ""}`
    : undefined;
  const prompt = buildFixPrompt(receipt, { subject });
  const [copied, setCopied] = useState(false);
  if (!prompt) return null;

  return (
    <div style={{ marginTop: 16 }}>
      <div
        className="card"
        style={{ borderColor: "var(--fail-line)", background: "linear-gradient(180deg, var(--fail-bg), transparent)", overflow: "hidden" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "15px 18px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ width: 32, height: 32, flex: "none", borderRadius: 8, background: "var(--bg-0)", border: "1px solid var(--fail-line)", color: "var(--fail)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ic.bolt s={16} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600 }}>Fix it — paste this into your AI agent</div>
            <div style={{ fontSize: 12.5, color: "var(--text-lo)" }}>Built from exactly what failed. Have the agent fix it, then re-verify.</div>
          </div>
          <button
            className="btn btn-sm"
            style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: copied ? "var(--green-400)" : "var(--text-hi)" }}
            onClick={() => {
              try {
                navigator.clipboard.writeText(prompt);
              } catch {}
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Ic.check s={14} /> : <Ic.copy s={14} />} {copied ? "Copied" : "Copy prompt"}
          </button>
        </div>
        <pre
          className="mono"
          style={{ margin: 0, padding: "14px 18px", fontSize: 12.5, color: "var(--text-mid)", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.6, maxHeight: 260, overflowY: "auto" }}
        >
          {prompt}
        </pre>
      </div>
    </div>
  );
}

/**
 * Upgrade panel — shown on a PARTIAL. A partial result isn't "weak", it's
 * "step 1 of 2": the web saw the diff, but some checks (tests) can only run
 * against a working tree. This frames it as a clear path to a full VERIFIED.
 */
function UpgradePanel({ receipt }: { receipt: Receipt }) {
  const [copied, setCopied] = useState(false);
  if (receipt.label !== "PARTIAL") return null;
  const skipped = receipt.criteria.filter((c) => c.status === "skipped");
  if (skipped.length === 0) return null;

  const snippet = `# .github/workflows/codeceipt.yml
name: Codeceipt
on: pull_request
permissions: { contents: read, pull-requests: write }
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: npm ci
      - uses: Rejnyx/Codeceipt@v1
        with: { fail-on-block: "true" }`;

  return (
    <div style={{ marginTop: 16 }}>
      <div className="card" style={{ borderColor: "var(--warn-line)", background: "linear-gradient(180deg, var(--warn-bg), transparent)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "15px 18px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ width: 32, height: 32, flex: "none", borderRadius: 8, background: "var(--bg-0)", border: "1px solid var(--warn-line)", color: "var(--warn)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ic.bolt s={16} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600 }}>This is step 1 — get to a full VERIFIED</div>
            <div style={{ fontSize: 12.5, color: "var(--text-lo)" }}>
              The web checked everything visible in the diff. {skipped.length} check{skipped.length === 1 ? "" : "s"} need the code to actually run — add the Action and the tests execute for real.
            </div>
          </div>
        </div>
        <div style={{ padding: "12px 18px 6px" }}>
          {skipped.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "5px 0", fontSize: 13, color: "var(--text-mid)" }}>
              <Ic.minus s={14} style={{ color: "var(--warn)", flex: "none" }} />
              <span style={{ flex: 1 }}>{c.label}</span>
              <span className="mono" style={{ fontSize: 11.5, color: "var(--text-lo)" }}>runs via Action</span>
            </div>
          ))}
        </div>
        <div style={{ position: "relative", margin: "8px 18px 16px" }}>
          <pre className="mono" style={{ margin: 0, padding: "14px 16px", paddingRight: 84, fontSize: 11.5, color: "var(--text-mid)", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.55, background: "var(--bg-0)", border: "1px solid var(--border)", borderRadius: 10, maxHeight: 260, overflowY: "auto" }}>
            {snippet}
          </pre>
          <button
            className="btn btn-sm"
            style={{ position: "absolute", top: 9, right: 9, background: "var(--bg-2)", border: "1px solid var(--border)", color: copied ? "var(--green-400)" : "var(--text-hi)" }}
            onClick={() => {
              try {
                navigator.clipboard.writeText(snippet);
              } catch {}
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Ic.check s={14} /> : <Ic.copy s={14} />} {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ n, t, sub }: { n: string; t: string; sub?: string }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span className="mono" style={{ fontSize: 12, color: "var(--green-400)" }}>{n}</span>
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>{t}</h3>
      </div>
      {sub && <p style={{ fontSize: 13.5, color: "var(--text-lo)", marginTop: 5, maxWidth: 560, lineHeight: 1.5 }}>{sub}</p>}
    </div>
  );
}

export function ReceiptDoc({ data }: { data: Receipt }) {
  const m = verdictMeta(data.label);
  const VIcon = Ic[m.icon];
  const [copied, setCopied] = useState(false);
  const [rv, setRv] = useState<"idle" | "running" | "confirmed">("idle");
  const [rvStep, setRvStep] = useState(0);
  const url = `codeceipt.dev/r/${data.id}`;
  const pct = data.claims_total ? Math.round((data.claims_met / data.claims_total) * 100) : 100;
  const rvStepsTotal = Math.min(5, data.criteria.length);

  function runReverify() {
    if (rv === "running") return;
    setRv("running");
    setRvStep(0);
    let i = 0;
    const tick = () => {
      i += 1;
      setRvStep(i);
      if (i < rvStepsTotal) setTimeout(tick, 460);
      else setTimeout(() => setRv("confirmed"), 600);
    };
    setTimeout(tick, 460);
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 18px 120px" }}>
      {/* CLIENT MODE */}
      <div className="card" style={{ borderColor: m.line, overflow: "hidden", boxShadow: "var(--shadow-lg)", position: "relative" }}>
        <div
          className="glow-green"
          style={{ top: -60, left: "50%", width: 320, height: 160, transform: "translateX(-50%)", opacity: 0.5, background: `radial-gradient(circle, color-mix(in oklab, ${m.color} 22%, transparent), transparent 65%)` }}
        />
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <Ic.logo s={20} />
            <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: "-0.02em" }}>Codeceipt</span>
            <span className="chip" style={{ height: 23, fontSize: 11 }}>Verification Receipt</span>
          </span>
          <span className="mono" style={{ fontSize: 11.5, color: "var(--text-lo)" }}>{url}</span>
        </div>

        <div style={{ position: "relative", textAlign: "center", padding: "40px 24px 30px" }}>
          <div
            className="pulse"
            style={{ width: 76, height: 76, margin: "0 auto 18px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: m.bg, border: `2px solid ${m.line}`, color: m.color }}
          >
            <VIcon s={38} w={3} />
          </div>
          <div style={{ fontSize: "clamp(30px, 7vw, 44px)", fontWeight: 700, letterSpacing: "-0.04em", color: m.color, marginBottom: 6 }}>{data.label}</div>
          <p style={{ fontSize: "clamp(15px,2.4vw,17px)", color: "var(--text-mid)", lineHeight: 1.5, maxWidth: 520, margin: "0 auto" }}>
            {data.label === "VERIFIED"
              ? "This change was independently executed and met every declared criterion."
              : data.label === "FAILED"
                ? "This change was independently executed; a blocking criterion did not reproduce."
                : "This change passed every check that could run here; some require a working tree (the Action)."}
          </p>

          <div style={{ maxWidth: 360, margin: "22px auto 0" }}>
            <div className="mono" style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--text-lo)", marginBottom: 7 }}>
              <span>criteria reproduced</span>
              <span style={{ color: m.color }}>{data.claims_met}/{data.claims_total} · {pct}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: "var(--bg-3)", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: m.color, borderRadius: 99, boxShadow: `0 0 12px ${m.color}` }} />
            </div>
          </div>
        </div>

        {/* re-verify */}
        <div style={{ position: "relative", padding: "0 24px 26px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          {rv === "idle" && (
            <>
              <button className="btn btn-primary btn-lg" onClick={runReverify} style={{ minWidth: 260 }}>
                <Ic.refresh s={17} /> Run this verification again
              </button>
              <p style={{ fontSize: 12.5, color: "var(--text-lo)", textAlign: "center", maxWidth: 380 }}>
                Anyone — including the client — can re-run this and get the same fingerprint. You can&rsquo;t fake it.
              </p>
            </>
          )}
          {rv === "running" && (
            <div className="fade-up card" style={{ width: "100%", maxWidth: 420, background: "var(--bg-0)", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 14px", borderBottom: "1px solid var(--border)" }}>
                <Ic.refresh s={14} className="spin" style={{ color: "var(--green-400)" }} />
                <span className="mono" style={{ fontSize: 12, color: "var(--text-mid)" }}>re-running…</span>
                <span className="mono" style={{ fontSize: 11.5, color: "var(--text-lo)", marginLeft: "auto" }}>{rvStep}/{rvStepsTotal}</span>
              </div>
              <div style={{ padding: "6px 14px 10px" }}>
                {data.criteria.slice(0, rvStepsTotal).map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 0", opacity: i < rvStep ? 1 : 0.4, transition: "opacity .3s" }}>
                    <span style={{ width: 15, flex: "none", display: "flex", justifyContent: "center" }}>
                      {i < rvStep ? <StatusIcon status={c.status} s={14} /> : <Ic.refresh s={12} className="spin" style={{ color: "var(--text-lo)" }} />}
                    </span>
                    <span className="mono" style={{ fontSize: 11.5, color: "var(--text-mid)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.cmd ?? c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {rv === "confirmed" && (
            <div className="fade-up card" style={{ width: "100%", maxWidth: 460, borderColor: "var(--green-line)", background: "var(--green-soft)", padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--bg-0)", border: "1px solid var(--green-line)", color: "var(--green-400)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  <Ic.check s={17} w={3} />
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-hi)" }}>Re-verified — identical fingerprint</div>
                  <div style={{ fontSize: 12, color: "var(--text-mid)" }}>Same verdict, same hash. Deterministic.</div>
                </div>
              </div>
              <div className="mono" style={{ fontSize: 12, color: "var(--text-hi)", background: "var(--bg-0)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px" }}>{data.fingerprint}</div>
              <button className="btn btn-quiet btn-sm" onClick={() => setRv("idle")} style={{ marginTop: 12 }}>
                <Ic.refresh s={13} /> Run again
              </button>
            </div>
          )}
        </div>

        <Perf top />
        {/* identity strip */}
        <div style={{ position: "relative", padding: "16px 22px 20px", background: "var(--bg-0)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            {data.pr?.platform === "GitLab" ? <Ic.gitlab s={15} style={{ color: "var(--text-mid)" }} /> : <Ic.github s={15} style={{ color: "var(--text-mid)" }} />}
            <span className="mono" style={{ fontSize: 13, color: "var(--text-hi)" }}>
              {data.repo ?? "Pasted diff"}
              {data.pr?.number ? <span style={{ color: "var(--green-400)" }}> #{data.pr.number}</span> : null}
            </span>
          </div>
          {data.pr?.title && <div style={{ fontSize: 15, color: "var(--text-hi)", fontWeight: 500, marginBottom: 2 }}>{data.pr.title}</div>}
          {data.pr?.author && (
            <div style={{ fontSize: 12.5, color: "var(--text-lo)" }}>
              by <span style={{ color: "var(--text-mid)" }}>{data.pr.author}</span>
              {data.pr.authorKind ? ` · ${data.pr.authorKind}` : ""}
              {data.requested_by ? ` · requested by ${data.requested_by}` : ""}
            </div>
          )}
        </div>
      </div>

      {/* fix prompt (fail only) */}
      <FixPrompt receipt={data} />

      {/* upgrade-to-Action panel (partial only) */}
      <UpgradePanel receipt={data} />

      {/* lead capture — a broken or unproven hand-off is a warm lead */}
      {data.label !== "VERIFIED" && (
        <div style={{ marginTop: 16 }}>
          <LeadForm receiptId={data.id} repo={data.repo} label={data.label} />
        </div>
      )}

      {/* actions */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 16, alignItems: "center" }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            try {
              navigator.clipboard.writeText("https://" + url);
            } catch {}
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          }}
        >
          {copied ? <Ic.check s={15} style={{ color: "var(--green-400)" }} /> : <Ic.link s={15} />} {copied ? "Link copied" : "Copy link"}
        </button>
        <a className="btn btn-ghost btn-sm" href={`/r/${data.id}/data.json`}>
          <Ic.doc s={15} /> JSON
        </a>
        <a className="btn btn-ghost btn-sm" href={`/r/${data.id}/badge.svg`}>
          <Ic.shield s={15} /> Badge
        </a>
        <span style={{ flex: 1 }} />
        <span className="chip" style={{ height: 32 }}>
          <Ic.clock s={13} /> {Number.isNaN(new Date(data.created_at).getTime()) ? "—" : new Date(data.created_at).toUTCString()}
        </span>
      </div>

      {/* ENGINEER DETAIL */}
      <div style={{ marginTop: 40 }}>
        <SectionLabel n="01" t="Per-criterion breakdown" sub={`Each declared criterion, re-executed against real evidence. ${data.claims_met} of ${data.claims_total} reproduced.`} />
        <div className="card" style={{ padding: "0 18px", marginTop: 14 }}>
          {data.criteria.map((c, i) => (
            <CriterionRow key={i} c={c} defaultOpen={i === 0} />
          ))}
        </div>
      </div>

      {data.diff && (
        <div style={{ marginTop: 34 }}>
          <SectionLabel n="02" t="The diff we executed" sub="Real code, run in an isolated checkout. Its presence is the proof." />
          <div style={{ marginTop: 14 }}>
            <DiffView diff={data.diff} />
          </div>
        </div>
      )}

      <div className="rcpt-grid" style={{ marginTop: 34, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div>
          <SectionLabel n="03" t="Identity" />
          <div className="card" style={{ padding: "4px 18px 14px", marginTop: 14 }}>
            <IdentityRow k="Platform">{data.pr?.platform ?? "—"}</IdentityRow>
            <IdentityRow k="Repository"><span className="mono" style={{ fontSize: 12.5 }}>{data.repo ?? "—"}</span></IdentityRow>
            {data.pr?.branch && <IdentityRow k="Branch"><span className="mono" style={{ fontSize: 12.5 }}>{data.pr.branch}</span></IdentityRow>}
            {data.pr?.baseSha && (
              <IdentityRow k="Base → head"><span className="mono" style={{ fontSize: 12.5 }}>{data.pr.baseSha} → {data.pr.headSha}</span></IdentityRow>
            )}
            {data.env && <IdentityRow k="Environment"><span className="mono" style={{ fontSize: 12 }}>{data.env}</span></IdentityRow>}
            <IdentityRow k="Engine">{data.engine_version} · Apache-2.0</IdentityRow>
          </div>
        </div>
        <div>
          <SectionLabel n="04" t="Cost ledger" />
          <div style={{ marginTop: 14 }}>
            <CostLedger receipt={data} />
          </div>
        </div>
      </div>

      {/* fingerprint */}
      <div style={{ marginTop: 34 }}>
        <SectionLabel n="05" t="Verification fingerprint" sub="Deterministic, machine-checkable. Re-running the same verification reproduces it." />
        <div className="card" style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 16, padding: 18, alignItems: "center" }}>
          <span style={{ width: 46, height: 46, flex: "none", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--green-soft)", border: "1px solid var(--green-line)", color: "var(--green-400)" }}>
            <Ic.fingerprint s={24} />
          </span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="mono" style={{ fontSize: 15, color: "var(--text-hi)" }}>{data.fingerprint}</div>
            <div style={{ fontSize: 12.5, color: "var(--text-lo)", marginTop: 3 }}>engine {data.engine_version}</div>
          </div>
          <span className="chip chip-green"><span className="dot dot-pass" /> tamper-evident</span>
        </div>
      </div>
    </div>
  );
}
