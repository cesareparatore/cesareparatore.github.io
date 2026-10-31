# Revisione sito secondo PERSONAL SEARCH & AI VISIBILITY v2.4

**Data lavorazione:** 31 ottobre 2026  
**Archivio di partenza:** `cesareparatore-aggiornato-privacy-contatti-2026-10-30.zip`  
**Dominio richiesto:** `https://cesareparatore.it/`  
**Stato:** pacchetto aggiornato per revisione; non pubblicato; gate di avvio e validazione indipendente non completati.

## 1. Sintesi esecutiva

La revisione applica al pacchetto statico le correzioni concretamente verificabili senza accesso al registrar, all'hosting, a Search Console/Bing Webmaster Tools o a documentazione privata del titolare. La struttura multipagina italiana/inglese e il design editoriale preesistenti sono stati mantenuti perché non è emersa, dai controlli statici disponibili, una ragione probatoria sufficiente per una riscrittura integrale che avrebbe potuto introdurre regressioni. Sono stati corretti i riferimenti al dominio, aggiunta la configurazione del dominio personalizzato e rese esplicite le scelte di accesso dei crawler OpenAI.

Questa consegna **non** equivale a certificazione, audit indipendente, approvazione legale, prova di pubblicazione o dimostrazione di visibilità/ranking/citazioni AI.

## 2. Registro delle modifiche

| ID | Classe | Modifica | Evidenza / criterio di completamento | Stato |
|---|---|---|---|---|
| V24-01 | REQ | Uniformati canonical, URL Open Graph, riferimenti JSON-LD, immagini social, hreflang e riferimenti assoluti dal dominio GitHub Pages al dominio richiesto `cesareparatore.it` nei file testuali del sito. | Ricerca statica residui del vecchio host; checker canonical/hreflang/sitemap. | Completata con prova locale |
| V24-02 | COND | Aggiunto `CNAME` per il dominio personalizzato richiesto. | File `CNAME` presente e contenuto verificato. DNS, certificato TLS e associazione GitHub Pages non verificabili dall'archivio. | Completata nel pacchetto; attivazione hosting bloccata |
| V24-03 | RAC | Aggiornato `robots.txt` con direttive distinte per OAI-SearchBot, GPTBot, ChatGPT-User e OAI-AdsBot. | Ispezione file; test di coerenza sitemap. | Completata nel pacchetto |
| V24-04 | RAC | GPTBot disallow in assenza di consenso esplicito separato all'uso per addestramento; OAI-SearchBot e ChatGPT-User consentiti in coerenza con l'obiettivo di reperibilità; OAI-AdsBot disallow perché non risulta una campagna pubblicitaria nel materiale esaminato. | Decisione conservativa documentata; da confermare dal titolare. | Condizionata a conferma |
| V24-05 | RAC | Aggiunto questo rapporto con distinzione tra attività eseguite, limiti e gate ancora aperti. | File presente nel pacchetto. | Completata con prova locale |
| V24-06 | RAC | Aggiunta checklist di avvio, baseline, test AI e monitoraggio. | `docs/GATE-AVVIO-E-MONITORAGGIO-V24.md`. | Completata con prova locale |

## 3. Identità e contenuti: limiti di verifica

Il sito presenta Cesare Paratore e le cinque aree indicate nel progetto: Sport Manager, Chinesiologo, Running Coach, Formatore e Web Designer. Sono mantenuti i recapiti già forniti nel progetto, il riferimento territoriale a Partinico (PA), il claim «Niente è scollegato» e la biografia narrativa fornita direttamente dal titolare.

Le qualifiche e la biografia non sono state verificate indipendentemente tramite certificati, atenei, datori di lavoro o fonti istituzionali. Il profilo FIDAL, i titoli L-22 e LM-47, le modalità effettive di erogazione dei servizi, l'attualità dei recapiti e i profili social devono essere confermati dal titolare e corredati da evidenze pubblicabili, ove pertinenti. Non sono stati aggiunti clienti, collaborazioni, recensioni, risultati o certificazioni.

## 4. Verifiche eseguite

I risultati sono riportati in `docs/ESITI-TEST-V24.md`. I controlli sono locali e statici. Non attestano comportamento sul server, indicizzazione, accessibilità completa o prestazioni sul campo.

## 5. Gate e blocchi

- **STOP / dominio live:** prima della pubblicazione occorre configurare il dominio personalizzato presso registrar/DNS e GitHub Pages, verificare HTTPS, redirect da `www` se previsto e risposta HTTP 200 delle URL canoniche.
- **COND / decisione crawler:** confermare le scelte `OAI-SearchBot Allow`, `GPTBot Disallow`, `ChatGPT-User Allow`, `OAI-AdsBot Disallow`. La direttiva robots.txt è una preferenza per crawler conformi, non un controllo di sicurezza.
- **STOP / privacy:** il testo privacy resta subordinato a verifica di hosting, log, retention, servizi attivi, configurazione email e messaggistica, dati identificativi e revisione professionale.
- **COND / identità professionale:** verificare titoli, qualifiche, iscrizioni, esperienze, profilo FIDAL e servizi prima di considerarli un dossier probatorio.
- **STOP / accessibilità e prestazioni:** mancano test browser completi, audit WCAG 2.2, screen reader, Lighthouse e Core Web Vitals.
- **STOP / baseline e pilot:** KPI e test AI non sono ancora misurabili in modo valido senza query preregistrate, campione, piattaforme, timestamp, baseline e raccolta delle evidenze.
- **STOP / revisione indipendente:** il framework v2.4 richiede revisione indipendente; non è stata eseguita.

## 6. Cosa non è stato fatto

Non è stato eseguito deploy, commit/push, modifica DNS, accesso a Search Console o Bing Webmaster Tools, crawling del dominio live, test con browser reale, Lighthouse, verifica con screen reader, misurazione KPI, test pilota AI o revisione legale. Nessuna promessa di ranking, citazioni, menzioni, traffico o conversioni è formulata.

## 7. Giudizio di consegna

**Pacchetto tecnico locale aggiornato, pronto per revisione e per la chiusura dei gate elencati; non dichiarabile come sito pienamente conforme/applicato allo standard v2.4 finché baseline, pilot, verifica indipendente e controlli live non sono completati.**

**Nota di tracciabilità:** una menzione del vecchio hostname resta in `docs/RELAZIONE-TECNICA.md` come descrizione storica della configurazione precedente. Non è presente nei riferimenti tecnici attivi, nei canonical, nella sitemap o nei metadati delle pagine.
