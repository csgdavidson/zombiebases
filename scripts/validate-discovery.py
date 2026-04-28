#!/usr/bin/env python3
"""Validate discovery data integrity and freshness."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import importlib.util

ROOT = Path(__file__).resolve().parents[1]
BASES_PATH = ROOT / "data" / "bases-index.json"
DISCOVERY_PATH = ROOT / "data" / "discovery.json"
GENERATOR_PATH = ROOT / "scripts" / "generate-discovery.py"


def load_generator_module():
    spec = importlib.util.spec_from_file_location("generate_discovery", GENERATOR_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load generate-discovery.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> int:
    bases = json.loads(BASES_PATH.read_text(encoding="utf-8"))
    discovery = json.loads(DISCOVERY_PATH.read_text(encoding="utf-8"))

    slug_set = {
        base.get("slug")
        for base in bases
        if isinstance(base, dict) and isinstance(base.get("slug"), str) and base.get("slug")
    }

    errors: list[str] = []

    similar_map = discovery.get("similarByBase", {})
    for slug, items in similar_map.items():
        if slug not in slug_set:
            errors.append(f"Unknown base in similarByBase: {slug}")
            continue
        seen: set[str] = set()
        for item in items or []:
            target = item.get("slug")
            if target not in slug_set:
                errors.append(f"Unknown similar slug '{target}' referenced by '{slug}'")
                continue
            if target == slug:
                errors.append(f"Base '{slug}' links to itself as similar")
            if target in seen:
                errors.append(f"Base '{slug}' has duplicate similar slug '{target}'")
            seen.add(target)

    scenarios = discovery.get("scenarios", {})
    for scenario_id, scenario in scenarios.items():
        for entry in scenario.get("entries", []):
            target = entry.get("slug")
            if target not in slug_set:
                errors.append(f"Scenario '{scenario_id}' references unknown slug '{target}'")

    module = load_generator_module()
    expected = module.build_payload()
    # Ignore generatedAt because it's timestamp-based.
    expected.pop("generatedAt", None)
    current = dict(discovery)
    current.pop("generatedAt", None)

    if current != expected:
        errors.append("data/discovery.json is out of date. Run: python3 scripts/generate-discovery.py")

    if errors:
        print("Discovery validation failed:")
        for message in errors:
            print(f"- {message}")
        return 1

    print("Discovery validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
