/* ============================================================
   Codeceipt — Landing sections A: Hero, Trust, Problem, How
   ============================================================ */

function Eyebrow({ children, icon }) {
  const I = icon ? Ic[icon] : null;
  return (
    <span className="chip chip-green" style={{ marginBottom: 22 }}>
      {I ? <I s={13} /> : <span className="dot dot-pass" />} {children}
    </span>
  );
}

/* ---------- HERO ---------- */
function Hero({ onVerify, onReceipt, sample }) {
  const R = window.RECEIPTS;
  const [liveId, setLiveId] = React.useState(R._verified);
  const glowRef = React.useRef(null);
  window.useCursorGlow(glowRef);
  const liveData = R[liveId];
  return (
    <section id="top" ref={glowRef} className="section cursor-glow" style={{ paddingTop: 64, paddingBottom: 72, position: 'relative', overflow: 'hidden' }}>
      <div className="grid-bg" />
      <div className="glow-green" style={{ top: -80, right: '6%', width: 480, height: 360, opacity: 0.5 }} />
      <div className="wrap" style={{ position: 'relative' }}>
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.08fr 0.92fr', gap: 56, alignItems: 'center' }}>
          {/* left */}
          <div className="fade-up">
            <h1 style={{ fontSize: 'clamp(40px, 7vw, 68px)', lineHeight: 0.98, letterSpacing: '-0.045em', fontWeight: 600 }}>
              Ship AI code.<br /><span style={{ color: 'var(--text-lo)' }}>Not AI&nbsp;</span><span style={{ color: 'var(--green-400)' }}>slop.</span>
            </h1>
            <p style={{ fontSize: 'clamp(16px, 2.4vw, 19px)', color: 'var(--text-mid)', lineHeight: 1.55, marginTop: 24, maxWidth: 520 }}>
              Codeceipt <strong style={{ color: 'var(--text-hi)', fontWeight: 600 }}>runs</strong> your AI pull request, verifies it actually did what it claims, and gives your client a <strong style={{ color: 'var(--text-hi)', fontWeight: 600 }}>public receipt they can check themselves</strong>.
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-lo)', marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Ic.bolt s={15} style={{ color: 'var(--green-400)' }} /> Verification by execution — not the agent&rsquo;s opinion of itself.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 30 }}>
              <button className="btn btn-primary btn-lg" onClick={onVerify}><Ic.bolt s={17} /> Verify a PR</button>
              <button className="btn btn-ghost btn-lg" onClick={() => onReceipt(liveId)}><Ic.receipt s={17} /> See a live Receipt</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 26, color: 'var(--text-lo)', fontSize: 12.5, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Ic.github s={14} /> GitHub</span>
              <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Ic.gitlab s={14} /> GitLab</span>
              <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Ic.lock s={13} /> Code never leaves the sandbox</span>
            </div>
          </div>
          {/* right — the receipt verifying itself, live + switchable */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <LiveVerifyCard data={liveData} onOpen={() => onReceipt(liveId)} onSwitch={setLiveId} activeId={liveId} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- TRUST BLOCK ---------- */
function TrustBlock() {
  return (
    <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-1)' }}>
      <div className="wrap" style={{ padding: '34px 24px' }}>
        <div className="trust-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: 28, alignItems: 'center' }}>
          <p style={{ fontSize: 16, color: 'var(--text-mid)', lineHeight: 1.5, letterSpacing: '-0.01em' }}>
            Built on a <strong style={{ color: 'var(--text-hi)' }}>deterministic execution engine</strong> — not an LLM&rsquo;s opinion of itself.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderLeft: '1px solid var(--border)', paddingLeft: 22 }}>
            <span style={{ fontSize: 22, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7 }}><Ic.star s={16} style={{ color: '#E3B341' }} /> <CountUp to={2431} /></span>
            <span style={{ fontSize: 12.5, color: 'var(--text-lo)' }}>GitHub stars on the engine</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderLeft: '1px solid var(--border)', paddingLeft: 22 }}>
            <span style={{ fontSize: 12.5, color: 'var(--text-lo)' }}>Verified-by-Codeceipt preview</span>
            <span style={{ display: 'inline-flex', alignSelf: 'flex-start', height: 26, borderRadius: 6, overflow: 'hidden', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', background: '#24262b', color: '#cfd3d8' }}>codeceipt</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px', background: 'var(--green-400)', color: '#06230f' }}><Ic.check s={10} w={3.4} /> verified</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- PROBLEM (the slop tax) ---------- */
function Problem() {
  const stats = [
    { to: 2.74, dec: 2, suf: '×', l: 'more vulnerabilities in AI-written code', src: 'Veracode, 2025' },
    { to: 45, suf: '%', l: 'of AI code fails secure-coding benchmarks', src: 'Veracode' },
    { to: 10, suf: '×', l: 'spike in security findings since AI adoption', src: 'Apiiro' },
    { to: 96, suf: '%', l: 'of devs don\u2019t fully trust AI output', src: 'Stack Overflow' },
  ];
  return (
    <section className="section" style={{ position: 'relative' }}>
      <div className="wrap">
        <div style={{ maxWidth: 640, marginBottom: 44 }}>
          <Eyebrow>The slop tax</Eyebrow>
          <h2 style={{ fontSize: 'clamp(28px,4.6vw,42px)', letterSpacing: '-0.035em' }}>&ldquo;✅ All done!&rdquo; is not proof.</h2>
          <p style={{ fontSize: 17, color: 'var(--text-mid)', marginTop: 16, lineHeight: 1.55 }}>
            AI agents are confident and wrong. The agent says it&rsquo;s finished — but nobody ran it. That gap costs both of you.
          </p>
        </div>

        {/* agent claim vs real result */}
        <div className="claim-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
          <div className="card" style={{ padding: 18, background: 'var(--bg-1)' }}>
            <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-lo)', marginBottom: 12 }}>WHAT THE AGENT SAYS</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
              <span style={{ fontSize: 19 }}>✅</span>
              <div>
                <div style={{ fontSize: 14.5, color: 'var(--text-hi)' }}>All done! Implemented idempotency keys, added tests, everything passes. 🎉</div>
                <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 8 }}>— self-reported · never executed</div>
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: 18, borderColor: 'var(--green-line)', background: 'linear-gradient(180deg, var(--green-soft), transparent)' }}>
            <div className="mono" style={{ fontSize: 11.5, color: 'var(--green-400)', marginBottom: 12 }}>WHAT CODECEIPT RUNS</div>
            <div className="mono" style={{ fontSize: 12.5, lineHeight: 1.7 }}>
              <div style={{ color: 'var(--text-hi)' }}>$ pnpm test webhook/idempotency.spec.ts</div>
              <div style={{ color: 'var(--green-300)' }}>  ✓ 14 passed (14)</div>
              <div style={{ color: 'var(--text-hi)' }}>$ pnpm tsc --noEmit</div>
              <div style={{ color: 'var(--green-300)' }}>  → 0 errors</div>
              <div style={{ color: 'var(--text-lo)' }}>verdict signed → VERIFIED</div>
            </div>
          </div>
        </div>

        {/* two pains */}
        <div className="pain-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 44 }}>
          <PainCard title="For the freelancer" pains={[
            'You shipped real work — but &ldquo;trust me, it works&rdquo; sounds like everyone else.',
            'No way to prove your AI-assisted code isn\u2019t slop.',
            'Deals stall while the client second-guesses quality.',
          ]} />
          <PainCard title="For the client" pains={[
            'You can\u2019t read the code, so you can\u2019t judge it.',
            'You\u2019ve been burned by &ldquo;done&rdquo; that wasn\u2019t.',
            'You want proof you can check without trusting the vendor.',
          ]} />
        </div>

        {/* stats */}
        <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          {stats.map(s => (
            <div key={s.l} style={{ background: 'var(--bg-1)', padding: '24px 20px' }}>
              <div style={{ fontSize: 'clamp(26px,4vw,34px)', fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-hi)' }}>
                <CountUp to={s.to} decimals={s.dec || 0} suffix={s.suf} sep={false} />
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 6, lineHeight: 1.4 }}>{s.l}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 10 }}>{s.src}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PainCard({ title, pains }) {
  return (
    <div className="card" style={{ padding: '22px 22px 8px' }}>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>{title}</div>
      {pains.map((p, i) => (
        <div key={i} style={{ display: 'flex', gap: 11, padding: '11px 0', borderTop: '1px solid var(--border-faint)' }}>
          <Ic.x s={16} style={{ color: 'var(--fail)', flex: 'none', marginTop: 2 }} />
          <span style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.45 }} dangerouslySetInnerHTML={{ __html: p }} />
        </div>
      ))}
    </div>
  );
}

