#!/usr/bin/env python3
"""Generate a static sitemap.xml for Zombie Bases."""

from __future__ import annotations

import json
from pathlib import Path
from xml.etree import ElementTree as ET

BASE_URL = "https://zombiebases.com"
REPO_ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = REPO_ROOT / "data" / "bases-index.json"
SITEMAP_PATH = REPO_ROOT / "sitemap.xml"


def iter_indexable_slugs() -> list[str]:
  with DATA_PATH.open("r", encoding="utf-8") as file:
    records = json.load(file)

  slugs = {((item.get("slug") or "").strip()) for item in records}
  slugs.discard("")
  return sorted(slugs)


def build_urls() -> list[str]:
  urls = [f"{BASE_URL}/"]
  urls.extend(f"{BASE_URL}/base.html?slug={slug}" for slug in iter_indexable_slugs())
  return urls


def write_sitemap(urls: list[str]) -> None:
  urlset = ET.Element("urlset", attrib={"xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9"})

  for url in urls:
    url_node = ET.SubElement(urlset, "url")
    location = ET.SubElement(url_node, "loc")
    location.text = url

  tree = ET.ElementTree(urlset)
  ET.indent(tree, space="  ")
  tree.write(SITEMAP_PATH, encoding="utf-8", xml_declaration=True)


if __name__ == "__main__":
  write_sitemap(build_urls())
  print(f"Wrote {SITEMAP_PATH.relative_to(REPO_ROOT)}")
