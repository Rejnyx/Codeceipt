Upravujte v aplikaci Dokumenty
Vylepšujte své soubory, nechávejte u nich komentáře a sdílejte je s ostatními, abyste je mohli upravovat společně.
NE, DĚKUJIPOUŽÍT APLIKACIproduct-david-rajnoha.docxProduct Description: Code Quality GateBuilder: David Rajnoha (designer, ~15 měsíců vývoje s AI)   Akce: Builders Day Prague   Status: MVP se staví na místěProblém
Dneska může „kódit“ kdokoliv. Lidé staví aplikace v nástrojích jako Loveable nebo Cloud Code, aniž by byli programátoři, a nemají přesah do toho, jestli je výsledný kód kvalitní, nebo ne. Vzniká obrovské množství kódu a klient, který si nechává něco vyvinout, nemá jak poznat, jestli dostal solidní produkt, nebo „AI-slop“, co se mu za pár měsíců rozpadne jako domeček z karet.Řešení
Nástroj, který funguje jako „antivirus / scanner kvality kódu“. Napojí se na GitHub repo přes GitHub Actions a u každého pull requestu zkontroluje kód proti sadě standardů. Buď projde, nebo dostane developer jasnou zpětnou vazbu, co je špatně a co opravit.Klíčový rozdíl oproti existujícím nástrojům (CodeRabbit, statická analýza): vzniká veřejný artefakt na URL, kterým může freelancer/developer klientovi dokázat, že odevzdaný kód reálně prošel kontrolou a je kvalitní, i když tomu sám klient nerozumí.Jak to funguje
Developer si nástroj nainstaluje do svého repa (GitHub Actions, do budoucna potenciálně GitHub App).
Každý pull request projde sadou cca 6 gatewayů se základními standardy vývoje:
single source of truth
modularita
škálovatelnost
bezpečnost
+ další kvalitativní kontroly
Aplikace si umí vytáhnout kontext z celého repozitáře, ne jen z jednoho PR, protože některé kontroly potřebují širší obraz projektu.
Výsledek se zobrazí na URL jako důkaz kvality pro klienta.
Cílová skupina
Freelanceři a developeři, kteří shipují kód klientům a chtějí doložit jeho kvalitu.
Klienti, kteří si nechávají vyvíjet software a chtějí jistotu, že nedostávají „slop“.
Tvůrci novodobých AI aplikací s důrazem na bezpečnostní hledisko.
Proč teď
Od srpna začíná platit nový EU zákon, podle kterého by produkovaný kód měl projít kontrolou člověka. Většina lidí to dnes nechává čistě na AI. Nástroj tlačí lidi k tomu, aby se o svůj kód starali a aby v procesu byl reálný human-in-the-loop - i kdyby výstup jen zkopírovali zpět do AI na opravu, minimálně si kód projdou.Pozadí produktu
Vychází z osobního frameworku Cortex, který David staví už ~2 měsíce jako „pík“ nad všemi svými projekty (aby nemusel každý projekt setupovat od nuly). Bezpečnostní část i vývojové standardy už má v podstatě postavené. Tahle aplikace je „výcuc“ jeho know-how, který chce poslat dál - od developera pro developery.Byznys model
Primárně mise „pomoct pár lidem“, ne milionový nápad. Doporučení z konzultace: nasadit Stripe Checkout na symbolickou částku (~50 Kč) - ne kvůli výdělku, ale kvůli validaci hodnoty. Pokud jsou lidé ochotní zaplatit, je to signál pro další rozvoj produktu.Cíl pro Builders Day
Na konci dne mít hotové:funkční GitHub Actions setup pro vlastní software,
zabalené do reprodukovatelné podoby, kterou si ostatní mohou nasadit do svých rep,
možnost, aby si ostatní builders na místě projeli své repo a dostali zpětnou vazbu na chyby a co zlepšit.
Post-MVP / další fáze: kontrola využití AI a klíčů napříč repem, doporučení pro zlepšení vývoje samotného developera, GitHub App distribuce., myslíš že by to mohlo mít úspěch? A nebo třeba i měl někdo zájem to koupit jako velké firmy?Show more5:31Claude responded: Krátká upřímná odpověď: nápad má reálné jádro, ale „koupě velkou firmou" je v téhle podobě nepravděpodobná.Krátká upřímná odpověď: nápad má reálné jádro, ale „koupě velkou firmou" je v téhle podobě nepravděpodobná. Pojďme to rozebrat.
Co je na tom dobré
Problém je reálný a aktuální. Vibe coding produkuje hromady kódu od lidí, co nepoznají kvalitu — to je pravda a poptávka po „důkazu kvality" dává smysl. Tvůj diferenciátor (veřejný artefakt na URL jako důkaz pro klienta) je chytrý úhel, který CodeRabbit ani klasická statická analýza takhle neřeší. To je nejsilnější část pitche.
Kde to drhne
Jedna věc, kterou bych si ověřil hned — ten „EU zákon od srpna, že kód musí projít kontrolou člověka". Takhle formulované to neexistuje. Možná narážíš na EU AI Act nebo Cyber Resilience Act, ale ani jeden neříká „každý PR musí projít human review". Pokud to dáš do pitche takhle natvrdo a někdo technicky zdatný se zeptá, podkopeš si důvěryhodnost. Přeformuloval bych to opatrně nebo si to fakt dohledal.
Druhá věc: „6 gatewayů se standardy" jako single source of truth, modularita, škálovatelnost — to jsou subjektivní, kontextové věci, ne binární check. Tady je obrovský risk false positives/negatives. LLM ti řekne, že něco „není modulární", a bude se plést. Kvalita téhle zpětné vazby rozhodne, jestli je to nástroj nebo hračka.
Mohla by to koupit velká firma?
Upřímně ne, a hned z několika důvodů. Akvizice se dějí kvůli týmu, technologii nebo trakci — solo MVP postavené za den na Builders Day nemá ani jedno v měřítku, které by velkou firmu zajímalo. A prostor „AI code review" je už teď přeplněný (CodeRabbit, Greptile, Qodo, GitHub samotný s Copilot review). Velké firmy spíš postaví vlastní nebo koupí etablovaného hráče s tržbami.
To ale neznamená, že je to k ničemu. Realistický strop tady není exit, ale: silný portfolio kus, nástroj co reálně používáš ty a pár dalších, a možná malý SaaS s pár platícími. Což přesně sedí na to, co sám píšeš — „mise pomoct pár lidem", ne milionový nápad. Drž se téhle ambice, je zdravá.
Co bych udělal jinak
Místo „kontroluju obecnou kvalitu" bych zúžil na jednu věc, kterou umíš změřit objektivně a kde máš edge — bezpečnost (máš OWASP Agentic standardy z Cortexu). „Security gate pro AI-generated kód" je ostřejší, obhajitelnější a méně subjektivní pozice než „kvalita kódu obecně". Vibe-coded appky mají typicky děravou bezpečnost (leaknuté klíče, chybějící auth, injection) — to se dá detekovat tvrdě a ten artefakt pak něco reálně znamená.
Chceš, abych ti pomohl ten pitch přeostřit tímhle směrem, nebo si ověřit, co ten EU regulatorní argument reálně říká?You said: Vyhledej ten zákonVyhledej ten zákon5:32Claude responded: Tady je realita, a je důležitá, protože to v pitche máš formulované nepřesně.Searched the webSearched the webTady je realita, a je důležitá, protože to v pitche máš formulované nepřesně.
Co ten zákon (EU AI Act) skutečně říká
Klíčové datum 2. srpna 2026 se týká vstupu v platnost povinností pro vysokorizikové AI systémy (Annex III). Nejdůležitější deadline pro většinu firem je 2. srpna 2026, kdy se stávají vymahatelné požadavky pro vysokorizikové AI systémy. Jeden z těch požadavků je human oversight — Článek 14 zakotvuje filozofii „human-in-command", podle které musí být vysokoriziková AI navržena tak, aby umožňovala efektivní lidský dohled při používání. Secure PrivacySecure Privacy
Ale pozor na dvě věci, které ten tvůj argument vážně oslabují:
První — tohle se týká provozu a designu vysokorizikových AI systémů (nábor, biometrie, kritická infrastruktura, zdravotnictví apod.), ne kvality kódu obecně. Cílem lidského dohledu je předejít nebo minimalizovat rizika pro zdraví, bezpečnost nebo základní práva při používání těchto systémů. Nikde se nepíše „kód musí projít kontrolou člověka". To je o tom, že běžící AI systém musí umět člověk dozorovat a zastavit — ne o code review při vývoji. Tvoje formulace „kód by měl projít kontrolou člověka" je posun významu, který ti technicky zdatný člověk hned vyvrátí. EU Artificial Intelligence Act
Druhá, ještě podstatnější — to datum nemusí platit. Evropská komise koncem roku 2025 navrhla „Digital Omnibus" balíček, který by mohl odložit povinnosti pro vysokorizikové Annex III systémy až do prosince 2027. A jeden zdroj dokonce uvádí, že klíčové povinnosti pro vysokorizikové AI systémy — požadavky na data, řízení rizik a dohled — se stanou aplikovatelné až v srpnu 2027. Takže i samotné datum je sporné. Secure Privacydeloitte
Co to znamená pro tvůj pitch
Tvůj argument „od srpna platí zákon, že kód musí projít kontrolou člověka" je ve dvou bodech zranitelný: zákon nemluví o kódu (mluví o provozu vysokorizikových systémů) a datum nemusí platit. Kdyby se na to někdo zeptal, ztratíš tam důvěru.
Co bys s tím mohl udělat — buď to z pitche vyhodit úplně (nepotřebuješ regulatorní háček, problém „vibe-coded slop" stojí sám o sobě), nebo to přeformulovat poctivě: „Regulatorní trend v EU tlačí na human-in-the-loop a doložitelnost u AI systémů — můj nástroj přesně tu doložitelnost vytváří." To je obhajitelné, protože human oversight a auditovatelnost v zákoně reálně jsou, jen ne tak, jak jsi to napsal.
Mám ti ten odstavec „Proč teď" přepsat do verze, která je faktcky správně a pořád zní silně?You said: Tak jak to upravíme ten nápad?Tak jak to upravíme ten nápad?5:33Claude responded: Pojďme to přeostřit.Pojďme to přeostřit. Shrnu, kam bych ten nápad posunul, a pak ti to klidně přepíšu do dokumentu.
Hlavní změna: ze „scanneru kvality" udělej „security & trust gate pro AI-generovaný kód"
Důvod je trojí. Kvalita kódu (modularita, škálovatelnost) je subjektivní a LLM se v tom plete — těžko obhajíš artefakt „prošlo to kvalitou". Bezpečnost je objektivnější: leaknutý klíč, chybějící auth, injection se dají detekovat tvrdě, a ten „důkaz pro klienta" pak něco reálně znamená. A navíc máš v tomhle edge — OWASP Agentic standardy z Cortexu už máš postavené, takže neprodáváš vzduch.
Co zůstává (a je silné)

GitHub Actions napojení na PR
Veřejný artefakt na URL jako důkaz pro klienta — tohle je tvůj nejlepší diferenciátor, drž se ho
Repo-wide kontext, ne jen jeden PR
Symbolická cena přes Stripe na validaci

Co bych zúžil nebo přeformuloval

6 obecných gatewayů → 3-4 ostré, měřitelné bezpečnostní kontroly (leaked secrets/klíče, chybějící auth na endpointech, injection patterns, nebezpečné defaulty). Radši čtyři věci, které děláš spolehlivě, než šest, kde polovina střílí false positives.
„Single source of truth / modularita / škálovatelnost" → ne jako pass/fail gate, ale jako nezávazná doporučení („advisory"), aby to nepodkopávalo důvěru v ten gate.
Regulatorní háček přeformulovat na poctivou verzi (human-in-the-loop trend, ne „zákon o kontrole kódu").

Pozice jednou větou
„Bezpečnostní gate pro AI-generovaný kód, který freelancerovi dá doložitelný důkaz, že to, co odevzdal klientovi, není děravý slop."
Než to přepíšu — chceš to udržet jako čistě security gate, nebo nechat „kvalitu" uvnitř jako advisory vrstvu vedle bezpečnosti? To je jediné rozhodnutí, které mění strukturu dokumentu.You said: Mám to na tento workshop https://buildersday.Mám to na tento workshop https://buildersday.cz/5:48Claude responded: Tohle mění strategii víc, než bys čekal.Fetched: https://buildersday.cz/Fetched: https://buildersday.cz/Tohle mění strategii víc, než bys čekal. Přečetl jsem si formát a je to klíčové pro to, jak ten nápad upravit.
Co Builders Day reálně je
Je to jednodenní intenzivní workshop, kde ráno přijdeš s nápadem a večer odejdeš s deploynutým produktem — žádný mockup, reálný produkt živě na internetu. Den je rozdělený na dva build sprinty, dokončování a deployment od 15:00, a v 16:00 má každý 3 minuty na prezentaci. A pozor — top 3 buildeři získají měsíc mentoringu od Filipa a Jakuba zdarma v hodnotě 100 000 Kč. buildersday + 2
To znamená dvě věci pro tebe konkrétně.
Za prvé — scope musíš brutálně zúžit, ne rozšířit
Celý můj předchozí návrh (security gate se 3-4 kontrolami, advisory vrstva, atd.) je pořád moc velký na jeden den. Před akcí máš onboarding call s cílem nascopeovat produkt do MVP dokumentu, ať v den D rovnou stavíš to, co má hodnotu, a neztrácíš čas. Tvoje výhoda je obří: Cortex už máš postavený. Takže nestavíš od nuly — extrahuješ jeden gate z existujícího frameworku a zabalíš ho do nasaditelné podoby. buildersday
Konkrétně bych na ten den scopeoval jednu jedinou kontrolu, která dává viditelný výsledek: leaked secrets / API klíče v repu. Je objektivní, dá se odprezentovat za 3 minuty („tady je repo, kliknu, najde to 4 leaknuté klíče, vygeneruje URL"), a každý vibe-coder s tím má problém. To je perfektní MVP demo.
Za druhé — porota nejsou technici, jsou to founders/GTM lidi
Filip je startup founder zaměřený na fundraising, GTM a scaling. Jakub je AI engineer, který launchuje MVP pro firmy. A celá akce je postavená na příběhu solo builderů jako Pieter Levels nebo Marc Lou, kteří staví rychle a generují revenue. Takže je nebude zajímat technická hloubka tvého gatu — bude je zajímat: je tu reálný problém? zaplatí za to někdo? jde to nasadit a prodat? buildersdaybuildersday
Tady máš výhodu i slabinu. Výhoda: ten „veřejný artefakt jako důkaz pro klienta" je čistě GTM nápad, který jim bude rezonovat. Slabina: tvoje původní pozice „mise pomoct pár lidem, ne milionový nápad" jde proti DNA téhle akce. Nemusíš předstírat milionový exit, ale měl bys umět říct, kdo a proč by za to platil.
Jak tedy upravit nápad pro tento konkrétní den
Pozice: „Secret Scanner pro vibe-coded repa — najde leaknuté klíče a vystaví veřejný certifikát čistoty, který freelancer pošle klientovi."
Den D scope: GitHub Action, jedna kontrola (secrets), výstup na veřejné URL, Stripe Checkout na ~50 Kč na validaci. To je realisticky nasaditelné do 15:00 a krásně se to prezentuje.
Regulatorní háček úplně vyhoď — na téhle akci tě nikdo nebude grilovat o AI Actu a jen by to ředilo pitch.
Chceš, abych ti přepsal ten dokument do téhle zúžené verze připravené na onboarding call s Filipem a Jakubem?You said: Nene, nemusíme nic zužovat, zaprvé už mám tohle hotovéNene, nemusíme nic zužovat, zaprvé už mám tohle hotové 
https://www.davidrajnoha.dev/case-study/cortex-xZa druhé neboj, já toho stihnu hodně za ten den5:56Claude responded: Fér, beru zpět to zužování.Fetched: cortex-x — Claude Code framework · Case StudyFetched: cortex-x — Claude Code framework · Case StudyFér, beru zpět to zužování. Když máš za sebou 365 commitů za 27 dní, 2 955 testů, spec-verifier se šesti criterion kinds a 15 nočních cronů, co běží bez dozoru — tak ano, ten den zvládneš víc, než jsem počítal, a máš z čeho extrahovat. Cortex-X je seriózní engineering, žádný debat. davidrajnoha
Takže ne „zužovat scope", ale vyřešit jeden konkrétní rozpor, který v tom nápadu pořád je. A je důležitý.
V case study sám píšeš dvě věci, které se s pitchem perou
Za prvé: „Build the product before the framework. RELO came first. Extract pattern from working result, then formalize. The opposite order produces frameworks nobody uses." To je tvoje vlastní lekce L/01. A teď bys na Builders Day chtěl udělat přesný opak — vzít framework a hledat pro něj produkt. Tvoje vlastní case study tě varuje, že tudy cesta nevede. davidrajnoha
Za druhé: spec-verifier je popsaný jako „the wedge" — primitiv, který nemá Devin, Codex, Cursor ani OpenClaw, protože mainstream runtime věří self-reportu LLM, kdežto cortex-x píše důkaz v kódu. Tohle je tvůj reálný diferenciátor. Ale v Code Quality Gate pitchi ho vůbec neprodáváš — místo toho prodáváš obecné „6 gatewayů kvality", což je slabší a generičtější než to, co skutečně umíš. davidrajnoha
Co z toho plyne pro úpravu nápadu
Nápad neměň ve scope, ale přesměruj ho na to, co je v Cortexu unikátní a co se na téhle akci dá prodat. Místo „kontroluju kvalitu kódu" (subjektivní, dělají to všichni) postav produkt kolem té věci, kterou podle vlastního průzkumu nikdo nemá:
„Důkaz, že AI-agent reálně udělal, co tvrdí, že udělal — ne jeho vlastní self-report, ale verifikace v kódu, vystavená jako veřejný artefakt."
To je spec-verifier + read_set criterion (důkaz, že LLM přečetl soubory, co tvrdí) zabalený pro klienta freelancera. Sedí to na tvoji llm_judge i read_set logiku, je to obhajitelné proti technikovi (máš to postavené a otestované) a zároveň to má GTM příběh pro Filipa a Jakuba: „vibe-coder odevzdá klientovi důkaz, že agent nelhal."
Jak to vyřešit s lekcí L/01
Tvoje vlastní pravidlo „nejdřív produkt, pak framework" obejdeš jednoduše: produkt už existuje (Cortex běží v produkci, dogfooduje sám sebe). Builders Day MVP není „framework hledající produkt", ale extrakce jedné už ověřené schopnosti do samostatné, prodejné podoby. To je přesně to legitimní pořadí — máš working result, teď z něj vytahuješ jednu věc ven.
Takže otázka na tebe, ať vím, jak přepsat ten dokument: chceš ten produkt postavit kolem bezpečnosti (leaked secrets, lethal trifecta, OWASP Agentic — tvrdě měřitelné), nebo kolem verifikace agenta (spec-verifier, „agent neudělal, co tvrdí" — tvůj unikátní wedge)? Obojí máš v Cortexu, ale každé vede k jinému pitchi a jinému demu.You said: Co nevrhujes ty teda?Co nevrhujes ty teda? Nejlepší možnou cestu6:01Claude responded: Verifikace agenta.Verifikace agenta. Jednoznačně.
Proč ta, a ne bezpečnost
Secret scanning je červený oceán. Gitleaks, TruffleHog, GitHub Secret Scanning zadarmo přímo v repu — když to postavíš, první otázka technika bude „čím se lišíš od gitleaks?" a ty nemáš dobrou odpověď. Tvoje vlastní case study přitom černé na bílém říká, kde je tvůj jediný obhajitelný náskok: spec-verifier je „the wedge", primitiv, který nemá Devin, Codex, Cursor ani OpenClaw. To se nestaví dvakrát do roka — to je věc, co tě odlišuje. Stavět produkt kolem secrets by znamenalo zahodit jedinou věc, kterou máš a ostatní ne.
Konkrétní produkt na Builders Day
Pozice jednou větou: „Důkaz, že tvůj AI agent reálně udělal, co tvrdí — verifikovaný v kódu, ne podle jeho vlastního slova, vystavený jako veřejná URL pro klienta."
Tvoje case study sama dodává killer formulaci, kterou použij doslova: mainstream agent runtime věří self-reportu LLM, cortex-x píše důkaz v kódu. To je celý pitch. Vibe-coded svět je plný agentů, co řeknou „hotovo, otestováno, nasazeno" — a nikdo nemá jak ověřit, že nelžou. Ty na to máš primitiv: read_set (důkaz, že přečetl soubory, co tvrdí), llm_judge, shell exit kódy, file_predicate.
Den D scope (realistický pro tebe, ne pro průměr)

GitHub Action, co na PR spustí spec-verifier proti deklarovaným kritériím
Tři až čtyři criterion kinds, co už máš: read_set, shell, file_predicate, regex — necpat tam všech šest, llm_judge nech jako bonus
Veřejná URL s výsledkem = certifikát „agent splnil X, ověřeno strojem" — tvůj diferenciátor, drž se ho
Stripe Checkout na ~50 Kč na validaci

Proč to vyhraje místnost
Filipa a Jakuba (founder + AI engineer launchující MVP pro firmy) tahle bolest osobně zná — sami shipují agenty pro klienty. „Jak klientovi dokážu, že agent nelhal" je problém, který chápou okamžitě a bez vysvětlování. A je to GTM příběh i technický wedge zároveň, což je vzácná kombinace.
A vyřeší to tvoji vlastní lekci L/01: nestavíš framework hledající produkt, vytahuješ jednu už ověřenou, v produkci běžící schopnost ven jako samostatný nástroj. To je legitimní pořadí.
Jedna věc, kterou si ohlídej: nepřeprodávej to jako „pro každý kód". Je to nástroj pro lidi, co používají AI agenty na shipování — to je tvoje cílovka, ne celý vývojářský svět. Ostřejší cílovka = silnější pitch.
Mám ti přepsat ten dokument do téhle verze, připravený na onboarding call s Filipem a Jakubem?You said: Já už ten call s nima měl, už teď jedu do Prahy vlakemJá už ten call s nima měl, už teď jedu do Prahy vlakem6:02Claude responded: Tak to jedeš stavět, ne plánovat — fajn.Tak to jedeš stavět, ne plánovat — fajn. V tom případě ti nebudu cpát přepis dokumentu, ale tři věci do hlavy na ten vlak, ať dorazíš s jasnem.
Co postavit jako první (ať máš v 16:00 co ukázat)
Postav demo odzadu od prezentace. Tři minuty, porota nejsou jen technici. Nejdřív zprovozni tu nejjednodušší smyčku, co dává viditelný výstup: PR → spec-verifier zkontroluje jedno deklarované kritérium → veřejná URL s verdiktem „ověřeno / neprošlo". Když tohle běží naživo na reálném repu, máš hotový pitch. Všechno ostatní (víc criterion kinds, Stripe) je až potom.
Pořadí pro jistotu deploymentu

Funkční smyčka na jednom criterion kindu (shell nebo file_predicate — nejtvrdší, nejmíň co se pokazí)
Veřejná URL s výsledkem — tvůj diferenciátor, bez něj to je jen další checker
Až tohle stojí: druhý criterion kind + read_set jako „wow" moment
Stripe Checkout úplně nakonec, je to validace, ne core

Jedna věta pro prezentaci
„Agenti řeknou hotovo a nikdo neověří, že nelhali. Tohle to ověří v kódu a vystaví důkaz, který freelancer pošle klientovi." Pak ukázat živě. Konec.
Hlavní riziko dneška není scope ani schopnosti — je to scope creep. Máš obří framework za zády a pokušení ukázat z něj moc. Drž se jedné smyčky, jedné URL, jedné věty.
Hodně štěstí v Praze. Šlape ti to.You said: Takže coto přesně bude dělat?Takže coto přesně bude dělat? Jednoduše řekni6:06Claude responded: Jednoduše: nainstaluješ to do svého GitHub repa.Jednoduše: nainstaluješ to do svého GitHub repa. Pokaždé když AI agent (nebo ty přes vibe coding) otevře pull request, nástroj zkontroluje, jestli agent reálně udělal, co tvrdí — ne podle jeho slov, ale ověřením v kódu. Spustí testy, podívá se, jestli soubory existují, jestli sedí obsah. Pak vygeneruje veřejnou URL, kde je výsledek: „ověřeno" nebo „neprošlo".
Ta URL je pointa. Freelancer ji pošle klientovi jako důkaz, že odevzdaný kód reálně prošel strojovou kontrolou — i když tomu klient sám nerozumí.
V jedné větě pro porotu: agenti říkají „hotovo", tohle ověří, že nelžou, a vystaví o tom důkaz.You said: V podstatě by bylo dobré to začít používat hned od začátku vývoje v tom repu, a freelance by pak měl důkaz, že celý projekt byl zkontrolovány a je to kvalitníV podstatě by bylo dobré to začít používat hned od začátku vývoje v tom repu, a freelance by pak měl důkaz, že celý projekt byl zkontrolovány a je to kvalitní6:07Claude responded: Přesně tak.Přesně tak. A to je vlastně silnější framing než „kontrola na konci".
Když to běží od prvního commitu, nevzniká jen jeden certifikát na konci — vzniká historie. Každý PR má svůj ověřený záznam, takže výsledný důkaz není „na konci to prošlo", ale „celý projekt byl průběžně kontrolovaný, tady je stopa". To se padělá mnohem hůř a pro klienta to znamená víc.
Jedna věc, kterou si v tom hlídej, ať tě na to porota nenachytá: rozdíl mezi „zkontrolováno" a „je to kvalitní". Stroj umí tvrdě ověřit, že agent udělal, co deklaroval (testy prošly, soubory sedí, kritéria splněna). To je objektivní. „Je to kvalitní" je o krok dál a subjektivnější — tam bych byl v formulaci opatrný. Drž se „ověřeno, že splňuje deklarovaná kritéria průběžně celým vývojem" — to je pravda, kterou obhájíš, a zní stejně dobře.
Pro pitch to dává ještě hezčí příběh: nástroj nasadíš na začátku, on tiše běží celý projekt, a na konci máš důkaz, který jsi nemusel nijak vyrábět — vznikl sám. To se Filipovi a Jakubovi bude líbit, protože je to „set and forget", ne další práce navíc.
Doraz, zprovozni tu smyčku, a tenhle příběh máš. Šlape ti to.You said: Ono se to může zdát jako blbost, ale reálně mi to přijde jako dobré, protože Vibe coderu přibývá a tohle by mohl být jako důkaz že práce co dělají není shit a …Ono se to může zdát jako blbost, ale reálně mi to přijde jako dobré, protože Vibe coderu přibývá a tohle by mohl být jako důkaz že práce co dělají není shit a zároveň pro klienta třeba klid na duši, že to má ověřené. Za mě to je celkem dobrý, i když se to může zdát lidem jako blbost6:16Claude responded: Není to blbost.Není to blbost. A ten instinkt, že to obhajuješ, bych pustil z hlavy — věcně to stojí na nohou.
Co tě drží v právu: trh reálně roste (vibe coderů přibývá, to není dojem), problém je opravdový (klient nemá jak poznat kvalitu, freelancer nemá jak ji doložit), a tvoje řešení sedí přesně do té mezery — vzniká důvěra mezi dvěma stranami, co si navzájem nevidí do kódu. To je klasický „trust layer" produkt a ty fungují právě proto, že odstraňují nejistotu, ne proto, že jsou technicky složité.
Kde bych tě ale držel při zemi, ať tě to nezklame: hodnota není v tom, že je to technicky chytré (i když je). Je v tom, že to někdo chce. To se na Builders Day dnes ukáže — když to lidem v místnosti dáš a oni řeknou „jo, tohle bych použil" nebo dokonce dají těch 50 Kč, máš odpověď. Když pokrčí rameny, taky máš odpověď, jen jinou. Tak či tak to dnes večer víš líp než teď ve vlaku.
A i kdyby se to nakonec ukázalo jako „nice, ale nekoupím" — pořád jsi za den postavil funkční produkt z vlastního frameworku a máš co prezentovat. To není prohra v žádném scénáři.
Drž se té jedné smyčky a té jedné věty. Uvidíme se na druhé straně dne.You said: Jo však jo, ono ve výsledku o nic nejde přeci :D, takže dej mi větu kterou mám pak říct když se mě někdo zeptá co stavím, tak aby to jednoduše pochopilJo však jo, ono ve výsledku o nic nejde přeci :D, takže dej mi větu kterou mám pak říct když se mě někdo zeptá co stavím, tak aby to jednoduše pochopil6:30Claude responded: „Stavím nástroj, co u AI-generovaného kódu ověří, že agent fakt udělal, co tvrdí — a dá ti o tom důkaz, který freelancer pošle klientovi jako záruku, že to nen…„Stavím nástroj, co u AI-generovaného kódu ověří, že agent fakt udělal, co tvrdí — a dá ti o tom důkaz, který freelancer pošle klientovi jako záruku, že to není shit."
Pokud chceš ještě kratší na úplně rychlé situace: „Kontrola kvality pro kód od AI — důkaz pro klienta, že dostal solidní práci."
Ta první je lepší, když máš pět vteřin navíc, protože v ní je to „agent dělá, co tvrdí", což lidi chytne. Druhá je pro výtah.You said: Že agent udělal fakt co tvrdí, to asi moc nechápuŽe agent udělal fakt co tvrdí, to asi moc nechápu6:31Claude responded: Fér, to si zaslouží vysvětlit, protože je to jádro tvého produktu.Fér, to si zaslouží vysvětlit, protože je to jádro tvého produktu.
Když necháš AI agenta něco udělat, on ti na konci napíše něco jako „hotovo, přidal jsem tu funkci, napsal testy, všechno prošlo." Jenže to je jen jeho slovo. Agent si občas vymyslí, že něco udělal, přeskočí krok, nebo napíše test, co ve skutečnosti nic netestuje — a stejně ti vesele hlásí „done". Ty mu věříš, protože nemáš čas nebo znalosti to ručně kontrolovat.
Tvůj nástroj tomu slovu nevěří. Místo toho to ověří — spustí ty testy doopravdy, zkontroluje, jestli ten soubor fakt existuje, jestli v něm fakt je to, co agent tvrdí. Buď to sedí, nebo ne.
To je přesně ten rozdíl, co máš v case study: běžné agenty věří tomu, co o sobě LLM řekne. Tvůj píše důkaz v kódu. Agent řekne „udělal jsem to" → tvůj nástroj řekne „ověřeno, fakt to tam je" nebo „lže, tohle nesedí".
Jestli ti to ve větě dělá zmatek, dá se to říct i bez „agenta":
„Stavím nástroj, co u kódu od AI ověří, že to fakt funguje, jak se tvrdí — a dá ti důkaz pro klienta, že to není shit."You said: Jaký by si doporučil pricing pro takovou apku?Jaký by si doporučil pricing pro takovou apku?9:04Claude responded: Hned na úvod: dnes na Builders Day cenu neřeš jako příjem, řeš ji jako test.Hned na úvod: dnes na Builders Day cenu neřeš jako příjem, řeš ji jako test. Filip a Jakub ti to nejspíš řekli taky — symbolických ~50 Kč přes Stripe Checkout není o penězích, je to signál, jestli to má vůbec hodnotu. Když někdo zaplatí i padesát korun, řekl ti víc než deset lidí, co kývne „hezký". To je dnešní pricing. Tečku.
Na reálný model později bych přemýšlel takhle:
Účtuj za repo nebo za projekt, ne za uživatele. Hodnota vzniká na úrovni „jeden klientský projekt = jeden důkaz". To je přirozená jednotka, kterou freelancer chápe a umí ji přeúčtovat klientovi.
Tři úrovně, co dávají smysl pro tvůj typ produktu:

Free na public/open-source repa — to ti dělá distribuci a důvěru, lidi to uvidí běžet u ostatních
Něco jako 5–15 €/měsíc za privátní repo pro sólo freelancera — tvoje hlavní cílovka
Vyšší tier pro někoho s víc projekty/klienty najednou

Čísla ber jako odhad, ne doporučení — reálnou hladinu zjistíš jedině tím, že se lidí zeptáš a sledíš, kdo skutečně zaplatí.
Jedna věc, co je u tebe specifická: ten „důkaz pro klienta" je vlastně samostatná hodnota, za kterou by možná šlo účtovat zvlášť. Běžná kontrola = levně/zdarma. Ale „vystavený, ověřitelný certifikát, co pošlu klientovi" = to je ta věc, za kterou freelancer reálně platí, protože mu vydělává důvěru a možná i vyšší sazbu. Klidně bys mohl jet model „kontrola zadarmo, certifikát placený". To je chytřejší dělící čára než počet repozitářů.
Ale to všechno je až po dnešku. Dnes: Stripe, 50 Kč, kdo klikne. Zbytek se ukáže.You said: Je to hodně specifické produkt že?Je to hodně specifické produkt že? Podle mě tam budu s něčím takovým sám9:06Claude responded: Nejspíš ano — a to je dobrá i ošemetná zpráva zároveň.Nejspíš ano — a to je dobrá i ošemetná zpráva zároveň.
Dobrá: v místnosti budeš pravděpodobně jediný, kdo přišel s něčím postaveným na vlastním produkčním frameworku za zády, ne s nápadem od nuly. Ostatní budou dnes hledat scope a learovat tooling; ty extrahuješ ověřenou věc ven. To tě odliší a porotě to dojde rychle.
Ošemetná: „jsem tu s tím sám" se dá číst dvěma způsoby a ty si musíš být jistý, který platí. Buď jsi napřed — vidíš mezeru, kterou ostatní ještě nevidí (to je tvoje teze a case study ji podpírá: spec-verifier nemá ani Devin ani Cursor). Nebo jsi vedle — řešíš věc, kterou nikdo nechce, proto tam nikdo jiný není. Rozdíl mezi těmi dvěma nepoznáš přemýšlením ve vlaku. Poznáš ho dnes, když to lidem ukážeš a oni buď řeknou „tohle potřebuju", nebo pokrčí rameny.
Takže to „budu tam sám" neber jako potvrzení, že jsi výjimečný, ani jako varování, že jsi mimo. Ber to jako otevřenou otázku, na kterou ti dnešek odpoví. Jdi tam ne dokázat, že máš pravdu, ale zjistit, jestli ji máš. To je mimochodem přesně ten postoj, co tě nezklame v žádném scénáři.
A i kdyby — specifický produkt s jasnou cílovkou je skoro vždycky lepší startovní bod než obecný nástroj pro všechny. Úzké se dá rozšířit. Mlha se rozšířit nedá.You said: A co je ten spec verifier vlastně?A co je ten spec verifier vlastně?9:07Claude responded: To je srdce tvého Cortexu, takže dobře, že se ptáš — ať to umíš říct vlastními slovy, ne jen z case study.To je srdce tvého Cortexu, takže dobře, že se ptáš — ať to umíš říct vlastními slovy, ne jen z case study.
Spec-verifier je kontrolor, co sedí mezi tím, co agent udělal, a tím, než se to pustí dál. Funguje jednoduše: u každé akce si agent předem deklaruje kritéria — „tohle musí platit, aby byla akce úspěšná". Spec-verifier pak ta kritéria projde jedno po druhém a ověří, jestli reálně sedí. Když všechna projdou, akce se pustí. Když jedno selže, akce se zaříznou, vrátí se zpět a zapíše se, co nesedělo.
Tvoje case study uvádí šest typů kritérií, co umí ověřit — zjednodušeně:

shell — spustí příkaz a zkontroluje, jestli skončil dobře (typicky: prošly testy?)
file_predicate — existuje ten soubor? sedí jeho obsah?
regex — je v souboru ten vzor, co tam má být?
read_set — důkaz, že agent reálně přečetl soubory, o kterých tvrdí, že je četl
llm_judge — druhý model posoudí „ano/ne", jestli to dává smysl
ears_text — kontrola formulace požadavku

Pointa, kterou v case study sám označuješ za „the wedge": běžné agenty (Devin, Cursor, Codex) věří tomu, co o sobě LLM řekne. Spec-verifier tomu nevěří a napíše důkaz v kódu. Proto „fails closed" — když si není jistý, radši to zaříkne, než aby pustil něco neověřeného.
Pro Builders Day to potřebuješ umět říct na jednu větu: „Je to kontrolor, co u každé akce agenta ověří, že fakt splnila, co měla — a když ne, tak ji nepustí dál." To je celý spec-verifier laicky.You said: Takže jednou větou jednoduše co stavím?Takže jednou větou jednoduše co stavím? A proč to někdo může chtít?9:14Claude responded: Co stavíš: „Nástroj, co u kódu od AI ověří, že fakt funguje, jak se tvrdí, a dá ti o tom důkaz pro klienta.Co stavíš: „Nástroj, co u kódu od AI ověří, že fakt funguje, jak se tvrdí, a dá ti o tom důkaz pro klienta."
Proč to někdo chce: „Protože vibe coderů přibývá, klient nemá jak poznat, jestli dostal kvalitní práci nebo shit — a freelancer nemá jak dokázat, že je dobrá. Tohle ten důkaz vyrobí."
Když to chceš spojit do jednoho dechu:
„Stavím nástroj, co u kódu od AI ověří, že to fakt funguje, a dá ti důkaz pro klienta, že to není shit — protože vibe coderů je čím dál víc a nikdo nepozná kvalitu, dokud se to za pár měsíců nerozpadne."
To poslední („dokud se to nerozpadne") je háček, co lidem došlápne, proč na tom záleží. Drž se toho. Ať to v Praze šlape