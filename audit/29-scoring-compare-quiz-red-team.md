# 29 — Scoring, compare and quiz red-team contract

Status: VERIFIED where commands/tests are named; INSPECTED where source/data was read; UNKNOWN only for browser/live deployment behaviours not executed here.

## Evidence files

* `audit/evidence/scoring-fixtures.json` — score dictionary plus worked scenario calculations.
* `audit/evidence/compare-fixtures.json` — deterministic compare fixtures.
* `audit/evidence/quiz-fixtures.json` — full quiz question/profile snapshot and deterministic recommendation fixtures.

## A1/A2 score meanings and Maintenance resolution

VERIFIED by `node --test tests/*.test.js` and INSPECTED in `js/compare.js`, `js/quiz-engine.js`, `scripts/generate-discovery.py`, `data/bases-index.json`, and the evidence fixtures.

The definitive dictionary is in `audit/evidence/scoring-fixtures.json`. Conclusive Maintenance finding:

* exact stored field: `comparisonScores.maintenanceBurden.score`.
* semantic meaning of raw value: despite the legacy field name, V1 treats a higher raw value as better/easier upkeep/lower practical burden.
* transform: no inversion is applied in compare; `SCORE_ROWS` labels it `Maintenance Resilience`, sets `higherIsBetter: true`, and describes higher as easier upkeep/lower burden.
* radar chart: plots the raw normalized 0–10 value; higher extends farther outward.
* scoreboard winner: `normalizedDiff` uses `scoreA - scoreB` because `higherIsBetter` is true; the larger raw value wins.
* narrative: low-maintenance verdict says the winner has the easier upkeep profile according to the maintenance resilience score.
* audit correction: prior claims saying Maintenance Burden is lower-is-better or inverted are incorrect. This document supersedes those statements, and the affected summary/risk/contradiction files were updated to identify the correction.

User-facing impact: V1 users see “Maintenance Resilience”, not “Maintenance Burden”; a higher value wins compare rows and quiz complexity matching. V2 consequence: keep the storage-field lineage for migration but model the public score dimension as `maintenance_resilience` with `higher_is_better=true`, or explicitly transform old data once during migration.

## A3 scenarios

VERIFIED by `python3 scripts/validate-discovery.py` and fixture regeneration. `scripts/generate-discovery.py` owns the formulas; `data/discovery.json` is the generated destination.

Global rules: `SCENARIO_LIMIT=25`; candidates sort by descending unrounded formula score then `base.name` ascending; committed `scenarioScore` is rounded to two decimals; formulas are not clamped. High-risk filters out `overall < 6.5`. Reason strings are fixed by scenario except high-risk, which interpolates strongest and weakest headline category keys.

Formula dictionary:

* `long_term_survival` / “Best long-term survival bases”: `sustainability*0.55 + overall*0.30 + isolation*0.20 - max(0, 3.0-isolation)*0.8`.
* `short_term_refuge` / “Best short-term refuges”: `defensibility*0.50 + isolation*0.40 + overall*0.10`.
* `community_bases` / “Best community bases”: `sustainability*0.50 + overall*0.25 + (10-isolation)*0.25 - max(0, isolation-8.5)*0.35`.
* `high_risk_high_reward` / “Highest risk / highest reward”: `overall + (max(defensibility,isolation,sustainability)-min(...))`.

Worked examples with raw inputs, penalties, unrounded values, ranks and generated reasons are in `audit/evidence/scoring-fixtures.json`.

## A4 compare contract

VERIFIED by `node --test tests/compare-utils.test.js`; INSPECTED in `js/compare.js`, `_redirects`, `js/slug.js` and fixtures.

Accepted result inputs: clean `/base/:slugA/vs/:slugB`; query `/compare.html?a=slug&b=slug`; aliases inspected in source include `baseA/baseB`. Setup route is `/compare.html`. Same-base selection is blocked in selectors and treated as invalid/error copy. Invalid/missing pair renders setup or not-found state rather than invented results.

Eight rows: Overall (`scores.overall`), Defensibility/Sustainability/Isolation (`scores.categories.*`), Exposure Control (`comparisonScores.exposure.score`), Maintenance Resilience (`comparisonScores.maintenanceBurden.score`), Population Capacity, Resource Security. All eight are higher-is-better in V1. Tie threshold is `WIN_EPSILON=0.05`. Normalized difference is currently raw `scoreA-scoreB`; invalid scores become `null`. Attribute win/tie/loss counts exclude Overall. Overall winner follows the Overall row; largest advantage and closest category are selected by absolute attribute difference. Radar values use the same eight row values clamped to `MAX_SCORE=10`.

Five deterministic fixtures, including invalid data and maintenance semantics, are in `audit/evidence/compare-fixtures.json`.

## A5 quiz specification

VERIFIED by `node --test tests/quiz-engine.test.js`; INSPECTED in `js/quiz-questions.js`, `js/quiz-engine.js`, `js/quiz.js`.

The complete seven axes, twelve question prompts, four answers per question, answer IDs, answer labels, answer weights, six profiles and six deterministic journeys are preserved in `audit/evidence/quiz-fixtures.json`.

Algorithm summary: selected answer weights accumulate into raw axis totals; totals normalize min/max to 0–10; profile classification returns `resilient-generalist` when top-two axes differ by `<1.15`, otherwise maps top axis through the fixed if/else order. Base vectors blend stored category/comparison scores with hard-coded type traits. Compatibility computes weighted absolute distance, adds type-affinity and overall boosts, clamps to 1–99, then `Math.round`s. Recommendations exclude `status:hidden`, sort by match desc, overall desc, then name asc. Alternatives are the next three unique bases with generated alternative reasons. `js/quiz.js` stores previous results in localStorage with `STORAGE_VERSION = 2`, reconstructs results by rerunning the engine, clears storage on retake, blocks incomplete forward navigation, supports back/forward state changes, and uses Web Share API with clipboard fallback.

V2 consequence: quiz config must be versioned; changing base scores or type traits can alter reconstructed previous results even when saved answers are unchanged.
