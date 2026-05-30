# Codeceipt

> **Ship AI code. Not AI slop.**
>
> A public, independently-verifiable receipt that proves an AI-authored pull request actually met its declared acceptance criteria — checked by execution, not by trusting the agent's self-report or another AI reviewing the same diff.

> **Stage:** MVP scoping → Builders Day Prague 2026-05-30 build sprint.
> **Author:** David Rajnoha — [davidrajnoha.dev](https://davidrajnoha.dev) · GitHub [@Rejnyx](https://github.com/Rejnyx)
> **Engine:** cortex-x v0.3.0 (2955 tests, 28 standards, Apache-2.0, public preview 2026-05-14). The web wrapper + GitHub Action are the Builders Day build.
> **SSOT note:** This file is the single source of truth for Codeceipt. The Builders Day pitch lives in [PITCH.md](./PITCH.md); research grounding in [RESEARCH-ANCHORS.md](./RESEARCH-ANCHORS.md); the decision trail that produced this positioning in [claude-session.md](./claude-session.md). Earlier, superseded drafts are in [archive/](./archive/).

---

## 1. What Codeceipt is, in one paragraph

AI agents (Claude Code, Cursor, Devin, Copilot, Replit) say "done — added the feature, wrote tests, all passing." That is just the agent's word. Agents skip steps, write tests that assert nothing, and report success anyway. **Codeceipt does not trust the word — it verifies the work.** When an AI agent opens a PR, Codeceipt re-runs the declared acceptance criteria by execution (run the tests for real, check the files exist, check the content matches, prove the agent actually read what it claims to have read), and emits a **public Receipt page** (`/r/<id>`) — a portable, third-party-checkable proof a freelancer sends a client, an auditor, or a boss. Run it from the first commit and the receipt isn't one end-of-project check — it's a **verified history** of the whole build that's far harder to fake.

This is a **gate with a public proof**, not a code reviewer. We do not "suggest improvements." We answer one question — *did the agent actually do what it claimed?* — and publish the answer.

---

## 2. The hero mechanism — spec-verifier

The core primitive (from cortex-x): before an action runs, the agent **declares its acceptance criteria** — "these must hold for this to count as done." The spec-verifier then checks each one independently and **fails closed** if any fails. Six criterion kinds:

| Kind | What it proves | Determinism |
|---|---|---|
| `shell` | A command exits clean (typically: tests actually pass) | Hard |
| `file_predicate` | A file exists / its content matches | Hard |
| `regex` | A required pattern is present | Hard |
| `read_set` | The agent actually read the files it claims it read | Hard |
| `ears_text` | The requirement is well-formed (EARS spec) | Structural |
| `llm_judge` | A second model rules yes/no where context matters | LLM (one juror only) |

**Where the AI is:** the system is **deterministic-first** (shell, file_predicate, regex, read_set). `llm_judge` is one juror used only where context genuinely matters — so you are not selling "another AI judging AI" (nobody trusts that). You are selling **machine-checked proof**, with AI as a small supporting check. Cost is ~$0.001 per scan.

**The wedge, in your case study's words:** mainstream agent runtimes (Devin, Cursor, Codex, OpenClaw) trust what the LLM says about itself. cortex-x writes the proof in code. Codeceipt exposes that proof publicly.

---

## 3. Why now — honest version

The generation problem is solved; **comprehension and review are the bottleneck**, and the verification gap is measurable:

| Signal | Number | Source |
|---|---|---|
| AI PR acceptance rate vs human | **32.7% vs 84.4%** | [LinearB 2026](https://linearb.io/resources/software-engineering-benchmarks-report) (8.1M PRs) |
| Review wait on AI PRs | **4.6× longer** | LinearB 2026 |
| AI delivery stability | **−7.2% / −19% slower delivery, +91% review time** | [DORA 2024](https://cloud.google.com/blog/products/devops-sre/announcing-the-2024-dora-report)/[2025](https://dora.dev/dora-report-2025/) |
| AI security findings | **10× spike in 6 months** (7K devs / 62K repos) | [Apiiro 2025](https://apiiro.com/blog/4x-velocity-10x-vulnerabilities-ai-coding-assistants-are-shipping-more-risks/) |
| AI code with an OWASP Top 10 vuln | **45%** (100+ LLMs, 80 tasks) | [Veracode 2025](https://www.veracode.com/blog/genai-code-security-report/) |
| Developer trust | **96% don't trust AI code in production** | [Sonar 2026](https://thenewstack.io/agentic-ai-verification-impact/) |

**Regulatory — the corrected, refutation-proof framing** (do not over-claim):

> The EU AI Act's high-risk regime is built on human oversight (Art. 14), risk management (Art. 9), and auditable quality records (Art. 17). In May 2026 the EU's **Digital Omnibus** moved the standalone high-risk deadline to **2 December 2027** — not because the requirements softened, but because organisations can't yet *evidence* human-in-the-loop control at scale. Codeceipt makes that oversight and audit trail provable ahead of the deadline.

**DO NOT SAY on stage** (all refutable):
- ❌ "EU law requires every PR to pass human review by August 2026." No such mandate exists.
- ❌ "Article 50 applies to AI-assisted production code." Art. 50 is deepfakes / synthetic-content / chatbot disclosure — not shipped application code.
- ❌ "The August 2, 2026 high-risk deadline is in force." As of 2026-05-07 it is being moved to **2 Dec 2027** (Digital Omnibus, *provisional* — formal adoption expected Jun–Jul 2026).

*(Full regulatory detail + sources: [RESEARCH-ANCHORS.md § EU AI Act](./RESEARCH-ANCHORS.md).)*

---

## 4. The competitive wedge — validated 2026-05-30

A web research sweep (2026-05-30) confirms: the AI-code-review category is crowded, but **the specific combination Codeceipt occupies is owned by nobody shipping today.** The space splits into three columns; everyone nails one or two, nobody all three:

| Column | Owns it | Misses |
|---|---|---|
| **Gate on declared acceptance criteria** | Spec-driven tools (Spec Kit, Kiro, Augment Intent) | Verify via the agent ticking its own boxes — the self-report failure mode |
| **Outcome-based (execution, not self-report)** | Swarm Orchestrator (OSS side project), Gitar | Private in-CI gate, no public artifact; or workflow-validation not criteria-vs-claim |
| **Public independently-verifiable artifact** | Compliance receipt players (PipeLab/Pipelock, APort, Mastercard Verifiable Intent) | Record *what happened* for compliance — don't gate on acceptance criteria, not coding-PR-tied |

**Why this is defensible:** AI code reviewers (CodeRabbit, Greptile, Qodo, Bito, Korbit) are structurally **circular** — an AI reviewer and AI author share a training distribution and reason from the same diff, so the review "checks code against itself, not against intent" ([arXiv 2603.25773](https://arxiv.org/pdf/2603.25773)). They emit a comment, not a proof. The load-bearing, currently-unclaimed words are **public + independently-verifiable + acceptance-criteria + by-execution, together.**

**Biggest pivot threat: Entire** (Thomas Dohmke, ex-GitHub CEO, $60M seed @ $300M, Feb 2026) — stores prompts/transcripts/constraints alongside commits. That is **provenance and record-keeping, not verification or gating** — but it owns the data substrate a verification layer would sit on, and is one product decision away. Secondary: eval vendors (Braintrust, Promptfoo) already gate merges on eval scores; closest *mechanism*. **Window: ~6–12 months.**

**Defensible one-liner:** *"A public, independently-verifiable receipt that proves an AI-authored PR actually meets its declared acceptance criteria — checked by execution, not by trusting the agent's self-report or another AI reviewing the same diff."*

---

## 5. The Receipt page — the differentiator

The Receipt page (`codeceipt.dev/r/<id>`) is the thing nobody else has. A Linear-tier, shareable, public URL showing: the declared criteria, per-criterion verdict (verified / failed), the diff, the cost ledger, and the run timeline.

- **For the freelancer:** proof to a non-technical client that the delivered AI code actually does what was claimed — without the client needing to read code.
- **Run from the first commit:** the artifact is not "it passed at the end" but **"the whole project was continuously verified — here's the trail."** That compounds and is much harder to fake.
- **Honest line to hold:** say *"verified that it meets the declared criteria continuously"* — not *"it's high quality."* Machines verify "the agent did what it declared" (objective); "quality" is a step further and subjective. Hold the defensible claim.

---

## 6. Surfaces + architecture (MVP)

Two surfaces, one engine:

- **Paste-mode (web):** drop a PR URL on `codeceipt.dev` → server fetches the diff via stored PAT → spawns engine → writes Receipt to Vercel KV → public `/r/<id>`. Zero-install demo distribution + indexable growth surface.
- **GitHub Action:** `uses: rejnyx/codeceipt@v1` on `pull_request` → runs in the user's GHA quota → posts PR comment + Check Run. **Marketplace publish is instant** (just tag a release).

**No GitHub App for MVP** — Marketplace review takes 2–6 weeks vs instant for an Action; OAuth + smee + JWT burns ~3h better spent on the engine + UI. GitHub App is the right **v0.2** surface (deeper, install-once-per-org), not the right MVP surface.

| Component | MVP | v0.2 |
|---|---|---|
| Receiver | Vercel Function (`maxDuration: 60`, `waitUntil()`) | Fly.io worker |
| Engine | `codeceipt-engine` npm pkg (cortex-x wrapped as CLI: `diff stdin → JSON verdict stdout`) | same |
| Storage | Vercel KV | Supabase Postgres |
| Auth | none (paste-mode anonymous, IP-rate-limited) | GitHub OAuth |
| Payments | Stripe Payment Link / Checkout | full Checkout |

Engine CLI contract:
```
$ codeceipt-engine --pr-url=https://github.com/owner/repo/pull/42 > verdict.json
{
  "verdict": "pass" | "fail" | "warn",
  "criteria": [{ "kind": "shell", "status": "pass", "detail": "..." }, ...],
  "cost_usd": 0.0012, "duration_ms": 28453, "engine_version": "0.3.0"
}
```

---

## 7. Builders Day MVP — what to actually ship today

Full pitch script, 7-hour plan, cut order, risk register, and Filip/Jakub framing: **[PITCH.md](./PITCH.md).**

Demo loop, built back-to-front from the 3-min pitch, never cut:
1. **One criterion kind end-to-end** (`shell` or `file_predicate` — hardest, least to break): PR → verifier checks one declared criterion → public URL with verdict.
2. **The public Receipt URL** — the differentiator. Without it, it's just another checker.
3. *Then* a second criterion + `read_set` as the "wow" moment.
4. Stripe last — it's validation, not core.

One sentence on stage: *"Agents say done and nobody checks they didn't lie. This verifies it in the code and hands you a proof the freelancer sends the client."*

---

## 8. Pricing — validation first, model later

**Today on stage, price is a test, not revenue.** Symbolic ~50 Kč via Stripe Checkout: if someone pays even that, it told you more than ten "nice"s. That's the whole MVP pricing question.

**Later model** — charge per **repo/project**, not per seat (the natural unit: one client project = one proof):
- **Free** on public/OSS repos — distribution + trust (people see it running on others' repos)
- **~5–15 €/mo** per private repo for the solo freelancer — the core target
- **Higher tier** for many concurrent client projects

Sharpest dividing line: **the check is cheap/free; the issued, verifiable client certificate is the paid thing** — that's what earns the freelancer trust (and a higher rate). Numbers are estimates; the real level comes from who actually pays. *(The enterprise/compliance tiers in earlier drafts are aspirational, not near-term — kept out of this SSOT on purpose.)*

---

## 9. Market + honest outcomes

The market is real and growing (Claude Code 4.2M weekly devs, Cursor $2B ARR Feb 2026, GitHub 518M PRs/yr 2025). The demand signal is loud (AI PRs 32.7% acceptance, 4.6× review waits). **But be honest about outcome:** a solo MVP built in a day is not an acquisition target, and "AI code review" is crowded. Realistic ceiling is a **strong portfolio piece + a tool you and a handful of others actually use + possibly a small SaaS with a few paying users** — which matches the operator's own "help a few people" ambition. Pitch what the tape shows; don't pitch unicorn math. The defensible long game, if it grows, is owning the **public-verifiable-proof** position before Entire or an eval vendor closes the window.

---

## 10. Roadmap

| Version | When | Ships |
|---|---|---|
| **v0.1 (MVP)** | 2026-05-30 | Paste-mode + GitHub Action + Receipt page + closed beta for the room |
| **v0.2** | June 2026 | GitHub App (full webhook) + GitHub OAuth + KV → Supabase |
| **v0.3** | July 2026 | More criterion kinds surfaced + private repos via PAT + billing |
| **v0.4** | Aug 2026 | Continuous-history receipts (per-commit trail) + audit-log export |
| **v1.0** | Q4 2026 | BYO criteria (per-org YAML) + non-GitHub CI (GitLab/CircleCI) |

---

## 11. Brand + license

| Decision | Rationale |
|---|---|
| **Codeceipt** | Invented compound (receipt for code). Zero prior art across npm/GitHub/USPTO (verified 2026-05-14). `.dev` + `.io` available. Czech-readable. |
| **Ship AI code. Not AI slop.** | Tagline — tweetable, signals what we're against |
| `Codeceipt: passed` / `Codeceipt: failed` | README badge — pass/fail matches engine output |
| *Plot kolem tvého AI kódu* | Czech sub-tagline ("fence" pun, CZ-only) |

Eliminated names: AgentFence, AgentGuard, SlopGuard, AIBrakes, AgentReceipt (all prior-art conflicts).

**License split:** `codeceipt-engine` (gate library) — **Apache 2.0** (inherits cortex-x). SaaS surfaces (web, Receipt UI, Action wrapper, billing) — **proprietary**. Same pattern as Vercel + Next.js: open engine, proprietary platform.

---

## 12. Why this matters

Built by a developer who got tired of debugging PRs his own AI agent shipped at 3 AM. The category is not "AI code review" (commoditized, circular). It is **"machine-checked, publicly-provable proof that an AI agent did what it claimed"** — a position currently splintered across code review (no proof), compliance receipts (no criteria gate), and spec tools (no independence), and owned end-to-end by nobody. For devs, by a dev. No VC deck. Just a gate that publishes the proof.
