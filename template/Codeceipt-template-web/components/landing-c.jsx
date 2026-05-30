/* ============================================================
   Codeceipt — Landing sections C: Pricing, FAQ, Final CTA
   ============================================================ */

/* ---------- PRICING ---------- */
function Pricing({ onVerify }) {
  const plans = [
    { name: 'Free', price: '$0', unit: 'forever', desc: 'For solo devs proving public work.',
      feats: ['Engine, self-hosted (Apache-2.0)', 'Public PR receipts', 'Re-verify + public URL', 'README badge'], cta: 'Start free', hot: false },
    { name: 'Pro', price: '$19', unit: '/ month', desc: 'For freelancers shipping to clients.',
      feats: ['Everything in Free', 'Hosted receipts + history', 'Private repos (GitHub OAuth)', 'PDF export + branding', 'GitHub Action'], cta: 'Start Pro trial', hot: true },
    { name: 'Team', price: '$59', unit: '/ month', desc: 'For agencies with many clients.',
      feats: ['Everything in Pro', 'Org-wide receipts', 'Agency branding', 'Priority execution', 'SSO + audit log'], cta: 'Talk to us', hot: false },
  ];
  return (
    <section id="pricing" className="section">
      <div className="wrap">
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 44px' }}>
          <Eyebrow>Pricing</Eyebrow>
          <h2 style={{ fontSize: 'clamp(28px,4.6vw,42px)', letterSpacing: '-0.035em' }}>Engine free forever.</h2>
          <p style={{ fontSize: 16.5, color: 'var(--text-mid)', marginTop: 14, lineHeight: 1.5 }}>
            The engine is Apache-2.0 — free forever. You pay for hosted receipts and the Action.
          </p>
        </div>
        <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'start' }}>
          {plans.map(p => (
            <div key={p.name} className="card" style={{
              padding: 26, position: 'relative',
              borderColor: p.hot ? 'var(--green-line)' : 'var(--border)',
              background: p.hot ? 'linear-gradient(180deg, var(--green-soft), var(--bg-1) 60%)' : 'var(--bg-1)',
              boxShadow: p.hot ? '0 20px 60px rgba(74,222,128,0.10)' : 'none',
              transform: p.hot ? 'translateY(-8px)' : 'none',
            }}>
              {p.hot && <span className="chip chip-green" style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', height: 26 }}>Most popular</span>}
              <div style={{ fontSize: 14, fontWeight: 600, color: p.hot ? 'var(--green-400)' : 'var(--text-hi)' }}>{p.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '12px 0 4px' }}>
                <span style={{ fontSize: 38, fontWeight: 600, letterSpacing: '-0.04em' }}>{p.price}</span>
                <span style={{ fontSize: 13.5, color: 'var(--text-lo)' }}>{p.unit}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-mid)', minHeight: 36 }}>{p.desc}</p>
              <button className={`btn ${p.hot ? 'btn-primary' : 'btn-ghost'}`} onClick={onVerify} style={{ width: '100%', margin: '18px 0' }}>{p.cta}</button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {p.feats.map(f => (
                  <div key={f} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-mid)' }}>
                    <Ic.check s={16} style={{ color: p.hot ? 'var(--green-400)' : 'var(--text-mid)', flex: 'none', marginTop: 1 }} /> {f}
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

/* ---------- FAQ ---------- */
function FAQ() {
  const qs = [
    { q: 'How are you different from CodeRabbit or Greptile?', a: 'They comment on code with an LLM\u2019s opinion. Codeceipt actually executes the PR in a clean sandbox and certifies it with a public, re-runnable artifact. A review is a suggestion; a receipt is proof.' },
    { q: 'Can a Receipt be faked?', a: 'No. Every receipt is re-verifiable, timestamped, and machine-checkable. Anyone can re-run the same verification on a clean machine and get the same verdict. The fingerprint is signed and tamper-evident.' },
    { q: 'What does &ldquo;verify by execution&rdquo; actually mean?', a: 'Instead of trusting the agent\u2019s &ldquo;✅ all done,&rdquo; we clone the repo, install dependencies, and run the tests, type-checks, and benchmarks the PR claims to satisfy — in an isolated sandbox. The verdict reflects what actually happened, not what was reported.' },
    { q: 'Does my code leave my machine? Is it private?', a: 'Public PRs verify instantly. For private repos you connect GitHub via OAuth; code runs in an ephemeral, isolated sandbox and is never retained. The engine is open-source, so you can inspect exactly what runs.' },
    { q: 'What\u2019s free vs paid?', a: 'The execution engine is Apache-2.0 and free forever — self-host it and verify public PRs. Paid plans add hosted receipts, history, private-repo OAuth, PDF export, branding, and the GitHub Action.' },
    { q: 'Which stacks and platforms are supported?', a: 'GitHub and GitLab pull/merge requests today. The engine runs any project with a standard test/build command — JS/TS, Python, Go, Rust and more, with more first-class presets shipping continuously.' },
  ];
  const [open, setOpen] = React.useState(0);
  return (
    <section id="faq" className="section" style={{ background: 'var(--bg-1)', borderTop: '1px solid var(--border)' }}>
      <div className="wrap" style={{ maxWidth: 820 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Eyebrow>FAQ</Eyebrow>
          <h2 style={{ fontSize: 'clamp(26px,4.4vw,38px)', letterSpacing: '-0.035em' }}>Questions, answered honestly.</h2>
        </div>
        <div className="card" style={{ overflow: 'hidden' }}>
          {qs.map((x, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{ borderTop: i ? '1px solid var(--border)' : 'none' }}>
                <button onClick={() => setOpen(isOpen ? -1 : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '19px 22px', textAlign: 'left' }}>
                  <span style={{ flex: 1, fontSize: 15.5, fontWeight: 500, color: 'var(--text-hi)' }} dangerouslySetInnerHTML={{ __html: x.q }} />
                  <span style={{ width: 26, height: 26, flex: 'none', borderRadius: 7, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isOpen ? 'var(--green-400)' : 'var(--text-lo)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'all .2s' }}>
                    <Ic.chevron s={15} />
                  </span>
                </button>
                {isOpen && (
                  <p className="fade-up" style={{ padding: '0 60px 22px 22px', fontSize: 14.5, color: 'var(--text-mid)', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: x.a }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- FINAL CTA ---------- */
function FinalCTA({ onVerify }) {
  return (
    <section className="section" style={{ position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
      <div className="grid-bg" style={{ maskImage: 'radial-gradient(ellipse 70% 80% at 50% 50%, #000 20%, transparent 70%)' }} />
      <div className="glow-green" style={{ top: '10%', left: '50%', width: 560, height: 380, transform: 'translateX(-50%)', opacity: 0.45 }} />
      <div className="wrap" style={{ position: 'relative' }}>
        <h2 style={{ fontSize: 'clamp(32px,6vw,58px)', letterSpacing: '-0.045em', fontWeight: 600, lineHeight: 1.02, maxWidth: 820, margin: '0 auto' }}>
          Stop sending &ldquo;trust me.&rdquo;<br /><span style={{ color: 'var(--green-400)' }}>Start sending a Receipt.</span>
        </h2>
        <p style={{ fontSize: 18, color: 'var(--text-mid)', marginTop: 22, maxWidth: 520, margin: '22px auto 0' }}>
          Verify your first pull request in under three minutes. Public PRs are free.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={onVerify}><Ic.bolt s={18} /> Verify your first PR</button>
          <button className="btn btn-ghost btn-lg"><Ic.github s={17} /> Read the engine</button>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Pricing, FAQ, FinalCTA });
