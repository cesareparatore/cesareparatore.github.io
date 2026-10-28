#!/usr/bin/env python3
"""Regression check for the Italian/English Chi sono pages; standard library only."""
from html.parser import HTMLParser
from pathlib import Path
import sys
ROOT = Path(__file__).resolve().parents[1]
class Scan(HTMLParser):
    def __init__(self):
        super().__init__(); self.items=[]; self.lang=''; self.canonical=[]; self.alternates={}; self.title_depth=0; self.title=''
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='html': self.lang=a.get('lang','')
        if 'data-it' in a and 'data-en' in a: self.items.append((tag,a['data-it'],a['data-en']))
        if tag=='link' and 'canonical' in a.get('rel','').split(): self.canonical.append(a.get('href',''))
        if tag=='link' and 'alternate' in a.get('rel','').split() and a.get('hreflang'): self.alternates[a['hreflang']]=a.get('href','')
        if tag=='title': self.title_depth+=1
    def handle_endtag(self,tag):
        if tag=='title' and self.title_depth: self.title_depth-=1
    def handle_data(self,data):
        if self.title_depth: self.title+=data

def load(path):
    p=Scan(); p.feed(path.read_text(encoding='utf-8')); return p
it=load(ROOT/'chi-sono/index.html'); en=load(ROOT/'en/chi-sono/index.html')
errors=[]
if it.lang!='it': errors.append(f'IT html lang atteso it, trovato {it.lang!r}')
if en.lang!='en': errors.append(f'EN html lang atteso en, trovato {en.lang!r}')
if len(it.items)!=len(en.items): errors.append(f'numero elementi traducibili diverso: IT {len(it.items)}, EN {len(en.items)}')
for i,(a,b) in enumerate(zip(it.items,en.items)):
    if a[0]!=b[0]: errors.append(f'elemento {i}: tag differente {a[0]} / {b[0]}')
    if a[1]!=b[1]: errors.append(f'elemento {i}: data-it non coerente fra pagine')
    if a[2]!=b[2]: errors.append(f'elemento {i}: data-en non coerente fra pagine')
base='https://cesareparatore.github.io'
for parser,route in ((it,'/chi-sono/'),(en,'/en/chi-sono/')):
    if parser.canonical != [base+route]: errors.append(f'canonical errato per {route}: {parser.canonical}')
    expected={'it':base+'/chi-sono/','en':base+'/en/chi-sono/','x-default':base+'/chi-sono/'}
    for key,value in expected.items():
        if parser.alternates.get(key)!=value: errors.append(f'hreflang {key} errato per {route}')
if errors:
    print('FAIL — controllo localizzazione Chi sono')
    print('\n'.join('- '+e for e in errors)); sys.exit(1)
print(f'PASS — {len(it.items)} coppie IT/EN coerenti; lang, canonical e hreflang verificati.')
