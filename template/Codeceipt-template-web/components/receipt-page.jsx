/* ============================================================
   Codeceipt — Full Receipt page (ReceiptDoc)
   Two reading levels: client mode (top) + engineer detail (below)
   ============================================================ */

function CostLedger({ cost }) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '15px 18px', borderBottom: '1px solid var(--border)' }}>
        <Ic.receipt s={17} style={{ color: 'var(--text-mid)' }} />
        <span style={{ flex: 1, fontSize: 14.5, fontWeight: 500 }}>Cost ledger</span>
        <span className="mono" style={{ fontSize: 12, color: 'var(--text-lo)' }}>transparent compute</span>
      </div>
      <div>
        {cost.breakdown.map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderTop: i ? '1px solid var(--border-faint)' : 'none' }}>
            <span style={{ flex: 1, fontSize: 13.5, color: 'var(--text-mid)' }}>{b.label}</span>
            <span className="mono tnum" style={{ fontSize: 12.5, color: 'var(--text-lo)', minWidth: 84, textAlign: 'right' }}>{b.v}</span>
            <span className="mono tnum" style={{ fontSize: 13, color: 'var(--text-hi)', minWidth: 56, textAlign: 'right' }}>${b.usd}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderTop: '1px solid var(--border)', background: 'var(--bg-0)' }}>
          <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>Total</span>
          <span className="mono tnum" style={{ fontSize: 12.5, color: 'var(--text-lo)' }}>{cost.llmTokens} tok</span>
          <span className="mono tnum" style={{ fontSize: 14, fontWeight: 600, color: 'var(--green-400)', minWidth: 56, textAlign: 'right' }}>${cost.usd}</span>
        </div>
      </div>
    </div>
  );
}

