# 32 — Audit contradictions and quality review

Status: INSPECTED across existing `/audit` files and corrected/qualified here.

| Issue | Current claim | Corrected/qualified claim | Evidence | Updated? |
|---|---|---|---|---|
| Maintenance semantics | Some files call `maintenanceBurden` inverted/lower-is-better. | V1 stores field `comparisonScores.maintenanceBurden.score` but treats higher raw values as better Maintenance Resilience. No compare inversion is active because `higherIsBetter:true`. | `js/compare.js` `SCORE_ROWS`, `normalizedDiff`; `tests/compare-utils.test.js`; `audit/evidence/scoring-fixtures.json`. | Yes: new red-team doc, executive summary, risk note. |
| Cloudflare dashboard certainty | Earlier routing docs imply clean/dashboard behaviour as if active. | Repo rules are verified; dashboard-only rules are UNKNOWN unless owner/live test confirms. | `_redirects`, technical brief, `audit/evidence/route-contract.json`. | Yes. |
| Scenario examples depth | Earlier docs gave formulas and a few examples. | Exact fixture-backed examples now include inputs, penalties, unrounded/final/rank/reason. | `audit/evidence/scoring-fixtures.json`; validator. | Yes. |
| Quiz completeness | Earlier quiz docs summarized questions/profiles. | Complete question/answer/profile snapshot and six deterministic journeys now exist. | `audit/evidence/quiz-fixtures.json`; `node --test tests/quiz-engine.test.js`. | Yes. |
| Data schema vagueness | Earlier schema used summary phrases for nested narrative properties. | Machine-readable schema snapshots enumerate nested observed fields and representative full records. | `audit/evidence/base-schema.json`, `generated-data-schemas.json`. | Yes. |
| Parity granularity | Existing matrix used one row for whole complex pages. | New matrix decomposes global, homepage, detail, compare, rankings, quiz, Field Manual and technical behaviours into acceptance-test items. | `audit/33-granular-v1-v2-parity-matrix.md`. | Yes. |
| Live verification | Some audit wording could be read as live production verification. | This pass did not live-test Cloudflare; remote deployed behaviour remains UNKNOWN. | Command log and route evidence. | Yes. |

No accurate existing material was intentionally rewritten for style; this pass adds red-team evidence and superseding corrections.
