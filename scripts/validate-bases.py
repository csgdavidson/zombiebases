#!/usr/bin/env python3
"""Lightweight data validation for base V2 records."""

from __future__ import annotations

import json
import sys
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "bases-index.json"
REQUIRED_SCORE_FIELDS = {"overall", "defensibility", "isolation", "sustainability"}
FORBIDDEN_SCORE_FIELDS = {"food", "water", "escape"}
ALLOWED_CATEGORY_FIELDS = {"defensibility", "isolation", "sustainability"}
REQUIRED_COMPARISON_FIELDS = {"exposure", "maintenanceBurden", "populationCapacity", "resourceSecurity"}


def is_non_empty_string(value: object) -> bool:
    return isinstance(value, str) and bool(value.strip())


def is_finite_number(value: object) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def is_score_1_to_10(value: object) -> bool:
    return is_finite_number(value) and 1 <= value <= 10


def get_related_slugs(base: dict) -> list[str]:
    for key in ("relatedBases", "related", "related_slugs"):
        value = base.get(key)
        if isinstance(value, list):
            return [slug for slug in value if isinstance(slug, str) and slug.strip()]
    return []


def get_content(base: dict, key: str):
    if key in base:
        return base.get(key)
    description = base.get("description")
    if isinstance(description, dict):
        return description.get(key)
    return None


def validate(bases: list[dict]) -> list[str]:
    errors: list[str] = []

    slugs = [base.get("slug") for base in bases]
    slug_counts: dict[str, int] = {}
    for slug in slugs:
        if isinstance(slug, str):
            slug_counts[slug] = slug_counts.get(slug, 0) + 1

    duplicates = sorted([slug for slug, count in slug_counts.items() if count > 1])
    if duplicates:
        errors.append(f"Duplicate slugs found: {', '.join(duplicates)}")

    valid_slugs = set(slug_counts.keys())

    for index, base in enumerate(bases):
        base_name = base.get("name") or f"index:{index}"

        if not is_non_empty_string(base.get("slug")):
            errors.append(f"{base_name}: missing or invalid slug")

        summary = get_content(base, "summary")
        strengths = get_content(base, "strengths")
        weaknesses = get_content(base, "weaknesses")

        if not is_non_empty_string(summary):
            errors.append(f"{base_name}: missing required V2 field summary")
        if not isinstance(strengths, list) or not all(is_non_empty_string(item) for item in strengths):
            errors.append(f"{base_name}: missing/invalid required V2 field strengths")
        if not isinstance(weaknesses, list) or not all(is_non_empty_string(item) for item in weaknesses):
            errors.append(f"{base_name}: missing/invalid required V2 field weaknesses")

        for field in ("verdict", "survivalProfile", "useCaseAndRisk"):
            if not isinstance(base.get(field), dict):
                errors.append(f"{base_name}: missing required V2 object field {field}")

        for field in ("realityCheck", "scoreNarrative"):
            if not is_non_empty_string(base.get(field)):
                errors.append(f"{base_name}: missing required V2 field {field}")

        scores = base.get("scores")
        categories = scores.get("categories") if isinstance(scores, dict) else None
        if not isinstance(scores, dict):
            errors.append(f"{base_name}: missing required V2 object field scores")
            continue

        if not is_finite_number(scores.get("overall")):
            errors.append(f"{base_name}: missing/invalid required V2 score field scores.overall")

        if not isinstance(categories, dict):
            errors.append(f"{base_name}: missing required V2 object field scores.categories")
            continue

        for key in ("defensibility", "isolation", "sustainability"):
            if not is_finite_number(categories.get(key)):
                errors.append(f"{base_name}: missing/invalid required V2 score field scores.categories.{key}")

        invalid_keys = sorted([key for key in categories.keys() if key not in ALLOWED_CATEGORY_FIELDS])
        if invalid_keys:
            errors.append(f"{base_name}: non-V2 score keys present in scores.categories: {', '.join(invalid_keys)}")

        forbidden_present = sorted(FORBIDDEN_SCORE_FIELDS.intersection(categories.keys()))
        if forbidden_present:
            errors.append(f"{base_name}: forbidden legacy score keys present: {', '.join(forbidden_present)}")

        comparison_scores = base.get("comparisonScores")
        if not isinstance(comparison_scores, dict):
            errors.append(f"{base_name}: missing required comparisonScores object")
        else:
            missing_comparison_fields = sorted(REQUIRED_COMPARISON_FIELDS.difference(comparison_scores.keys()))
            if missing_comparison_fields:
                errors.append(
                    f"{base_name}: missing required comparison score fields: {', '.join(missing_comparison_fields)}"
                )

            unexpected_comparison_fields = sorted(set(comparison_scores.keys()).difference(REQUIRED_COMPARISON_FIELDS))
            if unexpected_comparison_fields:
                errors.append(
                    f"{base_name}: unexpected comparison score fields: {', '.join(unexpected_comparison_fields)}"
                )

            for field in sorted(REQUIRED_COMPARISON_FIELDS):
                entry = comparison_scores.get(field)
                if not isinstance(entry, dict):
                    errors.append(f"{base_name}: comparisonScores.{field} must be an object")
                    continue

                if not is_score_1_to_10(entry.get("score")):
                    errors.append(f"{base_name}: comparisonScores.{field}.score must be a number from 1 to 10")
                if not is_non_empty_string(entry.get("rationale")):
                    errors.append(f"{base_name}: comparisonScores.{field}.rationale must be present and non-empty")

        for related_slug in get_related_slugs(base):
            if related_slug not in valid_slugs:
                errors.append(f"{base_name}: related base slug does not resolve: {related_slug}")

        present_score_fields = {"overall", *categories.keys()}
        missing_score_fields = REQUIRED_SCORE_FIELDS.difference(present_score_fields)
        if missing_score_fields:
            errors.append(f"{base_name}: missing required V2 score fields: {', '.join(sorted(missing_score_fields))}")

    return errors


def main() -> int:
    with DATA_PATH.open("r", encoding="utf-8") as handle:
        bases = json.load(handle)

    if not isinstance(bases, list):
        print("Validation failed: top-level data must be a list")
        return 1

    errors = validate(bases)
    if errors:
        print("Validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"Validation passed for {len(bases)} bases.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
