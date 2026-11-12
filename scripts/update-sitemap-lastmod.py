#!/usr/bin/env python3
"""Allinea le <lastmod> di sitemap.xml alla data dell'ultimo commit git di ciascuna pagina.

Uso (dalla radice del repository, dove esiste la cartella .git):
    python3 scripts/update-sitemap-lastmod.py           # aggiorna sitemap.xml
    python3 scripts/update-sitemap-lastmod.py --check   # non scrive: esce con 1 se qualcosa è da aggiornare

Una <lastmod> è affidabile solo se cambia quando cambia la pagina. Questo script la ricava dalla
storia git del file HTML della pagina (non dalla data di generazione della sitemap), così le pagine
non modificate mantengono la loro data. Se una pagina non ha storia git (o git non è disponibile),
la sua <lastmod> resta invariata e viene segnalata.
"""
from __future__ import annotations
import argparse
import re
import subprocess
import sys
from pathlib import Path

BASE = "https://cesareparatore.github.io/"
URL_BLOCK = re.compile(r"<url>.*?</url>", re.S)
LOC = re.compile(r"<loc>(.*?)</loc>")
LASTMOD = re.compile(r"<lastmod>(.*?)</lastmod>")


def page_file(loc: str, root: Path) -> Path | None:
    if not loc.startswith(BASE):
        return None
    rel = loc[len(BASE):]
    rel = (rel + "index.html") if (rel == "" or rel.endswith("/")) else rel
    path = root / rel
    return path if path.is_file() else None


def git_date(root: Path, path: Path) -> str | None:
    try:
        out = subprocess.run(
            ["git", "-C", str(root), "log", "-1", "--format=%cs", "--", str(path.relative_to(root))],
            capture_output=True, text=True, check=True,
        ).stdout.strip()
    except (OSError, subprocess.CalledProcessError):
        return None
    return out or None


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--check", action="store_true", help="non scrive il file; esce con 1 se serve un aggiornamento")
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1], help="radice del sito")
    args = parser.parse_args()

    root = args.root.resolve()
    sitemap = root / "sitemap.xml"
    text = sitemap.read_text(encoding="utf-8")
    changes: list[str] = []
    missing: list[str] = []

    def update(block_match: re.Match[str]) -> str:
        block = block_match.group(0)
        loc_m, last_m = LOC.search(block), LASTMOD.search(block)
        if not loc_m or not last_m:
            return block
        loc = loc_m.group(1)
        path = page_file(loc, root)
        date = git_date(root, path) if path else None
        if not date:
            missing.append(loc)
            return block
        if date != last_m.group(1):
            changes.append(f"{loc}: {last_m.group(1)} -> {date}")
            block = LASTMOD.sub(f"<lastmod>{date}</lastmod>", block, count=1)
        return block

    new_text = URL_BLOCK.sub(update, text)

    for line in changes:
        print("aggiornata", line)
    for loc in missing:
        print("senza storia git (lastmod invariata):", loc)
    if not changes:
        print("Nessuna lastmod da aggiornare.")
    if args.check:
        return 1 if changes else 0
    if changes:
        sitemap.write_text(new_text, encoding="utf-8")
        print(f"sitemap.xml aggiornata ({len(changes)} voci).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
