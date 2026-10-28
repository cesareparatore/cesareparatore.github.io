# Audit e intervento «Inevitabilità» — 28 ottobre 2026

## Consegna
Archivio locale aggiornato partendo da `cesareparatore-chi-sono-inevitabile-2026-10-28.zip`. Nessuna modifica pubblicata online; nessun push GitHub.

## Interventi eseguiti
- Normalizzati gli attributi `data-it` e `data-en` sulle pagine `chi-sono/index.html` ed `en/chi-sono/index.html`: ogni attributo ora conserva la lingua corretta e le due pagine condividono le stesse coppie di traduzione.
- Corretti testi inglesi obsoleti o associati alla chiave sbagliata, inclusi eyebrow, titolo della sezione narrativa e titoli delle tappe.
- Allineato il testo HTML iniziale alla lingua della pagina per mantenere un fallback coerente anche prima dell'esecuzione JavaScript.
- Aggiornati title, meta description, Open Graph, Twitter metadata, dati strutturati WebPage, dati linguistici nel body, canonical e alternate hreflang per le due pagine.
- Aggiunto `scripts/check-chi-sono-i18n.py`, controllo di regressione senza dipendenze esterne per le 34 coppie traducibili, `lang`, canonical e hreflang.
- Conservati i contenuti del sito e le altre pagine; non è stato aggiunto il CV digitale.

## Test eseguiti
| Test | Esito |
|---|---|
| Integrità ZIP sorgente | PASS, come verificato nell'audit precedente |
| `python scripts/check-chi-sono-i18n.py` | PASS — 34 coppie IT/EN coerenti; `lang`, canonical e hreflang verificati |
| `python scripts/quality-check.py` | PASS — 21 pagine HTML contenuto/verifica, 3 CSS, 20 URL sitemap |
| `node --check js/script.js` | PASS |
| `node --check assets/interior.js` | PASS |
| `node --check assets/404.js` | PASS |
| Browser reale / responsive / screen reader / Lighthouse / Core Web Vitals | NON ESEGUITI in questo ambiente; non sono dichiarati superati |
| Verifica sito pubblicato / Search Console | NON ESEGUITA |

## Valutazione per area
I punteggi sotto sono valutazioni editoriali e tecniche del pacchetto, non certificazioni indipendenti né garanzie di ranking o conversione.

| Area | Valutazione attuale | Evidenza / limite |
|---|---:|---|
| Identità e posizionamento | 8/10 | Filo narrativo «Niente è scollegato» presente e sostenuto dal percorso personale |
| Qualità narrativa | 8/10 | Sequenza biografica concreta; non sono stati inventati casi o risultati |
| Specificità e credibilità | 7/10 | Narrazione basata su esperienze fornite; documenti e credenziali non sono stati riverificati in fonti ufficiali |
| Chiarezza dell'offerta | 7/10 | La pagina orienta verso il contatto, ma i percorsi di servizio richiedono verifica end-to-end sul sito intero |
| UX e design | Non misurato completamente | CSS e struttura esaminati; nessun test visivo browser in questa esecuzione |
| Accessibilità | Non misurato completamente | Checker statico; non sono stati eseguiti test screen reader/contrasto manuale |
| SEO tecnico e semantico | 8/10 statico | Metadati e alternate della pagina corretti; indicizzazione live non verificata |
| Prestazioni | Non misurato | Nessuna misurazione Lighthouse o Core Web Vitals |
| Coerenza linguistica IT/EN | 10/10 nei controlli statici mirati | 34 coppie, canonical, hreflang e lang passano; resa in browser non verificata |
| Affidabilità tecnica statica | 9/10 | Checker di qualità e controlli JS passano; il test browser resta aperto |

## Strategia per il massimo livello verificabile
1. Eseguire browser smoke test sulle due route in mobile e desktop, compreso il cambio lingua e il menu.
2. Verificare con tastiera, zoom e screen reader; correggere eventuali difetti emersi.
3. Misurare Lighthouse e Core Web Vitals su URL pubblici dopo l'eventuale rilascio autorizzato.
4. Confermare titoli, qualifiche e modalità dei servizi sulla base di fonti o documenti verificabili.
5. Se disponibili e pubblicabili, aggiungere esempi reali di metodo applicato, senza dati sensibili o risultati inventati.
6. Controllare Search Console e indicizzazione solo dopo pubblicazione autorizzata.

## Limiti e dichiarazione finale
Il pacchetto è stato modificato localmente e i controlli statici riportati sopra sono stati eseguiti in questa sessione. Non è corretto dichiarare un 10/10 complessivo: l'accessibilità completa, la resa visiva, le prestazioni reali e l'indicizzazione richiedono test ulteriori. La versione online non è stata modificata.
