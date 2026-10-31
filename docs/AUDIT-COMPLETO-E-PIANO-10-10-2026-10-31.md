# Audit completo e piano per 10/10 — 31 ottobre 2026

## Perimetro e provenienza

Audit della copia locale ricevuta in `cesareparatore-audit-input-2026-10-31/cesareparatore-aggiornamento-completo-2026-10-31`. La copia di lavoro è stata creata senza sovrascrivere gli originali. Inventario: 22 documenti HTML (21 pagine/contenuti più file di verifica Google), 3 fogli CSS, 3 script JavaScript, 20 URL in sitemap, 20 blocchi JSON-LD e 10 pagine inglesi. Nessun deploy, push, modifica remota, DNS, hosting o impostazione GitHub.

## Diagnosi sintetica

Il progetto ha già un'identità editoriale riconoscibile: avorio/nero/lime, monogramma, titolazione ampia, struttura narrativa a capitoli, contenuti IT/EN e pagine di servizio dedicate. La frase «NIENTE È SCOLLEGATO» funziona come principio narrativo e non è stata sostituita da un concept estraneo.

Il limite principale non è l'assenza di un design system, ma la mancanza di validazione dell'esperienza renderizzata e di una rifinitura coerente e misurata fra homepage e pagine interne. La homepage adotta un'esperienza immersiva e ricca di motion; le pagine interne sono più editoriali e sobrie. La differenza può essere intenzionale, ma deve essere verificata visivamente su viewport reali.

### Rilievi prioritari

| Priorità | Rilievo | Impatto | Intervento/criterio di verifica |
|---|---|---|---|
| P0 | In assenza di JavaScript, preloader/curtain e stato iniziale del titolo potevano nascondere la homepage; menu marcato `inert`/`aria-hidden` impediva la navigazione | Contenuto e navigazione non affidabili senza JS | Fallback CSS progressivo, contenuto visibile, menu navigabile senza JS; verifiche statiche DOM/CSS e test manuale browser ancora da fare |
| P0 | Browser end-to-end non verificabile in questo ambiente (`ERR_BLOCKED_BY_ADMINISTRATOR`, riportato nei test preesistenti) | Impossibile certificare layout, interazioni e regressioni | Eseguire test browser su Chrome/Firefox/Safari e mobile, con screenshot e registrazione difetti |
| P0 | Performance non misurata | Nessuna base oggettiva per LCP, INP, CLS o peso/tempi | Lighthouse/PageSpeed e CrUX quando disponibili; soglie Core Web Vitals documentate |
| P0 | Privacy reale, hosting, log, retention e servizi terzi non confermati | Rischio di informativa non corrispondente ai trattamenti | Conferma del titolare e revisione privacy professionale |
| P1 | Accessibilità solo parzialmente verificata | Non è possibile dichiarare WCAG 2.2 AA | Audit criterio per criterio, contrasto, tastiera, zoom/reflow e screen reader |
| P1 | Tipografia prevalentemente system/Arial nelle pagine interne; sistema tipografico non formalizzato come token condivisi | Rischio di discontinuità editoriale tra home e pagine interne | Art direction e prova visiva, con font locali/di sistema solo se il beneficio è dimostrato e il costo misurato |
| P1 | Alcune interazioni homepage sono scenografiche (capitoli, audio, pause, transizioni) | Possibile complessità cognitiva e fragilità da testare | Test di task: raggiungere servizi, comprendere ruolo, contattare; verificare fallback e tastiera |
| P1 | Dati professionali, qualifiche, profilo FIDAL, disponibilità e modalità dei servizi da confermare | Rischio di ambiguità o claim non dimostrabili | Conferma documentale del titolare prima di arricchire contenuti/entità |
| P1 | Domain decision attuale è `github.io`, mentre `.it` è rinviato per scelta esplicita | Possibile confusione se si presume che `.it` sia già canonico | Mantenere canonical/sitemap coerenti con decisione locale; passare a `.it` solo dopo gate 10/10 e autorizzazione |
| P1 | PSAI V2.4 non ha baseline/pilot AI, Search Console/Bing e revisione indipendente | Nessuna prova di visibilità o citazione AI | Preregistrare query, modello, data, campione, metriche, evidenze e revisore indipendente |
| P2 | Verifica HTML/CSS non equivale a validazione W3C | Possibili errori semantici non intercettati | Validatori ufficiali quando rete/ambiente consentono |
| P2 | Header HTTP e configurazione hosting non verificati | Sicurezza/redirect non dimostrati | Verifica read-only da rete esterna |

## Dominio e identità canonica

La documentazione `SCELTA-DOMINIO-FASE-CORRENTE-2026-10-31.md` stabilisce esplicitamente `https://cesareparatore.github.io/` come dominio canonico per questa fase di revisione. `cesareparatore.it` è rinviato fino al completamento documentato dei gate e a un'autorizzazione successiva. Perciò non è un errore tecnico che il pacchetto locale usi `github.io`: sarebbe un errore cambiare canonical/sitemap al dominio `.it` ignorando la decisione corrente.

Non è stato possibile verificare DNS, redirect HTTP, TLS, CNAME remoto, GitHub Pages Settings, status HTTP o comportamento live. La documentazione descrive il redirect segnalato come non verificato. Nessuna conclusione viene attribuita a DNS o codice senza misure.

## Modifiche implementate in questa fase

1. Aggiunto un flag di progressive enhancement nella testa delle 20 pagine con JavaScript: quando JS è disponibile, il CSS può attivare l'esperienza interattiva; quando non è disponibile, il flag non esiste.
2. Il preloader e le curtain della homepage non bloccano più il contenuto nel percorso senza JS.
3. I contenuti con `data-reveal` e il testo hero restano visibili senza JS.
4. Il menu non è più marcato `inert`/`aria-hidden` nel markup iniziale; gli script applicano lo stato chiuso e non interattivo dopo l'inizializzazione. Senza JS, i link restano presenti e navigabili.
5. Aggiunto fallback CSS leggibile per menu homepage e pagine interne.
6. Nel secondo passaggio, rimosso `aria-hidden="true"` residuo dal markup statico dei 20 menu e aggiunto un controllo automatico contro la regressione.
6. Nessuna dipendenza esterna aggiunta, nessun contenuto professionale inventato, nessun cambio di dominio o crawler policy.

## Cosa resta necessario per il 10/10

- Browser reale e cross-browser con test automatizzati e manuali.
- Prova responsive a 320, 360, 390, 768, 1024, 1280 e 1440 px, inclusi landscape e zoom 200/400%.
- Audit WCAG 2.2 AA con evidenze per ciascun criterio applicabile e almeno un lettore di schermo.
- Lighthouse mobile/desktop e misure di Core Web Vitals; nessun punteggio inventato.
- Verifica visuale art direction, tipografia, motion e gerarchia tra tutte le pagine.
- Conferma delle informazioni professionali e privacy da parte del titolare.
- Conferma delle direttive crawler e pilot PSAI V2.4 preregistrato con revisore indipendente.
- Verifica live del dominio e dell'indicizzazione, soltanto quando autorizzata la pubblicazione.

## Stato

La copia è una build locale migliorata e verificata staticamente. Non è un 10/10, non è una certificazione WCAG/GDPR/PSAI, non prova indicizzazione o visibilità AI e non è pronta per essere pubblicata senza i gate indicati.
