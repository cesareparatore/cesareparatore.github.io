#!/usr/bin/env python3
"""Dependency-free static checks for this GitHub Pages site."""
from __future__ import annotations
import json
import html
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
        self.canonical_urls: list[str] = []
        self.alternate_urls: dict[str, str] = {}
        self.og_urls: list[str] = []
        self.doctype_count = 0
        self.duplicate_attrs: list[str] = []
        self.unsafe_blank_links: list[str] = []
        self.inline_handlers: list[str] = []
        self.stack: list[str] = []

    def handle_starttag(self, tag, attrs):
        names = [name.lower() for name, _ in attrs]
        duplicate_names = [name for name, count in Counter(names).items() if count > 1]
        self.duplicate_attrs.extend(duplicate_names)
        attrs = dict(attrs)
        self.stack.append(tag)
        if tag == 'html': self.document_lang = attrs.get('lang', '')
        if any(name.lower().startswith('on') for name in attrs):
            self.inline_handlers.extend(name for name in attrs if name.lower().startswith('on'))
        if tag == 'link':
            rel_values = attrs.get('rel', '').lower().split()
            if 'canonical' in rel_values:
                self.canonical_count += 1
                if attrs.get('href'): self.canonical_urls.append(attrs['href'])
            if 'alternate' in rel_values and attrs.get('hreflang') and attrs.get('href'):
                self.alternate_urls[attrs['hreflang'].lower()] = attrs['href']
        if tag == 'a' and attrs.get('target', '').lower() == '_blank':
            rel = set((attrs.get('rel') or '').lower().split())
            if not {'noopener', 'noreferrer'}.issubset(rel): self.unsafe_blank_links.append(attrs.get('href', '(href mancante)'))
        if 'id' in attrs: self.ids.append(attrs['id'])
        if tag == 'h1': self.h1_count += 1
        if tag == 'title': self.title_depth += 1; self.title_text = ''
        if tag == 'meta':
            key = attrs.get('name') or attrs.get('property')
            if key: self.meta_keys.append((key.lower(), attrs.get('content', '').strip()))
            if attrs.get('property', '').lower() == 'og:url' and attrs.get('content'):
                self.og_urls.append(attrs['content'].strip())
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

    def handle_decl(self, decl):
        if decl.strip().lower().startswith('doctype html'): self.doctype_count += 1

    def handle_data(self, data):
        if self.title_depth: self.title_text += data
        if self.jsonld_depth: self.jsonld_text += data


def fail(message: str): errors.append(message)

html_files = sorted(p for p in ROOT.rglob('*.html') if '.git' not in p.parts)
content_pages = [p for p in html_files if p.name != 'google566527af11144f2c.html']
parsers: dict[Path, PageParser] = {}

person_entity_ids: set[str] = set()

for page in html_files:
    try: text = page.read_text(encoding='utf-8')
    except Exception as exc:
        fail(f'{page.relative_to(ROOT)}: lettura UTF-8 fallita: {exc}'); continue
    parser = PageParser()
    try: parser.feed(text); parser.close()
    except Exception as exc: fail(f'{page.relative_to(ROOT)}: parsing HTML fallito: {exc}')
    parsers[page] = parser
    if page.name == 'google566527af11144f2c.html': continue
    if parser.doctype_count != 1: fail(f'{page.relative_to(ROOT)}: atteso un solo DOCTYPE HTML5, trovati {parser.doctype_count}')
    if parser.duplicate_attrs: fail(f'{page.relative_to(ROOT)}: attributi HTML duplicati: {", ".join(sorted(set(parser.duplicate_attrs)))}')
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
    theme_colors = [value.lower() for key, value in parser.meta_keys if key == 'theme-color']
    if theme_colors != ['#f2f0ea']:
        fail(f'{rel}: theme-color non coerente; atteso #f2f0ea, trovato {theme_colors}')
    if 'class="brand-mark"' in text and not re.search(r'class="brand-mark"><img alt="" src="[^"]*cp-mark\.svg"', text):
        fail(f'{rel}: il marchio interno deve usare il monogramma SVG condiviso')
    if len([x for x in parser.meta_keys if x[0] == 'description' and x[1]]) != 1:
        fail(f'{rel}: meta description mancante, vuota o duplicata')
    # Canonical, language and reciprocal alternate URLs for indexable locale pages.
    if page.name != '404.html':
        rel_path = page.relative_to(ROOT)
        is_english = rel_path.parts[0] == 'en'
        if rel_path.as_posix() == 'index.html': route = '/'
        elif is_english and rel_path.as_posix() == 'en/index.html': route = '/en/'
        elif page.name == 'index.html': route = '/' + '/'.join(rel_path.parts[:-1]) + '/'
        else: route = '/' + rel_path.as_posix()
        expected_url = 'https://cesareparatore.github.io' + route
        expected_lang = 'en' if is_english else 'it'
        if parser.document_lang.lower() != expected_lang:
            fail(f'{rel_path}: lang="{parser.document_lang}" non coerente con la route (atteso {expected_lang})')
        if parser.canonical_urls != [expected_url]:
            fail(f'{rel_path}: canonical non coerente; atteso {expected_url}, trovato {parser.canonical_urls}')
        if parser.og_urls != [expected_url]:
            fail(f'{rel_path}: og:url non coerente; atteso {expected_url}, trovato {parser.og_urls}')
        it_route = route[3:] if is_english and route.startswith('/en/') else ('/' if is_english and route == '/en/' else route)
        if not it_route.startswith('/'): it_route = '/' + it_route
        en_route = '/en/' if it_route == '/' else '/en' + it_route
        expected_alternates = {
            'it': 'https://cesareparatore.github.io' + it_route,
            'en': 'https://cesareparatore.github.io' + en_route,
            'x-default': 'https://cesareparatore.github.io' + it_route,
        }
        for language, url in expected_alternates.items():
            if parser.alternate_urls.get(language) != url:
                fail(f'{rel_path}: hreflang {language} mancante/errato; atteso {url}, trovato {parser.alternate_urls.get(language)}')
    for src in parser.img_missing_alt: fail(f'{rel}: immagine senza attributo alt: {src}')
    for block in parser.jsonld_blocks:
        try:
            data = json.loads(block)
            nodes = data.get("@graph", []) if isinstance(data, dict) else []
            if isinstance(data, dict) and data.get("@type") == "Person": nodes = [data]
            for node in nodes:
                if isinstance(node, dict) and node.get("@type") == "Person" and node.get("@id"):
                    person_entity_ids.add(node["@id"])
        except Exception as exc: fail(f'{rel}: JSON-LD non valido: {exc}')

