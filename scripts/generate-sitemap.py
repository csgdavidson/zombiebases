#!/usr/bin/env python3
"""Generate sitemap.xml for Zombie Bases."""

from __future__ import annotations

import json
import subprocess
from dataclasses import dataclass
from pathlib import Path
from xml.etree import ElementTree as ET

BASE_URL = "https://zombiebases.com"
REPO_ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = REPO_ROOT / "data" / "bases-index.json"
SITEMAP_PATH = REPO_ROOT / "sitemap.xml"


@dataclass(frozen=True)
class SitemapEntry:
  loc: str
  source_path: Path


def git_lastmod(path: Path) -> str | None:
  try:
    result = subprocess.run(
      ["git", "log", "-1", "--format=%cI", "--", str(path.relative_to(REPO_ROOT))],
      cwd=REPO_ROOT,
      check=False,
      capture_output=True,
      text=True,
    )
  except OSError:
    return None

  if result.returncode != 0:
    return None

  value = result.stdout.strip()
  return value or None


def iter_indexable_slugs() -> list[str]:
  with DATA_PATH.open("r", encoding="utf-8") as file:
    records = json.load(file)

  slugs = {((item.get("slug") or "").strip()) for item in records}
  slugs.discard("")
  return sorted(slugs)


def build_entries() -> list[SitemapEntry]:
  entries: list[SitemapEntry] = [
    SitemapEntry(loc=f"{BASE_URL}/", source_path=REPO_ROOT / "index.html"),
    SitemapEntry(loc=f"{BASE_URL}/rankings.html", source_path=REPO_ROOT / "rankings.html"),
    SitemapEntry(loc=f"{BASE_URL}/rankings-region.html", source_path=REPO_ROOT / "rankings-region.html"),
    SitemapEntry(loc=f"{BASE_URL}/rankings-type.html", source_path=REPO_ROOT / "rankings-type.html"),
    SitemapEntry(loc=f"{BASE_URL}/scenarios.html", source_path=REPO_ROOT / "scenarios.html"),
  ]

  entries.extend(
    SitemapEntry(
      loc=f"{BASE_URL}/{slug}",
      source_path=DATA_PATH,
    )
    for slug in iter_indexable_slugs()
  )

  return entries


def write_sitemap(entries: list[SitemapEntry]) -> None:
  urlset = ET.Element("urlset", attrib={"xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9"})

  for entry in entries:
    url_node = ET.SubElement(urlset, "url")
    location = ET.SubElement(url_node, "loc")
    location.text = entry.loc

    lastmod = git_lastmod(entry.source_path)
    if lastmod:
      lastmod_node = ET.SubElement(url_node, "lastmod")
      lastmod_node.text = lastmod

  tree = ET.ElementTree(urlset)
  ET.indent(tree, space="  ")
  tree.write(SITEMAP_PATH, encoding="utf-8", xml_declaration=True)


if __name__ == "__main__":
  sitemap_entries = build_entries()
  write_sitemap(sitemap_entries)
  print(f"Wrote {SITEMAP_PATH.relative_to(REPO_ROOT)} with {len(sitemap_entries)} URLs")
