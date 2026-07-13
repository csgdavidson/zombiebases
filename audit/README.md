# Repository Audit

This folder contains the evidence-focused ZombieBases V1 audit. V1 is in code freeze; production code, source data, styles, scripts, generated assets, deployment configuration and dependencies were not intentionally modified. Only files under `/audit` are final changes.

## Methodology

Scope covers V1 user-facing behaviour, data schemas, routing, scoring, quiz, compare, SEO, assets, accessibility, security, performance and V2 parity risks. Required pre-reading was completed: root `README.md`, the Product/User Behaviour brief, the Technical Context brief and every pre-existing `/audit` file. Implementation was inspected directly across root HTML, `js/`, `css/`, `data/`, `scripts/`, `tests/`, `_redirects`, `sitemap.xml`, and selected generated duplicate pages.

Repository commit audited: `e3b23b8e557d6408bd7bb48bdaeac107b68632fe`.
Audit timestamp: `2026-07-12T21:17:59Z` UTC.

## Verification status vocabulary

* VERIFIED: confirmed by a command, test, validator or reproducible calculation.
* INSPECTED: confirmed by static source/data inspection.
* INFERRED: likely from available evidence, but not conclusively exercised.
* UNKNOWN: insufficient evidence or unavailable external system.

## Commands and results

See `18-verification-log.md`. npm scripts were run (`npm run build`). Node tests were run (`node --test tests/*.test.js`). Python validators were run (`validate-bases`, `validate-discovery`, `validate-interpretations`). Python generators were run for rankings, base stats and build-side assets/clean pages; temporary production diffs were documented and reverted. No local static server or live Cloudflare deployment was run.

## Files/directories inspected

Root briefs and README, existing audit files, `*.html`, `js/*.js`, `css/styles.css`, `data/*.json`, `scripts/*.py`, `tests/*.js`, `_redirects`, `sitemap.xml`, `robots.txt`, `.github/workflows/sitemap.yml`, image directories and root duplicate PNG candidates.

## Public routes inspected

`/`, `/base.html?slug=...`, `/base/:slug`, `/:slug`, `/compare.html`, `/compare.html?a=...&b=...`, `/base/:slugA/vs/:slugB`, `/rankings.html`, `/rankings-region.html?region=...`, `/rankings-type.html?type=...`, `/scenarios.html?scenario=...`, `/quiz.html`, `/quiz`, `/field-manual.html`, `/field-manual`.

## Confidence summary

High confidence: dataset counts, JSON validity, compare formulas, quiz formulas, scenario formulas, validator status, asset byte counts, routing rules present in repository. Medium confidence: browser-visible route status on Cloudflare, accessibility impact, LCP candidates. Low/UNKNOWN: actual Cloudflare dashboard redirect order beyond the technical brief and real assistive technology behaviour.

## Production change confirmation

Temporary generator outputs outside `/audit` were reverted or removed. Final committed changes are limited to `/audit`.
