# Scelta del dominio — fase corrente

**Data:** 31 ottobre 2026  
**Stato:** configurazione locale del pacchetto; nessuna modifica online.

## Decisione

Per la fase di revisione e collaudo il dominio canonico del sito è:

`https://cesareparatore.github.io/`

Il dominio personalizzato `cesareparatore.it` è rinviato e non deve essere configurato prima del raggiungimento del punteggio 10/10, documentato con evidenze secondo PSAI V2.4, e di una successiva autorizzazione esplicita.

## Modifiche applicate al pacchetto

- Canonical, `og:url`, URL assoluti in JSON-LD, `Person.url` e `Person.@id` allineati al dominio GitHub Pages.
- `hreflang` italiano, inglese e `x-default` allineati.
- `sitemap.xml` aggiornato al dominio GitHub Pages.
- URL sitemap in `robots.txt` aggiornato.
- Controlli automatici aggiornati per verificare il nuovo dominio.
- Rimosso il file `CNAME`, che avrebbe richiesto il dominio personalizzato in GitHub Pages.
- L'indirizzo email `info@cesareparatore.it` resta invariato: non è un riferimento al dominio web.

## Limiti e cautela

La modifica è stata eseguita esclusivamente nei file locali del progetto. Non sono stati modificati repository remoto, impostazioni GitHub Pages, DNS, hosting o configurazioni online; non è stato effettuato alcun deployment. Il fatto che il pacchetto dichiari il dominio GitHub Pages non prova che il sito sia pubblicato o raggiungibile a tale indirizzo.

Le relazioni precedenti conservate in `docs/` possono contenere il dominio personalizzato perché descrivono lo stato storico delle consegne. Questo documento e la configurazione tecnica attiva definiscono la decisione corrente.
