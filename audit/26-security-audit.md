# 26 Security Audit

Status: static INSPECTED; no dependency scanner meaningful because package has no dependencies.

| Severity | Finding | Evidence | Impact / recommendation |
|---|---|---|---|
| Medium | Many templates build HTML strings from JSON data. | `js/base-card.js`, `js/base.js`, `js/compare.js`, `js/quiz.js`. | Data is repository-controlled, so risk is low for users today, but V2 should escape by default and treat JSON as untrusted. |
| Medium | External CDN/map dependencies lack documented SRI/CSP. | HTML map/library includes and Leaflet/OpenStreetMap usage. | Add SRI where possible or self-host; define CSP. |
| Low | Query/path slugs control lookups and metadata. | `js/slug.js`, compare/base route parsing. | No open redirect found; continue strict slug resolution and encode URL components. |
| Low | localStorage quiz results are trusted for reconstruction inputs. | `js/quiz.js`. | Stored answers can be tampered with locally only; validate schema/version before use. |
| Low | All JSON data is public by design. | `data/*.json`. | Ensure no future private notes/secrets enter public datasets. |

No hard-coded secrets/tokens were found in inspected app code. No mixed-content URLs were confirmed. Open redirect risk appears low because navigation is generated from known slugs or internal paths. Dependency provenance risk exists for browser CDN libraries even though npm dependency count is zero.
