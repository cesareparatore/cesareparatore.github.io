# Report dei test

Data: 2026-10-27. Ambiente: filesystem locale.

| Controllo | Esito | Evidenza / limite |
|---|---|---|
| Integrità ZIP sorgente e revisioni | Superato | `ZipFile.testzip()` restituisce `None` |
| Inventario HTML | Superato | 11 HTML, incluso il token Google |
| Titoli e H1 | Superato | 10 pagine contenuto con title e un H1; token Google escluso intenzionalmente |
| ID duplicati e ancore | Superato | Nessun duplicato o frammento interno irrisolto rilevato |
| Riferimenti locali HTML | Superato | Nessun file `href`/`src` mancante rilevato |
| JSON-LD e sitemap XML | Superato | JSON e XML parsabili |
| JavaScript | Superato | `node --check` su `js/script.js` e `assets/interior.js` |
| CSS | Superato | `tinycss2` senza errori top-level nei due fogli |
| Chromium / interazioni | Bloccato | `ERR_BLOCKED_BY_ADMINISTRATOR` su localhost e file://; nessun test interattivo dichiarato |
| Validazione W3C online | Non eseguita | Servizi esterni non disponibili |
| Lighthouse | Non eseguito | Nessun punteggio inventato |
| Core Web Vitals sul campo | Non disponibili | Richiedono dati reali sufficienti sul sito pubblicato |
| Screen reader / WCAG 2.2 AA completo | Non eseguito integralmente | Necessarie verifiche manuali con tecnologie assistive |
| Deploy / Search Console / verifica live | Non eseguiti | Nessun deploy effettuato |

Comandi riproducibili: `node --check js/script.js`; `node --check assets/interior.js`. Per CSS, usare `tinycss2.parse_stylesheet` sui file `css/style.css` e `assets/interior.css`. Dopo il deploy eseguire Lighthouse su desktop/mobile, test tastiera e screen reader e verificare canonical, sitemap e Search Console. Obiettivi CWV: LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 al 75º percentile; qui non misurati.
