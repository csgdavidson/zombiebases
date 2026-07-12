# 03 Page Inventory

## Homepage / Explore (`index.html`, `js/main.js`)

The homepage is both marketing and catalogue. It renders hero content, statistics, type/category cards, popular links, controls, list view and optional map view. Runtime behaviour is driven by `js/main.js`, which fetches `data/bases-index.json`, filters the data, sorts it, updates the URL, renders cards through `window.baseCardRenderer`, and optionally updates a Leaflet map via `window.createBaseMap`.

Key behaviours:

* query, region, type, sort and view state are read from URL parameters;
* filtering is cumulative;
* search matches base name, country, type label/key, region label/key, description summary and aliases;
* list cards link to preferred clean base URLs;
* category cards set a type filter and scroll to the explorer;
* JSON-LD item list metadata is updated client-side for current visible items.

## Base detail (`base.html`, `js/base.js`)

The base page is the richest page. It resolves a slug from query parameters or clean path, fetches base data and derived datasets, finds the selected base, then renders hero, score summaries, narrative, rankings context, survival profile, comparison recommendations, similar bases, SEO metadata and optional V2 pilot sections for hard-coded pilot bases.

Key dependencies:

* `data/bases-index.json` for base content and scores;
* `data/rankings.json` for global/region/type rank context;
* `data/discovery.json` for similar bases and scenario hints;
* `data/interpretations.json` for score bands/archetypes when available;
* `js/slug.js` for clean URL parsing and preferred link generation;
* `js/seo.js` for canonical and structured data.

## Compare (`compare.html`, `js/compare.js`)

Compare supports two modes in one shell:

1. no complete pair selected: show setup selectors and curated matchups;
2. pair selected through query parameters or clean compare route: render the comparison result.

The result page builds eight scoreboard rows: Overall, Defensibility, Sustainability, Isolation, Exposure Control, Maintenance Resilience, Population Capacity and Resource Security. It computes winner/tie status per row, category win counts, largest advantages, weighted overall winner and radar chart SVG.

## Rankings (`rankings.html`, `rankings-region.html`, `rankings-type.html`, `js/rankings.js`)

One script powers all three ranking shells. Mode is inferred from body/page attributes or page IDs. The script fetches `data/rankings.json`, then renders global entries or a selected group from `byRegion`/`byType`. Region/type pages expose a dropdown and update query parameters.

## Scenarios (`scenarios.html`, `js/scenarios.js`)

Scenario rankings fetch `data/discovery.json`, populate a scenario selector from `scenarioOrder`, and render the selected scenario's generated entries. Each entry includes scenario rank, scenario score, scenario reason and normal base card fields.

## Quiz (`quiz.html`, `js/quiz-questions.js`, `js/quiz-engine.js`, `js/quiz.js`)

The quiz shell loads question config, recommendation engine and UI controller. It fetches bases, presents 12 single-choice questions, calculates a user vector/profile, recommends bases, stores completed results in localStorage, and can reconstruct a previous result.

## Field Manual (`field-manual.html`, `js/field-manual.js`)

The Field Manual is long-form static HTML. JavaScript derives table of contents from `.field-section` elements, tracks active section via `IntersectionObserver`, updates a progress bar and applies metadata.

## Static support pages/files

* `robots.txt` allows all crawlers and points to the production sitemap.
* `google4e6ab63a51472490.html` is an empty Google verification file.
* `CNAME` contains the custom domain for Pages hosting.
* `SECURITY.md` is repository-level security policy documentation, not app runtime code.
