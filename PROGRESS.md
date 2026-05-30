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
| S0.8 | **Website IA research** (what the site must contain) | in-progress |
| S0.9 | **Design pass** via /designer (hero, Receipt page, trust signals) | pending — blocked on S0.8 |
| S0.10 | **codeceipt-engine extraction** from cortex-x (`diff → JSON Verdict`) | pending — #1 dependency |
| S0.11 | Wire `CODECEIPT_ENGINE_MODE=cli` to real engine | blocked on S0.10 |
| S0.12 | Vercel KV provision + deploy to prod | pending |
| S0.13 | GitHub Action (`action.yml`, POST to /api/scan) → Marketplace tag | pending — cut candidate |
| S0.14 | Stripe Checkout (~50 Kč) validation + waitlist | pending — cut first |
| S0.15 | Backup screen recording of a real verified PR | pending |

## Engine extraction notes (S0.10)

- Source: cortex-x spec-verifier at `bin/steward/_lib/spec-verifier.cjs` + senior-tester action.
- Target contract: `codeceipt-engine --diff-stdin` reads a unified diff on stdin, prints a JSON `Verdict` (see `lib/types.ts`) on stdout. Exit 0 always; verdict carried in JSON.
- Six criterion kinds: shell · file_predicate · regex · read_set · llm_judge · ears.
- For MVP demo: mock is acceptable on stage if extraction slips (per PITCH.md risk register). Prefer the real engine for credibility.

## Cut order if time slips (from PITCH.md)

1. Stripe → waitlist · 2. second criterion kind → one · 3. Receipt sharing → private · 4. landing polish → template · 5. GitHub Action → "coming next week" · 6. **NEVER cut:** paste-mode + Receipt core + screen-recording fallback.

## Post-MVP backlog

- GitHub App (full webhook) · GitHub OAuth · KV → Supabase · per-commit verified history · audit-log export · BYO criteria (per-org YAML) · non-GitHub CI.
