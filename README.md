# Cesare Paratore — sito personale

Sito statico multipagina per GitHub Pages, senza framework o dipendenze runtime aggiuntive. L'archivio è preparato per il repository utente `cesareparatore.github.io`, quindi i percorsi e gli URL canonici fanno riferimento alla root del dominio `https://cesareparatore.github.io/`.

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
- `robots.txt`, `sitemap.xml`, `.nojekyll`: file per la pubblicazione e la reperibilità.
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
