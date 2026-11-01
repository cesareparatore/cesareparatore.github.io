# Registro test — 1 novembre 2026

| ID | Test | Esito | Evidenza / limite |
|---|---|---|---|
| T01 | Integrità ZIP sorgente | PASS | `ZipFile.testzip()` = `None`; 123 voci |
| T02 | `python3 scripts/quality-check.py` | PASS | 21 pagine contenuto + verifica Google; 3 CSS; sitemap 20 URL |
| T03 | `python3 scripts/check-site-integrity.py` | PASS | 22 HTML; link/asset locali; ID; immagini alt; menu statici |
| T04 | `python3 scripts/check-chi-sono-i18n.py` | PASS | 46 coppie IT/EN secondo il test incluso; lang/canonical/hreflang |
| T05 | `python3 scripts/check-psai-technical.py` | PASS | robots, canonical, hreflang, JSON-LD, sitemap, dominio |
| T06 | `python3 scripts/check-psai-document-structure.py` | PASS | struttura statica; non certifica WCAG |
| T07 | `python3 scripts/check-psai-local-http.py` | PASS | 20 route HTTP 200, robots/sitemap, 404 HTTP 404 e noindex su loopback |
| T08 | `node --check js/script.js` | PASS | sintassi JavaScript |
| T09 | `node --check assets/interior.js` | PASS | sintassi JavaScript dopo correzione F-01 |
| T10 | `node --check assets/404.js` | PASS | sintassi JavaScript |
| T11 | tinycss2 su 3 CSS | PASS | 0 errori di parsing |
| T12 | XML sitemap | PASS | parsing XML |
| T13 | JSON-LD | PASS | 20 blocchi JSON decodificati |
| T14 | ID duplicati | PASS | nessun duplicato rilevato |
| T15 | Manifest SHA-256 | PASS | ricalcolato e confrontato dopo aggiornamento |
| T16 | Playwright Chromium su `http://127.0.0.1` | BLOCCATO | `net::ERR_BLOCKED_BY_ADMINISTRATOR`; nessuna prova runtime/visuale |
| T17 | Lighthouse / Core Web Vitals | NON ESEGUITO | nessun valore disponibile |
| T18 | W3C HTML/CSS | NON ESEGUITO | validator non disponibile localmente; nessuna richiesta remota |
| T19 | WCAG 2.2 AA / screen reader | NON ESEGUITO | richiede browser, strumenti assistivi e revisione manuale |
| T20 | DNS/TLS/headers/SEO live | NON ESEGUITO | perimetro locale; nessun accesso remoto |

## Ripetibilità

Eseguire dalla radice del progetto:

```bash
python3 scripts/quality-check.py
python3 scripts/check-site-integrity.py
python3 scripts/check-chi-sono-i18n.py
python3 scripts/check-psai-technical.py
python3 scripts/check-psai-document-structure.py
python3 scripts/check-psai-local-http.py
node --check js/script.js
node --check assets/interior.js
node --check assets/404.js
```
