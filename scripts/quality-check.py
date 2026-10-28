#!/usr/bin/env python3
"""Dependency-free static checks for this GitHub Pages site."""
from __future__ import annotations
import json
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
errors: list[str] = []
notes: list[str] = []

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.refs: list[tuple[str, str]] = []
        self.meta_keys: list[tuple[str, str]] = []
        self.titles: list[str] = []
        self.h1_count = 0
        self.title_depth = 0
        self.title_text = ''
        self.jsonld_depth = 0
        self.jsonld_text = ''
        self.jsonld_blocks: list[str] = []
        self.img_missing_alt: list[str] = []
        self.document_lang = ''
        self.canonical_count = 0
        self.unsafe_blank_links: list[str] = []
        self.inline_handlers: list[str] = []
        self.stack: list[str] = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.stack.append(tag)
        if tag == 'html': self.document_lang = attrs.get('lang', '')
        if any(name.lower().startswith('on') for name in attrs):
            self.inline_handlers.extend(name for name in attrs if name.lower().startswith('on'))
        if tag == 'link' and 'canonical' in (attrs.get('rel', '').lower().split()): self.canonical_count += 1
        if tag == 'a' and attrs.get('target', '').lower() == '_blank':
            rel = set((attrs.get('rel') or '').lower().split())
            if not {'noopener', 'noreferrer'}.issubset(rel): self.unsafe_blank_links.append(attrs.get('href', '(href mancante)'))
        if 'id' in attrs: self.ids.append(attrs['id'])
        if tag == 'h1': self.h1_count += 1
        if tag == 'title': self.title_depth += 1; self.title_text = ''
        if tag == 'meta':
            key = attrs.get('name') or attrs.get('property')
            if key: self.meta_keys.append((key.lower(), attrs.get('content', '').strip()))
        if tag in ('a', 'link') and attrs.get('href') is not None: self.refs.append(('href', attrs['href']))
        if tag in ('img', 'script', 'source', 'audio', 'video', 'iframe') and attrs.get('src') is not None: self.refs.append(('src', attrs['src']))
        if tag == 'img' and 'alt' not in attrs: self.img_missing_alt.append(attrs.get('src', '(src mancante)'))
        if tag == 'script' and attrs.get('type', '').lower() == 'application/ld+json': self.jsonld_depth += 1; self.jsonld_text = ''
        if tag in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:
            if self.stack: self.stack.pop()

    def handle_endtag(self, tag):
        if tag == 'title' and self.title_depth:
            self.titles.append(self.title_text.strip()); self.title_depth -= 1
        if tag == 'script' and self.jsonld_depth:
            self.jsonld_blocks.append(self.jsonld_text.strip()); self.jsonld_depth -= 1
        if tag in self.stack:
            index = len(self.stack) - 1 - self.stack[::-1].index(tag)
            self.stack = self.stack[:index]

    def handle_data(self, data):
        if self.title_depth: self.title_text += data
        if self.jsonld_depth: self.jsonld_text += data


def fail(message: str): errors.append(message)

html_files = sorted(p for p in ROOT.rglob('*.html') if '.git' not in p.parts)
content_pages = [p for p in html_files if p.name != 'google566527af11144f2c.html']
parsers: dict[Path, PageParser] = {}

for page in html_files:
    try: text = page.read_text(encoding='utf-8')
    except Exception as exc:
        fail(f'{page.relative_to(ROOT)}: lettura UTF-8 fallita: {exc}'); continue
    parser = PageParser()
    try: parser.feed(text); parser.close()
    except Exception as exc: fail(f'{page.relative_to(ROOT)}: parsing HTML fallito: {exc}')
    parsers[page] = parser
    if page.name == 'google566527af11144f2c.html': continue
    rel = page.relative_to(ROOT)
    if len(parser.titles) != 1 or not parser.titles[0]: fail(f'{rel}: deve avere un solo <title> non vuoto')
    if not parser.document_lang: fail(f'{rel}: attributo lang mancante su <html>')
    if parser.h1_count != 1: fail(f'{rel}: attesi 1 H1, trovati {parser.h1_count}')
    if parser.canonical_count != 1 and page.name != '404.html': fail(f'{rel}: atteso un solo canonical, trovati {parser.canonical_count}')
    if parser.inline_handlers: fail(f'{rel}: event handler inline non consentiti: {", ".join(parser.inline_handlers)}')
    for link in parser.unsafe_blank_links: fail(f'{rel}: link target="_blank" senza rel="noopener noreferrer": {link}')
    if page.name != '404.html':
        if not any(key == 'og:image' and value for key, value in parser.meta_keys): fail(f'{rel}: og:image mancante')
        if not any(key == 'twitter:card' and value for key, value in parser.meta_keys): fail(f'{rel}: twitter:card mancante')
    counts = Counter(parser.ids)
    for ident, count in counts.items():
        if count > 1: fail(f'{rel}: ID duplicato "{ident}" ({count} occorrenze)')
    meta_counts = Counter(key for key, _ in parser.meta_keys)
    for key, count in meta_counts.items():
        if count > 1: fail(f'{rel}: metadato duplicato name/property="{key}" ({count} occorrenze)')
    if len([x for x in parser.meta_keys if x[0] == 'description' and x[1]]) != 1:
        fail(f'{rel}: meta description mancante, vuota o duplicata')
    if len([x for x in parser.refs if x[0] == 'href' and x[1].lower().startswith('https://cesareparatore.github.io/') and 'canonical' not in x[1]]) < 0:
        pass
    for src in parser.img_missing_alt: fail(f'{rel}: immagine senza attributo alt: {src}')
    for block in parser.jsonld_blocks:
        try: json.loads(block)
        except Exception as exc: fail(f'{rel}: JSON-LD non valido: {exc}')

