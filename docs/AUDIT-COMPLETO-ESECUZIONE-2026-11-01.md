# Audit completo e interventi — 1 novembre 2026

## 1. Perimetro e tutela degli originali

- Archivio esaminato: `cesareparatore-home-behavior-unificato-2026-11-01.zip`.
- La copia di lavoro è stata estratta in una directory temporanea separata; l'archivio sorgente non è stato sovrascritto.
- Nessuna modifica alla preview salvata in ChatGPT.
- Nessun deploy, push, accesso/modifica DNS, hosting o configurazione OVH/GitHub; nessuna richiesta al dominio pubblico.
- Inventario iniziale: 122 voci ZIP, 22 documenti HTML (21 pagine/contenuti più file di verifica Google), 3 fogli CSS, 3 script JavaScript, 20 URL in sitemap, 10 pagine inglesi.

## 2. Intervento eseguito

### Favicon coerente

Aggiunto un riferimento esplicito al monogramma SVG già presente (`assets/images/cp-mark.svg`) come favicon in tutte le 21 pagine HTML di contenuto, compresa la 404, con percorsi relativi calcolati per ciascuna route. Nelle due homepage il precedente favicon SVG inline è stato sostituito dal file grafico ufficiale già usato nell'identità del sito.

Motivazione: uniformare l'identità del sito nelle schede del browser e nei preferiti senza introdurre una nuova immagine, una dipendenza esterna o un nuovo dato professionale.

Non è stato introdotto un apple-touch-icon raster perché il pacchetto non contiene un asset PNG dedicato e non è stato generato un surrogato non verificato.

## 3. Esiti dei test locali

| Controllo | Esito | Perimetro e limite |
|---|---|---|
| `unzip -t` archivio sorgente | PASS | Integrità del pacchetto ricevuto |
| `python scripts/quality-check.py` | PASS | 21 pagine contenuto + verifica Google; 3 CSS; sitemap da 20 URL |
| `node --check js/script.js` | PASS | Sintassi JavaScript |
| `node --check assets/interior.js` | PASS | Sintassi JavaScript |
| `node --check assets/404.js` | PASS | Sintassi JavaScript |
| `python scripts/check-site-integrity.py` | PASS | 22 HTML; link e risorse locali; ID duplicati; immagini alt; menu statici |
| `python scripts/check-chi-sono-i18n.py` | PASS | 46 coppie IT/EN, `lang`, canonical e `hreflang` |
| `python scripts/check-psai-technical.py` | PASS | robots, canonical, hreflang, JSON-LD, sitemap e dominio dichiarato |
| `python scripts/check-psai-document-structure.py` | PASS | struttura statica, lang/title/H1/main/alt e nomi accessibili |
| `python scripts/check-psai-local-http.py` | PASS | 20 route HTML HTTP 200, robots, sitemap, 404 HTTP 404 e noindex |
| Favicon: esistenza e risoluzione percorsi | PASS | Tutte le 21 pagine contenuto puntano al file SVG esistente |
| Parsing CSS/JSON-LD/sitemap | PASS storico nel pacchetto | Non sostituisce validazione W3C o test browser |

I test HTTP sono stati eseguiti soltanto su server locale temporaneo in loopback. Non è stato contattato il sito pubblicato.

## 4. Audit delle 16 aree

I punteggi seguenti sono una valutazione preliminare del pacchetto e delle evidenze statiche disponibili, non una certificazione dell'esperienza renderizzata. Il valore è prudenziale: le aree che dipendono da browser, dispositivi, servizi esterni o conferme del titolare non possono ricevere punteggi pieni.

| Area | Voto /10 | Stato | Principale distanza dal 10 |
|---|---:|---|---|
| 1. Identità visiva e design | 8,4 | Parzialmente verificato | Manca il confronto visivo browser su tutte le route e viewport |
| 2. Coerenza grafica tra pagine | 8,2 | Verificato staticamente, resa non verificata | Header/footer condivisi nel codice; serve prova visiva comparativa |
| 3. UX e navigazione | 8,3 | Verificato staticamente | Interazioni, focus e compiti utente da provare in browser |
| 4. Header e comportamento scroll | 8,2 | Verificato nel codice | La logica è presente; manca conferma runtime su tutte le pagine |
| 5. Footer e chiusura | 8,4 | Verificato staticamente | Resa e transizioni da collaudare su mobile/desktop |
| 6. Contenuti e posizionamento | 7,2 | Parzialmente verificato | Chiarezza dei servizi e corrispondenza all'offerta reale da confermare |
| 7. Autorevolezza e credenziali | 6,0 | Bloccato da conferme | Titoli, denominazioni, anni, esperienze e prove documentali da confermare |
| 8. Mobile e responsive | 7,0 | Non verificato visivamente | Test viewport, landscape, touch, zoom e reflow |
| 9. Accessibilità WCAG 2.2 AA | 6,2 | Parzialmente verificato | Contrasto completo, tastiera, screen reader, zoom/reflow e test manuali assenti |
| 10. SEO tecnico e semantico | 8,7 | Verificato staticamente | Dominio e indicizzazione live/Search Console non verificati |
| 11. Performance e Core Web Vitals | 7,2 | Parzialmente verificato | Lighthouse, LCP/INP/CLS sul campo e peso/caricamento reale non misurati |
| 12. Conversione e contatti | 7,4 | Parzialmente verificato | CTA presenti; efficacia e percorso di conversione non misurati |
| 13. Privacy e conformità | 4,5 | Bloccato da conferme | L'informativa stessa dichiara dati di hosting, log, retention e dettagli da confermare |
| 14. Sicurezza | 6,5 | Parzialmente verificato | Dipende anche da header HTTP, TLS, hosting e configurazione live non ispezionati |
| 15. Manutenibilità e robustezza | 8,5 | Verificato staticamente | Duplicazioni CSS e copertura automatica browser da valutare |
| 16. Compatibilità browser/dispositivi | 5,5 | Non verificato | Nessun collaudo cross-browser o su dispositivi reali in questa sessione |

