#!/usr/bin/env python3
"""Sync static OG/Twitter image metadata for base detail pages."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASES_PATH = ROOT / "data" / "bases-index.json"
PRODUCTION_ORIGIN = "https://zombiebases.com"
PLACEHOLDER_IMAGE = f"{PRODUCTION_ORIGIN}/images/bases/placeholder.png"

OG_PATTERN = re.compile(r'(<meta\s+property="og:image"\s+content=")([^"]+)("\s*>)')
TW_PATTERN = re.compile(r'(<meta\s+name="twitter:image"\s+content=")([^"]+)("\s*>)')


def _replace_meta(html: str, pattern: re.Pattern[str], image_url: str) -> str:
    return pattern.sub(lambda m: f"{m.group(1)}{image_url}{m.group(3)}", html, count=1)


def _sync_page(page_path: Path, image_url: str) -> bool:
    source = page_path.read_text(encoding="utf-8")
    updated = _replace_meta(source, OG_PATTERN, image_url)
    updated = _replace_meta(updated, TW_PATTERN, image_url)
    if updated == source:
        return False
    page_path.write_text(updated, encoding="utf-8")
    return True


def main() -> None:
    bases = json.loads(BASES_PATH.read_text(encoding="utf-8"))
    usable_slugs = {
        base.get("slug", "").strip()
        for base in bases
        if isinstance(base, dict) and isinstance(base.get("slug"), str)
    }
    usable_slugs.discard("")

    updated_count = 0
    for slug in sorted(usable_slugs):
        page_path = ROOT / slug / "index.html"
        if not page_path.exists():
            continue
        image_url = f"{PRODUCTION_ORIGIN}/images/bases/{slug}.png"
        if _sync_page(page_path, image_url):
            updated_count += 1

    # Explicitly keep non-base fallback template on placeholder image.
    _sync_page(ROOT / "base.html", PLACEHOLDER_IMAGE)

    print(f"Synced metadata for {len(usable_slugs)} base slugs; updated {updated_count} files.")


if __name__ == "__main__":
    main()
