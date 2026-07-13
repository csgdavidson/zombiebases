# 07 Scoring Engine

## Score classes

V1 has several distinct scoring systems:

| Score type | Source | Consumer | Meaning |
|---|---|---|---|
| Stored overall | `base.scores.overall` | Homepage, base detail, rankings, compare, quiz display | Main public 0–10 score. |
| Headline categories | `base.scores.categories.defensibility/isolation/sustainability` | Base detail, compare, rankings stats, scenarios, quiz | Three core survival pillars. |
| Extended comparison scores | `base.comparisonScores.*.score` | Compare | Exposure Control, Maintenance Resilience, Population Capacity, Resource Security. |
| Scenario scores | Generated in `data/discovery.json` | Scenarios page and badges | Alternative weighted formulas by scenario. |
| Quiz compatibility | Runtime in `js/quiz-engine.js` | Quiz result | User preference vector compared with base profile. |
| Interpretation bands | Generated in `data/interpretations.json` | Base detail | Qualitative score band/archetype labels. |

## Overall score

Overall score is stored in the base dataset. Runtime helpers generally read `base.scores.overall`; they only compute a fallback average when the stored value is missing. Rankings sort by the stored overall score descending, then name.

## Headline pillars

The three headline pillars are:

1. Defensibility
2. Isolation
3. Sustainability

They are displayed on homepage cards, base detail pages, compare rows, generated stats and generated scenario calculations. They do not mathematically derive the stored overall score during runtime.

## Extended comparison dimensions

Compare adds four dimensions:

* `exposure` — rendered as Exposure Control;
* `maintenanceBurden` — rendered as Maintenance Resilience; this is marked as lower-is-better in compare logic;
* `populationCapacity` — rendered as Population Capacity;
* `resourceSecurity` — rendered as Resource Security.

Together with overall and the three headline categories, compare displays eight rows.

## Scenario formulas

`scripts/generate-discovery.py` computes scenario scores from the three headline pillars and stored overall score. Current formulas are deterministic:

* long-term survival emphasizes sustainability, overall and isolation, with a penalty for very low isolation;
* short-term refuge emphasizes defensibility and isolation;
* community bases emphasizes sustainability, overall and access (`10 - isolation`), with a penalty for extreme isolation;
* high-risk/high-reward uses overall plus the spread between strongest and weakest headline pillar.

Each scenario keeps the top 25 entries and records rank, scenarioScore and reason.

## Interpretations

`scripts/generate-interpretations.py` maps overall scores into bands such as Elite, Exceptional, Strong and Viable, then assigns archetypes based on score shape, spread, type and strongest/weakest categories. These are explanatory labels, not primary ranking inputs.

## Validation and consistency risks

* There is no single scoring module shared by Python generators and browser runtime.
* Score labels and thresholds are duplicated in several JavaScript files.
* Compare treats maintenance burden inversely, so a higher raw value is not always better for that row.
* Scenario scores are generated and committed; the scenarios page does not recompute formulas at runtime.
* Overall score has no visible formula in V1; any rebuild must preserve stored values unless a new scoring model is explicitly approved.

## Red-team correction — 2026-07-13

INSPECTED/VERIFIED: Earlier wording that described `comparisonScores.maintenanceBurden.score` as lower-is-better or inverted is superseded. V1 labels and compares this raw field as Maintenance Resilience with higher-is-better semantics. See `audit/29-scoring-compare-quiz-red-team.md` and `audit/evidence/scoring-fixtures.json`.
