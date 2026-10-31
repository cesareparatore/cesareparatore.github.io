# Registro test ed evidenze — 31 ottobre 2026

**Ambiente:** copia locale estratta dall'archivio caricato dall'utente.  
**Data:** 31 ottobre 2026.  
**Classi:** SUPERATO, FALLITO, PARZIALE, NON ESEGUIBILE, NON VERIFICATO.

| ID | Test e obiettivo | Procedura/strumento | Esito osservato | Evidenza | Limiti |
|---|---|---|---|---|---|
| T01 | Qualità statica del sito | `python scripts/quality-check.py` | SUPERATO | Exit code 0; 21 pagine contenuto + pagina verifica Google; 3 CSS; 20 URL sitemap. | Solo controlli implementati dallo script. |
| T02 | Link e risorse locali, ID, alt, menu iniziale | `python scripts/check-site-integrity.py` | SUPERATO | Exit code 0; 22 HTML; nessun link/asset locale irrisolto o ID duplicato; immagini con alt; menu statici non bloccati nel markup iniziale. | Non prova il comportamento browser o screen reader. |
| T03 | Coerenza IT/EN | `python scripts/check-chi-sono-i18n.py` | SUPERATO | Exit code 0; 34 coppie controllate; `lang`, canonical e hreflang. | Non prova qualità linguistica editoriale completa o rendering. |
| T04 | Sintassi JavaScript homepage | `node --check js/script.js` | SUPERATO | Exit code 0. | Non esegue il codice né testa eventi/runtime. |
| T05 | Sintassi JavaScript pagine interne | `node --check assets/interior.js` | SUPERATO | Exit code 0. | Non esegue il codice né testa eventi/runtime. |
| T06 | Sintassi JavaScript 404 | `node --check assets/404.js` | SUPERATO | Exit code 0. | Non esegue il codice né testa eventi/runtime. |
| T07 | Parsing HTML e JSON-LD | Python + lxml; `json.loads` su ogni script JSON-LD | SUPERATO | 22 HTML analizzati; 20 blocchi JSON-LD parseabili; nessuna eccezione fatale. | Parsing non equivale a validazione W3C o correttezza semantica del grafo. |
| T08 | Parsing CSS | Python + tinycss2 | SUPERATO | 3 fogli analizzati; zero token di errore. | Non verifica cascade, resa o supporto browser. |
| T09 | XML sitemap | `lxml.etree.parse('sitemap.xml')` | SUPERATO | Parsing XML senza eccezioni. | Non prova disponibilità delle URL sul server. |
| T10 | Integrità ZIP di ingresso | `zipfile.ZipFile.testzip()` | SUPERATO | Nessun membro corrotto nell'archivio caricato. | Riguarda il pacchetto sorgente, non il pacchetto finale. |
| T11 | Rendering Chromium locale | `chromium --headless --no-sandbox --disable-gpu --screenshot=... file://.../index.html`, timeout 25 s | NON ESEGUIBILE | Processo terminato con exit 124; nessuno screenshot prodotto; log DBus/zygote e timeout. | Non attribuibile a un bug del sito; browser bloccato/instabile nell'ambiente. |
| T12 | Responsive reale e screenshot viewport | Browser funzionante su viewport multipli | NON ESEGUIBILE | Dipende da T11 e da device/browser reali. | Breakpoint CSS presenti non costituiscono test responsive. |
| T13 | Interazioni menu, lingua, audio, capitoli, pause, preloader, 404 | E2E browser e test manuale tastiera/touch | NON ESEGUIBILE | Nessuna sessione browser funzionante. | Il controllo statico non dimostra l'interazione. |
| T14 | WCAG 2.2 AA completo | Scanner + tastiera + zoom/reflow + screen reader + revisione manuale | NON VERIFICATO | Nessuna prova completa raccolta. | Non dichiarare conformità. |
| T15 | Lighthouse / Core Web Vitals | Lighthouse mobile/desktop e dati di campo | NON VERIFICATO | Nessun report o dato LCP/INP/CLS. | Non assegnare punteggi prestazionali. |
| T16 | Dominio, DNS, TLS, redirect, headers e GitHub Pages | Verifica read-only da rete e pannelli autorizzati | NON VERIFICATO | Nessun accesso remoto utilizzato. | Il file locale non prova configurazione live. |
| T17 | Indicizzazione e presenza AI | Search Console, Bing Webmaster e pilot AI preregistrato | NON VERIFICATO | Nessuna baseline o transcript di pilot. | Robots/canonical/JSON-LD non provano indicizzazione o citazione. |
| T18 | Privacy e trattamenti effettivi | Inventario provider, log, retention, email, WhatsApp e revisione competente | NON VERIFICATO | Dati del titolare/provider non completi. | Nessuna conformità legale dichiarata. |

## Osservazioni aggiuntive

- `robots.txt` contiene direttive distinte per `OAI-SearchBot`, `GPTBot`, `ChatGPT-User` e `OAI-AdsBot`; le scelte non sono considerate approvate finché il titolare non conferma le quattro finalità.
- `sitemap.xml` contiene 20 URL, coerenti con le 10 route italiane e le 10 inglesi.
- Il file `CNAME` è assente, coerente con la decisione locale corrente sul dominio GitHub Pages.
- Il file audio opzionale è di circa 4 MB; il codice usa `preload="none"` e l'attivazione è esplicita. Il peso non è una misura di performance né un difetto dimostrato senza waterfall e test sul campo.

## Riproducibilità

Eseguire dalla root del progetto:

```bash
python scripts/quality-check.py
python scripts/check-site-integrity.py
python scripts/check-chi-sono-i18n.py
node --check js/script.js
node --check assets/interior.js
node --check assets/404.js
```

Per completare i test non eseguibili serve un ambiente browser reale e accessi read-only autorizzati agli strumenti esterni; non sono richieste credenziali da inviare in chat.
