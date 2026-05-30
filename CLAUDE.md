# CLAUDE.md — Codeceipt

> Project-level instructions + **current state**. Institutional wisdom (lessons, standards) lives in cortex-x / `~/.claude/CLAUDE.md` — not here. This file changes as the stack changes.
>
> **Product SSOT:** [docs/README.md](./docs/README.md) · **Pitch:** [docs/PITCH.md](./docs/PITCH.md) · **Research:** [docs/RESEARCH-ANCHORS.md](./docs/RESEARCH-ANCHORS.md)

## What this is

Codeceipt verifies that an AI-authored PR actually did what it claimed — by execution, not by trusting the agent's self-report — and issues a **public, independently-verifiable Receipt page** a freelancer sends a client. Positioning hero = **spec-verifier** (the wedge), not security/quality. See docs/README.md §2, §4.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) + React 19 |
| Language | TypeScript strict |
| Styling | Tailwind CSS 4 (zero-config, `@theme` in globals.css) |
| Validation | Zod (trust-boundary parsing in `/api/scan`) |
| Storage | Vercel KV (prod) · in-memory fallback (local, zero-config) |
| Engine | **`@codeceipt/engine`** (packages/engine, Apache-2.0) — `verifyDiff(diff)`; web wraps via `lib/engine.ts` (`static` \| `mock`) |
| Deploy | Vercel (`waitUntil`, `maxDuration: 60`) |
| Repo | **pnpm monorepo** — web at root, engine in `packages/engine` |
| Package manager | **pnpm** |

## Architecture

```
PR URL / diff ─▶ /api/scan ─▶ lib/github         (fetch PR diff)
                            ─▶ lib/engine          (runEngine: static | mock)
                            ─▶ @codeceipt/engine    (verifyDiff: real diff verification)
                            ─▶ lib/store           (Vercel KV | in-memory)
                            ─▶ /r/[id]             (public Receipt page)
```

- **Engine boundary is sacred:** the web only ever calls `runEngine(diff): Promise<Verdict>` (in `lib/engine.ts`). It never reaches into `@codeceipt/engine` internals. `static` = real diff verification; `mock` = deterministic offline demo.
- **Engine modes:** static mode verifies diff-only criteria (regex secrets, file_predicate, read_set, ears). Executable criteria (`shell` tests, on-disk `file_predicate`) light up only with a working tree — that's the GitHub Action surface (`verifyDiff(diff, { workingDir })`). Static mode is honest about what it can't prove from a diff alone.
- **Binary gate:** overall verdict is `pass | fail`, driven only by **blocking** criteria (secrets always; tests + on-disk files when a working tree is present). **Advisory** checks (read_set, ears, "no tests touched") and **skipped** checks (test execution in paste mode) render as rows but never block a merge. Each criterion carries `blocking: boolean` + `status: pass|fail|warn|skipped`.
- **Verdict schema is the SSOT** — defined once in `packages/engine/src/types.ts` (Zod). Web re-exports it via `lib/types.ts` and extends it to `Receipt`. Engine + web + CLI all satisfy it.
- Receipts are public artifacts; `/r/[id]` is server-rendered, shareable, indexable.

## Commands

```bash
pnpm dev         # local dev (http://localhost:3000)
pnpm build       # production build (web; Turbopack transpiles the engine src)
pnpm typecheck   # web tsc --noEmit + engine typecheck
pnpm start       # serve production build
pnpm engine      # run the engine CLI (tsx): diff on stdin -> JSON verdict
```

Note: the web consumes `@codeceipt/engine` from **source** via `transpilePackages`
(no build step); the engine CLI runs via `tsx`. Engine imports are extensionless
(bundler resolution) — a published Action binary would bundle (tsup) to add `.js`.

## Env vars

See [.env.example](./.env.example). Runs with **zero config** (mock engine + in-memory store). For real use: `CODECEIPT_ENGINE_MODE=cli` + `CODECEIPT_ENGINE_BIN`, `GITHUB_TOKEN` (private repos), `KV_REST_API_URL` + `KV_REST_API_TOKEN`.

## Conventions

- Czech in UI copy where user-facing to CZ audience; **English in code, comments, commit messages**.
- Validate all external input at the boundary (`/api/scan` uses Zod `safeParse`).
- TypeScript strict — no `any` escape hatches.
- Surgical changes; no speculative abstraction beyond the engine boundary already in place.
- No secrets in the repo. Engine code is Apache-2.0; SaaS surfaces proprietary.

## Stats

- Stage: greenfield MVP, Builders Day Prague 2026-05-30
- Routes: `/`, `/api/scan`, `/r/[id]` · Packages: `@codeceipt/engine`
- Build: green (engine tsc + root typecheck + next build); CLI smoke-tested
- Engine: real diff-based verification (regex/file_predicate/read_set/ears + shell static-aware)

## Open dependencies (see PROGRESS.md)

- **Working-tree mode** (real `shell`/`read_set` execution) — needs the GitHub Action surface (clone + run). Static paste-mode is honest that it can't run tests from a diff.
- **`llm_judge` wiring** (intent match) — optional, gated behind an API key.
- **Deploy** — Vercel KV provision + prod deploy.
