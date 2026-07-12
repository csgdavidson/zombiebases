# 17 V2 Risk Register

| ID | Area | Risk | Evidence | Migration impact |
|---|---|---|---|---|
| R1 | Data | Generated JSON drifts from canonical bases. | Rankings, discovery, interpretations and stats are separate committed outputs. | Rebuild must define source-of-truth and deterministic generation/query rules. |
| R2 | Scores | Overall score formula is not encoded. | Runtime reads stored overall and only falls back to averages if missing. | Preserve stored scores unless owner approves recalculation. |
| R3 | Compare | Maintenance burden has inverted semantics. | Compare row marks lower burden as better. | Data model must encode score direction per dimension. |
| R4 | Routing | Root clean slugs collide with product routes. | `_redirects` includes `/:slug /base.html 200`. | Redirect/canonical plan must enumerate reserved paths. |
| R5 | SEO | Dynamic metadata is client-side. | `window.seo` mutates title/canonical/JSON-LD at runtime. | SSR/SSG parity needs route-specific metadata generation. |
| R6 | Quiz | Previous result is local and recomputed. | Quiz localStorage stores answers and reconstructs against current data. | If results become shareable/persistent, versioning must be explicit. |
| R7 | Field Manual | Manual is embedded static HTML. | Chapters/callouts/links are not structured data. | Content extraction and QA will be required. |
| R8 | Assets | Images rely on slug filenames. | Multiple helpers derive `/images/bases/${slug}.png`. | Media migration needs explicit asset records and redirects/fallbacks. |
| R9 | Labels | Taxonomy labels are duplicated. | Label maps exist in several JS files. | Centralize labels before changing taxonomy names. |
| R10 | Build | Main build omits some generators. | `build` only generates thumbnails and clean pages. | Deployment pipeline must decide which generated files are committed vs built. |
| R11 | Testing | Test coverage is narrow. | Tests cover compare helpers and quiz engine only. | Add parity tests for routing, rankings, scenarios and data validation before rebuild. |
| R12 | Maps | Map depends on external browser globals. | `js/map.js` requires Leaflet and markerCluster on `window.L`. | V2 must deliberately preserve or replace map dependency behaviour. |

## Preserve/rebuild/improve/retire matrix

| Capability | Current V1 source | Migration stance |
|---|---|---|
| Base dataset and slugs | `data/bases-index.json` | Preserve values and route mapping. |
| Static shell architecture | HTML + global JS | Rebuild implementation while preserving behaviours. |
| Ranking calculations | `generate-rankings.py` | Preserve deterministic orderings. |
| Scenario calculations | `generate-discovery.py` | Preserve formulas until changed by product owner. |
| Compare algorithm | `js/compare.js` | Preserve scoreboard semantics and score direction. |
| Quiz algorithm | `js/quiz-engine.js` | Preserve deterministic outcomes or version changes. |
| Field Manual content | `field-manual.html` | Preserve content; restructure only during planned migration. |
| Root-level base URLs | `_redirects`, `js/slug.js` | Preserve via redirects/canonicals even if canonical route changes. |
| Image slug convention | `images/bases/*.png` | Use as migration convention, not final sole relationship. |
