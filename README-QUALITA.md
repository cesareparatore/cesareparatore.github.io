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
- Aggiunte 10 pagine inglesi statiche in `en/`, con `lang="en"`, canonical autonomo, `hreflang` reciproco, metadati social e JSON-LD localizzati; sitemap estesa da 10 a 20 URL. Il selettore lingua ora porta alla pagina equivalente nell'altra lingua.
- Corretta la traduzione della sezione territorio della homepage e tradotti i titoli brevi delle pagine inglesi.
- Localizzata la pagina 404 in base al percorso (`/en/...` o italiano) senza aggiungere servizi esterni.
- Estesi i controlli statici per verificare DOCTYPE, attributi duplicati, canonical, `og:url`, `hreflang` e corrispondenza completa della sitemap.
- Rimosso l’handler HTML inline per l’evento WhatsApp; l’evento opzionale è ora gestito da JavaScript e viene inviato solo se `window.gtag` esiste già. Nel pacchetto non è incluso un loader analytics.

## Esito

`python scripts/quality-check.py` e i controlli `node --check` su `js/script.js`, `assets/interior.js` e `assets/404.js` superano i controlli eseguiti in locale. La verifica browser è bloccata dall'ambiente; Lighthouse e i dati reali degli utenti non sono stati misurati. Consultare il report dei test e le criticità residue prima del deploy.


## Aggiornamento biografia (Missione 4.1)
La pagina «Chi sono» e la sua versione inglese includono ora la storia personale fornita dal titolare, strutturata in sei tappe e collegata a un breve riepilogo in homepage. I titoli di studio sono riportati soltanto nei termini dichiarati; ateneo, anno e denominazioni ufficiali restano da confermare. I test statici vanno rieseguiti prima della pubblicazione.

## Missione 5.0 — coerenza e accessibilità di base

- Le pagine interne utilizzano ora lo stesso monogramma SVG della homepage, anziché una versione testuale diversa.
- Il colore della barra browser è uniformato al fondo avorio del sito.
- Gli indicatori di focus da tastiera sono espliciti e distinguibili sia sui fondi chiari sia su quelli scuri.
- Il quality checker ora controlla questi elementi per ridurre il rischio di regressioni future.
- Esiti locali aggiuntivi: 28/28 risorse HTTP 200 nello smoke test statico; parser CSS/JSON-LD/sitemap e `node --check` superati.
- Limite: browser visuale, Lighthouse, test screen reader e verifica live non sono stati completati; vedere `docs/REPORT-TEST.md`.
