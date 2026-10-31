# Audit iniziale — cesareparatore.it / build locale

**Data:** 31 ottobre 2026  
**Input effettivo:** `cesareparatore-10-10-lavorazione-locale-2026-10-31 (1).zip` caricato dall'utente.  
**Ambito:** copia locale; nessun accesso o intervento remoto.

## Provenienza e decisioni vincolanti

Sono state recuperate le istruzioni originali dell'utente e il testo integrale disponibile di PERSONAL SEARCH & AI VISIBILITY V2.4. Le copie sono conservate in `ISTRUZIONI-ORIGINALI-UTENTE-2026-10-31.txt` e `PSAI-V2.4-STANDARD-OPERATIVO-ORIGINALE.md`.

La decisione di dominio più recente e specifica presente nel progetto è `docs/SCELTA-DOMINIO-FASE-CORRENTE-2026-10-31.md`: per questa fase il canonical è `https://cesareparatore.github.io/`; `cesareparatore.it` è rinviato fino al raggiungimento documentato dei gate e a una successiva autorizzazione esplicita. L'archivio in ingresso non contiene `CNAME`. Questa decisione prevale sulle relazioni storiche che descrivono una fase precedente basata sul dominio `.it`.

## Inventario iniziale

| Elemento | Quantità osservata |
|---|---:|
| Documenti HTML | 22 (21 contenuti/route e 1 verifica Google) |
| Route in sitemap | 20 (10 IT + 10 EN) |
| Pagine inglesi statiche | 10 |
| Fogli CSS | 3 |
| Script JavaScript | 3 |
| Blocchi JSON-LD | 20 |
| Risorse immagine | 2 asset principali (foto WebP e monogramma SVG) |
| Audio opzionale | 1 file MP3, circa 4 MB |
| CNAME | assente, coerente con la decisione corrente |

## Architettura e direzione

Il progetto è un sito statico multipagina, con homepage immersiva a capitoli, pagine interne di servizio e profilo, contenuti italiani e inglesi, pagina privacy, pagina territoriale, pagina 404, CSS/JS locali, sitemap, robots e workflow di qualità. Il linguaggio visivo già documentato è avorio/nero/lime, con monogramma, titolazione ampia, capitoli e il principio narrativo «NIENTE È SCOLLEGATO». La direzione esistente è stata mantenuta; non è stata sostituita con un template o un concept arbitrario.

## Rilievi iniziali

| ID | Area | Rilievo | Stato iniziale / rischio |
|---|---|---|---|
| A01 | Progressive enhancement | Il progetto contiene fallback no-JS e controlli statici per menu e preloader; il comportamento reale senza JS non è osservabile senza browser funzionante. | PARZIALE |
| A02 | Browser e UX | Il rendering Chromium headless non è stato ottenuto nell'ambiente disponibile; interazioni, screenshot e responsive non possono essere certificati. | NON ESEGUIBILE |
| A03 | Accessibilità | Skip link, focus visibile, lingua, alt e `prefers-reduced-motion` sono presenti nel codice; manca audit WCAG 2.2 criterio per criterio e screen reader. | PARZIALE |
| A04 | Performance | Audio opzionale di circa 4 MB e asset locali; nessuna misura Lighthouse, waterfall o Core Web Vitals. L'audio è impostato per caricamento conservativo e attivazione utente. | NON VERIFICATO |
| A05 | SEO tecnico | Canonical, hreflang, sitemap, robots e JSON-LD sono presenti; l'esito statico non prova status HTTP, indicizzazione o ranking. | PARZIALE |
| A06 | Identità e autorevolezza | Sono dichiarate aree professionali, titoli LM-47/L-22 e profilo FIDAL; il progetto documenta che titoli, denominazioni, attualità del profilo e attività vanno confermati con prove del titolare. | CONDIZIONATO |
| A07 | Privacy | L'informativa è prudente, ma hosting, log, retention, email, WhatsApp e trattamenti effettivi non sono verificabili dalla sola copia. | APERTO / STOP |
| A08 | AI Visibility | I quattro user-agent OpenAI sono distinti in robots.txt; mancano conferma del titolare, baseline, pilot preregistrato e misure di piattaforma. | PARZIALE / STOP |
| A09 | Dominio | La configurazione locale è GitHub Pages; redirect, DNS, TLS, headers e configurazione GitHub Pages remota non sono verificabili offline. | NON VERIFICATO |
| A10 | Fonti | Il framework elenca fonti primarie e registro delle affermazioni; la verifica diretta di tutte le fonti decisive non è dimostrata come completa. | PARZIALE |

## Test di baseline rieseguiti

I test sono registrati nel `REPORT-TEST-EVIDENZE-2026-10-31.md`. In sintesi, i tre checker esistenti, la sintassi JS, il parsing HTML/CSS/JSON-LD e l'XML sitemap sono superati. Il tentativo Chromium headless è terminato per timeout senza produrre DOM o screenshot.

## Limiti dell'audit

Questo audit non è un audit live, non è una certificazione indipendente, non è un parere legale, non dimostra conformità WCAG/GDPR, indicizzazione, prestazioni sul campo o citazioni AI. I contenuti professionali forniti dal titolare sono trattati come dichiarazioni del titolare, non come qualifiche verificate indipendentemente.
