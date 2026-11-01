# Correzione firma animata del footer — 1 novembre 2026

## Intervento
- Ripristinate in `assets/interior.css` le stesse regole CSS della firma presenti nella homepage (`css/style.css`): stato iniziale mascherato, rivelazione tramite `clip-path` in 2,25 secondi, sottolineatura progressiva, punto finale e rispetto di `prefers-reduced-motion`.
- Allineata in `assets/interior.js` la logica JavaScript a quella della homepage: `IntersectionObserver` sul footer con soglia 0,35; rimozione e riapplicazione di `is-signing` per riavviare l'animazione; timer di completamento di 2.350 ms; reset quando il footer esce dalla viewport.
- La firma non viene più gestita con regole CSS separate e divergenti per le pagine interne: il selettore `.signature` e gli stati sono gli stessi della home.
- Non sono stati modificati contenuti, collegamenti, metadati SEO, robots, sitemap o configurazioni di pubblicazione.

## Verifiche
- PASS — `node --check assets/interior.js`.
- PASS — controllo statico di tutte le pagine interne: footer con `.signature`, collegamento a `interior.css` e caricamento di `interior.js`.
- PASS — verifica presenza delle regole di rivelazione, transizione, stato `is-signing` e variante `prefers-reduced-motion`.
- BLOCKED — test browser automatizzato: Chromium restituisce `net::ERR_BLOCKED_BY_ADMINISTRATOR` sia su `file://` sia su `http://127.0.0.1`, quindi non è possibile attestare qui una verifica visiva runtime. Non viene dichiarato un test E2E superato.

## Limiti
L'effetto replica quello già implementato in home: rivelazione progressiva della scritta corsiva tramite maschera CSS, non un tracciato vettoriale dei singoli glifi. Con `prefers-reduced-motion: reduce` la firma è mostrata subito, come nella homepage, per rispettare la preferenza di accessibilità.
