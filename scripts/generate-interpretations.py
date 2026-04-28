#!/usr/bin/env python3
"""Generate score interpretation data for each base."""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASES_PATH = ROOT / "data" / "bases-index.json"
OUTPUT_PATH = ROOT / "data" / "interpretations.json"

REQUIRED_KEYS = ("defensibility", "isolation", "sustainability")
TOP_TIEBREAK = {"defensibility": 0, "isolation": 1, "sustainability": 2}
LOW_TIEBREAK = {"sustainability": 0, "isolation": 1, "defensibility": 2}

SCORE_BANDS = (
    (9.0, 10.0, "Elite stronghold", "Top-tier survival profile with very few structural weaknesses.", "score-band-elite"),
    (8.0, 8.9, "Exceptional base", "Strong survival potential with clear strengths, but not without failure risks.", "score-band-exceptional"),
    (7.0, 7.9, "Strong base", "Reliable under pressure, with manageable trade-offs.", "score-band-strong"),
    (6.0, 6.9, "Viable but flawed", "Usable with planning, but one weakness can still break the base.", "score-band-viable"),
    (5.0, 5.9, "Situational refuge", "Can work in specific conditions, but not as a default long-term choice.", "score-band-situational"),
    (4.0, 4.9, "Fragile option", "Some short-term utility, but too unstable for sustained survival.", "score-band-fragile"),
    (3.0, 3.9, "High-risk base", "Failure risk is consistently high across core survival conditions.", "score-band-high-risk"),
    (2.0, 2.9, "Poor survival choice", "Weak protection and weak endurance make this a bad bet.", "score-band-poor"),
    (1.0, 1.9, "Non-viable", "Breaks down quickly under realistic survival pressure.", "score-band-non-viable"),
    (0.0, 0.9, "Non-viable", "Breaks down quickly under realistic survival pressure.", "score-band-non-viable"),
)


def is_number(value: object) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def load_bases() -> list[dict]:
    raw = json.loads(BASES_PATH.read_text(encoding="utf-8"))
    valid: list[dict] = []

    for base in raw:
        if not isinstance(base, dict):
            continue

        scores = base.get("scores", {})
        categories = scores.get("categories", {})

        if not isinstance(base.get("slug"), str) or not base["slug"].strip():
            continue
        if not is_number(scores.get("overall")):
            continue
        if not all(is_number(categories.get(key)) for key in REQUIRED_KEYS):
            continue

        valid.append(base)

    return valid


def score_band(overall: float) -> dict[str, str]:
    rounded = round(overall, 1)
    for low, high, label, description, css_class in SCORE_BANDS:
        if low <= rounded <= high:
            return {
                "scoreBandLabel": label,
                "scoreBandDescription": description,
                "scoreBandClass": css_class,
            }
    return {
        "scoreBandLabel": "Non-viable",
        "scoreBandDescription": "Breaks down quickly under realistic survival pressure.",
        "scoreBandClass": "score-band-non-viable",
    }




def top_and_low_keys(categories: dict) -> tuple[str, str]:
    ranked_high = sorted(REQUIRED_KEYS, key=lambda key: (-float(categories[key]), TOP_TIEBREAK[key]))
    ranked_low = sorted(REQUIRED_KEYS, key=lambda key: (float(categories[key]), LOW_TIEBREAK[key]))
    top_key = ranked_high[0]
    low_key = ranked_low[0]
    if low_key == top_key and len(ranked_low) > 1:
        low_key = ranked_low[1]
    return top_key, low_key


def is_landmark_like(base_type: str) -> bool:
    return base_type in {"landmark_structure", "transit_hub", "urban_structure", "tower"}


def category_spread(categories: dict) -> float:
    values = [float(categories[key]) for key in REQUIRED_KEYS]
    return max(values) - min(values)


