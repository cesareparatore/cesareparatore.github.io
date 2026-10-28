# Audit finale documentato — INEVITABILITÀ

**Data:** 28 ottobre 2026  
**Ambito:** revisione e collaudo del pacchetto locale. Nessuna pubblicazione, deploy o push GitHub.

## Standard di riferimento

Non esiste una norma universale che certifichi un sito come “10/10”. Per questa consegna, il massimo livello professionale è definito da requisiti espliciti, assenza di difetti critici noti nei controlli eseguibili, correzione dei problemi trovati, test ripetibili e dichiarazione trasparente dei limiti.

Riferimenti ufficiali consultati:
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- W3C WAI WCAG overview: https://www.w3.org/WAI/standards-guidelines/wcag/
- web.dev Core Web Vitals: https://web.dev/articles/vitals
- Google Search Central, localized versions: https://developers.google.com/search/docs/specialty/international/localized-versions
- Google Search Central, canonicalization: https://developers.google.com/search/docs/crawling-indexing/canonicalization

WCAG 2.2 AA richiede conformità per la pagina intera e per le sue varianti responsive; i controlli automatici da soli non dimostrano conformità completa. Le soglie “good” dei Core Web Vitals sono LCP ≤ 2,5 s, INP ≤ 200 ms e CLS ≤ 0,1 al 75° percentile; non sono state misurate in questa sessione.

## Modifiche applicate in questa chiusura

- `css/style.css`: aggiunti override `:focus-visible` specifici per controlli della homepage e componenti con regole locali che azzeravano l'outline.
- `assets/interior.css`: aggiunti override `:focus-visible` specifici per navigazione, header, footer e CTA delle pagine interne.
- `docs/REGISTRO-TEST-CHIUSURA-2026-10-28.md`: aggiunto registro con comandi, esiti, limiti e riferimenti ufficiali.

La correzione risponde a un difetto concreto della cascata: i selettori generici basati su `:where()` hanno specificità bassa e non prevalgono necessariamente su regole locali più specifiche come `.menu-toggle:focus-visible { outline:none }`. Le regole aggiunte aumentano la specificità e sono poste alla fine dei fogli di stile. La verifica visiva resta bloccata dall'ambiente browser.

## Risultati dei test

- `python scripts/check-chi-sono-i18n.py`: PASS — 34 coppie IT/EN; `lang`, canonical e hreflang.
- `python scripts/quality-check.py`: PASS — 21 pagine contenuto + verifica Google, 3 CSS, 20 URL sitemap.
- `python scripts/check-site-integrity.py`: PASS — 22 pagine HTML, link/risorse locali risolti, zero ID duplicati, tutte le immagini con attributo `alt`.
- `node --check js/script.js`: PASS.
- `node --check assets/interior.js`: PASS.
- `node --check assets/404.js`: PASS.
- Chromium/Playwright con `file://` e con server HTTP locale: BLOCCATO da `ERR_BLOCKED_BY_ADMINISTRATOR`; nessun test browser è stato contato come passato.
- Integrità dell'archivio ZIP: PASS dopo la creazione.

Per i dettagli ripetibili consultare `REGISTRO-TEST-CHIUSURA-2026-10-28.md`.

## Matrice di stato e punteggio

| Area | Stato | Valutazione |
|---|---|---|
| Identità e posizionamento | Revisione editoriale presente; non è una misura normativa | Buona, valutazione qualitativa |
| Narrazione e specificità | Miglioramenti presenti; fatti non documentati non aggiunti | Buona, conferma fattuale finale del titolare utile |
| Chiarezza dei servizi | Struttura presente; modalità/disponibilità non inventate | Buona, conferma fattuale finale necessaria |
| Coerenza IT/EN | Controlli automatici mirati superati | Verificata nei limiti del test (34 coppie) |
| Integrità tecnica statica | Test locali superati | Verificata nei limiti degli script eseguiti |
| Focus tastiera | CSS corretto per contrastare regole locali di `outline:none` | Correzione applicata; comportamento runtime non verificato |
| WCAG 2.2 AA completa | Mancano test browser/manuali e misure di contrasto complete | NON CERTIFICATA |
| UX responsive e interazioni | Browser bloccato dall'ambiente | NON VERIFICATA |
| Prestazioni Lighthouse | Non misurate | NON VERIFICATE |
| Core Web Vitals di campo | Richiedono dati reali sufficienti | NON VERIFICABILI qui |
| SEO e indicizzazione live | Controlli locali su markup/sitemap disponibili; live non controllato | Verifica parziale |
| Privacy fattuale | Dipende da hosting, log, servizi e trattamenti effettivi | Da confermare dal titolare |

Non assegno un voto numerico complessivo aggiornato: le aree determinanti per un punteggio affidabile (accessibilità runtime, responsive, prestazioni) non sono state misurate. Il precedente 8,8/10 era una stima provvisoria e non va interpretato come risultato strumentale. Non sarebbe corretto dichiarare 10/10 in assenza di queste prove.

## Prossimi passaggi per chiudere le verifiche esterne

1. Eseguire il sito in un browser controllabile (il browser di questa sessione blocca sia `file://` sia `127.0.0.1`).
2. Ripetere test tastiera, focus, zoom/reflow, contrasto, menu e cambio lingua a viewport mobile/tablet/desktop; usare un audit automatico e una verifica manuale WCAG 2.2 AA.
3. Eseguire Lighthouse su mobile e desktop e registrare ambiente e risultati.
4. Dopo eventuale pubblicazione autorizzata dal proprietario, raccogliere dati di campo Core Web Vitals e verificare Search Console/indicizzazione. Non è stata eseguita alcuna pubblicazione in questo lavoro.
5. Confermare contenuti professionali e dettagli privacy rispetto alla situazione reale.

**Stato della consegna:** correzione CSS aggiuntiva applicata; controlli statici ripetuti e superati; integrità dell’archivio finale verificata; i limiti browser e prestazioni sono esplicitamente aperti. Nessuna pubblicazione o push GitHub.
