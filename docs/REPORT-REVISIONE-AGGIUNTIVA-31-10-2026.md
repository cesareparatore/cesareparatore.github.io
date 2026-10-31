# Revisione aggiuntiva e correzione accessibilità statica — 31 ottobre 2026

## Perimetro

Secondo passaggio sulla copia locale di lavoro. Nessuna rete esterna, account, repository remoto, DNS, hosting o deployment è stato utilizzato o modificato.

## Difetto aggiuntivo rilevato

Durante il controllo diretto del markup delle 20 pagine principali IT/EN è stato rilevato che tutti i 20 elementi `aside.menu-panel` conservavano `aria-hidden="true"` nel markup iniziale. Gli script impostano correttamente lo stato chiuso/inert durante l'inizializzazione JavaScript e lo aggiornano all'apertura, ma il fallback CSS senza JavaScript mostra il menu come lista di link senza rimuovere l'attributo `aria-hidden`.

Conseguenza: nel percorso senza JavaScript i link potevano essere visibili ma non esposti alle tecnologie assistive. Questo contraddiceva la precedente descrizione del fallback come pienamente disponibile.

## Correzione applicata

- Rimosso `aria-hidden="true"` dal markup iniziale dei 20 menu in pagine IT/EN.
- Mantenuta l'inizializzazione JavaScript esistente: quando gli script partono, impostano `aria-hidden="true"` e `inert=true` sul menu chiuso; all'apertura rimuovono entrambi gli impedimenti.
- Rafforzato `scripts/check-site-integrity.py`: ora fallisce se un menu statico è inizialmente `aria-hidden=true` o `inert`.
- Nessuna modifica a contenuti, URL, canonical, hreflang, JSON-LD, robots, dominio o policy crawler.

## Verifica

La correzione viene considerata superata solo dal controllo statico del markup e dal checker aggiornato. Non dimostra il comportamento effettivo di focus, tastiera o screen reader, che resta da collaudare in browser.

## Tentativo browser

È stato tentato l'avvio di Chromium headless sul server HTTP locale con `--dump-dom` e successivamente con opzioni minimali. Entrambi i tentativi sono terminati per timeout senza produrre DOM o screenshot. Esito: **NON ESEGUIBILE nell'ambiente corrente**, non PASS. I log mostrano errori di integrazione DBus e di inizializzazione del processo browser; non è possibile attribuire al sito eventuali errori di runtime.

## Stato residuo

- Test statici locali: da rieseguire dopo la modifica e registrare nel report aggiornato.
- Browser, responsive, interazioni, screen reader, contrasto, zoom/reflow e Core Web Vitals: ancora non verificati.
- Nessuna certificazione WCAG 2.2 AA dichiarata.
