# Audit della pagina Privacy — 28 ottobre 2026

La pagina è stata aggiornata usando il CSS e lo script condivisi delle pagine interne, evitando di caricare lo script completo della homepage e i suoi timer/effetti. Il contenuto ora è bilingue e descrive esplicitamente i limiti della verifica del codice.

## Evidenza da non trascurare

Nella CTA WhatsApp della homepage è presente un handler inline che invia `click_whatsapp` a `gtag` **solo se** `window.gtag` esiste già. Nel pacchetto esaminato non è stato trovato un loader autonomo di Google Analytics/gtag, ma l'handler potrebbe essere attivato da uno script o da una configurazione esterna non inclusa nell'archivio. Perciò non è corretto affermare senza ulteriori controlli che analytics non venga usato nel sito pubblicato.

## Informazioni da confermare prima di considerare completa l'informativa

- Se `gtag`, Google Analytics, Tag Manager o altri strumenti vengono aggiunti dalla configurazione di hosting o da modifiche non incluse nell'archivio.
- Eventuali cookie, richieste di terze parti, log tecnici e retention del provider di hosting.
- Identità e contatti completi del titolare, finalità, basi giuridiche e tempi di conservazione applicabili ai trattamenti reali.
- Modalità operative per le richieste sui diritti e gli eventuali trasferimenti dei dati.

La pagina aggiornata non costituisce un parere legale né una certificazione di conformità.
