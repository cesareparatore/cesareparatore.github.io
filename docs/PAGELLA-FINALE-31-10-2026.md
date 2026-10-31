# Pagella finale — 31 ottobre 2026

**Valutazione complessiva provvisoria: 8,0/10 per il pacchetto locale.** Non è un voto del sito live, né una certificazione. I punteggi di aree non misurate sono indicati come non valutabili o stime prudenti.

| Area | Punteggio | Evidenze | Test/limiti | Per arrivare a 10/10 |
|---|---:|---|---|---|
| Art direction e visual identity | 7,5/10, stima statica | Palette avorio/nero/lime, monogramma, struttura narrativa e linguaggio editoriale riconoscibili | Nessuna ispezione browser riuscita | Review visuale completa, coerenza tra tutte le route, test con utenti |
| Typography | 7,0/10, stima statica | Scala fluida, gerarchie forti, titoli editoriali; pagine interne usano stack di sistema | Nessun test di resa font/viewport | Formalizzare token, confrontare pesi/metriche e leggibilità IT/EN su device reali |
| Motion design | 7,5/10, stima statica | Curtain, reveal, microinterazioni e `prefers-reduced-motion` presenti | Non misurati fluidità, jank o interruzioni reali | Test su device meno potenti, tastiera, touch e reduced motion |
| Interaction design | 7,0/10, stima statica | Menu, navigazione capitoli, audio opzionale, stati ARIA e fallback migliorato | Nessun test runtime; fallback no-JS controllato staticamente | E2E su tutte le interazioni e test di errore/stato |
| UX e conversione | 7,5/10, stima contenuti/struttura | CTA contatto, pagine servizi, struttura IT/EN e percorsi tematici | Nessun test con utenti o analytics autorizzati | Task testing, misurazione conversioni e semplificazione dove i dati lo richiedono |
| Responsive design | Non valutabile | CSS include numerosi breakpoint e layout fluidi | Nessuna prova browser o device | Screenshot e test su viewport, orientamenti, zoom e contenuti lunghi |
| Accessibilità | 6,5/10, provvisorio | Skip link, focus styles, `lang`, alt, riduzione movimento; menu inizializzato via JS | Nessun audit WCAG completo, screen reader o contrasto sistematico | Audit WCAG 2.2 AA criterio per criterio e remediation verificata |
| Performance | Non valutabile | Audio con preload conservativo; immagini WebP e asset locali | Nessun Lighthouse/Core Web Vitals | Misure reali mobile/desktop, budget e regressione automatica |
| Codice e manutenibilità | 8,5/10 | Struttura statica, asset locali, script separati, controlli automatici e fallback migliorato | Nessuna suite E2E; validazione W3C non eseguita | Test browser in CI, riduzione duplicazioni CSS e documentazione componenti |
| SEO tecnica | 9,0/10, statica | Canonical/hreflang, sitemap 20 URL, robots, 20 JSON-LD e controlli link | Dominio live, status e indicizzazione non verificati | Verifica live e Search Console/Bing dopo autorizzazione |
| Personal Search & AI Visibility V2.4 | 6,0/10, provvisorio | Entity/Person, contenuti IT/EN, policy crawler distinta, gate KPI e pilot documentati | Nessuna baseline, pilot, citazioni o revisione indipendente | Gate titolare, preregistrazione pilot, raccolta evidenze e revisore indipendente |
| Qualità complessiva | 8,0/10, provvisorio | Pacchetto completo e controlli statici superati; difetto no-JS corretto nella copia di lavoro | Esperienza live, performance, accessibilità, privacy e AI visibility non dimostrate | Chiudere tutti i gate P0/P1 e ripetere la pagella con prove |

## Regola di assegnazione

Non si assegna un punteggio di performance senza misure; non si dichiara responsive superato senza viewport reali; non si dichiara WCAG 2.2 AA senza audit; non si dichiara visibilità AI senza pilot ripetibile; non si dichiara SEO live senza verifica d'indicizzazione. Il valore 8,0/10 resta una stima prudente del pacchetto locale, non un obiettivo già raggiunto.
