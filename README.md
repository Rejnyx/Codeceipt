# Codeceipt

> **Ship AI code. Not AI slop.**
> A public, independently-verifiable receipt that proves an AI-authored pull request actually did what it claimed — checked by execution, not by trusting the agent's self-report.

The full brief, pitch, and research live in [`docs/`](./docs):

- [docs/README.md](./docs/README.md) — product SSOT (positioning, wedge, architecture)
- [docs/PITCH.md](./docs/PITCH.md) — Builders Day pitch + booth talking points
- [docs/RESEARCH-ANCHORS.md](./docs/RESEARCH-ANCHORS.md) — research grounding

## Stack

Next.js 16 · React 19 · TypeScript (strict) · Tailwind 4 · Vercel KV · Zod.

## Run it

```bash
pnpm install
cp .env.example .env.local   # optional — defaults run with zero config
pnpm dev
```

Open http://localhost:3000, paste a GitHub PR URL, get a Receipt at `/r/<id>`.

With no env set: the engine returns a **deterministic mock verdict** and receipts
are stored **in-memory**. Production wires the real engine (`CODECEIPT_ENGINE_MODE=cli`)
and Vercel KV.

## Architecture

```
PR URL / diff ─▶ /api/scan ─▶ lib/github (fetch diff)
                            ─▶ lib/engine (runEngine: mock | cli)   ◀── swap point
                            ─▶ lib/store  (Vercel KV | in-memory)
                            ─▶ /r/[id]    (public Receipt page)
```

The web app only ever calls `runEngine()` — it never knows whether the verdict
came from the mock or the real `codeceipt-engine` CLI. Extracting the engine from
cortex-x is a drop-in: implement the `diff in → JSON Verdict out` contract in
[lib/engine.ts](./lib/engine.ts) and set `CODECEIPT_ENGINE_MODE=cli`.
