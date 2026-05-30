/* ============================================================
   Codeceipt — Landing sections B
   Showcase · Two-audience · Open-source · Social · Pricing · FAQ · CTA
   ============================================================ */

/* ---------- RECEIPT SHOWCASE (centrepiece) ---------- */
function Showcase({ sample, onReceipt }) {
  const R = window.RECEIPTS;
  const [liveId, setLiveId] = React.useState(R._verified);
  const callouts = [
    { i: '01', icon: 'shield', t: 'Verdict badge', d: 'The one thing your client reads. Plain language, dominant.' },
    { i: '02', icon: 'check', t: 'Per-criterion checks', d: 'Every claim → real executed evidence. Expandable, not a single stamp.' },
    { i: '03', icon: 'clock', t: 'Immutable timestamp', d: 'Signed, hashed, tamper-evident. Independently checkable.' },
    { i: '04', icon: 'refresh', t: 'Re-verify button', d: 'Anyone re-runs it and gets the same verdict. You can\u2019t fake it.' },
    { i: '05', icon: 'receipt', t: 'Cost ledger', d: 'Transparent compute & token cost. A literal receipt.' },
  ];
  return (
    <section id="receipt" className="section" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="glow-green" style={{ top: '20%', left: '-8%', width: 420, height: 420, opacity: 0.32 }} />
      <div className="wrap" style={{ position: 'relative' }}>
        <div style={{ maxWidth: 660, marginBottom: 46 }}>
          <Eyebrow icon="receipt">The Receipt</Eyebrow>
          <h2 style={{ fontSize: 'clamp(28px,4.6vw,42px)', letterSpacing: '-0.035em' }}>This is what your client receives.</h2>
          <p style={{ fontSize: 17, color: 'var(--text-mid)', marginTop: 16, lineHeight: 1.55, maxWidth: 560 }}>
            One link. They can re-run it themselves. You can&rsquo;t fake it — every line is backed by a real execution in a clean sandbox.
          </p>
        </div>

        <div className="showcase-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 0.95fr', gap: 48, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {callouts.map(c => {
              const I = Ic[c.icon];
              return (
                <div key={c.i} style={{ display: 'flex', gap: 15, padding: '15px 0', borderTop: '1px solid var(--border)' }}>
                  <span style={{ width: 38, height: 38, flex: 'none', borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green-400)' }}>
                    <I s={18} />
                  </span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>{c.i}</span>
                      <span style={{ fontSize: 15, fontWeight: 600 }}>{c.t}</span>
                    </div>
                    <p style={{ fontSize: 13.5, color: 'var(--text-mid)', marginTop: 3, lineHeight: 1.45 }}>{c.d}</p>
                  </div>
                </div>
              );
            })}
            <button className="btn btn-primary" onClick={() => onReceipt(liveId)} style={{ alignSelf: 'flex-start', marginTop: 22 }}>
              Open live example <Ic.arrowUpRight s={16} />
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <LiveVerifyCard data={R[liveId]} onOpen={() => onReceipt(liveId)} onSwitch={setLiveId} activeId={liveId} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- TWO-AUDIENCE VALUE ---------- */
function TwoAudience() {
  const [tab, setTab] = React.useState(0);
  const data = [
    { k: 'For freelancers & agencies', pts: [
        ['Prove it isn\u2019t slop', 'Hand over an executed receipt instead of &ldquo;trust me.&rdquo;'],
        ['Close deals faster', 'Independent proof removes the back-and-forth on quality.'],
        ['Charge more', 'Verified delivery is a premium signal competitors can\u2019t copy.'],
        ['Stand out', 'Embed a verified badge in every PR and README.'],
      ] },
    { k: 'For clients', pts: [
        ['Judge without reading code', 'A plain-language verdict you actually understand.'],
        ['Proof you can check', 'Re-run the verification yourself — no need to trust the vendor.'],
        ['Independently verifiable', 'The engine is open-source; you don\u2019t even have to trust Codeceipt.'],
        ['Honest by design', 'FAILED verdicts are public too. No cherry-picking.'],
      ] },
  ];
  return (
    <section className="section" style={{ background: 'var(--bg-1)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="wrap">
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Eyebrow>Two sides, one receipt</Eyebrow>
          <h2 style={{ fontSize: 'clamp(26px,4.4vw,38px)', letterSpacing: '-0.035em' }}>It works because both sides win.</h2>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', gap: 4, padding: 4, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 11 }}>
            {data.map((d, i) => (
              <button key={i} onClick={() => setTab(i)} className="btn btn-sm" style={{
                background: tab === i ? 'var(--bg-3)' : 'transparent', color: tab === i ? 'var(--text-hi)' : 'var(--text-mid)',
                border: tab === i ? '1px solid var(--border-strong)' : '1px solid transparent', height: 36,
              }}>{d.k}</button>
            ))}
          </div>
        </div>
        <div className="audience-grid fade-up" key={tab} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 880, margin: '0 auto' }}>
          {data[tab].pts.map((p, i) => (
            <div key={i} className="card" style={{ padding: 20, display: 'flex', gap: 13 }}>
              <span style={{ width: 30, height: 30, flex: 'none', borderRadius: 8, background: 'var(--green-soft)', border: '1px solid var(--green-line)', color: 'var(--green-400)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Ic.check s={16} w={3} />
              </span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{p[0]}</div>
                <p style={{ fontSize: 13.5, color: 'var(--text-mid)', lineHeight: 1.45 }} dangerouslySetInnerHTML={{ __html: p[1] }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- OPEN SOURCE ---------- */
function OpenSource() {
  return (
    <section className="section" style={{ position: 'relative' }}>
      <div className="wrap">
        <div className="os-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <Eyebrow icon="github">Trust architecture</Eyebrow>
            <h2 style={{ fontSize: 'clamp(26px,4.4vw,38px)', letterSpacing: '-0.035em' }}>We don&rsquo;t ask you to trust us.</h2>
            <p style={{ fontSize: 17, color: 'var(--text-mid)', marginTop: 16, lineHeight: 1.55 }}>
              The engine is <strong style={{ color: 'var(--text-hi)' }}>Apache-2.0</strong>. Anyone — including your client — can inspect exactly how a verdict is produced. We give you something you can verify <em>without</em> us.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
              {['Read the execution engine line by line', 'Re-run any receipt on your own machine', 'Machine-checkable JSON + SVG artifacts'].map(t => (
                <div key={t} style={{ display: 'flex', gap: 11, alignItems: 'center', fontSize: 14.5, color: 'var(--text-mid)' }}>
                  <Ic.check s={17} style={{ color: 'var(--green-400)', flex: 'none' }} /> {t}
                </div>
              ))}
            </div>
          </div>
          {/* repo card */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
              <Ic.github s={22} />
              <div style={{ flex: 1 }}>
                <div className="mono" style={{ fontSize: 13.5, color: 'var(--text-hi)' }}>codeceipt/engine</div>
                <div style={{ fontSize: 12, color: 'var(--text-lo)' }}>Deterministic PR verification engine</div>
              </div>
              <span className="chip"><Ic.shield s={12} /> Apache-2.0</span>
            </div>
            <div style={{ padding: 18 }}>
              <p style={{ fontSize: 13.5, color: 'var(--text-mid)', lineHeight: 1.5, marginBottom: 16 }}>
                Clone it, audit it, run it in CI. The verdict on every receipt comes from this code — nothing hidden.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16, fontSize: 12.5, color: 'var(--text-mid)' }}>
                <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Ic.star s={14} style={{ color: '#E3B341' }} /> <CountUp to={2431} /></span>
                <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><span style={{ width: 10, height: 10, borderRadius: 99, background: '#3178c6' }} /> TypeScript</span>
                <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Ic.refresh s={13} /> updated today</span>
              </div>
              <button className="btn btn-ghost" style={{ width: '100%' }}><Ic.github s={16} /> View the engine on GitHub <Ic.arrowUpRight s={15} /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- SOCIAL PROOF ---------- */
function SocialProof({ onReceipt }) {
  return (
    <section style={{ background: 'var(--bg-1)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div className="wrap" style={{ padding: '64px 24px' }}>
        <div className="social-grid" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 22, alignItems: 'stretch' }}>
          <blockquote className="card" style={{ padding: '30px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 'clamp(18px,2.6vw,23px)', lineHeight: 1.45, letterSpacing: '-0.02em', color: 'var(--text-hi)' }}>
              &ldquo;We stopped writing &lsquo;tested locally, works on my machine&rsquo; in handoffs. Now we paste a Codeceipt link. Clients stopped re-reviewing — the deal just closes.&rdquo;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 26 }}>
              <span className="placeholder" style={{ width: 42, height: 42, borderRadius: 99, fontSize: 9 }}>img</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Maya Okafor</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-lo)' }}>Founder, Northbeam — beta user</div>
              </div>
            </div>
          </blockquote>
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
            <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-lo)', marginBottom: 14 }}>LIVE RECEIPT · PUBLIC</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span className="dot dot-pass" />
              <span className="mono" style={{ fontSize: 13, color: 'var(--text-hi)' }}>r/rcpt_a1f93c2e</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-mid)', lineHeight: 1.5, flex: 1 }}>
              A real, live verification you can open and re-run right now. Without it, the pitch is just words.
            </p>
            <button className="btn btn-primary btn-sm" onClick={onReceipt} style={{ marginTop: 16 }}><Ic.receipt s={15} /> Open the live receipt</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 12.5, color: 'var(--text-lo)' }}>
              <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Ic.star s={13} style={{ color: '#E3B341' }} /> <CountUp to={2431} /> stars</span>
              <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Ic.bolt s={13} /> <CountUp to={18402} /> PRs verified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Showcase, TwoAudience, OpenSource, SocialProof });
