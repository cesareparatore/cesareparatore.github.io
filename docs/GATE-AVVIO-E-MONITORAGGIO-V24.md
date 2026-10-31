# Gate di avvio e monitoraggio — Versione 2.4

Questa checklist è un registro operativo iniziale. Le caselle non selezionate sono attività aperte, non requisiti implicitamente soddisfatti.

## Gate di avvio

- [ ] Confermare nome pubblico, varianti legittime e disambiguazione da omonimi.
- [ ] Verificare con documenti i titoli L-22 e LM-47, denominazioni ufficiali, ateneo e anni; confermare il profilo FIDAL `TP0833` e la sua attualità.
- [ ] Confermare quali delle cinque aree professionali rappresentano attività attualmente offerte e quali sono descrittive/esperienziali.
- [ ] Confermare recapiti, profili ufficiali, email, WhatsApp e autorizzazione all'uso di immagini.
- [ ] Confermare le modalità operative per ciascun servizio e i territori effettivamente serviti.
- [ ] Confermare titolarità e gestione del dominio `cesareparatore.it`, DNS, hosting, GitHub Pages e redirect.
- [ ] Confermare la decisione per ciascun crawler OpenAI: OAI-SearchBot, GPTBot, ChatGPT-User, OAI-AdsBot.
- [ ] Verificare servizi terzi, log, analytics, cookie, email, messaggistica, retention e informative.
- [ ] Verificare titolarità e accessi a Search Console e Bing Webmaster Tools.
- [ ] Definire responsabile, effort, scadenza, prova attesa e criterio di completamento per ogni attività.
- [ ] Approvare la baseline KPI e il protocollo del test pilota prima della raccolta.
- [ ] Nominare un revisore indipendente e registrare ambito, data ed esito della revisione.

## Registro delle decisioni crawler attualmente impostate

| Crawler | Configurazione nel pacchetto | Motivazione | Decisione ancora necessaria |
|---|---|---|---|
| OAI-SearchBot | Allow | Obiettivo di reperibilità nella ricerca ChatGPT. | Conferma del titolare e controllo documentazione aggiornata. |
| GPTBot | Disallow | Nessun consenso separato all'uso per addestramento documentato nel materiale disponibile. | Confermare se mantenere il blocco. |
| ChatGPT-User | Allow | Fetch legato a richiesta utente; distinto dal crawling automatico. | Confermare scelta. |
| OAI-AdsBot | Disallow | Non risultano annunci/campagne da validare. | Riesaminare se si attivano campagne. |

## Baseline KPI — da compilare prima del pilot

| KPI | Numeratore | Denominatore | Baseline | Periodo | Fonte/evidenza | Stato |
|---|---|---|---|---|---|---|
| Mention Rate | Risposte valide con menzione corretta | Risposte valide | N/D | Da definire | Transcript/screenshot | Bloccato: protocollo non preregistrato |
| Citation Rate | Risposte valide con citazione al dominio | Risposte valide | N/D | Da definire | Transcript/screenshot | Bloccato |
| Citation Count | Citazioni individuali | Non applicabile | N/D | Da definire | Registro citazioni | Bloccato |
| Correct Attribution Rate | Citazioni correttamente attribuite | Citazioni esaminate | N/D | Da definire | Codifica manuale | Bloccato |
| Entity Disambiguation Accuracy | Risposte pertinenti con identificazione corretta | Risposte pertinenti | N/D | Da definire | Transcript codificati | Bloccato |
| Factual Accuracy | Affermazioni verificabili corrette | Affermazioni verificabili codificate | N/D | Da definire | Matrice claim/evidenze | Bloccato |
| Coverage by Intent | Intenti prioritari coperti | Intenti preregistrati | N/D | Da definire | Matrice query | Bloccato |
| Conversion Rate | Conversioni valide | Unità eleggibili definite | N/D | Da definire | Analytics/CRM, se autorizzati | Bloccato |

N/D significa non disponibile/non calcolabile, non zero.

## Protocollo minimo test AI

Prima di eseguire il test, preregistrare: query esatte; intenti; lingua; area geografica; piattaforma e modalità; stato sessione; data/ora e fuso; numero di repliche; criteri di risposta valida; regole di codifica; denominatori; esclusioni; screenshot o transcript; fonti citate; limiti e variabilità. Conservare ogni esecuzione, anche quando non produce una risposta valutabile. Non cambiare query o criteri dopo aver visto i risultati senza creare una nuova versione del protocollo.

## Checklist pre-pubblicazione

- [ ] Verificare record DNS e dominio personalizzato in GitHub Pages.
- [ ] Verificare HTTPS e redirect HTTP/HTTPS e www/non-www secondo una sola variante canonica.
- [ ] Aprire tutte le URL in italiano e inglese e verificare HTTP 200.
- [ ] Verificare canonical, hreflang reciproci, sitemap e robots.txt sul dominio live.
- [ ] Verificare dati strutturati contro il contenuto visibile.
- [ ] Testare menu, lingua, CTA, immagini, audio e pagina 404 su browser reali.
- [ ] Testare tastiera, focus, zoom/reflow, contrasto e screen reader.
- [ ] Eseguire Lighthouse mobile/desktop e registrare le condizioni; raccogliere Core Web Vitals sul campo quando disponibili.
- [ ] Verificare Search Console e Bing Webmaster Tools; non interpretare sitemap come garanzia di indicizzazione.
- [ ] Riesaminare privacy, cookie, servizi e log con informazioni effettive e revisione appropriata.
- [ ] Conservare screenshot, report, log e data di ogni controllo.
- [ ] Ottenere autorizzazione esplicita del titolare prima di pubblicare.

## Frequenza raccomandata

- Mensile nei primi tre mesi: controlli di integrità URL, errori di scansione disponibili, modifiche dei contenuti e stato dei contatti.
- Trimestrale: revisione contenuti, dati strutturati, privacy/servizi attivi, accessibilità regressiva e test AI preregistrati.
- A ogni modifica significativa: rieseguire i test pertinenti e aggiornare il registro delle evidenze.

La frequenza è una raccomandazione operativa, non una regola di piattaforma.
