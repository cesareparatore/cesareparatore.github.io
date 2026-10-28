# Criticità residue ordinate per priorità

## P0 — Prima di dichiarare il sito pronto in senso pieno

1. **Verifica browser end-to-end:** impossibile in questa sessione per `ERR_BLOCKED_BY_ADMINISTRATOR`. Provare homepage, pagine interne, menu, cambio lingua, audio, preloader e 404 in un browser reale dopo il deploy.
2. **Privacy reale:** confermare chi gestisce il dominio/hosting, eventuali log e retention, servizi attivi e trattamenti effettivi. Il testo aggiornato descrive limiti, ma non sostituisce le informazioni del titolare né una revisione legale.
3. **Prestazioni:** eseguire Lighthouse su mobile e desktop, registrare i risultati e confrontare la versione originale e aggiornata. Nessun punteggio o Core Web Vital è stato misurato qui.

## P1 — Priorità alta

4. **SEO multilingue:** creare URL statici distinti per le versioni inglesi se l'obiettivo è l'indicizzazione indipendente; completare traduzioni, canonical, `hreflang`, sitemap e test per coppie linguistiche. La traduzione attuale è client-side sulla stessa URL.
5. **Accessibilità completa:** completare contrasto, tastiera, zoom/reflow, screen reader e verifica criterio per criterio WCAG 2.2 AA.
6. **Verifica dei contenuti professionali:** confermare che servizi, ambito geografico, descrizioni e recapiti siano aggiornati e corrispondano all'offerta reale.
7. **Validazione HTML/CSS completa:** eseguire validatori dedicati; il controllo locale incluso è statico e intenzionalmente leggero.

## P2 — Miglioramenti successivi

8. **Dati sul campo:** monitorare Core Web Vitals e indicizzazione dopo che il sito avrà traffico e dati sufficienti.
9. **Header di sicurezza:** verificare gli header HTTP realmente forniti da GitHub Pages; il repository statico non consente di configurare arbitrariamente tutti gli header.
10. **Test browser in CI:** se si sceglie in futuro di introdurre browser automation, aggiungerla solo con una dipendenza mantenuta e senza complicare inutilmente il sito statico.

## Cosa non è stato fatto

Non è stato eseguito il deploy; non sono stati inventati punteggi Lighthouse, risultati di screen reader, misurazioni Core Web Vitals, certificazioni WCAG o conformità legale.
