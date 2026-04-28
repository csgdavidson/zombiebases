#!/usr/bin/env python3
"""Generate discovery data for similar bases and survival scenarios."""

from __future__ import annotations

import hashlib
import json
import math
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASES_PATH = ROOT / "data" / "bases-index.json"
OUTPUT_PATH = ROOT / "data" / "discovery.json"

SCORE_KEYS = ("defensibility", "isolation", "sustainability")
PROFILE_KEYS = ("defensibility", "isolation", "sustainability", "overall")
SIMILAR_COUNT = 5
SCENARIO_LIMIT = 25

SCENARIO_CONFIG = {
    "long_term_survival": {
        "title": "Best long-term survival bases",
        "description": "Optimized for long-term viability: strong sustainability and overall resilience, while avoiding very low-isolation options.",
    },
    "short_term_refuge": {
        "title": "Best short-term refuges",
        "description": "Prioritizes immediate safety with high defensibility and isolation. Overall score matters less than fast protection.",
    },
    "community_bases": {
        "title": "Best community bases",
        "description": "Favors sustainable bases with workable infrastructure and access for group survival, while avoiding extreme isolation trade-offs.",
    },
    "high_risk_high_reward": {
        "title": "Highest risk / highest reward",
        "description": "Highlights high-overall bases with major strengths and notable weak spots—high upside with sharp trade-offs.",
    },
    "worst_bases": {
        "title": "Worst bases",
        "description": "Ranks bases with weak overall performance, especially where defensibility or sustainability are underpowered.",
    },
}


def is_number(value: object) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def load_bases() -> list[dict]:
    raw = json.loads(BASES_PATH.read_text(encoding="utf-8"))
    valid: list[dict] = []

    for base in raw:
        if not isinstance(base, dict):
            continue

        if not all(isinstance(base.get(field), str) and base[field].strip() for field in ("slug", "name", "region", "type")):
            continue

        overall = base.get("scores", {}).get("overall")
        categories = base.get("scores", {}).get("categories", {})
        if not is_number(overall):
            continue
        if not all(is_number(categories.get(key)) for key in SCORE_KEYS):
            continue

        valid.append(base)

    return valid


def score_profile(base: dict) -> dict[str, float]:
    categories = base["scores"]["categories"]
    return {
        "defensibility": float(categories["defensibility"]),
        "isolation": float(categories["isolation"]),
        "sustainability": float(categories["sustainability"]),
        "overall": float(base["scores"]["overall"]),
    }


def profile_distance(a: dict[str, float], b: dict[str, float]) -> float:
    return math.sqrt(sum((a[key] - b[key]) ** 2 for key in PROFILE_KEYS))


def as_base_entry(base: dict) -> dict:
    return {
        "slug": base["slug"],
        "name": base["name"],
        "region": base["region"],
        "type": base["type"],
        "overall": round(float(base["scores"]["overall"]), 2),
    }


def similar_reason(source: dict[str, float], other: dict[str, float]) -> str:
    diffs = {key: other[key] - source[key] for key in SCORE_KEYS}
    ordered = sorted(diffs.items(), key=lambda item: abs(item[1]), reverse=True)

    close_dims = [key for key in SCORE_KEYS if abs(diffs[key]) <= 0.8]
    if len(close_dims) >= 2:
        first, second = close_dims[:2]
        return f"Comparable {first} and {second}."

    dim, delta = ordered[0]
    if delta >= 1.0:
        return f"Similar profile with stronger {dim}."
    if delta <= -1.0:
        return f"Similar profile with weaker {dim}."

    strongest = max(other, key=other.get)
    weakest = min(other, key=other.get)
    return f"Similar {strongest}-to-{weakest} trade-off."


def build_similar_bases(bases: list[dict]) -> dict[str, list[dict]]:
    by_slug = {base["slug"]: base for base in bases}
    profiles = {slug: score_profile(base) for slug, base in by_slug.items()}
    similar: dict[str, list[dict]] = {}

    for slug, base in by_slug.items():
        source_profile = profiles[slug]
        candidates: list[tuple[float, dict]] = []

        for candidate_slug, candidate in by_slug.items():
            if candidate_slug == slug:
                continue
            distance = profile_distance(source_profile, profiles[candidate_slug])
            candidates.append((distance, candidate))

        candidates.sort(key=lambda item: (item[0], item[1]["name"]))

        selected: list[tuple[float, dict]] = []
        seen_regions: set[str] = set()
        seen_types: set[str] = set()

        for distance, candidate in candidates:
            if len(selected) >= SIMILAR_COUNT:
                break

            needs_variety = len(selected) >= 2
            is_new_cluster = candidate["region"] not in seen_regions or candidate["type"] not in seen_types
            if needs_variety and not is_new_cluster:
                relaxed_cutoff = selected[-1][0] + 0.4 if selected else distance
                if distance > relaxed_cutoff:
                    continue

            selected.append((distance, candidate))
            seen_regions.add(candidate["region"])
            seen_types.add(candidate["type"])

        if len(selected) < 3:
            selected = candidates[:3]

        similar[slug] = [
            {
                **as_base_entry(candidate),
                "reason": similar_reason(source_profile, profiles[candidate["slug"]]),
            }
            for _, candidate in selected[:SIMILAR_COUNT]
        ]

    return similar


