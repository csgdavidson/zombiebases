# 34 — V2 Decision Alignment Review

Status: FINAL DECISION-ALIGNMENT REVIEW. Scope limited to `/audit`; no production code changed. Owner decisions in `V2_DECISIONS.md` are treated as authoritative.

Architecture planning can begin after this review, provided it answers the checklist in `36-architecture-input-checklist.md`. No approved decision is technically impossible or internally contradictory.

### D1 — Public URLs and routing

- **Decision:** root-level base URLs owned by Next.js; no Cloudflare app routing.
- **Affected V1 systems:** _redirects, js/slug.js, sitemap.xml; routes /, /{slug}, /base/{slug}, /compare, /base/{a}/vs/{b}.
- **V1 evidence:** audit confirms static HTML shells, JSON source/generated datasets, Cloudflare `_redirects`, slug helpers, client search, compare and quiz tests. Direct files: _redirects, js/slug.js, sitemap.xml.
- **Preserved behaviour:** keep public discovery mental model, root clean base URL experience where applicable, deterministic scoring/explanations, no sign-up, responsive browser interaction, shareable result URLs, and existing catalogue/search intent.
- **Deliberate change:** replace V1 static shell plus client/generated JSON pattern with Next-owned routing, generated cached HTML, Supabase source records, R2 media, and derived outputs computed during generation/revalidation rather than committed as product truth.
- **Implementation constraints:** architecture must centralise slug resolution, live-content filtering, deterministic engines, relationship lookup and escaping; root namespace needs reserved-route enforcement before publication.
- **SEO implications:** server HTML, metadata, canonicals, sitemap and permanent redirects must agree; legacy `.html`, query and `/base/:slug` forms need canonical treatment.
- **Caching/revalidation implications:** cache tags must include changed source record, related taxonomy, homepage catalogue/statistics, ranking/scenario dependencies, compare/quiz catalogue snapshots where live set changes, sitemap and metadata. Scheduled `publish_at` requires automatic timed revalidation.
- **Data implications:** only source/config/media/publishing records are authoritative; generated rankings, scenario outputs, comparison results, quiz matches and aggregate stats are rebuildable caches/fixtures, not editorial data.
- **Testing implications:** convert V1 fixtures for routing, catalogue filtering, rankings/scenarios, compare, quiz, sitemap and media fallback into automated parity tests.
- **Migration risks:** slug collision, missed redirect/canonical, stale cache after scheduled publication, leaking draft content, server/client formula drift, media metadata gaps, and accidental loss of V1 client interactions.
- **Confidence:** High for repository-observed behaviour; Medium for live Cloudflare dashboard-only behaviour because prior audit marks it unknown.
- **Unresolved questions:** none that block architecture planning; architecture must choose concrete route names, tag names, scheduler mechanism and redirect status codes.

### D2 — Rendering and caching

