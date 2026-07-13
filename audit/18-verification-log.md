# 18 Verification Log

Audit commit: `e3b23b8e557d6408bd7bb48bdaeac107b68632fe`. Audit time: `2026-07-12T21:17:59Z`.

| Command | Purpose | Result | Exit | Generated diff |
|---|---|---|---:|---|
| `git rev-parse HEAD` | Identify audited revision. | `e3b23b8e557d6408bd7bb48bdaeac107b68632fe`. | 0 | None. |
| `date -u +%Y-%m-%dT%H:%M:%SZ` | Timestamp audit. | `2026-07-12T21:17:59Z`. | 0 | None. |
| `node --test tests/*.test.js` | Run Node compare/quiz tests. | 2 tests passed: `tests/compare-utils.test.js`, `tests/quiz-engine.test.js`. | 0 | None. |
| `python3 scripts/validate-bases.py` | Validate canonical base data. | `Validation passed for 111 bases.` | 0 | None. |
| `python3 scripts/validate-discovery.py` | Regenerate discovery in memory and compare committed JSON. | `Discovery validation passed.` | 0 | None. |
| `python3 scripts/validate-interpretations.py` | Regenerate interpretations in memory and compare committed JSON. | `Interpretations validation passed.` | 0 | None. |
| `python3 scripts/generate-rankings.py` | Test rankings generator. | Wrote `data/rankings.json`. | 0 | Temporary diff: timestamp plus updated Isle of Eigg summary text in generated rankings; reverted. |
| `python3 scripts/generate-base-stats.py` | Test stats generator. | Wrote `data/base-stats.json`. | 0 | Temporary diff: `generatedAt` timestamp only; reverted. |
| `npm run build` | Run npm build wrapper. | Generated 112 card thumbnails and clean page duplicates. npm warned `Unknown env config "http-proxy"`. | 0 | Temporary untracked `images/generated/card-thumbs` and `scripts/__pycache__`; removed. Clean page copies unchanged after revert. |
| `git status --short` | Confirm no production changes after temporary generation. | Clean before audit edits; after audit only `/audit` changed. | 0 | None. |
| `python3 -m json.tool audit/inventory.json` | Validate machine-readable inventory JSON. | Passed after repair. | 0 | `/audit/inventory.json` updated. |

## Routes exercised

No browser static server was run. Route behaviour is INSPECTED from `_redirects`, HTML shells, `js/slug.js`, sitemap and page scripts. Node tests exercise compare and quiz pure logic but not browser rendering.

## Limitations

* No real Cloudflare Pages dashboard access; dashboard behaviour is taken from the technical context briefing, not live configuration.
* No visual browser, screen reader, Lighthouse or axe run; accessibility/performance findings are static except byte counts and tests above.
* Generated thumbnails were not retained because production/generated assets are outside the allowed `/audit` write scope.
