# Relazione tecnica

**Data:** 28 ottobre 2026. **Base di lavoro:** archivio originale `cesareparatore.github.io-main(1).zip` e versione `cesareparatore-final-2026.zip` disponibili nel workspace. Il repository remoto non è stato usato come fonte verificata in questa esecuzione.

## Problemi e interventi verificati

1. **Sitemap dichiarata male:** `robots.txt` puntava a `sitemap.xml.nojekyll`, URL errato. Corretto in `https://cesareparatore.it/sitemap.xml` e incluso un controllo automatico.
2. **Privacy caricava lo script completo della homepage:** il vecchio file privacy richiamava `js/script.js`, che contiene interazioni e timer della homepage non necessari alla pagina privacy. La pagina è stata ricostruita usando il CSS e lo script condivisi delle pagine interne; ora la lingua funziona con attributi `data-it`/`data-en` e il menu è gestito dal codice condiviso leggero.
3. **Preloader:** rimossa la logica di percentuale simulata non necessaria. Ora il preloader non dichiara un avanzamento numerico fittizio, rispetta `prefers-reduced-motion` e ha un timeout di recupero.
4. **Audio:** la sorgente viene assegnata dopo aver impostato `preload = "none"`; il sito non avvia la traccia automaticamente.
5. **Lingua e menu delle pagine interne:** la lingua è applicata a `document.documentElement.lang`; il menu supporta chiusura con Escape, focus iniziale e ripristino del focus nel caso di chiusura da tastiera.
6. **Metadati social e referrer:** completati i campi di anteprima social mancanti sulle pagine contenuto e aggiunta una politica `strict-origin-when-cross-origin`.
7. **Gestione degli errori:** aggiunta `404.html` per URL non trovati su GitHub Pages.
8. **Qualità continua:** aggiunti `scripts/quality-check.py` e `.github/workflows/quality.yml` per ripetere i controlli statici e la sintassi JavaScript a ogni push o pull request.
9. **Documentazione privacy:** il testo distingue ciò che emerge dal codice dalle verifiche di hosting e trattamento che richiedono informazioni esterne; non afferma una conformità legale definitiva. È stata individuata la presenza di un hook opzionale `gtag` sul click WhatsApp; l'handler è stato spostato dal markup inline a JavaScript e la privacy page segnala che la configurazione live va verificata.
10. **SEO internazionale:** aggiunte 10 pagine inglesi statiche sotto `en/`, una per ciascuna pagina indicizzabile italiana. Le pagine EN hanno `lang="en"`, title e description inglesi, canonical auto-riferito, `og:url`, JSON-LD `inLanguage` e link `hreflang` reciproci (`it`, `en`, `x-default`). La sitemap include 20 URL. Il selettore lingua porta alla pagina corrispondente anziché cambiare solo il testo sulla stessa URL; il vecchio overlay di cambio lingua non più necessario è stato rimosso.
11. **404 localizzata:** `404.html` seleziona testo e destinazione della homepage in base al percorso italiano o `/en/`.
12. **Controlli statici estesi:** il checker verifica anche DOCTYPE unico, attributi duplicati, coerenza canonical/`og:url`, coppie `hreflang` e copertura completa della sitemap.

## Elementi preservati

Sono state conservate homepage, otto pagine professionali, pagina privacy, ritratto, marchio SVG, audio originale, sitemap, robots e file di verifica Google. Non sono state aggiunte dipendenze runtime, analytics, tracciamenti o qualifiche professionali inventate.

## Scelte ancora aperte

- **SEO multilingue live:** le URL statiche inglesi e i metadati corrispondenti sono presenti nel pacchetto. Restano da verificare dopo il deploy che GitHub Pages pubblichi tutte le route, che le pagine rispondano correttamente e che Google le elabori come previsto.
- **Privacy:** i file non permettono di confermare log, retention, impostazioni effettive di GitHub Pages o trattamenti successivi su servizi terzi.
- **Sicurezza HTTP:** la configurazione dei response header dipende dal provider e non è interamente controllabile da file statici su GitHub Pages.
- **Design e UX:** il codice è stato controllato staticamente, ma non è stata disponibile una revisione visuale completa in browser.

## Riferimenti tecnici consultati

- W3C, WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Google Search Central, Core Web Vitals: https://developers.google.com/search/docs/appearance/core-web-vitals
- Google Search Central, versioni localizzate e `hreflang`: https://developers.google.com/search/docs/specialty/international/localized-versions
- GitHub Docs, configurazione della sorgente di pubblicazione Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Limiti

Chromium è installato, ma la navigazione di Playwright verso `http://127.0.0.1` è stata bloccata con `ERR_BLOCKED_BY_ADMINISTRATOR`. Non sono dichiarati test interattivi superati, punteggi Lighthouse, conformità WCAG completa, Core Web Vitals sul campo o deploy. Vedere `REPORT-TEST.md`.


## Intervento 4.0 — chiarezza professionale e territorio

- Homepage italiana e inglese: copy iniziale reso più esplicito su servizi e riferimento a Partinico; lista territoriale ora presente nell’HTML statico, non soltanto prevista dalle stringhe JavaScript.
- Pagina “Dove opero” in entrambe le lingue: elenco dei comuni richiesti, raggruppamento per provincia e nota che chiarisce che l’elenco non equivale a sedi secondarie o disponibilità garantita.
- Pagina “Chi sono”: posizionamento e metodo più espliciti, senza aggiungere titoli, certificazioni, risultati o anni di esperienza non documentati nel pacchetto.
- Pagine Chinesiologo e Running Coach: processo più concreto e perimetro dell’attività più chiaro; indicato che non si tratta di diagnosi o trattamento sanitario.
- JSON-LD: riferimento Person normalizzato tra le pagine; rimosso dalla homepage il tema “valutazione posturale” perché non risultava spiegato in modo coerente nelle pagine di servizio esaminate.
- Google Business Profile non è stato modificato, come richiesto.

## Missione 5.0 — coerenza visiva e focus da tastiera

- Sostituito il marchio testuale `CP` nelle 18 testate interne con lo stesso monogramma SVG già impiegato nella homepage; i percorsi sono relativi alla posizione di ogni pagina e sono stati controllati.
- Uniformato `theme-color` a `#f2f0ea`, coerente con il fondo avorio del sistema grafico.
- Aggiunto un indicatore di focus tastiera esplicito e ad alto contrasto sia al foglio CSS della homepage sia al foglio condiviso delle pagine interne. Sui fondi scuri il contorno passa al lime; sui fondi chiari usa il verde scuro.
- Esteso `scripts/quality-check.py` per intercettare regressioni nel colore della barra del browser, nell'uso del monogramma SVG e nella presenza delle regole di focus visibile.
- Verificato il rapporto di contrasto dei due colori usati per il focus rispetto ai fondi di riferimento: verde scuro su avorio 11,53:1; lime su nero 15,18:1. Questi rapporti riguardano i colori di focus dichiarati, non costituiscono un audit WCAG completo di ogni testo e componente.
- Non sono state rimosse pagine, contenuti o funzionalità. Non è stato eseguito alcun deploy o aggiornamento del repository remoto.

La revisione rende più coerenti alcuni elementi identificativi e corregge una criticità concreta di navigazione da tastiera. Non sostituisce il confronto visivo in browser: Chromium continua a bloccare la navigazione locale con `ERR_BLOCKED_BY_ADMINISTRATOR`, quindi non sono dichiarati test responsive visuali, Lighthouse o test interattivi superati.
