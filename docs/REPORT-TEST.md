# Report dei test

**Data:** 28 ottobre 2026. **Ambiente:** filesystem locale del workspace; Node.js v22.16.0; Python 3 con `tinycss2` e BeautifulSoup disponibili. Le verifiche non implicano che il sito sia stato pubblicato.

## Test eseguiti

| Controllo | Esito | Evidenza / limite |
|---|---|---|
| Integrità ZIP sorgente e versione precedente | Superato | `ZipFile.testzip()` ha restituito `None` per gli archivi esaminati |
| `python scripts/quality-check.py` | Superato | `ESITO: PASS — controlli statici superati` |
| Sintassi `js/script.js` | Superato | `node --check js/script.js` senza errori |
| Sintassi `assets/interior.js` | Superato | `node --check assets/interior.js` senza errori |
| Sintassi `assets/404.js` | Superato | `node --check assets/404.js` senza errori |
| HTML, title e H1 tramite parser statico | Superato | 21 pagine contenuto (incluse 10 versioni inglesi); la pagina di verifica Google è esclusa intenzionalmente |
| Parser HTML locale `lxml` | Superato come controllo di parsing | Nessun errore ERROR/FATAL riportato; non sostituisce la validazione Nu HTML Checker/W3C |
| ID duplicati | Superato | Nessun ID duplicato rilevato |
| Metadati principali duplicati/mancanti | Superato | Controlli del validator locale senza errori; DOCTYPE unico, attributi duplicati, canonical, `og:url`, `hreflang` e copertura sitemap verificati |
| Riferimenti locali HTML e ancore | Superato | Nessun file locale o frammento mancante rilevato dalla suite |
| JSON-LD | Superato | Blocchi parsabili come JSON |
| Sitemap XML | Superato | XML parsabile; 20 URL presenti, unici e corrispondenti a tutte le pagine indicizzabili IT/EN |
| `robots.txt` | Superato | URL sitemap corretto e verificato dal test automatico |
| Riferimenti CSS locali e bilanciamento parentesi | Superato | Controllo statico leggero, non sostitutivo di un validatore CSS completo |
| Parser CSS `tinycss2` | Superato | 0 errori parser nei due fogli CSS |
| HTTP smoke test con server locale | Superato | tutte le 20 URL della sitemap e 8 file di supporto (`404.html`, `assets/404.js`, JS/CSS condivisi, `robots.txt`, `sitemap.xml`) restituiscono HTTP 200; non equivale a test browser o deploy |
| Integrità ZIP finale | Superato | Archivio finale riaperto; `testzip()` restituisce `None`; inventario verificato sul progetto finale (45 file attesi) |
| Browser Chromium | Non eseguito con successo | `ERR_BLOCKED_BY_ADMINISTRATOR` durante la navigazione Playwright a `http://127.0.0.1`; non dichiarati test UI superati |
| Lighthouse | Non eseguito | Nessun punteggio inventato |
| Core Web Vitals sul campo | Non disponibili | Richiedono dati reali e sufficienti dal sito pubblicato |
| Screen reader / audit manuale WCAG 2.2 AA | Non eseguito integralmente | Necessarie prove manuali con tastiera e tecnologie assistive |
| Validazione HTML5/CSS esterna | Non eseguita | Nessun validatore esterno disponibile nella sessione |
| Controllo live, Search Console e deploy | Non eseguito | Nessun deploy effettuato |

## Inventario e confronto

- File originali: 20.
- File finali: 45.
- File originali mancanti nella versione finale: 0.
- Percorsi originali modificati: 15.
- File aggiunti rispetto all’originale: 25 (incluse 10 pagine inglesi, il controller 404 e la checklist delle informazioni professionali da confermare).

## Comandi riproducibili

```bash
python scripts/quality-check.py
node --check js/script.js
node --check assets/interior.js
node --check assets/404.js
```

Per completare il QA dopo il deploy: aprire ogni pagina in Chrome DevTools, verificare console e richieste, eseguire Lighthouse in condizioni documentate, provare tastiera e screen reader, e controllare Search Console. I target di riferimento per i Core Web Vitals sono LCP ≤ 2,5 s, INP ≤ 200 ms e CLS ≤ 0,1 al 75º percentile; in questa sessione non sono stati misurati.


## Verifiche aggiuntive dopo l’intervento 4.0

Sono stati aggiunti contenuti statici territoriali alla homepage italiana e inglese e alle pagine territoriali dedicate. La verifica automatica successiva controlla che i 17 comuni indicati siano presenti nel contenuto statico e che i riferimenti Person JSON-LD siano coerenti. Questi controlli non dimostrano posizionamento locale, indicizzazione o disponibilità effettiva degli incontri.


### Esiti registrati per la revisione locale 4.0

