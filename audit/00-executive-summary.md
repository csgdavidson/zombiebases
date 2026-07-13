# 00 — Executive summary

Status: RED-TEAM UPDATED 2026-07-13.

This pass re-read the root README, both root ZombieBases briefing documents, all existing `/audit` files, and relevant V1 source/data for scoring, scenarios, compare, quiz, routing, SEO and content migration. Evidence labels used throughout: VERIFIED, INSPECTED, INFERRED and UNKNOWN.

## What was verified

* VERIFIED: compare helper behaviour and quiz engine behaviour with `node --test tests/*.test.js`.
* VERIFIED: scenario/discovery and interpretation generated data match generators with `python3 scripts/validate-discovery.py` and `python3 scripts/validate-interpretations.py`.
* VERIFIED: new audit evidence JSON and `inventory.json` validate as JSON.
* INSPECTED: source-to-screen data lineage, nested JSON shapes, route rewrites, sitemap/canonical duplication, Field Manual structure, image conventions and parity behaviours.

## Contradictions resolved

* Maintenance contradiction resolved conclusively: V1 stores `comparisonScores.maintenanceBurden.score`, but the user-facing and algorithmic score is **Maintenance Resilience**, higher-is-better. Prior lower-is-better/inversion statements are superseded by `audit/29-scoring-compare-quiz-red-team.md` and fixtures.
* Cloudflare/dashboard certainty qualified: repository routes are inspected; dashboard-only rules remain UNKNOWN without owner/live verification.
* Scenario, compare and quiz summaries are now fixture-backed instead of only prose-backed.

## Confidence by subsystem

| Subsystem | Confidence | Reason |
|---|---|---|
| Scoring dictionary | High | Source/data inspected; fixtures created. |
| Scenario formulas | High | Generator validator passed and worked examples captured. |
| Compare contract | High for helpers, medium for browser UI | Node tests passed; UI source inspected but not browser-tested. |
| Quiz engine | High for algorithm, medium for browser UI/accessibility | Node tests passed; UI source inspected. |
| Data/content schema | Medium-high | Observed shapes snapshotted; semantic editorial intent still needs owner decisions. |
| Routing/SEO | Medium | Repo rules inspected; live Cloudflare dashboard remains UNKNOWN. |
| Media | Medium | Paths/duplicates inspected; dimensions/alt governance need migration decisions. |
| Parity matrix | Medium-high | Granular enough for V2 acceptance-test planning, but needs conversion into executable tests. |

## Readiness for V2 architecture planning

Scoring, scenarios, compare, quiz and data contracts are now sufficient to begin V2 architecture planning, with one caveat: live Cloudflare/dashboard behaviour and final CMS/media ownership decisions require owner confirmation before implementation freeze. Routing is sufficient for repository parity planning but not for claiming deployed-route truth.
