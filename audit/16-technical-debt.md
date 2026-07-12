# 16 Technical Debt

## Data and scoring debt

* Overall score is stored without a visible authoritative formula in V1.
* Generated datasets can drift from `bases-index.json` unless validators/generators are run consistently.
* Scenario formulas live in Python while scenario rendering lives in JavaScript.
* Quiz scoring lives entirely in JavaScript and is not represented in external data.
* Region/type labels are duplicated in multiple scripts.

## Routing debt

* Root-level `/:slug` clean base routes require a reserved-route list and careful rewrite order.
* Several equivalent URLs can represent the same base or compare result.
* Region/type/scenario route families are query-driven rather than clean nested paths.

## Frontend architecture debt

* Non-module global scripts make load order and global naming important.
* Large page scripts combine data loading, state management, rendering, SEO and event binding.
* `css/styles.css` is a single large stylesheet for the entire application.
* Complex HTML strings are constructed manually, increasing escaping and maintainability risk.

## Content debt

* Field Manual rich content is embedded in HTML.
* Base editorial copy is structured only as nested JSON and manually templated in JS.
* V2 pilot content exists as hard-coded JavaScript structures in `js/base.js`, not data.

## Asset debt

* Image metadata is minimal; no per-asset alt text, role, dimensions or attribution.
* PNG-only conventions and root duplicate assets complicate inventory.
* Thumbnail generation does not optimize images.

## SEO/performance/accessibility debt

* Many metadata updates and JSON-LD blocks are client-side.
* Map depends on external tile and library availability.
* No automated accessibility or Lighthouse checks are configured.
* No dependency scanning is meaningful because there are no declared npm dependencies, while browser CDN dependencies still exist in HTML.
