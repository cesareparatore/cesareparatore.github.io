# Revisione tecnica PSAI V2.4 — sezioni 5.1–5.5

**Data:** 31 ottobre 2026  
**Ambito:** revisione locale della copia di lavoro. Nessuna pubblicazione, richiesta HTTP al dominio pubblico, modifica remota, invio a motori di ricerca o modifica DNS/hosting/GitHub Pages è stata eseguita. È stato eseguito esclusivamente uno smoke test HTTP su server temporaneo loopback (`127.0.0.1`).  
**Dominio canonico mantenuto:** `https://cesareparatore.github.io/`.

## Esito sintetico

Sono stati eseguiti controlli offline e corretti/rafforzati gli elementi che potevano essere verificati sui file disponibili. I controlli statici e il test HTTP locale loopback elencati nel registro risultano superati. Questo esito non equivale a certificazione PSAI 10/10: diversi requisiti dipendono da verifiche esterne, dati del titolare, ambiente pubblicato o revisione indipendente.

## 5.1 — Google e funzionalità AI

- Le pagine HTML indicizzabili mantengono direttive `index,follow` e canonical coerenti con il dominio GitHub Pages.
- La homepage e le pagine contenuto espongono contenuti HTML statici; la sitemap include le 20 route indicizzabili.
- La pagina 404 è esclusa dall'indicizzazione tramite `noindex`.
- Un test HTTP locale su server temporaneo ha restituito HTTP 200 per tutte le 20 route HTML e HTTP 404 per una route inesistente; il test è rimasto interamente su `127.0.0.1`.
- Non è stato aggiunto alcun markup che prometta o simuli una preferenza per AI Overviews/AI Mode: il protocollo non documenta markup speciale che garantisca apparizione o citazione.
- **Bloccato esternamente:** stato HTTP 200/404 reale, accesso effettivo di Googlebot, scansione, indicizzazione, Search Console e inclusione nelle esperienze AI. Servono sito pubblicato raggiungibile e accesso autorizzato a Search Console; nessun invio è stato fatto.

## 5.2 — Crawler OpenAI

`robots.txt` contiene gruppi distinti e regole esplicite:

| User-agent | Regola locale | Esito controllo file |
|---|---|---|
| `OAI-SearchBot` | `Allow: /` | PASS |
| `GPTBot` | `Disallow: /` | PASS |
| `ChatGPT-User` | `Allow: /` | PASS |
| `OAI-AdsBot` | `Disallow: /` | PASS |

È presente anche `User-agent: *` con `Allow: /` e il riferimento alla sitemap canonica. Le regole sono state verificate come gruppi specifici, senza assumere che un gruppo erediti le direttive del gruppo wildcard.

- **Bloccato esternamente:** log del server/CDN per provare richieste effettive, eventuali verifiche IP/identità crawler e conferma delle policy OpenAI correnti. Il file `robots.txt` esprime la scelta del titolare ma non prova che il crawler abbia visitato il sito né garantisce citazioni.

## 5.3 — robots.txt, noindex e sicurezza

- Le 20 pagine contenuto sono configurate con meta robots indicizzabile.
- `404.html` usa `noindex,follow`; la risposta della pagina 404 e il comportamento HTTP 404 per una route inesistente sono stati verificati nel test locale loopback.
- `robots.txt` non è trattato come controllo di accesso o misura di sicurezza.
- Il sito è statico e non è stato rilevato un percorso di autenticazione lato server nel progetto. Non sono stati aggiunti controlli di accesso fittizi né dichiarate risorse riservate protette.
- **Bloccato/da confermare:** il titolare deve confermare che nessun contenuto del repository debba essere riservato. Se esistono contenuti privati, servono autenticazione e autorizzazione lato server/hosting, non una regola robots. La configurazione effettiva dell'hosting non è stata ispezionata.

## 5.4 — Sitemap

- `sitemap.xml` è XML valido e viene servita correttamente (HTTP 200) dal server locale temporaneo.
- Contiene 20 URL univoci, tutti sul dominio canonico `cesareparatore.github.io`.
- L'insieme degli URL corrisponde esattamente alle 20 pagine HTML indicizzabili locali; non include 404 né file di verifica Google.
- Il percorso sitemap è dichiarato in `robots.txt`.
- **Bloccato esternamente:** risposta HTTP, fetch da crawler, copertura e stato di indicizzazione. Servono accesso al sito pubblicato e strumenti proprietari; non è stato effettuato alcun invio.

## 5.5 — Dati strutturati

- Tutti i blocchi JSON-LD presenti sono stati decodificati localmente come JSON valido e usano il contesto Schema.org.
- Nella pagina `chi-sono/` e nella corrispondente pagina inglese è stato aggiunto un nodo `ProfilePage`, collegato tramite `mainEntity` alla stessa entità `Person` già usata nel sito. La scelta è limitata a pagine il cui contenuto ha come focus il profilo personale; non è stata estesa alle pagine servizio.
- I dati strutturati restano descrittivi e non sono presentati come garanzia di ranking o rich result.
- **Bloccato esternamente:** validazione tramite strumenti Google/Rich Results sul sito pubblicato, warning/errori runtime e confronto definitivo tra dati strutturati e fatti/documenti approvati dal titolare. Nessun dato personale o titolo professionale è stato inventato o ampliato.

## Modifiche locali effettuate

1. Aggiunti i nodi `ProfilePage` ai JSON-LD delle due pagine “Chi sono” (italiano e inglese).
2. Aggiunto `scripts/check-psai-technical.py` per controllare offline crawler, meta robots, canonical, hreflang, JSON-LD, sitemap, 404 e assenza di `CNAME`.
3. Aggiunto il presente rapporto e il registro delle prove.
4. Nessuna modifica a DNS, dominio, hosting, configurazioni GitHub Pages, repository remoto o servizi esterni.

## Stato di certificazione

**Esito tecnico locale:** controlli statici e smoke test HTTP su server temporaneo loopback superati, come da `REGISTRO-TEST-PSAI-V24-5-1-5-5-2026-10-31.md`.  
**Punteggio/certificazione 10/10:** NON assegnato. Il superamento locale non misura indicizzazione, citazioni AI, prestazioni sul server, comportamento runtime completo, accessibilità manuale, dati esterni o revisione indipendente.

Per chiudere i punti residui servono: accesso al sito pubblicato e ai relativi strumenti di webmaster; log di hosting/CDN; conferma del titolare su eventuali contenuti riservati e accuratezza delle entità; test esterni dei dati strutturati; test browser e accessibilità; revisione indipendente documentata.
