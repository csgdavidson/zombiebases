# 31 — Routing, SEO and operations red-team

Status: INSPECTED from `_redirects`, sitemap, HTML shells and JS helpers; UNKNOWN for Cloudflare dashboard rules not present in the repository. Evidence: `audit/evidence/route-contract.json` and `audit/evidence/redirect-matrix.json`.

## C1/C2 route reconciliation

Repository truth: `_redirects` defines clean quiz, Field Manual, compare, `/base/:slug`, and root `/:slug` base rewrites. Query routes remain active for base, compare, rankings and scenarios. `quiz/index.html` and `field-manual/index.html` duplicate generated clean pages. Dashboard-only clean aliases for `/compare`, `/rankings` or `/scenarios` are not verifiable from the repo and remain UNKNOWN.

Conflicts: root base routes can collide with future product routes; `/base/:slug` and `/:slug` duplicate base detail pages; compare clean and query routes duplicate results; quiz/Field Manual combine rewrites and directory duplicates; static asset paths rely on filesystem precedence before the catch-all; unknown slugs serve the base shell and need JS to show not-found.

## C3 SEO truth

INSPECTED page families:

* Homepage has raw HTML metadata and runtime enhancements; sitemap includes `/`; JS-disabled crawlers see shell/static hero but not full cards.
* Base detail has generic raw shell metadata; runtime JS sets title, meta description, canonical and structured data from base data. Duplicate URL risk exists across `/base.html?slug=`, `/base/:slug`, and `/:slug`.
* Compare has setup/result shell metadata; runtime pair pages canonicalize clean compare when possible. Query compare URLs remain duplicate representations.
* Rankings/scenarios are query-driven; sitemap includes canonical generated URLs but runtime JS is required for populated lists and structured ItemList data.
* Quiz result pages are personalised and localStorage-driven; indexability should focus on landing/profile content, not individual results.
* Field Manual content is mostly crawler-visible static HTML; JS improves TOC/progress/reading-time.

Sitemap validation against route contract found duplicate/contradictory representations where legacy query URLs and clean URLs can represent the same entity. Robots treatment is repository `robots.txt`; no noindex controls for duplicate query variants were verified.

## C4 build and generated-data truth

VERIFIED commands in this pass: `node --test tests/*.test.js`, `python3 scripts/validate-discovery.py`, `python3 scripts/validate-interpretations.py`, JSON validators for new audit evidence/inventory, and `git diff --name-only` to ensure only `/audit` changed. Production generators that write files were not left dirty; no production file modifications remain.

## C5 deployed-versus-repository uncertainty

* Definitely active in repository: files, `_redirects`, sitemap, robots, JS helpers, generated duplicate quiz/Field Manual pages.
* Expected active on Cloudflare: repository `_redirects` if deployed by Cloudflare Pages.
* Documented in brief/screenshots: possible dashboard rules and transform order.
* Unable to verify remotely: actual dashboard rule precedence/live cache behaviour.
* Obsolete/duplicate: query base/compare URLs and duplicate clean base paths.
* Requires owner confirmation: whether V2 must preserve dashboard-only aliases not represented in git.
