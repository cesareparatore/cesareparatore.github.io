# Storico degli interventi

Questa nota è mantenuta per tracciare gli interventi precedenti. Per lo stato corrente fare riferimento a `RELAZIONE-TECNICA.md` e `REPORT-TEST.md`.

La prima revisione aveva introdotto `assets/interior.css` e `assets/interior.js`, perché le pagine professionali richiamavano file che mancavano nell'archivio originale. La revisione successiva ha aggiunto controlli statici e corretto il riferimento sitemap in `robots.txt`, il preloader, l'ordine di configurazione dell'audio, la gestione della lingua e del menu e la pagina privacy.

I risultati browser, Lighthouse, Core Web Vitals, screen reader, deploy e conformità legale non sono stati dichiarati superati perché non sono stati eseguiti o non erano disponibili.


## Revisione 3.0 — localizzazione statica

Aggiunte 10 route inglesi statiche sotto `/en/`; impostati `lang`, canonical, `og:url`, metadati social, JSON-LD localizzato e `hreflang` reciproci. La sitemap contiene 20 URL. Il selettore lingua naviga alla pagina equivalente. La 404 sceglie lingua e destinazione in base al percorso. Il checker controlla ora anche canonical, `og:url`, `hreflang`, DOCTYPE, attributi duplicati e copertura sitemap.
