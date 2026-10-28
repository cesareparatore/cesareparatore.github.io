# Piano di chiusura del gap verso 10/10

Data: 28 ottobre 2026

## Diagnosi

Il punteggio 8,8/10 è una stima editoriale provvisoria, non una misura oggettiva unica. Le aree che impedivano di sostenere un punteggio più alto erano soprattutto: focus visibile non garantito in ogni componente, test browser non completati, assenza di misure Lighthouse/Core Web Vitals e valutazione manuale WCAG incompleta. Credibilità e chiarezza dei servizi richiedono inoltre conferme fattuali e test dei percorsi utente.

## Intervento applicato

- `css/style.css`: aggiunta una regola di focus visibile ad alta priorità per link, pulsanti, campi, summary e controlli con `tabindex`; l'anello scuro con alone chiaro resta distinguibile su fondi chiari e scuri. Aggiunta normalizzazione globale delle animazioni e dello scorrimento per `prefers-reduced-motion: reduce`.
- `assets/interior.css`: applicate le stesse protezioni alle pagine interne.
- Nessuna credenziale, testimonianza, risultato o servizio nuovo è stato inventato.
- Nessuna pubblicazione online o push GitHub eseguito.

## Verifiche eseguite dopo la modifica

- `python scripts/check-chi-sono-i18n.py`: PASS, 34 coppie IT/EN coerenti; `lang`, canonical e hreflang controllati.
- `python scripts/quality-check.py`: PASS, 21 pagine HTML di contenuto più verifica Google, 3 CSS e 20 URL sitemap.
- `python scripts/check-site-integrity.py`: PASS, 22 HTML; link e risorse locali risolti; nessun ID duplicato; tutte le immagini hanno `alt`.
- `node --check` per `js/script.js`, `assets/interior.js`, `assets/404.js`: PASS.
- Tentativo di screenshot Chromium headless: timeout. Pertanto il rendering visivo non è dichiarato verificato.

## Rivalutazione prudente

Il fix al focus e al movimento ridotto migliora il codice accessibile, ma non prova da solo la conformità WCAG 2.2 AA. Il punteggio complessivo 8,8/10 resta provvisorio fino a test browser completati, contrasto misurato, navigazione tastiera/screen reader e prestazioni misurate. Non è corretto dichiarare 10/10 con queste evidenze mancanti.

## Prossimi passi necessari per chiudere il gap

1. Eseguire browser automation in un ambiente stabile per desktop/tablet/mobile e verificare menu, cambio lingua, CTA, audio, 404 e focus.
2. Eseguire Lighthouse in condizioni ripetibili e registrare i risultati; distinguere i dati di laboratorio dai Core Web Vitals di campo.
3. Misurare il contrasto per stati normali, hover, focus e disabilitati.
4. Verificare zoom/reflow e screen reader manualmente.
5. Validare con il proprietario ogni dato professionale che si vuole usare come prova pubblica.
