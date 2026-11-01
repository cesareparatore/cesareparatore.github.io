# Audit completo aggiornato — 1 novembre 2026

## 1. Oggetto, provenienza e limiti

**Base effettivamente esaminata:** `cesareparatore-audit-completo-migliorato-2026-11-01(1).zip`, archivio ZIP integro (123 voci, 5.032.023 byte non compressi; `ZipFile.testzip()` senza errori). L'archivio è stato estratto in una nuova cartella di lavoro; gli ZIP sorgente e le altre copie presenti in `/mnt/data` non sono stati sovrascritti.

La documentazione interna preesistente `AUDIT-COMPLETO-ESECUZIONE-2026-11-01.md` nomina come archivio esaminato `cesareparatore-home-behavior-unificato-2026-11-01.zip`, nome diverso da quello effettivamente ricevuto in questa sessione. Non essendo possibile ricostruire dal solo pacchetto la catena di rinomina, questa differenza è registrata come **disallineamento di provenienza documentale**, non come prova di alterazione.

Perimetro: analisi statica del pacchetto, controlli locali inclusi, test HTTP su loopback e correzioni locali circoscritte. Nessun accesso al sito pubblico, nessun deploy/push/commit, nessuna modifica DNS, dominio, CNAME, GitHub Pages, OVH o account remoto. Nessuna richiesta a servizi esterni.

## 2. Inventario

- 22 documenti HTML: 20 route contenuto (10 IT + 10 EN), una pagina 404 e un file di verifica Google.
- 3 fogli CSS e 3 file JavaScript.
- 20 URL nel sitemap, coerenti con le 20 route contenuto.
- 20 blocchi JSON-LD, tutti analizzati e decodificabili.
- Asset audio `Weight_of_Intent.mp3`: 4.168.998 byte; caricamento dichiarato `preload="none"` e attivazione esplicita.
- Fotografia WebP principale: 753 × 941 px, 88.094 byte.
- Favicon SVG condivisa: riferimento presente nelle 21 pagine HTML di contenuto/404 secondo il controllo dedicato.
- Nessun file `CNAME` nella build; il dominio canonico dichiarato dai file rimane `https://cesareparatore.github.io/`.

## 3. Difetti individuati e correzioni locali

### F-01 — Errore JavaScript runtime nelle pagine interne (corretto)

In `assets/interior.js`, `main` veniva letto a riga 62 prima della sua dichiarazione `const main` (precedentemente a riga 90). Per la temporal dead zone di `const`, il browser avrebbe sollevato `ReferenceError` e interrotto l'esecuzione dell'intero IIFE. Il controllo `node --check` non poteva rilevarlo perché la sintassi era valida.

**Effetti plausibili e direttamente collegati al flusso interrotto:** `applyLanguage(language)` non veniva raggiunta; le traduzioni dinamiche, la creazione della navigazione tra sezioni e i comportamenti successivi del file non venivano inizializzati. La presenza del difetto è certa dall'ordine delle dichiarazioni; l'effetto runtime non è stato osservato direttamente perché Chromium è bloccato dall'ambiente.

**Correzione:** dichiarazione di `main` spostata prima del primo utilizzo e rimossa la dichiarazione duplicata successiva. Nessuna modifica alla logica di selezione delle sezioni.

### F-02 — Fallback inglese incompleto nelle pagine interne (corretto)

Le nove pagine interne EN avevano il contenuto principale in inglese, ma alcune etichette iniziali del blocco di contatto e del footer erano italiane. Con JavaScript funzionante sarebbero state sostituite dalle stringhe `data-en`; senza JavaScript, o se lo script avesse fallito, restavano italiane.

**Correzione:** aggiornato il testo HTML iniziale in inglese per CTA, descrizioni del contatto, pulsante “Back to top” e riferimento locale Partinico nelle nove pagine interne EN. Aggiornati anche `aria-label` e `title` del controllo “Back to top” e l'etichetta accessibile dell'ora locale. Gli attributi `data-it` e `data-en` sono stati conservati.

### F-03 — Tracciabilità dell'archivio sorgente (aperto, documentale)

Il rapporto di audit già incluso nel pacchetto cita un nome di ZIP differente dall'archivio effettivamente ricevuto. Il presente rapporto fissa il nome esatto del file esaminato e il conteggio ZIP, ma la provenienza antecedente resta da chiarire se serve una catena di custodia formale.

## 4. Verifiche eseguite e risultati