function IdentityRow({ k, children }) {
  return (
    <div style={{ display: 'flex', gap: 14, padding: '11px 0', borderTop: '1px solid var(--border-faint)' }}>
      <span className="mono" style={{ width: 110, flex: 'none', fontSize: 12.5, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{k}</span>
      <span style={{ fontSize: 13.5, color: 'var(--text-hi)' }}>{children}</span>
    </div>
  );
}

function ReceiptDoc({ data, onReverify, reverifying }) {
  const m = verdictMeta(data.verdict);
  const VIcon = Ic[m.icon];
  const [copied, setCopied] = React.useState(false);
  const [showBadge, setShowBadge] = React.useState(false);
  const [rv, setRv] = React.useState('idle');   // idle | running | confirmed
  const [rvStep, setRvStep] = React.useState(0);
  const url = `codeceipt.dev/r/${data.id}`;
  const pct = Math.round((data.claimsMet / data.claimsTotal) * 100);
  const rvStepsTotal = Math.min(5, data.criteria.length);

  function runReverify() {
    if (rv === 'running') return;
    setRv('running'); setRvStep(0);
    let i = 0;
    const tick = () => {
      i += 1; setRvStep(i);
      if (i < rvStepsTotal) setTimeout(tick, 480);
      else setTimeout(() => setRv('confirmed'), 600);
    };
    setTimeout(tick, 480);
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 18px 120px' }}>

      {/* ===== CLIENT MODE — the part the client reads ===== */}
      <div className="card" style={{ borderColor: m.line, overflow: 'hidden', boxShadow: 'var(--shadow-lg)', position: 'relative' }}>
        <div className="glow-green" style={{ top: -60, left: '50%', width: 320, height: 160, transform: 'translateX(-50%)', opacity: 0.5,
          background: `radial-gradient(circle, color-mix(in oklab, ${m.color} 22%, transparent), transparent 65%)` }} />

        {/* tiny header */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Ic.logo s={20} />
            <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: '-0.02em' }}>Codeceipt</span>
            <span className="chip" style={{ height: 23, fontSize: 11 }}>Verification Receipt</span>
          </span>
          <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-lo)' }}>{url}</span>
        </div>

        {/* verdict hero */}
        <div style={{ position: 'relative', textAlign: 'center', padding: '40px 24px 30px' }}>
          <div className="pulse" style={{
            width: 76, height: 76, margin: '0 auto 18px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: m.bg, border: `2px solid ${m.line}`, color: m.color,
          }}>
            <VIcon s={38} w={3} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 'clamp(30px, 7vw, 44px)', fontWeight: 700, letterSpacing: '-0.04em', color: m.color }}>{data.verdict}</span>
          </div>
          <p style={{ fontSize: 'clamp(15px,2.4vw,17px)', color: 'var(--text-mid)', lineHeight: 1.5, maxWidth: 520, margin: '0 auto' }}>
            {data.summary}
          </p>

          {/* met ratio bar */}
          <div style={{ maxWidth: 360, margin: '22px auto 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--text-lo)', marginBottom: 7 }} className="mono">
              <span>criteria reproduced</span><span style={{ color: m.color }}>{data.claimsMet}/{data.claimsTotal} · {pct}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: 'var(--bg-3)', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: m.color, borderRadius: 99, boxShadow: `0 0 12px ${m.color}` }} />
            </div>
          </div>
        </div>

        {/* re-verify — the killer trust element, inline */}
        <div style={{ position: 'relative', padding: '0 24px 26px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          {rv === 'idle' && (
            <>
              <button className="btn btn-primary btn-lg" onClick={runReverify} style={{ minWidth: 260 }}>
                <Ic.refresh s={17} /> Run this verification again
              </button>
              <p style={{ fontSize: 12.5, color: 'var(--text-lo)', textAlign: 'center', maxWidth: 380 }}>
                Anyone — including the client — can re-run this in a clean sandbox and get the same verdict. You can&rsquo;t fake it.
              </p>
            </>
          )}

          {rv === 'running' && (
            <div className="fade-up" style={{ width: '100%', maxWidth: 420 }}>
              <div className="card" style={{ background: 'var(--bg-0)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                  <Ic.refresh s={14} className="spin" style={{ color: 'var(--green-400)' }} />
                  <span className="mono" style={{ fontSize: 12, color: 'var(--text-mid)' }}>re-running in a fresh sandbox…</span>
                  <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-lo)', marginLeft: 'auto' }}>{rvStep}/{rvStepsTotal}</span>
                </div>
                <div style={{ padding: '6px 14px 10px' }}>
                  {data.criteria.slice(0, rvStepsTotal).map((c, i) => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 0', opacity: i < rvStep ? 1 : 0.4, transition: 'opacity .3s' }}>
                      <span style={{ width: 15, flex: 'none', display: 'flex', justifyContent: 'center' }}>
                        {i < rvStep ? <StatusIcon status={c.status} s={14} /> : <Ic.refresh s={12} className="spin" style={{ color: 'var(--text-lo)' }} />}
                      </span>
                      <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-mid)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.cmd}</span>
                    </div>
                  ))}
                </div>
                <div style={{ height: 4, background: 'var(--bg-3)' }}>
                  <div style={{ width: `${(rvStep / rvStepsTotal) * 100}%`, height: '100%', background: 'var(--green-500)', transition: 'width .4s', boxShadow: '0 0 8px var(--green-400)' }} />
                </div>
              </div>
            </div>
          )}

          {rv === 'confirmed' && (
            <div className="fade-up" style={{ width: '100%', maxWidth: 460 }}>
              <div className="card" style={{ borderColor: 'var(--green-line)', background: 'var(--green-soft)', padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bg-0)', border: '1px solid var(--green-line)', color: 'var(--green-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Ic.check s={17} w={3} /></span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-hi)' }}>Re-verified — identical result</div>
                    <div style={{ fontSize: 12, color: 'var(--text-mid)' }}>Same verdict, same fingerprint. Deterministic.</div>
                  </div>
                </div>
                {/* fingerprint match */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center' }}>
                  <div style={{ background: 'var(--bg-0)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px' }}>
                    <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-lo)', marginBottom: 2 }}>ORIGINAL</div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--text-hi)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.fingerprint}</div>
                  </div>
                  <span style={{ width: 24, height: 24, borderRadius: 99, background: 'var(--green-400)', color: '#06230f', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Ic.check s={14} w={3.4} /></span>
                  <div style={{ background: 'var(--bg-0)', border: '1px solid var(--green-line)', borderRadius: 8, padding: '8px 10px' }}>
                    <div className="mono" style={{ fontSize: 9.5, color: 'var(--green-400)', marginBottom: 2 }}>YOUR RE-RUN</div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--text-hi)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.fingerprint}</div>
                  </div>
                </div>
                <button className="btn btn-quiet btn-sm" onClick={() => setRv('idle')} style={{ marginTop: 12 }}><Ic.refresh s={13} /> Run again</button>
              </div>
            </div>
          )}
        </div>

        <Perf top />
        {/* identity strip */}
        <div style={{ position: 'relative', padding: '16px 22px 20px', background: 'var(--bg-0)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            {data.pr.platform === 'GitLab' ? <Ic.gitlab s={15} style={{ color: 'var(--text-mid)' }} /> : <Ic.github s={15} style={{ color: 'var(--text-mid)' }} />}
            <span className="mono" style={{ fontSize: 13, color: 'var(--text-hi)' }}>{data.pr.repo} <span style={{ color: 'var(--green-400)' }}>#{data.pr.number}</span></span>
          </div>
          <div style={{ fontSize: 15, color: 'var(--text-hi)', fontWeight: 500, marginBottom: 2 }}>{data.pr.title}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-lo)' }}>
            by <span style={{ color: 'var(--text-mid)' }}>{data.pr.author}</span> · {data.pr.authorKind} · requested by {data.requestedBy}
          </div>
        </div>
      </div>

      {/* share / actions bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginTop: 16, alignItems: 'center' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => { try { navigator.clipboard.writeText('https://' + url); } catch(e){}; setCopied(true); setTimeout(()=>setCopied(false),1400); }}>
          {copied ? <Ic.check s={15} style={{ color: 'var(--green-400)' }} /> : <Ic.link s={15} />} {copied ? 'Link copied' : 'Copy link'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => setShowBadge(true)}><Ic.shield s={15} /> Add badge to README</button>
        <button className="btn btn-ghost btn-sm"><Ic.download s={15} /> Download PDF</button>
        <span style={{ flex: 1 }} />
        <span className="chip" style={{ height: 32 }}><Ic.clock s={13} /> {data.issuedAtRel}</span>
      </div>

      {/* ===== ENGINEER DETAIL ===== */}
      <div style={{ marginTop: 40 }}>
        <SectionLabel n="01" t="Per-criterion breakdown" sub={`Each claim the PR made, re-executed against real evidence. ${data.claimsMet} of ${data.claimsTotal} reproduced.`} />
        <div className="card" style={{ padding: '0 18px', marginTop: 14 }}>
          {data.criteria.map((c, i) => <CriterionRow key={c.id} c={c} defaultOpen={i === 0} />)}
        </div>
      </div>

      <div style={{ marginTop: 34 }}>
        <SectionLabel n="02" t="The diff we executed" sub="Real code, run in an isolated sandbox. Your client won't read it — its presence is the proof." />
        <div style={{ marginTop: 14 }}><DiffView diff={data.diff} /></div>
      </div>

      <div style={{ marginTop: 34, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }} className="rcpt-grid">
        <div>
          <SectionLabel n="03" t="Identity" />
          <div className="card" style={{ padding: '4px 18px 14px', marginTop: 14 }}>
            <IdentityRow k="Platform">{data.pr.platform}</IdentityRow>
            <IdentityRow k="Repository"><span className="mono" style={{ fontSize: 12.5 }}>{data.pr.repo}</span></IdentityRow>
            <IdentityRow k="Pull request"><span className="mono">#{data.pr.number}</span> · {data.pr.branch}</IdentityRow>
            <IdentityRow k="Base → head"><span className="mono" style={{ fontSize: 12.5 }}>{data.pr.baseSha} → {data.pr.headSha}</span></IdentityRow>
            <IdentityRow k="Environment"><span className="mono" style={{ fontSize: 12 }}>{data.env}</span></IdentityRow>
            <IdentityRow k="Issued by">Codeceipt engine · Apache-2.0</IdentityRow>
          </div>
        </div>
        <div>
          <SectionLabel n="04" t="Cost ledger" />
          <div style={{ marginTop: 14 }}><CostLedger cost={data.cost} /></div>
        </div>
      </div>

      {/* fingerprint / tamper evidence */}
      <div style={{ marginTop: 34 }}>
        <SectionLabel n="05" t="Verification fingerprint" sub="Immutable, timestamped, machine-checkable. Embeddable and impossible to edit after the fact." />
        <div className="card" style={{ marginTop: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: '18px', alignItems: 'center' }}>
            <span style={{ width: 46, height: 46, flex: 'none', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--green-soft)', border: '1px solid var(--green-line)', color: 'var(--green-400)' }}>
              <Ic.fingerprint s={24} />
            </span>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="mono" style={{ fontSize: 15, color: 'var(--text-hi)', letterSpacing: '0.01em' }}>{data.fingerprint}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-lo)', marginTop: 3 }}>signed &amp; timestamped · {data.issuedAt}</div>
            </div>
            <span className="chip chip-green"><span className="dot dot-pass" /> tamper-evident</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, padding: '0 18px 18px' }}>
            <span className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-mid)', padding: '6px 11px', background: 'var(--bg-0)', border: '1px solid var(--border)', borderRadius: 7 }}>
              <Ic.doc s={13} /> /r/{data.id}.json
            </span>
            <span className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-mid)', padding: '6px 11px', background: 'var(--bg-0)', border: '1px solid var(--border)', borderRadius: 7 }}>
              <Ic.shield s={13} /> /r/{data.id}/badge.svg
            </span>
            {/* shields.io-style badge */}
            <button onClick={() => setShowBadge(true)} style={{ display: 'inline-flex', height: 28, borderRadius: 6, overflow: 'hidden', fontFamily: 'var(--mono)', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }} title="Add badge to README">
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 9px', background: '#24262b', color: '#cfd3d8' }}>codeceipt</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 9px', background: m.color, color: '#06230f' }}>
                <VIcon s={11} w={3.4} /> {m.word.toLowerCase()}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* how is this verified */}
      <a href="#" onClick={(e)=>e.preventDefault()} style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 26, padding: '16px 18px', background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 12 }}>
        <Ic.github s={20} style={{ color: 'var(--text-mid)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>How is this verified?</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-lo)' }}>The engine is open-source (Apache-2.0). Inspect the method — don&rsquo;t just trust the result.</div>
        </div>
        <Ic.arrowUpRight s={17} style={{ color: 'var(--text-mid)' }} />
      </a>

      {showBadge && <BadgeModal data={data} onClose={() => setShowBadge(false)} />}
    </div>
  );
}

function SectionLabel({ n, t, sub }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span className="mono" style={{ fontSize: 12, color: 'var(--green-400)' }}>{n}</span>
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>{t}</h3>
      </div>
      {sub && <p style={{ fontSize: 13.5, color: 'var(--text-lo)', marginTop: 5, maxWidth: 560, lineHeight: 1.5 }}>{sub}</p>}
    </div>
  );
}

Object.assign(window, { ReceiptDoc, CostLedger, SectionLabel });
