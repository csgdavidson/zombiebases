# 00 Executive Summary

## Audit methodology and verification status

Second-pass audit was performed at commit `e3b23b8e557d6408bd7bb48bdaeac107b68632fe` on `2026-07-12T21:17:59Z`. The root README, both briefing documents, every existing audit file and the current implementation were inspected. Verification used Node tests, Python validators/generators, static data inspection and deterministic calculation fixtures. No local browser/server, Lighthouse, axe, screen reader or live Cloudflare dashboard test was run.

Commands passed: `node --test tests/*.test.js`, `python3 scripts/validate-bases.py`, `python3 scripts/validate-discovery.py`, `python3 scripts/validate-interpretations.py`, `npm run build`, JSON validation for `audit/inventory.json`. Temporary generator diffs outside `/audit` were reverted.

## Ten most important verified findings

1. Canonical base data is `data/bases-index.json` with 111 bases.
2. Overall score is stored/authored at `scores.overall`; V1 has no authoritative runtime overall formula.
3. Scenario formulas are deterministic in `scripts/generate-discovery.py` and discovery validation passes.
4. Compare uses eight rows, `WIN_EPSILON=0.05`, 0-10 clamping and stored compare scores.
5. Quiz has seven axes, twelve fixed questions, six profiles and deterministic compatibility sorting.
6. Node tests cover compare helpers and quiz engine only; they pass.
7. Python base/discovery/interpretation validators pass.
8. `npm run build` succeeds but produces uncommitted generated thumbnails outside tracked files.
9. Image payload is large: 123 PNG files totaling ~350 MB.
10. Clean base routing depends on Cloudflare rewrites plus reserved-route slug logic.

## Highest migration risks

1. Multiple score systems must not be collapsed accidentally.
2. Root-level slugs collide with product/static routes.
3. Client-side SEO means sitemap URLs may not have static metadata.
4. Generated data can drift; rankings rerun changed Isle of Eigg summary.
5. Quiz result reconstruction changes when data changes.
6. Compare narrative relies on specific row semantics and tie thresholds.
7. Field Manual content is embedded HTML.
8. Image filename convention and root duplicates complicate migration.
9. Accessibility issues in custom selectors, quiz controls and map need remediation.
10. Cloudflare dashboard rules are not fully verifiable from the repo.

## Discrepancies and unknowns

Main discrepancies: technical brief/dashboard routing may exceed `_redirects`; package script references missing `generate-base-page-metadata.py`; committed rankings JSON drifts from current generator/source text; clean canonical choice between root slug and `/base/:slug` remains unresolved; legacy `base-matrix-source` role is unclear.

## Readiness verdict

The audit is sufficient to begin V2 architecture planning for data model, routing, scoring, compare and quiz parity. It is not sufficient to claim complete production behaviour verification until live Cloudflare rules, browser accessibility, performance metrics and visual route rendering are tested.
