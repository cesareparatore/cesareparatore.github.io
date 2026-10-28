# Storico degli interventi

Questa nota è mantenuta per tracciare gli interventi precedenti. Per lo stato corrente fare riferimento a `RELAZIONE-TECNICA.md` e `REPORT-TEST.md`.

La prima revisione aveva introdotto `assets/interior.css` e `assets/interior.js`, perché le pagine professionali richiamavano file che mancavano nell'archivio originale. La revisione successiva ha aggiunto controlli statici e corretto il riferimento sitemap in `robots.txt`, il preloader, l'ordine di configurazione dell'audio, la gestione della lingua e del menu e la pagina privacy.

I risultati browser, Lighthouse, Core Web Vitals, screen reader, deploy e conformità legale non sono stati dichiarati superati perché non sono stati eseguiti o non erano disponibili.


## Revisione 3.0 — localizzazione statica

Aggiunte 10 route inglesi statiche sotto `/en/`; impostati `lang`, canonical, `og:url`, metadati social, JSON-LD localizzato e `hreflang` reciproci. La sitemap contiene 20 URL. Il selettore lingua naviga alla pagina equivalente. La 404 sceglie lingua e destinazione in base al percorso. Il checker controlla ora anche canonical, `og:url`, `hreflang`, DOCTYPE, attributi duplicati e copertura sitemap.


## Aggiornamento Missione 4.1 — biografia personale

- La pagina italiana «Chi sono» è stata ampliata con una narrazione in prima persona organizzata in sei tappe: primo computer e primo lavoro; passaggio allo sport; corsa come atleta e allenatore e studi in Scienze Motorie; esperienza nella scuola; laurea magistrale in Management dello Sport; ritorno alla programmazione.
- La versione inglese presenta la stessa struttura e una traduzione editoriale. I nomi ufficiali degli atenei, gli anni e le denominazioni esatte dei titoli non sono stati inventati.
- La homepage riprende una versione più breve della storia, per rendere immediato il filo conduttore senza trasformare la prima schermata in un'autobiografia lunga.
- I contenuti autobiografici si basano sul racconto fornito dal titolare; non sono una verifica indipendente dei titoli o degli incarichi. La checklist `docs/INFORMAZIONI-DA-CONFERMARE.md` indica cosa documentare prima di usare tali dettagli come prove formali.
- Google Business Profile resta fuori dal perimetro di questo intervento.
