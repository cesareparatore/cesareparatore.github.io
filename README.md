# Cesare Paratore — sito personale

Sito statico multipagina per GitHub Pages, senza framework o dipendenze runtime aggiuntive. L'archivio è preparato per il repository utente `cesareparatore.github.io`, quindi i percorsi e gli URL canonici fanno riferimento alla root del dominio `https://cesareparatore.github.io/`.

## Struttura

- `index.html`: homepage scrollytelling.
- `chi-sono/`, `sport-manager/`, `chinesiologo/`, `running-coach/`, `formatore/`, `web-designer/`, `dove-sono/`, `contatti/`: pagine professionali.
- `privacy/`: informativa bilingue che descrive il perimetro verificabile dal codice e segnala le verifiche privacy ancora necessarie.
- `404.html`: pagina di errore personalizzata per GitHub Pages.
- `css/style.css`, `js/script.js`: stile e interazioni della homepage.
- `assets/interior.css`, `assets/interior.js`: design system e interazioni delle pagine interne.
- `assets/images/`: ritratto e marchio SVG.
- `assets/audio/`: traccia audio esistente; l'audio non viene avviato automaticamente.
- `robots.txt`, `sitemap.xml`, `.nojekyll`: file per la pubblicazione e la reperibilità.
- `scripts/quality-check.py`: controlli statici riproducibili senza dipendenze Python esterne.
- `.github/workflows/quality.yml`: workflow di controllo statico e sintassi JavaScript su push e pull request.
- `docs/`: relazione, report, matrice di accessibilità e criticità residue.

## Controlli locali

Requisiti: Python 3 e Node.js 22 o compatibile.

```bash
python scripts/quality-check.py
node --check js/script.js
node --check assets/interior.js
```

Il controllo Python verifica i riferimenti locali, le ancore, gli ID duplicati, i metadati principali, i JSON-LD, i riferimenti CSS locali, la sitemap e l'URL sitemap in `robots.txt`. È un controllo statico leggero, non sostituisce un validatore HTML5/CSS completo né i test browser.

## Pubblicazione su GitHub Pages

1. Fai una copia del repository e conserva una versione recuperabile prima di sostituire file.
2. Estrai lo ZIP e copia **il contenuto** dell'archivio nella root del repository; `index.html`, `assets/`, `css/`, `js/`, le pagine e `.github/` devono essere al livello corretto.
3. In **Settings → Pages**, verifica branch e cartella sorgente configurati.
4. Esegui commit e push. Il workflow `Static quality checks` deve concludersi con esito positivo; questo workflow controlla la qualità statica e non pubblica il sito da solo.
5. Attendi il deploy di GitHub Pages e verifica URL, menu, lingua, contatti, immagini, pagina privacy e pagina 404.
6. Esegui Lighthouse da Chrome DevTools sulle pagine principali in modalità mobile e desktop; registra data, versione e condizioni.
7. Controlla Search Console per indicizzazione e, quando disponibili, Core Web Vitals sul campo.

## Limiti noti

- La lingua inglese delle pagine professionali è attualmente applicata lato client sulla stessa URL. Il contenuto può cambiare in browser, ma non costituisce una coppia di URL statici IT/EN indicizzabili in modo indipendente. La strategia multilingue SEO resta un miglioramento prioritario.
- Il testo privacy è prudente e descrive ciò che emerge dal codice; non costituisce una verifica legale definitiva. Confermare hosting, trattamenti, log, retention e servizi effettivamente attivi.
- In questa sessione Chromium ha bloccato l'apertura dei file locali con `ERR_BLOCKED_BY_ADMINISTRATOR`. Non sono dichiarati test browser, Lighthouse, screen reader, Core Web Vitals sul campo o deploy superati.
- GitHub Pages non consente di configurare liberamente tutti gli header HTTP di sicurezza dal repository statico. Le impostazioni effettivamente disponibili vanno verificate nell'ambiente di hosting.

Per evidenze e limiti consultare `docs/RELAZIONE-TECNICA.md`, `docs/REPORT-TEST.md`, `docs/MATRICE-ACCESSIBILITA.md`, `docs/PAGELLA-EVIDENZE.md` e `docs/CRITICITA-RESIDUE.md`.
