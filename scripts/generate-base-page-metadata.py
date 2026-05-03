#!/usr/bin/env python3
"""Sync static SEO metadata for generated base slug pages."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASES_PATH = ROOT / "data" / "bases-index.json"
PRODUCTION_ORIGIN = "https://zombiebases.com"
DESCRIPTION_LIMIT = 155


def _clean_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _trim_description(text: str, limit: int = DESCRIPTION_LIMIT) -> str:
    cleaned = _clean_whitespace(text)
    if len(cleaned) <= limit:
        return cleaned
    cutoff = cleaned.rfind(" ", 0, limit - 1)
    if cutoff < int(limit * 0.6):
        cutoff = limit - 1
    return f"{cleaned[:cutoff].rstrip(' ,;:.!?-')}…"


def _set_or_replace_tag(html: str, selector_pattern: str, replacement: str) -> str:
    pattern = re.compile(selector_pattern, flags=re.IGNORECASE)
    matches = list(pattern.finditer(html))
    if matches:
        first = matches[0]
        html = html[:first.start()] + replacement + html[first.end():]
        for match in reversed(matches[1:]):
            html = html[:match.start()] + html[match.end():]
        return html

    head_close = re.search(r"</head>", html, flags=re.IGNORECASE)
    if not head_close:
        return html
    return html[:head_close.start()] + f"  {replacement}\n" + html[head_close.start():]


def _sync_slug_page(page_path: Path, name: str, slug: str, summary: str) -> bool:
    source = page_path.read_text(encoding="utf-8")

    title = f"{name} Survival Base Analysis | Zombie Bases"
    description_template = f"{name} survival base analysis: evaluate strengths, weaknesses, defensibility, isolation, and long-term viability for real-world survival planning."
    description = _trim_description(description_template)
    canonical = f"{PRODUCTION_ORIGIN}/{slug}/"
    image = f"{PRODUCTION_ORIGIN}/images/bases/{slug}.png"

    updated = source
    updated = updated.replace('href="./index.html"', 'href="/"')
    updated = updated.replace('href="/index.html"', 'href="/"')
    updated = updated.replace('href="index.html"', 'href="/"')

    updated = _set_or_replace_tag(updated, r"<title>.*?</title>", f"<title>{title}</title>")
    updated = _set_or_replace_tag(updated, r"<meta\s+name=\"description\"\s+content=\"[^\"]*\"\s*/?>", f"<meta name=\"description\" content=\"{description}\">")
    updated = _set_or_replace_tag(updated, r"<link\s+rel=\"canonical\"\s+href=\"[^\"]*\"\s*/?>", f"<link rel=\"canonical\" href=\"{canonical}\">")
    updated = _set_or_replace_tag(updated, r"<meta\s+property=\"og:title\"\s+content=\"[^\"]*\"\s*/?>", f"<meta property=\"og:title\" content=\"{title}\">")
    updated = _set_or_replace_tag(updated, r"<meta\s+property=\"og:description\"\s+content=\"[^\"]*\"\s*/?>", f"<meta property=\"og:description\" content=\"{description}\">")
    updated = _set_or_replace_tag(updated, r"<meta\s+property=\"og:url\"\s+content=\"[^\"]*\"\s*/?>", f"<meta property=\"og:url\" content=\"{canonical}\">")
    updated = _set_or_replace_tag(updated, r"<meta\s+property=\"og:type\"\s+content=\"[^\"]*\"\s*/?>", '<meta property="og:type" content="article">')
    updated = _set_or_replace_tag(updated, r"<meta\s+property=\"og:image\"\s+content=\"[^\"]*\"\s*/?>", f"<meta property=\"og:image\" content=\"{image}\">")
    updated = _set_or_replace_tag(updated, r"<meta\s+name=\"twitter:card\"\s+content=\"[^\"]*\"\s*/?>", '<meta name="twitter:card" content="summary_large_image">')
    updated = _set_or_replace_tag(updated, r"<meta\s+name=\"twitter:title\"\s+content=\"[^\"]*\"\s*/?>", f"<meta name=\"twitter:title\" content=\"{title}\">")
    updated = _set_or_replace_tag(updated, r"<meta\s+name=\"twitter:description\"\s+content=\"[^\"]*\"\s*/?>", f"<meta name=\"twitter:description\" content=\"{description}\">")
    updated = _set_or_replace_tag(updated, r"<meta\s+name=\"twitter:image\"\s+content=\"[^\"]*\"\s*/?>", f"<meta name=\"twitter:image\" content=\"{image}\">")

    if updated == source:
        return False

    page_path.write_text(updated, encoding="utf-8")
    return True


def main() -> None:
    bases = json.loads(BASES_PATH.read_text(encoding="utf-8"))
    updated_count = 0
    seen_slugs: set[str] = set()

    for base in bases:
        if not isinstance(base, dict):
            continue
        slug = str(base.get("slug", "")).strip()
        name = str(base.get("name", "")).strip()
        summary = str((base.get("description") or {}).get("summary", "")).strip() if isinstance(base.get("description"), dict) else ""
        if not slug or not name:
            continue
        seen_slugs.add(slug)
        page_path = ROOT / slug / "index.html"
        if not page_path.exists():
            continue
        if _sync_slug_page(page_path, name=name, slug=slug, summary=summary):
            updated_count += 1

    print(f"Processed {len(seen_slugs)} base slugs; updated {updated_count} files.")


if __name__ == "__main__":
    main()
