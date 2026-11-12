#!/usr/bin/env python3
"""Static regression checks for the bilingual privacy notices."""
from pathlib import Path
import re
ROOT = Path(__file__).resolve().parents[1]
PAGES = {
    "it": ROOT / "privacy" / "index.html",
    "en": ROOT / "en" / "privacy" / "index.html",
}
REQUIRED = {
    "it": [
        "Cesare Paratore", "info@cesareparatore.it", "GitHub Pages", "OVHcloud",
        "WhatsApp", "art. 9 GDPR", "I tuoi diritti", "cancellati",
        "categorie particolari", "12 novembre 2026",
    ],
    "en": [
        "Cesare Paratore", "info@cesareparatore.it", "GitHub Pages", "OVHcloud",
        "WhatsApp", "Article 9 GDPR", "Your rights", "deleted",
        "special-category data", "12 November 2026",
    ],
}
FORBIDDEN = [
    "Before this notice is finalised, the controller’s full identifying details",
    "must be verified before final publication",
    "Lorem ipsum",
]
failed = False
for lang, path in PAGES.items():
    text = path.read_text(encoding="utf-8")
    for item in REQUIRED[lang]:
        if item.lower() not in text.lower():
            print(f"FAIL {lang}: missing {item!r}")
            failed = True
    for item in FORBIDDEN:
        if item.lower() in text.lower():
            print(f"FAIL {lang}: stale placeholder {item!r}")
            failed = True
    if re.search(r"<form\b", text, re.I):
        print(f"FAIL {lang}: unexpected form in privacy page")
        failed = True
if failed:
    raise SystemExit(1)
print("PASS — informative IT/EN presenti, email/titolare/provider/canali/diritti e avvertenza dati sanitari verificati; nessun placeholder legacy.")
