# Codeceipt — Design Brief (handoff for /designer)

> Podklad pro UX/UI práci na webu. Grounded v IA research 2026-05-30 (Evil Martians studie 100+ dev-tool landingů + VC/shields.io/SOC2 trust patterns). Produktové SSOT: [README.md](./README.md).

## Jak to použít

1. Spusť `/designer` v rootu repa (auto-bootstrapne design system ze scaffoldu).
2. V intake fázi pastni **prompt na konci tohoto souboru** (§ Ready-to-paste).
3. Designer pracuje proti tomuto brief + existujícímu scaffoldu (`app/page.tsx`, `app/r/[id]/page.tsx`).

---

## 1. Esence produktu

- **Co:** nástroj, který **spustí** AI-generovaný PR, ověří, že fakt udělal, co tvrdí, a vystaví **veřejný, nezávisle ověřitelný Receipt**, co freelancer pošle klientovi.
- **Tagline:** „Ship AI code. Not AI slop."
- **Hero subhead (JTBD, jedna věta):** „Codeceipt spustí tvůj AI pull request, ověří, že fakt splnil, co tvrdil, a dá tvému klientovi veřejný receipt, který si ověří sám."
- **Jediný pravý diferenciátor (NESMÍ se ztratit):** *verifikace spuštěním, ne self-reportem.* Musí být v heru, v „how it works" i ve FAQ. Nedovol designerovi to zahrabat.

## 2. Persony (obě, explicitně)

- **Freelancer/agentura** (kupuje): chce dokázat klientovi, že kód není slop, odlišit se, zavřít deal rychleji, účtovat víc.
- **Klient** (důvod, proč to funguje): nepozná kvalitu, chce důkaz bez čtení kódu, nezávisle ověřitelný (engine je open-source → nemusí věřit ani Codeceiptu).

## 3. Estetický směr

- **Dark theme default** (konvence dev-tools: Vercel, Linear, Greptile). Centrovaný max-width container.
- **Linear/Vercel-tier** — premium, zdrženlivé, typografie + spacing, **reálné UI screenshoty, ne ilustrace**.
- Akcentní barva pro verdikt: zelená VERIFIED / červená FAILED / oranžová PARTIAL (už v `globals.css` jako `--color-pass/fail/warn`).
- 83 % návštěv je mobil → mobile-first responsive.

## 4. Landing IA (pořadí sekcí)

0. **Nav** (sticky, minimal) — logo · How it works · Receipt example · Pricing · Docs · GitHub (stars) · button **„Verify a PR"** (konkrétní CTA, ne „Get started").
1. **Hero** — H1 „Ship AI code. Not AI slop." + subhead (viz §1) + eyebrow „Open-source engine · Apache 2.0" + dual CTA („Verify a PR" / „See a live Receipt"). **Hero visual = samotný Receipt** se zeleným VERIFIED badge.
2. **Trust block** — bez zákaznických log: „Built on a deterministic execution engine — not an LLM's opinion of itself" + GitHub stars + supported platforms (GitHub/GitLab) + preview „verified by Codeceipt" badge.
3. **Problem („the slop tax")** — 2 sloupce (freelancer pain / client pain). Staty na obrazovku (footnote citace): AI kód 2.74× víc zranitelností (Veracode), 45 % fails secure benchmarks, 10× nárůst findings (Apiiro), 96 % nedůvěřuje (Stack Overflow). Visual: agentovo „✅ All done!" vs. reálný execution result.
4. **How it works (3 kroky)** — 1) Paste PR URL / přidej Action · 2) **Codeceipt to spustí** (ne summary agenta) · 3) Veřejný Receipt link. Opakuj slovo **execution vs self-report**. Visual: horizontal flow končící Receiptem, v kroku 2 terminal/diff snippet.
5. **Receipt showcase (centrepiece)** — velký anotovaný render reálného Receiptu s callouty: verdict badge, per-criterion checks, diff, immutable timestamp, re-verify button, cost ledger. Copy: „This is what your client receives. One link. They can re-run it themselves. You can't fake it." + „Open live example →".
6. **Two-audience value** — taby/2 sloupce: For freelancers & agencies / For clients.
7. **Open-source / trust architecture** — „Engine je Apache-2.0. Kdokoliv (i klient) si ověří, jak verdikt vznikl. Nežádáme tě, abys nám věřil — dáváme ti něco, co ověříš bez nás." GitHub repo card.
8. **Social proof** — pre-launch: reálný živý Receipt link + GitHub stars + 1 silný beta quote (víc než 6 slabých).
9. **Pricing teaser** — 3 karty (Free / Pro / Team), prostřední zvýrazněná. „Engine free forever (Apache 2.0). Platíš za hosted Receipts + Action." Detail na /pricing.
10. **FAQ (accordion)** — „Čím se lišíš od CodeRabbit/Greptile?" (oni komentují, my spustíme a certifikujeme veřejným artefaktem) · „Jde Receipt zfalšovat?" (ne — re-verifiable, timestamped, machine-checkable) · „Opustí kód můj stroj / je to privátní?" · „Co znamená 'verify by execution'?" · „Co je free vs placené?" · „Jaké stacky?".
11. **Final CTA** (full-width, loud) — „Stop sending 'trust me.' Start sending a Receipt." → button „Verify your first PR".
12. **Footer** — product · resources (docs, GitHub, changelog) · legal · „Engine: Apache 2.0" + repo · status.

