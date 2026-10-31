# Registro test — PSAI V2.4, sezioni 5.1–5.5

**Esecuzione:** 31 ottobre 2026, ambiente locale offline.  
**Radice:** cartella principale del progetto.  
**Esclusioni:** nessun test HTTP/live, nessun servizio esterno, nessuna pubblicazione o invio.

| ID | Comando/verifica | Risultato | Evidenza/limite |
|---|---|---|---|
| T01 | `python scripts/check-psai-technical.py` | PASS | 20 pagine indicizzabili; crawler; canonical/hreflang; JSON-LD; sitemap; 404 noindex; no CNAME |
| T02 | `python scripts/quality-check.py` | PASS | 21 pagine contenuto + verifica Google; 3 CSS; 20 URL sitemap |
| T03 | `python scripts/check-site-integrity.py` | PASS | 22 HTML; link/risorse locali; ID; alt immagini; menu statici |
| T04 | `python scripts/check-chi-sono-i18n.py` | PASS | 34 coppie IT/EN; lang, canonical e hreflang |
| T05 | `node --check js/script.js` | PASS | Sintassi JavaScript |
| T06 | `node --check assets/interior.js` | PASS | Sintassi JavaScript |
| T07 | `node --check assets/404.js` | PASS | Sintassi JavaScript |
| T08 | Parsing JSON-LD con `json.loads` | PASS | 20 blocchi validi in 22 documenti HTML |
| T09 | Parsing CSS con `tinycss2` | PASS | 3 CSS; 0 errori tokenizer; versione 1.5.1 |
| T10 | Parsing XML sitemap con ElementTree | PASS | XML valido; 20 URL univoci verificati da T01 |
| T11 | Browser E2E / rendering Chromium | NON ESEGUITO CON SUCCESSO | Tentativo precedente file:// terminato per timeout; nessuna evidenza DOM/screenshot; non dichiarato PASS |
| T12 | HTTP status, crawler reali, Google Search Console/Bing, Rich Results live | BLOCCATO | Richiede sito pubblicato e accessi autorizzati; non eseguito |
| T13 | Lighthouse/Core Web Vitals e WCAG manuale | BLOCCATO | Richiede browser/ambiente di test adeguato e audit manuale; non eseguito |

## Anomalie residue / non verificabili

- Nessuna anomalia rilevata dai test locali T01–T10.
- T11 non fornisce evidenza runtime e rimane aperto.
- T12–T13 non sono stati eseguiti; non possono essere conteggiati come superati.
- Non è possibile verificare offline la scansione, indicizzazione, citazione AI, stato HTTP, log crawler o dati proprietari delle piattaforme.
