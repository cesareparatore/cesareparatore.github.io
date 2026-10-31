#!/usr/bin/env python3
"""Static HTML structure/accessibility smoke checks; not a WCAG conformance audit."""
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
class Document(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.lang = None; self.title = ''; self.in_title = False
        self.h1 = 0; self.main = 0; self.images = []; self.controls = []
        self.labels = {}; self.label_stack = []; self.active_text = []
        self.ids = set()
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'html': self.lang = a.get('lang')
        if a.get('id'): self.ids.add(a['id'])
        if tag == 'title': self.in_title = True
        if tag == 'h1': self.h1 += 1
        if tag == 'main': self.main += 1
        if tag == 'img': self.images.append(a.get('alt'))
        if tag == 'label': self.label_stack.append((a.get('for'), []))
        if tag in ('a','button','input','select','textarea') and a.get('aria-hidden') != 'true':
            rec = {'tag':tag,'attrs':a,'text':[]}
            self.controls.append(rec)
            self.active_text.append(rec)
        if tag in VOID: self._close_void(tag)
    def _close_void(self, tag):
        if tag == 'input':
            # input controls are evaluated after the complete document is parsed.
            pass
    def handle_endtag(self, tag):
        if tag == 'title': self.in_title = False
        if tag == 'label' and self.label_stack:
            key, parts = self.label_stack.pop()
            if key: self.labels.setdefault(key, []).append(' '.join(parts).strip())
        if tag in ('a','button','input','select','textarea'):
            for i in range(len(self.active_text)-1, -1, -1):
                if self.active_text[i]['tag'] == tag:
                    self.active_text.pop(i); break
    def handle_data(self, data):
        if self.in_title: self.title += data
        for rec in self.active_text: rec['text'].append(data)
        for _, parts in self.label_stack: parts.append(data)

def audit(path):
    parser = Document(); parser.feed(path.read_text(encoding='utf-8'))
    rel = path.relative_to(ROOT).as_posix(); issues=[]
    if not parser.lang: issues.append('lang assente')
    if not parser.title.strip(): issues.append('title assente')
    if parser.h1 != 1: issues.append(f'H1={parser.h1}, atteso 1')
    if parser.main != 1: issues.append(f'main={parser.main}, atteso 1')
    if any(alt is None for alt in parser.images): issues.append('img senza attributo alt')
    for rec in parser.controls:
        a=rec['attrs']; text=' '.join(rec['text']).strip()
        name=' '.join(x for x in (a.get('aria-label',''), a.get('title',''), text, a.get('value','')) if x).strip()
        if a.get('aria-labelledby'):
            name = name or ' '.join(a.get('aria-labelledby','').split())
        if rec['tag'] in ('input','select','textarea') and a.get('id'):
            name = name or ' '.join(parser.labels.get(a['id'],[])).strip()
        if rec['tag']=='a' and not name:
            # Image links can use the alternative text of their child image.
            name = 'image-alt' if 'img' in text else ''
        if not name: issues.append(f'{rec["tag"]} senza nome accessibile')
    return rel, issues

files=sorted(p for p in ROOT.rglob('*.html') if p.name!='google566527af11144f2c.html')
all_issues=[]
for path in files:
    rel, issues=audit(path)
    all_issues.extend(f'{rel}: {issue}' for issue in issues)
if all_issues:
    print(f'FAIL — {len(all_issues)} anomalia/e')
    for issue in all_issues: print('- '+issue)
    raise SystemExit(1)
print(f'PASS — struttura statica verificata su {len(files)} documenti HTML: lang, title, H1, main, alt immagini e nomi accessibili di link/controlli.')
print('LIMITE — non è un audit WCAG 2.2; non misura contrasto, tastiera, focus, reflow, screen reader o comportamento runtime.')
