# 23 Complete Data Schema

Status: schemas INSPECTED in `data/*.json`, validators/generators VERIFIED.

## `data/bases-index.json`

Array of 111 required base objects. Representative identity fields: `slug` string key required; `name`; `country`; `region` enum of 12; `type` enum currently 8 in data though JS labels include 9; `coordinates.lat/lng` numbers; `status` optional. Content: `description.summary`, additional narrative sections, `aliases` optional. Scores: `scores.overall` number 0-10 stored/authored; `scores.categories.defensibility/isolation/sustainability` numbers. Compare: `comparisonScores.exposure/maintenanceBurden/populationCapacity/resourceSecurity.score` numbers plus copy. Image: explicit `image` may be used; otherwise `/images/bases/<slug>.png` fallback. Consumers: every page except Field Manual static content.

## `data/rankings.json`

Generated object: `generatedAt`, `totalBases`, `global[]`, `byRegion{region:[]}`, `byType{type:[]}`, each entry with `slug,name,region,type,summary,overall,rank,percentile`. Source: `bases-index`; consumer: rankings pages and base context. Migration concern: generator output currently differs in timestamp and one Isle of Eigg summary if rerun.

## `data/discovery.json`

Generated: `generatedAt`, `similarBases{slug:[entries]}`, `scenarioOrder[]`, `scenarioConfig`, `scenarios{id:{title,description,entries[]}}`, `baseScenarioRanks`. Scenario entry includes `slug,name,region,type,overall,rank,scenarioScore,reason`. Source: `scripts/generate-discovery.py`; consumers: scenarios and base detail similar/scenario modules. Validator passed.

## `data/interpretations.json`

Generated per-base score interpretation/archetype bands from canonical scores. Consumers: base detail display. Validator passed.

## `data/base-stats.json`

Generated aggregate counts/statistics (`totalBases`, `scoreCategories`, region/type distributions, score ranges). Not broadly rendered in V1, but useful for audit/build checks. Rerun changes timestamp.

## Quiz config/profiles

Questions and axes live in `js/quiz-questions.js`; profiles, type traits and factor definitions live in `js/quiz-engine.js`, not JSON. Consumers: quiz UI/tests. Migration should externalize or snapshot exact JS constants.

## Legacy/source data

`data/base-matrix-source.json` is legacy/source matrix; it is not the runtime canonical dataset. Some entries may be stale against `bases-index` and require owner decision before migration.

## Visible value lineage

Homepage cards: base identity, country, region/type labels, image, summary and scores from `bases-index` via `js/main.js`/`base-card.js`. Base detail: base object plus rankings/discovery/interpretations. Compare: base object only and formulas in `js/compare.js`. Rankings: `rankings.json`. Scenarios: `discovery.json`. Quiz results: user answers + `bases-index` + hard-coded quiz engine formulas.
