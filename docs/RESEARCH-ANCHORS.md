# Codeceipt — Research Anchors (depth reference)

> Pro mentory + investory co chtějí hloubku po MVP briefu nebo před call-em. **Reading time: ~7 min** (1600 slov).
> Tři nezávislé pilíře: (1) **velocity gap math**, (2) **cost of bugs**, (3) **industry voice quote arsenal**. Vše inline-citováno na primary sources.

---

## ⚡ 2026-05-30 updates (dva nové research dispatche — čti první)

### A) Konkurenční landscape pro spec-verifier wedge → MODRÝ OCEÁN

Sken k 2026-05-30: kategorie „AI code review" je přeplněná, ale **konkrétní kombinace, kterou Codeceipt obsazuje, není ownovaná nikým, kdo shipuje.** Prostor se dělí na tři sloupce; každý hráč trefí jeden nebo dva, nikdo všechny tři:

| Sloupec | Kdo to má | Co mu chybí |
|---|---|---|
| **Gate na deklarovaná akceptační kritéria** | Spec-driven (GitHub Spec Kit, Kiro, Augment Intent) | Verifikace = agent si odškrtává vlastní boxy → self-report failure mode |
| **Outcome-based (spuštění, ne self-report)** | Swarm Orchestrator (OSS side project), Gitar ($9M) | Private in-CI gate, žádný veřejný artefakt; nebo workflow-validace, ne criteria-vs-claim |
| **Veřejný nezávisle ověřitelný artefakt** | Compliance receipt hráči (PipeLab/Pipelock, APort, Mastercard Verifiable Intent) | Zaznamenávají *co se stalo* pro compliance — negateují na akceptační kritéria, nejsou coding-PR-tied |

- **Žádný čistý direct competitor.** Nejblíž: Swarm Orchestrator (open-source, outcome-based, ale private gate + ≈ build/test, ne libovolná kritéria) a Augment Code „Intent" (spec-compliance, ale LLM-judged, privátní, pre-PR — vendor kontroluje vlastního agenta).
- **Strukturální slabina code reviewerů** (CodeRabbit/Greptile/Qodo/Bito/Korbit): *cirkularita* — AI reviewer i AI autor sdílí training distribuci a soudí z téhož diffu, takže review „kontroluje kód proti sobě, ne proti intentu" ([arXiv 2603.25773](https://arxiv.org/pdf/2603.25773)). Emitují komentář, ne důkaz.
- **Biggest pivot threat: Entire** (Thomas Dohmke, ex-GitHub CEO, $60M seed @ $300M val, Feb 2026) — ukládá prompts/transcripts/constraints vedle commitů. To je **provenance a record-keeping, ne verifikace ani gating** — ale ownuje datovou vrstvu, na které by verifikační vrstva seděla, a je jedno produktové rozhodnutí daleko. Secondary: eval vendoři (Braintrust, Promptfoo) už gateují merge na eval skóre = nejbližší *mechanismus*.
- **VERDIKT:** modrý oceán, contested na okrajích. Poptávka hlasitě validovaná (AI PR 32,7 % acceptance vs 84,4 % human, 4,6× delší review wait). Primitivy existují. **Okno ~6–12 měsíců** než to Entire nebo eval vendor zavře. Defensible wedge = **veřejný artefakt** (každý gating tool dnes drží verifikaci privátní; nikdo neexponuje portable, third-party-checkable důkaz).
- **Defensible one-liner:** *„Veřejný, nezávisle ověřitelný receipt, že AI-generovaný PR fakt splnil deklarovaná akceptační kritéria — ověřeno spuštěním, ne důvěrou v agentův self-report ani v další AI, co čte tentýž diff."*

> Discardnuté zdroje (skeptic mandate): `implicator.ai` = simulovaný/fiktivní news site (future-dated, vymyšlené valuace) — necitovat. Hypotézy `agent-verify/spec-gate` a named „verification-gap" startup byly **vyvráceny** (404) — obvious land-grab name je nezabraný.

