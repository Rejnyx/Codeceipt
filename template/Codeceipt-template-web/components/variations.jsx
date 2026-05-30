/* ============================================================
   Codeceipt — Variation components for the design canvas
   Hero variants A/B/C  +  Receipt card variants A/B/C
   ============================================================ */

function vMeta(v) { return window.verdictMeta(v); }

/* ============================================================
   HERO VARIANTS
   ============================================================ */

/* A — Split: text + receipt (the shipped direction) */
function HeroSplit({ sample }) {
  return (
    <div style={{ padding: '54px 56px', height: '100%', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', background: 'var(--bg-0)' }}>
      <div className="grid-bg" />
      <div className="glow-green" style={{ top: -60, right: '4%', width: 360, height: 300, opacity: 0.5 }} />
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 44, alignItems: 'center', width: '100%' }}>
        <div>
          <span className="chip chip-green" style={{ marginBottom: 20 }}><Ic.github s={13} /> Open-source engine · Apache 2.0</span>
          <h1 style={{ fontSize: 58, lineHeight: 0.98, letterSpacing: '-0.045em', fontWeight: 600 }}>
            Ship AI code.<br /><span style={{ color: 'var(--text-lo)' }}>Not AI&nbsp;</span><span style={{ color: 'var(--green-400)' }}>slop.</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-mid)', lineHeight: 1.55, marginTop: 22, maxWidth: 470 }}>
            Codeceipt <strong style={{ color: 'var(--text-hi)' }}>runs</strong> your AI pull request and hands your client a <strong style={{ color: 'var(--text-hi)' }}>public receipt they can re-check themselves</strong>.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            <span className="btn btn-primary btn-lg"><Ic.bolt s={17} /> Verify a PR</span>
            <span className="btn btn-ghost btn-lg"><Ic.receipt s={17} /> See a live Receipt</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}><ReceiptStub data={sample} /></div>
      </div>
    </div>
  );
}

/* B — Centered: headline + inline paste box, badge row */
function HeroCentered({ sample }) {
  return (
    <div style={{ padding: '60px 56px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden', background: 'var(--bg-0)' }}>
      <div className="grid-bg" style={{ maskImage: 'radial-gradient(ellipse 70% 70% at 50% 35%, #000 20%, transparent 70%)' }} />
      <div className="glow-green" style={{ top: '4%', left: '50%', width: 480, height: 300, transform: 'translateX(-50%)', opacity: 0.5 }} />
      <div style={{ position: 'relative', maxWidth: 720 }}>
        <span className="chip chip-green" style={{ marginBottom: 22 }}><Ic.bolt s={13} /> Verify by execution, not self-report</span>
        <h1 style={{ fontSize: 60, lineHeight: 0.98, letterSpacing: '-0.045em', fontWeight: 600 }}>
          Ship AI code. <span style={{ color: 'var(--green-400)' }}>Not AI slop.</span>
        </h1>
        <p style={{ fontSize: 18.5, color: 'var(--text-mid)', lineHeight: 1.5, margin: '20px auto 32px', maxWidth: 540 }}>
          Run your AI pull request, prove it actually works, and send a receipt the client can verify without you.
        </p>
        {/* inline paste */}
        <div style={{ display: 'flex', gap: 8, padding: 7, background: 'var(--bg-2)', border: '1px solid var(--border-strong)', borderRadius: 14, maxWidth: 520, margin: '0 auto', boxShadow: 'var(--shadow-md)' }}>
          <span style={{ display: 'flex', alignItems: 'center', paddingLeft: 8, color: 'var(--text-lo)' }}><Ic.github s={18} /></span>
          <span className="mono" style={{ flex: 1, textAlign: 'left', alignSelf: 'center', fontSize: 14, color: 'var(--text-lo)' }}>github.com/acme/checkout/pull/482</span>
          <span className="btn btn-primary"><Ic.bolt s={16} /> Verify</span>
        </div>
        <div style={{ display: 'flex', gap: 18, justifyContent: 'center', marginTop: 18, fontSize: 13, color: 'var(--text-lo)' }}>
          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Ic.lock s={13} /> Public PRs instant</span>
          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Ic.star s={13} style={{ color: '#E3B341' }} /> 2.4k stars</span>
          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Ic.shield s={13} /> Apache-2.0</span>
        </div>
      </div>
    </div>
  );
}

