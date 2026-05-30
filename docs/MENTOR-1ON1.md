# Codeceipt — Mentor 1:1 (byznys cheat sheet)

> Pro pár minut s mentorem, co tě tahá osobně. Krátce, v tezích, k naučení.
> Event: Builders Day Praha 2026-05-30. Mentoři: **Filip Kollert** (GTM/fundraising advisor) + **Jakub Sekula** (full-stack/AI engineer).
> SSOT pozice: [README.md § 4](./README.md) · stage pitch: [PITCH.md](./PITCH.md) · čísla: [RESEARCH-ANCHORS.md](./RESEARCH-ANCHORS.md).

---

## 0. Kapesní verze (5 řádků — kdyby ses ztratil)

1. **Trust layer pro freelancery, co dodávají AI-kód klientům.**
2. **Ověří spuštěním** (ne názorem další AI), že agent udělal, co tvrdí.
3. **Veřejný receipt**, co freelancer pošle klientovi — klient si ho sám re-runne.
4. **Platí se za projekt/repo**, ne za seat. Free na OSS = distribuce.
5. **Moat:** public + independently-verifiable + acceptance-criteria + by-execution. To nemá nikdo dohromady.

---

## 1. Opener (30 s — co + pro koho + proč teď)

> „Stavím trust layer pro freelancery, co dodávají AI-generovaný kód klientům. Problém: vibe coderů přibývá, ale klient nepozná, jestli dostal solidní práci, nebo slop, co se za 3 měsíce rozpadne. Codeceipt to **ověří spuštěním** — ne názorem další AI — a vystaví **veřejný důkaz (receipt), který freelancer pošle klientovi**. Generování kódu se vyřešilo; ověřování je teď bottleneck."

Tvrdé číslo do toho:
> „LinearB, 8 milionů PR — AI pull requesty mají acceptance rate 33 % vs 84 % u lidí. 96 % vývojářů nedůvěřuje AI kódu v produkci. Ta mezera je měřitelná."

---

## 2. Byznys jádro (na tohle se ptá)

**Kdo platí a za co**
- Ne za seat — **za projekt/repo** (přirozená jednotka: 1 klientský projekt = 1 důkaz).
- **Free** na public/OSS repech — distribuce + trust (lidi to vidí běžet na cizích repech).
- **~5–15 €/měs** za privátní repo pro solo freelancera = core cílovka.
- Placená věc **není kontrola** — je to **vydaný ověřitelný certifikát**, co freelancerovi zvedne důvěru (a sazbu). Kontrola je levná/zdarma; certifikát je ten produkt.

**Distribuce (dva povrchy, oba growth)**
1. **Web** — hodíš PR URL → receipt. Zero-install + indexovatelná growth plocha.
2. **GitHub Action** — receipt **badge v README**. Každý badge v cizím repu = reklama.
3. Engine **open-source (Apache 2.0)** → forkni, audituj lokálně, důvěra.

**Moat / proč to není kopírka**
- Kategorie „AI code review" je přeplácaná (CodeRabbit, Greptile, Qodo, Bito, Korbit) — ale ti jsou **strukturálně kruh**: AI kontroluje AI nad tím samým diffem, ze stejné logiky.
- My nedáváme názor. **Dáme důkaz, co si klient (i netechnický) sám re-runne** a dostane stejný fingerprint. Determinismus.
- Nosné slovo, co nemá nikdo dohromady: **public + independently-verifiable + acceptance-criteria + by-execution.**

---

## 3. Otázky, co přijdou (a odpovědi)

| Otázka | Odpověď |
|---|---|
| **Jak velký trh / kdo přesně platí?** | Nezačínám „celým vývojářským světem". Wedge = solo freelanceři + malé agentury co shipují AI-kód klientům. Odtud nahoru na compliance/audit. |
| **Co brání GitHubu/Copilotu to udělat?** | Hrozba je reálná — **Entire** (ex-CEO GitHubu, $60M seed @ $300M) vlastní datový substrát, je jedno produktové rozhodnutí od tohohle. Okno **~6–12 měsíců**. Náskok = rychlost + veřejně-ověřitelný artefakt jako pozice. |
| **Unit economics?** | Scan ~$0.001, deterministika skoro zadarmo, marže na vydaném certifikátu vysoká. |
| **Proč ty?** | Mám hotový ověřovací engine + ověřený nápad. Den použiju na ship wrapperu — ne „explore idea", ale „ship". |
| **Jak to nainstaluju za 2 min? (Jakub)** | Web: paste URL → 30 s → receipt, nula konfigurace. Nebo `uses: Rejnyx/Codeceipt@v1` v workflow. |

---

## 4. Čeho se NEDOTÝKEJ (refutovatelné / slabé)

- ❌ „EU zákon od srpna 2026 vyžaduje human review" — věcně i datumově špatně (deadline posunut na 2. 12. 2027). Problém slopu stojí sám o sobě.
- ❌ „Kontroluju kvalitu kódu" (modularita, škálovatelnost) — subjektivní, LLM se plete.
- ✅ Říkej: **„Ověřím, že agent udělal, co deklaroval"** — objektivní.
- ❌ Žádný „postavil jsem 11 sprintů za den" flex (anti-credentialist room).

---

## 5. Zakonči (a obrať to na mentora)

**Upřímnost o stropu** (zní líp než nafouklá čísla):
> „Není to unicorn. Realisticky: silný produkt + pár platících uživatelů + možná malé SaaS. To mi sedí."

**Otázka zpět** (z toho vytěžíš nejvíc):
> „Kdyby tohle mělo růst za hranici 'nástroj pro pár lidí' — kde vidíš první kanál, co by reálně zafungoval? A je trust-layer pro freelancery dost velký vstupní trh, nebo mám rovnou mířit na agentury?"

**Tvrdý validační signál na konec:**
> „Vzal bys to na svůj příští klientský projekt?" — ano/ne řekne víc než „zní dobře".

---

## 5.5 Scope rozhodnutí po 1:1 (2026-05-30)

Mentor navrhl 3 věci. Vyhodnocení + co s tím:

| Návrh | Verdikt | Akce |
|---|---|---|
| **Cílit na klienty, ne freelancery** | Z půlky pravda | Klient = kupující/beneficiary v **messagingu**; freelancer = **distribuce** (badge, běh na PR). Neopouštět freelancera, jen otočit copy na klientský výsledek. |
| **Lead-gen „opravíme vám to"** | Past (channel conflict) | Je to **jiný, větší byznys** (provize z oprav), ale dělá z freelancera nepřítele. **Odloženo** — až po volbě strany a volume. |
| **Fix-prompt při failu** | Nejsilnější, hned | **Hotovo** — engine `buildFixPrompt` vyrobí z failed kritérií copy-paste prompt do AI. Žádný konflikt, fail je akční. |

Jedna věta pro mentora zpět: *„Beru klienta jako kupujícího v messagingu, freelancera jako distribuci. Fix-prompt jsem postavil hned. Fixer-marketplace odkládám — nechci si znepřátelit kanál, dokud nemám volume."*

## 6. Tagline do kapsy

> **Ship AI code. Not AI slop.**
> Agenti říkají hotovo; nikdo neověří, že nelžou — tohle to ověří spuštěním a vystaví o tom veřejný důkaz pro klienta.
