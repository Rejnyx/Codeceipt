/* ============================================================
   Codeceipt — interactive helpers
   CountUp · useCursorGlow · BadgeModal · InlineReverify
   ============================================================ */

/* ---- count-up when scrolled into view ---- */
function CountUp({ to, dur = 1400, prefix = '', suffix = '', sep = true, decimals = 0, style }) {
  const [val, setVal] = React.useState(0);
  const ref = React.useRef(null);
  const started = React.useRef(false);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((ents) => {
      ents.forEach(e => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const tick = (t) => {
            const p = Math.min(1, (t - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(to * eased);
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
  const shown = decimals > 0
    ? val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : (sep ? Math.round(val).toLocaleString('en-US') : String(Math.round(val)));
  return <span ref={ref} className="tnum" style={style}>{prefix}{shown}{suffix}</span>;
}

/* ---- cursor-follow glow (attach to a positioned container) ---- */
function useCursorGlow(ref) {
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    let raf = null;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--mx', x + 'px');
        el.style.setProperty('--my', y + 'px');
        raf = null;
      });
    };
    const enter = () => el.style.setProperty('--glow-op', '1');
    const leave = () => el.style.setProperty('--glow-op', '0');
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseenter', enter);
    el.addEventListener('mouseleave', leave);
    return () => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseenter', enter); el.removeEventListener('mouseleave', leave); };
  }, []);
}

/* ---- badge / README modal ---- */
function BadgeModal({ data, onClose }) {
  const m = window.verdictMeta(data.verdict);
  const MIcon = Ic[m.icon];
  const url = `https://codeceipt.dev/r/${data.id}`;
  const badge = `https://codeceipt.dev/r/${data.id}/badge.svg`;
  const snippets = {
    Markdown: `[![Verified by Codeceipt](${badge})](${url})`,
    HTML: `<a href="${url}"><img src="${badge}" alt="Verified by Codeceipt" /></a>`,
    'reST': `.. image:: ${badge}\n   :target: ${url}`,
  };
  const [tab, setTab] = React.useState('Markdown');
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  function copy() {
    try { navigator.clipboard.writeText(snippets[tab]); } catch (e) {}
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(4,5,6,0.72)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', padding: 20,
    }}>
      <div className="fade-up" onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: 540, background: 'var(--bg-1)', border: '1px solid var(--border-strong)',
        borderRadius: 16, boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
      }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--green-soft)', border: '1px solid var(--green-line)', color: 'var(--green-400)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ic.shield s={17} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Add the badge to your README</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-lo)' }}>Live SVG — updates if you re-verify.</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, color: 'var(--text-lo)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e=>e.currentTarget.style.background='var(--bg-3)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><Ic.x s={16} /></button>
        </div>

        {/* preview */}
        <div style={{ padding: '22px 18px', display: 'flex', justifyContent: 'center', background: 'var(--bg-0)', borderBottom: '1px solid var(--border)' }}>
          <span style={{ display: 'inline-flex', height: 30, borderRadius: 7, overflow: 'hidden', fontFamily: 'var(--mono)', fontSize: 12.5, fontWeight: 600, boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 11px', background: '#24262b', color: '#cfd3d8' }}><Ic.logo s={13} /> codeceipt</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 11px', background: m.color, color: '#06230f' }}><MIcon s={12} w={3.4} /> {m.word.toLowerCase()}</span>
          </span>
        </div>

        {/* tabs */}
        <div style={{ padding: 18 }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            {Object.keys(snippets).map(k => (
              <button key={k} onClick={() => setTab(k)} className="btn btn-sm" style={{
                height: 32, background: tab === k ? 'var(--bg-3)' : 'transparent', color: tab === k ? 'var(--text-hi)' : 'var(--text-mid)',
                border: tab === k ? '1px solid var(--border-strong)' : '1px solid transparent',
              }}>{k}</button>
            ))}
          </div>
          <div style={{ position: 'relative', background: 'var(--bg-0)', border: '1px solid var(--border)', borderRadius: 10 }}>
            <pre className="mono" style={{ margin: 0, padding: '14px 16px', paddingRight: 56, fontSize: 12.5, color: 'var(--text-mid)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.6 }}>{snippets[tab]}</pre>
            <button onClick={copy} className="btn btn-sm" style={{ position: 'absolute', top: 9, right: 9, height: 30, background: 'var(--bg-2)', border: '1px solid var(--border)', color: copied ? 'var(--green-400)' : 'var(--text-mid)' }}>
              {copied ? <Ic.check s={14} /> : <Ic.copy s={14} />}
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-lo)', marginTop: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
            <Ic.refresh s={13} /> Anyone clicking the badge lands on the re-runnable receipt.
          </p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CountUp, useCursorGlow, BadgeModal });