- `python scripts/quality-check.py`: PASS; 21 documenti HTML controllati, 20 URL in sitemap, controllo di presenza statica dei comuni e coerenza dell’identificatore Person.
- `node --check js/script.js`: PASS.
- `node --check assets/interior.js`: PASS.
- `node --check assets/404.js`: PASS.
- Parsing dei JSON-LD presenti: PASS (20 blocchi).
- Parsing HTML con `lxml`: PASS, nessun messaggio ERROR/FATAL per le pagine del sito.
- Parsing XML sitemap: PASS.
- Parsing CSS con `tinycss2`: PASS, 0 errori nei 2 fogli di stile.
- Presenza di tutti i 17 comuni target nell’HTML statico di `index.html`, `dove-sono/index.html`, `en/index.html` e `en/dove-sono/index.html`: PASS.
- Coerenza del riferimento JSON-LD `Person`: PASS, identificatore `https://cesareparatore.github.io/#cesare-paratore`.
- Test browser/Lighthouse e audit manuale WCAG: non completati in questo ambiente; non vengono dichiarati superati.


### Esiti registrati per la revisione biografica 4.1

- `python scripts/quality-check.py`: PASS.
- `node --check` su `js/script.js`, `assets/interior.js` e `assets/404.js`: PASS.
- Parsing HTML tramite `lxml`: PASS sulle 21 pagine contenuto, escludendo il file di verifica Google privo di struttura HTML ordinaria.
- Parsing JSON-LD: PASS, 20 blocchi JSON validi.
- Parsing sitemap XML: PASS.
- Parsing CSS tramite `tinycss2`: PASS, 0 errori del parser nei 2 fogli CSS.
- Biografia bilingue: verificata la presenza della nuova sezione narrativa sia in `chi-sono/` sia in `en/chi-sono/`, con titoli e paragrafi associati a `data-it`/`data-en`.
- Riepilogo homepage: aggiornato con i passaggi autobiografici principali, mantenendo un testo più breve rispetto alla pagina dedicata.
- Presenza dei 17 comuni target nelle quattro pagine HTML territoriali/homepage IT/EN: PASS.
- Archivio consegnato: 45 file, inclusa `.github/workflows/quality.yml`; `ZipFile.testzip()` restituisce `None`.
- La biografia deriva dal racconto del titolare; non costituisce verifica indipendente dei titoli o degli incarichi. Gli estremi di ateneo, anno e denominazione ufficiale dei titoli restano da confermare.
- Test browser reali, Lighthouse, screen reader e verifica del sito pubblicato restano non eseguiti.

## Missione 5.0 — esiti aggiuntivi (28 ottobre 2026)

| Controllo | Esito | Evidenza / limite |
|---|---|---|
| Marchio SVG condiviso nelle testate interne | PASS | Tutte le 18 pagine che usano `.brand-mark` puntano al file `cp-mark.svg`; i percorsi relativi sono stati risolti sul filesystem |
| Colore della barra browser | PASS | `theme-color` normalizzato a `#f2f0ea` in tutte le 21 pagine di contenuto, inclusa la 404; il file di verifica Google è escluso perché non è una pagina HTML di contenuto |
| Focus da tastiera: regole CSS | PASS statico | Regole esplicite presenti nei CSS homepage e interni; contorno verde scuro sui fondi chiari e lime sui fondi scuri |
| Contrasto dei colori di focus | PASS per le coppie testate | Verde scuro `#26350f` su avorio `#f2f0ea`: 11,53:1; lime `#b8f35c` su nero `#090909`: 15,18:1. Non equivale alla verifica di tutti i contrasti del sito |
| Checker aggiornato | PASS | `python scripts/quality-check.py` verifica anche theme-color, monogramma SVG e presenza delle regole focus-visible |
| Sintassi JavaScript | PASS | `node --check` su `js/script.js`, `assets/interior.js`, `assets/404.js` |
| Parsing HTML / JSON-LD / CSS / sitemap | PASS | 21 pagine contenuto controllate; 20 blocchi JSON-LD validi; CSS analizzato con `tinycss2` senza errori parser; XML sitemap valido |
| HTTP smoke test locale | PASS | 28/28 URL della sitemap e risorse di supporto hanno risposto HTTP 200 tramite server statico locale; non è un test browser né un controllo del sito pubblicato |
| Controlli statici accessibilità di base | PASS | 21 pagine controllate per landmark `main`, `h1`, skip link e immagini con attributo `alt`: nessuna criticità rilevata da questo controllo limitato |
| Browser / responsive / interazioni | NON ESEGUITO | Playwright verso `127.0.0.1` bloccato da `ERR_BLOCKED_BY_ADMINISTRATOR`; nessuno screenshot browser dichiarato |
| Lighthouse / Core Web Vitals | NON ESEGUITO | Nessun punteggio misurato o inventato |
| Deploy / controllo live / Search Console | NON ESEGUITO | Il repository remoto e il sito pubblicato non sono stati modificati né verificati in questa missione |

Comandi riproducibili:

```bash
python scripts/quality-check.py
node --check js/script.js
node --check assets/interior.js
node --check assets/404.js
```
