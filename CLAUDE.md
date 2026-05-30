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
| Engine | `lib/engine.ts` adapter: `mock` (default) \| `cli` (extracted cortex-x) |
| Deploy | Vercel (`waitUntil`, `maxDuration: 60`) |
| Package manager | **pnpm** |

## Architecture

```
PR URL / diff ─▶ /api/scan ─▶ lib/github  (fetch PR diff)
                            ─▶ lib/engine  (runEngine: mock | cli)  ◀── ENGINE SWAP POINT
                            ─▶ lib/store   (Vercel KV | in-memory)
                            ─▶ /r/[id]     (public Receipt page)
```

- **Engine boundary is sacred:** the web only ever calls `runEngine(diff): Promise<Verdict>`. It never knows mock vs real. Extract cortex-x → implement `diff stdin → JSON Verdict stdout`, set `CODECEIPT_ENGINE_MODE=cli`. Do not leak engine internals into the web layer.
- **Verdict/Receipt schema** is the contract — defined once in `lib/types.ts` (Zod). Mock and CLI both must satisfy it. SSOT.
- Receipts are public artifacts; `/r/[id]` is server-rendered, shareable, indexable.

## Commands

```bash
pnpm dev         # local dev (http://localhost:3000)
pnpm build       # production build
pnpm typecheck   # tsc --noEmit
pnpm start       # serve production build
```

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
- Routes: `/`, `/api/scan`, `/r/[id]`
- Build: green (typecheck + next build)

## Open dependencies (see PROGRESS.md)

- **codeceipt-engine NOT yet extracted** from cortex-x — web runs on the mock. This is the #1 build dependency for a real demo.
