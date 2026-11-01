# Pagella — 12 aree del sito Cesare Paratore

**Esito: obiettivo 10/10 non ancora dimostrato.** I voti sono stime del pacchetto locale, non certificazioni del sito pubblicato. N/V significa non valutabile con le prove disponibili. La media non viene calcolata: includere aree N/V produrrebbe falsa precisione.

| Area | Punteggio prudenziale | Evidenza disponibile | Prova necessaria per 10/10 |
|---|---:|---|---|
| Art direction | 7,5/10 | Stima statica; identità visiva e monogramma presenti | Review visuale su tutte le route e viewport; confronto con utenti |
| Typography | 7,0/10 | Gerarchie e scale presenti; resa effettiva non osservata | Verifica font, leggibilità e metriche su dispositivi reali |
| Motion | 7,5/10 | Animazioni e rispetto reduced-motion rilevati nel codice | Test runtime, fluidità, jank e dispositivi meno potenti |
| Interaction | 7,0/10 | Menu, lingua, navigazione sezioni e audio nel codice; F-01 corretto staticamente | E2E browser di ogni controllo e stati di errore |
| UX e conversione | 7,5/10 | Percorsi, pagine servizio e CTA presenti | Test task con utenti e misure di conversione autorizzate |
| Responsive | N/V | CSS contiene breakpoint; nessuna prova visuale verificata | Viewport 320–1440 px, orientamento, touch, zoom e reflow |
| Accessibilità | 6,5/10 provvisorio | Semantica, lang, alt, skip/focus e reduced-motion in parte controllati staticamente | WCAG 2.2 AA, contrasto, tastiera, screen reader, zoom/reflow |
| Performance | N/V | Asset locali e audio preload conservativo; misure non disponibili | Lighthouse mobile/desktop e Core Web Vitals con condizioni registrate |
| Codice e manutenibilità | 8,5/10 | Struttura e sei script di controllo; parsing statico superato | Test E2E, validazione W3C e revisione duplicazioni/manutenibilità |
| SEO tecnica | 9,0/10 statica | Canonical/hreflang, sitemap 20 URL, robots e JSON-LD verificati localmente | Stato live, indicizzazione e Search Console/Bing dopo autorizzazione |
| PSAI e visibilità AI | 6,0/10 provvisorio | Struttura documentale e direttive crawler documentate | Approvazione titolare, baseline/pilot ripetibile e revisione indipendente |
| Qualità complessiva | 8,0/10 provvisorio | Pacchetto locale supera i controlli statici e HTTP inclusi | Chiusura dei gate P0/P1 e verifica completa su browser/utenti/servizi reali |

## Regola di valutazione

Non si assegna 10/10 senza evidenze ripetibili, test adeguati all'area e assenza di riserve rilevanti. La pagella riguarda il pacchetto locale e non certifica il sito live, la conformità legale, l'indicizzazione, la visibilità AI o la qualità percepita dagli utenti.