/* C — Terminal-forward: execution panel as the hero visual */
function HeroTerminal({ sample }) {
  const m = vMeta('VERIFIED');
  return (
    <div style={{ padding: '52px 56px', height: '100%', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', background: 'var(--bg-1)' }}>
      <div className="glow-green" style={{ bottom: -80, left: '20%', width: 420, height: 300, opacity: 0.4 }} />
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 44, alignItems: 'center', width: '100%' }}>
        <div>
          <span className="chip chip-green" style={{ marginBottom: 20 }}><span className="dot dot-pass" /> Deterministic execution engine</span>
          <h1 style={{ fontSize: 52, lineHeight: 1.0, letterSpacing: '-0.045em', fontWeight: 600 }}>
            We don&rsquo;t read the PR.<br /><span style={{ color: 'var(--green-400)' }}>We run it.</span>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--text-mid)', lineHeight: 1.55, marginTop: 20, maxWidth: 420 }}>
            Every claimed criterion, executed in a clean sandbox. The verdict is a fact, not an opinion.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 26 }}>
            <span className="btn btn-primary btn-lg"><Ic.bolt s={17} /> Verify a PR</span>
            <span className="btn btn-ghost btn-lg"><Ic.github s={16} /> Read the engine</span>
          </div>
        </div>
        {/* terminal */}
        <div className="card" style={{ overflow: 'hidden', background: 'var(--bg-0)', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ display: 'flex', gap: 5 }}><span className="dot" style={{ background: '#ff5f57' }} /><span className="dot" style={{ background: '#febc2e' }} /><span className="dot" style={{ background: '#28c840' }} /></span>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-lo)', marginLeft: 4 }}>codeceipt · sandbox</span>
          </div>
          <div className="mono" style={{ padding: '16px 16px', fontSize: 13, lineHeight: 1.85 }}>
            <div style={{ color: 'var(--text-hi)' }}>$ codeceipt verify acme/checkout#482</div>
            <div style={{ color: 'var(--text-lo)' }}>→ cloning · restoring cache (412MB)</div>
            <div style={{ color: 'var(--text-lo)' }}>→ extracted 8 claimed criteria</div>
            <div style={{ color: 'var(--green-300)' }}>✓ webhook/idempotency.spec.ts — 14 passed</div>
            <div style={{ color: 'var(--green-300)' }}>✓ no-double-charge.spec.ts — 6 passed</div>
            <div style={{ color: 'var(--green-300)' }}>✓ tsc --noEmit — 0 errors</div>
            <div style={{ color: 'var(--green-300)' }}>✓ bench webhook — p95 96ms</div>
            <div style={{ marginTop: 8, color: m.color, fontWeight: 600 }}>● VERIFIED — 8/8 · signed cc1:8f3a2e9d <span className="caret">█</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   RECEIPT CARD VARIANTS
   ============================================================ */

/* A — uses the shipped ReceiptStub (document/perforated) */
function ReceiptVarDoc({ data }) {
  return <div style={{ padding: '34px 30px', display: 'flex', justifyContent: 'center', background: 'var(--bg-0)' }}><ReceiptStub data={data} /></div>;
}

/* B — Dashboard: verdict header + criteria grid */
function ReceiptVarDashboard({ data }) {
  const m = vMeta(data.verdict); const VIcon = Ic[m.icon];
  const pct = Math.round(data.claimsMet / data.claimsTotal * 100);
  return (
    <div style={{ padding: '30px 26px', background: 'var(--bg-0)' }}>
      <div className="card" style={{ overflow: 'hidden', borderColor: m.line, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', background: m.bg, borderBottom: `1px solid ${m.line}` }}>
          <span style={{ width: 46, height: 46, borderRadius: 11, background: 'var(--bg-0)', border: `1.5px solid ${m.line}`, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><VIcon s={24} w={3} /></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: m.color, letterSpacing: '-0.02em' }}>{data.verdict}</div>
            <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-mid)' }}>{data.claimsMet}/{data.claimsTotal} criteria · {pct}%</div>
          </div>
          <span className="chip" style={{ background: 'var(--bg-0)' }}><Ic.refresh s={12} /> re-verify</span>
        </div>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="mono" style={{ fontSize: 12.5, color: 'var(--text-hi)' }}>{data.pr.repo} <span style={{ color: m.color }}>#{data.pr.number}</span></div>
          <div style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 2 }}>{data.pr.title}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--border)' }}>
          {data.criteria.slice(0, 6).map(c => (
            <div key={c.id} style={{ background: 'var(--bg-1)', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 9 }}>
              <StatusIcon status={c.status} s={14} />
              <span style={{ fontSize: 11.5, color: 'var(--text-mid)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: 'var(--bg-0)', borderTop: '1px solid var(--border)' }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-lo)' }}>{data.fingerprint}</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-lo)' }}>${data.cost.usd}</span>
        </div>
      </div>
    </div>
  );
}

/* C — Minimal badge card (Linear-clean) */
function ReceiptVarMinimal({ data }) {
  const m = vMeta(data.verdict); const VIcon = Ic[m.icon];
  const pct = Math.round(data.claimsMet / data.claimsTotal * 100);
  return (
    <div style={{ padding: '40px 34px', background: 'var(--bg-1)', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: 360, padding: 26, background: 'var(--bg-0)', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Ic.logo s={18} /><span style={{ fontSize: 13, fontWeight: 600 }}>Codeceipt</span></span>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-dim)' }}>r/{data.id.slice(5,13)}</span>
        </div>
        <div style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: '50%', background: m.bg, border: `1.5px solid ${m.line}`, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><VIcon s={32} w={3} /></div>
        <div style={{ fontSize: 28, fontWeight: 700, color: m.color, letterSpacing: '-0.03em' }}>{data.verdict}</div>
        <div className="mono" style={{ fontSize: 12, color: 'var(--text-lo)', marginTop: 4 }}>{data.claimsMet} of {data.claimsTotal} criteria reproduced</div>
        <div style={{ height: 5, borderRadius: 99, background: 'var(--bg-3)', overflow: 'hidden', margin: '18px 0' }}>
          <div style={{ width: pct + '%', height: '100%', background: m.color, boxShadow: `0 0 10px ${m.color}` }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', margin: '4px 0 18px' }}>
          <Ic.fingerprint s={15} style={{ color: m.color }} />
          <span className="mono" style={{ fontSize: 12, color: 'var(--text-mid)' }}>{data.fingerprint}</span>
        </div>
        <span className="btn btn-primary" style={{ width: '100%' }}><Ic.refresh s={15} /> Run this verification again</span>
      </div>
    </div>
  );
}

Object.assign(window, { HeroSplit, HeroCentered, HeroTerminal, ReceiptVarDoc, ReceiptVarDashboard, ReceiptVarMinimal });
