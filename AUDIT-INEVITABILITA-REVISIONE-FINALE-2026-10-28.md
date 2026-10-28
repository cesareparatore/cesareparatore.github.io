# Audit e revisione finale — Inevitabilità

**Data:** 28 ottobre 2026  
**Base di partenza:** `cesareparatore-inevitabilita-audit-finale-2026-10-28.zip`  
**Principio guida:** «Niente è scollegato.»

## Sintesi

Questa revisione introduce modifiche effettive alle due pagine «Chi sono», non soltanto controlli aggiuntivi. La revisione si concentra su tre punti: ridurre la ripetizione nell'introduzione, rendere esplicito il filo comune senza suggerire che tutte le professioni siano la stessa cosa, e chiarire che il riferimento in presenza a Partinico riguarda running coaching e chinesiologia. La sezione sul metodo è stata sostituita da tre percorsi più concreti, con collegamenti alle pagine di servizio pertinenti.

Non è stato aggiunto un CV digitale. Non è stata effettuata alcuna pubblicazione online o push su GitHub.

## File modificati o aggiunti

- `chi-sono/index.html` — apertura narrativa più sintetica; collegamento più diretto tra curiosità, comprensione e lavoro; specificazione delle attività in presenza a Partinico; nuova sezione pratica con collegamenti ai servizi.
- `en/chi-sono/index.html` — revisione equivalente in inglese; attributi di traduzione allineati con la versione italiana.
- `docs/AUDIT-INEVITABILITA-REVISIONE-FINALE-2026-10-28.md` — questo rapporto.

Gli altri file del sito sono stati conservati senza modifiche.

## Test eseguiti

| Controllo | Esito | Evidenza / limite |
|---|---|---|
| Integrità ZIP sorgente | PASS | `unzip -t` non ha segnalato errori |
| Controllo traduzioni «Chi sono» | PASS | `python scripts/check-chi-sono-i18n.py`: 39 coppie IT/EN; `lang`, canonical e hreflang coerenti |
| Controllo qualità sito | PASS | `python scripts/quality-check.py`: 21 pagine HTML di contenuto più verifica Google; 3 CSS; 20 URL sitemap |
| Link, risorse locali, ID e alt | PASS | `python scripts/check-site-integrity.py`: 22 HTML, nessun ID duplicato, risorse locali risolte e immagini con `alt` |
| Parsing HTML | PASS | Parser HTML della libreria standard Python su 22 file HTML; è un controllo sintattico di base, non un validatore HTML completo |
| Sintassi JavaScript | PASS | `node --check js/script.js`, `node --check assets/interior.js`, `node --check assets/404.js` terminati senza errori |
| Rendering Chromium | NON COMPLETATO | Il browser headless presente nell'ambiente non ha terminato entro il limite di esecuzione; nessuna dichiarazione di superamento visuale |
| Lighthouse / Core Web Vitals | NON MISURATI | Nessuna misurazione prestazionale attendibile ottenuta |
| WCAG completa / screen reader | NON COMPLETATA | I controlli statici non sostituiscono test manuali di tastiera, contrasto e tecnologie assistive |
| Sito online / Search Console | NON VERIFICATI | Nessuna pubblicazione e nessun accesso a dati live |

### Comandi ripetibili

Dalla radice del sito:

```bash
python scripts/check-chi-sono-i18n.py
python scripts/quality-check.py
python scripts/check-site-integrity.py
node --check js/script.js
node --check assets/interior.js
node --check assets/404.js
```

## Valutazione per area

Questi sono punteggi editoriali e tecnici provvisori basati sul contenuto locale e sui controlli realmente eseguiti. Non sono una certificazione esterna. La valutazione precedente complessiva era 8,5/10; non è possibile dimostrare che tutte le aree abbiano raggiunto il 10/10 in assenza di test visuali, manuali e prestazionali.

| Area | Prima | Dopo | Motivazione / evidenza |
|---|---:|---:|---|
| Identità e posizionamento | 8,5 | 8,8 | Il filo comune è formulato con più concretezza; manca una verifica con utenti per misurare la riconoscibilità |
| Narrazione | 8,5 | 8,8 | Introduzione meno enumerativa e sezione sul metodo più distinta dalla sintesi narrativa |
| Specificità e credibilità | 7,5 | 8,0 | Modalità in presenza specificate per corsa e chinesiologia; titoli e incarichi non sono stati verificati su fonti esterne |
| Chiarezza dei servizi | 7,5 | 8,3 | La sezione finale collega direttamente i tre gruppi di attività alle pagine pertinenti; non è stato possibile provare il percorso in browser |
| UX e design | 7,5 | 7,5 provvisorio | La struttura resta coerente con il CSS esistente; test visuale browser non completato, quindi nessun aumento assegnato |
| Accessibilità | 7,0 | 7,0 provvisorio | Controlli statici superati, ma non è stata eseguita una valutazione manuale completa |
| SEO | 8,5 | 8,5 | Canonical, hreflang e sitemap controllati localmente; indicizzazione live non verificata |
| Prestazioni | N/V | N/V | Nessun dato Lighthouse/Core Web Vitals attendibile ottenuto |
| Coerenza linguistica | 10 nei test statici mirati | 10 nei test statici mirati | 39 coppie di attributi IT/EN coerenti; manca revisione linguistica umana indipendente completa |
| Affidabilità tecnica | 9,0 | 9,0 | Controlli statici e sintassi JS passano; comportamento interattivo end-to-end non verificato |

## Criticità residue

1. Ripetere il controllo visuale su browser in viewport mobile, tablet e desktop in un ambiente in cui Chromium/Playwright termini correttamente.
2. Provare menu, cambio lingua, audio, CTA e 404 con mouse e tastiera.
3. Eseguire controlli di contrasto, zoom/reflow e screen reader per la valutazione accessibilità.
4. Misurare Lighthouse e, quando disponibili, i dati di campo Core Web Vitals.
5. Confermare con fonti pubblicabili i dettagli professionali che si desidera presentare come credenziali verificabili.
6. Dopo un rilascio autorizzato, verificare indicizzazione e dati di Search Console. Questo audit non ha pubblicato il sito.

## Conclusione

La revisione contiene miglioramenti reali e localizzati nella pagina «Chi sono» in entrambe le lingue e ha mantenuto intatto il resto del sito. Non assegno un 10/10 complessivo: la narrazione e la chiarezza sono state migliorate, ma i limiti dei test browser, accessibilità manuale e prestazioni impediscono di sostenere quel giudizio con prove sufficienti.