if person_entity_ids != {"https://cesareparatore.github.io/#cesare-paratore"}:
    fail(f"JSON-LD: riferimento Person non coerente tra le pagine: {sorted(person_entity_ids)}")

# The geographic coverage must be present in crawlable HTML on both home and territory pages.
required_towns = [
    "Borgetto", "Giardinello", "Montelepre", "Trappeto", "Balestrate", "Terrasini",
    "Cinisi", "Torretta", "San Giuseppe Jato", "San Cipirello", "Piana degli Albanesi",
    "Altofonte", "Camporeale", "Carini", "Monreale", "Alcamo", "Castellammare del Golfo"
]
for rel_path in ["index.html", "dove-sono/index.html", "en/index.html", "en/dove-sono/index.html"]:
    source = (ROOT / rel_path).read_text(encoding="utf-8")
    source_without_code = re.sub(r"<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>", " ", source, flags=re.I | re.S)
    visible_text = html.unescape(re.sub(r"<[^>]+>", " ", source_without_code))
    missing_towns = [town for town in required_towns if town.casefold() not in visible_text.casefold()]
    if missing_towns:
        fail(f"{rel_path}: comuni target mancanti dal contenuto HTML statico: {', '.join(missing_towns)}")

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
    if len(locs) != len(set(locs)): fail('sitemap.xml: URL duplicati')
    expected_locs = set()
    for page in content_pages:
        if page.name == '404.html': continue
        rel_path = page.relative_to(ROOT)
        if rel_path.as_posix() == 'index.html': route = '/'
        elif rel_path.parts[0] == 'en' and rel_path.as_posix() == 'en/index.html': route = '/en/'
        elif rel_path.parts[0] == 'en': route = '/en/' + '/'.join(rel_path.parts[1:-1]) + '/'
        elif page.name == 'index.html': route = '/' + '/'.join(rel_path.parts[:-1]) + '/'
        else: route = '/' + rel_path.as_posix()
        expected_locs.add('https://cesareparatore.github.io' + route)
    if set(locs) != expected_locs:
        fail(f'sitemap.xml: URL non coerenti con le pagine indicizzabili (mancanti={sorted(expected_locs-set(locs))}; extra={sorted(set(locs)-expected_locs)})')
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

# Keyboard focus must remain explicitly visible in both visual systems.
for css_path in [ROOT / 'css/style.css', ROOT / 'assets/interior.css']:
    css_text = css_path.read_text(encoding='utf-8')
    if ':focus-visible' not in css_text or 'outline:3px solid #26350f!important' not in css_text:
        fail(f'{css_path.relative_to(ROOT)}: indicatore di focus tastiera ad alto contrasto mancante')

# Required publishing assets.
for required in ['index.html','404.html','robots.txt','sitemap.xml','assets/interior.css','assets/interior.js','assets/404.js','css/style.css','js/script.js']:
    if not (ROOT / required).exists(): fail(f'file richiesto mancante: {required}')

print(f'Pagine HTML analizzate: {len(content_pages)} contenuto + verifica Google')
print(f'File CSS analizzati: {len(list(ROOT.rglob("*.css")))}')
print(f'URL sitemap: {len(locs) if "locs" in globals() else 0}')
if errors:
    print(f'ESITO: FAIL ({len(errors)} problemi)')
    for item in errors: print(' -', item)
    sys.exit(1)
print('ESITO: PASS — controlli statici superati')
