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


## Missione 5.1 — header identico alla homepage

- Le 18 pagine interne IT/EN ora riutilizzano la stessa struttura di testata della homepage: monogramma SVG, controllo lingua, controllo audio e pulsante menu con icone a due linee.
- Il menu interno è stato ricostruito con la stessa struttura visiva del pannello della homepage, con percorsi corretti per le versioni italiane e inglesi.
- La barra di navigazione capitoli non è stata copiata sulle pagine interne perché serve a scorrere le sezioni della sola homepage e non avrebbe una funzione equivalente nelle pagine di servizio.
- `assets/interior.js` gestisce apertura/chiusura del pannello, Escape, focus, cambio lingua e controllo audio riutilizzando la traccia già presente nel progetto.
- `assets/interior.css` ora contiene lo stile condiviso della testata e del pannello menu, incluse regole responsive e `prefers-reduced-motion`.
- Il quality checker controlla la presenza e l'unicità dei componenti essenziali dell'header sulle pagine interne.
- Limite: il browser reale resta bloccato nell'ambiente; uniformità DOM/CSS e test statici sono verificati, ma non si dichiara un confronto visuale browser superato.

## Revisione 5.2 — Header condiviso con la homepage

È stato introdotto `assets/header.css`, caricato dopo il foglio principale in homepage e dopo il CSS interno nelle pagine di contenuto. In questo modo gli elementi comuni della testata (monogramma, selettore lingua, controllo audio, menu e pannello di navigazione) condividono le stesse regole visive. Le pagine interne sono in modalità `header-menu-mode`, così il pulsante MENU rimane visibile come nella homepage quando la testata è in uso. Il selettore lingua aggiorna `aria-pressed` per indicare correttamente la lingua attiva.

Verifiche eseguite in questa revisione: controlli statici del progetto superati; `node --check` sugli script superato; parsing CSS senza errori; sitemap XML valida; smoke test HTTP locale 22/22 risorse con risposta 200; integrità ZIP verificata. Non è stato eseguito un confronto visivo browser perché Chromium non è disponibile nell’ambiente.

