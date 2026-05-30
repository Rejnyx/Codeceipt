/* ============================================================
   Codeceipt — Paste flow + stepped execution loader
   PasteBox    : empty state input + scenario chips
   ExecLoader  : stepped progress + live log derived from the
                 target receipt (handles VERIFIED/FAILED/PARTIAL)
   ConnectGate : private-repo → connect GitHub state
   ============================================================ */

const SCENARIOS = {
  verified: { url: 'https://github.com/acme-pay/checkout-service/pull/482', id: '_verified', label: 'Passing PR', cls: 'pass', icon: 'check' },
  failed:   { url: 'https://github.com/acme-pay/search-api/pull/119',       id: '_failed',   label: 'Failing PR', cls: 'fail', icon: 'x' },
  partial:  { url: 'https://gitlab.com/northbeam/billing-portal/-/merge_requests/73', id: '_partial', label: 'Env-limited PR', cls: 'warn', icon: 'minus' },
  private:  { url: 'https://github.com/northbeam/internal-ledger/pull/9',    id: null,        label: 'Private repo', cls: 'lock', icon: 'lock' },
};

function PasteBox({ onVerify, onScenario }) {
  const [url, setUrl] = React.useState('');
  const [err, setErr] = React.useState('');

  function submit(u) {
    const target = (u || url).trim();
    if (!target) { setErr('Paste a pull-request URL to verify.'); return; }
    if (!/github\.com|gitlab\.com/i.test(target)) { setErr('Only GitHub and GitLab PR URLs are supported right now.'); return; }
    setErr('');
    // private-repo heuristic for the demo
    if (/internal|private|acme-corp/i.test(target)) { onScenario('private', target); return; }
    if (/search-api|\/119/i.test(target)) { onScenario('failed', target); return; }
    if (/billing-portal|merge_requests\/73/i.test(target)) { onScenario('partial', target); return; }
    onScenario('verified', target);
  }

  return (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: 7,
        background: 'var(--bg-2)', border: `1px solid ${err ? 'var(--fail-line)' : 'var(--border-strong)'}`,
        borderRadius: 14, boxShadow: 'var(--shadow-md)', transition: 'border-color .15s',
      }}>
        <span style={{ paddingLeft: 8, display: 'flex', color: 'var(--text-lo)' }}><Ic.github s={18} /></span>
        <input
          value={url}
          onChange={(e) => { setUrl(e.target.value); setErr(''); }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Paste a GitHub / GitLab PR URL"
          spellCheck={false}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-hi)', fontSize: 14.5, padding: '8px 2px', fontFamily: 'var(--mono)', letterSpacing: '-0.01em' }}
        />
        <button className="btn btn-primary" onClick={() => submit()} style={{ height: 40 }}><Ic.bolt s={16} /> Verify</button>
      </div>

      <div style={{ minHeight: 20, marginTop: 11 }}>
        <span style={{ fontSize: 12.5, color: err ? 'var(--fail)' : 'var(--text-lo)', display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center' }}>
          {err ? <><Ic.x s={13} /> {err}</> : <><Ic.lock s={13} /> Public PRs verify instantly. Private → connect GitHub.</>}
        </span>
      </div>

      {/* scenario chips */}
      <div style={{ marginTop: 18 }}>
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', marginBottom: 10 }}>or try a scenario</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {Object.entries(SCENARIOS).map(([k, s]) => {
            const c = s.cls === 'pass' ? 'var(--pass)' : s.cls === 'fail' ? 'var(--fail)' : s.cls === 'warn' ? 'var(--warn)' : 'var(--text-mid)';
            const I = Ic[s.icon];
            return (
              <button key={k} onClick={() => { setUrl(s.url); onScenario(k, s.url); }} className="chip" style={{ cursor: 'pointer', height: 32 }}
                onMouseEnter={e => e.currentTarget.style.borderColor = c} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <I s={13} style={{ color: c }} /> {s.label}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginTop: 12 }}>
          <button onClick={() => onScenario('timeout', SCENARIOS.verified.url)} style={{ fontSize: 11.5, color: 'var(--text-dim)', display: 'inline-flex', alignItems: 'center', gap: 5 }}
            onMouseEnter={e=>e.currentTarget.style.color='var(--fail)'} onMouseLeave={e=>e.currentTarget.style.color='var(--text-dim)'}><Ic.clock s={12} /> simulate timeout</button>
          <button onClick={() => onScenario('ratelimit', SCENARIOS.verified.url)} style={{ fontSize: 11.5, color: 'var(--text-dim)', display: 'inline-flex', alignItems: 'center', gap: 5 }}
            onMouseEnter={e=>e.currentTarget.style.color='var(--fail)'} onMouseLeave={e=>e.currentTarget.style.color='var(--text-dim)'}><Ic.bolt s={12} /> simulate rate limit</button>
        </div>
      </div>
    </div>
  );
}

