# Codeceipt — Builders Day pitch (spec-verifier framing)

> Event: **30. května 2026**, Praha, 10:00–17:00 · 15 účastníků · [buildersday.cz](https://buildersday.cz)
> Mentoři: **Filip Kollert** (Swipelux, fundraising/GTM advisor) + **Jakub Sekula** (full-stack/AI engineer, launchuje MVP pro firmy)
> Pozice: **spec-verifier hero** (ne security-gate). Výklad proč: [README.md § 4](./README.md) + [claude-session.md](./claude-session.md).

---

## 0. Jedna věta — co stavíš

> „Stavím nástroj, co u AI-kódu ověří, že agent fakt udělal, co tvrdí — a vystaví o tom veřejný důkaz, který freelancer pošle klientovi jako záruku, že to není shit."

Do výtahu kratší: *„Kontrola pro kód od AI — veřejný důkaz pro klienta, že dostal solidní práci, ne slop, co se za pár měsíců rozpadne."*

Proč „agent udělal, co tvrdí": agent na konci napíše „hotovo, přidal jsem funkci, napsal testy, prošlo to". To je jen jeho slovo — občas si vymyslí krok nebo napíše test, co nic netestuje, a stejně hlásí done. **Codeceipt tomu slovu nevěří — spustí testy doopravdy, zkontroluje, že soubor existuje a sedí.** Buď to sedí, nebo ne.

---

## 0.5 Talking points u stánku (1:1, vrstvená odpověď)

> Když přijde člověk a ptá se. Čti shora dolů podle toho, jak hluboko jde.

### Vrstva 1 — „co to je?" (10 s)
> **„Ověří, že AI fakt udělala, co tvrdí — a vystaví o tom veřejný důkaz pro klienta."**

Když nechápe: *„Agent řekne 'hotovo, napsal jsem testy, prošlo to'. To je jen jeho slovo. Můj nástroj to nevěří — spustí ty testy doopravdy a řekne: ověřeno, nebo lže."*

### Vrstva 2 — „komu to pomůže / proč by to někdo chtěl?" (30 s)
1. **Freelancer** dodá klientovi AI-kód a nemá jak dokázat, že není shit.
2. **Klient** nepozná kvalitu, bojí se, že se to za 3 měsíce rozpadne.
3. **Codeceipt** vyrobí důkaz mezi nima — veřejnou URL, co freelancer pošle klientovi. Trust layer.

Punchline: *„Nasadíš to od prvního commitu, tiše to běží celý projekt, a na konci máš důkaz, co vznikl sám."*

### Vrstva 3 — „čím se lišíš od CodeRabbit / Copilot review?" (klíčová námitka)
> **„To jsou reviewery — komentují kód. Tohle je gate s důkazem. A hlavně: AI review je kruh — AI kontroluje AI nad tím samým kódem, ze stejné logiky. Já nekontroluju názorem druhé AI, ale spuštěním. Buď ten test projde, nebo ne."**

Diferenciátor, co nemá nikdo: *„A je to veřejně ověřitelný artefakt. Reviewery dají komentář do PR. Já dám URL, kterou si ověří kdokoliv — i klient, co kódu nerozumí."*

### Vrstva 4 — hloubka (technik chce detail)
- **Jak ověřuje:** deklaruješ akceptační kritéria, nástroj je projde jedno po druhém. Šest typů — `shell` (prošly testy?), `file_predicate` (existuje soubor, sedí obsah?), `regex`, `read_set` (důkaz, že agent fakt přečetl soubory, co tvrdí), `llm_judge`, `ears`.
- **Kde je AI:** většina **deterministická** (spuštění, soubory, regexy). AI jen jeden z porotců tam, kde je potřeba kontext. Neprodávám „AI co soudí AI".
- **Fails closed:** když si není jistý, radši zařízne, než pustí neověřené.
- **Distribuce:** web (drop PR URL) + GitHub Action (`uses: rejnyx/codeceipt@v1`). Engine open-source Apache 2.0.
- **Cena scanu:** ~$0.001.

### Čeho se DRŽ / co NEŘÍKEJ
- ❌ „od srpna platí EU zákon, že kód musí projít kontrolou člověka" — věcně i datumově špatně (deadline posunut na 2027).
- ❌ „kontroluju kvalitu kódu" (modularita, škálovatelnost) — subjektivní, LLM se plete.
- ✅ „ověřeno, ne kvalitní" — stroj dokáže, že agent udělal, co deklaroval. Objektivní.
- ✅ Konkrétní cílovka: lidi co shipují AI-kód klientům. Ne „celý vývojářský svět".

### Vždy zakonči otázkou (tvrdý signál)
> **„Vzal bys to na svůj příští klientský projekt?"** — ano/ne řekne víc než „zní dobře".

Jedna věta do kapsy: *„Agenti říkají hotovo, nikdo neověří, že nelžou — tohle to ověří a vystaví o tom důkaz pro klienta."*

---

## 0.5 Talking points u stánku (1:1, vrstvená odpověď)

> Když přijde člověk a ptá se. Čti shora dolů podle toho, jak hluboko jde.

### Vrstva 1 — „co to je?" (10 s)
> **„Ověří, že AI fakt udělala, co tvrdí — a vystaví o tom veřejný důkaz pro klienta."**

Když nechápe: *„Agent řekne 'hotovo, napsal jsem testy, prošlo to'. To je jen jeho slovo. Můj nástroj to nevěří — spustí ty testy doopravdy a řekne: ověřeno, nebo lže."*

### Vrstva 2 — „komu to pomůže / proč by to někdo chtěl?" (30 s)
1. **Freelancer** dodá klientovi AI-kód a nemá jak dokázat, že není shit.
2. **Klient** nepozná kvalitu, bojí se, že se to za 3 měsíce rozpadne.
3. **Codeceipt** vyrobí důkaz mezi nima — veřejnou URL, co freelancer pošle klientovi. Trust layer.

Punchline: *„Nasadíš to od prvního commitu, tiše to běží celý projekt, a na konci máš důkaz, co vznikl sám."*

### Vrstva 3 — „čím se lišíš od CodeRabbit / Copilot review?" (klíčová námitka)
> **„To jsou reviewery — komentují kód. Tohle je gate s důkazem. A hlavně: AI review je kruh — AI kontroluje AI nad tím samým kódem, ze stejné logiky. Já nekontroluju názorem druhé AI, ale spuštěním. Buď ten test projde, nebo ne."**

Diferenciátor, co nemá nikdo: *„A je to veřejně ověřitelný artefakt. Reviewery dají komentář do PR. Já dám URL, kterou si ověří kdokoliv — i klient, co kódu nerozumí."*

### Vrstva 4 — hloubka (technik chce detail)
- **Jak ověřuje:** deklaruješ akceptační kritéria, nástroj je projde jedno po druhém. Šest typů — `shell` (prošly testy?), `file_predicate` (existuje soubor, sedí obsah?), `regex`, `read_set` (důkaz, že agent fakt přečetl soubory, co tvrdí), `llm_judge`, `ears`.
- **Kde je AI:** většina **deterministická** (spuštění, soubory, regexy). AI jen jeden z porotců tam, kde je potřeba kontext. Neprodávám „AI co soudí AI".
- **Fails closed:** když si není jistý, radši zařízne, než pustí neověřené.
- **Distribuce:** web (drop PR URL) + GitHub Action (`uses: rejnyx/codeceipt@v1`). Engine open-source Apache 2.0.
- **Cena scanu:** ~$0.001.

### Čeho se DRŽ / co NEŘÍKEJ
- ❌ „od srpna platí EU zákon, že kód musí projít kontrolou člověka" — věcně i datumově špatně (deadline posunut na 2027).
- ❌ „kontroluju kvalitu kódu" (modularita, škálovatelnost) — subjektivní, LLM se plete.
- ✅ „ověřeno, ne kvalitní" — stroj dokáže, že agent udělal, co deklaroval. Objektivní.
- ✅ Konkrétní cílovka: lidi co shipují AI-kód klientům. Ne „celý vývojářský svět".

### Vždy zakonči otázkou (tvrdý signál)
> **„Vzal bys to na svůj příští klientský projekt?"** — ano/ne řekne víc než „zní dobře".

Jedna věta do kapsy: *„Agenti říkají hotovo, nikdo neověří, že nelžou — tohle to ověří a vystaví o tom důkaz pro klienta."*

---

## 1. 3-min stage pitch (česky, k naučení)

### 0:00–0:30 — Hook
> AI dnes píše hromady kódu. Podle LinearB 2026 (8 milionů PR) má AI-generovaný pull request acceptance rate jen 33 %, oproti 84 % u lidí — a čeká se na review 4,6× dýl. Generování se vyřešilo. Ověřit, že to fakt funguje, ne.

### 0:30–1:00 — Personal anchor
> Já si pro sebe ten plot postavil. Tohle je můj AI engineer, co mi v noci otevírá PR do mých repů. Než se PR označí jako hotový, musí dokázat, že agent fakt splnil, co měl. Tady je PR, co otevřel včera ve 3:42.

**[SCREEN RECORDING reálného Steward PR]**

### 1:00–2:00 — Product reveal
> Agenti řeknou „hotovo, otestováno" — a nikdo neověří, že nelžou. Codeceipt tomu slovu nevěří: spustí ty testy doopravdy, zkontroluje, že soubory existují, že obsah sedí, že agent fakt přečetl, co tvrdí. Ne další AI, co čte tentýž kód — tvrdá strojová kontrola.
>
> A pak vystaví **veřejnou Receipt page** — URL s verdiktem, kterou pošleš klientovi, auditorovi nebo svému bossovi. Když to nasadíš od prvního commitu, není to jeden check na konci — je to ověřená historie celého projektu.

**[REVEAL landing page + Receipt page demo]**

### 2:00–2:30 — Positioning
> Funguje jako web (drop PR URL) i jako GitHub Action ve tvém workflow. Engine je open-source pod Apache 2.0 — forkni, spusť lokálně, audituj.
>
> Tohle není další „AI code reviewer" — CodeRabbit, Greptile to dělají, a strukturálně je to kruh: AI kontroluje AI nad tím samým diffem. Tohle je **důkaz, ne komentář.** A je veřejně ověřitelný — to nemá nikdo.

### 2:30–3:00 — CTA
> Closed beta dnes. Tady QR. Free pro každého v této místnosti, lifetime grandfather. **Ship AI code. Not AI slop.**

**[QR code → codeceipt.dev/beta]**

---

## 2. 7-hour build plan (10:30–16:00)

| Hodina | Cíl | Cut rank | Pozn. |
|---|---|---|---|
| **10:30–11:30** | Landing page (`codeceipt.dev`) — hero + „Ověř, že agent nelhal" + jak to funguje + „Paste your PR" form | 4 | Pre-scaffolded, sprint = copy + styling |
| **10:30–11:30 paral.** | GitHub Action `action.yml` + node20 runtime → publish v0.1 tag | 5 | Marketplace publish je INSTANT |
| **11:30–12:30** | Paste-mode backend (`/api/scan` Vercel Function, `waitUntil()`) — fetch diff via PAT, spawn engine, write KV | **1 — NEVER cut** | Core |
| **12:30–13:30** | LUNCH + sanity-check engine na reálných PR | — | |
| **13:30–14:30** | Receipt page `/r/[id]` — Linear-tier: deklarovaná kritéria + per-criterion verdikt + diff + cost ledger + share | **2 — NEVER cut** | „Wow" surface |
| **14:30–15:30** | Stripe Checkout (~50 Kč, validace) + waitlist | 6 (cut 1.) | Pricing není demo concern |
| **15:00–16:00** | Deploy Vercel prod, smoke test na vlastních cortex-x PR | — | DNS buffer |
| **15:30–16:00** | Pitch rehearsal + load backup screen recording offline | — | |
| **16:00–17:00** | 3-min pitch | — | |

**Cut order při slipu H+5:** (1) Stripe → waitlist · (2) druhý criterion kind → jen jeden · (3) Receipt sharing → private · (4) landing polish → Vercel template · (5) GitHub Action → „coming next week" (ale tag published) · (6) **NIKDY: paste-mode + Receipt core + screen recording fallback.**

---

## 3. Demo loop (postav odzadu od prezentace)

1. Funkční smyčka na **jednom** criterion kindu (`shell` nebo `file_predicate` — nejtvrdší, nejmíň co se pokazí): PR → verifier ověří jedno deklarované kritérium → veřejná URL „ověřeno / neprošlo".
2. **Veřejná URL** = tvůj diferenciátor. Bez ní je to jen další checker.
3. Až tohle stojí: druhý criterion + `read_set` jako „wow".
4. Stripe úplně nakonec.

Hlavní riziko dneška **není scope ani schopnosti — je to scope creep.** Máš obří framework za zády a pokušení ukázat z něj moc. Drž se jedné smyčky, jedné URL, jedné věty.

---

## 4. Strategic notes pro pódium

### NEPOJMENOVAT:
- „cortex-x" (interní framework, brand je Codeceipt) · „Steward" (interní runner name) · backend žargon (multi-window USD caps, criterion kinds jako termín) · žádný „postavil jsem 11 sprintů za den" flex (anti-credentialist room)

### POJMENOVAT:
- „Můj AI engineer" (lidsky) · „agent řekne hotovo, tohle ověří, že nelhal" (concrete) · confidence citace: „LinearB 8 milionů PR", „DORA" — study-backed, ne marketing

### EU AI Act — POZOR (opraveno research 2026-05-30):
- **NEŘÍKAT** „od srpna 2026 platí zákon, že kód musí projít kontrolou člověka" — je to věcně špatně (žádný takový mandát) i datumově (high-risk deadline posunut Digital Omnibusem na **2. 12. 2027**).
- Pokud na to dojde, honest verze: *„EU AI Act stojí na human oversight a auditovatelnosti (Čl. 9/14/17). Deadline se posunul na 2027, protože firmy zatím neumí doložit human-in-the-loop kontrolu. My tu doložitelnost vyrábíme."*
- Nejlepší: regulatorní háček **vůbec nepoužívat** — problém „AI slop" a verifikační mezera stojí sám o sobě.

### Filip Kollert (advisor, NE investor):
- B2B GTM, API-first, fundraising storytelling. Pitchni „důkaz pro klienta jako trust layer", ne „invest in us".

### Jakub Sekula (full-stack/AI engineer):
- Realistic feedback: „Cool, ale jak to nainstaluju za 2 minuty?" → připrav clean demo: paste URL → 30 s → receipt page. Žádná konfigurace.

### Audience (15, mixed founders/freelancers/marketers/students):
- Aspirational: Marc Lou, Pieter Levels (solo MVP shippers).
- Risk: „proč tohle dělá někdo overqualified na našem workshopu?" → narativ: „mám framework + ověřený nápad, použiju den na ship wrapperu", ne „explore idea".

---

## 5. Risk register

| Risk | Pravděpod. | Mitigace |
|---|---|---|
| Engine extraction (cortex-x → CLI) trvá >2h | Med | Pre-workshop práce. Když nehotovo, demo s direct cortex-x invocation (uglier UI, same engine) |
| Vercel `waitUntil()` 60s ceiling se trefí na 90s PR | Low | Fallback: 60s timeout + „retry" UX |
| Stage Wi-Fi padá → live demo nejede | Med | Backup screen recording vždy v ruce (rec před 9:00) |
| Operator over-builds, podcení čas | High | Buffer 30 min H+5:30, cut order rigid |
| Konkurent (Entire / eval vendor) lounchne podobně | Med (6–12 měs okno) | Apache 2.0 engine + speed + „veřejný ověřitelný artefakt" jako defensible position |

---

## 6. Day-after follow-ups

1. **Po 1. 6.:** follow-up s closed-beta users z místnosti — 1:1 onboarding
2. **Týden 1:** GitHub App v0.2 (full webhook)
3. **Týden 2:** veřejný launch — Show HN + IndieHackers + ProductHunt (Pieter Levels playbook)
4. **Týden 3:** CZ outreach — Filip Kollert, Vojta Roček (Presto), Ondřej Fryč (Reflex)
