/* ============================================================
   Codeceipt — Receipt components
   ReceiptStub  : compact receipt for the hero visual
   ReceiptDoc   : full receipt document (the product centrepiece)
   ============================================================ */

/* ---- verdict meta ---- */
function verdictMeta(v) {
  if (v === 'VERIFIED') return { cls: 'pass', color: 'var(--pass)', bg: 'var(--pass-bg)', line: 'var(--pass-line)', icon: 'check', word: 'Verified' };
  if (v === 'FAILED')   return { cls: 'fail', color: 'var(--fail)', bg: 'var(--fail-bg)', line: 'var(--fail-line)', icon: 'x', word: 'Failed' };
  return { cls: 'warn', color: 'var(--warn)', bg: 'var(--warn-bg)', line: 'var(--warn-line)', icon: 'minus', word: 'Partial' };
}

/* perforated edge used on receipt docs */
function Perf({ top }) {
  return (
    <div aria-hidden="true" style={{
      height: 10, width: '100%',
      background: `radial-gradient(circle at 8px ${top ? 'bottom' : 'top'}, transparent 0 7px, var(--bg-1) 7px) 0 0 / 18px 10px repeat-x`,
    }} />
  );
}

/* ============================================================
   ReceiptStub — hero visual
   ============================================================ */
