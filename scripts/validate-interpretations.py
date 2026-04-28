#!/usr/bin/env python3
"""Validate interpretations data integrity and freshness."""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASES_PATH = ROOT / "data" / "bases-index.json"
INTERPRETATIONS_PATH = ROOT / "data" / "interpretations.json"
GENERATOR_PATH = ROOT / "scripts" / "generate-interpretations.py"
REQUIRED_FIELDS = {
    "slug",
    "scoreBandLabel",
    "scoreBandDescription",
    "scoreBandClass",
    "archetypeLabel",
    "archetypeDescription",
    "scoreShapeSummary",
}


def load_generator_module():
    spec = importlib.util.spec_from_file_location("generate_interpretations", GENERATOR_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load generate-interpretations.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> int:
    bases = json.loads(BASES_PATH.read_text(encoding="utf-8"))
    interpretations_payload = json.loads(INTERPRETATIONS_PATH.read_text(encoding="utf-8"))

    base_slugs = {
        base.get("slug")
        for base in bases
        if isinstance(base, dict) and isinstance(base.get("slug"), str) and base.get("slug")
    }

    errors: list[str] = []

    entries = interpretations_payload.get("interpretations")
    if not isinstance(entries, list):
        errors.append("interpretations.json is missing top-level 'interpretations' list")
        entries = []

    seen: set[str] = set()
    for entry in entries:
        if not isinstance(entry, dict):
            errors.append("interpretation entry is not an object")
            continue

        slug = entry.get("slug")
        if slug in seen:
            errors.append(f"Duplicate interpretation slug: {slug}")
        if slug not in base_slugs:
            errors.append(f"Unknown interpretation slug: {slug}")
        seen.add(slug)

        missing_fields = sorted(field for field in REQUIRED_FIELDS if not isinstance(entry.get(field), str) or not entry.get(field).strip())
        if missing_fields:
            errors.append(f"Interpretation '{slug}' missing required fields: {', '.join(missing_fields)}")

    missing_slugs = sorted(base_slugs - seen)
    if missing_slugs:
        errors.append(f"Missing interpretations for slugs: {', '.join(missing_slugs)}")

    module = load_generator_module()
    expected = module.build_payload()
    expected.pop("generatedAt", None)
    current = dict(interpretations_payload)
    current.pop("generatedAt", None)

    if current != expected:
        errors.append("data/interpretations.json is out of date. Run: python3 scripts/generate-interpretations.py")

    if errors:
        print("Interpretations validation failed:")
        for message in errors:
            print(f"- {message}")
        return 1

    print("Interpretations validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
