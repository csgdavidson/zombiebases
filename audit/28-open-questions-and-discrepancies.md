# 28 Open Questions and Discrepancies

1. Cloudflare dashboard vs `_redirects`: brief implies dashboard rules may exist beyond repository rules. Actual repo lacks clean `/compare`, `/rankings`, `/scenarios` rules. Should V2 preserve dashboard-only aliases or make routing fully repository-owned?
2. Canonical root slug vs `/base/:slug`: V1 supports both. Which should be canonical in V2: `/:slug` or `/base/:slug`?
3. Image count/duplicates: current measured PNG inventory is 123 files including root duplicates and 112 `images/bases` files. Should root duplicate PNGs be retired after redirects or migrated as legacy assets?
4. V2 pilot content in `js/base.js`: should hard-coded pilot sections become structured base data or be removed after parity?
5. Missing `scripts/generate-base-page-metadata.py`: `package.json` references it but file is absent. Is this abandoned or missing from the repo?
6. `data/base-matrix-source.json`: should stale/legacy matrix entries be archived, reconciled to `bases-index`, or used as source lineage?
7. Scenario formulas: are current four formula names and constants product-approved, or should V2 preserve them only as V1 parity then revisit?
8. Client-side SEO vs sitemap: should V2 generate server/static metadata for every sitemap URL instead of relying on JS hydration?
9. Rankings generator drift: rerunning `generate-rankings.py` changes Isle of Eigg summary in `rankings.json`. Should committed generated JSON be refreshed before V2 baseline snapshot?
10. Accessibility baseline: is V2 expected to remediate map/quiz/compare ARIA issues during parity, or after exact behavioural parity?
