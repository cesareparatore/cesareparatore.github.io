# Requisiti aperti e piano di chiusura — 31 ottobre 2026

| ID | Requisito | Stato | Responsabile necessario | Prova per chiusura | Priorità |
|---|---|---|---|---|---|
| R01 | Confermare identità pubblica, varianti del nome e disambiguazione da omonimi. | PARZIALE | Titolare | Scheda identità approvata e fonti ufficiali. | P1 |
| R02 | Confermare titoli LM-47/L-22, denominazioni ufficiali, ateneo e anni. | APERTO | Titolare | Documenti o pagine istituzionali; correzione copy se necessario. | P1 |
| R03 | Confermare profilo FIDAL TP0833 e autorizzazione/attualità del link. | APERTO | Titolare | Profilo ufficiale consultato e data registrata. | P1 |
| R04 | Confermare le cinque aree come servizi attivi o aree descrittive, con modalità e territori. | APERTO | Titolare | Scheda servizio per area con offerta reale e limiti. | P1 |
| R05 | Confermare email, WhatsApp, social e diritti/consenso per immagini. | APERTO | Titolare | Test dei recapiti e autorizzazioni archiviate. | P1 |
| R06 | Approvare le quattro scelte crawler OpenAI. | CONDIZIONATO | Titolare | Decisione scritta per OAI-SearchBot, GPTBot, ChatGPT-User, OAI-AdsBot. | P1 |
| R07 | Verificare hosting, provider, log, retention, email, WhatsApp, servizi terzi e privacy. | STOP / NON VERIFICATO | Titolare + provider + revisore privacy | Inventario trattamenti e revisione professionale dell'informativa. | P0 |
| R08 | Verificare il comportamento live di GitHub Pages, redirect, DNS, TLS, headers e status code. | NON VERIFICATO | Amministratore dominio/hosting | Prove HTTP/TLS/DNS e screenshot delle impostazioni; accesso read-only. | P0 prima di futura pubblicazione |
| R09 | Test browser cross-browser su tutte le route, desktop/mobile e fallback senza JS. | NON ESEGUIBILE qui | QA con browser funzionante | Video/screenshot, log, checklist e difetti chiusi. | P0 |
| R10 | Audit WCAG 2.2 AA completo e screen reader. | NON VERIFICATO | Specialista accessibilità + QA | Matrice criterio per criterio, test tastiera, contrasto, zoom/reflow e screen reader. | P0 |
| R11 | Lighthouse mobile/desktop e Core Web Vitals. | NON VERIFICATO | QA/performance engineer | Report con dispositivo, rete, browser, run multipli e dati sul campo quando disponibili. | P0 |
| R12 | Validazione W3C HTML/CSS e revisione semantica. | NON ESEGUITO | QA con rete/validatori | Report validator con URL/file e data; correzioni. | P1 |
| R13 | Verifica indicizzazione, copertura e performance di ricerca. | NON VERIFICATO | Titolare con Search Console/Bing | Proprietà verificate, export datati e finestra/filtri registrati. | P1 dopo pubblicazione autorizzata |
| R14 | Baseline KPI e protocollo AI preregistrato. | BLOCCATO | Titolare + analista | Query, piattaforme, modalità, lingua/area, timestamp, repliche, codifica, metriche, campione. | P0 per PSAI |
| R15 | Eseguire pilot AI e raccogliere transcript/screenshot. | NON ESEGUITO | Analista + revisore codifica | Dataset completo, risposte valide/escluse, citation/mention/attribution, limiti. | P0 per PSAI |
| R16 | Revisione indipendente richiesta da V2.4. | NON ESEGUITA | Revisore indipendente | Relazione firmata con ambito, prove, riserve, data e giudizio. | P0 per 100/100 |
| R17 | Assegnare owner, effort e scadenze reali ai task. | PARZIALE | Titolare/project owner | Piano approvato con responsabilità e dipendenze. | P1 |
| R18 | Verificare presenza esterna autentica e coerenza dei profili. | NON VERIFICATO | Titolare | Inventario dei profili/pubblicazioni/citazioni con link e data; nessuna menzione fabbricata. | P2 |

## Sequenza consigliata

1. Chiudere R01–R06 e R17 con il titolare, senza condividere password o dati riservati in chat.
2. Chiudere R07 con inventario tecnico e revisione privacy; non dichiarare conformità prima della revisione.
3. In ambiente browser funzionante completare R09–R12; correggere i difetti e ripetere i test.
4. Eseguire R08 in sola lettura, rispettando la decisione di dominio corrente; nessuna modifica remota.
5. Solo dopo un'eventuale pubblicazione autorizzata separatamente, raccogliere R13.
6. Preregistrare R14 prima di osservare i risultati, quindi eseguire R15 senza cambiare query o criteri a posteriori.
7. Sottoporre tutte le evidenze a R16; solo dopo una revisione indipendente senza riserve aperte rivalutare il 100/100.

## Regole di arresto

- Nessun deploy, push, commit remoto, modifica DNS, CNAME remoto, hosting o impostazioni account.
- Nessun passaggio a `cesareparatore.it` senza completamento dei gate e autorizzazione separata.
- Nessun uso di credenziali condivise in chat.
- Nessuna dichiarazione di visibilità AI, indicizzazione, performance o conformità senza le relative prove.
