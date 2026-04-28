#!/usr/bin/env python3
"""Generate aggregate scoring statistics for Zombie Bases."""

from __future__ import annotations

import json
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASES_PATH = ROOT / "data" / "bases-index.json"
OUTPUT_PATH = ROOT / "data" / "base-stats.json"
CATEGORIES = ("defensibility", "isolation", "sustainability")
ALL_SCORE_KEYS = ("overall", *CATEGORIES)


def is_number(value: object) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def get_numeric_scores(base: dict) -> dict[str, float]:
    categories = base.get("scores", {}).get("categories", {})
    scores: dict[str, float] = {}

    overall = base.get("scores", {}).get("overall")
    if is_number(overall):
        scores["overall"] = float(overall)

    for key in CATEGORIES:
        value = categories.get(key)
        if is_number(value):
            scores[key] = float(value)

    return scores


def init_bucket() -> dict:
    return {
        "count": 0,
        "totals": {key: 0.0 for key in ALL_SCORE_KEYS},
        "counts": {key: 0 for key in ALL_SCORE_KEYS},
        "highest": None,
        "lowest": None,
    }


def update_bucket(bucket: dict, base: dict, scores: dict[str, float]) -> None:
    bucket["count"] += 1

    for key in ALL_SCORE_KEYS:
        if key in scores:
            bucket["totals"][key] += scores[key]
            bucket["counts"][key] += 1

    overall = scores.get("overall")
    if overall is None:
        return

    candidate = {"slug": base["slug"], "name": base["name"], "overall": round(overall, 2)}
    if bucket["highest"] is None or overall > bucket["highest"]["overall"]:
        bucket["highest"] = candidate
    if bucket["lowest"] is None or overall < bucket["lowest"]["overall"]:
        bucket["lowest"] = candidate


def finalize_bucket(bucket: dict) -> dict:
    averages: dict[str, float | None] = {}
    for key in ALL_SCORE_KEYS:
        count = bucket["counts"][key]
        averages[key] = round(bucket["totals"][key] / count, 2) if count else None

    return {
        "count": bucket["count"],
        "averages": averages,
        "highest": bucket["highest"],
        "lowest": bucket["lowest"],
    }


def main() -> None:
    bases = json.loads(BASES_PATH.read_text(encoding="utf-8"))

    global_bucket = init_bucket()
    region_buckets: dict[str, dict] = defaultdict(init_bucket)
    type_buckets: dict[str, dict] = defaultdict(init_bucket)

    for base in bases:
        if not isinstance(base, dict):
            continue

        slug = base.get("slug")
        name = base.get("name")
        region = base.get("region")
        base_type = base.get("type")
        if not all(isinstance(value, str) and value for value in (slug, name, region, base_type)):
            continue

        scores = get_numeric_scores(base)
        update_bucket(global_bucket, base, scores)
        update_bucket(region_buckets[region], base, scores)
        update_bucket(type_buckets[base_type], base, scores)

    output = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "totalBases": finalize_bucket(global_bucket)["count"],
        "scoreCategories": list(ALL_SCORE_KEYS),
        "global": finalize_bucket(global_bucket),
        "byRegion": {region: finalize_bucket(bucket) for region, bucket in sorted(region_buckets.items())},
        "byType": {base_type: finalize_bucket(bucket) for base_type, bucket in sorted(type_buckets.items())},
    }

    OUTPUT_PATH.write_text(f"{json.dumps(output, indent=2)}\n", encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
