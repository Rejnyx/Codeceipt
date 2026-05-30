# PROGRESS — Codeceipt

> Sprint tracking. States: pending / in-progress / done / blocked.
> Builders Day Prague 2026-05-30. Critical path: engine → /api/scan → Receipt page.

## Sprint 0 — Builders Day MVP (2026-05-30)

| Story | Popis | Stav |
|---|---|---|
| S0.1 | Docs consolidation → spec-verifier SSOT (README/PITCH/RESEARCH) | done |
| S0.2 | Git repo connected to github.com/Rejnyx/Codeceipt + pushed | done |
| S0.3 | Next.js 16 scaffold (App Router, TS strict, Tailwind 4) | done |
| S0.4 | Engine boundary `lib/engine.ts` (mock \| cli) + Verdict schema | done |
| S0.5 | `/api/scan` — fetch diff (PR URL), run engine, store, return id | done |
| S0.6 | Public Receipt page `/r/[id]` | done |
| S0.7 | Landing page + paste form | done (baseline — design pass pending) |
| S0.8 | **Website IA research** (what the site must contain) | done → docs/DESIGN-BRIEF.md |
| S0.9 | **Design pass** via /designer (hero, Receipt page, trust signals) | pending (brief ready) |
| S0.10 | **`@codeceipt/engine` in-repo** (pnpm monorepo, real diff verification) | done |
| S0.11 | Wire web → engine in-process (`static` mode) + CLI bin | done |
| S0.16 | **R2 review pipeline** on engine + monorepo (subagents) | done — 36→15 confirmed, fixes applied |
| S0.18 | **Unit tests** (vitest) on engine + parsePrUrl — 41 passing | done |
| S0.19 | **E2E manual verify** (paste diff → Receipt renders verdict) | done |
| S0.17 | Working-tree mode (real `shell`/`read_set`) via GitHub Action | pending — needs sandbox (see R2 notes) |
| S0.12 | Vercel KV provision + deploy to prod | pending |
| S0.13 | GitHub Action (`action.yml`, POST to /api/scan) → Marketplace tag | pending — cut candidate |
| S0.14 | Stripe Checkout (~50 Kč) validation + waitlist | pending — cut first |
| S0.15 | Backup screen recording of a real verified PR | pending |

## Engine extraction notes (S0.10)

- Source: cortex-x spec-verifier at `bin/steward/_lib/spec-verifier.cjs` + senior-tester action.
- Target contract: `codeceipt-engine --diff-stdin` reads a unified diff on stdin, prints a JSON `Verdict` (see `lib/types.ts`) on stdout. Exit 0 always; verdict carried in JSON.
- Six criterion kinds: shell · file_predicate · regex · read_set · llm_judge · ears.
- For MVP demo: mock is acceptable on stage if extraction slips (per PITCH.md risk register). Prefer the real engine for credibility.

## R2 review (2026-05-30) — 36 raw → 15 confirmed, fixes applied

**Applied:** shell:false + env-scrub + 120s timeout on `npm test` (CWE-78); github.ts URL host-allowlist + segment validation + `encodeURIComponent` + `redirect:error` + AbortController timeout + size cap (CWE-918/path-injection); diff size cap in `verifyDiff` + Zod `.max()` (CWE-1333 DoS); parseDiff now seeds path from `diff --git` header, handles rename/binary, and preserves `++`/`--` content lines; Receipt page Invalid-Date guard; store.ts prod KV warning; generic `/api/scan` error (CWE-209) + removed dead `repo` fallback; mockVerdict uses `rollUp` + mirrors real criteria (dropped fabricated llm_judge).

**Deferred (not live in MVP — gated behind working-tree mode S0.17):**
- Full **sandbox** (container/gVisor/Firecracker, network egress off, read-only FS, CPU/mem limits) is the gate before running `npm test` on attacker-controlled repos. Env-scrub + timeout done; sandbox required before S0.17 ships.
- Path-traversal containment for on-disk `file_predicate` (`path.resolve` + workingDir prefix check) — implement with S0.17.
- Shared label constants between criteria.ts and mockVerdict — minor SSOT follow-up.

## Verdict model — binary gate (2026-05-30)

Driven by a real-repo test finding: in paste mode every clean PR rolled up to `warn` (un-runnable `shell` dragged the verdict), so there was no green "passed". Fixed to a **binary gate**: overall = `fail` iff a **blocking** check fails (secrets); advisory + **skipped** (test-exec in paste mode) never block. Clean code → **pass**, slop with secrets → **fail**. Criterion gains `blocking` + `skipped` status. Validated on real repos (back-office-bot, cortex-x → pass; no false-positive secrets) + fixtures (bad-leaked-secret → fail).

## Tests + verification (2026-05-30)

- **41 unit tests passing** (vitest): `packages/engine/src/{diff,criteria,index}.test.ts` + `lib/github.test.ts`. Cover parseDiff edge cases (rename/binary/CRLF/`++`/`--`/multi-file), all secret patterns, verdict roll-up + schema conformance, mockVerdict shape, and the security-critical `parsePrUrl` (host allowlist, userinfo trick, traversal). Run: `pnpm test`.
- **E2E manually verified**: `pnpm dev` → `POST /api/scan` (secret diff) → `201 {id}` → `GET /r/<id>` renders verdict **failed** + per-criterion breakdown. Full paste → Receipt flow works.

## Cut order if time slips (from PITCH.md)

1. Stripe → waitlist · 2. second criterion kind → one · 3. Receipt sharing → private · 4. landing polish → template · 5. GitHub Action → "coming next week" · 6. **NEVER cut:** paste-mode + Receipt core + screen-recording fallback.

## Post-MVP backlog

- GitHub App (full webhook) · GitHub OAuth · KV → Supabase · per-commit verified history · audit-log export · BYO criteria (per-org YAML) · non-GitHub CI.
