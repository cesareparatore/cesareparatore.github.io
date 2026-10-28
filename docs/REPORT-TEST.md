# Report dei test

**Data:** 28 ottobre 2026. **Ambiente:** filesystem locale del workspace; Node.js v22.16.0; Python 3 con `tinycss2` e BeautifulSoup disponibili. Le verifiche non implicano che il sito sia stato pubblicato.

## Test eseguiti

| Controllo | Esito | Evidenza / limite |
|---|---|---|
| Integrità ZIP sorgente e versione precedente | Superato | `ZipFile.testzip()` ha restituito `None` per gli archivi esaminati |
| `python scripts/quality-check.py` | Superato | `ESITO: PASS — controlli statici superati` |
| Sintassi `js/script.js` | Superato | `node --check js/script.js` senza errori |
| Sintassi `assets/interior.js` | Superato | `node --check assets/interior.js` senza errori |
| HTML, title e H1 tramite parser statico | Superato | Pagine contenuto controllate; la pagina di verifica Google è esclusa intenzionalmente |
| ID duplicati | Superato | Nessun ID duplicato rilevato |
| Metadati principali duplicati/mancanti | Superato | Controlli del validator locale senza errori |
| Riferimenti locali HTML e ancore | Superato | Nessun file locale o frammento mancante rilevato dalla suite |
| JSON-LD | Superato | Blocchi parsabili come JSON |
| Sitemap XML | Superato | XML parsabile; 10 URL presenti e corrispondenti a pagine locali |
| `robots.txt` | Superato | URL sitemap corretto e verificato dal test automatico |
| Riferimenti CSS locali e bilanciamento parentesi | Superato | Controllo statico leggero, non sostitutivo di un validatore CSS completo |
| Parser CSS `tinycss2` | Superato | 0 errori parser nei due fogli CSS |
| HTTP smoke test con server locale | Superato | `/`, `/chi-sono/`, `/privacy/`, `/404.html`, JS condiviso, `robots.txt` e `sitemap.xml` restituiscono HTTP 200; non equivale a test browser o deploy |
| Integrità ZIP finale | Superato | Archivio riaperto; `testzip()` restituisce `None`; i 33 percorsi nell’archivio corrispondono ai 33 file del progetto |
| Browser Chromium | Non eseguito con successo | `ERR_BLOCKED_BY_ADMINISTRATOR` all'apertura di `file://`; non dichiarati test UI superati |
| Lighthouse | Non eseguito | Nessun punteggio inventato |
| Core Web Vitals sul campo | Non disponibili | Richiedono dati reali e sufficienti dal sito pubblicato |
| Screen reader / audit manuale WCAG 2.2 AA | Non eseguito integralmente | Necessarie prove manuali con tastiera e tecnologie assistive |
| Validazione HTML5/CSS esterna | Non eseguita | Nessun validatore esterno disponibile nella sessione |
| Controllo live, Search Console e deploy | Non eseguito | Nessun deploy effettuato |

## Inventario e confronto

- File originali: 20.
- File finali: 33.
- File originali mancanti nella versione finale: 0.
- Percorsi originali modificati: 13.
- File aggiunti: 13.

## Comandi riproducibili

```bash
python scripts/quality-check.py
node --check js/script.js
node --check assets/interior.js
```

Per completare il QA dopo il deploy: aprire ogni pagina in Chrome DevTools, verificare console e richieste, eseguire Lighthouse in condizioni documentate, provare tastiera e screen reader, e controllare Search Console. I target di riferimento per i Core Web Vitals sono LCP ≤ 2,5 s, INP ≤ 200 ms e CLS ≤ 0,1 al 75º percentile; in questa sessione non sono stati misurati.
