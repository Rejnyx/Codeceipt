/* ============================================================
   Codeceipt — Nav + Footer
   ============================================================ */
function Nav({ go, onVerify }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const h = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h);
  }, []);
  const links = [
    { l: 'How it works', h: '#how' },
    { l: 'Receipt', h: '#receipt' },
    { l: 'Pricing', h: '#pricing' },
    { l: 'Docs', h: '#faq' },
  ];
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: scrolled ? 'var(--bg-glass)' : 'transparent',
      backdropFilter: scrolled ? 'blur(14px) saturate(1.4)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(14px) saturate(1.4)' : 'none',
      borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
      transition: 'all .25s',
    }}>
      <div className="wrap" style={{ display: 'flex', alignItems: 'center', gap: 18, height: 62 }}>
        <a href="#top" onClick={(e)=>{e.preventDefault(); go('landing'); window.scrollTo({top:0,behavior:'smooth'});}} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Ic.logo s={24} />
          <span style={{ fontWeight: 600, fontSize: 16.5, letterSpacing: '-0.03em' }}>Codeceipt</span>
        </a>
        <nav className="nav-links" style={{ display: 'flex', gap: 4, marginLeft: 12 }}>
          {links.map(x => (
            <a key={x.l} href={x.h} style={{ fontSize: 13.5, color: 'var(--text-mid)', padding: '7px 11px', borderRadius: 8, transition: 'color .15s' }}
               onMouseEnter={e=>e.currentTarget.style.color='var(--text-hi)'} onMouseLeave={e=>e.currentTarget.style.color='var(--text-mid)'}>{x.l}</a>
          ))}
        </nav>
        <span style={{ flex: 1 }} />
        <a href="#" onClick={(e)=>e.preventDefault()} className="nav-gh" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13.5, color: 'var(--text-mid)', padding: '7px 10px' }}>
          <Ic.github s={17} /> <StarStat n="2.4k" />
        </a>
        <button className="btn btn-primary btn-sm" onClick={onVerify} style={{ height: 38 }}>
          <Ic.bolt s={15} /> Verify a PR
        </button>
        <button className="nav-burger" onClick={()=>setOpen(o=>!o)} style={{ display: 'none', width: 38, height: 38, alignItems: 'center', justifyContent: 'center', color: 'var(--text-mid)' }}>
          <Ic.terminal s={20} />
        </button>
      </div>
      {open && (
        <div className="nav-mobile" style={{ display: 'none', flexDirection: 'column', padding: '6px 18px 14px', borderTop: '1px solid var(--border)', background: 'var(--bg-1)' }}>
          {links.map(x => <a key={x.l} href={x.h} onClick={()=>setOpen(false)} style={{ padding: '11px 4px', fontSize: 15, color: 'var(--text-mid)', borderBottom: '1px solid var(--border-faint)' }}>{x.l}</a>)}
        </div>
      )}
    </header>
  );
}

function Footer({ go }) {
  const cols = [
    { h: 'Product', items: ['How it works', 'Receipt example', 'Pricing', 'GitHub Action', 'Changelog'] },
    { h: 'Resources', items: ['Docs', 'Open-source engine', 'Status', 'Badge API', 'JSON schema'] },
    { h: 'Company', items: ['About', 'Blog', 'Security', 'Contact'] },
    { h: 'Legal', items: ['Privacy', 'Terms', 'Apache-2.0 license'] },
  ];
  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-1)', paddingTop: 56 }}>
      <div className="wrap">
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr', gap: 32, paddingBottom: 44 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 13 }}>
              <Ic.logo s={24} /><span style={{ fontWeight: 600, fontSize: 16.5, letterSpacing: '-0.03em' }}>Codeceipt</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-lo)', maxWidth: 240, lineHeight: 1.55 }}>
              Ship AI code. Not AI slop. Verify pull requests by execution and hand your client a receipt they can re-run themselves.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
              <span className="chip" style={{ height: 28 }}><span className="dot dot-pass" /> All systems operational</span>
            </div>
          </div>
          {cols.map(c => (
            <div key={c.h}>
              <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>{c.h}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {c.items.map(i => <a key={i} href="#" onClick={e=>e.preventDefault()} style={{ fontSize: 13.5, color: 'var(--text-mid)' }}
                  onMouseEnter={e=>e.currentTarget.style.color='var(--text-hi)'} onMouseLeave={e=>e.currentTarget.style.color='var(--text-mid)'}>{i}</a>)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '20px 0 36px', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>© 2026 Codeceipt. Engine licensed Apache-2.0.</span>
          <span className="mono" style={{ fontSize: 12, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Ic.shield s={13} /> deterministic execution engine — not an LLM&rsquo;s opinion of itself
          </span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Nav, Footer });