## 5. Receipt page — anatomie (TO je produkt)

Dvě úrovně čtení na jedné stránce: **klient mode** nahoře (verdict + summary + re-verify), **engineer detail** dole/expandable.

1. **Verdict badge** (top, dominantní) — VERIFIED / FAILED / PARTIAL, plain language. Jediná věc, co klient přečte.
2. **Plain-language summary** — „This PR was independently executed and met 8 of 8 claimed criteria."
3. **Identity block** — jaký PR (repo, #, title, author), kdo zažádal, issued-by Codeceipt.
4. **Per-criterion breakdown** — každý claim → ✅/❌ s reálným executed evidence. Expandable.
5. **Diff view** — reálný kód, collapsible (klient nečte, ale přítomnost = důkaz).
6. **Immutable timestamp** — „Verified 2026-05-30 14:22 UTC" + tamper-evidence (hash/signature), nezávisle ověřitelný.
7. **Re-verify button** — „Run this verification again →". **Nejdůležitější trust prvek** — kdokoliv (i klient) znovu spustí a dostane stejný verdikt.
8. **Cost ledger** — transparentní compute/LLM cost (tokens, $). Naplňuje „Receipt" metaforu doslova.
9. **Verification fingerprint** — krátký hash / UUID + machine-readable endpoint (JSON / SVG badge à la shields.io) → embeddable do README, needitovatelné.
10. **Share block** — copy link, „Add badge to README", download PDF.
11. **„How is this verified?" link** — → open-source engine (ověř metodu, ne jen výsledek).

## 6. Trust signály (pro „verifiable proof" produkt)

Re-verify link (killer) · open-source engine link · immutable/checkable timestamp · machine-checkable artefakt (JSON+SVG) · unique fingerprint/public URL · per-criterion evidence (ne jeden stamp) · viditelná verifikační metoda · cost ledger · poctivé statusy (ukázat i FAILED veřejně).

## 7. Paste-mode stavy

- **Empty:** jedno centrované pole „Paste a GitHub/GitLab PR URL" + button „Verify" + helper „Public PRs instantly. Private → connect GitHub." + „Try a sample PR".
- **Loading:** **stepped progress, ne spinner** — ukázat execution: `Cloning → Parsing criteria → Executing checks → Building Receipt` + live log feed (= kredibilita) + est. čas + accruing cost.
- **Result:** redirect na Receipt + toast „Receipt created — share link".
- **Error:** typed, recoverable — invalid URL / private-no-access (→ connect) / build-test failure (= validní FAILED verdikt, ne crash!) / timeout / rate limit.

## 8. MVP split

**MUST (dnes):** hero · problem se 2-3 staty · 3-step how-it-works · **Receipt showcase** · final CTA · footer · paste-mode (empty/loading/result/1 error) · **reálná Receipt page** (verdict, summary, per-criterion, timestamp, re-verify, veřejná URL) · **1 živý example Receipt linkovaný z heru** (bez něj se pitch sype) · open-source engine link · dark, responsive.

**NICE (post-MVP):** GitHub Action + docs · cost ledger · PDF · README badge · machine JSON · private-repo OAuth · pricing page · FAQ accordion · testimonials · two-audience taby · waitlist · semantic diff · history · agency branding.

## 9. Competitor borrow

CodeRabbit (jedna dominantní authority quote + velká kvantifikovaná čísla) · Greptile (reálné reviewed PRs jako proof) · Qodo („beyond AI-wrote-it / before production-ready" gap framing — Codeceipt žije přesně tam) · Snyk (AI-slop stat hook + „code stays private/inspectable") · Socket (threat-framed + transparency-as-trust) · Linear (design language, real UI) · Vercel (clean minimal infra).

---

## Ready-to-paste prompt pro /designer

```
Navrhni landing page + Receipt page pro Codeceipt podle docs/DESIGN-BRIEF.md.

Produkt: nástroj, co SPUSTÍ AI-generovaný PR, ověří že fakt udělal co tvrdí
(verifikace spuštěním, NE self-reportem), a vystaví veřejný nezávisle ověřitelný
Receipt, co freelancer pošle klientovi. Tagline "Ship AI code. Not AI slop."

Styl: dark, Linear/Vercel-tier premium, reálné UI ne ilustrace, mobile-first.
Akcenty: zelená VERIFIED / červená FAILED / oranžová PARTIAL.

Priorita (MVP dnes):
1. Receipt page jako centrepiece (verdict badge dominantní, plain-language summary,
   per-criterion breakdown, immutable timestamp, re-verify button, veřejná URL).
2. Hero — H1 "Ship AI code. Not AI slop." + subhead o verifikaci spuštěním + dual CTA,
   hero visual = samotný Receipt se zeleným VERIFIED.
3. Problem sekce se 2-3 citovanými staty, 3-step how-it-works (zdůraznit execution),
   final CTA, footer.

Pracuj proti existujícímu scaffoldu (app/page.tsx, app/r/[id]/page.tsx, Tailwind 4,
globals.css už má --color-pass/fail/warn). Drž "verify by execution not self-report"
v heru, how-it-works i FAQ — nezahrabávej to.
```