/* ---- private repo → connect GitHub ---- */
function ConnectGate({ targetUrl, onConnect, onCancel }) {
  const [connecting, setConnecting] = React.useState(false);
  return (
    <div style={{ minHeight: 'calc(100vh - 62px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 18px', position: 'relative', overflow: 'hidden' }}>
      <div className="glow-green" style={{ top: '14%', left: '50%', width: 420, height: 280, transform: 'translateX(-50%)', opacity: 0.34 }} />
      <div className="card fade-up" style={{ position: 'relative', width: '100%', maxWidth: 460, padding: 28, textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
        <span style={{ width: 52, height: 52, margin: '0 auto 16px', borderRadius: 13, background: 'var(--bg-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-hi)' }}>
          <Ic.lock s={24} />
        </span>
        <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>This is a private repository</h2>
        <p style={{ fontSize: 14, color: 'var(--text-mid)', marginTop: 10, lineHeight: 1.5 }}>
          Connect GitHub so Codeceipt can clone and run it. Code executes in an ephemeral sandbox and is never retained.
        </p>
        <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-lo)', marginTop: 14, padding: '8px 12px', background: 'var(--bg-0)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{targetUrl}</div>
        <button className="btn btn-primary btn-lg" onClick={() => { setConnecting(true); setTimeout(onConnect, 1300); }} disabled={connecting} style={{ width: '100%', marginTop: 18 }}>
          {connecting ? <><Ic.refresh s={17} className="spin" /> Authorizing…</> : <><Ic.github s={18} /> Connect GitHub</>}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'center', marginTop: 16, fontSize: 11.5, color: 'var(--text-lo)' }}>
          <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><Ic.shield s={12} /> read-only access</span>
          <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><Ic.lock s={12} /> never retained</span>
        </div>
        <button className="btn btn-quiet btn-sm" onClick={onCancel} style={{ marginTop: 12 }}>← Back</button>
      </div>
    </div>
  );
}

/* ---- build live-execution steps from a target receipt ---- */
function buildSteps(receipt) {
  const platform = receipt.pr.platform === 'GitLab' ? 'gitlab' : 'github';
  const execLogs = ['installing deps … pnpm install --frozen-lockfile', `spinning up ${receipt.env}`];
  receipt.criteria.slice(0, 6).forEach(c => {
    execLogs.push('▶ ' + c.cmd);
    const sign = c.status === 'pass' ? '  ✓ ' : c.status === 'fail' ? '  ✗ ' : '  ⊘ ';
    execLogs.push(sign + c.out);
  });
  return [
    { key: 'clone', label: 'Cloning repository', detail: `git clone ${receipt.pr.repo} @ ${receipt.pr.headSha}`, ms: 1000,
      logs: [`$ git clone --depth 1 ${platform}.com/${receipt.pr.repo}`, 'Receiving objects: 100%', 'restored pnpm store from cache'] },
    { key: 'parse', label: 'Parsing claimed criteria', detail: 'extracting what the PR says it does', ms: 1200,
      logs: ['reading PR description + linked issue', `found ${receipt.claimsTotal} verifiable claims`, `mapped ${receipt.claimsTotal}/${receipt.claimsTotal} claims → executable checks`] },
    { key: 'exec', label: 'Executing checks in sandbox', detail: 'deterministic run — not the agent\u2019s summary', ms: 2600, logs: execLogs },
    { key: 'build', label: 'Building & signing Receipt', detail: 'hash, timestamp, public URL', ms: 1000,
      logs: [`${receipt.claimsMet}/${receipt.claimsTotal} criteria reproduced`, 'computing verification fingerprint', `signed ${receipt.fingerprint}`, `Receipt published → codeceipt.dev/r/${receipt.id}`] },
  ];
}

