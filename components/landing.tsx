"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Ic, StatusIcon } from "./icons";
import { verdictMeta } from "./receipt-doc";
import { allSamples, getSampleReceipt, SAMPLE_IDS } from "@/lib/sample-receipts";
import type { Receipt } from "@/lib/types";

/* ---------- small helpers ---------- */
function CountUp({ to, suffix = "", decimals = 0, sep = true }: { to: number; suffix?: string; decimals?: number; sep?: boolean }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / 1400);
            setVal(to * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(tick);
            else setVal(to);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  const shown = decimals > 0 ? val.toFixed(decimals) : sep ? Math.round(val).toLocaleString("en-US") : String(Math.round(val));
  return <span ref={ref} className="tnum">{shown}{suffix}</span>;
}

function Eyebrow({ children, icon }: { children: React.ReactNode; icon?: string }) {
  const I = icon ? Ic[icon] : null;
  return (
    <span className="chip chip-green" style={{ marginBottom: 22 }}>
      {I ? <I s={13} /> : <span className="dot dot-pass" />} {children}
    </span>
  );
}

/* ---------- live verify card (hero + showcase) ---------- */
function LiveVerifyCard({ data, onOpen, onSwitch, activeId }: { data: Receipt; onOpen?: () => void; onSwitch?: (id: string) => void; activeId?: string }) {
  const crit = data.criteria.slice(0, 5);
  const N = crit.length;
  const [checked, setChecked] = useState(0);
  const [done, setDone] = useState(false);
  const m = verdictMeta(data.label);
  const VIcon = Ic[m.icon];

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const push = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));
    function run() {
      setChecked(0);
      setDone(false);
      let t = 650;
      for (let i = 0; i < N; i++) {
        const idx = i;
        push(() => setChecked(idx + 1), t);
        t += 600;
      }
      push(() => setDone(true), t + 150);
      push(run, t + 150 + 3200);
    }
    run();
    return () => timers.forEach(clearTimeout);
  }, [data.id, N]);

  const pct = Math.round((checked / N) * 100);
  const activeCmd = crit[Math.min(checked, N - 1)];
  const verdicts = [
    { id: SAMPLE_IDS.verified, label: "Verified", c: "var(--pass)" },
    { id: SAMPLE_IDS.partial, label: "Partial", c: "var(--warn)" },
    { id: SAMPLE_IDS.failed, label: "Failed", c: "var(--fail)" },
  ];

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 420 }}>
      <div className="glow-green" style={{ inset: "-30px -10px -10px", filter: "blur(50px)", opacity: done ? 0.7 : 0.38, background: `radial-gradient(circle, color-mix(in oklab, ${m.color} 30%, transparent), transparent 65%)`, transition: "opacity .6s" }} />
      <div className="card" style={{ position: "relative", background: "var(--bg-1)", borderColor: done ? m.line : "var(--border-strong)", borderRadius: 18, overflow: "hidden", boxShadow: "var(--shadow-lg)", transition: "border-color .5s" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Ic.logo s={18} />
            <span className="mono" style={{ fontSize: 12.5, color: "var(--text-mid)" }}>codeceipt.dev/r/{data.id.slice(5, 13)}</span>
          </div>
          {done ? (
            <span className="chip" style={{ height: 24, fontSize: 11.5, borderColor: m.line, background: m.bg, color: m.color }}><Ic.shield s={12} /> signed</span>
          ) : (
            <span className="chip" style={{ height: 24, fontSize: 11.5, borderColor: "var(--warn-line)", background: "var(--warn-bg)", color: "var(--warn)" }}><span className="dot dot-warn pulse" /> executing</span>
          )}
        </div>
        <div style={{ padding: "22px 20px 14px", textAlign: "center" }}>
          <div className="pulse" style={{ width: 56, height: 56, margin: "0 auto 14px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: done ? m.bg : "var(--bg-3)", border: `1.5px solid ${done ? m.line : "var(--border)"}`, color: done ? m.color : "var(--text-mid)", transition: "all .5s" }}>
            {done ? <VIcon s={28} w={3} /> : <Ic.refresh s={24} className="spin" />}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: done ? m.color : "var(--text-mid)", transition: "color .4s" }}>
            {done ? data.label : "VERIFYING"}{!done && <span className="caret">_</span>}
          </div>
          <p style={{ marginTop: 8, fontSize: 13, color: "var(--text-mid)", minHeight: 18 }}>
            {done ? <>Executed — met <strong style={{ color: "var(--text-hi)" }}>{data.claims_met} of {data.claims_total}</strong> criteria.</> : <>Running checks in a clean sandbox…</>}
          </p>
          <div style={{ maxWidth: 300, margin: "16px auto 0" }}>
            <div className="mono" style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-lo)", marginBottom: 6 }}>
              <span>{done ? "reproduced" : "reproducing"}</span>
              <span style={{ color: done ? m.color : "var(--text-mid)" }}>{done ? `${data.claims_met}/${data.claims_total}` : `${checked}/${N}`}</span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: "var(--bg-3)", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: done ? m.color : "var(--green-500)", borderRadius: 99, boxShadow: pct ? `0 0 10px ${m.color}` : "none", transition: "width .5s cubic-bezier(.3,.7,.3,1)" }} />
            </div>
          </div>
        </div>
        <div style={{ padding: "0 18px 4px" }}>
          {crit.map((c, i) => {
            const state = i < checked ? "resolved" : i === checked && !done ? "active" : "todo";
            const cc = c.status === "pass" ? "var(--pass)" : c.status === "fail" ? "var(--fail)" : "var(--warn)";
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: "1px solid var(--border-faint)", opacity: state === "todo" ? 0.4 : 1, transition: "opacity .4s" }}>
                <span style={{ width: 16, flex: "none", display: "flex", justifyContent: "center" }}>
                  {state === "resolved" ? <StatusIcon status={c.status} s={15} /> : state === "active" ? <Ic.refresh s={13} className="spin" style={{ color: "var(--green-400)" }} /> : <span style={{ width: 11, height: 11, borderRadius: 99, border: "1.5px solid var(--border-strong)" }} />}
                </span>
                <span style={{ fontSize: 12.5, color: state === "resolved" ? "var(--text-mid)" : state === "active" ? "var(--text-hi)" : "var(--text-lo)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.label}</span>
                {state === "resolved" && <span className="mono" style={{ fontSize: 10.5, color: cc, marginLeft: "auto", flex: "none" }}>{c.status === "pass" ? "ok" : c.status === "fail" ? "fail" : "skip"}</span>}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "var(--bg-0)", minHeight: 54, borderTop: "1px solid var(--border)" }}>
          {done ? (
            <span className="mono fade-up" style={{ fontSize: 11, color: "var(--text-lo)" }}>{data.fingerprint}</span>
          ) : (
            <span className="mono" style={{ fontSize: 11, color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <span style={{ color: "var(--green-400)" }}>$ </span>{activeCmd?.cmd ?? "booting sandbox…"}
            </span>
          )}
          {onOpen && (
            <button className="btn btn-sm btn-ghost" onClick={onOpen} style={{ height: 30, flex: "none", marginLeft: 10, opacity: done ? 1 : 0.5, transition: "opacity .4s" }}>
              Open <Ic.arrowUpRight s={13} />
            </button>
          )}
        </div>
      </div>
      {onSwitch && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, justifyContent: "center" }}>
          <span className="mono" style={{ fontSize: 10.5, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>try a verdict</span>
          <div style={{ display: "inline-flex", gap: 3, padding: 3, background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 9 }}>
            {verdicts.map((v) => {
              const on = activeId === v.id;
              return (
                <button key={v.id} onClick={() => onSwitch(v.id)} style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 26, padding: "0 10px", borderRadius: 7, fontSize: 12, fontWeight: 500, background: on ? "var(--bg-3)" : "transparent", color: on ? "var(--text-hi)" : "var(--text-lo)", border: on ? `1px solid ${v.c}` : "1px solid transparent", transition: "all .15s" }}>
                  <span className="dot" style={{ background: v.c, boxShadow: on ? `0 0 7px ${v.c}` : "none" }} /> {v.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- paste / exec flow ---------- */
const EXEC_STEPS = [
  { label: "Cloning repository", detail: "fetching the PR diff" },
  { label: "Parsing claimed criteria", detail: "what the PR says it does" },
  { label: "Verifying against the diff", detail: "execution, not self-report" },
  { label: "Building & signing receipt", detail: "hash, timestamp, public URL" },
];

function ExecLoader({ target }: { target: string }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timers = EXEC_STEPS.map((_, i) => setTimeout(() => setStep(i + 1), 500 + i * 700));
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <div style={{ width: "100%", maxWidth: 560 }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <span className="chip chip-green" style={{ marginBottom: 14 }}><span className="dot dot-pass pulse" /> Executing — not summarizing</span>
        <h2 style={{ fontSize: "clamp(22px,4vw,28px)", fontWeight: 600 }}>Verifying the pull request</h2>
        <p className="mono" style={{ fontSize: 12.5, color: "var(--text-lo)", marginTop: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{target}</p>
      </div>
      <div className="card" style={{ padding: 8 }}>
        {EXEC_STEPS.map((s, i) => {
          const state = i < step ? "done" : i === step ? "active" : "todo";
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 13, padding: 12, borderRadius: 10, background: state === "active" ? "var(--bg-2)" : "transparent" }}>
              <span style={{ width: 26, height: 26, flex: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: state === "done" ? "var(--green-soft)" : "var(--bg-2)", border: `1px solid ${state === "done" ? "var(--green-line)" : "var(--border)"}`, color: state === "done" ? "var(--green-400)" : "var(--text-lo)" }}>
                {state === "done" ? <Ic.check s={14} w={3} /> : state === "active" ? <Ic.refresh s={13} className="spin" /> : <span className="mono" style={{ fontSize: 11 }}>{i + 1}</span>}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: state === "todo" ? "var(--text-lo)" : "var(--text-hi)" }}>{s.label}</div>
                <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{s.detail}</div>
              </div>
              {state === "active" && <span className="mono" style={{ fontSize: 11.5, color: "var(--green-400)" }}>running</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PasteView({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    const target = url.trim();
    if (!target) {
      setErr("Paste a pull-request URL to verify.");
      return;
    }
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pr_url: target }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scan failed.");
      router.push(`/r/${data.id}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Scan failed.");
      setLoading(false);
    }
  }

  return (
    <section style={{ minHeight: "calc(100vh - 62px)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "40px 18px" }}>
      <div className="grid-bg" />
      <div className="glow-green" style={{ top: "12%", left: "50%", width: 460, height: 320, transform: "translateX(-50%)", opacity: 0.4 }} />
      <div style={{ position: "relative", width: "100%", maxWidth: 620, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        {loading ? (
          <ExecLoader target={url} />
        ) : (
          <>
            <span className="chip chip-green" style={{ marginBottom: 22 }}><Ic.bolt s={13} /> Verify by execution</span>
            <h1 style={{ fontSize: "clamp(30px,5.5vw,46px)", letterSpacing: "-0.04em", fontWeight: 600, lineHeight: 1.04 }}>
              Paste a pull request.<br />Get a receipt.
            </h1>
            <p style={{ fontSize: 16.5, color: "var(--text-mid)", marginTop: 16, marginBottom: 28, maxWidth: 460, lineHeight: 1.5 }}>
              Codeceipt verifies it against what it claims — not what the agent says — and hands you a public receipt.
            </p>
            <div style={{ width: "100%", maxWidth: 560 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 7, background: "var(--bg-2)", border: `1px solid ${err ? "var(--fail-line)" : "var(--border-strong)"}`, borderRadius: 14, boxShadow: "var(--shadow-md)" }}>
                <span style={{ paddingLeft: 8, display: "flex", color: "var(--text-lo)" }}><Ic.github s={18} /></span>
                <input
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setErr(""); }}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="https://github.com/owner/repo/pull/42"
                  spellCheck={false}
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text-hi)", fontSize: 14.5, padding: "8px 2px", fontFamily: "var(--mono)" }}
                />
                <button className="btn btn-primary" onClick={submit} style={{ height: 40 }}><Ic.bolt s={16} /> Verify</button>
              </div>
              <div style={{ minHeight: 20, marginTop: 11 }}>
                <span style={{ fontSize: 12.5, color: err ? "var(--fail)" : "var(--text-lo)", display: "inline-flex", alignItems: "center", gap: 7 }}>
                  {err ? <><Ic.x s={13} /> {err}</> : <><Ic.lock s={13} /> Public PRs verify instantly.</>}
                </span>
              </div>
              <div style={{ marginTop: 18 }}>
                <div className="mono" style={{ fontSize: 10.5, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>or open a sample receipt</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                  {allSamples().map((s) => {
                    const m = verdictMeta(s.label);
                    return (
                      <button key={s.id} onClick={() => router.push(`/r/${s.id}`)} className="chip" style={{ height: 32 }}>
                        <span className="dot" style={{ background: m.color }} /> {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <button className="btn btn-quiet btn-sm" onClick={onBack} style={{ marginTop: 28 }}>← Back to home</button>
          </>
        )}
      </div>
    </section>
  );
}

/* ---------- nav + footer ---------- */
function Nav({ onVerify }: { onVerify: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = [
    { l: "How it works", h: "#how" },
    { l: "Receipt", h: "#receipt" },
    { l: "Pricing", h: "#pricing" },
    { l: "FAQ", h: "#faq" },
  ];
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: scrolled ? "var(--bg-glass)" : "transparent", backdropFilter: scrolled ? "blur(14px) saturate(1.4)" : "none", borderBottom: `1px solid ${scrolled ? "var(--border)" : "transparent"}`, transition: "all .25s" }}>
      <div className="wrap" style={{ display: "flex", alignItems: "center", gap: 18, height: 62 }}>
        <a href="#top" style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Ic.logo s={24} />
          <span style={{ fontWeight: 600, fontSize: 16.5, letterSpacing: "-0.03em" }}>Codeceipt</span>
        </a>
        <nav className="nav-links" style={{ display: "flex", gap: 4, marginLeft: 12 }}>
          {links.map((x) => (
            <a key={x.l} href={x.h} style={{ fontSize: 13.5, color: "var(--text-mid)", padding: "7px 11px", borderRadius: 8 }}>{x.l}</a>
          ))}
        </nav>
        <span style={{ flex: 1 }} />
        <button className="btn btn-primary btn-sm" onClick={onVerify} style={{ height: 38 }}><Ic.bolt s={15} /> Verify a PR</button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", background: "var(--bg-1)", paddingTop: 48 }}>
      <div className="wrap" style={{ paddingBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 13 }}>
          <Ic.logo s={24} /><span style={{ fontWeight: 600, fontSize: 16.5, letterSpacing: "-0.03em" }}>Codeceipt</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-lo)", maxWidth: 320, lineHeight: 1.55 }}>
          Ship AI code. Not AI slop. Verify pull requests by execution and hand your client a receipt they can re-run themselves.
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
          <span style={{ fontSize: 12.5, color: "var(--text-dim)" }}>© 2026 Codeceipt. Engine licensed Apache-2.0.</span>
          <span className="mono" style={{ fontSize: 12, color: "var(--text-dim)", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Ic.shield s={13} /> deterministic execution engine — not an LLM&rsquo;s opinion of itself
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ---------- landing sections ---------- */
function Hero({ onVerify, onReceipt }: { onVerify: () => void; onReceipt: (id: string) => void }) {
  const [liveId, setLiveId] = useState(SAMPLE_IDS.verified);
  const liveData = getSampleReceipt(liveId)!;
  return (
    <section id="top" className="section" style={{ paddingTop: 64, paddingBottom: 72, position: "relative", overflow: "hidden" }}>
      <div className="grid-bg" />
      <div className="glow-green" style={{ top: -80, right: "6%", width: 480, height: 360, opacity: 0.5 }} />
      <div className="wrap" style={{ position: "relative" }}>
        <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.08fr 0.92fr", gap: 56, alignItems: "center" }}>
          <div className="fade-up">
            <h1 style={{ fontSize: "clamp(40px, 7vw, 68px)", lineHeight: 0.98, letterSpacing: "-0.045em", fontWeight: 600 }}>
              Ship AI code.<br /><span style={{ color: "var(--text-lo)" }}>Not AI&nbsp;</span><span style={{ color: "var(--green-400)" }}>slop.</span>
            </h1>
            <p style={{ fontSize: "clamp(16px, 2.4vw, 19px)", color: "var(--text-mid)", lineHeight: 1.55, marginTop: 24, maxWidth: 520 }}>
              Codeceipt <strong style={{ color: "var(--text-hi)", fontWeight: 600 }}>runs</strong> your AI pull request, verifies it actually did what it claims, and gives your client a <strong style={{ color: "var(--text-hi)", fontWeight: 600 }}>public receipt they can check themselves</strong>.
            </p>
            <p style={{ fontSize: 14, color: "var(--text-lo)", marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <Ic.bolt s={15} style={{ color: "var(--green-400)" }} /> Verification by execution — not the agent&rsquo;s opinion of itself.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 30 }}>
              <button className="btn btn-primary btn-lg" onClick={onVerify}><Ic.bolt s={17} /> Verify a PR</button>
              <button className="btn btn-ghost btn-lg" onClick={() => onReceipt(liveId)}><Ic.receipt s={17} /> See a live Receipt</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 26, color: "var(--text-lo)", fontSize: 12.5, flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><Ic.github s={14} /> GitHub</span>
              <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><Ic.gitlab s={14} /> GitLab</span>
              <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><Ic.lock s={13} /> Code never leaves the sandbox</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <LiveVerifyCard data={liveData} onOpen={() => onReceipt(liveId)} onSwitch={setLiveId} activeId={liveId} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const stats = [
    { to: 32.7, dec: 1, suf: "%", l: "acceptance rate for AI pull requests (vs 84% human)", src: "LinearB 2026" },
    { to: 45, suf: "%", l: "of AI code carries an OWASP Top 10 vulnerability", src: "Veracode 2025" },
    { to: 10, suf: "×", l: "spike in security findings since AI adoption", src: "Apiiro 2025" },
    { to: 96, suf: "%", l: "of devs don’t trust AI code in production", src: "Sonar 2026" },
  ];
  return (
    <section className="section">
      <div className="wrap">
        <div style={{ maxWidth: 640, marginBottom: 44 }}>
          <Eyebrow>The slop tax</Eyebrow>
          <h2 style={{ fontSize: "clamp(28px,4.6vw,42px)", letterSpacing: "-0.035em" }}>&ldquo;✅ All done!&rdquo; is not proof.</h2>
          <p style={{ fontSize: 17, color: "var(--text-mid)", marginTop: 16, lineHeight: 1.55 }}>
            AI agents are confident and wrong. The agent says it&rsquo;s finished — but nobody ran it. That gap costs both of you.
          </p>
        </div>
        <div className="claim-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 40 }}>
          <div className="card" style={{ padding: 18 }}>
            <div className="mono" style={{ fontSize: 11.5, color: "var(--text-lo)", marginBottom: 12 }}>WHAT THE AGENT SAYS</div>
            <div style={{ fontSize: 14.5, color: "var(--text-hi)" }}>✅ All done! Implemented idempotency keys, added tests, everything passes. 🎉</div>
            <div className="mono" style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 8 }}>— self-reported · never executed</div>
          </div>
          <div className="card" style={{ padding: 18, borderColor: "var(--green-line)", background: "linear-gradient(180deg, var(--green-soft), transparent)" }}>
            <div className="mono" style={{ fontSize: 11.5, color: "var(--green-400)", marginBottom: 12 }}>WHAT CODECEIPT RUNS</div>
            <div className="mono" style={{ fontSize: 12.5, lineHeight: 1.7 }}>
              <div style={{ color: "var(--text-hi)" }}>$ pnpm test webhook/idempotency.spec.ts</div>
              <div style={{ color: "var(--green-300)" }}>  ✓ 14 passed (14)</div>
              <div style={{ color: "var(--text-hi)" }}>$ pnpm tsc --noEmit</div>
              <div style={{ color: "var(--green-300)" }}>  → 0 errors</div>
              <div style={{ color: "var(--text-lo)" }}>verdict signed → VERIFIED</div>
            </div>
          </div>
        </div>
        <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          {stats.map((s) => (
            <div key={s.l} style={{ background: "var(--bg-1)", padding: "24px 20px" }}>
              <div style={{ fontSize: "clamp(26px,4vw,34px)", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--text-hi)" }}>
                <CountUp to={s.to} decimals={s.dec ?? 0} suffix={s.suf} sep={false} />
              </div>
              <div style={{ fontSize: 13, color: "var(--text-mid)", marginTop: 6, lineHeight: 1.4 }}>{s.l}</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 10 }}>{s.src}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks({ onVerify }: { onVerify: () => void }) {
  const steps = [
    { n: "1", t: "Paste a PR URL", d: "Drop in a GitHub or GitLab pull request — or add the Codeceipt Action to your repo.", tag: "input" },
    { n: "2", t: "Codeceipt executes it", d: "We run the declared checks ourselves against the diff and the checked-out tree — never the agent’s summary.", tag: "execution, not self-report" },
    { n: "3", t: "Share the Receipt", d: "Get a public link with a verdict your client can re-run themselves. One URL, independently checkable.", tag: "public proof" },
  ];
  return (
    <section id="how" className="section" style={{ background: "var(--bg-1)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="wrap">
        <div style={{ maxWidth: 640, marginBottom: 46 }}>
          <Eyebrow icon="bolt">How it works</Eyebrow>
          <h2 style={{ fontSize: "clamp(28px,4.6vw,42px)", letterSpacing: "-0.035em" }}>From pull request to proof in three steps.</h2>
          <p style={{ fontSize: 17, color: "var(--text-mid)", marginTop: 16, lineHeight: 1.55 }}>
            The middle step is the whole point: <strong style={{ color: "var(--text-hi)" }}>execution, not self-report.</strong>
          </p>
        </div>
        <div className="how-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {steps.map((s, i) => (
            <div key={s.n} className="card card-2" style={{ padding: 22, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ width: 34, height: 34, borderRadius: 9, background: i === 1 ? "var(--green-soft)" : "var(--bg-3)", border: `1px solid ${i === 1 ? "var(--green-line)" : "var(--border)"}`, color: i === 1 ? "var(--green-400)" : "var(--text-mid)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontFamily: "var(--mono)", fontSize: 14 }}>{s.n}</span>
                <span className="mono" style={{ fontSize: 10.5, color: i === 1 ? "var(--green-400)" : "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.04em", padding: "3px 8px", borderRadius: 99, border: `1px solid ${i === 1 ? "var(--green-line)" : "var(--border)"}` }}>{s.tag}</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{s.t}</h3>
              <p style={{ fontSize: 13.5, color: "var(--text-mid)", lineHeight: 1.5, flex: 1 }}>{s.d}</p>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
          <button className="btn btn-primary btn-lg" onClick={onVerify}><Ic.bolt s={16} /> Verify your first PR</button>
        </div>
      </div>
    </section>
  );
}

function Showcase({ onReceipt }: { onReceipt: (id: string) => void }) {
  const [liveId, setLiveId] = useState(SAMPLE_IDS.verified);
  const callouts = [
    { i: "01", icon: "shield", t: "Verdict badge", d: "The one thing your client reads. Plain language, dominant." },
    { i: "02", icon: "check", t: "Per-criterion checks", d: "Every claim → real executed evidence. Expandable, not a single stamp." },
    { i: "03", icon: "refresh", t: "Re-verify button", d: "Anyone re-runs it and gets the same fingerprint. You can’t fake it." },
    { i: "04", icon: "receipt", t: "Cost ledger", d: "Transparent compute & token cost. A literal receipt." },
  ];
  return (
    <section id="receipt" className="section" style={{ position: "relative", overflow: "hidden" }}>
      <div className="glow-green" style={{ top: "20%", left: "-8%", width: 420, height: 420, opacity: 0.32 }} />
      <div className="wrap" style={{ position: "relative" }}>
        <div style={{ maxWidth: 660, marginBottom: 46 }}>
          <Eyebrow icon="receipt">The Receipt</Eyebrow>
          <h2 style={{ fontSize: "clamp(28px,4.6vw,42px)", letterSpacing: "-0.035em" }}>This is what your client receives.</h2>
          <p style={{ fontSize: 17, color: "var(--text-mid)", marginTop: 16, lineHeight: 1.55, maxWidth: 560 }}>
            One link. They can re-run it themselves. Every line is backed by a real execution.
          </p>
        </div>
        <div className="two-aud" style={{ display: "grid", gridTemplateColumns: "1fr 0.95fr", gap: 48, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {callouts.map((c) => {
              const I = Ic[c.icon];
              return (
                <div key={c.i} style={{ display: "flex", gap: 15, padding: "15px 0", borderTop: "1px solid var(--border)" }}>
                  <span style={{ width: 38, height: 38, flex: "none", borderRadius: 10, background: "var(--bg-2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green-400)" }}><I s={18} /></span>
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
                      <span className="mono" style={{ fontSize: 11, color: "var(--text-dim)" }}>{c.i}</span>
                      <span style={{ fontSize: 15, fontWeight: 600 }}>{c.t}</span>
                    </div>
                    <p style={{ fontSize: 13.5, color: "var(--text-mid)", marginTop: 3, lineHeight: 1.45 }}>{c.d}</p>
                  </div>
                </div>
              );
            })}
            <button className="btn btn-primary" onClick={() => onReceipt(liveId)} style={{ alignSelf: "flex-start", marginTop: 22 }}>
              Open live example <Ic.arrowUpRight s={16} />
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <LiveVerifyCard data={getSampleReceipt(liveId)!} onOpen={() => onReceipt(liveId)} onSwitch={setLiveId} activeId={liveId} />
          </div>
        </div>
      </div>
    </section>
  );
}

function TwoAudience() {
  const [tab, setTab] = useState(0);
  const data = [
    { k: "For freelancers & agencies", pts: [["Prove it isn’t slop", "Hand over an executed receipt instead of “trust me.”"], ["Close deals faster", "Independent proof removes the back-and-forth on quality."], ["Charge more", "Verified delivery is a premium signal competitors can’t copy."], ["Stand out", "Embed a verified badge in every PR and README."]] },
    { k: "For clients", pts: [["Judge without reading code", "A plain-language verdict you actually understand."], ["Proof you can check", "Re-run the verification yourself — no need to trust the vendor."], ["Independently verifiable", "The engine is open-source; you don’t even have to trust Codeceipt."], ["Honest by design", "FAILED verdicts are public too. No cherry-picking."]] },
  ];
  return (
    <section className="section" style={{ background: "var(--bg-1)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="wrap">
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Eyebrow>Two sides, one receipt</Eyebrow>
          <h2 style={{ fontSize: "clamp(26px,4.4vw,38px)", letterSpacing: "-0.035em" }}>It works because both sides win.</h2>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-flex", gap: 4, padding: 4, background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 11 }}>
            {data.map((d, i) => (
              <button key={i} onClick={() => setTab(i)} className="btn btn-sm" style={{ background: tab === i ? "var(--bg-3)" : "transparent", color: tab === i ? "var(--text-hi)" : "var(--text-mid)", border: tab === i ? "1px solid var(--border-strong)" : "1px solid transparent", height: 36 }}>{d.k}</button>
            ))}
          </div>
        </div>
        <div className="claim-grid fade-up" key={tab} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 880, margin: "0 auto" }}>
          {data[tab].pts.map((p, i) => (
            <div key={i} className="card" style={{ padding: 20, display: "flex", gap: 13 }}>
              <span style={{ width: 30, height: 30, flex: "none", borderRadius: 8, background: "var(--green-soft)", border: "1px solid var(--green-line)", color: "var(--green-400)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic.check s={16} w={3} /></span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{p[0]}</div>
                <p style={{ fontSize: 13.5, color: "var(--text-mid)", lineHeight: 1.45 }}>{p[1]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OpenSource() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="two-aud" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <Eyebrow icon="github">Trust architecture</Eyebrow>
            <h2 style={{ fontSize: "clamp(26px,4.4vw,38px)", letterSpacing: "-0.035em" }}>We don&rsquo;t ask you to trust us.</h2>
            <p style={{ fontSize: 17, color: "var(--text-mid)", marginTop: 16, lineHeight: 1.55 }}>
              The engine is <strong style={{ color: "var(--text-hi)" }}>Apache-2.0</strong>. Anyone — including your client — can inspect exactly how a verdict is produced. We give you something you can verify <em>without</em> us.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
              {["Read the execution engine line by line", "Re-run any receipt on your own machine", "Machine-checkable JSON + SVG artifacts"].map((t) => (
                <div key={t} style={{ display: "flex", gap: 11, alignItems: "center", fontSize: 14.5, color: "var(--text-mid)" }}>
                  <Ic.check s={17} style={{ color: "var(--green-400)", flex: "none" }} /> {t}
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
              <Ic.github s={22} />
              <div style={{ flex: 1 }}>
                <div className="mono" style={{ fontSize: 13.5, color: "var(--text-hi)" }}>codeceipt/engine</div>
                <div style={{ fontSize: 12, color: "var(--text-lo)" }}>Deterministic PR verification engine</div>
              </div>
              <span className="chip"><Ic.shield s={12} /> Apache-2.0</span>
            </div>
            <div style={{ padding: 18 }}>
              <p style={{ fontSize: 13.5, color: "var(--text-mid)", lineHeight: 1.5, marginBottom: 16 }}>
                Clone it, audit it, run it in CI. The verdict on every receipt comes from this code — nothing hidden.
              </p>
              <button className="btn btn-ghost" style={{ width: "100%" }}><Ic.github s={16} /> View the engine on GitHub <Ic.arrowUpRight s={15} /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing({ onVerify }: { onVerify: () => void }) {
  const plans = [
    { name: "Free", price: "$0", unit: "forever", desc: "For solo devs proving public work.", feats: ["Engine, self-hosted (Apache-2.0)", "Public PR receipts", "Re-verify + public URL", "README badge"], cta: "Start free", hot: false },
    { name: "Pro", price: "$19", unit: "/ month", desc: "For freelancers shipping to clients.", feats: ["Everything in Free", "Hosted receipts + history", "Private repos (GitHub OAuth)", "PDF export + branding", "GitHub Action"], cta: "Start Pro trial", hot: true },
    { name: "Team", price: "$59", unit: "/ month", desc: "For agencies with many clients.", feats: ["Everything in Pro", "Org-wide receipts", "Agency branding", "Priority execution", "SSO + audit log"], cta: "Talk to us", hot: false },
  ];
  return (
    <section id="pricing" className="section">
      <div className="wrap">
        <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 44px" }}>
          <Eyebrow>Pricing</Eyebrow>
          <h2 style={{ fontSize: "clamp(28px,4.6vw,42px)", letterSpacing: "-0.035em" }}>Engine free forever.</h2>
          <p style={{ fontSize: 16.5, color: "var(--text-mid)", marginTop: 14, lineHeight: 1.5 }}>
            The engine is Apache-2.0 — free forever. You pay for hosted receipts and the Action.
          </p>
        </div>
        <div className="price-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, alignItems: "start" }}>
          {plans.map((p) => (
            <div key={p.name} className="card" style={{ padding: 26, position: "relative", borderColor: p.hot ? "var(--green-line)" : "var(--border)", background: p.hot ? "linear-gradient(180deg, var(--green-soft), var(--bg-1) 60%)" : "var(--bg-1)", boxShadow: p.hot ? "0 20px 60px rgba(74,222,128,0.10)" : "none", transform: p.hot ? "translateY(-8px)" : "none" }}>
              {p.hot && <span className="chip chip-green" style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", height: 26 }}>Most popular</span>}
              <div style={{ fontSize: 14, fontWeight: 600, color: p.hot ? "var(--green-400)" : "var(--text-hi)" }}>{p.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "12px 0 4px" }}>
                <span style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-0.04em" }}>{p.price}</span>
                <span style={{ fontSize: 13.5, color: "var(--text-lo)" }}>{p.unit}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-mid)", minHeight: 36 }}>{p.desc}</p>
              <button className={`btn ${p.hot ? "btn-primary" : "btn-ghost"}`} onClick={onVerify} style={{ width: "100%", margin: "18px 0" }}>{p.cta}</button>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {p.feats.map((f) => (
                  <div key={f} style={{ display: "flex", gap: 10, fontSize: 13, color: "var(--text-mid)" }}>
                    <Ic.check s={16} style={{ color: p.hot ? "var(--green-400)" : "var(--text-mid)", flex: "none", marginTop: 1 }} /> {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const qs = [
    { q: "How are you different from CodeRabbit or Greptile?", a: "They comment on code with an LLM’s opinion. Codeceipt actually executes the PR and certifies it with a public, re-runnable artifact. A review is a suggestion; a receipt is proof." },
    { q: "Can a Receipt be faked?", a: "No. Every receipt is re-verifiable and machine-checkable. Anyone can re-run the same verification and get the same fingerprint." },
    { q: "What does “verify by execution” actually mean?", a: "Instead of trusting the agent’s “✅ all done,” we check each declared criterion against the diff and run the tests/type-checks the PR claims to satisfy. The verdict reflects what actually happened." },
    { q: "Does my code leave my machine?", a: "Public PRs verify instantly. For private repos and real test execution, run the GitHub Action — code runs in your own runner and is never retained. The engine is open-source." },
    { q: "What’s free vs paid?", a: "The engine is Apache-2.0 and free forever. Paid plans add hosted receipts, history, private-repo OAuth, PDF export, and branding." },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="section" style={{ background: "var(--bg-1)", borderTop: "1px solid var(--border)" }}>
      <div className="wrap" style={{ maxWidth: 820 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Eyebrow>FAQ</Eyebrow>
          <h2 style={{ fontSize: "clamp(26px,4.4vw,38px)", letterSpacing: "-0.035em" }}>Questions, answered honestly.</h2>
        </div>
        <div className="card" style={{ overflow: "hidden" }}>
          {qs.map((x, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{ borderTop: i ? "1px solid var(--border)" : "none" }}>
                <button onClick={() => setOpen(isOpen ? -1 : i)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 16, padding: "19px 22px", textAlign: "left" }}>
                  <span style={{ flex: 1, fontSize: 15.5, fontWeight: 500, color: "var(--text-hi)" }}>{x.q}</span>
                  <span style={{ width: 26, height: 26, flex: "none", borderRadius: 7, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: isOpen ? "var(--green-400)" : "var(--text-lo)", transform: isOpen ? "rotate(180deg)" : "none", transition: "all .2s" }}><Ic.chevron s={15} /></span>
                </button>
                {isOpen && <p className="fade-up" style={{ padding: "0 60px 22px 22px", fontSize: 14.5, color: "var(--text-mid)", lineHeight: 1.6 }}>{x.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ onVerify }: { onVerify: () => void }) {
  return (
    <section className="section" style={{ position: "relative", overflow: "hidden", textAlign: "center" }}>
      <div className="grid-bg" style={{ maskImage: "radial-gradient(ellipse 70% 80% at 50% 50%, #000 20%, transparent 70%)" }} />
      <div className="glow-green" style={{ top: "10%", left: "50%", width: 560, height: 380, transform: "translateX(-50%)", opacity: 0.45 }} />
      <div className="wrap" style={{ position: "relative" }}>
        <h2 style={{ fontSize: "clamp(32px,6vw,58px)", letterSpacing: "-0.045em", fontWeight: 600, lineHeight: 1.02, maxWidth: 820, margin: "0 auto" }}>
          Stop sending &ldquo;trust me.&rdquo;<br /><span style={{ color: "var(--green-400)" }}>Start sending a Receipt.</span>
        </h2>
        <p style={{ fontSize: 18, color: "var(--text-mid)", margin: "22px auto 0", maxWidth: 520 }}>
          Verify your first pull request in under three minutes. Public PRs are free.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
          <button className="btn btn-primary btn-lg" onClick={onVerify}><Ic.bolt s={18} /> Verify your first PR</button>
          <button className="btn btn-ghost btn-lg"><Ic.github s={17} /> Read the engine</button>
        </div>
      </div>
    </section>
  );
}

/* ---------- app shell ---------- */
export function Landing() {
  const router = useRouter();
  const [view, setView] = useState<"landing" | "paste">("landing");
  const onReceipt = (id: string) => router.push(`/r/${id}`);
  const onVerify = () => {
    setView("paste");
    window.scrollTo({ top: 0 });
  };

  if (view === "paste") {
    return (
      <>
        <Nav onVerify={onVerify} />
        <PasteView onBack={() => setView("landing")} />
      </>
    );
  }

  return (
    <>
      <Nav onVerify={onVerify} />
      <main>
        <Hero onVerify={onVerify} onReceipt={onReceipt} />
        <Problem />
        <HowItWorks onVerify={onVerify} />
        <Showcase onReceipt={onReceipt} />
        <TwoAudience />
        <OpenSource />
        <Pricing onVerify={onVerify} />
        <FAQ />
        <FinalCTA onVerify={onVerify} />
        <Footer />
      </main>
    </>
  );
}
