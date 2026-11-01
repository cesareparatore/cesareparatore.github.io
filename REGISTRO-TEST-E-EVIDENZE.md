# Registro test ed evidenze — 1 novembre 2026

| Controllo | Esito | Evidenza / limite |
|---|---|---|
| Integrità ZIP base | PASS | `ZipFile.testzip()` = `None`; 127 voci |
| `scripts/quality-check.py` | PASS | 21 pagine contenuto + verifica Google; 3 CSS; 20 URL sitemap |
| `scripts/check-site-integrity.py` | PASS | 22 HTML; link/asset locali, ID, immagini alt |
| `scripts/check-chi-sono-i18n.py` | PASS | 46 coppie IT/EN secondo il test incluso |
| `scripts/check-psai-technical.py` | PASS | robots, canonical, hreflang, JSON-LD, sitemap, dominio |
| `scripts/check-psai-document-structure.py` | PASS | struttura statica; non certifica WCAG |
| `scripts/check-psai-local-http.py` | PASS | 20 route HTTP 200 su loopback, robots/sitemap e 404 HTTP 404 |
| `node --check js/script.js` | PASS | controllo sintattico |
| `node --check assets/interior.js` | PASS | controllo sintattico, non runtime |
| `node --check assets/404.js` | PASS | controllo sintattico |
| Parsing CSS con tinycss2 | PASS | 0 errori di parsing nei 3 CSS; non è validazione W3C |
| Parsing XML sitemap | PASS | parsing XML |
| Parsing JSON-LD | PASS | 20 blocchi JSON decodificati |
| ID duplicati | PASS | nessun duplicato rilevato dal controllo incluso |
| Favicon | PASS | riferimenti locali risolti su 21 pagine contenuto/404 |
| Playwright/Chromium | BLOCKED | Chromium headless non ha completato il caricamento entro il timeout; i report precedenti documentano `ERR_BLOCKED_BY_ADMINISTRATOR` |
| Lighthouse / Core Web Vitals | NOT RUN | nessuna misura disponibile |
| Validatore W3C HTML/CSS | NOT RUN | nessuna validazione W3C eseguita |
| WCAG 2.2 AA / screen reader | NOT RUN | nessun audit completo o test assistivo |
| DNS/TLS/header/SEO live | NOT RUN | nessuna verifica remota effettuata |
| Ricerca/citazioni AI reali | NOT RUN | nessun pilot o baseline disponibile |

## Comandi ripetibili

Dalla radice del progetto:

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

I PASS sopra si riferiscono ai controlli realmente eseguiti in locale; non implicano collaudo visuale, runtime, accessibilità certificata o prestazioni misurate.
