# Relazione tecnica — Cesare Paratore

## Perimetro
Intervento eseguito sull'archivio del repository ricevuto, conservando le pagine, i contenuti, le immagini, l'audio e la struttura esistente.

## Problema rilevato e risolto
Le otto pagine interne (`chi-sono`, `chinesiologo`, `contatti`, `dove-sono`, `formatore`, `running-coach`, `sport-manager`, `web-designer`) referenziavano `/assets/interior.css` e `/assets/interior.js`, assenti nel repository fornito. Sono stati aggiunti entrambi i file.

## Migliorie
- Foglio di stile condiviso per le pagine interne, con layout responsive per desktop, tablet e mobile, gerarchia tipografica, card, CTA e footer coerenti.
- Stato hover/focus visibile e link per saltare al contenuto.
- Regole `prefers-reduced-motion` per rispettare la preferenza di movimento ridotto.
- Menu mobile con aggiornamento di `aria-expanded`, chiusura con Escape e chiusura dopo la navigazione.
- Cambio IT/EN per testi con `data-it`/`data-en`, attributo `lang`, titolo e meta description; preferenza lingua salvata quando `localStorage` è disponibile.
- Metadati social Open Graph/Twitter aggiunti alle pagine interne usando l'immagine già presente nel progetto.
- Piccola correzione della traduzione inglese dell'etichetta nella pagina “Chi sono” e newline finale in `robots.txt`.

## Verifiche eseguite
- `node --check js/script.js`: superato.
- `node --check assets/interior.js`: superato.
- Parsing di tutte le pagine HTML e controllo della presenza di `lang` e `title`: superato per le pagine HTML ordinarie.
- Verifica riferimenti locali a link, script, stylesheet, immagini e source: 0 riferimenti mancanti.
- Verifica dei link ad ancora: 0 destinazioni mancanti.
- Verifica ID duplicati: 0.
- Parsing dei blocchi JSON-LD: nessun errore rilevato.
- Parsing XML di `sitemap.xml`: superato.
- Integrità dell'archivio ZIP finale: verificata separatamente.

## Limiti dichiarati
- Non è stato possibile eseguire un test visuale automatizzato in browser: Chromium non è installato nell'ambiente di lavoro.
- Non è stato eseguito un controllo live del sito pubblicato né delle destinazioni esterne.
- La pagina privacy è stata mantenuta senza riscriverla: prima di modificarne i contenuti legali occorre verificare titolare, servizi terzi, log, cookie e tempi di conservazione effettivamente usati.
- Le modifiche sono state testate localmente sui file forniti; non è stata effettuata alcuna pubblicazione su GitHub Pages.
