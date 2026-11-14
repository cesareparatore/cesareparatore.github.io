#!/usr/bin/env python3
"""Controlli statici di regressione emersi dalla revisione del 2026-11-13.

Copre quattro difetti che gli altri script non intercettavano:
  1. residui italiani nella home inglese (testi e attributi identici a quelli della home italiana);
  2. 404.html con percorsi relativi (su GitHub Pages la 404 è servita a qualunque profondità di URL);
  3. .hero con overflow:hidden ma senza position (i pseudo-elementi assoluti sfuggono al ritaglio);
  4. failsafe del preloader assente dallo script inline in <head> delle due home.

LIMITE: è un controllo statico. Il comportamento reale (overflow a runtime, menu, 404 annidata,
caricamento fallito dello script) è verificato da scripts/check-browser-behavior.py.
"""
from __future__ import annotations
import argparse
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

# Stringhe che restano legittimamente uguali in italiano e in inglese (nomi propri, sigle, termini invariati).
ALLOWED_IDENTICAL = {
    "Cesare Paratore", "CESARE PARATORE", "PARTINICO, IT", "--:--", "AUDIO", "MENU", "Home", "Privacy",
    "SPORT", "MANAGER", "COACH", "DESIGNER", "RUNNING", "Running Coach", "Sport Manager", "Web Designer",
    "html", "website", "https://cesareparatore.github.io/assets/images/cp-foto.webp",
}
TEXT_ATTRS = ("aria-label", "alt", "title", "placeholder")
META_KEYS = ("description", "twitter:title", "twitter:description", "twitter:image:alt")


class Collector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.items: set[tuple[str, str]] = set()
        self._skip = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ("script", "style"):
            self._skip += 1
        for k in TEXT_ATTRS:
            if a.get(k):
                self.items.add((k, " ".join(a[k].split())))
        if tag == "meta" and a.get("content"):
            key = a.get("name") or a.get("property") or ""
            if key in META_KEYS or key.startswith("og:"):
                self.items.add(("meta:" + key, " ".join(a["content"].split())))

    def handle_endtag(self, tag):
        if tag in ("script", "style") and self._skip:
            self._skip -= 1

    def handle_data(self, data):
        if self._skip:
            return
        v = " ".join(data.split())
        if len(v) > 3:
            self.items.add(("text", v))


def collect(path: Path) -> set[tuple[str, str]]:
    c = Collector()
    c.feed(path.read_text(encoding="utf-8"))
    return c.items


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    root = ap.parse_args().root.resolve()
    errors: list[str] = []

    # 1) residui italiani nella home inglese
    it, en = collect(root / "index.html"), collect(root / "en" / "index.html")
    for kind, value in sorted(it & en):
        if value in ALLOWED_IDENTICAL:
            continue
        errors.append(f"en/index.html: stringa identica alla home italiana [{kind}] {value[:80]!r}")

    # 2) 404 con percorsi relativi
    page404 = (root / "404.html").read_text(encoding="utf-8")
    for m in re.finditer(r'(?:href|src)="(\./[^"]*)"', page404):
        errors.append(f"404.html: percorso relativo {m.group(1)!r} (usare un percorso dalla radice, es. /assets/...)")

    # 3) .hero: overflow:hidden richiede un contenitore posizionato per ritagliare ::before/::after assoluti
    css = (root / "css" / "style.css").read_text(encoding="utf-8")
    for m in re.finditer(r"(?<![-\w#.])\.hero\{([^}]*)\}", css):
        body = m.group(1)
        if "overflow:hidden" in body.replace(" ", "") and not re.search(r"position:\s*(relative|absolute|fixed|sticky)", body):
            errors.append("css/style.css: .hero ha overflow:hidden ma non position: i pseudo-elementi assoluti sforano la pagina")

    # 4) failsafe preloader nello script inline in <head> delle due home
    for rel in ("index.html", "en/index.html"):
        head = (root / rel).read_text(encoding="utf-8").split("</head>")[0]
        first_script = re.search(r"<script>(.*?)</script>", head, re.S)
        if not first_script or 'classList.remove("js-enabled")' not in first_script.group(1):
            errors.append(f"{rel}: manca il failsafe che rimuove js-enabled se lo script principale non parte")

    if errors:
        print("FAIL — regressioni statiche rilevate")
        print("\n".join(" - " + e for e in errors))
        return 1
    print("PASS — nessun residuo italiano nella home EN; 404 con percorsi dalla radice; .hero contenuto; failsafe preloader presente.")
    print("LIMITE — controllo statico: il comportamento reale è coperto da check-browser-behavior.py.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
