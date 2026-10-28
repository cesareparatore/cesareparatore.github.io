# Stato qualità — 28 ottobre 2026

Questa documentazione accompagna la versione di progetto verificata localmente. Non è una certificazione del sito pubblicato.

## Modifiche rilevanti in questa revisione

- Corretto l'URL della sitemap in `robots.txt` (era indicato `sitemap.xml.nojekyll`).
- Semplificato il preloader: non mostra percentuali simulate; rispetta `prefers-reduced-motion` e mantiene un timeout di recupero.
- Impostato `preload="none"` sull'audio prima di assegnare la sorgente, così la traccia non è richiesta in anticipo dal codice.
- Aggiornato il controller delle pagine interne: lingua dichiarata sul nodo `<html>`, menu mobile con chiusura tramite Escape, focus sul primo link in apertura e ripristino del focus quando si chiude con Escape.
- Rifatta la pagina privacy con il CSS condiviso, contenuto bilingue, metadati social completi e dichiarazioni più caute sui limiti della verifica del codice.
- Aggiunti pagina `404.html`, controlli statici riproducibili e workflow GitHub Actions.
- Uniformati i metadati social e aggiunta una politica `referrer` esplicita nelle pagine contenuto.
- Rimosso l’handler HTML inline per l’evento WhatsApp; l’evento opzionale è ora gestito da JavaScript e viene inviato solo se `window.gtag` esiste già. Nel pacchetto non è incluso un loader analytics.

## Esito

`python scripts/quality-check.py`, `node --check js/script.js` e `node --check assets/interior.js` superano i controlli eseguiti in locale. La verifica browser è bloccata dall'ambiente; Lighthouse e i dati reali degli utenti non sono stati misurati. Consultare il report dei test e le criticità residue prima del deploy.
