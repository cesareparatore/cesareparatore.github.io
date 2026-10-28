# Report intervento — correzione icona menu pagine interne

## Problema individuato
Nelle pagine interne, `assets/interior.css` aggiungeva un'icona menu tramite `.menu-toggle::after` (una linea più un'ombra che simulava la seconda linea). Il pulsante HTML contiene già `.header-menu-icon` con due elementi `<i>`, disegnati da `assets/header.css`. Le due implementazioni si sovrapponevano e producevano l'icona duplicata percepita come `= =`.

## Correzione applicata
- Rimossa da `assets/interior.css` la regola pseudo-elemento `.menu-toggle::after`.
- Rimossa la regola di stato aperto `.menu-toggle[aria-expanded="true"]::after` associata alla vecchia icona.
- Mantenuta come unica implementazione dell'icona quella condivisa in `assets/header.css` tramite `.header-menu-icon i`.
- Non sono stati modificati link, etichette, struttura delle voci o destinazioni del menu.
- Nessuna modifica o pubblicazione sul repository remoto.

## Verifiche eseguite
- Script di qualità del progetto: PASS — 21 pagine HTML contenuto + verifica Google; 3 file CSS analizzati; 20 URL sitemap.
- Controllo strutturale: 20 pagine con header condiviso individuate; pulsante menu e foglio `assets/header.css` presenti.
- Regressione CSS: zero regole pseudo-elemento legacy per l'icona duplicata.
- Parsing CSS con `tinycss2`: zero errori in `assets/interior.css` e `assets/header.css`.
- `node --check assets/interior.js`: PASS.
- `node --check js/script.js`: PASS.
- Integrità ZIP verificata dopo la creazione.

## Limiti
Questi sono controlli statici e sintattici. In questa sessione non è stato possibile certificare con una prova visiva in browser il rendering su dispositivi reali; dopo aver sostituito i file sul sito, ricaricare senza cache (Ctrl/Cmd+Shift+R) e verificare almeno una pagina interna desktop e mobile. Il repository remoto non è stato modificato.
