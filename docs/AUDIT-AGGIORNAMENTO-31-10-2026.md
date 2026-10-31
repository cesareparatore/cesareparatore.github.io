# Audit aggiornamento — 31 ottobre 2026

## Perimetro

Audit eseguito sulla copia estratta dell'archivio `cesareparatore-github-pages-fase-corrente-2026-10-31.zip` (SHA-256: `de7aafd2f223f5642f2bb0d647f7e4a5453f3eff409ae76b363ad13afce057b2`). L'archivio originale non è stato sovrascritto. Nessuna modifica a repository remoto, DNS, hosting, impostazioni GitHub o sito online; nessuna pubblicazione.

## Esito dei test rieseguiti

| Test | Esito | Evidenza |
|---|---|---|
| `python scripts/quality-check.py` | PASS | 21 pagine contenuto + verifica Google, 3 CSS, 20 URL sitemap |
| `python scripts/check-site-integrity.py` | PASS | 22 HTML, link e risorse locali risolti, ID univoci, immagini con `alt` |
| `python scripts/check-chi-sono-i18n.py` | PASS | 34 coppie IT/EN, `lang`, canonical e hreflang |
| `node --check js/script.js` | PASS | exit code 0 |
| `node --check assets/interior.js` | PASS | exit code 0 |
| `node --check assets/404.js` | PASS | exit code 0 |
| Parsing `sitemap.xml` | PASS | XML ben formato |
| Integrità ZIP sorgente | PASS | `ZipFile.testzip()` restituisce `None`; 98 voci |
| Inventario HTML | PASS con limite | 22 documenti analizzati con parser HTML; non equivale a validazione W3C |

## Dominio: evidenze e limiti

- Nell'archivio esaminato non è presente un file `CNAME`.
- I canonical, `og:url`, riferimenti JSON-LD, URL della sitemap e dichiarazione sitemap in `robots.txt` usano `https://cesareparatore.github.io/`.
- Non risultano URL assoluti `https://cesareparatore.it` nei riferimenti tecnici attivi HTML/robots/sitemap; il dominio `.it` resta presente come indirizzo email autorizzato e in documentazione storica.
- Il tentativo di richiesta HTTP(S) con `curl -IL` a entrambi gli host non ha raggiunto i server: l'ambiente non riesce a risolvere i nomi (`curl: (6) Could not resolve host`). Non sono quindi noti status HTTP, catena di redirect, certificati TLS, header, DNS o comportamento del browser.
- L'assenza del file `CNAME` nell'archivio non prova da sola lo stato della configurazione salvata nelle impostazioni GitHub Pages. Va controllato nel repository e in **Settings → Pages**, senza modificare nulla, e poi verificato da una rete esterna con `curl -I -L` e `curl -sS -D - -o /dev/null` per entrambi gli URL.

**Conclusione dominio:** configurazione statica del pacchetto coerente con GitHub Pages e senza CNAME locale; il redirect segnalato non è verificato né spiegabile con le prove disponibili. Non attribuirlo al codice o al DNS senza misurazioni live.

## Rilievi e gate aperti

1. **STOP — verifica live dominio:** DNS, GitHub Pages custom domain, redirect, HTTPS/TLS e header non verificabili da questo ambiente.
2. **STOP — browser e responsive:** la documentazione preesistente registra `ERR_BLOCKED_BY_ADMINISTRATOR`; non sono certificati rendering, menu, audio, preloader, 404, touch, tastiera o layout su browser reali.
3. **STOP — performance:** nessuna misura Lighthouse, PageSpeed o Core Web Vitals disponibile.
4. **STOP — accessibilità:** controlli statici positivi non equivalgono a audit WCAG 2.2 AA; mancano test manuali, screen reader, contrasto completo, zoom/reflow e browser.
5. **STOP — privacy:** la pagina privacy dichiara esplicitamente che hosting, log, retention, analytics e servizi effettivi richiedono conferma. Il contenuto attuale non è una revisione legale né prova di conformità.
6. **COND — contenuti professionali:** titoli, qualifiche, esperienze, profilo FIDAL, servizi e modalità di erogazione richiedono conferma documentale del titolare.
7. **COND — crawler:** le direttive OAI-SearchBot, GPTBot, ChatGPT-User e OAI-AdsBot sono scelte di policy già presenti nel pacchetto; non sono state cambiate e richiedono approvazione consapevole del titolare. `robots.txt` non è un controllo di accesso.
8. **STOP — PSAI V2.4:** mancano baseline KPI, pilot AI preregistrato, evidenze live e revisione indipendente. Non dichiarare 100/100 né visibilità o citazioni garantite.

## Valutazione

**8,0/10 provvisorio per il pacchetto locale**, in continuità con la valutazione documentata precedente. Il giudizio riflette la buona copertura dei controlli statici, la completezza delle pagine IT/EN e la documentazione; è limitato dall'assenza di test runtime/browser, misure di performance, verifica live, audit accessibilità completo e gate privacy/editoriali. Non è un punteggio del sito online, una certificazione PSAI, WCAG o GDPR, né una previsione di ranking o citazioni AI.

## Prossime azioni necessarie

1. Verificare in sola lettura repository e impostazioni GitHub Pages, DNS e certificato HTTPS.
2. Da una rete esterna, misurare redirect e status di entrambi gli host e di almeno homepage, pagine interne e 404.
3. Eseguire test cross-browser e responsive, tastiera, zoom e screen reader.
4. Eseguire Lighthouse mobile/desktop e registrare le misure senza simulazioni.
5. Confermare i dati professionali e completare la revisione privacy sulla configurazione reale.
6. Confermare le direttive crawler e avviare baseline/pilot PSAI V2.4 con revisore indipendente.
7. Ottenere approvazione esplicita prima di qualsiasi modifica remota o pubblicazione.

## Stato finale

Pacchetto locale verificato nei controlli statici elencati e pronto per revisione dei gate residui. Non è dichiarato pronto per pubblicazione definitiva né conforme/certificato in senso pieno.
