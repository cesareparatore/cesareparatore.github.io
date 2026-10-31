# Verifica aggiuntiva indipendente locale — 31 ottobre 2026

## Perimetro

Verifica eseguita sulla copia estratta dall'archivio `cesareparatore-PSAI-V24-gap-chiuso-revisione-locale-2026-10-31.zip`. L'archivio originale non è stato modificato. Nessuna connessione al dominio pubblico, nessun deploy, commit, push, modifica DNS, hosting, GitHub Pages o servizio esterno.

La verifica è un riesame locale aggiuntivo: non sostituisce browser E2E, audit WCAG, Lighthouse/Core Web Vitals, verifica live, revisione legale o revisione indipendente dello standard PSAI.

## Esiti ripetuti

| Controllo | Esito | Dettaglio |
|---|---|---|
| `python scripts/quality-check.py` | PASS | 21 pagine di contenuto + verifica Google; 3 CSS; 20 URL sitemap |
| `python scripts/check-site-integrity.py` | PASS | 22 HTML; link e risorse locali risolti; ID univoci; immagini con `alt`; menu statici non bloccati |
| `python scripts/check-chi-sono-i18n.py` | PASS | 34 coppie IT/EN; `lang`, canonical e `hreflang` |
| `python scripts/check-psai-document-structure.py` | PASS limitato | 21 documenti HTML; struttura, `alt` e nomi accessibili statici; non è audit WCAG |
| `python scripts/check-psai-technical.py` | PASS limitato | policy crawler, 20 pagine indicizzabili, canonical/hreflang, JSON-LD, sitemap, noindex 404 e dominio canonico |
| `python scripts/check-psai-local-http.py` | PASS locale | 20 route HTML HTTP 200, robots, sitemap, 404 HTTP 404 e noindex; loopback locale soltanto |
| `node --check js/script.js` | PASS | Nessun errore di sintassi rilevato |
| `node --check assets/interior.js` | PASS | Nessun errore di sintassi rilevato |
| `node --check assets/404.js` | PASS | Nessun errore di sintassi rilevato |
| Parsing JSON-LD | PASS | 20 blocchi JSON-LD parseabili su 22 documenti HTML |
| Parsing XML sitemap | PASS | `sitemap.xml` parseabile |
| Manifest SHA-256 | PASS | 88 voci verificate; zero file mancanti o hash discordanti |

## Dominio e redirect: ciò che si può concludere

La configurazione **nei file locali attivi** è coerente con `https://cesareparatore.github.io/`: `robots.txt` punta alla sitemap GitHub Pages, non è presente un file `CNAME`, e i controlli statici rilevano il dominio canonico GitHub Pages nei riferimenti attivi. Il dominio `.it` compare come indirizzo email nei contenuti e in documenti storici, non come canonical attivo.

Questo non permette di stabilire perché il browser possa reindirizzare `cesareparatore.github.io` a `cesareparatore.it`. Un redirect HTTP può essere prodotto da DNS/hosting/CDN/configurazione GitHub Pages o da un livello esterno ai file. In questa sessione non sono stati interrogati i domini pubblici né le impostazioni dell'account: redirect HTTP, DNS, TLS, CNAME remoto e configurazione GitHub Pages restano **NON VERIFICATI**. Non si deve dedurre il comportamento live dal solo archivio.

Verifica necessaria da parte del titolare/amministratore, senza cambiare configurazioni: acquisire gli header e la catena di redirect per entrambi gli URL (GET/HEAD con `curl -I -L`, annotando ogni status e `Location`), controllare DNS A/AAAA/CNAME e record `www`, quindi confrontare il valore Custom domain in GitHub Pages con il file `CNAME` del branch pubblicato. Conservare output e timestamp. Prima di qualsiasi correzione, identificare quale livello emette il redirect.

## Limiti non superati

- Chromium headless è stato tentato sulla copia locale, ma non ha prodotto DOM né screenshot entro 25 secondi (timeout; log di sistema DBus/ambiente). Nessuna prova browser valida.
- Nessun test visuale responsive su viewport/device; nessun test runtime di menu, audio, lingua, capitoli, preloader o 404.
- Nessuna misura Lighthouse, PageSpeed o Core Web Vitals.
- Nessun audit WCAG 2.2 AA completo: contrasto, tastiera, focus runtime, zoom/reflow e screen reader restano da verificare.
- Nessuna verifica live di redirect, DNS, HTTPS/TLS, status, header, Search Console/Bing, indicizzazione o crawler effettivi.
- Nessuna verifica indipendente di qualifiche, profilo FIDAL, servizi, recapiti, diritti immagini o trattamenti privacy reali.
- Nessun pilot PSAI, baseline di visibilità o misurazione di citazioni AI.

## Valutazione

I controlli statici e locali ripetuti sono superati. Non emergono da questi test motivi sufficienti per modificare il codice del sito: una modifica estetica o tecnica non supportata da evidenze rischierebbe di introdurre regressioni. Restano valide le valutazioni prudenti già documentate in `PAGELLA-FINALE-31-10-2026.md`: qualità complessiva del pacchetto locale 8,0/10 provvisoria; PSAI tecnico 9,5/10 limitato alle sezioni e ai test indicati nel relativo registro. Non è dimostrabile un 10/10 complessivo con le prove disponibili.

**Stato pubblicazione: NON AUTORIZZATA.** Questa verifica non costituisce approvazione alla pubblicazione.