/* ---------- HOW IT WORKS ---------- */
function HowItWorks({ onVerify }) {
  const steps = [
    { n: '1', t: 'Paste a PR URL', d: 'Drop in a GitHub or GitLab pull request — or add the Codeceipt Action to your repo.', tag: 'input' },
    { n: '2', t: 'Codeceipt executes it', d: 'We clone, install, and run the code in an isolated sandbox. We run the checks ourselves — never the agent\u2019s summary.', tag: 'execution, not self-report' },
    { n: '3', t: 'Share the Receipt', d: 'Get a public link with a verdict your client can re-run themselves. One URL, independently checkable.', tag: 'public proof' },
  ];
  return (
    <section id="how" className="section" style={{ background: 'var(--bg-1)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="wrap">
        <div style={{ maxWidth: 640, marginBottom: 46 }}>
          <Eyebrow icon="bolt">How it works</Eyebrow>
          <h2 style={{ fontSize: 'clamp(28px,4.6vw,42px)', letterSpacing: '-0.035em' }}>From pull request to proof in three steps.</h2>
          <p style={{ fontSize: 17, color: 'var(--text-mid)', marginTop: 16, lineHeight: 1.55 }}>
            The middle step is the whole point: <strong style={{ color: 'var(--text-hi)' }}>execution, not self-report.</strong>
          </p>
        </div>
        <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {steps.map((s, i) => (
            <div key={s.n} className="card-2 card" style={{ padding: 22, position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ width: 34, height: 34, borderRadius: 9, background: i===1?'var(--green-soft)':'var(--bg-3)', border: `1px solid ${i===1?'var(--green-line)':'var(--border)'}`, color: i===1?'var(--green-400)':'var(--text-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontFamily: 'var(--mono)', fontSize: 14 }}>{s.n}</span>
                <span className="mono" style={{ fontSize: 10.5, color: i===1?'var(--green-400)':'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '3px 8px', borderRadius: 99, border: `1px solid ${i===1?'var(--green-line)':'var(--border)'}` }}>{s.tag}</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{s.t}</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-mid)', lineHeight: 1.5, flex: 1 }}>{s.d}</p>
              {i === 1 && (
                <div className="mono" style={{ marginTop: 16, background: 'var(--bg-0)', border: '1px solid var(--border)', borderRadius: 9, padding: '10px 12px', fontSize: 11.5, lineHeight: 1.7 }}>
                  <div style={{ color: 'var(--text-lo)' }}>▶ executing in sandbox…</div>
                  <div style={{ color: 'var(--green-300)' }}>✓ 14 passed · 0 errors</div>
                </div>
              )}
              {i === 2 && (
                <div style={{ marginTop: 16 }}>
                  <span style={{ display: 'inline-flex', height: 24, borderRadius: 6, overflow: 'hidden', fontFamily: 'var(--mono)', fontSize: 10.5, fontWeight: 600 }}>
                    <span style={{ display: 'flex', alignItems: 'center', padding: '0 7px', background: '#24262b', color: '#cfd3d8' }}>receipt</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 7px', background: 'var(--green-400)', color: '#06230f' }}><Ic.check s={9} w={3.6} /> verified</span>
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
          <button className="btn btn-primary btn-lg" onClick={onVerify}><Ic.bolt s={16} /> Verify your first PR</button>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Hero, TrustBlock, Problem, HowItWorks, Eyebrow });
