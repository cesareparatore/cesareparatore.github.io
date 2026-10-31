# Registro conclusivo dei gate aperti — PSAI v2.4

| ID | Classe | Punto | Stato | Responsabile / prova necessaria | Effetto sulla pubblicazione |
|---|---|---|---|---|---|
| G-01 | COND | Approvare le decisioni OAI-SearchBot, GPTBot, ChatGPT-User, OAI-AdsBot | Aperto | Titolare: conferma esplicita delle quattro scelte | Da chiudere prima di considerare approvata la policy crawler |
| G-02 | COND | Confermare titoli L-22 e LM-47, denominazioni ufficiali e prove | Aperto | Titolare: documenti/denominazioni ufficiali | Correggere o limitare eventuali formulazioni non confermate |
| G-03 | COND | Confermare profilo FIDAL TP0833 e attualità | Aperto | Titolare: verifica del profilo e autorizzazione a collegarlo | Non blocca il caricamento tecnico; blocca l'uso come prova aggiornata |
| G-04 | COND | Confermare le cinque aree come attività attualmente offerte o aree descrittive/esperienziali | Aperto | Titolare: conferma per ciascuna area | Potrebbe richiedere revisione copy/CTA |
| G-05 | COND | Confermare servizi, modalità, territori e disponibilità reali | Aperto | Titolare: descrizione sintetica per servizio | Può richiedere correzioni prima della pubblicazione |
| G-06 | COND | Confermare recapiti, profili social e autorizzazione immagini | Aperto | Titolare: conferma che recapiti/link siano attivi e immagini utilizzabili | Recapiti errati o diritti non chiari impediscono la pubblicazione dei relativi elementi |
| G-07 | STOP | Dominio, DNS, GitHub Pages, HTTPS e redirect | Non verificato | Titolare/amministratore: accesso registrar/hosting e prova HTTP live | Blocca la pubblicazione corretta sul dominio personalizzato |
| G-08 | STOP | Hosting, log, retention, email, WhatsApp, servizi terzi e informativa privacy | Aperto | Titolare + provider; revisore privacy/legale se necessario | Blocca l'approvazione dell'informativa e la pubblicazione responsabile |
| G-09 | STOP | Test browser end-to-end e responsive | Non eseguito | Operatore con browser reale; screenshot e registro | Blocca la dichiarazione di verifica UX completa |
| G-10 | STOP | Accessibilità: tastiera, zoom/reflow, contrasto, screen reader e WCAG 2.2 | Non eseguito | Audit automatizzato e manuale; eventuale specialista | Blocca ogni dichiarazione di conformità/accessibilità completa |
| G-11 | STOP | Prestazioni Lighthouse e Core Web Vitals | Non misurato | Lighthouse su device/condizioni registrate; dati sul campo dopo il deploy | Blocca ogni dichiarazione prestazionale misurata |
| G-12 | COND | Search Console e Bing Webmaster Tools | Non verificato | Titolare: accessi e proprietà verificate dopo pubblicazione | Necessario per monitoraggio indicizzazione |
| G-13 | STOP | Baseline KPI e protocollo test AI preregistrato | Aperto | Titolare/analista: query, intenti, campione, date, regole e denominatori | Blocca la valutazione di efficacia PSAI |
| G-14 | STOP | Revisione indipendente richiesta dallo standard | Non eseguita | Revisore indipendente: ambito, data, esito e rilievi | Blocca la dichiarazione di chiusura integrale dello standard |
| G-15 | STOP | Autorizzazione esplicita alla pubblicazione | Non concessa | Titolare: autorizzazione separata e inequivocabile | Blocco assoluto: non pubblicare senza consenso |

## Attività completate autonomamente

- Controlli statici inclusi nel repository e sintassi JavaScript rieseguiti.
- Sitemap, corrispondenza dei 20 URL con file locali, JSON-LD e coppie hreflang controllati.
- Ricerca del vecchio hostname nei file tecnici attivi.
- Eliminata una copia duplicata di un rapporto storico; conservata la copia in `docs/`.
- Aggiunti rapporto conclusivo, rapporto dei test e questo registro.

## Richiesta circoscritta al titolare

Prima della pubblicazione, serve una conferma esplicita delle quattro direttive crawler e la conferma che le cinque aree professionali e i recapiti pubblicati siano attuali. Per titoli e profilo FIDAL, fornire o indicare le fonti ufficiali da usare. Per privacy e dominio, serve il coinvolgimento di chi gestisce hosting/DNS e dei servizi effettivamente attivi.

Non inviare credenziali o password in chat. Gli accessi ai servizi devono essere gestiti direttamente dal titolare nei rispettivi pannelli.
