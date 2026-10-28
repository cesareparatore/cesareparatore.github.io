# Pagella provvisoria basata sulle prove

**Perimetro:** qualità del pacchetto di repository locale, non qualità misurata del sito pubblicato. I punteggi sono valutazioni di revisione del codice e sono deliberatamente distinti dalle categorie che richiedono un browser o dati reali.

| Categoria | Valutazione attuale | Evidenze | Perché non è 10/10 |
|---|---:|---|---|
| Integrità e completezza del pacchetto | 9/10 | 20 file originali conservati; 13 file aggiunti; nessun file originale mancante; ZIP finale riaperto e inventario coincidente | Il pacchetto non è ancora stato pubblicato e verificato nel contesto reale di GitHub Pages |
| Qualità statica e manutenibilità | 8/10 | Suite statica passa; sintassi JS valida; nessuna dipendenza runtime aggiunta; workflow CI presente | `js/script.js` resta un modulo grande e la traduzione homepage rimane accoppiata a selettori CSS |
| SEO tecnico del repository | 7/10 | Canonical e metadati presenti; sitemap parsabile; robots corretto; JSON-LD parsabile; anteprime social completate | Le varianti inglesi non hanno URL statici distinti; indicizzazione e risposte online non verificate |
| Accessibilità | 6/10, provvisorio | Skip link, focus visibile, movimento ridotto, lingua aggiornata e gestione tastiera del menu implementati | Nessun test browser, screen reader, zoom/reflow o contrasto completo; non è una dichiarazione WCAG 2.2 AA |
| Performance | Non verificata | Audio non precaricato; controlli statici e smoke test HTTP locale superati | Nessun Lighthouse, profilo di rete, misura LCP/INP/CLS o dato sul campo disponibile |
| Design e UX | Non verificata | Sistema condiviso sulle pagine interne; pagina privacy resa coerente e più leggera | Nessuna ispezione visuale browser riuscita e nessun test con utenti |
| Sicurezza e privacy | 6/10, provvisorio | Nessun loader analytics aggiunto; evento opzionale gtag non inline; referrer policy; rel sicuro per link target blank controllati | Configurazione live, log/retention, eventuale analytics esterno e requisiti legali devono essere confermati |
| Test e QA | 8/10 per test statici | Controlli ripetibili, workflow GitHub Actions, parser CSS, JSON-LD, sitemap, link locali e sintassi JS superati | Mancano test interattivi browser e verifiche live; il workflow non è stato eseguito su GitHub |

## Interpretazione

Questa pagella non sostiene che il sito abbia raggiunto il massimo livello. Mostra che il pacchetto è più completo e verificabile sul piano statico, mentre le aree di esperienza reale, prestazioni e conformità richiedono test che l'ambiente ha impedito. Non viene assegnato un punteggio alla performance senza misure.
