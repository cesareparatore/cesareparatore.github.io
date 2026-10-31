# Esiti test tecnici locali — Versione 2.4

**Data:** 31 ottobre 2026. Test eseguiti sul contenuto estratto dell'archivio aggiornato prima della creazione dello ZIP finale.

| Test | Esito | Evidenza / limite |
|---|---|---|
| Estrazione ZIP di partenza | PASS | Archivio leggibile ed estrazione completata. |
| `python scripts/quality-check.py` | PASS | 21 pagine di contenuto + pagina verifica Google; 3 CSS; 20 URL sitemap; controlli statici superati. |
| `python scripts/check-site-integrity.py` | PASS | 22 pagine HTML; link e risorse locali risolti; nessun ID duplicato; tutte le immagini hanno `alt`. |
| `python scripts/check-chi-sono-i18n.py` | PASS | 34 coppie IT/EN; `lang`, canonical e hreflang coerenti. |
| `node --check js/script.js` | PASS | Nessun errore di sintassi. |
| `node --check assets/interior.js` | PASS | Nessun errore di sintassi. |
| `node --check assets/404.js` | PASS | Nessun errore di sintassi. |
| Parsing HTML tramite parser standard Python | PASS limitato | 22 documenti analizzati senza eccezioni del parser; non è un validatore HTML5. |
| Parsing JSON-LD | PASS | 20 blocchi JSON-LD validi sintatticamente; la validità semantica Schema.org non è stata verificata con validator esterno. |
| Canonical | PASS | Tutti i canonical trovati puntano a `https://cesareparatore.it/`. |
| Vecchio hostname nei file tecnici | PASS | Nessun riferimento residuo nei file HTML/XML/TXT/YAML; una menzione rimane in una relazione storica che descrive la configurazione precedente. |
| CNAME | PASS locale | File `CNAME` contiene `cesareparatore.it`; DNS e associazione GitHub Pages non verificati. |
| Sitemap / robots | PASS statico | 20 URL; sitemap e direttiva Sitemap usano il dominio richiesto; non è stato eseguito fetch HTTP live. |
| Browser visuale/responsive | NON ESEGUITO | Nessun risultato visivo dichiarato. |
| WCAG 2.2 completa/screen reader | NON ESEGUITO | Richiede test automatizzati e manuali. |
| Lighthouse/Core Web Vitals | NON MISURATO | Nessun punteggio inventato. |
| DNS/TLS/redirect/HTTP live | NON VERIFICATO | Richiede accesso registrar/hosting e rete live. |
| Search Console/Bing/indexing | NON VERIFICATO | Richiede accesso e sito pubblicato. |
| AI pilot/KPI | NON ESEGUITO | Baseline e protocollo da preregistrare. |
| Revisione privacy/legale | NON ESEGUITA | Informazioni reali e professionista competente necessari. |

I test PASS sono esclusivamente quelli descritti nella colonna evidenza. Non sostituiscono controlli live, test browser, accessibilità completa o revisione indipendente.
