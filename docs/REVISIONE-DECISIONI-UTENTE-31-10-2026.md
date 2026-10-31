# Revisione delle decisioni — 31 ottobre 2026

## Modifiche applicate alla build locale

- Profilo professionale aggiornato per distinguere l’area motoria e sportiva dall’attività separata di Web Designer.
- Inserite le informazioni confermate su laurea L-22, laurea magistrale LM-47, Università Telematica Pegaso, qualifica Istruttore FIDAL (TP0833) e corso Preparatore atletico e sportivo svolto con NonSoloFitness, con Diploma Nazionale e Tesserino Tecnico AICS.
- La pagina Formatore è stata orientata esplicitamente alla formazione in ambito motorio e sportivo.
- Rimossi i collegamenti Instagram e LinkedIn dalle pagine e dai dati strutturati; i contatti pubblici del sito sono email e WhatsApp.
- Rimosso il codice opzionale di invio eventi a `gtag`; il pacchetto non integra Google Analytics né strumenti di profilazione o advertising.
- Informativa privacy aggiornata per descrivere GitHub Pages come hosting attuale e OVHcloud come fornitore email; la migrazione dell’hosting a OVHcloud è pianificata dopo test e approvazione.
- README e workflow CI aggiornati per riflettere la strategia di migrazione e includere più controlli automatici.

## Test locali eseguiti

- `scripts/quality-check.py`: PASS.
- `scripts/check-site-integrity.py`: PASS.
- `scripts/check-chi-sono-i18n.py`: PASS.
- `scripts/check-psai-technical.py`: PASS.
- `scripts/check-psai-document-structure.py`: PASS.
- `scripts/check-psai-local-http.py`: PASS (20 route HTML, robots, sitemap e 404 su server loopback).
- `node --check` su `js/script.js`, `assets/interior.js` e `assets/404.js`: PASS.

## Limiti e gate ancora aperti

- Nessuna pubblicazione o modifica remota è stata eseguita.
- Non sono completati test browser visuali/interattivi, test assistivi manuali, audit WCAG 2.2 AA, Lighthouse o misure Core Web Vitals sul campo.
- La privacy notice resta da completare verificando i log/cookie e la retention effettivi del provider, i dettagli contrattuali del servizio email OVHcloud e i dati identificativi completi del titolare richiesti dalla normativa applicabile.
- Prima della migrazione dovranno essere aggiornati gli URL canonici, i metadati, JSON-LD, sitemap, robots e informativa privacy per `cesareparatore.it`.
- I certificati non sono stati ispezionati direttamente in questa revisione: i dati riportati sono quelli confermati dall’utente e i riferimenti pubblici indicati.

Questa build è una revisione locale da sottoporre a verifica e approvazione; non è una certificazione 10/10 e non è pronta per la pubblicazione definitiva.
