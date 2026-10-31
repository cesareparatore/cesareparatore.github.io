# Rapporto dei test effettivamente eseguiti — revisione conclusiva

**Data:** 31 ottobre 2026  
**Oggetto:** contenuto estratto da `cesareparatore-PSAI-v2.4-revisione-2026-10-31.zip`.

## Test rieseguiti

| Controllo | Esito | Evidenza |
|---|---|---|
| Lettura e integrità ZIP sorgente | PASS | `ZipFile.testzip()` non ha rilevato membri corrotti. |
| `python scripts/quality-check.py` | PASS | Exit code 0; 21 pagine contenuto + verifica Google; 3 CSS; 20 URL sitemap. |
| `python scripts/check-site-integrity.py` | PASS | Exit code 0; 22 pagine HTML; link/risorse locali risolti; ID non duplicati; immagini con `alt`. |
| `python scripts/check-chi-sono-i18n.py` | PASS | Exit code 0; 34 coppie IT/EN; `lang`, canonical e hreflang verificati. |
| `node --check js/script.js` | PASS | Exit code 0. |
| `node --check assets/interior.js` | PASS | Exit code 0. |
| `node --check assets/404.js` | PASS | Exit code 0. |
| Parsing XML sitemap | PASS | XML leggibile; 20 URL individuati. |
| Corrispondenza sitemap/file locali | PASS | Tutti i 20 URL hanno il corrispondente file HTML nell'archivio. |
| Parsing JSON-LD | PASS | 20 blocchi analizzati; nessun errore JSON. |
| Presenza canonical e hreflang IT/EN | PASS limitato | Tutte le pagine di contenuto esaminate hanno canonical e coppie lingua; non equivale a validazione Google live. |
| Ricerca vecchio hostname | PASS limitato | Una sola occorrenza nella relazione storica `docs/RELAZIONE-TECNICA.md`; nessuna nei file tecnici attivi HTML/XML/TXT/YAML. |
| Duplicati byte-per-byte | CORRETTO | Rimossa la copia duplicata del rapporto finale presente sia alla radice sia in `docs/`; la copia in `docs/` è conservata. |

## Avvertenza sul runtime

Durante l'avvio di Python l'ambiente ha stampato un messaggio di warm-up interno relativo a un componente spreadsheet. I tre script di controllo sono comunque terminati con exit code 0 e hanno prodotto i rispettivi esiti PASS. Il messaggio non è stato interpretato come errore del sito.

## Test non eseguiti o non dimostrabili in questa sessione

| Controllo | Stato | Motivo |
|---|---|---|
| Rendering visuale desktop/mobile | NON ESEGUITO | Non è stata completata una sessione browser visuale affidabile. |
| Test interattivi menu, audio, lingua e CTA in browser | NON ESEGUITO | I test statici non dimostrano il comportamento runtime. |
| Validazione HTML5 con servizio/validator dedicato | NON ESEGUITO | Il parser standard non sostituisce il validator HTML5. |
| Audit WCAG 2.2 completo e screen reader | NON ESEGUITO | Richiede strumenti e verifiche manuali con tecnologie assistive. |
| Lighthouse mobile/desktop | NON MISURATO | Nessun punteggio prodotto. |
| Core Web Vitals sul campo | NON MISURATO | Richiede dati reali di utenti e sito pubblicato. |
| DNS, TLS, redirect e HTTP 200 live | NON VERIFICATO | Richiede rete e controllo del dominio/hosting. |
| Search Console, Bing e indicizzazione | NON VERIFICATO | Richiede accessi e sito online. |
| Privacy e conformità legale | NON VALUTATA | Mancano dati completi sui trattamenti e revisione professionale. |
| KPI e test AI | NON ESEGUITO | Protocollo e baseline devono essere preregistrati. |
| Revisione indipendente | NON ESEGUITA | Deve essere svolta da un soggetto distinto. |

I PASS sono limitati ai test elencati. Non costituiscono certificazione, garanzia di indicizzazione o di risultati SEO/AI.