# Resolve local HTML references and fragments.
for page, parser in parsers.items():
    if page.name == 'google566527af11144f2c.html': continue
    for kind, raw in parser.refs:
        raw = (raw or '').strip()
        if not raw or raw.startswith('#'): continue
        parts = urlsplit(raw)
        if parts.scheme or parts.netloc: continue
        path = unquote(parts.path)
        if not path: target = page
        elif path.startswith('/'):
            target = ROOT / path.lstrip('/')
        else:
            target = page.parent / path
        target = target.resolve()
        if target.is_dir(): target = target / 'index.html'
        try: target.relative_to(ROOT.resolve())
        except ValueError:
            fail(f'{page.relative_to(ROOT)}: riferimento locale esce dal progetto: {raw}'); continue
        if not target.exists():
            fail(f'{page.relative_to(ROOT)}: {kind} locale mancante: {raw}'); continue
        if parts.fragment and target.suffix.lower() == '.html' and target in parsers:
            frag = unquote(parts.fragment)
            if frag and frag not in parsers[target].ids:
                fail(f'{page.relative_to(ROOT)}: ancora #{frag} non trovata in {target.relative_to(ROOT)}')

# Check CSS local url() references and balanced delimiters (coarse syntax sanity check).
for css in ROOT.rglob('*.css'):
    content = css.read_text(encoding='utf-8')
    for url in re.findall(r'url\(\s*[\"\']?([^\)\"\']+)', content, flags=re.I):
        url = url.strip()
        if not url or url.startswith(('data:', 'http:', 'https:', '//', '#')): continue
        target = (ROOT / url.lstrip('/')) if url.startswith('/') else (css.parent / url)
        if not target.exists(): fail(f'{css.relative_to(ROOT)}: asset CSS mancante: {url}')
    # Strip comments and quoted strings before a conservative brace check.
    stripped = re.sub(r'/\*.*?\*/', '', content, flags=re.S)
    stripped = re.sub(r'("(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\')', '""', stripped)
    depth = 0
    for char in stripped:
        if char == '{': depth += 1
        elif char == '}':
            depth -= 1
            if depth < 0: break
    if depth != 0: fail(f'{css.relative_to(ROOT)}: parentesi graffe CSS non bilanciate')

# Sitemap, robots.txt and canonical URLs.
sitemap = ROOT / 'sitemap.xml'
try:
    tree = ET.parse(sitemap)
    locs = [el.text.strip() for el in tree.getroot().iter() if el.tag.endswith('loc') and el.text]
    for loc in locs:
        if not loc.startswith('https://cesareparatore.github.io/'): fail(f'sitemap.xml: URL fuori dal dominio previsto: {loc}')
        path = urlsplit(loc).path
        target = ROOT / path.lstrip('/')
        if path.endswith('/'): target = target / 'index.html'
        if not target.exists(): fail(f'sitemap.xml: URL senza pagina locale corrispondente: {loc}')
except Exception as exc: fail(f'sitemap.xml non valido: {exc}')
robots = ROOT / 'robots.txt'
if not robots.exists(): fail('robots.txt mancante')
else:
    match = re.search(r'^Sitemap:\s*(\S+)\s*$', robots.read_text(encoding='utf-8'), re.I | re.M)
    if not match: fail('robots.txt: URL sitemap mancante')
    elif match.group(1) != 'https://cesareparatore.github.io/sitemap.xml': fail(f'robots.txt: URL sitemap errato: {match.group(1)}')

# Required publishing assets.
for required in ['index.html','404.html','robots.txt','sitemap.xml','assets/interior.css','assets/interior.js','css/style.css','js/script.js']:
    if not (ROOT / required).exists(): fail(f'file richiesto mancante: {required}')

print(f'Pagine HTML analizzate: {len(content_pages)} contenuto + verifica Google')
print(f'File CSS analizzati: {len(list(ROOT.rglob("*.css")))}')
print(f'URL sitemap: {len(locs) if "locs" in globals() else 0}')
if errors:
    print(f'ESITO: FAIL ({len(errors)} problemi)')
    for item in errors: print(' -', item)
    sys.exit(1)
print('ESITO: PASS — controlli statici superati')