| Verifica | Esito | Evidenza / limite |
|---|---|---|
| Integrità ZIP ricevuto | PASS | `testzip()` restituisce `None`; nessun membro corrotto |
| `scripts/quality-check.py` | PASS | 21 pagine contenuto + verifica Google; 3 CSS; 20 URL sitemap |
| `scripts/check-site-integrity.py` | PASS | 22 HTML; link e risorse locali risolti; ID univoci; immagini con attributo alt |
| `scripts/check-chi-sono-i18n.py` | PASS | 46 coppie IT/EN secondo la copertura dello script; `lang`, canonical e hreflang |
| `scripts/check-psai-technical.py` | PASS | robots, 20 pagine indicizzabili, canonical/hreflang, JSON-LD, sitemap e dominio dichiarato |
| `scripts/check-psai-document-structure.py` | PASS | lang, title, H1, main, alt e nomi accessibili statici; non è audit WCAG |
| `scripts/check-psai-local-http.py` | PASS | 20 route HTML HTTP 200 su server temporaneo loopback; robots/sitemap; 404 HTTP 404 e noindex |
| `node --check js/script.js` | PASS | sintassi |
| `node --check assets/interior.js` | PASS | sintassi dopo correzione F-01 |
| `node --check assets/404.js` | PASS | sintassi |
| Parsing CSS con tinycss2 | PASS | 0 errori di parsing rilevati nei 3 fogli CSS; non equivale a validazione W3C |
| Parsing sitemap XML | PASS | documento XML valido |
| Parsing JSON-LD | PASS | 20 blocchi decodificati senza errori |
| Duplicati ID | PASS | nessun ID duplicato nei documenti analizzati |
| Percorsi favicon | PASS | riferimenti locali verificati nel pacchetto |
| Fallback inglese footer | PASS | stringhe e nomi accessibili aggiornati nelle 9 pagine EN interne |
| Browser Playwright/Chromium | BLOCCATO | `net::ERR_BLOCKED_BY_ADMINISTRATOR` anche su `http://127.0.0.1`; nessun test visuale o interattivo dichiarabile |
| Lighthouse / Core Web Vitals | NON ESEGUITO | nessun valore misurato |
| W3C HTML/CSS Validator | NON ESEGUITO | validator non disponibile localmente; nessuna chiamata remota |
| WCAG 2.2 AA / screen reader | NON ESEGUITO | richiede verifiche manuali e browser/AT |
| SEO live / Search Console / Bing | NON ESEGUITO | nessun accesso remoto |

I test HTTP sono confinati a `127.0.0.1`; non dimostrano disponibilità, TLS, redirect o header del sito pubblicato.

## 5. Valutazione per area

I punteggi sono stime del pacchetto locale, non certificazioni del sito online. Le aree non provate in browser o dipendenti da soggetti esterni sono esplicitamente declassate o non valutabili.

| Area | Valutazione prudenziale | Stato | Evidenza mancante per chiudere |
|---|---:|---|---|
| Identità visiva e design | 8,4/10 | Parziale | confronto visivo su tutte le route e viewport |
| Coerenza grafica tra pagine | 8,0/10 | Parziale | rendering comparativo; fallback EN corretto in HTML |
| UX e navigazione | 7,4/10 | Parziale | prove runtime menu, lingua, sezioni, audio e ritorno in alto |
| Header e comportamento scroll | 7,5/10 | Parziale | prova browser dopo fix JS |
| Footer e chiusura | 7,7/10 | Parziale | prova browser e verifica accessibile su dispositivi |
| Contenuti e posizionamento | 7,2/10 | Parziale | approvazione dell'offerta e delle descrizioni da parte del titolare |
| Autorevolezza e credenziali | 6,0/10 | Bloccato da conferme | titoli, certificazioni, esperienze e fonti documentali |
| Mobile e responsive | NON VALUTABILE | Non verificato | test visuali 320–1440 px, landscape, zoom e touch |
| Accessibilità WCAG 2.2 AA | 6,2/10 provvisorio | Parziale | contrasto, tastiera, focus, reflow, screen reader, audit criterio per criterio |
| SEO tecnico e semantico | 8,7/10 | Verificato staticamente | verifica live, indicizzazione e risultati dei motori |
| Performance e Core Web Vitals | NON VALUTABILE | Non misurato | Lighthouse e dati sul campo |
| Conversione e contatti | 7,4/10 | Parziale | test con utenti e conferma dei recapiti/canali |
| Privacy e conformità | 4,5/10 | Bloccato | inventario trattamenti, dati del titolare, provider e revisione competente |
| Sicurezza | 6,5/10 | Parziale | TLS/header HTTP e configurazione hosting live |
| Manutenibilità e robustezza | 7,8/10 | Parziale | suite E2E e validazione W3C; F-01 corretto ma non testato in browser |
| Compatibilità browser/dispositivi | NON VALUTABILE | Non verificato | test cross-browser e dispositivi reali |

