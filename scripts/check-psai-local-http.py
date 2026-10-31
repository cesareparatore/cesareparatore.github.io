#!/usr/bin/env python3
"""HTTP smoke test of the static site using a temporary loopback server only."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.error import HTTPError
from urllib.request import urlopen
import os
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass

handler = partial(QuietHandler, directory=str(ROOT))
server = ThreadingHTTPServer(('127.0.0.1', 0), handler)
thread = Thread(target=server.serve_forever, daemon=True)
thread.start()
base = f'http://127.0.0.1:{server.server_port}'
errors = []
def get(path, expected=200):
    try:
        with urlopen(base + path, timeout=4) as response:
            body = response.read()
            if response.status != expected:
                errors.append(f'{path}: HTTP {response.status}, atteso {expected}')
            return body
    except HTTPError as exc:
        if exc.code != expected:
            errors.append(f'{path}: HTTP {exc.code}, atteso {expected}')
        return exc.read()
    except Exception as exc:
        errors.append(f'{path}: {type(exc).__name__}: {exc}')
        return b''

try:
    html_files = sorted(p for p in ROOT.rglob('index.html'))
    routes = []
    for p in html_files:
        rel = p.parent.relative_to(ROOT).as_posix()
        routes.append('/' if rel == '.' else '/' + rel + '/')
    for route in routes:
        body = get(route)
        if b'<html' not in body.lower():
            errors.append(f'{route}: risposta non HTML')
    robots = get('/robots.txt').decode('utf-8', 'replace')
    sitemap_raw = get('/sitemap.xml')
    sitemap = ET.fromstring(sitemap_raw)
    sitemap_urls = sitemap.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')
    if len(sitemap_urls) != 20:
        errors.append(f'sitemap HTTP: {len(sitemap_urls)} URL, attesi 20')
    if 'OAI-SearchBot' not in robots or 'GPTBot' not in robots or 'ChatGPT-User' not in robots or 'OAI-AdsBot' not in robots:
        errors.append('robots.txt servito localmente: uno o più user-agent mancanti')
    not_found = get('/__psai_route_that_does_not_exist__', expected=404)
    if not not_found:
        errors.append('route inesistente: corpo 404 vuoto')
    error_page = get('/404.html')
    if b'noindex' not in error_page.lower():
        errors.append('404.html: direttiva noindex assente nella risposta HTTP')
finally:
    server.shutdown()
    server.server_close()
    thread.join(timeout=2)

if errors:
    print(f'FAIL — {len(errors)} anomalia/e')
    for error in errors:
        print('- ' + error)
    raise SystemExit(1)
print(f'PASS — HTTP locale loopback: {len(routes)} route HTML (HTTP 200), robots.txt, sitemap.xml (20 URL), 404 reale (HTTP 404) e pagina 404 noindex.')
print('AMBITO — server temporaneo 127.0.0.1; nessuna richiesta al dominio pubblico o a servizi esterni.')