def pick_archetype(base: dict) -> tuple[str, str]:
    categories = base["scores"]["categories"]
    base_type = str(base.get("type", "")).strip().lower()
    overall = float(base["scores"]["overall"])
    defensibility = float(categories["defensibility"])
    isolation = float(categories["isolation"])
    sustainability = float(categories["sustainability"])

    optional_access = categories.get("access")
    optional_supplies = categories.get("supplies")
    optional_logistics = categories.get("logistics")

    top_key, low_key = top_and_low_keys(categories)
    spread = category_spread(categories)
    low_pair = min(defensibility, isolation)
    support_pair = max(float(optional_access or 0), float(optional_supplies or 0), float(optional_logistics or 0))

    if overall < 3.5 and is_landmark_like(base_type):
        return (
            "Symbolic trap",
            "Visually imposing, but survival fundamentals collapse almost immediately.",
        )

    if overall < 4.4 and low_pair <= 4.6 and support_pair >= 6.8:
        return (
            "Logistics trap",
            "Throughput looks attractive, but weak defence and weak isolation make it hard to hold.",
        )

    if defensibility >= 8.2 and isolation >= 7.5 and sustainability <= 5.4:
        return (
            "Defensive-isolation stronghold",
            "Outstanding protection and separation, but long-term success hinges on fixing sustainability.",
        )

    if top_key == "defensibility" and defensibility >= 8.0 and sustainability <= 5.8:
        return (
            "Defensive stronghold",
            "Outstanding protection, but long-term success depends on fixing sustainability.",
        )

    if isolation >= 8.4 and sustainability >= 7.0 and defensibility <= 7.6:
        return (
            "Isolation settlement",
            "Built around elite isolation and strong sustainability; defence is secondary.",
        )

    if top_key == "isolation" and isolation >= 8.0 and (sustainability <= 6.3 or (is_number(optional_access) and optional_access < 4.6)):
        return (
            "Isolation refuge",
            "Separation is a major advantage, but sustaining people and flow is the pressure point.",
        )

    if sustainability >= 7.5 and overall >= 6.8 and spread <= 1.6:
        return (
            "Long-term settlement",
            "Built for endurance, with balanced support for sustained multi-season survival.",
        )

    if any(is_number(value) and float(value) >= 7.5 for value in (optional_supplies, optional_logistics)) and overall >= 6.0:
        return (
            "Logistics hub",
            "Resource throughput is the core edge, as long as security gaps stay controlled.",
        )

    if any(is_number(value) and float(value) >= 7.2 for value in (optional_supplies, optional_logistics)) and overall >= 5.5:
        return (
            "Resource base",
            "Useful stock and infrastructure capacity, but requires protective discipline.",
        )

    if overall >= 8.0 and spread >= 2.2:
        return (
            "Specialist survivor",
            "Top-tier outcome driven by standout strengths, but the profile is highly specialized.",
        )

    if overall >= 6.4 and spread >= 2.8 and float(categories[low_key]) <= 5.0:
        return (
            "High-risk / high-reward",
            "Elite strengths are real, but one weak axis can collapse the whole setup.",
        )

    if overall < 5.2:
        return (
            "Fragile shelter",
            "Can work briefly, but lacks the resilience needed for sustained pressure.",
        )

    if overall < 6.2 and float(categories[low_key]) < 5.0:
        return (
            "Temporary fallback",
            "Best used as a stopgap while moving toward a stronger base.",
        )

    dominant_gap = float(categories[top_key]) - float(categories[low_key])
    if overall >= 6.6 and spread <= 1.4 and dominant_gap <= 1.4 and min(defensibility, isolation, sustainability) >= 6.0:
        return (
            "Balanced survivor",
            "Strong all-round performance with no extreme weakness.",
        )

    if top_key == "sustainability" and sustainability >= 6.8:
        return (
            "Sustainability-leaning refuge",
            "Durability is the core advantage, but defensive and isolation gaps still define risk.",
        )

    if top_key == "isolation" and isolation >= 6.8:
        return (
            "Isolation-leaning refuge",
            "Distance and separation help, but resilience depends on stronger supporting systems.",
        )

    return (
        "Defence-leaning refuge",
        "Protective strength is the main edge, but weaker support traits cap long-term reliability.",
    )


def build_shape_summary(base: dict) -> str:
    categories = base["scores"]["categories"]
    overall = float(base["scores"]["overall"])

    top_key, low_key = top_and_low_keys(categories)

    noun = {
        "defensibility": "defence",
        "isolation": "isolation",
        "sustainability": "long-term viability",
    }
    top_value = float(categories[top_key])
    low_value = float(categories[low_key])
    spread = category_spread(categories)

    if overall >= 8.0 and spread >= 2.2:
        return f"Exceptional outcome powered by {noun[top_key]}, but performance still bends around weak {noun[low_key]}."
    if overall >= 7.4 and low_value <= 5.5:
        return f"Built around elite {noun[top_key]}; {noun[low_key]} is the main constraint."
    if overall >= 7.0:
        return f"High-function profile with strong {noun[top_key]}, while {noun[low_key]} remains the critical upgrade target."
    if overall >= 6.0 and top_value >= 7.0:
        return f"Leans on {noun[top_key]} for stability, but weak {noun[low_key]} still dictates failure risk."
    if overall >= 4.5:
        return f"Partial strength in {noun[top_key]} cannot fully offset recurring {noun[low_key]} pressure."
    return f"Any edge in {noun[top_key]} is overwhelmed by severe {noun[low_key]} weakness."


def build_interpretation(base: dict) -> dict:
    overall = float(base["scores"]["overall"])
    band = score_band(overall)
    archetype_label, archetype_description = pick_archetype(base)

    return {
        "slug": base["slug"],
        "scoreBandLabel": band["scoreBandLabel"],
        "scoreBandDescription": band["scoreBandDescription"],
        "scoreBandClass": band["scoreBandClass"],
        "archetypeLabel": archetype_label,
        "archetypeDescription": archetype_description,
        "scoreShapeSummary": build_shape_summary(base),
    }


def build_payload() -> dict:
    bases = load_bases()
    interpretations = [build_interpretation(base) for base in bases]
    interpretations.sort(key=lambda item: item["slug"])

    digest = hashlib.sha256(
        json.dumps(interpretations, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    ).hexdigest()

    return {
        "generatedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "source": {
            "bases": "data/bases-index.json",
            "schemaVersion": 1,
            "hash": digest,
        },
        "interpretations": interpretations,
    }


def main() -> int:
    payload = build_payload()
    OUTPUT_PATH.write_text(f"{json.dumps(payload, indent=2, ensure_ascii=False)}\n", encoding="utf-8")
    print(f"Wrote {len(payload['interpretations'])} interpretations to {OUTPUT_PATH.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
