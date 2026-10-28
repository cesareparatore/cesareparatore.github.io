# Pagella provvisoria basata sulle prove

**Perimetro:** qualità del pacchetto di repository locale, non qualità misurata del sito pubblicato. I punteggi sono valutazioni di revisione del codice e sono deliberatamente distinti dalle categorie che richiedono un browser o dati reali.

| Categoria | Valutazione attuale | Evidenze | Perché non è 10/10 |
|---|---:|---|---|
| Integrità e completezza del pacchetto | 9/10 | 20 file originali conservati; 25 file aggiunti rispetto all’originale; nessun file originale mancante; ZIP finale verificato con controllo integrità e inventario | Il pacchetto non è ancora stato pubblicato e verificato nel contesto reale di GitHub Pages |
| Qualità tecnica del codice | 8/10, revisione statica | JavaScript sintatticamente valido; CSS parsabile; controlli ripetibili; nessuna dipendenza runtime aggiunta | Il comportamento interattivo non è stato confermato in browser e il file homepage resta ampio |
| Qualità statica e manutenibilità | 8/10 | Suite statica passa; sintassi JS valida; nessuna dipendenza runtime aggiunta; workflow CI presente | `js/script.js` resta un modulo grande e la traduzione homepage rimane accoppiata a selettori CSS |
| SEO tecnico del repository | 8/10, valutazione statica | 20 URL IT/EN; canonical auto-riferiti; `hreflang` reciproci; `og:url`; JSON-LD parsabile; sitemap e robots coerenti; 17 comuni presenti nell’HTML statico di homepage e pagina territoriale in IT/EN | Pubblicazione live, indicizzazione e risultati di ricerca non verificati; contenuti e performance richiedono revisione continua |
| Accessibilità | 6/10, provvisorio | Skip link, focus visibile, movimento ridotto, `lang` per le route IT/EN e gestione tastiera del menu implementati | Nessun test browser, screen reader, zoom/reflow o contrasto completo; non è una dichiarazione WCAG 2.2 AA |
| Performance | Non verificata | Audio non precaricato; controlli statici e smoke test HTTP locale superati | Nessun Lighthouse, profilo di rete, misura LCP/INP/CLS o dato sul campo disponibile |
| Design e UX | Non verificata | Sistema condiviso sulle pagine interne; pagina privacy resa coerente e più leggera | Nessuna ispezione visuale browser riuscita e nessun test con utenti |
| Sicurezza e privacy | 6/10, provvisorio | Nessun loader analytics aggiunto; evento opzionale gtag non inline; referrer policy; rel sicuro per link target blank controllati | Configurazione live, log/retention, eventuale analytics esterno e requisiti legali devono essere confermati |
| Test e QA | 8/10 per test statici | Checker esteso su 21 pagine, 20 URL sitemap, canonical/`hreflang`, link locali, JSON-LD, JS e CSS; smoke test HTTP locale | Mancano test interattivi browser e verifiche live; il workflow non è stato eseguito su GitHub |
| Completezza complessiva | 7/10, provvisoria | Pacchetto completo, route statiche IT/EN, controlli statici e documentazione | Il sito pubblicato, le interazioni, le performance e l’accessibilità manuale non sono ancora verificati |

## Interpretazione

Questa pagella non sostiene che il sito abbia raggiunto il massimo livello. Mostra che il pacchetto è più completo e verificabile sul piano statico, mentre le aree di esperienza reale, prestazioni e conformità richiedono test che l'ambiente ha impedito. Non viene assegnato un punteggio alla performance senza misure.


## Evidenze dell’intervento locale 4.0

La homepage e la pagina territoriale, sia in italiano sia in inglese, riportano in HTML statico tutti i 17 comuni indicati dall’utente. La pagina territoriale raggruppa i comuni per provincia e chiarisce che la lista descrive un bacino di riferimento, non sedi secondarie o disponibilità garantita. I title e le description delle pagine di servizio sono stati resi più specifici rispetto al servizio e al riferimento a Partinico. Questo migliora chiarezza e coerenza on-page, ma non dimostra ranking locale, citazioni da parte di IA o aumento di richieste.

## Aggiornamento Missione 5.0 — 28 ottobre 2026

| Categoria | Valutazione aggiornata | Base della valutazione | Limite attuale |
|---|---:|---|---|
| Grafica e coerenza visiva | 7,5/10, stima sul codice | CSS condiviso delle pagine interne, monogramma SVG allineato alla homepage, palette e `theme-color` coerenti | Non è stato possibile ispezionare le pagine renderizzate; non si certifica ancora l'assenza di difetti responsive |
| UX e navigazione | 7,5/10, stima | Menu interno con Escape e chiusura esterna, skip link, link locali verificati, route lingua presenti | Nessun test d'uso o verifica interattiva in browser |
| Performance | Non valutata | Alcune scelte statiche sono conservative, inclusi audio senza preload anticipato | Lighthouse e Core Web Vitals non misurati; non assegnare un voto numerico senza dati |
| Accessibilità | 6,5/10, stima provvisoria | Skip link, attributi `alt`, landmark, `lang`, movimento ridotto e focus visibile con coppie colore ad alto contrasto; controlli statici di base superati | Audit WCAG 2.2 AA completo, screen reader, zoom/reflow e test manuali non eseguiti |
| SEO tecnico | 8/10, revisione statica | 20 URL sitemap, canonical, `hreflang`, `og:url`, JSON-LD e link locali verificati | Sito live, indicizzazione e ranking non verificati |
| Credibilità professionale | 6,5/10, stima sui contenuti disponibili | Storia personale fornita dal titolare e descrizione dei servizi; nessuna qualifica inventata | Titoli ufficiali, atenei, anni, incarichi, prove e testimonianze da confermare |
| Privacy e sicurezza | 6/10, stima provvisoria | Informativa prudente, nessun loader analytics autonomo, referrer policy e link esterni con rel controllati | Trattamenti effettivi, log, retention e header live da verificare; non è un parere legale |
| Manutenibilità e QA | 8,5/10, revisione statica | Checker ampliato, workflow CI presente, 28/28 risorse HTTP locali 200, sintassi JS e parser CSS superati | Workflow remoto non eseguito; nessuna suite browser end-to-end |

**Nota:** i voti numerici sono stime qualitative sul pacchetto locale, non metriche di laboratorio. La performance resta non valutata perché non è stata misurata; non è corretto trasformare l'assenza di dati in un voto inventato.
