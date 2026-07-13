# 19 Scoring and Scenario Specification

Status: formulas VERIFIED by `validate-discovery.py`, generated examples, and static inspection of `scripts/generate-discovery.py`, `scripts/generate-rankings.py`, `js/rankings.js`, `js/scenarios.js`, `js/base-card.js`, and `data/*.json`.

## Stored score paths

Canonical score source is `data/bases-index.json` per base:

* Overall: `scores.overall` (authored/stored; no authoritative formula is encoded in V1).
* Headline categories: `scores.categories.defensibility`, `scores.categories.isolation`, `scores.categories.sustainability`.
* Compare-only dimensions: `comparisonScores.exposure.score`, `comparisonScores.maintenanceBurden.score`, `comparisonScores.populationCapacity.score`, `comparisonScores.resourceSecurity.score`.

Runtime fallbacks: compare/quiz clamp numeric values to 0-10; invalid values become `null`/fallback traits. Base cards display `scores.overall` if present and category values if present. Quiz can fall back from category paths to `scores.defensibility`/`scores.isolation`/`scores.sustainability`, then type traits.

## Ranking rules

`generate-rankings.py` sorts global, region and type rankings by descending stored `scores.overall`, then name for deterministic ties. Percentile is rank/total*100 rounded to two decimals. Display formatting is usually one decimal for scores in cards/tables. Missing invalid bases are skipped by generators/validators.

## Scenario constants and formulas

`SIMILAR_COUNT=5`, `SCENARIO_LIMIT=25`, valid scenario source keys are defensibility/isolation/sustainability/overall. Scenario candidates are sorted by descending formula score then `base.name`; high-risk excludes bases with `overall < 6.5`.

Let `D=defensibility`, `I=isolation`, `S=sustainability`, `O=overall`, `spread=max(D,I,S)-min(D,I,S)`, `access=10-I`.

* `long_term_survival = S*0.55 + O*0.30 + I*0.20 - max(0, 3.0-I)*0.80`.
* `short_term_refuge = D*0.50 + I*0.40 + O*0.10`.
* `community_bases = S*0.50 + O*0.25 + access*0.25 - max(0, I-8.5)*0.35`.
* `high_risk_high_reward = O + spread`.

Generated `data/discovery.json` stores scenario entries with `rank`, `scenarioScore` rounded to two decimals, base identity, overall, and reason. Reasons are fixed strings by scenario except high-risk, which interpolates strongest and weakest headline category names.

## Similar bases

Similarity uses Euclidean distance across defensibility, isolation, sustainability and overall. Candidates sort by distance then name, select up to five with region/type variety rules after the first two. `isle-of-eigg-village` has reason/order overrides.

## Generator match status

`python3 scripts/validate-discovery.py` passed. `python3 scripts/generate-rankings.py` produced a temporary diff: timestamp and one Isle of Eigg summary changed relative to committed `data/rankings.json`; reverted. This means rankings ordering is reproducible, but committed generated prose is stale for that one summary if the current generator/source is considered authoritative.

## Worked scenario examples

### Isle of Eigg Village
Inputs: D=8.7, I=9.7, S=9.0, O=8.9. Long-term = `9*.55 + 8.9*.30 + 9.7*.20 - max(0,3-9.7)*.8 = 9.56`. `data/discovery.json` ranks it #1 long-term and #1 short-term with rounded scenario scores. Community = `9*.5 + 8.9*.25 + .3*.25 - (9.7-8.5)*.35 = 6.38`. High-risk = `8.9 + (9.7-8.7)=9.9`.

### Cheyenne Mountain Complex
Inputs: D=10, I=6, S=7, O=9. Long-term = 7.75; short-term = 8.30; community = 6.75; high-risk = `9 + (10-6)=13.00`. It appears high in high-risk because extreme defence plus weaker isolation creates large spread.

### Himeji Castle
Inputs: D=8.7, I=3.6, S=5.0, O=6.8. Long-term = 5.51; short-term = 6.47; community = 5.80; high-risk = `6.8 + (8.7-3.6)=11.90`. Lower isolation and sustainability prevent high long-term rank despite strong defence.
