# Test della configurazione dominio GitHub Pages

Data: 31 ottobre 2026

## Test superati

- `python scripts/quality-check.py` — PASS: 21 pagine di contenuto + verifica Google, 3 CSS, 20 URL sitemap.
- `python scripts/check-site-integrity.py` — PASS: 22 pagine HTML, link e risorse locali risolti, nessun ID duplicato, immagini con `alt`.
- `python scripts/check-chi-sono-i18n.py` — PASS: 34 coppie IT/EN coerenti; `lang`, canonical e `hreflang`.
- `node --check js/script.js` — PASS.
- `node --check assets/interior.js` — PASS.
- `node --check assets/404.js` — PASS.
- Parsing XML sitemap — PASS: 20 URL, tutti sotto `https://cesareparatore.github.io/`.
- Parsing JSON-LD — PASS: 20 blocchi validi.
- Verifica dominio attivo — PASS: nessun URL assoluto `https://cesareparatore.it` nelle pagine HTML e configurazioni operative esaminate.
- Verifica `robots.txt` — PASS: sitemap dichiarata sul dominio GitHub Pages.
- Verifica CNAME — PASS: file assente.

## Limiti

Questi sono controlli statici locali. Non verificano che GitHub Pages sia già configurato o raggiungibile online, né modificano il repository. Nessun deployment, modifica DNS o modifica delle impostazioni GitHub è stato eseguito.
