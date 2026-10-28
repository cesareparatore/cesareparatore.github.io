# Verifica conclusiva — standard e prove disponibili

**Data:** 28 ottobre 2026  
**Ambito:** revisione locale del sito statico; nessuna pubblicazione o push GitHub.

## Cosa significa «10/10» in modo verificabile

Non esiste uno standard universale che assegni un voto complessivo 10/10 a un sito personale. Per evitare un voto arbitrario, il criterio adottato è: nessun difetto bloccante noto nei controlli eseguibili, requisiti normativi pertinenti verificati, obiettivi prestazionali misurati, contenuti fattuali confermati dal proprietario e limiti dichiarati. I test automatizzati non dimostrano da soli la conformità completa.

## Riferimenti aggiornati consultati

- **Accessibilità:** W3C WCAG 2.2 è il riferimento tecnico corrente. Per AA sono particolarmente pertinenti contrasto testo (4.5:1 per testo normale e 3:1 per testo grande), tastiera, focus visibile, reflow, nome/ruolo/valore e i criteri 2.4.11 Focus Not Obscured (Minimum) e 2.5.8 Target Size (Minimum). La verifica richiede test automatici e manuali; una scansione statica non basta. Fonte: https://www.w3.org/TR/WCAG22/ e https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- **Prestazioni:** obiettivi Core Web Vitals al 75° percentile: LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1. I dati di laboratorio sono utili per diagnosi ma non sostituiscono i dati di campo; senza sito pubblicato/CrUX non si può dichiarare la conformità di campo. Fonti: https://web.dev/articles/vitals e https://developers.google.com/search/docs/appearance/core-web-vitals
- **SEO:** controlli locali di canonical, hreflang e sitemap verificano la configurazione nel codice, non l'indicizzazione effettiva. Fonti: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls e https://developers.google.com/search/docs/specialty/international/localized-versions

## Verifiche eseguite in questa sessione

- `python scripts/check-chi-sono-i18n.py`: PASS — 34 coppie IT/EN coerenti; lang, canonical e hreflang controllati.
- `python scripts/quality-check.py`: PASS — 21 pagine HTML di contenuto più verifica Google; 3 file CSS; 20 URL sitemap.
- `python scripts/check-site-integrity.py`: PASS — 22 pagine HTML; link e risorse locali risolti; nessun ID duplicato; immagini con `alt`.
- `node --check js/script.js`, `node --check assets/interior.js`, `node --check assets/404.js`: PASS.
- `unzip -t` sull'archivio di consegna: PASS — nessun errore di integrità ZIP.
- Tentativo di verifica browser con Chromium/Playwright su server locale e su `file://`: BLOCCATO dall'ambiente (`ERR_BLOCKED_BY_ADMINISTRATOR`). Nessun risultato di rendering, screenshot o test end-to-end è stato contato come superato.

## Correzioni incluse nel pacchetto

- Indicatore di focus visibile rafforzato nei CSS globali e delle pagine interne.
- Rispetto di `prefers-reduced-motion` esteso alle animazioni e alle transizioni pertinenti.
- Nessuna nuova credenziale, testimonianza, risultato professionale o servizio inventato.

## Stato finale, senza sovrastimare le prove

| Area | Stato verificabile |
|---|---|
| Coerenza IT/EN nei controlli automatici mirati | PASS |
| Integrità dei collegamenti e delle risorse locali | PASS |
| Sintassi JavaScript | PASS |
| Integrità ZIP | PASS |
| Focus da tastiera e movimento ridotto | Correzioni presenti; comportamento runtime non verificato in browser in questo ambiente |
| WCAG 2.2 AA completa | NON CERTIFICATA: contrasto misurato, tastiera completa, zoom/reflow e screen reader non verificati manualmente |
| UX responsive e flussi interattivi | NON VERIFICATI visivamente: Chromium è stato bloccato dall'ambiente |
| Lighthouse e prestazioni di laboratorio | NON MISURATI |
| Core Web Vitals di campo e indicizzazione live | NON VERIFICABILI senza dati live/strumenti del proprietario |
| Veridicità di ogni dato professionale | Non sono stati aggiunti dati nuovi; la conferma documentale spetta al proprietario |

**Conclusione:** il pacchetto è stato sottoposto ai controlli statici ripetibili e l'archivio è integro. Non assegno un 10/10 complessivo né dichiaro conformità WCAG o prestazioni non misurate: farlo sarebbe una falsa attestazione. Il lavoro locale è aggiornato; i soli punti non chiudibili onestamente in questa sessione sono quelli che richiedono browser eseguibile, prove manuali o dati live. Nessuna pubblicazione online e nessun push GitHub sono stati effettuati.
