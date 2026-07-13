# 27 V1/V2 Parity Matrix

| Behaviour | V1 evidence | Expected behaviour | Desktop/mobile | Edge cases | Disposition | Proposed parity test |
|---|---|---|---|---|---|---|
| Navigation | HTML shells, `mobile-nav.js` | Link to Explore, Rankings, Compare, Quiz, Field Manual. | Mobile hamburger/fixed nav. | Active/current link. | PRESERVE INTENT / REBUILD IMPLEMENTATION | E2E nav smoke. |
| Homepage sections | `index.html`, `js/main.js` | Hero, stats, type cards, popular links, explorer. | Cards stack on mobile. | Empty data. | PRESERVE EXACTLY | Snapshot DOM after data load. |
| Search | `js/main.js` | Match name/country/type/region/summary/aliases. | Mobile preset choices. | No results. | PRESERVE EXACTLY | Search known aliases. |
| Filters/sort | taxonomy JS/main | Region/type/sort/view URL state. | Selects on mobile. | Invalid params. | PRESERVE EXACTLY | Param matrix. |
| List/map | `js/map.js` | Toggle list/map with markers. | Mobile list-first. | Missing Leaflet. | IMPROVE AFTER PARITY | Disable Leaflet and verify fallback. |
| Cards/images | `base-card.js` | Clean links, score badges, PNG fallback. | Responsive cards. | Missing image. | PRESERVE EXACTLY | Card fixture render. |
| Base detail | `base.html`, `js/base.js` | Resolve slug, render scores/prose/rank/similar. | Same content stacked. | Bad slug not-found. | PRESERVE EXACTLY | Slug route fixtures. |
| Rankings/region/type | `rankings.js`, `rankings.json` | Sorted stored overall. | Tables/cards responsive. | Invalid group. | PRESERVE EXACTLY | Top-10 fixture. |
| Scenarios | `scenarios.js`, `discovery.json` | Four generated lists. | Selector responsive. | Invalid scenario. | PRESERVE EXACTLY | Formula examples. |
| Compare landing/result | `compare.js` | Select two bases or clean URL pair; 8-row scorecard. | Selectors adapt. | Same/missing base. | PRESERVE EXACTLY | Three worked comparisons. |
| Quiz | quiz scripts | 12 questions, recommendation, previous result/share. | One-question flow mobile. | Incomplete answers/localStorage change. | PRESERVE EXACTLY | Deterministic journeys. |
| Field Manual | `field-manual.html/js` | Static chapters, generated TOC/progress. | Mobile TOC. | JS disabled no TOC. | PRESERVE CONTENT | Content extraction diff. |
| Random base | homepage/base links if present | Navigate to random known base. | Same. | Empty data. | OPEN QUESTION | Verify implementation before V2. |
| Footer | `site-footer.js` | Common footer links. | Stacked mobile. | Script fail. | PRESERVE INTENT | Link check. |
| URL state/SEO | `slug.js`, `seo.js`, sitemap | Clean canonical URLs with legacy support. | Same. | Root slug collisions. | PRESERVE EXACTLY until owner decision | Canonical route tests. |
| Image behaviour | image helpers, assets | `/images/bases/<slug>.png`, placeholder fallback. | Same source scaled. | Root duplicates. | IMPROVE AFTER PARITY | Missing-image test. |
