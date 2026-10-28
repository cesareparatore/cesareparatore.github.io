# Audit finale e ottimizzazione — Inevitabilità

**Data:** 28 ottobre 2026  
**Base verificata:** `cesareparatore-inevitabilita-10-10-2026-10-28.zip`  
**Ambito:** sito statico completo, con attenzione alle pagine `chi-sono/` e `en/chi-sono/`.

## Esito sintetico

La versione di partenza contiene già le correzioni linguistiche e SEO statiche riportate nel precedente audit. Non ho trovato difetti statici che giustificassero ulteriori modifiche ai testi o al layout senza una verifica nel browser. Per evitare cambiamenti cosmetici o regressioni non motivate, ho conservato i contenuti e aggiunto un controllo automatico ripetibile per l'integrità dei link e delle risorse locali, gli ID duplicati e gli attributi `alt` delle immagini.

**Valutazione complessiva attuale: 8,5/10, provvisoria.** Non è un certificato di qualità assoluta: il 10/10 non è dimostrabile finché non vengono eseguiti test visivi e interattivi, verifiche complete di accessibilità e misure reali di prestazione.

## Modifiche effettive in questa revisione

- Aggiunto `scripts/check-site-integrity.py` (solo libreria standard Python): analizza le pagine HTML, controlla la risoluzione di link e risorse locali, segnala ID duplicati e immagini prive dell'attributo `alt`.
- Aggiunto questo rapporto alla radice del pacchetto e alla cartella `docs/`.
- Nessuna riscrittura narrativa o modifica visuale non giustificata: le due pagine «Chi sono» già contengono la linea narrativa «Niente è scollegato» e le sezioni del percorso; i controlli statici non hanno mostrato errori da correggere in quei contenuti.
- Nessun CV digitale aggiunto. Nessuna pubblicazione online o push GitHub eseguiti.

## Test eseguiti in questa revisione

| Controllo | Risultato | Evidenza |
|---|---|---|
| Integrità dell'archivio di partenza | PASS | Estrazione riuscita; archivio ZIP leggibile |
| `python scripts/check-chi-sono-i18n.py` | PASS | 34 coppie IT/EN; `lang`, canonical e hreflang coerenti |
| `python scripts/quality-check.py` | PASS | 21 pagine HTML conteggiate dal controllo qualità, più file di verifica; 3 CSS; 20 URL sitemap |
| `python scripts/check-site-integrity.py` | PASS | 22 pagine HTML; link/risorse locali risolti; nessun ID duplicato; tutte le immagini hanno `alt` |
| `node --check js/script.js` | PASS | Nessun errore di sintassi |
| `node --check assets/interior.js` | PASS | Nessun errore di sintassi |
| `node --check assets/404.js` | PASS | Nessun errore di sintassi |
| Browser end-to-end e responsive | NON ESEGUITO | Nessuna prova di rendering in questa revisione |
| Screen reader e verifica WCAG manuale | NON ESEGUITO | Richiede test interattivi/manuali |
| Lighthouse / Core Web Vitals | NON MISURATO | Nessun dato prestazionale inventato |
| Sito pubblicato / Search Console | NON VERIFICATO | Nessun accesso o deploy eseguito |

## Valutazione per area

I punteggi sono giudizi editoriali/tecnici orientativi basati sulle evidenze locali disponibili, non certificazioni indipendenti.

| Area | Punteggio | Motivazione e limite |
|---|---:|---|
| Identità e posizionamento | 8,5/10 | «Niente è scollegato» dà un asse riconoscibile; unicità percepita non è stata testata con utenti |
| Narrazione | 8,5/10 | Percorso articolato in sei tappe e chiusura che esplicita il filo; la resa e il ritmo vanno verificati nel browser e con lettori reali |
| Specificità e credibilità | 7,5/10 | Il racconto usa esperienze fornite, ma credenziali e prove professionali non sono state riverificate qui su fonti ufficiali |
| Chiarezza dei servizi | 7,5/10 | La pagina distingue aree e modalità generali; il percorso end-to-end verso ogni servizio non è stato provato in browser |
| UX e design | 7,5/10 provvisorio | Struttura e CSS presenti; nessun audit visivo responsive eseguito in questa revisione |
| Accessibilità | 7/10 provvisorio | Esistono skip link, focus visibile e supporto `prefers-reduced-motion`; contrasto, tastiera e screen reader non sono stati testati integralmente |
| SEO tecnico statico | 8,5/10 | Metadati, canonical e hreflang controllati localmente; indicizzazione e risultati live non verificati |
| Prestazioni | Non valutabile | Mancano misure Lighthouse e Core Web Vitals |
| Coerenza IT/EN | 10/10 nei test statici mirati | 34 coppie e metadati linguistici superano il controllo; non equivale a una revisione linguistica umana completa |
| Affidabilità tecnica statica | 9/10 | Checker qualità, localizzazione, link/risorse e sintassi JS passano; non sono stati fatti test browser |

## Criticità residue e come chiuderle

1. **Browser smoke test:** aprire homepage e pagine interne in viewport mobile/desktop; provare menu, lingua, audio, link CTA e 404.
2. **Accessibilità:** eseguire navigazione solo tastiera, zoom/reflow, verifica contrasto e test con screen reader; correggere ogni problema osservato.
3. **Prestazioni:** misurare Lighthouse su mobile e desktop; registrare LCP, INP, CLS e le condizioni del test. I dati di campo richiedono traffico e tempo.
4. **Credibilità:** confermare titoli, qualifiche, incarichi, servizi e modalità operative con documenti/fonti pubblicabili; inserire esempi reali soltanto con consenso e senza dati sensibili.
5. **SEO live:** dopo un rilascio autorizzato, controllare URL e indicizzazione con strumenti del proprietario del sito/Search Console.
6. **Privacy e hosting:** verificare il testo rispetto ai trattamenti e servizi effettivamente in uso; il presente audit non è una revisione legale.

## Comandi ripetibili

Dalla radice del sito:

```bash
python scripts/check-chi-sono-i18n.py
python scripts/quality-check.py
python scripts/check-site-integrity.py
node --check js/script.js
node --check assets/interior.js
node --check assets/404.js
```

## Conclusione

Il pacchetto locale supera i controlli statici eseguiti. L'8,5/10 resta una stima prudente: la distanza dal 10/10 non è un'altra frase o un restyling arbitrario, ma la raccolta di evidenze su esperienza reale, accessibilità, prestazioni e accuratezza professionale. Il sito online è rimasto invariato.
