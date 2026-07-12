# 09 Rankings

## Generated ranking data

`scripts/generate-rankings.py` reads `data/bases-index.json`, filters valid bases with numeric overall scores, sorts by overall descending and then name, and writes `data/rankings.json`.

Output shape:

* `generatedAt`
* `totalBases`
* `global`
* `byRegion`
* `byType`
* `highlights`

Each ranking entry stores slug, name, region, type, summary, overall, rank and percentile.

## Global rankings

`rankings.html` renders `rankings.global`, already sorted by generated rank. Each card links to the base detail page.

## Region rankings

`rankings-region.html` renders a selected key from `rankings.byRegion`. If no query parameter is supplied, the script chooses the first available region key. The dropdown updates `?region=` in place.

## Type rankings

`rankings-type.html` renders a selected key from `rankings.byType`. If no query parameter is supplied, the script chooses the first available type key. The dropdown updates `?type=` in place.

## Rank context on base detail

`js/base.js` uses `data/rankings.json` to display global rank, top percentile, region rank and type rank for the current base. This makes base detail dependent on generated ranking data matching the current canonical base dataset.

## Scenario rankings

Scenario rankings are not produced by `generate-rankings.py`. They are generated in `data/discovery.json` by `generate-discovery.py` and rendered by `js/scenarios.js`.

## Consistency risks

* Ranking data can become stale if `bases-index.json` changes without regenerating `rankings.json`.
* Region/type pages use query parameters rather than clean canonical nested routes.
* Percentiles are generated using total dataset size; if invalid bases were excluded in generation, percentile semantics would need review.
