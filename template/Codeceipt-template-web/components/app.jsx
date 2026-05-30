/* ============================================================
   Codeceipt — App router
   views: landing · paste · loading · receipt
   ============================================================ */
const { useState, useEffect, useRef } = React;

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4200); return () => clearTimeout(t); }, []);
  return (
    <div className="fade-up" style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 100,
      display: 'flex', alignItems: 'center', gap: 11, padding: '12px 16px',
      background: 'var(--bg-2)', border: '1px solid var(--green-line)', borderRadius: 12, boxShadow: 'var(--shadow-lg)',
    }}>
      <Ic.check s={16} style={{ color: 'var(--green-400)' }} />
      <span style={{ fontSize: 13.5, color: 'var(--text-hi)' }}>{msg}</span>
      <button onClick={onClose} style={{ color: 'var(--text-lo)', display: 'flex', marginLeft: 6 }}><Ic.x s={15} /></button>
    </div>
  );
}

/* ---- Paste view (empty state) ---- */
function PasteView({ onScenario, go }) {
  return (
    <section style={{ minHeight: 'calc(100vh - 62px)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '40px 18px' }}>
      <div className="grid-bg" />
      <div className="glow-green" style={{ top: '12%', left: '50%', width: 460, height: 320, transform: 'translateX(-50%)', opacity: 0.4 }} />
      <div style={{ position: 'relative', width: '100%', maxWidth: 620, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <span className="chip chip-green" style={{ marginBottom: 22 }}><Ic.bolt s={13} /> Verify by execution</span>
        <h1 style={{ fontSize: 'clamp(30px,5.5vw,46px)', letterSpacing: '-0.04em', fontWeight: 600, lineHeight: 1.04 }}>
          Paste a pull request.<br />Get a receipt.
        </h1>
        <p style={{ fontSize: 16.5, color: 'var(--text-mid)', marginTop: 16, marginBottom: 32, maxWidth: 460, lineHeight: 1.5 }}>
          Codeceipt runs it in a clean sandbox and certifies what it actually does — not what the agent claims.
        </p>
        <PasteBox onScenario={onScenario} />
        <button className="btn btn-quiet btn-sm" onClick={() => go('landing')} style={{ marginTop: 28 }}>
          ← Back to home
        </button>
      </div>
    </section>
  );
}

/* ---- Receipt view chrome ---- */
function ReceiptView({ data, go }) {
  return (
    <div style={{ paddingTop: 28, minHeight: '100vh' }}>
      <div className="wrap" style={{ maxWidth: 760, marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => go('landing')}>← Home</button>
          <span style={{ flex: 1 }} />
          {/* faux url bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 13px', background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 9, maxWidth: '100%', overflow: 'hidden' }}>
            <Ic.lock s={13} style={{ color: 'var(--green-400)', flex: 'none' }} />
            <span className="mono" style={{ fontSize: 12.5, color: 'var(--text-mid)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>codeceipt.dev/r/{data.id}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => go('paste')}><Ic.bolt s={14} /> Verify another</button>
        </div>
      </div>
      <ReceiptDoc data={data} />
    </div>
  );
}

function App() {
  const R = window.RECEIPTS;
  const SC = window.SCENARIOS;
  const [view, setView] = useState('landing');     // landing | paste | connect | loading | error | receipt
  const [receiptId, setReceiptId] = useState(R._verified);
  const [target, setTarget] = useState(window.SAMPLE_URL);
  const [errKind, setErrKind] = useState(null);     // timeout | ratelimit
  const [injectErr, setInjectErr] = useState(null);
  const [pendingScenario, setPendingScenario] = useState(null);
  const [toast, setToast] = useState('');
  const prevView = useRef('landing');

  const sample = R[R._verified];
  const current = R[receiptId];

  function go(v) { prevView.current = view; setView(v); window.scrollTo({ top: 0 }); }

  // map a scenario key → behaviour
  function onScenario(kind, url) {
    setTarget(url || window.SAMPLE_URL);
    if (kind === 'private') { setPendingScenario('verified'); go('connect'); return; }
    if (kind === 'timeout' || kind === 'ratelimit') {
      setReceiptId(R._verified); setInjectErr(kind); go('loading'); return;
    }
    const id = (SC[kind] && SC[kind].id) ? R[SC[kind].id] : R._verified;
    setReceiptId(id); setInjectErr(null); go('loading');
  }

  function onConnectDone() {
    // after connecting, run the originally-requested (now private) verification → verified
    setReceiptId(R._verified); setInjectErr(null); go('loading');
  }

  function onLoaderDone() {
    go('receipt');
    const v = R[receiptId].verdict;
    setToast(v === 'VERIFIED'
      ? 'Receipt created — share the link with your client.'
      : v === 'FAILED'
        ? 'Receipt created — FAILED is public too. No cherry-picking.'
        : 'Receipt created — 2 checks need a staging env.');
  }

  function onLoaderError(kind) { setErrKind(kind); go('error'); }

  function openReceipt(id) { setReceiptId(id || R._verified); go('receipt'); }

  const showNav = view === 'landing' || view === 'paste';
  // build the receipt the loader should resolve to (with optional error flag)
  const loaderReceipt = React.useMemo(() => injectErr ? { ...current, _injectError: injectErr } : current, [receiptId, injectErr]);

  return (
    <>
      {showNav && <Nav go={go} onVerify={() => go('paste')} />}

      {view === 'landing' && (
        <main>
          <Hero onVerify={() => go('paste')} onReceipt={(id) => openReceipt(id)} sample={sample} />
          <TrustBlock />
          <Problem />
          <HowItWorks onVerify={() => go('paste')} />
          <Showcase sample={sample} onReceipt={(id) => openReceipt(id)} />
          <TwoAudience />
          <OpenSource />
          <SocialProof onReceipt={(id) => openReceipt(id)} />
          <Pricing onVerify={() => go('paste')} />
          <FAQ />
          <FinalCTA onVerify={() => go('paste')} />
          <Footer go={go} />
        </main>
      )}

      {view === 'paste' && <PasteView onScenario={onScenario} go={go} />}

      {view === 'connect' && <ConnectGate targetUrl={target} onConnect={onConnectDone} onCancel={() => go('paste')} />}

      {view === 'loading' && <ExecLoader key={receiptId + (injectErr || '')} targetUrl={target} receipt={loaderReceipt} onDone={onLoaderDone} onError={onLoaderError} />}

      {view === 'error' && <ExecError kind={errKind} targetUrl={target} onRetry={() => { setInjectErr(null); go('loading'); }} onCancel={() => go('paste')} />}

      {view === 'receipt' && <ReceiptView data={current} go={go} />}

      {toast && <Toast msg={toast} onClose={() => setToast('')} />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
