# Cesare Paratore — sito personale

Sito statico multipagina per GitHub Pages, senza framework o dipendenze runtime aggiuntive. La fase corrente usa il dominio GitHub Pages `https://cesareparatore.github.io/`. Il dominio personalizzato `cesareparatore.it` è rinviato: non è configurato nel pacchetto e potrà essere attivato soltanto dopo il raggiungimento e la verifica documentata del punteggio 10/10.

## Struttura

- `index.html`: homepage scrollytelling.
- `chi-sono/`, `sport-manager/`, `chinesiologo/`, `running-coach/`, `formatore/`, `web-designer/`, `dove-sono/`, `contatti/`: pagine professionali.
- `privacy/`: informativa bilingue che descrive il perimetro verificabile dal codice e segnala le verifiche privacy ancora necessarie.
- `en/`: versioni statiche inglesi della homepage e delle nove pagine interne (`/en/`, `/en/chi-sono/`, ecc.), con `lang`, canonical e `hreflang` dedicati.
- `404.html`: pagina di errore personalizzata per GitHub Pages.
- `css/style.css`, `js/script.js`: stile e interazioni della homepage.
- `assets/interior.css`, `assets/interior.js`: design system e interazioni delle pagine interne; il monogramma SVG è condiviso con la homepage e i focus da tastiera sono espliciti.
- `assets/404.js`: localizza la pagina 404 in base al percorso richiesto.
- `assets/images/`: ritratto e marchio SVG.
- `assets/audio/`: traccia audio esistente; l'audio non viene avviato automaticamente.
- `robots.txt`, `sitemap.xml`, `.nojekyll`: file per la pubblicazione e la reperibilità. Le direttive crawler sono distinte per finalità; vedi `docs/REVISIONE-PSAI-V24-2026-10-31.md`.
- `scripts/quality-check.py`: controlli statici riproducibili senza dipendenze Python esterne, inclusi canonical, `hreflang`, `og:url`, sitemap e struttura dei documenti.
- `.github/workflows/quality.yml`: workflow di controllo statico e sintassi JavaScript su push e pull request.
- `docs/`: relazione, report, matrice di accessibilità, criticità residue e checklist delle informazioni professionali da confermare (`INFORMAZIONI-DA-CONFERMARE.md`).

## Controlli locali

Requisiti: Python 3 e Node.js 22 o compatibile.

```bash
python scripts/quality-check.py
node --check js/script.js
node --check assets/interior.js
node --check assets/404.js
```

Il controllo Python verifica i riferimenti locali, le ancore, gli ID e gli attributi duplicati, il DOCTYPE, i metadati principali, i JSON-LD, canonical, `og:url`, `hreflang` reciproci, la copertura della sitemap, l'URL sitemap in `robots.txt`, il colore `theme-color`, il monogramma SVG condiviso e la presenza delle regole di focus visibile. È un controllo statico leggero, non sostituisce un validatore HTML5/CSS completo né i test browser.

## Dominio della fase corrente

Canonical, Open Graph, JSON-LD, hreflang, sitemap e robots.txt sono allineati a `https://cesareparatore.github.io/`. Il file `CNAME` è assente intenzionalmente. Non configurare `cesareparatore.it` prima della verifica documentata 10/10 e di una successiva autorizzazione esplicita. L’indirizzo email `info@cesareparatore.it` resta invariato perché è un recapito, non il dominio web.

## Pubblicazione su GitHub Pages

1. Fai una copia del repository e conserva una versione recuperabile prima di sostituire file.
2. Estrai lo ZIP e copia **il contenuto** dell'archivio nella root del repository; `index.html`, `assets/`, `css/`, `js/`, le pagine e `.github/` devono essere al livello corretto.
3. In **Settings → Pages**, verifica branch e cartella sorgente configurati.
4. Esegui commit e push. Il workflow `Static quality checks` deve concludersi con esito positivo; questo workflow controlla la qualità statica e non pubblica il sito da solo.
5. Attendi il deploy di GitHub Pages e verifica URL, menu, lingua, contatti, immagini, pagina privacy e pagina 404.
6. Esegui Lighthouse da Chrome DevTools sulle pagine principali in modalità mobile e desktop; registra data, versione e condizioni.
7. Controlla Search Console per indicizzazione e, quando disponibili, Core Web Vitals sul campo.

## Limiti noti

- Le versioni inglesi sono generate come pagine statiche sotto `/en/`; le versioni italiane restano nelle URL esistenti. Le coppie sono dichiarate tramite `hreflang`, canonical auto-riferiti e sitemap. La corretta pubblicazione e l'indicizzazione vanno ancora confermate dopo il deploy.
- Il testo privacy è prudente e descrive ciò che emerge dal codice; non costituisce una verifica legale definitiva. Confermare hosting, trattamenti, log, retention e servizi effettivamente attivi.
- In questa sessione Chromium ha bloccato l'apertura dei file locali con `ERR_BLOCKED_BY_ADMINISTRATOR`. Non sono dichiarati test browser, Lighthouse, screen reader, Core Web Vitals sul campo o deploy superati.
- GitHub Pages non consente di configurare liberamente tutti gli header HTTP di sicurezza dal repository statico. Le impostazioni effettivamente disponibili vanno verificate nell'ambiente di hosting.

Per evidenze e limiti consultare `docs/RELAZIONE-TECNICA.md`, `docs/REPORT-TEST.md`, `docs/MATRICE-ACCESSIBILITA.md`, `docs/PAGELLA-EVIDENZE.md` e `docs/CRITICITA-RESIDUE.md`.


## Missione 5.3

