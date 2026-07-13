# 21 Compare Behavioural Specification

Status: utility logic VERIFIED by `node --test tests/compare-utils.test.js`; route/UI logic INSPECTED in `js/compare.js`, `compare.html`, `_redirects`, `js/slug.js`.

Accepted URLs: `/compare.html`, `/compare.html?a=slug&b=slug`, `/compare.html?baseA=slug&baseB=slug` style aliases inspected in route parsing, and clean `/base/:slugA/vs/:slugB`. Selectors filter by typed name/country/region/type and prevent selecting the same base in both slots.

Scoreboard rows: Overall `scores.overall`; Defensibility/Sustainability/Isolation from `scores.categories.*`; Exposure Control, Maintenance Resilience, Population Capacity, Resource Security from `comparisonScores.*.score`. All rows use `higherIsBetter:true`; tie threshold `WIN_EPSILON=0.05`. Scores are clamped to 0-10; invalid/missing score renders `—` and is skipped from valid comparisons. Difference is `scoreA-scoreB`; winner A if diff>=0.05, B if diff<=-0.05, else tie. Attribute win counts exclude Overall. Overall winner uses stored overall row plus narrative helpers; category verdicts sum selected rows for early, long-term and maintenance verdicts. Largest advantage sorts attribute rows by absolute raw difference; closest category sorts ascending absolute difference. Radar chart plots the same eight dimensions transformed to SVG points against `MAX_SCORE=10`.

Curated matchups and change-base behaviour are implemented in the compare setup/current selector blocks. Change buttons update to `compareUrl(primary,secondary)` after validation.

## Worked comparisons

### Cheyenne Mountain Complex vs Isle of Eigg Village
Rows: Overall 9.0 vs 8.9 A; Defensibility 10.0 vs 8.7 A; Sustainability 7.0 vs 9.0 B; Isolation 6.0 vs 9.7 B; Exposure 5 vs 10 B; Maintenance 3 vs 8 B; Population 6 vs 6 tie; Resource 6 vs 9 B. Attribute counts A=1, B=5, ties=1. Stored overall verdict names Cheyenne by 0.1, but category narrative strongly favours Eigg for long-term/resource/low-maintenance.

### Himeji Castle vs Andaman Islands
Overall 6.8 vs 8.3 B; Defensibility 8.7 vs 7.5 A; Sustainability 5.0 vs 8.0 B; Isolation 3.6 vs 9.0 B; Exposure 4 vs 8 B; Maintenance 4 vs 6 B; Population 3 vs 8 B; Resource 5 vs 7 B. Attribute counts A=1, B=6, ties=0. Final comparison favours Andaman except defensive strength.

### Derinkuyu Underground City vs Mont Saint-Michel
Overall 7.1 vs 7.8 B; Defensibility 8.8 vs 9.6 B; Sustainability 3.9 vs 4.3 B; Isolation 6.0 vs 8.8 B; Exposure 5 vs 9 B; Maintenance 3 vs 6 B; Population 5 vs 3 A; Resource 4 vs 3 A. Attribute counts A=2, B=5, ties=0. Verdict favours Mont Saint-Michel with Derinkuyu advantages in capacity/resources.
