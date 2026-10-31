# Valutazione PSAI V2.4 e aree di qualità del sito — 31 ottobre 2026

## 1. Distinzione delle griglie

I materiali originali contengono due oggetti diversi:

1. La rubrica PSAI V2.4 ha 12 criteri C1–C12, pesi invarianti per 100 punti e punteggio da 0 a 5. La condizione 100/100 richiede revisione indipendente, evidenze tracciate, assenza di riserve e validazione su almeno un pilot.
2. La pagella del sito elenca 12 aree qualitative (art direction, tipografia, motion, interaction, UX, responsive, accessibilità, performance, codice, SEO, PSAI/AI Visibility, qualità complessiva), ma nei documenti disponibili non assegna pesi numerici a queste 12 aree.

Non vengono inventati pesi per la seconda griglia. Il punteggio ponderato riportato qui applica i pesi C1–C12 all'evidenza disponibile sull'applicazione PSAI del progetto; non è una certificazione né un punteggio di visibilità AI.

## 2. Rubrica ponderata originale C1–C12

Formula originale: `P_i = W_i × (S_i / 5)`; totale `P_tot = Σ P_i`. Ogni `S_i` è un intero da 0 a 5. Nessun criterio riceve 5/5 se una condizione obbligatoria è aperta.

| ID | Criterio | Peso | S (0–5) | Punti ponderati | Motivazione basata sulle prove |
|---|---|---:|---:|---:|---|
| C1 | Accuratezza fattuale e aggiornamento | 10 | 3 | 6,0 | Le affermazioni sono prudenti e i limiti espliciti; qualifiche, servizi, profilo FIDAL e contatti richiedono ancora conferma del titolare. |
| C2 | Verifica delle fonti primarie | 10 | 2 | 4,0 | Il framework elenca fonti primarie, ma la consultazione diretta integrale di tutte le fonti decisive non è documentata; le fonti F01–F16 storiche non sono dichiarate retroattivamente complete. |
| C3 | Tracciabilità delle affermazioni | 8 | 3 | 4,8 | Esiste una matrice claim/fonte/evidenza/limite, ma la copertura non è dimostrata per ogni singola affermazione e raccomandazione del progetto. |
| C4 | Separazione requisiti/raccomandazioni/inferenze/ipotesi | 8 | 4 | 6,4 | La tassonomia REQ/RAC/INF/IP/COND/STOP è presente e applicata nei documenti; restano riserve di coerenza nelle relazioni storiche. |
| C5 | Completezza strategica e tecnica | 10 | 3 | 6,0 | Identità, contenuti, tecnica, crawler, privacy, KPI, pilot e governance sono coperti; presenza esterna, gate, privacy e validazione live sono aperti. |
| C6 | Applicabilità operativa | 10 | 3 | 6,0 | Checklist e gate definiscono azioni/evidenze; responsabili, effort reale e scadenze non sono assegnati integralmente e alcuni dipendono dal titolare. |
| C7 | Prioritizzazione riproducibile | 8 | 3 | 4,8 | Formula, scale e fasce decisionali sono presenti; pesi convenzionali non validati su dati storici e non tutte le azioni hanno schede valorizzate. |
| C8 | KPI, formule e criteri decisionali | 10 | 3 | 6,0 | Dizionario KPI con formule, denominatori, fonti e limiti presente; baseline, finestre effettive e target empirici non disponibili. |
| C9 | Misurazione dei sistemi AI | 8 | 2 | 3,2 | Protocollo ripetibile e codifica delle risposte definiti; nessun pilot preregistrato è stato eseguito e nessun transcript è disponibile. |
| C10 | Rischi, dipendenze e governance | 8 | 3 | 4,8 | Gate e rischi sono documentati; privacy effettiva, assegnazione responsabili, decisione crawler e revisione indipendente sono ancora aperti. |
| C11 | Coerenza interna | 5 | 3 | 3,0 | La decisione più recente sul dominio è esplicita; alcune relazioni storiche conservano riferimenti alla configurazione precedente e vanno lette come storico. |
| C12 | Completezza editoriale | 5 | 4 | 4,0 | Standard, checklist, gate, fonti, registri e report sono presenti; la verifica delle fonti, pilot e revisione indipendente impediscono la chiusura piena. |
|  | **Totale** | **100** |  | **59,0/100** | **Applicazione PSAI al progetto: parziale; non 100/100.** |

