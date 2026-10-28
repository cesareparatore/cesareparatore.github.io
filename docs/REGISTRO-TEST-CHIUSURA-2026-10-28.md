# Registro test — chiusura revisione INEVITABILITÀ

Data: 28 ottobre 2026. Ambito: pacchetto locale; nessuna pubblicazione o push GitHub.

## Test eseguiti

| Test | Procedura | Esito | Limiti |
|---|---|---|---|
| Coerenza pagine Chi sono IT/EN | `python scripts/check-chi-sono-i18n.py` | PASS — 34 coppie verificate; `lang`, canonical e hreflang controllati | Test mirato, non revisione editoriale umana completa di ogni pagina |
| Controlli di qualità statici | `python scripts/quality-check.py` | PASS — 21 pagine contenuto + verifica Google; 3 CSS; 20 URL sitemap | Non equivale a validazione W3C completa né a test browser |
| Integrità sito | `python scripts/check-site-integrity.py` | PASS — 22 pagine HTML; link e risorse locali risolti; nessun ID duplicato; tutte le immagini hanno `alt` | Gli `alt` sono controllati per presenza, non per accuratezza semantica |
| Sintassi JS | `node --check js/script.js`; `node --check assets/interior.js`; `node --check assets/404.js` | PASS — nessun errore di sintassi riportato | Non prova la correttezza runtime di ogni flusso |
| Apertura browser via file | Playwright + Chromium `/usr/bin/chromium`, pagina `file:///.../index.html` | BLOCCATO — `net::ERR_BLOCKED_BY_ADMINISTRATOR` | Nessuna prova visuale o end-to-end attribuita come superata |
| Apertura browser via HTTP locale | Server HTTP Python su `127.0.0.1` con porta dinamica; Playwright + Chromium | BLOCCATO — `net::ERR_BLOCKED_BY_ADMINISTRATOR` | Non è stato possibile misurare overflow, errori console, responsive o screenshot |
| Integrità ZIP consegna | `unzip -t <archivio>` | PASS — archivio leggibile e senza errori di compressione | Non dimostra il funzionamento nel browser |

## Correzione CSS aggiuntiva applicata

È stata rilevata una criticità specifica di cascata CSS: alcune regole locali di componenti interattivi usavano `outline:none` con specificità superiore al selettore generico `:where(...):focus-visible`. Un reset generico a specificità bassa non garantiva quindi di ripristinare l'indicatore di focus in tutti i casi.

Sono state aggiunte regole `:focus-visible` più specifiche in `css/style.css` e `assets/interior.css`, mirate ai componenti che avevano regole locali di outline, con outline e alone ad alto contrasto. I controlli statici sono stati ripetuti dopo la modifica e sono passati. **La visibilità effettiva resta da confermare in browser**, non disponibile in questo ambiente.

## Riferimenti tecnici ufficiali consultati

- W3C, WCAG 2.2: https://www.w3.org/TR/WCAG22/
- W3C WAI, overview e aggiornamenti WCAG: https://www.w3.org/WAI/standards-guidelines/wcag/
- web.dev, Core Web Vitals e soglie: https://web.dev/articles/vitals
- Google Search Central, versioni localizzate e hreflang: https://developers.google.com/search/docs/specialty/international/localized-versions
- Google Search Central, canonicalizzazione: https://developers.google.com/search/docs/crawling-indexing/canonicalization

## Criteri Core Web Vitals di riferimento

Le soglie “good” correnti documentate da web.dev sono LCP ≤ 2,5 s, INP ≤ 200 ms e CLS ≤ 0,1, valutate al 75° percentile per dispositivi mobili e desktop. Queste metriche **non sono state misurate in questo run**: nessun dato di laboratorio o di campo viene dichiarato.

## Stato di chiusura

- Static checks: PASS.
- Correzione del focus CSS: applicata; test runtime non disponibile.
- WCAG 2.2 AA completa: NON CERTIFICATA.
- Test responsive/browser: BLOCCATI dall'ambiente.
- Lighthouse e Core Web Vitals: NON MISURATI.
- SEO live/indexing e privacy fattuale: non verificabili senza accesso al sito/strumenti e conferma del titolare.
