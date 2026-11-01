# Intervento: footer delle pagine interne allineato alla home

- La home italiana resta invariata ed è stata usata come riferimento.
- Applicato alle 18 pagine interne (IT/EN) il comportamento della firma presente nella home.
- La firma “Cesare Paratore” è in corsivo, inclinata, rivelata progressivamente e sottolineata con animazione quando il footer entra in viewport (IntersectionObserver, soglia 0,35).
- Quando il footer esce dalla viewport, l'animazione si resetta; rientrando in vista riparte, come nella home.
- Rispetto `prefers-reduced-motion`: la firma viene mostrata senza animazione.
- Non sono stati modificati contenuti professionali, SEO, canonical, robots, sitemap, DNS, hosting o pubblicazione.

## Verifiche
- PASS — `node --check assets/interior.js`.
- PASS — controllo statico su tutte le 18 pagine interne: footer, firma esatta, caricamento di `interior.css` e `interior.js`.
- PASS — confronto della logica di animazione: replicata la sequenza della home (IntersectionObserver, reset, animazione 2,25 s, completamento dopo 2,35 s).
- NON ESEGUITO — test visivo browser/E2E: non dichiarato come superato.
