#!/usr/bin/env python3
"""Local, offline checks for PSAI V2.4 sections 5.1–5.5."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import json, re, sys, xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
BASE='https://cesareparatore.github.io'
errors=[]; notes=[]
def fail(s): errors.append(s)
class Scan(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True); self.meta={}; self.canonical=[]; self.alt={}; self.ld=[]; self.title=False; self.title_text=''; self.in_title=False
 def handle_starttag(self,t,a):
  a=dict(a)
  if t=='meta' and a.get('name'): self.meta.setdefault(a['name'].lower(),[]).append(a.get('content',''))
  if t=='link':
   rel=a.get('rel','').lower().split()
   if 'canonical' in rel: self.canonical.append(a.get('href',''))
   if 'alternate' in rel and a.get('hreflang'): self.alt[a['hreflang'].lower()]=a.get('href','')
  if t=='script' and a.get('type','').lower()=='application/ld+json': self.ld.append('')
  if t=='title': self.in_title=True; self.title_text=''
 def handle_endtag(self,t):
  if t=='script' and self.ld: pass
  if t=='title': self.in_title=False
 def handle_data(self,d):
  if self.in_title: self.title_text+=d
  # JSON-LD extraction handled separately from source for reliable block parsing.

# 5.1/5.3: robots meta and canonical/hreflang for indexable documents.
htmls=sorted(p for p in ROOT.rglob('*.html') if p.name!='google566527af11144f2c.html')
indexable=[]
for p in htmls:
 rel=p.relative_to(ROOT).as_posix(); src=p.read_text(encoding='utf-8'); q=Scan(); q.feed(src)
 if p.name=='404.html':
  if 'noindex' not in ','.join(q.meta.get('robots',[])).lower(): fail(f'{rel}: 404 senza noindex')
  continue
 indexable.append(rel)
 if len(q.meta.get('robots',[]))!=1: fail(f'{rel}: meta robots mancante o duplicato')
 elif not re.search(r'(^|,)\s*index\s*(,|$)',q.meta['robots'][0],re.I): fail(f'{rel}: meta robots non esplicita index')
 if len(q.canonical)!=1: fail(f'{rel}: canonical assente/duplicato')
 # Exact route from file structure.
 if rel=='index.html': route='/'
 elif rel=='en/index.html': route='/en/'
 elif rel.endswith('/index.html'): route='/'+rel[:-len('index.html')]
 else: route='/'+rel
 expected=BASE+route
 if q.canonical != [expected]: fail(f'{rel}: canonical non coerente ({q.canonical}; atteso {expected})')
 is_en=rel.startswith('en/')
 it_route=route[3:] if route.startswith('/en/') else ('/' if route=='/en/' else route)
 expected_alt={'it':BASE+it_route,'en':BASE+('/en/' if it_route=='/' else '/en'+it_route),'x-default':BASE+it_route}
 for k,v in expected_alt.items():
  if q.alt.get(k)!=v: fail(f'{rel}: hreflang {k} mancante/errato')
 blocks=re.findall(r'<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script\s*>',src,re.I|re.S)
 for b in blocks:
  try:
   obj=json.loads(b)
   if obj.get('@context')!='https://schema.org': fail(f'{rel}: JSON-LD senza context Schema.org')
   graph=obj.get('@graph',[obj])
   if not isinstance(graph,list): fail(f'{rel}: @graph non è un array'); continue
   for node in graph:
    if not isinstance(node,dict) or not node.get('@type'): fail(f'{rel}: nodo JSON-LD senza @type')
  except Exception as e: fail(f'{rel}: JSON-LD non valido ({e})')
 if not blocks: fail(f'{rel}: JSON-LD assente')
# 5.2: verify effective per-agent groups (not inherited from User-agent *).
robots=(ROOT/'robots.txt').read_text(encoding='utf-8')
groups={}; agents=[]; rules=[]
def flush_group():
 for agent in agents: groups.setdefault(agent,[]).extend(rules)
 agents.clear(); rules.clear()
for raw in robots.splitlines():
 line=raw.split('#',1)[0].strip()
 if not line:
  if agents and rules: flush_group()
  continue
 if ':' not in line: continue
 k,v=[x.strip() for x in line.split(':',1)]; k=k.lower()
 if k=='user-agent':
  if rules: flush_group()
  agents.append(v.lower())
 elif k in ('allow','disallow') and agents:
  rules.append((k,v))
flush_group()
required={'oai-searchbot':('allow','/'),'gptbot':('disallow','/'),'chatgpt-user':('allow','/'),'oai-adsbot':('disallow','/')}
for ua,rule in required.items():
 if rule not in groups.get(ua,[]): fail(f'robots.txt: regola {rule} assente per {ua}')
# 5.4: valid sitemap, unique URLs, exact set matching indexable HTML, canonical host only.
try:
 tree=ET.parse(ROOT/'sitemap.xml'); ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
 if tree.getroot().tag!='{http://www.sitemaps.org/schemas/sitemap/0.9}urlset': fail('sitemap.xml: root XML non valido')
 urls=[x.text or '' for x in tree.findall('.//s:loc',ns)]
 if len(urls)!=len(set(urls)): fail('sitemap.xml: URL duplicati')
 if any(not u.startswith(BASE+'/') for u in urls): fail('sitemap.xml: URL fuori dal dominio canonico GitHub Pages')
 expected=set()
 for rel in indexable:
  if rel=='index.html': route='/'
  elif rel=='en/index.html': route='/en/'
  elif rel.endswith('/index.html'): route='/'+rel[:-len('index.html')]
  else: route='/'+rel
  expected.add(BASE+route)
 if set(urls)!=expected:
  fail(f'sitemap.xml: differenza rispetto alle pagine HTML indicizzabili; mancanti={sorted(expected-set(urls))}; extra={sorted(set(urls)-expected)}')
except Exception as e: fail(f'sitemap.xml: parsing/controllo fallito ({e})')
# No CNAME or references to custom domain as canonical target.
if (ROOT/'CNAME').exists(): fail('CNAME presente: non coerente con il vincolo GitHub Pages canonico')
if errors:
 print(f'FAIL — {len(errors)} anomalia/e'); [print('- '+e) for e in errors]; sys.exit(1)
print(f'PASS — robots crawler, {len(indexable)} pagine indicizzabili, canonical/hreflang, JSON-LD, sitemap ({len(urls)} URL), noindex 404, dominio canonico.')
print('LIMITI — non verifica HTTP 200, scansione reale, indicizzazione, rich results, accessibilità runtime, policy/registri crawler o citazioni AI.')