def scenario_scores(profile: dict[str, float]) -> dict[str, float]:
    defensibility = profile["defensibility"]
    isolation = profile["isolation"]
    sustainability = profile["sustainability"]
    overall = profile["overall"]

    spread = max(defensibility, isolation, sustainability) - min(defensibility, isolation, sustainability)
    access_score = 10 - isolation

    # Deterministic weighted formulas used for static scenario rankings.
    return {
        "long_term_survival": sustainability * 0.55 + overall * 0.3 + isolation * 0.2 - max(0, 3.0 - isolation) * 0.8,
        "short_term_refuge": defensibility * 0.5 + isolation * 0.4 + overall * 0.1,
        "community_bases": sustainability * 0.5 + overall * 0.25 + access_score * 0.25 - max(0, isolation - 8.5) * 0.35,
        "high_risk_high_reward": overall * 0.65 + spread * 0.7,
        "worst_bases": (10 - overall) * 0.6 + max(0, 6 - defensibility) * 0.2 + max(0, 6 - sustainability) * 0.2,
    }


def scenario_reason(base: dict, scenario_id: str, profile: dict[str, float]) -> str:
    defn = profile["defensibility"]
    iso = profile["isolation"]
    sus = profile["sustainability"]
    overall = profile["overall"]
    spread = max(defn, iso, sus) - min(defn, iso, sus)

    if scenario_id == "long_term_survival":
        return f"Strong sustainability ({sus:.1f}) with steady overall resilience ({overall:.1f})."
    if scenario_id == "short_term_refuge":
        return f"Fast-safety profile: defensibility {defn:.1f} and isolation {iso:.1f}."
    if scenario_id == "community_bases":
        return f"Balanced for groups with sustainability {sus:.1f} and workable access."
    if scenario_id == "high_risk_high_reward":
        return f"High upside ({overall:.1f} overall) with a wide trait spread ({spread:.1f})."
    return f"Low resilience profile: overall {overall:.1f}, defensibility {defn:.1f}, sustainability {sus:.1f}."


def build_scenarios(bases: list[dict]) -> tuple[dict[str, dict], dict[str, dict]]:
    profiles = {base["slug"]: score_profile(base) for base in bases}
    scenario_payload: dict[str, dict] = {}
    base_ranks: dict[str, dict[str, int]] = {base["slug"]: {} for base in bases}

    for scenario_id, meta in SCENARIO_CONFIG.items():
        ranked = sorted(
            bases,
            key=lambda base: (
                -scenario_scores(profiles[base["slug"]])[scenario_id],
                base["name"],
            ),
        )

        if scenario_id != "worst_bases":
            ranked = ranked[:SCENARIO_LIMIT]
        else:
            ranked = ranked[:SCENARIO_LIMIT]

        entries: list[dict] = []
        for index, base in enumerate(ranked):
            rank = index + 1
            base_ranks[base["slug"]][scenario_id] = rank
            profile = profiles[base["slug"]]
            entries.append(
                {
                    **as_base_entry(base),
                    "rank": rank,
                    "reason": scenario_reason(base, scenario_id, profile),
                }
            )

        scenario_payload[scenario_id] = {
            "title": meta["title"],
            "description": meta["description"],
            "entries": entries,
        }

    base_hints: dict[str, dict] = {}
    preferred_order = [
        "long_term_survival",
        "short_term_refuge",
        "community_bases",
        "high_risk_high_reward",
    ]
    for slug, ranks in base_ranks.items():
        best = min(
            (scenario for scenario in preferred_order if scenario in ranks),
            key=lambda scenario: ranks[scenario],
            default=None,
        )
        if best:
            base_hints[slug] = {
                "scenario": best,
                "title": SCENARIO_CONFIG[best]["title"],
            }

    return scenario_payload, base_hints


def source_digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def build_payload() -> dict:
    bases = load_bases()
    scenarios, base_hints = build_scenarios(bases)

    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sourceDigest": source_digest(BASES_PATH),
        "totalBases": len(bases),
        "scenarioOrder": list(SCENARIO_CONFIG.keys()),
        "similarByBase": build_similar_bases(bases),
        "baseScenarioHints": base_hints,
        "scenarios": scenarios,
    }


def main() -> None:
    payload = build_payload()
    OUTPUT_PATH.write_text(f"{json.dumps(payload, indent=2)}\n", encoding="utf-8")
    print(f"Wrote {OUTPUT_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