function ReceiptStub({ data, onOpen, float }) {
  const m = verdictMeta(data.verdict);
  const VIcon = Ic[m.icon];
  return (
    <div className={float ? 'fade-up' : ''} style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
      {/* glow behind */}
      <div className="glow-green" style={{ inset: '-30px -10px -10px', filter: 'blur(50px)', opacity: 0.6 }} />
      <div className="card" style={{
        position: 'relative', background: 'var(--bg-1)', borderColor: 'var(--border-strong)',
        borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--shadow-lg)',
      }}>
        {/* header bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Ic.logo s={18} />
            <span className="mono" style={{ fontSize: 12.5, color: 'var(--text-mid)' }}>codeceipt.dev/r/{data.id.slice(5, 13)}</span>
          </div>
          <span className="chip chip-green" style={{ height: 24, fontSize: 11.5 }}>
            <Ic.shield s={12} /> signed
          </span>
        </div>

        {/* verdict block */}
        <div style={{ padding: '22px 20px 18px', textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, margin: '0 auto 14px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: m.bg, border: `1.5px solid ${m.line}`, color: m.color,
          }}>
            <VIcon s={28} w={3} />
          </div>
          <div className={`verdict verdict-${m.cls}`} style={{ fontSize: 15 }}>
            <span className={`dot dot-${m.cls}`} /> {data.verdict}
          </div>
          <p style={{ marginTop: 12, fontSize: 13.5, color: 'var(--text-mid)', lineHeight: 1.45, maxWidth: 320, marginInline: 'auto' }}>
            Independently executed — met <strong style={{ color: 'var(--text-hi)' }}>{data.claimsMet} of {data.claimsTotal}</strong> claimed criteria.
          </p>
        </div>

        {/* criteria mini list */}
        <div style={{ padding: '0 18px 6px' }}>
          {data.criteria.slice(0, 4).map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '1px solid var(--border-faint)' }}>
              <StatusIcon status={c.status} s={15} />
              <span style={{ fontSize: 12.5, color: 'var(--text-mid)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.label}</span>
            </div>
          ))}
          <div style={{ padding: '8px 0', borderTop: '1px solid var(--border-faint)', fontSize: 12, color: 'var(--text-lo)' }} className="mono">
            +{data.criteria.length - 4} more · re-verifiable by anyone
          </div>
        </div>

        <Perf top />
        {/* footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-0)' }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-lo)' }}>{data.fingerprint}</span>
          {onOpen && (
            <button className="btn btn-sm btn-ghost" onClick={onOpen} style={{ height: 30 }}>
              Open <Ic.arrowUpRight s={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Criterion row (expandable)
   ============================================================ */
function CriterionRow({ c, defaultOpen }) {
  const [open, setOpen] = React.useState(!!defaultOpen);
  const m = c.status === 'pass' ? 'pass' : c.status === 'fail' ? 'fail' : 'warn';
  const color = c.status === 'pass' ? 'var(--pass)' : c.status === 'fail' ? 'var(--fail)' : 'var(--warn)';
  return (
    <div style={{ borderTop: '1px solid var(--border)' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: '15px 4px', textAlign: 'left',
      }}>
        <span style={{
          width: 26, height: 26, flex: 'none', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `color-mix(in oklab, ${color} 14%, transparent)`, color,
        }}>
          <StatusIcon status={c.status} s={15} />
        </span>
        <span style={{ flex: 1, fontSize: 14.5, color: 'var(--text-hi)', fontWeight: 450 }}>{c.label}</span>
        <span className="mono" style={{ fontSize: 11.5, color, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>
          {c.status === 'pass' ? 'reproduced' : c.status === 'fail' ? 'not reproduced' : 'skipped'}
        </span>
        <Ic.chevron s={16} style={{ color: 'var(--text-lo)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flex: 'none' }} />
      </button>
      {open && (
        <div className="fade-up" style={{ padding: '0 4px 18px 43px' }}>
          <p style={{ fontSize: 13.5, color: 'var(--text-mid)', lineHeight: 1.55, marginBottom: 12 }}>{c.evidence}</p>
          <div style={{ background: 'var(--bg-0)', border: '1px solid var(--border)', borderRadius: 9, overflow: 'hidden' }}>
            <div className="mono" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', fontSize: 12.5, color: 'var(--text-mid)', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--green-400)' }}>$</span> {c.cmd}
            </div>
            <div className="mono" style={{ padding: '9px 12px', fontSize: 12.5, color: color }}>
              <span style={{ color: 'var(--text-lo)' }}>→ </span>{c.out}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Diff view (collapsible)
   ============================================================ */
function DiffView({ diff }) {
  const [open, setOpen] = React.useState(false);
  const lineColor = (t) => t === 'add' ? 'var(--green-300)' : t === 'del' ? 'var(--fail)' : t === 'meta' ? 'var(--text-mid)' : 'var(--text-mid)';
  const lineBg = (t) => t === 'add' ? 'rgba(74,222,128,0.07)' : t === 'del' ? 'rgba(248,113,113,0.07)' : 'transparent';
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '15px 18px', textAlign: 'left' }}>
        <Ic.terminal s={17} style={{ color: 'var(--text-mid)' }} />
        <span style={{ flex: 1, fontSize: 14.5, fontWeight: 500 }}>Executed diff</span>
        <span className="mono" style={{ fontSize: 12, color: 'var(--text-lo)' }}>
          {diff.files} files <span style={{ color: 'var(--green-400)' }}>+{diff.additions}</span> <span style={{ color: 'var(--fail)' }}>−{diff.deletions}</span>
        </span>
        <Ic.chevron s={16} style={{ color: 'var(--text-lo)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>
      {open && (
        <div className="fade-up" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-0)' }}>
          {diff.sample.map((l, i) => (
            <div key={i} className="mono" style={{
              display: 'flex', gap: 12, padding: '2px 16px', fontSize: 12.5, lineHeight: 1.7,
              background: lineBg(l.t), color: lineColor(l.t),
              fontWeight: l.t === 'meta' ? 600 : 400,
              borderTop: l.t === 'meta' && i > 0 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ width: 10, color: 'var(--text-dim)', flex: 'none' }}>{l.t === 'add' ? '+' : l.t === 'del' ? '−' : ''}</span>
              <span style={{ whiteSpace: 'pre-wrap' }}>{l.s}</span>
            </div>
          ))}
          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-lo)' }} className="mono">
            showing representative hunk · full diff in machine-readable JSON
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { verdictMeta, ReceiptStub, CriterionRow, DiffView, Perf });
