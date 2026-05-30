# Codeceipt — MVP Brief

> **Ship AI code. Not AI slop.**
>
> Pre-merge quality gate pro AI-generated Pull Requests. Šest nezávislých kontrol, jeden verdikt, jedna shareable Receipt page.

---

## Proč to potřebuje vzniknout teď

[DORA Report 2024](https://cloud.google.com/blog/products/devops-sre/announcing-the-2024-dora-report) (Google-funded, longitudinal, dva roky dat) ukazuje, že AI adoption měřitelně **zhoršuje delivery stability o 7,2 %**. Mechanismus: AI nedělá kód horší, dělá **batche větší** — a větší batche se hůř review-ují a častěji rozbijou produkci. [Apiiro telemetrie 2025](https://apiiro.com/blog/4x-velocity-10x-vulnerabilities-ai-coding-assistants-are-shipping-more-risks/) ze 7 000 devů a 62 000 repů potvrzuje: AI-using developers shipnou **4× víc commitů a 10× víc security findings** za měsíc. [Veracode 2025](https://www.veracode.com/blog/genai-code-security-report/) testoval 100+ LLMs napříč 80 coding tasks — **45 % AI-generovaného kódu obsahuje OWASP Top 10 vulnerabilitu**.

Praktické dopady: [Lovable v jednom CVE](https://thenextweb.com/news/lovable-vibe-coding-security-crisis-exposed) (CVE-2025-48757, CVSS 9.3) expozoval **170+ apps**. [Moltbook leaknul 1,5 milionu API klíčů](https://www.wiz.io/blog/exposed-moltbook-database-reveals-millions-of-api-keys) — founder veřejně přiznal, že "nenapsal jediný řádek kódu". V červenci 2025 [Replit agent smazal produkční databázi během code freeze](https://www.fastcompany.com/91372483/replit-ceo-what-really-happened-when-ai-agent-wiped-jason-lemkins-database-exclusive), pak fabricated 4 000 fake user records aby to skryl. [IBM Cost of Data Breach 2025](https://www.ibm.com/think/x-force/2025-cost-of-a-data-breach-navigating-ai): průměrný breach **$4,44M**, shadow-AI premium **+$670K na incident**.

**2. srpna 2026 vstupují v platnost první compliance povinnosti EU AI Act** — high-risk system obligations (Article 9 risk management, Article 14 human oversight, Article 17 quality management system). Fines až **€35M / 7 % global turnover** dle Article 99.

[Boris Cherny, creator of Claude Code (Anthropic)](https://x.com/bcherny/status/2031089411820228645), v listopadu 2026 veřejně potvrdil: *"Code output per Anthropic engineer is up 200% this year and reviews were the bottleneck."* Generování se vyřešilo. Comprehension a review ne. Žádný existující nástroj ten **slop bottleneck** neřeší **před merge** — jen po faktu (monitoring, observability, post-incident).

---

## Co Codeceipt dělá

Gate, ne reviewer. Když AI agent (Cursor / Claude Code / Devin / Replit / Copilot) otevře PR, Codeceipt fetchne diff a prožene ho **šesti nezávislými kontrolami**:

1. **Security** — OWASP Agentic Top 10 + 8-vrstvá obrana
2. **SSOT enforcer** — duplikovaná znalost napříč diff hunky
3. **Spec verifier** — 6 typů akceptačních kritérií (shell, file_predicate, regex, EARS, LLM-judge, read_set)
4. **Senior-tester review** — netestované error-handler větve
5. **Mutation fitness** — Stryker baseline (tests pass ≠ tests cover)
6. **Vibe-coding patterns** — Lovable-class (RLS missing), Moltbook-class (API key client-side)

Výstup: pass/fail verdikt v PR + **Linear-tier Receipt page** (`codeceipt.dev/r/<id>`) se shareable linkem pro auditora, klienta, nebo compliance team.

Dvě distribution surfaces: web paste-mode (drop PR URL) + GitHub Action (`uses: rejnyx/codeceipt@v1`). Engine je **deterministic-first** (regex, AST, Stryker), LLM jen jako judge kde context matters — **~$0.001 za sken**.

---

## Wedge

CodeRabbit, Greptile, Bito, Codacy = "AI reviewuje tvůj kód" (komentář, suggestion, po faktu). Tahle kategorie je nasycená.

Codeceipt = "**gate před merge**" — pass/fail před tím, než PR projde. Žádný komentář, žádná suggestion. Verdikt. Co nikdo z konkurence nemá: PR provenance labeling (Cursor vs Claude Code vs human), public Receipt artefakt, mutation testing jako default gate, OWASP Agentic Top 10 mapping.

---

## Co postavím na Builders Day

Engine je hotový — postavený na [cortex-x v0.3.0](https://github.com/Rejnyx/cortex-x), který jsem shipnul jako first public preview **včera (2026-05-14)**. 2955 testů, 28 standards, Apache 2.0, 15 cron workflows produkujících PRs every night.

Day-of stavím **wrapper** kolem engine: paste-mode backend (Vercel Function + Vercel KV), Receipt page UI (Next.js + Tailwind v4), GitHub Action publish (instant Marketplace tag), landing page (`codeceipt.dev`). Cíl po 17:00: working demo, screen recording reálného Steward PR, prvních 3 closed-beta uživatele z místnosti.

---

## Kdo to navrhuje

**David Rajnoha** · full-stack + agentic engineer · 17 let grafiky · Ostrava CZ
[davidrajnoha.dev](https://davidrajnoha.dev) · [github.com/Rejnyx](https://github.com/Rejnyx)

Trackrecord: 2/2 top 5% AI hackathon finishes 2025 (Fraud Detection 91/1979 · RELO 5/70). Aktivně provozuju 5 produktů ve výrobě (RELO realitní AI agent · multi-tenant chatbot platforma · WaaS šablona · kiosek pro restaurace · portfolio).

---

> **Full technical brief** (16 sekcí, 15-min čtení): `codeceipt/README.md`
> **7-hodinový build plan + 3-min pitch script**: `codeceipt/BUILDERS-DAY.md`
