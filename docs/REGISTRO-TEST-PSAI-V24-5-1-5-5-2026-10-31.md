# Registro test — PSAI V2.4, sezioni 5.1–5.5

**Esecuzione:** 31 ottobre 2026, ambiente locale offline.  
**Radice:** cartella principale del progetto.  
**Esclusioni:** nessun test HTTP/live sul dominio pubblico, nessun servizio esterno, nessuna pubblicazione o invio. T14 usa esclusivamente un server temporaneo su loopback.

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
| T11 | Browser E2E / rendering Chromium | BLOCCATO | Chromium/Playwright non ha potuto navigare il loopback (`ERR_BLOCKED_BY_ADMINISTRATOR`); il tentativo `file://` precedente è terminato per timeout. Nessuna evidenza DOM/screenshot; non dichiarato PASS |
| T14 | `python scripts/check-psai-local-http.py` | PASS | Server temporaneo su `127.0.0.1`; 20 route HTTP 200, robots.txt e sitemap.xml HTTP 200, route inesistente HTTP 404, pagina 404 con noindex. Nessuna richiesta al dominio pubblico |
| T15 | `python scripts/check-psai-document-structure.py` | PASS (controllo statico) | 21 documenti HTML: lang, title, un H1, main; immagini con alt; link e controlli interattivi con nome accessibile. Non è audit WCAG né test screen reader |
| T12 | HTTP status, crawler reali, Google Search Console/Bing, Rich Results live | BLOCCATO | Richiede sito pubblicato e accessi autorizzati; non eseguito |
| T13 | Lighthouse/Core Web Vitals e WCAG manuale | BLOCCATO | Richiede browser/ambiente di test adeguato e audit manuale; non eseguito |

## Anomalie residue / non verificabili

- Nessuna anomalia rilevata dai test locali T01–T10.
- T11 non fornisce evidenza di rendering/browser runtime e rimane aperto. T14 copre soltanto il livello HTTP locale. T15 è una verifica strutturale statica, non una certificazione di accessibilità.
- T12–T13 non sono stati eseguiti; non possono essere conteggiati come superati.
- Non è possibile verificare offline la scansione, indicizzazione, citazione AI, stato HTTP, log crawler o dati proprietari delle piattaforme.
