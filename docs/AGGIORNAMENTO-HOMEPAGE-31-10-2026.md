# Aggiornamento homepage — 31 ottobre 2026

## Modifiche editoriali e di interfaccia

- Testo della sezione territoriale aggiornato in italiano: «Da qui incontro persone, ascolto idee e prendo parte a progetti in cinque ambiti diversi.»
- Aggiornata la corrispondente formulazione inglese e le stringhe del cambio lingua.
- La navigazione flottante delle sezioni mostra soltanto due pulsanti circolari con freccia precedente/successiva; i titoli delle sezioni non sono visibili. Le etichette restano disponibili alle tecnologie assistive.
- I due pulsanti riprendono il linguaggio visivo del controllo «Torna su».
- Privacy e indicazione Partinico/ora locale sono state spostate nella fascia chiara immediatamente precedente al footer, rispettivamente a sinistra e a destra.
- Il footer scuro contiene soltanto la firma centrata in corsivo.
- Le modifiche sono state applicate alle homepage italiana e inglese.

## Verifiche eseguite

- `quality-check.py`: PASS.
- `check-site-integrity.py`: PASS.
- `check-chi-sono-i18n.py`: PASS.
- `check-psai-technical.py`: PASS.
- `check-psai-document-structure.py`: PASS.
- `check-psai-local-http.py`: PASS su server locale loopback.
- `node --check` per gli script JavaScript principali: PASS.

Questi controlli non sostituiscono un collaudo visivo cross-browser, un audit WCAG 2.2 completo o misurazioni reali dei Core Web Vitals.