La correzione delle frecce SVG e i controlli eseguiti sono documentati in `docs/REPORT-TEST-MISSIONE-5.3.md`. La verifica visuale browser e Lighthouse resta esplicitamente aperta perché la navigazione è bloccata nell’ambiente di lavoro.

## Standard PERSONAL SEARCH & AI VISIBILITY v2.4

La revisione del pacchetto, i limiti e i gate aperti sono documentati in `docs/REVISIONE-PSAI-V24-2026-10-31.md`, `docs/GATE-AVVIO-E-MONITORAGGIO-V24.md` e `docs/ESITI-TEST-V24.md`. Il pacchetto non è stato pubblicato. DNS, browser, WCAG 2.2 completa, Lighthouse, KPI, pilot AI, Search Console/Bing e revisione indipendente restano da eseguire.


## Consegna conclusiva PSAI v2.4

Consultare `docs/RELAZIONE-FINALE-REVISIONE-PSAI-V24.md`, `docs/TEST-EFFETTIVI-REVISIONE-FINALE.md`, `docs/REGISTRO-GATE-REVISIONE-FINALE.md` e `docs/CHECKLIST-PUBBLICAZIONE-MONITORAGGIO-PSAI-V24.md` per esiti e gate. Il pacchetto non è pubblicato e richiede autorizzazione esplicita del titolare.


## Aggiornamento creativo 31/10/2026

È disponibile il livello di art direction CSS e motion editoriale, con contenuti statici (nessuna scrittura carattere per carattere). Vedi `docs/REPORT-AGGIORNAMENTO-CREATIVO-2026-10-31.md`. Questa consegna è una build da esaminare: non è stata pubblicata online.

## Verifica integrale aggiuntiva — 31/10/2026

Il rapporto `docs/VERIFICA-INTEGRALE-2026-10-31.md` registra anche parsing HTML/CSS, parsing dei 20 blocchi JSON-LD e controllo dei link con `target="_blank"`. I test browser sono stati tentati ma bloccati dall'ambiente (`ERR_BLOCKED_BY_ADMINISTRATOR`); non sono dichiarati test visuali, Lighthouse, WCAG completa o verifiche live. Il punteggio complessivo documentabile resta provvisoriamente 8,0/10 e non viene dichiarato 9,5/10.

## Revisione progressiva 31/10/2026

La copia di lavoro include un fallback progressivo senza JavaScript per rendere visibili i contenuti e accessibili i link del menu. Dettagli e limiti: `docs/REPORT-MODIFICHE-31-10-2026.md`, `docs/AUDIT-COMPLETO-E-PIANO-10-10-2026-10-31.md`, `docs/REPORT-TEST-EFFETTIVI-31-10-2026.md` e `docs/PAGELLA-FINALE-31-10-2026.md`. Il pacchetto resta non pubblicato e non certificato; nessun punteggio 10/10 viene dichiarato.


## Revisione locale — 31 ottobre 2026

La copia di lavoro contiene anche la correzione del menu no-JavaScript (rimozione dell’`aria-hidden` iniziale sulle 20 pagine) e il checker aggiornato. Consultare `docs/REPORT-REVISIONE-AGGIUNTIVA-31-10-2026.md` per il rilievo e i limiti. Per il dominio della fase corrente prevale `docs/SCELTA-DOMINIO-FASE-CORRENTE-2026-10-31.md`; alcune relazioni storiche documentano build precedenti e sono annotate come tali.

## Audit e consegna probatoria — 31/10/2026

Per questa revisione fanno fede i documenti più recenti:

- `docs/ISTRUZIONI-ORIGINALI-UTENTE-2026-10-31.txt`: brief originale conservato.
- `docs/PSAI-V2.4-STANDARD-OPERATIVO-ORIGINALE.md`: standard V2.4 integrale disponibile nel materiale ricevuto.
- `docs/AUDIT-INIZIALE-2026-10-31.md`: inventario e criticità dell'archivio di partenza.
- `docs/REPORT-INTERVENTI-2026-10-31.md`: interventi documentali effettivamente eseguiti e file coinvolti.
- `docs/REPORT-TEST-EVIDENZE-2026-10-31.md`: registro test con stati, comandi, evidenze e limiti.
- `docs/VALUTAZIONE-PSAI-E-AREE-SITO-2026-10-31.md`: calcolo C1–C12 e valutazione distinta delle 12 aree del sito.
- `docs/REQUISITI-APERTI-E-PIANO-CHIUSURA-2026-10-31.md`: gate, responsabili necessari e prove di chiusura.
- `docs/DICHIARAZIONE-NON-PUBBLICAZIONE-2026-10-31.md`: attestazione delle sole operazioni locali.

La pagella storica `docs/PAGELLA-FINALE-31-10-2026.md` contiene una sintesi qualitativa provvisoria 8,0/10: non è un punteggio ponderato e non va letta come valutazione conclusiva di questa revisione. La valutazione aggiornata è quella nel documento `VALUTAZIONE-PSAI-E-AREE-SITO-2026-10-31.md`.

## Revisione PSAI V2.4 — regole tecniche 5.1–5.5

La revisione tecnica offline aggiornata al 31 ottobre 2026 è documentata in `docs/REPORT-REVISIONE-PSAI-V24-REGOLE-TECNICHE-5-1-5-5-2026-10-31.md`; il registro dei test è in `docs/REGISTRO-TEST-PSAI-V24-5-1-5-5-2026-10-31.md`. Per ripetere il controllo tecnico locale: `python scripts/check-psai-technical.py`. I risultati locali non attestano indicizzazione, prestazioni live, citazioni AI o certificazione indipendente.