function ExecLoader({ targetUrl, receipt, onDone, onError }) {
  const steps = React.useMemo(() => buildSteps(receipt), [receipt.id]);
  const willError = receipt._injectError;   // 'timeout' | 'ratelimit' | undefined
  const [stepIdx, setStepIdx] = React.useState(0);
  const [logs, setLogs] = React.useState([]);
  const [cost, setCost] = React.useState(0);
  const [errored, setErrored] = React.useState(null);
  const logRef = React.useRef(null);

  React.useEffect(() => {
    let cancelled = false;
    const allLogs = [];
    let si = 0;
    // error injection: bail during the exec step
    const errorAt = willError ? 2 : -1;

    function runStep() {
      if (cancelled) return;
      if (si >= steps.length) { setTimeout(() => !cancelled && onDone(), 500); return; }
      setStepIdx(si);
      const step = steps[si];
      const per = Math.max(150, step.ms / (step.logs.length + 1));
      step.logs.forEach((line, k) => {
        setTimeout(() => {
          if (cancelled) return;
          allLogs.push({ step: si, line });
          setLogs([...allLogs]);
          setCost(c => +(c + 0.002 + Math.random() * 0.004).toFixed(3));
        }, per * (k + 1));
      });
      if (si === errorAt) {
        setTimeout(() => {
          if (cancelled) return;
          const msg = willError === 'timeout'
            ? { line: '✗ sandbox timed out after 600s — job exceeded compute budget', kind: 'timeout' }
            : { line: '✗ rate limit — GitHub API 403 (retry in 41s)', kind: 'ratelimit' };
          allLogs.push({ step: si, line: msg.line, err: true });
          setLogs([...allLogs]);
          setErrored(willError);
          setTimeout(() => !cancelled && onError && onError(willError), 1200);
        }, step.ms * 0.7);
        return; // stop advancing
      }
      setTimeout(() => { si += 1; runStep(); }, step.ms);
    }
    runStep();
    return () => { cancelled = true; };
  }, [receipt.id]);

  React.useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 18px' }}>
      <div className="glow-green" style={{ top: '10%', left: '50%', width: 500, height: 300, transform: 'translateX(-50%)', opacity: errored ? 0.2 : 0.4 }} />
      <div style={{ width: '100%', maxWidth: 600, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <span className="chip chip-green" style={{ marginBottom: 14 }}><span className="dot dot-pass pulse" /> Executing — not summarizing</span>
          <h2 style={{ fontSize: 'clamp(22px,4vw,28px)', fontWeight: 600, letterSpacing: '-0.03em' }}>Verifying the pull request</h2>
          <p className="mono" style={{ fontSize: 12.5, color: 'var(--text-lo)', marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{targetUrl}</p>
        </div>

        <div className="card" style={{ padding: '8px 8px', marginBottom: 14 }}>
          {steps.map((s, i) => {
            const state = errored && i >= stepIdx ? (i === stepIdx ? 'error' : 'todo') : i < stepIdx ? 'done' : i === stepIdx ? 'active' : 'todo';
            return (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 12px', borderRadius: 10, background: state === 'active' || state === 'error' ? 'var(--bg-2)' : 'transparent' }}>
                <span style={{
                  width: 26, height: 26, flex: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: state === 'done' ? 'var(--green-soft)' : state === 'error' ? 'var(--fail-bg)' : state === 'active' ? 'var(--bg-3)' : 'var(--bg-2)',
                  border: `1px solid ${state === 'done' ? 'var(--green-line)' : state === 'error' ? 'var(--fail-line)' : 'var(--border)'}`,
                  color: state === 'done' ? 'var(--green-400)' : state === 'error' ? 'var(--fail)' : 'var(--text-lo)',
                }}>
                  {state === 'done' ? <Ic.check s={14} w={3} /> : state === 'error' ? <Ic.x s={14} w={3} /> : state === 'active' ? <Ic.refresh s={13} className="spin" /> : <span className="mono" style={{ fontSize: 11 }}>{i + 1}</span>}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: state === 'todo' ? 'var(--text-lo)' : 'var(--text-hi)' }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{s.detail}</div>
                </div>
                {state === 'active' && <span className="mono" style={{ fontSize: 11.5, color: 'var(--green-400)' }}>running</span>}
                {state === 'error' && <span className="mono" style={{ fontSize: 11.5, color: 'var(--fail)' }}>failed</span>}
              </div>
            );
          })}
        </div>

        <div className="card" style={{ overflow: 'hidden', background: 'var(--bg-0)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ display: 'flex', gap: 5 }}><span className="dot" style={{ background: '#3a3d42' }} /><span className="dot" style={{ background: '#3a3d42' }} /><span className="dot" style={{ background: '#3a3d42' }} /></span>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-lo)' }}>sandbox · live execution log</span>
            <span style={{ flex: 1 }} />
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-mid)' }}>est. ${cost.toFixed(3)}</span>
          </div>
          <div ref={logRef} className="mono" style={{ height: 168, overflowY: 'auto', padding: '12px 14px', fontSize: 12.5, lineHeight: 1.7 }}>
            {logs.map((l, i) => {
              const isCmd = l.line.startsWith('$') || l.line.startsWith('▶');
              const isErr = l.err || l.line.startsWith('  ✗');
              const isOk = !isErr && /passed|0 errors|OK|✓|p95|published|signed|reproduced|restored|found|reversible/.test(l.line);
              return (
                <div key={i} style={{ color: isErr ? 'var(--fail)' : isCmd ? 'var(--text-hi)' : isOk ? 'var(--green-300)' : 'var(--text-mid)', whiteSpace: 'pre-wrap' }}>
                  <span style={{ color: 'var(--text-dim)' }}>{String(l.step + 1)}› </span>{l.line}
                </div>
              );
            })}
            {!errored && <span style={{ color: 'var(--green-400)' }} className="caret">█</span>}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-dim)', marginTop: 14 }}>
          {errored
            ? 'Execution stopped — nothing is certified unless it actually runs.'
            : 'Codeceipt runs the code itself in a clean room — it never trusts the agent\u2019s \u201c\u2705 all done\u201d.'}
        </p>
      </div>
    </div>
  );
}

/* ---- error screen (timeout / rate limit) ---- */
function ExecError({ kind, targetUrl, onRetry, onCancel }) {
  const info = kind === 'timeout'
    ? { title: 'Verification timed out', icon: 'clock', msg: 'The sandbox exceeded its compute budget (600s) before all checks finished. No verdict is issued — Codeceipt never certifies a partial or guessed result.', detail: 'job exceeded compute budget · 600s' }
    : { title: 'Rate limited by GitHub', icon: 'bolt', msg: 'GitHub\u2019s API returned 403 while cloning. This is upstream, not your PR. Retry in a moment or connect GitHub for higher limits.', detail: 'GitHub API 403 · retry in 41s' };
  const I = Ic[info.icon];
  return (
    <div style={{ minHeight: 'calc(100vh - 0px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 18px', position: 'relative', overflow: 'hidden' }}>
      <div className="card fade-up" style={{ position: 'relative', width: '100%', maxWidth: 460, padding: 28, textAlign: 'center', borderColor: 'var(--fail-line)', boxShadow: 'var(--shadow-lg)' }}>
        <span style={{ width: 52, height: 52, margin: '0 auto 16px', borderRadius: 13, background: 'var(--fail-bg)', border: '1px solid var(--fail-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fail)' }}>
          <I s={24} />
        </span>
        <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>{info.title}</h2>
        <p style={{ fontSize: 14, color: 'var(--text-mid)', marginTop: 10, lineHeight: 1.5 }}>{info.msg}</p>
        <div className="mono" style={{ fontSize: 11.5, color: 'var(--fail)', marginTop: 14, padding: '9px 12px', background: 'var(--bg-0)', border: '1px solid var(--fail-line)', borderRadius: 8 }}>✗ {info.detail}</div>
        <div style={{ display: 'flex', gap: 9, marginTop: 18 }}>
          <button className="btn btn-ghost" onClick={onCancel} style={{ flex: 1 }}>← Back</button>
          <button className="btn btn-primary" onClick={onRetry} style={{ flex: 1 }}><Ic.refresh s={16} /> Retry</button>
        </div>
        <p style={{ fontSize: 11.5, color: 'var(--text-lo)', marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
          <Ic.shield s={12} /> No receipt is created from a failed run — by design.
        </p>
      </div>
    </div>
  );
}

Object.assign(window, { PasteBox, ExecLoader, ExecError, ConnectGate, SCENARIOS, SAMPLE_URL: SCENARIOS.verified.url });
