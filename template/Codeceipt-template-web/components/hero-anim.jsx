/* ============================================================
   Codeceipt — Hero live-verify animation
   Animates criteria resolving to their real status, then settles
   on the receipt's verdict. Switchable across VERIFIED/FAILED/PARTIAL.
   ============================================================ */
function LiveVerifyCard({ data, onOpen, onSwitch, activeId }) {
  const crit = data.criteria.slice(0, 5);
  const N = crit.length;
  const [checked, setChecked] = React.useState(0);
  const [done, setDone] = React.useState(false);

  const m = window.verdictMeta(data.verdict);
  const VIcon = Ic[m.icon];

  React.useEffect(() => {
    let timers = [];
    const push = (fn, ms) => timers.push(setTimeout(fn, ms));
    function run() {
      setChecked(0); setDone(false);
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
  }, [data.id]);

  const pct = Math.round((checked / N) * 100);
  const metShown = crit.slice(0, checked).filter(c => c.status === 'pass').length;
  const activeCmd = crit[Math.min(checked, N - 1)];

  const verdicts = [
    { id: window.RECEIPTS._verified, label: 'Verified', cls: 'pass' },
    { id: window.RECEIPTS._partial, label: 'Partial', cls: 'warn' },
    { id: window.RECEIPTS._failed, label: 'Failed', cls: 'fail' },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
      <div className="glow-green" style={{ inset: '-30px -10px -10px', filter: 'blur(50px)', opacity: done ? 0.7 : 0.38,
        background: `radial-gradient(circle, color-mix(in oklab, ${m.color} 30%, transparent), transparent 65%)`, transition: 'opacity .6s' }} />

      <div className="card" style={{
        position: 'relative', background: 'var(--bg-1)',
        borderColor: done ? m.line : 'var(--border-strong)',
        borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--shadow-lg)', transition: 'border-color .5s',
      }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Ic.logo s={18} />
            <span className="mono" style={{ fontSize: 12.5, color: 'var(--text-mid)' }}>codeceipt.dev/r/{data.id.slice(5, 13)}</span>
          </div>
          {done ? (
            <span className="chip" style={{ height: 24, fontSize: 11.5, borderColor: m.line, background: m.bg, color: m.color }}><Ic.shield s={12} /> signed</span>
          ) : (
            <span className="chip" style={{ height: 24, fontSize: 11.5, borderColor: 'var(--warn-line)', background: 'var(--warn-bg)', color: 'var(--warn)' }}>
              <span className="dot dot-warn pulse" /> executing
            </span>
          )}
        </div>

        {/* verdict block */}
        <div style={{ padding: '22px 20px 14px', textAlign: 'center' }}>
          <div className="pulse" style={{
            width: 56, height: 56, margin: '0 auto 14px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: done ? m.bg : 'var(--bg-3)',
            border: `1.5px solid ${done ? m.line : 'var(--border)'}`,
            color: done ? m.color : 'var(--text-mid)', transition: 'all .5s',
          }}>
            {done ? <VIcon s={28} w={3} /> : <Ic.refresh s={24} className="spin" />}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: done ? m.color : 'var(--text-mid)', transition: 'color .4s' }}>
            {done ? data.verdict : 'VERIFYING'}{!done && <span className="caret">_</span>}
          </div>
          <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-mid)', minHeight: 18 }}>
            {done
              ? <>Executed — met <strong style={{ color: 'var(--text-hi)' }}>{data.claimsMet} of {data.claimsTotal}</strong> criteria.</>
              : <>Running checks in a clean sandbox…</>}
          </p>

          <div style={{ maxWidth: 300, margin: '16px auto 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-lo)', marginBottom: 6 }} className="mono">
              <span>{done ? 'reproduced' : 'reproducing'}</span>
              <span style={{ color: done ? m.color : 'var(--text-mid)' }}>{done ? `${data.claimsMet}/${data.claimsTotal}` : `${checked}/${N}`}</span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: 'var(--bg-3)', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: done ? m.color : 'var(--green-500)', borderRadius: 99, boxShadow: pct ? `0 0 10px ${m.color}` : 'none', transition: 'width .5s cubic-bezier(.3,.7,.3,1)' }} />
            </div>
          </div>
        </div>

        {/* criteria stream */}
        <div style={{ padding: '0 18px 4px' }}>
          {crit.map((c, i) => {
            const state = i < checked ? 'resolved' : i === checked && !done ? 'active' : 'todo';
            const cc = c.status === 'pass' ? 'var(--pass)' : c.status === 'fail' ? 'var(--fail)' : 'var(--warn)';
            return (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                borderTop: '1px solid var(--border-faint)',
                opacity: state === 'todo' ? 0.4 : 1, transition: 'opacity .4s',
              }}>
                <span style={{ width: 16, flex: 'none', display: 'flex', justifyContent: 'center' }}>
                  {state === 'resolved' ? <StatusIcon status={c.status} s={15} />
                    : state === 'active' ? <Ic.refresh s={13} className="spin" style={{ color: 'var(--green-400)' }} />
                    : <span style={{ width: 11, height: 11, borderRadius: 99, border: '1.5px solid var(--border-strong)' }} />}
                </span>
                <span style={{ fontSize: 12.5, color: state === 'resolved' ? 'var(--text-mid)' : state === 'active' ? 'var(--text-hi)' : 'var(--text-lo)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color .3s' }}>
                  {c.label}
                </span>
                {state === 'active' && <span className="mono" style={{ fontSize: 10, color: 'var(--green-400)', marginLeft: 'auto', flex: 'none' }}>run</span>}
                {state === 'resolved' && <span className="mono" style={{ fontSize: 10.5, color: cc, marginLeft: 'auto', flex: 'none' }}>{c.status === 'pass' ? 'ok' : c.status === 'fail' ? 'fail' : 'skip'}</span>}
              </div>
            );
          })}
          <div style={{ padding: '8px 0', borderTop: '1px solid var(--border-faint)', fontSize: 11.5, color: 'var(--text-lo)' }} className="mono">
            +{data.criteria.length - N} more · re-verifiable by anyone
          </div>
        </div>

        <Perf top />
        {/* footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-0)', minHeight: 54 }}>
          {done ? (
            <span className="mono fade-up" style={{ fontSize: 11, color: 'var(--text-lo)' }}>{data.fingerprint}</span>
          ) : (
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <span style={{ color: 'var(--green-400)' }}>$ </span>{activeCmd ? activeCmd.cmd : 'booting sandbox…'}
            </span>
          )}
          {onOpen && (
            <button className="btn btn-sm btn-ghost" onClick={onOpen} style={{ height: 30, flex: 'none', marginLeft: 10, opacity: done ? 1 : 0.5, transition: 'opacity .4s' }}>
              Open <Ic.arrowUpRight s={13} />
            </button>
          )}
        </div>
      </div>

      {/* verdict switcher */}
      {onSwitch && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, justifyContent: 'center' }}>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>try a verdict</span>
          <div style={{ display: 'inline-flex', gap: 3, padding: 3, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 9 }}>
            {verdicts.map(v => {
              const on = activeId === v.id;
              const vc = v.cls === 'pass' ? 'var(--pass)' : v.cls === 'fail' ? 'var(--fail)' : 'var(--warn)';
              return (
                <button key={v.id} onClick={() => onSwitch(v.id)} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, height: 26, padding: '0 10px', borderRadius: 7,
                  fontSize: 12, fontWeight: 500, fontFamily: 'var(--sans)',
                  background: on ? 'var(--bg-3)' : 'transparent', color: on ? 'var(--text-hi)' : 'var(--text-lo)',
                  border: on ? `1px solid ${vc}` : '1px solid transparent', transition: 'all .15s',
                }}>
                  <span className="dot" style={{ background: vc, boxShadow: on ? `0 0 7px ${vc}` : 'none' }} /> {v.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { LiveVerifyCard });