- **Decision:** generated cached HTML with on-demand dependency revalidation.
- **Affected V1 systems:** index.html, base.html, rankings.html, field-manual.html, compare.html, quiz.html; routes /, /{slug}, /rankings, /regions/*, /types/*, /scenarios/*, /field-manual, /compare/*, /quiz.
- **V1 evidence:** audit confirms static HTML shells, JSON source/generated datasets, Cloudflare `_redirects`, slug helpers, client search, compare and quiz tests. Direct files: index.html, base.html, rankings.html, field-manual.html, compare.html, quiz.html.
- **Preserved behaviour:** keep public discovery mental model, root clean base URL experience where applicable, deterministic scoring/explanations, no sign-up, responsive browser interaction, shareable result URLs, and existing catalogue/search intent.
- **Deliberate change:** replace V1 static shell plus client/generated JSON pattern with Next-owned routing, generated cached HTML, Supabase source records, R2 media, and derived outputs computed during generation/revalidation rather than committed as product truth.
- **Implementation constraints:** architecture must centralise slug resolution, live-content filtering, deterministic engines, relationship lookup and escaping; root namespace needs reserved-route enforcement before publication.
- **SEO implications:** server HTML, metadata, canonicals, sitemap and permanent redirects must agree; legacy `.html`, query and `/base/:slug` forms need canonical treatment.
- **Caching/revalidation implications:** cache tags must include changed source record, related taxonomy, homepage catalogue/statistics, ranking/scenario dependencies, compare/quiz catalogue snapshots where live set changes, sitemap and metadata. Scheduled `publish_at` requires automatic timed revalidation.
- **Data implications:** only source/config/media/publishing records are authoritative; generated rankings, scenario outputs, comparison results, quiz matches and aggregate stats are rebuildable caches/fixtures, not editorial data.
- **Testing implications:** convert V1 fixtures for routing, catalogue filtering, rankings/scenarios, compare, quiz, sitemap and media fallback into automated parity tests.
- **Migration risks:** slug collision, missed redirect/canonical, stale cache after scheduled publication, leaking draft content, server/client formula drift, media metadata gaps, and accidental loss of V1 client interactions.
- **Confidence:** High for repository-observed behaviour; Medium for live Cloudflare dashboard-only behaviour because prior audit marks it unknown.
- **Unresolved questions:** none that block architecture planning; architecture must choose concrete route names, tag names, scheduler mechanism and redirect status codes.

### D3 — Supabase source-data-only model

- **Decision:** Supabase stores source/config/scores only; derived outputs regenerated.
- **Affected V1 systems:** data/bases-index.json, data/rankings.json, data/discovery.json, data/interpretations.json, data/base-stats.json; routes all public routes.
- **V1 evidence:** audit confirms static HTML shells, JSON source/generated datasets, Cloudflare `_redirects`, slug helpers, client search, compare and quiz tests. Direct files: data/bases-index.json, data/rankings.json, data/discovery.json, data/interpretations.json, data/base-stats.json.
- **Preserved behaviour:** keep public discovery mental model, root clean base URL experience where applicable, deterministic scoring/explanations, no sign-up, responsive browser interaction, shareable result URLs, and existing catalogue/search intent.
- **Deliberate change:** replace V1 static shell plus client/generated JSON pattern with Next-owned routing, generated cached HTML, Supabase source records, R2 media, and derived outputs computed during generation/revalidation rather than committed as product truth.
- **Implementation constraints:** architecture must centralise slug resolution, live-content filtering, deterministic engines, relationship lookup and escaping; root namespace needs reserved-route enforcement before publication.
- **SEO implications:** server HTML, metadata, canonicals, sitemap and permanent redirects must agree; legacy `.html`, query and `/base/:slug` forms need canonical treatment.
- **Caching/revalidation implications:** cache tags must include changed source record, related taxonomy, homepage catalogue/statistics, ranking/scenario dependencies, compare/quiz catalogue snapshots where live set changes, sitemap and metadata. Scheduled `publish_at` requires automatic timed revalidation.
- **Data implications:** only source/config/media/publishing records are authoritative; generated rankings, scenario outputs, comparison results, quiz matches and aggregate stats are rebuildable caches/fixtures, not editorial data.
- **Testing implications:** convert V1 fixtures for routing, catalogue filtering, rankings/scenarios, compare, quiz, sitemap and media fallback into automated parity tests.
- **Migration risks:** slug collision, missed redirect/canonical, stale cache after scheduled publication, leaking draft content, server/client formula drift, media metadata gaps, and accidental loss of V1 client interactions.
- **Confidence:** High for repository-observed behaviour; Medium for live Cloudflare dashboard-only behaviour because prior audit marks it unknown.
- **Unresolved questions:** none that block architecture planning; architecture must choose concrete route names, tag names, scheduler mechanism and redirect status codes.

### D4 — Browser catalogue search/filter/sort

- **Decision:** compact published catalogue in browser; no Supabase query per normal search.
- **Affected V1 systems:** index.html, js/main.js, js/base-card.js, js/map.js, js/mobile-nav.js; routes /, /?q=&region=&type=&sort=&view=.
- **V1 evidence:** audit confirms static HTML shells, JSON source/generated datasets, Cloudflare `_redirects`, slug helpers, client search, compare and quiz tests. Direct files: index.html, js/main.js, js/base-card.js, js/map.js, js/mobile-nav.js.
- **Preserved behaviour:** keep public discovery mental model, root clean base URL experience where applicable, deterministic scoring/explanations, no sign-up, responsive browser interaction, shareable result URLs, and existing catalogue/search intent.
- **Deliberate change:** replace V1 static shell plus client/generated JSON pattern with Next-owned routing, generated cached HTML, Supabase source records, R2 media, and derived outputs computed during generation/revalidation rather than committed as product truth.
- **Implementation constraints:** architecture must centralise slug resolution, live-content filtering, deterministic engines, relationship lookup and escaping; root namespace needs reserved-route enforcement before publication.
- **SEO implications:** server HTML, metadata, canonicals, sitemap and permanent redirects must agree; legacy `.html`, query and `/base/:slug` forms need canonical treatment.
- **Caching/revalidation implications:** cache tags must include changed source record, related taxonomy, homepage catalogue/statistics, ranking/scenario dependencies, compare/quiz catalogue snapshots where live set changes, sitemap and metadata. Scheduled `publish_at` requires automatic timed revalidation.
- **Data implications:** only source/config/media/publishing records are authoritative; generated rankings, scenario outputs, comparison results, quiz matches and aggregate stats are rebuildable caches/fixtures, not editorial data.
- **Testing implications:** convert V1 fixtures for routing, catalogue filtering, rankings/scenarios, compare, quiz, sitemap and media fallback into automated parity tests.
- **Migration risks:** slug collision, missed redirect/canonical, stale cache after scheduled publication, leaking draft content, server/client formula drift, media metadata gaps, and accidental loss of V1 client interactions.
- **Confidence:** High for repository-observed behaviour; Medium for live Cloudflare dashboard-only behaviour because prior audit marks it unknown.
- **Unresolved questions:** none that block architecture planning; architecture must choose concrete route names, tag names, scheduler mechanism and redirect status codes.

### D5 — Server rankings and scenarios

- **Decision:** deterministic TypeScript engines on server generation/revalidation.
- **Affected V1 systems:** scripts/generate-rankings.py, scripts/generate-discovery.py, data/rankings.json, data/discovery.json, js/rankings.js, js/scenarios.js; routes /rankings, /regions/*, /types/*, /scenarios/*, /{slug}.
- **V1 evidence:** audit confirms static HTML shells, JSON source/generated datasets, Cloudflare `_redirects`, slug helpers, client search, compare and quiz tests. Direct files: scripts/generate-rankings.py, scripts/generate-discovery.py, data/rankings.json, data/discovery.json, js/rankings.js, js/scenarios.js.
- **Preserved behaviour:** keep public discovery mental model, root clean base URL experience where applicable, deterministic scoring/explanations, no sign-up, responsive browser interaction, shareable result URLs, and existing catalogue/search intent.
- **Deliberate change:** replace V1 static shell plus client/generated JSON pattern with Next-owned routing, generated cached HTML, Supabase source records, R2 media, and derived outputs computed during generation/revalidation rather than committed as product truth.
- **Implementation constraints:** architecture must centralise slug resolution, live-content filtering, deterministic engines, relationship lookup and escaping; root namespace needs reserved-route enforcement before publication.
- **SEO implications:** server HTML, metadata, canonicals, sitemap and permanent redirects must agree; legacy `.html`, query and `/base/:slug` forms need canonical treatment.
- **Caching/revalidation implications:** cache tags must include changed source record, related taxonomy, homepage catalogue/statistics, ranking/scenario dependencies, compare/quiz catalogue snapshots where live set changes, sitemap and metadata. Scheduled `publish_at` requires automatic timed revalidation.
- **Data implications:** only source/config/media/publishing records are authoritative; generated rankings, scenario outputs, comparison results, quiz matches and aggregate stats are rebuildable caches/fixtures, not editorial data.
- **Testing implications:** convert V1 fixtures for routing, catalogue filtering, rankings/scenarios, compare, quiz, sitemap and media fallback into automated parity tests.
- **Migration risks:** slug collision, missed redirect/canonical, stale cache after scheduled publication, leaking draft content, server/client formula drift, media metadata gaps, and accidental loss of V1 client interactions.
- **Confidence:** High for repository-observed behaviour; Medium for live Cloudflare dashboard-only behaviour because prior audit marks it unknown.
- **Unresolved questions:** none that block architecture planning; architecture must choose concrete route names, tag names, scheduler mechanism and redirect status codes.

### D6 — Hybrid Compare

- **Decision:** server-render initial result; browser swaps use same deterministic engine.
- **Affected V1 systems:** compare.html, js/compare.js, tests/compare-utils.test.js; routes /compare, /compare/{a}-vs-{b}, /base/{a}/vs/{b}.
- **V1 evidence:** audit confirms static HTML shells, JSON source/generated datasets, Cloudflare `_redirects`, slug helpers, client search, compare and quiz tests. Direct files: compare.html, js/compare.js, tests/compare-utils.test.js.
- **Preserved behaviour:** keep public discovery mental model, root clean base URL experience where applicable, deterministic scoring/explanations, no sign-up, responsive browser interaction, shareable result URLs, and existing catalogue/search intent.
- **Deliberate change:** replace V1 static shell plus client/generated JSON pattern with Next-owned routing, generated cached HTML, Supabase source records, R2 media, and derived outputs computed during generation/revalidation rather than committed as product truth.
- **Implementation constraints:** architecture must centralise slug resolution, live-content filtering, deterministic engines, relationship lookup and escaping; root namespace needs reserved-route enforcement before publication.
- **SEO implications:** server HTML, metadata, canonicals, sitemap and permanent redirects must agree; legacy `.html`, query and `/base/:slug` forms need canonical treatment.
- **Caching/revalidation implications:** cache tags must include changed source record, related taxonomy, homepage catalogue/statistics, ranking/scenario dependencies, compare/quiz catalogue snapshots where live set changes, sitemap and metadata. Scheduled `publish_at` requires automatic timed revalidation.
- **Data implications:** only source/config/media/publishing records are authoritative; generated rankings, scenario outputs, comparison results, quiz matches and aggregate stats are rebuildable caches/fixtures, not editorial data.
- **Testing implications:** convert V1 fixtures for routing, catalogue filtering, rankings/scenarios, compare, quiz, sitemap and media fallback into automated parity tests.
- **Migration risks:** slug collision, missed redirect/canonical, stale cache after scheduled publication, leaking draft content, server/client formula drift, media metadata gaps, and accidental loss of V1 client interactions.
- **Confidence:** High for repository-observed behaviour; Medium for live Cloudflare dashboard-only behaviour because prior audit marks it unknown.
- **Unresolved questions:** none that block architecture planning; architecture must choose concrete route names, tag names, scheduler mechanism and redirect status codes.

### D7 — Hybrid Quiz

- **Decision:** browser answers/results; LocalStorage profile; no accounts/versioning.
- **Affected V1 systems:** quiz.html, js/quiz.js, js/quiz-engine.js, js/quiz-questions.js, tests/quiz-engine.test.js; routes /quiz.
- **V1 evidence:** audit confirms static HTML shells, JSON source/generated datasets, Cloudflare `_redirects`, slug helpers, client search, compare and quiz tests. Direct files: quiz.html, js/quiz.js, js/quiz-engine.js, js/quiz-questions.js, tests/quiz-engine.test.js.
- **Preserved behaviour:** keep public discovery mental model, root clean base URL experience where applicable, deterministic scoring/explanations, no sign-up, responsive browser interaction, shareable result URLs, and existing catalogue/search intent.
- **Deliberate change:** replace V1 static shell plus client/generated JSON pattern with Next-owned routing, generated cached HTML, Supabase source records, R2 media, and derived outputs computed during generation/revalidation rather than committed as product truth.
- **Implementation constraints:** architecture must centralise slug resolution, live-content filtering, deterministic engines, relationship lookup and escaping; root namespace needs reserved-route enforcement before publication.
- **SEO implications:** server HTML, metadata, canonicals, sitemap and permanent redirects must agree; legacy `.html`, query and `/base/:slug` forms need canonical treatment.
- **Caching/revalidation implications:** cache tags must include changed source record, related taxonomy, homepage catalogue/statistics, ranking/scenario dependencies, compare/quiz catalogue snapshots where live set changes, sitemap and metadata. Scheduled `publish_at` requires automatic timed revalidation.
- **Data implications:** only source/config/media/publishing records are authoritative; generated rankings, scenario outputs, comparison results, quiz matches and aggregate stats are rebuildable caches/fixtures, not editorial data.
- **Testing implications:** convert V1 fixtures for routing, catalogue filtering, rankings/scenarios, compare, quiz, sitemap and media fallback into automated parity tests.
- **Migration risks:** slug collision, missed redirect/canonical, stale cache after scheduled publication, leaking draft content, server/client formula drift, media metadata gaps, and accidental loss of V1 client interactions.
- **Confidence:** High for repository-observed behaviour; Medium for live Cloudflare dashboard-only behaviour because prior audit marks it unknown.
- **Unresolved questions:** none that block architecture planning; architecture must choose concrete route names, tag names, scheduler mechanism and redirect status codes.

### D8 — R2 media plus Supabase metadata

- **Decision:** media files in R2; role metadata/relationships in Supabase.
- **Affected V1 systems:** images/bases/*.png, js/base-card.js, js/base.js, js/compare.js, scripts/generate-card-thumbnails.py; routes /, /{slug}, /rankings, /compare, /quiz.
- **V1 evidence:** audit confirms static HTML shells, JSON source/generated datasets, Cloudflare `_redirects`, slug helpers, client search, compare and quiz tests. Direct files: images/bases/*.png, js/base-card.js, js/base.js, js/compare.js, scripts/generate-card-thumbnails.py.
- **Preserved behaviour:** keep public discovery mental model, root clean base URL experience where applicable, deterministic scoring/explanations, no sign-up, responsive browser interaction, shareable result URLs, and existing catalogue/search intent.
- **Deliberate change:** replace V1 static shell plus client/generated JSON pattern with Next-owned routing, generated cached HTML, Supabase source records, R2 media, and derived outputs computed during generation/revalidation rather than committed as product truth.
- **Implementation constraints:** architecture must centralise slug resolution, live-content filtering, deterministic engines, relationship lookup and escaping; root namespace needs reserved-route enforcement before publication.
- **SEO implications:** server HTML, metadata, canonicals, sitemap and permanent redirects must agree; legacy `.html`, query and `/base/:slug` forms need canonical treatment.
- **Caching/revalidation implications:** cache tags must include changed source record, related taxonomy, homepage catalogue/statistics, ranking/scenario dependencies, compare/quiz catalogue snapshots where live set changes, sitemap and metadata. Scheduled `publish_at` requires automatic timed revalidation.
- **Data implications:** only source/config/media/publishing records are authoritative; generated rankings, scenario outputs, comparison results, quiz matches and aggregate stats are rebuildable caches/fixtures, not editorial data.
- **Testing implications:** convert V1 fixtures for routing, catalogue filtering, rankings/scenarios, compare, quiz, sitemap and media fallback into automated parity tests.
- **Migration risks:** slug collision, missed redirect/canonical, stale cache after scheduled publication, leaking draft content, server/client formula drift, media metadata gaps, and accidental loss of V1 client interactions.
- **Confidence:** High for repository-observed behaviour; Medium for live Cloudflare dashboard-only behaviour because prior audit marks it unknown.
- **Unresolved questions:** none that block architecture planning; architecture must choose concrete route names, tag names, scheduler mechanism and redirect status codes.

### D9 — Draft/Published with publish_at

- **Decision:** live rule gates every public output and scheduled publication.
- **Affected V1 systems:** data/bases-index.json, scripts/generate-sitemap.py, js/quiz-engine.js; routes all public routes, /sitemap.xml.
- **V1 evidence:** audit confirms static HTML shells, JSON source/generated datasets, Cloudflare `_redirects`, slug helpers, client search, compare and quiz tests. Direct files: data/bases-index.json, scripts/generate-sitemap.py, js/quiz-engine.js.
- **Preserved behaviour:** keep public discovery mental model, root clean base URL experience where applicable, deterministic scoring/explanations, no sign-up, responsive browser interaction, shareable result URLs, and existing catalogue/search intent.
- **Deliberate change:** replace V1 static shell plus client/generated JSON pattern with Next-owned routing, generated cached HTML, Supabase source records, R2 media, and derived outputs computed during generation/revalidation rather than committed as product truth.
- **Implementation constraints:** architecture must centralise slug resolution, live-content filtering, deterministic engines, relationship lookup and escaping; root namespace needs reserved-route enforcement before publication.
- **SEO implications:** server HTML, metadata, canonicals, sitemap and permanent redirects must agree; legacy `.html`, query and `/base/:slug` forms need canonical treatment.
- **Caching/revalidation implications:** cache tags must include changed source record, related taxonomy, homepage catalogue/statistics, ranking/scenario dependencies, compare/quiz catalogue snapshots where live set changes, sitemap and metadata. Scheduled `publish_at` requires automatic timed revalidation.
- **Data implications:** only source/config/media/publishing records are authoritative; generated rankings, scenario outputs, comparison results, quiz matches and aggregate stats are rebuildable caches/fixtures, not editorial data.
- **Testing implications:** convert V1 fixtures for routing, catalogue filtering, rankings/scenarios, compare, quiz, sitemap and media fallback into automated parity tests.
- **Migration risks:** slug collision, missed redirect/canonical, stale cache after scheduled publication, leaking draft content, server/client formula drift, media metadata gaps, and accidental loss of V1 client interactions.
- **Confidence:** High for repository-observed behaviour; Medium for live Cloudflare dashboard-only behaviour because prior audit marks it unknown.
- **Unresolved questions:** none that block architecture planning; architecture must choose concrete route names, tag names, scheduler mechanism and redirect status codes.

### D10 — No methodology versioning

- **Decision:** one current scoring/scenario/quiz model.
- **Affected V1 systems:** scripts/generate-rankings.py, scripts/generate-discovery.py, js/compare.js, js/quiz-engine.js; routes rankings, scenarios, compare, quiz, base detail.
- **V1 evidence:** audit confirms static HTML shells, JSON source/generated datasets, Cloudflare `_redirects`, slug helpers, client search, compare and quiz tests. Direct files: scripts/generate-rankings.py, scripts/generate-discovery.py, js/compare.js, js/quiz-engine.js.
- **Preserved behaviour:** keep public discovery mental model, root clean base URL experience where applicable, deterministic scoring/explanations, no sign-up, responsive browser interaction, shareable result URLs, and existing catalogue/search intent.
- **Deliberate change:** replace V1 static shell plus client/generated JSON pattern with Next-owned routing, generated cached HTML, Supabase source records, R2 media, and derived outputs computed during generation/revalidation rather than committed as product truth.
- **Implementation constraints:** architecture must centralise slug resolution, live-content filtering, deterministic engines, relationship lookup and escaping; root namespace needs reserved-route enforcement before publication.
- **SEO implications:** server HTML, metadata, canonicals, sitemap and permanent redirects must agree; legacy `.html`, query and `/base/:slug` forms need canonical treatment.
- **Caching/revalidation implications:** cache tags must include changed source record, related taxonomy, homepage catalogue/statistics, ranking/scenario dependencies, compare/quiz catalogue snapshots where live set changes, sitemap and metadata. Scheduled `publish_at` requires automatic timed revalidation.
- **Data implications:** only source/config/media/publishing records are authoritative; generated rankings, scenario outputs, comparison results, quiz matches and aggregate stats are rebuildable caches/fixtures, not editorial data.
- **Testing implications:** convert V1 fixtures for routing, catalogue filtering, rankings/scenarios, compare, quiz, sitemap and media fallback into automated parity tests.
- **Migration risks:** slug collision, missed redirect/canonical, stale cache after scheduled publication, leaking draft content, server/client formula drift, media metadata gaps, and accidental loss of V1 client interactions.
- **Confidence:** High for repository-observed behaviour; Medium for live Cloudflare dashboard-only behaviour because prior audit marks it unknown.
- **Unresolved questions:** none that block architecture planning; architecture must choose concrete route names, tag names, scheduler mechanism and redirect status codes.

### D11 — No user accounts

- **Decision:** anonymous core features; LocalStorage only.
- **Affected V1 systems:** js/quiz.js, js/main.js; routes all routes, /quiz.
- **V1 evidence:** audit confirms static HTML shells, JSON source/generated datasets, Cloudflare `_redirects`, slug helpers, client search, compare and quiz tests. Direct files: js/quiz.js, js/main.js.
- **Preserved behaviour:** keep public discovery mental model, root clean base URL experience where applicable, deterministic scoring/explanations, no sign-up, responsive browser interaction, shareable result URLs, and existing catalogue/search intent.
- **Deliberate change:** replace V1 static shell plus client/generated JSON pattern with Next-owned routing, generated cached HTML, Supabase source records, R2 media, and derived outputs computed during generation/revalidation rather than committed as product truth.
- **Implementation constraints:** architecture must centralise slug resolution, live-content filtering, deterministic engines, relationship lookup and escaping; root namespace needs reserved-route enforcement before publication.
- **SEO implications:** server HTML, metadata, canonicals, sitemap and permanent redirects must agree; legacy `.html`, query and `/base/:slug` forms need canonical treatment.
- **Caching/revalidation implications:** cache tags must include changed source record, related taxonomy, homepage catalogue/statistics, ranking/scenario dependencies, compare/quiz catalogue snapshots where live set changes, sitemap and metadata. Scheduled `publish_at` requires automatic timed revalidation.
- **Data implications:** only source/config/media/publishing records are authoritative; generated rankings, scenario outputs, comparison results, quiz matches and aggregate stats are rebuildable caches/fixtures, not editorial data.
- **Testing implications:** convert V1 fixtures for routing, catalogue filtering, rankings/scenarios, compare, quiz, sitemap and media fallback into automated parity tests.
- **Migration risks:** slug collision, missed redirect/canonical, stale cache after scheduled publication, leaking draft content, server/client formula drift, media metadata gaps, and accidental loss of V1 client interactions.
- **Confidence:** High for repository-observed behaviour; Medium for live Cloudflare dashboard-only behaviour because prior audit marks it unknown.
- **Unresolved questions:** none that block architecture planning; architecture must choose concrete route names, tag names, scheduler mechanism and redirect status codes.

### D12 — Basic search capability

- **Decision:** deterministic field search only; no semantic/full-document indexing.
- **Affected V1 systems:** js/main.js, js/mobile-nav.js, data/bases-index.json; routes /.
- **V1 evidence:** audit confirms static HTML shells, JSON source/generated datasets, Cloudflare `_redirects`, slug helpers, client search, compare and quiz tests. Direct files: js/main.js, js/mobile-nav.js, data/bases-index.json.
- **Preserved behaviour:** keep public discovery mental model, root clean base URL experience where applicable, deterministic scoring/explanations, no sign-up, responsive browser interaction, shareable result URLs, and existing catalogue/search intent.
- **Deliberate change:** replace V1 static shell plus client/generated JSON pattern with Next-owned routing, generated cached HTML, Supabase source records, R2 media, and derived outputs computed during generation/revalidation rather than committed as product truth.
- **Implementation constraints:** architecture must centralise slug resolution, live-content filtering, deterministic engines, relationship lookup and escaping; root namespace needs reserved-route enforcement before publication.
- **SEO implications:** server HTML, metadata, canonicals, sitemap and permanent redirects must agree; legacy `.html`, query and `/base/:slug` forms need canonical treatment.
- **Caching/revalidation implications:** cache tags must include changed source record, related taxonomy, homepage catalogue/statistics, ranking/scenario dependencies, compare/quiz catalogue snapshots where live set changes, sitemap and metadata. Scheduled `publish_at` requires automatic timed revalidation.
- **Data implications:** only source/config/media/publishing records are authoritative; generated rankings, scenario outputs, comparison results, quiz matches and aggregate stats are rebuildable caches/fixtures, not editorial data.
- **Testing implications:** convert V1 fixtures for routing, catalogue filtering, rankings/scenarios, compare, quiz, sitemap and media fallback into automated parity tests.
- **Migration risks:** slug collision, missed redirect/canonical, stale cache after scheduled publication, leaking draft content, server/client formula drift, media metadata gaps, and accidental loss of V1 client interactions.
- **Confidence:** High for repository-observed behaviour; Medium for live Cloudflare dashboard-only behaviour because prior audit marks it unknown.
- **Unresolved questions:** none that block architecture planning; architecture must choose concrete route names, tag names, scheduler mechanism and redirect status codes.

### D13 — LocalStorage personalisation

- **Decision:** restrained survival-profile personalisation; site usable without quiz.
- **Affected V1 systems:** js/quiz.js, js/quiz-engine.js; routes /, /{slug}, /rankings, /field-manual, /compare, /quiz.
- **V1 evidence:** audit confirms static HTML shells, JSON source/generated datasets, Cloudflare `_redirects`, slug helpers, client search, compare and quiz tests. Direct files: js/quiz.js, js/quiz-engine.js.
- **Preserved behaviour:** keep public discovery mental model, root clean base URL experience where applicable, deterministic scoring/explanations, no sign-up, responsive browser interaction, shareable result URLs, and existing catalogue/search intent.
- **Deliberate change:** replace V1 static shell plus client/generated JSON pattern with Next-owned routing, generated cached HTML, Supabase source records, R2 media, and derived outputs computed during generation/revalidation rather than committed as product truth.
- **Implementation constraints:** architecture must centralise slug resolution, live-content filtering, deterministic engines, relationship lookup and escaping; root namespace needs reserved-route enforcement before publication.
- **SEO implications:** server HTML, metadata, canonicals, sitemap and permanent redirects must agree; legacy `.html`, query and `/base/:slug` forms need canonical treatment.
- **Caching/revalidation implications:** cache tags must include changed source record, related taxonomy, homepage catalogue/statistics, ranking/scenario dependencies, compare/quiz catalogue snapshots where live set changes, sitemap and metadata. Scheduled `publish_at` requires automatic timed revalidation.
- **Data implications:** only source/config/media/publishing records are authoritative; generated rankings, scenario outputs, comparison results, quiz matches and aggregate stats are rebuildable caches/fixtures, not editorial data.
- **Testing implications:** convert V1 fixtures for routing, catalogue filtering, rankings/scenarios, compare, quiz, sitemap and media fallback into automated parity tests.
- **Migration risks:** slug collision, missed redirect/canonical, stale cache after scheduled publication, leaking draft content, server/client formula drift, media metadata gaps, and accidental loss of V1 client interactions.
- **Confidence:** High for repository-observed behaviour; Medium for live Cloudflare dashboard-only behaviour because prior audit marks it unknown.
- **Unresolved questions:** none that block architecture planning; architecture must choose concrete route names, tag names, scheduler mechanism and redirect status codes.

### CW — Content workflow

- **Decision:** owner-reviewed AI content, manual Supabase entry, draft until published.
- **Affected V1 systems:** README.md, V2_DECISIONS.md, audit/30-data-and-content-contract.md; routes admin/editorial process, public routes after publish.
- **V1 evidence:** audit confirms static HTML shells, JSON source/generated datasets, Cloudflare `_redirects`, slug helpers, client search, compare and quiz tests. Direct files: README.md, V2_DECISIONS.md, audit/30-data-and-content-contract.md.
- **Preserved behaviour:** keep public discovery mental model, root clean base URL experience where applicable, deterministic scoring/explanations, no sign-up, responsive browser interaction, shareable result URLs, and existing catalogue/search intent.
- **Deliberate change:** replace V1 static shell plus client/generated JSON pattern with Next-owned routing, generated cached HTML, Supabase source records, R2 media, and derived outputs computed during generation/revalidation rather than committed as product truth.
- **Implementation constraints:** architecture must centralise slug resolution, live-content filtering, deterministic engines, relationship lookup and escaping; root namespace needs reserved-route enforcement before publication.
- **SEO implications:** server HTML, metadata, canonicals, sitemap and permanent redirects must agree; legacy `.html`, query and `/base/:slug` forms need canonical treatment.
- **Caching/revalidation implications:** cache tags must include changed source record, related taxonomy, homepage catalogue/statistics, ranking/scenario dependencies, compare/quiz catalogue snapshots where live set changes, sitemap and metadata. Scheduled `publish_at` requires automatic timed revalidation.
- **Data implications:** only source/config/media/publishing records are authoritative; generated rankings, scenario outputs, comparison results, quiz matches and aggregate stats are rebuildable caches/fixtures, not editorial data.
- **Testing implications:** convert V1 fixtures for routing, catalogue filtering, rankings/scenarios, compare, quiz, sitemap and media fallback into automated parity tests.
- **Migration risks:** slug collision, missed redirect/canonical, stale cache after scheduled publication, leaking draft content, server/client formula drift, media metadata gaps, and accidental loss of V1 client interactions.
- **Confidence:** High for repository-observed behaviour; Medium for live Cloudflare dashboard-only behaviour because prior audit marks it unknown.
- **Unresolved questions:** none that block architecture planning; architecture must choose concrete route names, tag names, scheduler mechanism and redirect status codes.

## Validation questions

1. **Can root-level `/{slug}` base routes be implemented entirely in Next.js without Cloudflare application rewrites?** Yes. Next.js can define explicit product routes plus a dynamic root segment that resolves only published base slugs. Cloudflare remains DNS/CDN/security/R2 only.
2. **How must reserved route collisions be prevented?** Maintain a version-controlled reserved-root-slug registry covering product routes, system routes, static asset namespaces, API/admin/preview routes and legacy redirect targets; validate it during editorial save, build and CI.
3. **Which pages must be revalidated when a base is published or changed?** The base page, homepage/catalogue/statistics, sitemap, relevant region/type pages, global rankings, affected scenarios, related/suggested base pages, compare pages/caches that include the base if precomputed, and any personalised recommendation catalogue snapshot.
4. **How should future `publish_at` records become visible if no person manually triggers revalidation at that exact time?** Run a scheduled job/cron/queue that finds records whose live state changed, triggers tag/path revalidation and has a manual fallback.
5. **Can rankings and scenarios be derived at generation time without stored generated-result tables?** Yes. V1 already derives committed JSON from source data/scripts; V2 should derive on the server with deterministic TypeScript and cache outputs only as rebuildable delivery artifacts.
6. **What compact catalogue fields are required for browser-side search, filters, cards and map markers?** slug, name, aliases, region key/label, country, type key/label, short summary, overall/headline scores, rank/percentile if displayed, image/media hero thumbnail metadata, lat/long, badges, published live timestamps and URL.
7. **Can Compare use one deterministic engine for server and browser rendering?** Yes. The engine must be a shared pure TypeScript module with identical inputs, rounding/tie rules and copy templates.
8. **What information must remain in LocalStorage for Quiz and personalisation?** Completed answer IDs, calculated profile id, timestamp, current lightweight schema version for safe parsing, and optional restrained preferences; never private identity or authoritative result history.
9. **Which V1 route forms require permanent redirects at V2 launch?** `/base.html?slug=...`, `/base/:slug`, `/compare.html`, `/compare.html?a=...&b=...`, `/base/:a/vs/:b` if V2 chooses another compare canonical, `/rankings.html`, `/rankings-region.html?region=...`, `/rankings-type.html?type=...`, `/scenarios.html?scenario=...`, `/quiz.html`, `/quiz/`, `/field-manual.html`, `/field-manual/`, and any legacy slug aliases.
10. **Which audit fixtures should become automated V2 parity tests?** `route-contract.json`, `redirect-matrix.json`, `scoring-fixtures.json`, `compare-fixtures.json`, `quiz-fixtures.json`, `content-field-lineage.json`, generated-data schema snapshots, plus Node tests for compare/quiz and Python-derived ranking/discovery expectations translated to TypeScript.

## Contradictions, risks and remaining decisions

- **Contradictions found:** none blocking. Decision 7 deliberately accepts quiz result changes when current data/logic changes; this aligns with no methodology versioning.
- **Material risks:** root namespace collisions; incomplete redirect/canonical map; stale scheduled publishing; draft leakage into catalogue/rankings/quiz/compare/sitemap; server/client engine drift; media metadata incompleteness; losing V1 browser responsiveness while adding SSR.
- **Owner decisions still required:** none before architecture planning. Owner approval will still be needed later for final content, media assets and any change to approved decisions.
