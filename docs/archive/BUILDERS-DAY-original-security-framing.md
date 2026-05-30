# Builders Day Prague — Codeceipt application + pitch + 7h plan

> Event: **30. května 2026**, Praha, 10:00-17:00
> Kapacita: 15 účastníků
> Web: [buildersday.cz](https://buildersday.cz)
> Mentoři: Filip Kollert (Swipelux, fundraising advisor) + Jakub Sekula (full-stack consultant @ Quanti s.r.o.)

---

## 1. Application form — odpovědi

### Otázka: "Proč bychom měli vybrat právě tebe?"

> Jsem full-stack + agentic engineer s 17 lety za grafikou — to znamená, že umím postavit produkt i tvář produktu. Posledních 6 měsíců stavím **cortex-x** ([github.com/Rejnyx/cortex-x](https://github.com/Rejnyx/cortex-x)) — vlastní safety/quality framework pro AI coding agenty, který běží v noci a otevírá draft PRs do mých repů (15 cron workflows, 2955 testů, Apache-2.0, public preview shipnuto včera).
>
> Na Builders Day chci přinést **konkrétní nápad postavený na tomhle frameworku — Codeceipt**: SaaS gate, který fačně odmítne Pull Request, jestli by shipnul AI slop (security holes, missing RLS, broken specs, untested branches). Lovable v jednom CVE v 2026 expozoval 170+ apps. Moltbook leaknul 1,5M API klíčů — founder řekl, že "nenapsal jediný řádek kódu". Georgia Tech napočítal růst AI-CVE z 6 na 35+ měsíčně. EU AI Act má první compliance povinnosti od srpna 2026. **Codeceipt je ten guardrail, který tu chybí — gate před merge, ne komentář po faktu.**
>
> Co přináším do workshopu: hotový engine (cortex-x), validovaný nápad postavený na 5 paralelních web researchích (R1 discipline), připravenou architekturu (paste-mode web + GitHub Action, ne GitHub App kvůli rychlosti shippingu), free doménu `codeceipt.dev`, a 4-day fulltime plán okolo eventu. Co potřebuju od workshopu: 7-hodinový build sprint s peer pressure, 3-min pitch před Filipem + Jakubem + 14 builderů, a prvních 3 closed-beta uživatelů z místnosti.
>
> Trackrecord: 2/2 top 5% AI hackathon finishes (Fraud Detection 91/1979 + RELO 5/70 v 2025). Aktivně provozuju 5 produktů ve výrobě (RELO realitní AI agent, multi-tenant chatbot platforma s 5669 testy, WaaS šablona, kiosek pro restaurace, portfolio). Web: [davidrajnoha.dev](https://davidrajnoha.dev).
>
> **Nepřinesu hotový produkt — to by bylo proti smyslu workshopu. Přinesu framework + nápad + plán, a v Build Sprintech postavím s vámi MVP.** To, co normálně dev bez AI staví měsíc, dáme za den.

---

### Otázka: "Co chceš na workshopu postavit?"

> **Codeceipt** — pre-merge quality gate pro AI-generované Pull Requesty. Dvě surfaces: (1) web paste-mode na `codeceipt.dev` (drop PR URL, dostaneš shareable Receipt page se 6 quality gates), (2) GitHub Action `uses: rejnyx/codeceipt@v1` (CI plane integration). Engine je už hotový (postavený na mém cortex-x frameworku), na workshopu stavím web wrapper + Receipt UI + GitHub Action + landing page. Cíl po 17:00: working demo + 3 closed-beta uživatele z místnosti.

---

### Otázka: "Tvoje pozadí" (krátce)

> Full-stack developer · agentic engineer · 17 let grafiky · Ostrava CZ · 2/2 top 5% AI hackathon finalist 2025. Aktivně provozuju RELO (realitní AI agent), Chatbot platformu (5669 testů, klienti Amici + Objedname), WaaS šablonu (1007+ testů, Champions Barber), Kiosek pro restaurace, Portfolio. Cortex-x framework public preview shipnuto včera (2026-05-14). Web: [davidrajnoha.dev](https://davidrajnoha.dev).

---

## 2. 3-min stage pitch (česky, k naučení nazpaměť)

### 0:00–0:30 — Hook (problem + emotion anchor)

> V březnu 2026 napočítal Georgia Tech přes 35 AI-generated CVE jen za jeden měsíc. Lovable v jednom CVE expozoval 170 plus apps kvůli chybějícímu Row Level Security. Moltbook leaknul 1,5 milionu API klíčů — a founder publicly řekl, že 'nenapsal jediný řádek kódu'. Podle Sonar 2026 surveye 96 procent vývojářů nedůvěřuje AI kódu v produkci. A v srpnu 2026 jim k tomu přibyde EU AI Act compliance.

### 0:30–1:00 — Personal anchor

> Já si pro sebe ten plot postavil. Tohle je můj AI engineer — *cortex-x Steward*. Pracuje za mě v noci. Tady je PR, co otevřel včera v 03:42.

**[SCREEN RECORDING reálného Steward PR]**

### 1:00–2:00 — Product reveal

> Než ten PR vznikl, prošel **šesti quality gates**: security (OWASP Agentic Top 10 + 8-vrstvá obrana), SSOT enforcer, spec verifier, senior-tester review, OWASP vibe-coding patterns, mutation fitness baseline. Kdyby spadl jediný, PR by se neoznačil jako merge-ready.
>
> Dneska ten plot dávám vám. Drop GitHub PR URL na `codeceipt.dev` → **Codeceipt** rozhodne: shippable, nebo slop. A vrátí shareable Receipt page, kterou pošlete auditorovi, klientovi, nebo svému boss-ovi.

**[REVEAL landing page + receipt page demo]**

### 2:00–2:30 — Distribution + positioning

> Funguje jako web wrapper pro libovolný PR, a jako GitHub Action `uses: rejnyx/codeceipt@v1` ve tvém workflow. Open-source engine pod Apache 2.0 — fork it, run it locally, audit it. Proprietary jsou jen SaaS surfaces.
>
> Tohle není ďalší "AI code reviewer" — CodeRabbit, Greptile, Bito to dělají. Tohle je **gate, ne komentář**. Pass / fail před merge, ne suggestion po faktu.

### 2:30–3:00 — CTA

> Closed beta dnes. Tady QR. Free pro každého v této místnosti, lifetime grandfather. **Ship AI code. Not AI slop.**

**[QR code → codeceipt.dev/beta]**

---

## 3. 7-hour build plan (May 30, 10:30-16:00)

### Pre-workshop (do 30. května)

- [ ] Koupit `codeceipt.dev` (~$15/yr) + `codeceipt.io` (~$60/yr) na Porkbun nebo Cloudflare Registrar
- [ ] Extract cortex-x verifier engine jako standalone npm package `codeceipt-engine` (private):
  ```
  $ codeceipt-engine --diff < pr.diff > verdict.json
  $ codeceipt-engine --pr-url=https://github.com/owner/repo/pull/42 > verdict.json
  ```
  Output schema:
  ```json
  {
    "verdict": "pass" | "fail" | "warn",
    "gates": {
      "security": { "status": "pass", "details": [...] },
      "ssot": { "status": "fail", "details": [...] },
      "spec_verifier": { ... },
      "senior_tester": { ... },
      "mutation": { ... },
      "owasp_agentic": { ... }
    },
    "cost_usd": 0.0012,
    "duration_ms": 28453,
    "engine_version": "0.3.0"
  }
  ```
- [ ] Next.js + Vercel scaffold (`codeceipt-web` repo, private) — empty pages + Tailwind v4 + shadcn/ui seed
- [ ] Stripe Payment Link draft v účtu (jen dry-run config, nepublikovat)
- [ ] Screen recording cortex-x Steward otevírající real PR (backup pitch asset, 30-60s)

### Day-of build sprints

| Hour | Build target | Cut rank | Notes |
|---|---|---|---|
| **10:30-11:30** | Landing page (`codeceipt.dev`) — hero + tagline "Ship AI code. Not AI slop." + 6-gate vizualizace + 3 incident citations (Lovable / Moltbook / EU AI Act Aug 2026) + "Paste your PR" form | 4 (cut 4.) | Pre-scaffolded, sprint je copy + styling |
| **10:30-11:30 paralelně** | GitHub Action `action.yml` + Dockerfile/node20 runtime → publish v0.1 tag na Marketplace | 5 (cut 5.) | Marketplace publish je INSTANT (žádný review) |
| **11:30-12:30** | Paste-mode backend (`/api/scan` Vercel Function, `maxDuration: 60`, `waitUntil()`) — fetch PR diff via PAT, spawn engine, write to Vercel KV | **1 — NEVER cut** | Core ship |
| **12:30-13:30** | LUNCH + sanity-check engine output na real PRs | — | |
| **13:30-14:30** | Receipt page `/r/[id]` — Linear-tier UI: annotated diff + 6-gate breakdown + cost ledger + share button + PDF export | **2 — NEVER cut** | "Wow" surface |
| **14:30-15:30** | Stripe Payment Link ($29 Pro, $149 Team) + waitlist form pro Compliance | 6 (cut 1.) | Pricing není demo concern |
| **15:00-16:00** | Deploy to Vercel prod, smoke test na operator's cortex-x repo PRs | — | DNS propagation buffer |
| **15:30-16:00** | Pitch rehearsal + load backup screen recording (offline ready) | — | |
| **16:00-17:00** | 3-min pitch | — | |

### Cut order pokud slip H+5

1. **Stripe** → just waitlist form (free closed beta stačí — operator výslovně řekl "pricing pro MVP neřešíme")
2. Compliance tier zmínit jako "coming Q3 2026"
3. Receipt page sharing → private only
4. Landing polish → použít Vercel template
5. GitHub Action → "coming next week" (ale tag musí být published, ne demoed)
6. **NIKDY NECUT:** paste-mode + Receipt core + screen recording fallback

---

## 4. Strategic notes pro on-stage

### NEPOJMENOVAT na pódiu:
- "cortex-x" — to je internal framework, brand je Codeceipt
- "Steward" — interní action runner name
- "Multi-window USD caps", "6 criterion kinds", "spec_verifier" — backend detaily
- Žádný "I built 11 sprints in one day" technical flex — anti-credentialist room (per Builders Day copy)

### POJMENOVAT na pódiu:
- "Můj AI engineer" (lidsky)
- "Six quality gates" (concrete, ne technical jargon)
- "Vibe-coding incidents" — termín z trade press, room understands
- "EU AI Act August 2026" — primary forcing function (binary, regulated)
- Confidence-building citations: "Georgia Tech researcher", "Sonar 2026 survey", "Wiz security blog" — academic + trade press, ne marketing

### Filip Kollert framing (advisor, NE investor):
- Pitch B2B-API-fundraising-readiness, ne "invest in us"
- Kollert raised $2.5M na Swipelux od Outlier + Morgan Creek + Untapped + Golden Egg Check (NE čistý SF Sand Hill story)
- Jeho thesis: B2B GTM, API-first, compliance/regulated markets, fundraising storytelling
- Compliance tier ($1,499/mo + EU AI Act reporting) je přesně jeho jazyk

### Jakub Sekula framing (full-stack consultant):
- Brno, Masaryk Uni 2021-2023, PHP/Selenium/Docker/PostgreSQL stack
- Realistic feedback: "Cool, but how do I install in 2 minutes?"
- Připravit clean install demo: paste URL → 30s → receipt page. Žádné configuration.

### Audience read (15 people, mixed):
- Founders + freelancers + **marketers** + students + tech + creators
- Aspirational figures = Marc Lou, Pieter Levels (solo MVP-shippers)
- **Operator je over-qualified pro this room** — risk: "why does this person need our workshop?"
- Fix v application narrative: "Mám framework + nápad, použiju den na ship wrapper" (NE "explore idea")

---

## 5. Day-after follow-ups

1. **Pondělí 1. června:** WhatsApp/email follow-up s 3 closed-beta users z místnosti — bookings na 1:1 onboarding call
2. **První týden:** ship GitHub App v0.2 (post-Builders Day, full webhook integration)
3. **Druhý týden:** veřejný launch — Show HN + IndieHackers + ProductHunt + ship-in-public Twitter thread (Pieter Levels playbook)
4. **Třetí týden:** CZ outreach — Filip Kollert (B2B-API-fundraising consult), Vojta Roček (Presto Ventures, AI thesis), Ondrej Fryc (Reflex Capital, backed Supernova + Apify)
5. **Čtvrtý týden:** EU AI Act Article 50 transparency report feature design (Compliance tier launch prep před August 2 deadline)

---

## 6. Risk register

| Risk | Probability | Mitigation |
|---|---|---|
| Engine extraction (cortex-x → standalone CLI) trvá více než 2h | Med | Pre-workshop work, ne sprint task. Pokud nehotovo do 28. května, demo s direct cortex-x invocation (uglier UI, same engine) |
| Vercel `waitUntil()` 60s ceiling se trefí na 90s PR | Low | Fallback: in-Function 60s timeout + "scan timed out, retry" UX. Real users see this rarely. |
| Stage Wi-Fi padá → live demo nefunguje | Med | Backup screen recording vždy v ruce (rec před 9:00) |
| Filip nezareaguje na Czech pitch (UX preference English) | Low | Site je 100% CZ, room norm signal jednoznačný |
| Operator over-builds, podcení time budget | High | Buffer 30min H+5:30-6:00, cut order rigid |
| GitHub Action publishing fails den-of | Low | Tag locally před 14:00, push v 14:30, demo screen recording |
| Konkurent (Codacy Guardrails / GitGuardian / Snyk) lounchne identicky během dvou týdnů | Med-high | Apache 2.0 engine + speed-to-market + indie-dev-for-dev brand voice = defensible against enterprise SaaS me-too |

---

## 7. Reference materials

- [Codeceipt README](./README.md) — full MVP brief + competitive landscape + research grounding
- [cortex-x v0.3.0 chapter close commit](../cortex-x/.git) → tag `v0.3.0`, commits `92c06de` + `8357e84`
- [davidrajnoha.dev](https://davidrajnoha.dev) — operator portfolio
- 5 parallel R1 research memos (2026-05-14): GitHub App mechanics · competitive landscape · 1-day feasibility · Builders Day context · naming/domain