### Perché il punteggio non è 100/100

Restano condizioni esplicitamente richieste dal framework: gate di avvio completati; prove documentali delle informazioni pubbliche; fonti primarie decisive consultate e tracciate; baseline KPI; protocollo AI preregistrato e pilot documentato; responsabilità/effort/scadenze; verifica privacy; controlli live; revisione indipendente. Non sono sostituibili da markup, checker statici o una buona qualità del codice.

## 3. Dodici aree del sito: esito basato sulle prove

La seguente tabella non assegna voti numerici alle 12 aree perché la documentazione originale del sito non definisce pesi né ancoraggi numerici specifici per queste aree. Assegnare numeri o pesi qui sarebbe inventare una griglia. Gli stati sono basati solo sulle prove effettivamente raccolte.

| Area | Stato | Prove disponibili | Perché non è 10/10 dimostrato |
|---|---|---|---|
| Art direction e identità visiva | PARZIALE | Palette, monogramma, struttura narrativa e sistema CSS presenti. | Rendering non osservato; manca review visuale di tutte le route e test con utenti. |
| Tipografia e leggibilità | PARZIALE | Scala fluida e stack di sistema/Arial; gerarchie CSS. | Resa effettiva, metriche, lunghezza IT/EN e leggibilità su device non verificate. |
| Motion design | PARZIALE | Animazioni e `prefers-reduced-motion` nel CSS/JS. | Fluidità, jank, focus, interruzioni e comportamento reale non testati. |
| Interaction design | PARZIALE | Handler menu, lingua, audio, capitoli, preloader e 404 presenti. | Nessun test E2E browser; non si dichiara il funzionamento runtime. |
| UX e conversione | PARZIALE | Percorsi di navigazione e CTA statiche presenti; checker link superato. | Nessun task test con utenti, analytics autorizzato o conversioni misurate. |
| Responsive design | NON VERIFICATO | Breakpoint e layout fluidi nel CSS. | Nessun test su viewport reali, orientamento, zoom o device. |
| Accessibilità | PARZIALE | Skip link, alt, `lang`, focus visibile, riduzione movimento, menu statico non nascosto. | Nessun audit WCAG 2.2 completo, contrasto sistematico, screen reader o zoom/reflow. |
| Performance | NON VERIFICATO | Asset locali; audio opzionale con preload conservativo. | Nessun Lighthouse, waterfall, LCP, INP, CLS o dato CrUX. |
| Codice e manutenibilità | PARZIALE | Checker statici, parser, sintassi JS, script locali e workflow CI. | Nessun runtime E2E, validazione W3C, revisione manuale completa o esecuzione CI remota. |
| SEO tecnico e architettura | PARZIALE | Canonical, hreflang, sitemap 20 URL, robots e JSON-LD parsabili. | Status HTTP, redirect, TLS, rendering, indicizzazione e Search Console non verificati. |
| Personal Search & AI Visibility | PARZIALE / BLOCCATA | Policy crawler distinta, schema Person/WebPage, gate e protocollo KPI presenti. | Gate titolare, baseline, pilot, fonti complete, presenza esterna e revisore indipendente mancanti. |
| Qualità complessiva | NON CERTIFICABILE | Pacchetto completo e test statici superati. | Le aree critiche non verificate impediscono un voto complessivo dimostrato. |

## 4. Decisione

- Il pacchetto locale è **tecnicamente coerente nei controlli statici eseguiti**.
- Non si dichiara 10/10 in alcuna area che dipenda da prove browser, misure sul campo, dati del titolare o servizi esterni.
- Il punteggio ponderato PSAI di questa revisione è **59,0/100** per l'applicazione documentata al progetto, non un punteggio di framework e non una metrica di visibilità.
- Il precedente 8,0/10 presente in una pagella storica era una sintesi qualitativa provvisoria; non è una media ponderata e non viene riutilizzato come punteggio dimostrato.