**Media aritmetica preliminare: 7,26/10 (arrotondata a 7,3/10).** Non è un voto certificato del sito online. La media incorpora aree non testate e deve essere aggiornata dopo le prove runtime e le conferme mancanti.

## 5. Criticità residue ordinate per priorità

### P0 — Necessarie prima di dichiarare il progetto completo

1. Test end-to-end in browser reale: homepage, 18 pagine interne, menu, lingua, audio, preloader, 404, frecce laterali, header e ritorno all'inizio.
2. Verifica privacy basata sulla configurazione effettiva dell'hosting, cookie, log, retention, servizi esterni, identità e contatti del titolare; il testo attuale è esplicitamente provvisorio su questi punti.
3. Lighthouse desktop/mobile e misurazioni documentate; nessun punteggio è stato inventato.

### P1 — Priorità alta

4. Audit WCAG 2.2 AA criterio per criterio, includendo tastiera, contrasto, zoom/reflow e almeno uno screen reader.
5. Conferma documentale delle qualifiche, denominazioni ufficiali, anni, incarichi, servizi e modalità effettive.
6. Verifica visiva comparativa di tutte le pagine italiane e inglesi su viewport 320, 360, 390, 768, 1024, 1280 e 1440 px, oltre a landscape e zoom 200/400%.
7. Conferma della scelta del dominio canonico: i file e la documentazione di progetto attualmente dichiarano `https://cesareparatore.github.io/`; il dominio `cesareparatore.it` è rinviato da una decisione documentata precedente. Non è stato modificato senza autorizzazione esplicita.

### P2 — Miglioramenti e verifiche successive

8. Verifica live di indicizzazione, sitemap e hreflang in Search Console, solo dopo eventuale pubblicazione autorizzata.
9. Verifica degli header HTTP/TLS e delle impostazioni del provider tramite procedura read-only autorizzata.
10. Raccolta di dati di conversione rispettosa della privacy, solo se il titolare deciderà di introdurre una misurazione e dopo averne verificato la base giuridica.
11. Valutazione di test browser automatizzati in CI con dipendenze fissate e manutenzione documentata.

## 6. Informazioni che richiedono il titolare

- Conferma dei titoli universitari: denominazione esatta, ateneo, anno e documenti pubblicabili.
- Conferma di qualifiche/certificazioni, ente emittente, validità e link ufficiali.
- Conferma delle esperienze, collaborazioni e incarichi che possono essere pubblicati.
- Conferma dell'offerta reale: servizi, luoghi, modalità in presenza/online e disponibilità.
- Conferma dei dati identificativi del titolare e dei dettagli necessari nell'informativa privacy.
- Conferma della decisione sul dominio canonico prima di qualsiasi passaggio da `github.io` a `.it`.

## 7. Limiti dichiarati

- Browser automatizzato non eseguito con esito positivo in questo ambiente; i report precedenti documentano `ERR_BLOCKED_BY_ADMINISTRATOR`.
- Nessun test visuale, screenshot, Lighthouse, Core Web Vitals, screen reader o certificazione WCAG 2.2 AA dichiarati superati.
- Nessuna verifica del sito pubblicato, DNS, TLS, hosting, GitHub Pages o OVH.
- Nessuna revisione legale della privacy.
- Nessuna verifica indipendente delle qualifiche professionali.

## 8. Conclusione

La build ricevuta supera i controlli statici e HTTP locali disponibili. È stata aggiunta una favicon coerente su tutte le pagine. Il progetto non è ancora dimostrabilmente 10/10: i blocchi maggiori sono collaudo browser, accessibilità completa, performance misurata, privacy reale e conferme professionali/dominio. Non pubblicare questa build sulla base del solo presente rapporto: completare prima i gate P0 e le conferme pertinenti.