Non viene calcolata una media unica: mescolare stime, aree non valutabili e gate bloccati produrrebbe una precisione fittizia. La precedente pagella a 12 aree resta consultabile in `PAGELLA-FINALE-31-10-2026.md`, ma va letta alla luce dei difetti runtime ora scoperti e corretti localmente.

## 6. Criticità residue per priorità

### P0 — prima di dichiarare il sito pronto

1. **Browser E2E:** ripetere test su tutte le 20 route, desktop/mobile, menu, cambio lingua, navigazione sezioni, audio, preloader, 404, reduced motion, fallback senza JS e console error. L'ambiente attuale blocca Chromium anche su loopback.
2. **Privacy effettiva:** il testo stesso dichiara non verificati hosting/log/retention e dettagli dei provider. Servono dati reali del titolare e provider e revisione competente; non dichiarare conformità ora.
3. **Performance:** eseguire Lighthouse mobile/desktop e misurare LCP/INP/CLS con metodo e condizioni registrati.
4. **Conferma dei contenuti professionali:** verificare qualifiche, titoli, ateneo, anni, certificazioni, esperienze, profilo FIDAL, servizi e modalità.

### P1 — priorità alta

5. Audit WCAG 2.2 AA manuale e automatizzato, con tastiera e almeno uno screen reader.
6. Validazione W3C HTML/CSS e revisione semantica.
7. Verifica live DNS/TLS/redirect/header/status e comportamento GitHub Pages, in sola lettura e con autorizzazione.
8. Verificare la coerenza IT/EN dell'informativa privacy: la versione inglese include telefono e riferimento a Partinico che non compaiono con lo stesso dettaglio nella versione italiana. Il titolare deve decidere quali dati pubblicare in entrambe.
9. Confermare le quattro direttive crawler in `robots.txt`; la configurazione attuale consente OAI-SearchBot e ChatGPT-User e blocca GPTBot e OAI-AdsBot. È una scelta editoriale del titolare, non una raccomandazione automatica.

### P2 — dopo pubblicazione autorizzata

10. Search Console e Bing Webmaster Tools: sitemap, indicizzazione, copertura e hreflang.
11. Monitoraggio Core Web Vitals con traffico sufficiente.
12. Baseline KPI e pilot AI preregistrato, con query, piattaforme, lingue, repliche, timestamp, regole di codifica e raccolta evidenze.
13. Revisione indipendente PSAI V2.4; non attribuire visibilità AI o punteggi 100/100 senza pilot e revisione.

## 7. Richieste necessarie al titolare e ai terzi

- Confermare denominazioni esatte dei titoli universitari, ateneo, anni e prove pubblicabili.
- Confermare certificazioni, enti emittenti, validità, incarichi e collaborazioni.
- Confermare quali cinque aree sono servizi attivi, quali sono descrittive, territori, modalità, disponibilità e limiti.
- Verificare email, telefono/WhatsApp, link FIDAL e autorizzazioni per immagini e contenuti.
- Approvare esplicitamente OAI-SearchBot, GPTBot, ChatGPT-User e OAI-AdsBot.
- Fornire dati del titolare e inventario di hosting, log, cookie, retention, email, WhatsApp e servizi terzi per l'informativa.
- Decidere se telefono e riferimento geografico devono comparire anche nell'informativa italiana.
- Confermare che il dominio canonico resti `cesareparatore.github.io`; nessun passaggio a `cesareparatore.it` è stato effettuato o predisposto.
- Amministratore/provider: fornire evidenze read-only su DNS, TLS, redirect, header, hosting e log.
- QA/accessibilità: completare browser E2E, responsive, WCAG, W3C e performance.
- Analista/revisore: definire protocollo PSAI prima di raccogliere risultati e svolgere revisione indipendente.

## 8. Esito complessivo

La build supera i controlli statici e HTTP locali. È stato corretto un errore runtime certo nel codice delle pagine interne e sono stati corretti i fallback inglesi di footer/CTA sulle nove pagine interne EN. Queste modifiche sono locali e non pubblicate.

**Il progetto non è ancora certificabile come completo o 10/10.** I blocchi principali restano browser E2E, WCAG, performance, privacy reale, conferme professionali e verifiche live. Non pubblicare sulla sola base di questo audit.
