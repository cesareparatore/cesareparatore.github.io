# Matrice di verifica accessibilità

Obiettivo: WCAG 2.2 livello AA. Questa matrice documenta la presenza di accorgimenti nel codice, non una dichiarazione di conformità completa.

| Area | Evidenza nel codice | Stato |
|---|---|---|
| Lingua del documento | `lang="it"` nei documenti; lo script delle pagine interne aggiorna `document.documentElement.lang` quando cambia lingua | Verificato staticamente |
| Salta al contenuto | Link skip-link nelle pagine contenuto | Presente; test tastiera browser non eseguito |
| Focus visibile | Regola `:focus-visible` in `assets/interior.css`; regole focus nella homepage | Presente; contrasto e comportamento da provare in browser |
| Navigazione mobile | `aria-expanded`, `aria-controls`, chiusura Escape, focus sul primo link e ritorno del focus al pulsante | Implementato; test interattivo non eseguito per blocco browser |
| Immagini | Controllo automatico degli attributi `alt`; marchi decorativi hanno alt vuoto dove appropriato | Controllo statico superato; qualità semantica da verificare manualmente |
| Movimento ridotto | Regole `prefers-reduced-motion` nel CSS; preloader rimosso quando la preferenza è attiva | Presente; test browser non eseguito |
| Nomi accessibili | Pulsanti e controlli principali hanno etichette ARIA/testuali | Parzialmente verificato staticamente; richiede test con screen reader |
| Contrasto | Palette e regole CSS esaminate, ma non è stata eseguita una misurazione completa di ogni stato/componente | Non verificato completamente |
| Zoom/reflow 200–400% | Nessun browser disponibile per prova visuale | Non verificato |
| Audio | Riproduzione su richiesta dell'utente; `preload="none"` impostato prima della sorgente | Verificato nel codice, non nel browser |
| Preloader/animazioni | Nessuna percentuale simulata; rispetto della preferenza movimento ridotto | Verificato staticamente, percezione e tempi non testati |
| Screen reader | Nessuna sessione con NVDA, VoiceOver o equivalente | Non eseguito |
| Conformità WCAG 2.2 AA complessiva | Non è stata eseguita una valutazione criterio per criterio in browser | Non dichiarata |

## Test manuali ancora richiesti

1. Navigare tutte le pagine usando soltanto Tab, Shift+Tab, Invio, Spazio ed Escape.
2. Verificare ordine del focus, visibilità del focus e ritorno del focus dopo chiusura del menu.
3. Testare zoom al 200% e 400%, larghezza equivalente a 320 CSS px e orientamento mobile.
4. Misurare il contrasto di testi, pulsanti, bordi, hover e focus.
5. Provare almeno uno screen reader desktop e, se possibile, uno mobile.
6. Verificare che le animazioni non impediscano lettura o interazione e che la preferenza `prefers-reduced-motion` venga rispettata.
