#!/usr/bin/env python3
"""Generate ranking slices for Zombie Bases."""

from __future__ import annotations

import json
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASES_PATH = ROOT / "data" / "bases-index.json"
OUTPUT_PATH = ROOT / "data" / "rankings.json"


def is_number(value: object) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def get_summary(base: dict) -> str:
    summary = base.get("summary")
    if isinstance(summary, str) and summary.strip():
        return summary.strip()

    description_summary = base.get("description", {}).get("summary")
    if isinstance(description_summary, str) and description_summary.strip():
        return description_summary.strip()

    return ""


def get_rank_entries(bases: list[dict], total_for_percentile: int) -> list[dict]:
    sorted_bases = sorted(
        bases,
        key=lambda base: (-float(base["scores"]["overall"]), base["name"])
    )

    ranked: list[dict] = []
    for index, base in enumerate(sorted_bases):
        rank = index + 1
        percentile = (rank / total_for_percentile) * 100
        ranked.append({
            "slug": base["slug"],
            "name": base["name"],
            "region": base["region"],
            "type": base["type"],
            "summary": get_summary(base),
            "overall": round(float(base["scores"]["overall"]), 2),
            "rank": rank,
            "percentile": round(percentile, 2),
        })

    return ranked


def main() -> None:
    raw_bases = json.loads(BASES_PATH.read_text(encoding="utf-8"))

    eligible_bases: list[dict] = []
    for base in raw_bases:
        if not isinstance(base, dict):
            continue

        required_string_fields = ("slug", "name", "region", "type")
        if not all(isinstance(base.get(field), str) and base[field] for field in required_string_fields):
            continue

        overall = base.get("scores", {}).get("overall")
        if not is_number(overall):
            continue

        eligible_bases.append(base)

    total_bases = len(eligible_bases)

    by_region_source: dict[str, list[dict]] = defaultdict(list)
    by_type_source: dict[str, list[dict]] = defaultdict(list)

    for base in eligible_bases:
        by_region_source[base["region"]].append(base)
        by_type_source[base["type"]].append(base)

    global_rankings = get_rank_entries(eligible_bases, total_bases)
    by_region = {
        region: get_rank_entries(group, len(group))
        for region, group in sorted(by_region_source.items())
    }
    by_type = {
        base_type: get_rank_entries(group, len(group))
        for base_type, group in sorted(by_type_source.items())
    }

    top_by_region = {
        region: rankings[:3]
        for region, rankings in by_region.items()
    }
    top_by_type = {
        base_type: rankings[:3]
        for base_type, rankings in by_type.items()
    }

    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "totalBases": total_bases,
        "global": global_rankings,
        "byRegion": by_region,
        "byType": by_type,
        "highlights": {
            "topByRegion": top_by_region,
            "topByType": top_by_type,
        }
    }

    OUTPUT_PATH.write_text(f"{json.dumps(payload, indent=2)}\n", encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