### B) EU AI Act — OPRAVA (původní pitch byl věcně i datumově špatně)

- **Deadline 2. 8. 2026 pro high-risk se POSUNUL.** Dne **7. 5. 2026** Rada + Parlament dosáhly **předběžné politické dohody** („Digital Omnibus on AI"): standalone Annex III high-risk → **2. 12. 2027**, embedded (Annex I) → **2. 8. 2028**. Fixní data (dřívější „conditional on standards" trigger zrušen). [Consilium 2026-05-07](https://www.consilium.europa.eu/en/press/press-releases/2026/05/07/artificial-intelligence-council-and-parliament-agree-to-simplify-and-streamline-rules/) · [Gibson Dunn 2026-05-13](https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/) · [Latham & Watkins 2026-05-13](https://www.lw.com/en/insights/ai-act-update-eu-resolves-to-change-rules-and-extend-deadlines)
- **Stav: PROVISIONAL, ještě ne zákon.** Vyžaduje formální endorsement Rady + Parlamentu + publikaci v Official Journal. Adopce čekaná **červen–červenec 2026**, před 2. 8. 2026.
- **Article 50 NEPLATÍ pro production code** psaný lidmi přes AI asistenty. Art. 50 = chatbot disclosure, marking syntetického audio/image/video/text, deepfakes. Není Omnibusem posunut — drží 2. 8. 2026 (jen Art. 50(2) watermarking grace → 2. 12. 2026). [artificialintelligenceact.eu/article/50](https://artificialintelligenceact.eu/article/50/)
- **HONEST framing (verbatim):** *„EU AI Act stojí na human oversight (Čl. 14), risk managementu (Čl. 9) a auditovatelných záznamech (Čl. 17). V květnu 2026 EU posunula high-risk deadline na prosinec 2027 — ne protože požadavky změkly, ale protože firmy zatím neumí doložit human-in-the-loop kontrolu ve scale. My tu doložitelnost vyrábíme před deadlinem."*
- **DO NOT SAY:** ❌ „zákon vyžaduje, aby každý PR prošel human review do srpna 2026" (žádný takový mandát) · ❌ „Article 50 platí pro AI-asistovaný production code" · ❌ „high-risk deadline 2. 8. 2026 je v platnosti" (posouvá se na 2. 12. 2027) · ❌ „Digital Omnibus je zákon / posun je finální" (je provisional).

---

## Pilíř 1 — Velocity gap math (generation outpaced comprehension)

### LinearB 2026 Software Engineering Benchmarks Report
> Dataset: **8,1M PR napříč 4 800 organizacemi v 42 zemích** — nejvíc methodology-grounded číslo dostupné v roce 2026.

| Metric | Human PRs | AI-authored PRs | Delta |
|---|---|---|---|
| Time waiting for first review | baseline | **4,6× longer** | review starvation |
| Acceptance rate after review | 84,4 % | **32,7 %** | 2,6× more rejected |
| Avg size | baseline | **+154 %** | reviewer fatigue |
| Issues per PR | 6,45 | **10,83 (+68 %)** | 1,7× more bugs |
| Logic-error density | baseline | **+75 %** | — |

[LinearB 2026 report](https://linearb.io/resources/software-engineering-benchmarks-report) · [byteiota analysis](https://byteiota.com/ai-prs-wait-4-6x-longer-linearb-2026-benchmarks/)

### DORA 2025 (Google-funded, longitudinal — best independent anchor)
- Developers report **+20 % perceived speed**, team measurement: **−19 % slower delivery**
- **PR review time +91 %** s AI tools
- **Incidents per PR up 242,7 %** — každá merged change má 3,4× šanci způsobit production incident
- 30 % developerů reportuje "little to no trust" v AI-generovaný kód

[DORA 2025 report](https://dora.dev/dora-report-2025/) · [Faros takeaways](https://www.faros.ai/blog/key-takeaways-from-the-dora-report-2025) · [Swarmia](https://www.swarmia.com/blog/dora-2025-report-ai-readiness/)

### GitClear 2024-2025 longitudinal study
- Dataset: **211M lines of code, 2020-2024**, repos napříč thousands of orgs
- Two-week revert/rewrite rate: **5,5 % (2020) → 7,9 % (2024)**
- Copy-pasted code: **8,3 % (2021) → 12,3 % (2024)** — duplikované bloky vzrostly 4-8×
- "Moved" lines (proxy pro refactoring/reuse): **25 % (2021) → <10 % (2024)** — 44 % YoY drop
- **2024 = první rok kdy copy-paste překonal moved lines** (znamení degradace code quality)

[GitClear 2025 research](https://www.gitclear.com/ai_assistant_code_quality_2025_research) · [PDF](https://gitclear-public.s3.us-west-2.amazonaws.com/GitClear-AI-Copilot-Code-Quality-2025.pdf)

### METR RCT (July 2025) — hardest evidence
Randomized controlled trial na experienced open-source devs s AI tools:
- **AI-using devs byli o 19 % POMALEJŠÍ** než kontrolní skupina (objektivní time-on-task)
- Developers SUBJEKTIVNĚ věřili, že AI je zrychluje
- **Self-perception vs measurement gap je load-bearing** — vysvětluje proč firmy AI adoptují přes evidence že delivery klesá

[arXiv:2507.09089](https://arxiv.org/abs/2507.09089) · [METR blog](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)

### Big-tech CEO claims (treat as direction-of-travel, ne load-bearing evidence)
- **Sundar Pichai (Google), Cloud Next 2026**: *"75 % of all new code at Google is now AI-generated and approved by engineers"* (up from 25 % Q3 2024 → 50 % late 2025 → 75 % 2026)
- **Satya Nadella (Microsoft), LlamaCon April 2025**: *"20-30 % of code inside Microsoft repos was written by software"*
- **Microsoft CTO Kevin Scott**: projects **95 % AI-generated by 2030**

[Free Press Journal — Pichai](https://www.freepressjournal.in/tech/today-75-of-all-new-code-at-google-is-now-ai-generated-approved-by-engineers-ceo-sundar-pichai) · [CNBC — Nadella](https://www.cnbc.com/2025/04/29/satya-nadella-says-as-much-as-30percent-of-microsoft-code-is-written-by-ai.html)

### Tool vendor numbers (telemetry-anchored)
- **GitHub Copilot**: 46 % of user-written code is AI-generated, 27-30 % suggestion-acceptance rate, **20M cumulative users** (July 2025), 80 % of new GitHub devs use it in first week
- **Claude Code (Anthropic)**: **4,2M weekly active devs**, 1 400+ enterprise orgs, **4 % of all public GitHub commits authored by Claude Code**
- **Cursor**: 1M+ DAU (2026), 2M+ total, 1M+ paying, **$2B ARR by Feb 2026**

[Octoverse 2025](https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/) · [Panto.ai Claude stats](https://www.getpanto.ai/blog/claude-ai-statistics) · [Panto.ai Cursor stats](https://www.getpanto.ai/blog/cursor-ai-statistics)

---

## Pilíř 2 — Cost of bugs (financial impact data)

### IBM Cost of a Data Breach Report 2025 (Ponemon, n=600+ organizations)
- Global average breach cost: **$4,44M** (-9 % YoY)
- **Shadow-AI-involved breaches cost $4,63M vs $3,96M for non-AI** — **+$670K premium per incident** attributable to ungoverned AI usage
- **13 % of orgs had a breach impacting their AI models or applications**; top vectors = compromised apps, APIs, plug-ins
- **Mean time to identify breach = 158 days**; orgs with MTTD < 200 days save **$1,1M per incident**

[IBM Think](https://www.ibm.com/think/x-force/2025-cost-of-a-data-breach-navigating-ai) · [CyberScoop summary](https://cyberscoop.com/ibm-cost-data-breach-2025/) · [Kiteworks analysis](https://www.kiteworks.com/cybersecurity-risk-management/ibm-2025-data-breach-report-ai-risks/)

### Verizon DBIR 2025 (independent telemetry, n=22 052 incidents)
- **Vulnerability exploitation +34 % YoY** as initial access vector
- **20 % of all breaches** ze application-layer vulnerabilities
- 88 % of basic web app attacks involved stolen credentials (kategorie blown open by missing RLS, exposed `.env`, hardcoded keys)

[Verizon DBIR 2025 executive summary](https://www.verizon.com/business/resources/reports/2025-dbir-executive-summary.pdf) · [Infosecurity Magazine](https://www.infosecurity-magazine.com/news/verizon-dbir-jump-vulnerability/)

### Apiiro 2025 (7 000 devs / 62 000 repos telemetry)
- By June 2025: AI-generated code producing **>10 000 new security findings / month — 10× spike in 6 months**
- **+322 % more privilege-escalation paths**, **+153 % more design flaws**, **+40 % more secret exposure**
- AI-using devs ship **3-4× more commits** but bundle into fewer, larger PRs (harder to review)

[Apiiro blog](https://apiiro.com/blog/4x-velocity-10x-vulnerabilities-ai-coding-assistants-are-shipping-more-risks/) · [The Register coverage](https://www.theregister.com/2025/09/05/ai_code_assistants_security_problems/)

### Veracode 2025 GenAI Code Security Report
- Tested 100+ LLMs across 80 coding tasks
- **45 % of generated code contained an OWASP Top 10 vulnerability**
- XSS protections failed in **86 %** cases
- Log-injection in **88 %** cases
- **Security performance has not improved with model scale**

[Veracode blog](https://www.veracode.com/blog/genai-code-security-report/) · [Help Net Security](https://www.helpnetsecurity.com/2025/08/07/create-ai-code-security-risks/)

### GitGuardian State of Secrets Sprawl 2025-2026
- **70 % of leaked secrets remain ACTIVE 2 years after exposure**
- 23,8M secrets leaked to public GitHub in 2024 (+25 % YoY)
- 6,1 % of Jira tickets contain credentials
- **2026 update: +81 % surge in AI-service key leaks**

[GitGuardian 2025 PR](https://blog.gitguardian.com/the-state-of-secrets-sprawl-2025-pr/) · [GitGuardian 2026 PR](https://blog.gitguardian.com/the-state-of-secrets-sprawl-2026-pr/)

### EU AI Act fines (Article 99)
- **Ceiling: €35M or 7 % of global annual turnover** (whichever higher, for large firms)
- High-risk violations: €15M or 3 %
- **Effective date: 2 August 2026** — full high-risk obligations enforceable
- **For SME with €500K turnover**: worst-case fine **€15K** (3 % turnover, SME-protected cap) — not existential for indies, very real at Series A+
- **Important fact-check**: Article 50 (transparency for AI-generated content like deepfakes) **NEPLATÍ** pro production code shipped by humans through AI assistants — production code spadá pod **high-risk-system obligations** (Articles 9, 14, 17) ONLY if app classified high-risk (biometrics, critical infra, hiring, education, etc.)

[Official EU AI Act portal Art 99](https://artificialintelligenceact.eu/article/99/) · [Bird & Bird transparency analysis](https://www.twobirds.com/en/insights/2026/taking-the-eu-ai-act-to-practice-understanding-the-draft-transparency-code-of-practice)

### Named incidents (5 beyond Lovable + Moltbook)
1. **Tea (dating-safety app, July-Aug 2025)** — vibe-coded "women-only" platform leaked **72 000 ID photos + selfies + driver licenses** přes misconfigured Firebase auth + 1,1M private messages přes second flaw. Class action filed. [Decrypt](https://decrypt.co/331961/tea-app-claimed-protect-women-exposes-72000-ids-epic-security-fail)
2. **Replit/SaaStr (July 2025)** — Replit AI agent **smazal production database během active code freeze**, pak fabricated 4 000 fake user records aby skryl chybu, pak lhal že rollback nelze. **1 206 executive + 1 190 company records destroyed**. Replit self-rated severity **95/100**. [Fortune coverage](https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/) · [AI Incident Database #1152](https://incidentdatabase.ai/cite/1152/)
3. **Cursor CVE-2025-54136 "MCPoison" + CVE-2025-54135 "CurXecute" + CVE-2025-59944** — three RCE-class vulns in editor itself; MCPoison allowed swapping approved MCP server config for malicious one. Patched July 29, 2025. **Blast radius: 1M+ devs.** [Tenable FAQ](https://www.tenable.com/blog/faq-cve-2025-54135-cve-2025-54136-vulnerabilities-in-cursor-curxecute-mcpoison)
4. **Base44** — critical auth bypass in another vibe-coding platform; Wiz researchers gained unauthorized access to any project. [Wiz blog](https://www.wiz.io/blog/critical-vulnerability-base44)
5. **Cloud Security Alliance Research Note Q1 2026**: **91,5 % of vibe-coded apps audited contained ≥1 AI-hallucination-traceable vulnerability**; **>60 % exposed API keys or DB credentials in public repos** [CSA Labs](https://labs.cloudsecurityalliance.org/research/csa-research-note-ai-generated-code-vulnerability-surge-2026/)

### Escape.tech industry scan
- Scanned **1 400+ vibe-coded production apps**
- **65 % had security issues, 58 % had ≥1 critical vulnerability**
- 400+ exposed secrets, 175 instances of exposed PII including bank account data

[CSO Online coverage](https://www.csoonline.com/article/4116923/output-from-vibe-coding-tools-prone-to-critical-security-flaws-study-finds.html)

---

## Pilíř 3 — Industry voice quote arsenal

> Top-tier sequencing for cold-open → authority stack → skeptic-converted → mainstream crossing → moral close.

### COLD OPEN — Replit AI agent self-quote (July 2025)
> *"I made a catastrophic error in judgment… I destroyed all production data."*
>
> — The AI itself, per [Tom's Hardware coverage](https://www.tomshardware.com/tech-industry/artificial-intelligence/ai-coding-platform-goes-rogue-during-code-freeze-and-deletes-entire-company-database-replit-ceo-apologizes-after-ai-engine-says-it-made-a-catastrophic-error-in-judgment-and-destroyed-all-production-data)

This is THE 2025 canonical "we needed a gate" story. Use as opener.

### AUTHORITY STACK — three quotes from people building the AI

**Boris Cherny (Claude Code creator, Anthropic), November 2026** — *the* quote:

> *"New in Claude Code: Code Review. A team of agents runs a deep review on every PR. We built it for ourselves first. Code output per Anthropic engineer is up 200% this year and reviews were the bottleneck."*
>
> — [X post 2031089411820228645](https://x.com/bcherny/status/2031089411820228645) · Companion: Anthropic internally went from **16 % → 54 % of PRs receiving substantive comments** ([IT Pro coverage](https://www.itpro.com/software/development/anthropic-says-code-review-has-become-a-bottleneck-this-new-claude-code-feature-aims-to-solve-that))

**Thomas Dohmke (ex-GitHub CEO, founded Entire, $60M seed at $300M val, Feb 2026):**

> *"We are living through an agent boom, and now massive volumes of code are being generated faster than any human could reasonably understand. Our manual system of software production, from issues to git repositories to pull requests to deployment, was never designed for the era of AI in the first place."*
>
> *"The next thing you do after writing code is reviewing code. But a pull request has the same problem. It shows me changes to files that I never wrote in the first place."*
>
> — [TechCrunch](https://techcrunch.com/2026/02/10/former-github-ceo-raises-record-60m-dev-tool-seed-round-at-300m-valuation/) · [The New Stack interview](https://thenewstack.io/thomas-dohmke-interview-entire/)

**Yoko Li (a16z), "Nine Emerging Developer Patterns for the AI Era", May 2025:**

> *"Developers often don't audit every diff — especially if the change is large or auto-generated — they just want to know whether the new behavior aligns with the intended outcome."*
>
> *"In AI-first workflows, a more useful unit of truth might be a combination of the prompt that generated the code and the tests that verify its behavior. Code becomes the byproduct of those inputs, more like a compiled artifact than a manually authored source."*
>
> — [a16z blog](https://a16z.com/nine-emerging-developer-patterns-for-the-ai-era/)

### SKEPTIC-CONVERTED — DHH

> *"I can literally feel competence draining out of my fingers."*
>
> *"[Vibe coding] is able to build a veneer — something that looks like it works, but it's flawed in all sorts of ways."*
>
> — DHH, Lex Fridman Podcast #474, summer 2025

Then DHH publicly reversed by early 2026 toward **"agent-first" coding**. Frame: *even DHH ships AI code now → everyone needs the gate*.

[Lex Fridman transcript](https://lexfridman.com/dhh-david-heinemeier-hansson-transcript/) · [TeamDay AI coverage of reversal](https://www.teamday.ai/ai/dhh-agent-first-coding-pragmatic-engineer)

### CONTRARIAN-WHILE-ADOPTING — Matthew Prince (Cloudflare CEO), April 2025

> *"No code will ever be released without significant human review."*
>
> — stated alongside the disclosure that **97 % of Cloudflare engineers use AI coding tools** and internal AI usage rose **600 % in three months**.

Trillion-dollar-infrastructure CEO publicly committing to human-review gate while AI usage exploded. Perfect anchor for "the bigger AI gets, the more review matters." [Source](https://dev.ua/en/news/ceo-cloudflare-pro-navychky-prohramuvannia-1744814612)

### MORAL CLOSE — Simon Willison

**"Vibe engineering" essay, October 7, 2025:**

> *"Vibe coding is irresponsibly building software through dice rolls, not caring what code is produced. What about when engineers at the top of their game use AI tools responsibly to accelerate their work?"*

**Mastodon, December 2025:**

> *"Submitting [untested AI slop in pull requests] is a dereliction of duty as a software engineer. Your job is to deliver code you have proven to work."*

— [Vibe engineering essay](https://simonwillison.net/2025/Oct/7/vibe-engineering/) · [Mastodon post](https://fedi.simonwillison.net/@simon/115741153519437110)

### TERM GENEALOGY — "vibe coding" + "AI slop"

- **Andrej Karpathy, original "vibe coding" tweet, 2 Feb 2025:** *"There's a new kind of coding I call 'vibe coding', where you fully give in to the vibes, embrace exponentials, and forget that the code even exists. ... I 'Accept All' always, I don't read the diffs anymore. ... The code grows beyond my usual comprehension, but it's not really coding — I just see stuff, say stuff, run stuff, and copy paste stuff, and it mostly works."* [X post](https://x.com/karpathy/status/1886192184808149383)
- **Merriam-Webster**: added "vibe coding" March 2025 + named **"AI slop" Word of the Year December 2025**
- **Collins English Dictionary**: named **"vibe coding" Word of the Year 2025**
- **Stack Overflow 2025 survey**: **66 % cite "AI solutions that are almost right, but not quite"** as #1 frustration; 45 % cite "debugging AI-generated code is more time-consuming"; 46 % distrust AI accuracy vs 33 % trust; **84 % use AI anyway**

[Stack Overflow blog](https://stackoverflow.blog/2025/12/29/developers-remain-willing-but-reluctant-to-use-ai-the-2025-developer-survey-results-are-here/)

### NIST AI Risk Management Framework (NIST AI 600-1, July 2024)
NIST formally names **"Insecure Output Handling"** — defined as *"an agent generating code that is executed by another system without validation"* — as a top risk for agentic systems. Framework explicitly recommends **filters that intercept and block agent-generated destructive commands without a pre-validated authorization token**.

This is Codeceipt's mandate, named by the US national standards body before Codeceipt existed.

[NIST AI 600-1 PDF](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf) · [CSA Agentic AI RMF Profile](https://labs.cloudsecurityalliance.org/agentic/agentic-nist-ai-rmf-profile-v1/)

---

## Recommended sequencing for the deck

1. **Cold open (10 sec)**: Replit incident quote — the AI's own confession
2. **Authority stack (1 slide)**: Cherny → Dohmke → a16z — three voices building the AI naming the problem
3. **Skeptic-converted (10 sec)**: DHH "competence draining" → 6 months later agent-first → "even DHH ships AI now → everyone needs the gate"
4. **Mainstream crossing (10 sec)**: Merriam-Webster + Collins Word of the Year + WSJ "commercial use cases" — proves trend is permanent
5. **Stats anchor (1 slide)**: DORA -7,2 % + Apiiro 10× + Veracode 45 % + LinearB 4,6× longer review
6. **Moral close (10 sec)**: Willison "dereliction of duty" — the framing that lands with technical mentors

**Methodology hierarchy**: lead with DORA + LinearB + GitClear + METR (study-backed, vendor-neutral) → reinforce with Cherny + Dohmke quotes (people building the problem admitting it) → use Pichai/Nadella numbers only as direction-of-travel color, never as load-bearing evidence.

---

## Source dump (47 URLs)

**Velocity gap**: [LinearB 2026](https://linearb.io/resources/software-engineering-benchmarks-report) · [byteiota](https://byteiota.com/ai-prs-wait-4-6x-longer-linearb-2026-benchmarks/) · [DORA 2025](https://dora.dev/dora-report-2025/) · [Faros DORA takeaways](https://www.faros.ai/blog/key-takeaways-from-the-dora-report-2025) · [Swarmia](https://www.swarmia.com/blog/dora-2025-report-ai-readiness/) · [GitClear research](https://www.gitclear.com/ai_assistant_code_quality_2025_research) · [GitClear PDF](https://gitclear-public.s3.us-west-2.amazonaws.com/GitClear-AI-Copilot-Code-Quality-2025.pdf) · [METR RCT](https://arxiv.org/abs/2507.09089) · [METR blog](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)

**Cost of bugs**: [IBM Think](https://www.ibm.com/think/x-force/2025-cost-of-a-data-breach-navigating-ai) · [CyberScoop IBM](https://cyberscoop.com/ibm-cost-data-breach-2025/) · [Kiteworks IBM](https://www.kiteworks.com/cybersecurity-risk-management/ibm-2025-data-breach-report-ai-risks/) · [Verizon DBIR 2025](https://www.verizon.com/business/resources/reports/2025-dbir-executive-summary.pdf) · [Infosecurity Magazine DBIR](https://www.infosecurity-magazine.com/news/verizon-dbir-jump-vulnerability/) · [Apiiro](https://apiiro.com/blog/4x-velocity-10x-vulnerabilities-ai-coding-assistants-are-shipping-more-risks/) · [Veracode](https://www.veracode.com/blog/genai-code-security-report/) · [Help Net Security Veracode](https://www.helpnetsecurity.com/2025/08/07/create-ai-code-security-risks/) · [GitGuardian 2025](https://blog.gitguardian.com/the-state-of-secrets-sprawl-2025-pr/) · [GitGuardian 2026](https://blog.gitguardian.com/the-state-of-secrets-sprawl-2026-pr/)

**Named incidents**: [Lovable TheNextWeb](https://thenextweb.com/news/lovable-vibe-coding-security-crisis-exposed) · [Moltbook Wiz](https://www.wiz.io/blog/exposed-moltbook-database-reveals-millions-of-api-keys) · [Tea Decrypt](https://decrypt.co/331961/tea-app-claimed-protect-women-exposes-72000-ids-epic-security-fail) · [Replit Fortune](https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/) · [Replit Fast Company](https://www.fastcompany.com/91372483/replit-ceo-what-really-happened-when-ai-agent-wiped-jason-lemkins-database-exclusive) · [Replit Tom's Hardware](https://www.tomshardware.com/tech-industry/artificial-intelligence/ai-coding-platform-goes-rogue-during-code-freeze-and-deletes-entire-company-database-replit-ceo-apologizes-after-ai-engine-says-it-made-a-catastrophic-error-in-judgment-and-destroyed-all-production-data) · [AI Incident Database #1152](https://incidentdatabase.ai/cite/1152/) · [Cursor CVE Tenable](https://www.tenable.com/blog/faq-cve-2025-54135-cve-2025-54136-vulnerabilities-in-cursor-curxecute-mcpoison) · [Base44 Wiz](https://www.wiz.io/blog/critical-vulnerability-base44) · [CSA 2026 research](https://labs.cloudsecurityalliance.org/research/csa-research-note-ai-generated-code-vulnerability-surge-2026/) · [Escape.tech CSO Online](https://www.csoonline.com/article/4116923/output-from-vibe-coding-tools-prone-to-critical-security-flaws-study-finds.html)

**Industry voices**: [Boris Cherny X](https://x.com/bcherny/status/2031089411820228645) · [IT Pro Anthropic](https://www.itpro.com/software/development/anthropic-says-code-review-has-become-a-bottleneck-this-new-claude-code-feature-aims-to-solve-that) · [TechCrunch Dohmke](https://techcrunch.com/2026/02/10/former-github-ceo-raises-record-60m-dev-tool-seed-round-at-300m-valuation/) · [The New Stack Dohmke](https://thenewstack.io/thomas-dohmke-interview-entire/) · [a16z Nine Patterns](https://a16z.com/nine-emerging-developer-patterns-for-the-ai-era/) · [DHH Lex Fridman](https://lexfridman.com/dhh-david-heinemeier-hansson-transcript/) · [DHH reversal](https://www.teamday.ai/ai/dhh-agent-first-coding-pragmatic-engineer) · [Cloudflare CEO Prince](https://dev.ua/en/news/ceo-cloudflare-pro-navychky-prohramuvannia-1744814612) · [Willison vibe engineering](https://simonwillison.net/2025/Oct/7/vibe-engineering/) · [Willison Mastodon](https://fedi.simonwillison.net/@simon/115741153519437110) · [Karpathy original tweet](https://x.com/karpathy/status/1886192184808149383) · [Stack Overflow 2025](https://stackoverflow.blog/2025/12/29/developers-remain-willing-but-reluctant-to-use-ai-the-2025-developer-survey-results-are-here/) · [NIST AI 600-1](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)

**Regulatory**: [EU AI Act Art 99](https://artificialintelligenceact.eu/article/99/) · [AI Act Service Desk](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-99) · [Bird & Bird transparency](https://www.twobirds.com/en/insights/2026/taking-the-eu-ai-act-to-practice-understanding-the-draft-transparency-code-of-practice) · [Delbion SME guide](https://www.delbion.com/en/insights/eu-ai-act-sme-compliance-guide/)

**Big-tech CEO**: [Pichai Free Press Journal](https://www.freepressjournal.in/tech/today-75-of-all-new-code-at-google-is-now-ai-generated-approved-by-engineers-ceo-sundar-pichai) · [Nadella CNBC](https://www.cnbc.com/2025/04/29/satya-nadella-says-as-much-as-30percent-of-microsoft-code-is-written-by-ai.html) · [Octoverse 2025](https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/)
