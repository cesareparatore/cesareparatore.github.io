# Report modifiche — 31 ottobre 2026

## Obiettivo

Rendere il sito progressivamente fruibile anche quando JavaScript non è disponibile, senza alterare l'identità visiva, i contenuti professionali, la decisione sul dominio o i comportamenti remoti.

## File aggiornati

- 20 pagine HTML IT/EN: flag `js-enabled` inserito prima dei fogli CSS; rimosso `aria-hidden`/`inert` dal markup statico iniziale del menu. Nel secondo passaggio è stato eliminato anche `aria-hidden="true"`, che era rimasto in tutte le 20 pagine e rendeva il fallback non esposto alle tecnologie assistive.
- `js/script.js`: il menu homepage viene impostato come chiuso/inert dopo l'inizializzazione.
- `assets/interior.js`: attivazione del flag `js-enabled` e inizializzazione del menu come chiuso/inert.
- `css/style.css`: fallback senza JS per preloader, curtain, contenuti reveal e menu.
- `assets/interior.css`: fallback senza JS per menu interno.

## Effetto atteso

Con JavaScript attivo, l'interfaccia mantiene il flusso interattivo esistente. Senza JavaScript, la homepage mostra il contenuto senza overlay bloccanti e i menu restano disponibili come elenchi di link. Il cambio lingua tramite pulsante, audio e controlli dinamici continuano a richiedere JavaScript: le pagine alternate restano comunque raggiungibili tramite link di navigazione quando presenti.

## Non modificato

- Canonical, hreflang, JSON-LD, sitemap e robots.
- Dominio canonico locale `cesareparatore.github.io`.
- Policy OAI-SearchBot/GPTBot/ChatGPT-User/OAI-AdsBot.
- Contenuti biografici e professionali, recapiti e qualifiche.
- Audio, immagini, pagine e architettura URL.
- Repository remoto, GitHub Pages, DNS, hosting e sito pubblicato.

## Limiti

Il fallback è stato verificato staticamente; non è stato possibile confermare il rendering e la navigazione effettivi in un browser nell'ambiente corrente. È necessario un collaudo manuale senza JavaScript e con JavaScript attivo prima di considerare chiuso il gate.

## Correzione aggiuntiva del secondo passaggio

Il controllo manuale del markup ha rilevato `aria-hidden="true"` residuo su tutti i menu iniziali. È stato rimosso in tutte le 20 pagine IT/EN e il checker di integrità è stato aggiornato per impedire regressioni. Il dettaglio è in `REPORT-REVISIONE-AGGIUNTIVA-31-10-2026.md`.
