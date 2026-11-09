#!/usr/bin/env python3
from pathlib import Path
import re
ROOT = Path(__file__).resolve().parents[1]
errors = []
english_pages = list((ROOT / "en").rglob("*.html"))
for page in english_pages:
    text = page.read_text(encoding="utf-8")
    if "wa.me/393756052674?text=Ciao" in text:
        errors.append(f"{page.relative_to(ROOT)}: WhatsApp prefilled text is still Italian")
    if 'aria-label="Torna all’inizio della pagina"' in text:
        errors.append(f"{page.relative_to(ROOT)}: back-to-top label is still Italian")
if errors:
    print("FAIL — localization regressions found")
    print("\n".join(errors))
    raise SystemExit(1)
print(f"PASS — {len(english_pages)} English HTML pages checked for WhatsApp and back-to-top localization.")
