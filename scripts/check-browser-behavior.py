#!/usr/bin/env python3
"""Controlli comportamentali in browser (Playwright + Chromium) emersi dalla revisione del 2026-11-13.

Serve il sito in locale (anche simulando la 404 di GitHub Pages) e verifica:
  1. nessun overflow orizzontale su nessuna pagina della sitemap a 320, 360, 390 e 1440 px
     (a 390 con emulazione mobile: se il contenuto sborda, il layout viewport si allarga e l'header si sposta);
     e il titolo di chiusura (#contatto .contact-title) non viene mai spezzato a metà parola;
  2. nella home inglese il menu aperto non mostra etichette italiane;
  3. se js/script.js non carica, la home esce comunque dal preloader (failsafe) e mostra il contenuto;
  4. la 404 servita a URL annidati carica CSS e JS.

Se Playwright non è installato il controllo termina con SKIP (exit 0): uno SKIP NON è un PASS.
Usare --require per trasformare lo SKIP in errore (es. in CI).

Installazione: pip install playwright && playwright install chromium
"""
from __future__ import annotations
import argparse
import re
import sys
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

VIEWPORTS = [("320", 320, 640, True), ("360", 360, 800, True), ("390", 390, 844, True), ("1440", 1440, 900, False)]

SPLIT_JS = r"""() => {
  const t = document.querySelector('#contatto .contact-title');
  if (!t) return [];
  const out = [];
  const walker = document.createTreeWalker(t, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const re = /\S+/g; let m;
    while ((m = re.exec(n.textContent))) {
      const r = document.createRange();
      r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length);
      const tops = new Set([...r.getClientRects()].map(x => Math.round(x.top / 4)));
      if (tops.size > 1) out.push(m[0]);
    }
  }
  return out;
}"""


def make_handler(root: Path):
    class Handler(SimpleHTTPRequestHandler):
        """Statico, ma con la 404 di GitHub Pages: 404.html servita all'URL richiesto."""
        def log_message(self, *a):
            pass

        def send_head(self):
            path = Path(self.translate_path(self.path))
            if path.is_dir():
                if not self.path.endswith("/"):
                    self.send_response(301); self.send_header("Location", self.path + "/"); self.end_headers()
                    return None
                if not (path / "index.html").exists():
                    path = None
            if path is None or not path.exists():
                f = open(root / "404.html", "rb")
                self.send_response(404); self.send_header("Content-Type", "text/html; charset=utf-8"); self.end_headers()
                return f
            return super().send_head()
    return partial(Handler, directory=str(root))


def sitemap_paths(root: Path) -> list[str]:
    text = (root / "sitemap.xml").read_text(encoding="utf-8")
    paths = []
    for loc in re.findall(r"<loc>(.*?)</loc>", text):
        m = re.match(r"https://[^/]+(/.*)", loc)
        if m:
            paths.append(m.group(1))
    return paths


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    ap.add_argument("--require", action="store_true", help="esce con 1 se Playwright non è disponibile")
    args = ap.parse_args()
    root = args.root.resolve()

    try:
        from playwright.sync_api import sync_playwright
    except Exception:
        print("SKIP — Playwright non installato: i controlli comportamentali NON sono stati eseguiti.")
        return 1 if args.require else 0

    server = ThreadingHTTPServer(("127.0.0.1", 0), make_handler(root))
    base = f"http://127.0.0.1:{server.server_address[1]}"
    threading.Thread(target=server.serve_forever, daemon=True).start()
    errors: list[str] = []
    checked = 0

    try:
        with sync_playwright() as pw:
            try:
                browser = pw.chromium.launch()
            except Exception as exc:
                print(f"SKIP — Chromium non avviabile ({str(exc).splitlines()[0]}): controlli NON eseguiti.")
                return 1 if args.require else 0

            # 1) overflow orizzontale
            for label, w, h, mobile in VIEWPORTS:
                ctx = browser.new_context(viewport={"width": w, "height": h}, is_mobile=mobile, has_touch=mobile)
                page = ctx.new_page()
                for path in sitemap_paths(root):
                    page.goto(base + path, wait_until="load")
                    page.wait_for_timeout(1800)
                    m = page.evaluate("()=>({iw:innerWidth,sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth})")
                    checked += 1
                    if m["sw"] > m["cw"] + 1 or abs(m["iw"] - w) > 1:
                        errors.append(f"overflow a {label}px su {path}: innerWidth={m['iw']}, scrollWidth={m['sw']}, clientWidth={m['cw']}")
                    split = page.evaluate(SPLIT_JS)
                    if split:
                        errors.append(f"titolo spezzato a metà parola a {label}px su {path}: {split}")
                ctx.close()

            # 2) etichette del menu nella home inglese
            ctx = browser.new_context(viewport={"width": 1440, "height": 900})
            page = ctx.new_page()
            page.goto(base + "/en/", wait_until="load"); page.wait_for_timeout(3200)
            page.click("#menuToggle"); page.wait_for_timeout(400)
            st = page.evaluate("()=>({label:document.querySelector('.header-menu-label')?.textContent||'',aria:document.getElementById('menuToggle').getAttribute('aria-label')||''})")
            checked += 1
            if re.search(r"chiudi|apri", st["label"] + " " + st["aria"], re.I):
                errors.append(f"/en/: menu aperto con etichette italiane {st}")
            ctx.close()

            # 3) script principale non caricato -> la home deve comunque sbloccarsi
            ctx = browser.new_context(viewport={"width": 1440, "height": 900})
            page = ctx.new_page()
            page.route("**/js/script.js", lambda r: r.abort())
            page.goto(base + "/", wait_until="load"); page.wait_for_timeout(7500)
            st = page.evaluate("()=>{const p=document.getElementById('sitePreloader');return {pre:p?getComputedStyle(p).display:'none',hero:getComputedStyle(document.querySelector('.hero-writing-copy')).visibility}}")
            checked += 1
            if st["pre"] != "none" or st["hero"] != "visible":
                errors.append(f"/: con script.js non caricato la pagina resta bloccata {st}")
            ctx.close()

            # 4) 404 a URL annidati
            for path in ("/pagina-inesistente", "/en/pagina-inesistente", "/chi-sono/inesistente/altro"):
                ctx = browser.new_context(viewport={"width": 1000, "height": 700})
                page = ctx.new_page()
                failed: list[str] = []
                page.on("response", lambda r, p=path: failed.append(r.url) if r.status >= 400 and not r.url.endswith(p) else None)
                page.goto(base + path, wait_until="load"); page.wait_for_timeout(600)
                home = page.evaluate("()=>document.getElementById('home-link').getAttribute('href')")
                checked += 1
                if failed:
                    errors.append(f"404 su {path}: risorse non caricate {[u.replace(base,'') for u in failed]}")
                expected_home = "/en/" if path.startswith("/en/") else "/"
                if home != expected_home:
                    errors.append(f"404 su {path}: link home = {home!r} (atteso {expected_home!r})")
                ctx.close()
            browser.close()
    finally:
        server.shutdown()

    if errors:
        print(f"FAIL — {len(errors)} problema/i su {checked} verifiche")
        print("\n".join(" - " + e for e in errors))
        return 1
    print(f"PASS — {checked} verifiche in browser: nessun overflow (320/360/390/1440), titoli non spezzati, menu EN localizzato, failsafe preloader, 404 annidata.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
