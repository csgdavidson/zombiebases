# 05 Component Inventory

## Shared browser globals

| Global | Source | Consumers | Responsibility |
|---|---|---|---|
| `window.baseSlugHelper` | `js/slug.js` | base, compare, rankings, scenarios, main, quiz | Slug aliases, reserved routes, clean URL generation/parsing. |
| `window.seo` | `js/seo.js` | main, base, compare, rankings, scenarios, field manual | Metadata, canonical links, social tags, JSON-LD. |
| `window.baseCardRenderer` | `js/base-card.js` | main, rankings, scenarios | Shared base card markup and scenario badges. |
| `window.zombieBaseFilterTaxonomy` | `js/filter-taxonomy.js` | main | Type/region labels for homepage filters. |
| `window.createBaseMap` | `js/map.js` | main | Leaflet map initialization and marker updates. |
| `window.quizQuestions` | `js/quiz-questions.js` | quiz engine/UI/tests | Quiz axes and questions. |
| `window.quizEngine` | `js/quiz-engine.js` | quiz UI/tests | Recommendation and compatibility algorithm. |
| `window.quizStorage` | `js/quiz.js` | debugging/tests/manual use | Quiz persistence helpers. |
| `window.zombieBasesComparison` | `js/compare.js` | tests/manual use | Compare formulas and helper functions. |

## Component patterns

* **Cards:** `js/base-card.js` is the closest thing to a reusable UI component. Homepage, rankings and scenarios all use it. Base detail and quiz still have separate card templates.
* **Labels:** Taxonomy label maps are duplicated in multiple files (`main`, `base`, `compare`, `rankings`, `scenarios`, `quiz-engine`) rather than imported from one source.
* **Metadata:** `js/seo.js` is shared, but each page composes page-specific titles/descriptions and JSON-LD separately.
* **Footer and navigation:** `site-footer.js` and `mobile-nav.js` inject/enhance common navigation. They rely on document load and CSS class conventions.
* **Selectors/autocomplete:** Compare implements its own rich selector. Homepage filters use standard selects/input. Quiz is separate again.

## Coupling and load-order assumptions

Scripts are non-module globals. HTML order must load helpers before consumers. For example, page scripts assume `window.baseSlugHelper`, `window.seo` or `window.baseCardRenderer` may already exist; many use optional chaining as a fallback, but shared behaviour is best when all helper scripts load successfully.

## Duplication hotspots

* Region/type label maps.
* Score formatting and score tone thresholds.
* Base image URL derivation.
* Base URL generation fallbacks.
* Search text construction across homepage, compare selector and mobile header search.
* Card-like markup between base cards, similar base cards, quiz alternatives and compare matchup cards.
