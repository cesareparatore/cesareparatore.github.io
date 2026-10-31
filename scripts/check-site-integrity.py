#!/usr/bin/env python3
"""Static integrity checks for local HTML links, duplicate IDs and image alt attributes.
Uses only the Python standard library; no network access required.
"""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
import sys

ROOT = Path(__file__).resolve().parents[1]

class PageScan(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links = []
        self.ids = []
        self.images_without_alt = []
        self.menu_panels_blocked = 0
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.append(attrs['id'])
        if tag == 'aside' and 'menu-panel' in (attrs.get('class') or '').split():
            if attrs.get('aria-hidden') == 'true' or 'inert' in attrs:
                self.menu_panels_blocked += 1
        if tag == 'a' and attrs.get('href'):
            self.links.append(('href', attrs['href']))
        elif tag in ('script', 'img', 'source'):
            attr = 'src'
            if attrs.get(attr):
                self.links.append((attr, attrs[attr]))
        elif tag == 'link' and attrs.get('href'):
            rel = set((attrs.get('rel') or '').lower().split())
            if 'stylesheet' in rel or 'icon' in rel or 'preload' in rel:
                self.links.append(('href', attrs['href']))
        if tag == 'img' and 'alt' not in attrs:
            self.images_without_alt.append(attrs.get('src', '(src missing)'))

def local_target(page, value):
    value = value.strip()
    if not value or value.startswith(('#', '//')):
        return None
    parsed = urlparse(value)
    if parsed.scheme or parsed.netloc:
        return None
    path = unquote(parsed.path)
    if not path:
        return None
    target = ROOT / path.lstrip('/') if path.startswith('/') else page.parent / path
    if target.is_dir():
        target = target / 'index.html'
    elif not target.exists() and not target.suffix and (target / 'index.html').exists():
        target = target / 'index.html'
    return target

errors = []
html_files = sorted(ROOT.rglob('*.html'))
for page in html_files:
    try:
        source = page.read_text(encoding='utf-8')
    except UnicodeDecodeError as exc:
        errors.append(f'{page.relative_to(ROOT)}: UTF-8 non valido ({exc})')
        continue
    scan = PageScan()
    try:
        scan.feed(source)
        scan.close()
    except Exception as exc:
        errors.append(f'{page.relative_to(ROOT)}: parsing HTML fallito ({exc})')
        continue
    for ident, count in Counter(scan.ids).items():
        if count > 1:
            errors.append(f'{page.relative_to(ROOT)}: id duplicato {ident!r} ({count} volte)')
    for src in scan.images_without_alt:
        errors.append(f'{page.relative_to(ROOT)}: immagine senza attributo alt: {src}')
    if scan.menu_panels_blocked:
        errors.append(f'{page.relative_to(ROOT)}: menu statico nascosto alle tecnologie assistive o inert nel markup iniziale')
    for attr, value in scan.links:
        target = local_target(page, value)
        if target is not None and not target.exists():
            errors.append(f'{page.relative_to(ROOT)}: {attr} locale non risolto {value!r}')

if errors:
    print(f'FAIL — {len(errors)} problema/i in {len(html_files)} pagine HTML')
    for error in errors:
        print('- ' + error)
    sys.exit(1)
print(f'PASS — {len(html_files)} pagine HTML; link e risorse locali risolti; nessun ID duplicato; immagini con alt; menu statici non bloccati nel markup iniziale.')
