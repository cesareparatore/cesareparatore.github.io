# Report test effettivi — 31 ottobre 2026

## Test eseguiti in questa sessione

| Test | Esito | Evidenza |
|---|---|---|
| `python scripts/quality-check.py` | PASS | 21 pagine contenuto + verifica Google, 3 CSS, 20 URL sitemap |
| `python scripts/check-site-integrity.py` | PASS | 22 HTML, link/risorse locali risolti, ID univoci, immagini con `alt` |
| `python scripts/check-chi-sono-i18n.py` | PASS | 34 coppie IT/EN, `lang`, canonical e hreflang |
| `node --check js/script.js` | PASS | Exit code 0 |
| `node --check assets/interior.js` | PASS | Exit code 0 |
| `node --check assets/404.js` | PASS | Exit code 0 |
| Parser HTML | PASS | 22 documenti analizzati senza eccezioni fatali |
| Parser JSON-LD | PASS | 20 blocchi JSON-LD parseabili |
| Tokenizer CSS | PASS | 3 fogli CSS, nessun token di errore rilevato |
| XML sitemap | PASS | `sitemap.xml` parseabile |
| Fallback no-JS statico | PASS | Flag enhancement presente sulle pagine con script; menu non `inert` nel markup; regole CSS fallback presenti |

## Test non eseguiti o non verificabili

- Browser end-to-end: non eseguito in questa sessione; precedenti tentativi sono stati bloccati dall'ambiente con `ERR_BLOCKED_BY_ADMINISTRATOR`.
- Test visuale/screenshot su viewport e dispositivi reali.
- Test interattivo menu, audio, lingua, capitoli, preloader, 404.
- Lighthouse/PageSpeed, LCP, INP, CLS, peso e waterfall di rete.
- Audit WCAG 2.2 AA completo, screen reader, contrasto manuale, zoom/reflow.
- Validazione W3C HTML/CSS remota.
- DNS, redirect, TLS, status HTTP, header, CNAME e GitHub Pages Settings.
- Search Console, Bing Webmaster, indicizzazione, ranking e citazioni AI.
- Revisione privacy/legale e verifica log/retention reali.

## Interpretazione

I PASS indicano esclusivamente controlli statici locali e parsing. Non certificano la qualità del rendering, l'assenza di regressioni browser, performance, accessibilità completa, privacy, indicizzazione o visibilità AI.
