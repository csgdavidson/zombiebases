# 36 — Architecture Input Checklist

Architecture planning is approved to begin, but it must answer these questions and satisfy these constraints without reopening approved V2 decisions.

## Routing and reserved slugs
- Define canonical routes for home, root base detail, compare landing/result, rankings, regions, types, scenarios, quiz, Field Manual, sitemap, robots, preview, admin/API and assets.
- Define the reserved root-slug registry and validation points.
- Define permanent redirects for every legacy `.html`, query, `/base/:slug`, clean quiz/field manual and compare route form.

## Rendering mode per route
- Identify generated cached HTML routes versus Client Component islands.
- Ensure direct compare URLs, base details, rankings, scenarios, quiz landing and Field Manual have meaningful initial HTML.

## Cache tags and revalidation dependencies
- Specify tags for base, taxonomy, homepage-catalogue, rankings, region, type, scenario, compare-inputs, quiz-inputs, media, sitemap and Field Manual.
- Specify dependency fan-out for base create/update/publish/unpublish/media/taxonomy/scenario/quiz changes.
- Include manual fallback and scheduled `publish_at` automation.

## Publication and scheduling rules
- Define live predicate: `status = Published` and (`publish_at` is null or `publish_at <= now`).
- Apply live predicate to search, rankings, scenarios, compare, quiz, sitemap, metadata, related links and media.
- Define draft preview authentication/token approach without public leakage.

## Supabase authoritative entities and fields
- Bases, taxonomy, scores, comparison scores, scenario definitions/weights, quiz questions/answers/profiles, curated relationships, Field Manual content, media records, base-media relationships and publication fields.
- Identify system-managed fields (`published_at`, `updated_at`, slugs where applicable).

## Derived calculation boundaries
- Rankings, percentiles, scenario outputs, comparison outcomes, quiz compatibility and homepage stats are derived.
- Define pure TypeScript modules, inputs, rounding/tie rules and fixture ownership.

## Lightweight search-catalogue contract
- Include slug, name, aliases, region, country, type, short summary, score fields needed for sort/cards, media thumbnail metadata, lat/long, badges and URL.
- Exclude long-form editorial, Field Manual, Compare copy and Quiz content.

## Ranking/scenario engine contract
- Define deterministic ordering, tie-breaking, inclusion filters, scenario weight semantics, labels and explanation copy sources.

## Compare server/client boundary
- One shared engine for initial SSR and browser swaps.
- Define URL sync, invalid/same-base handling, selector catalogue and equality tests.

## Quiz LocalStorage and personalisation boundary
- Define schema for answer IDs, profile id, timestamp and schema version.
- Define safe parse/clear behaviour and restrained personalisation surfaces.
- State site remains fully usable without quiz completion.

## R2 media object and metadata contract
- Define object key convention, role enum/extensibility, alt/caption/attribution/display order/publication state/focal point and fallback policy.
- Define migration from existing PNG paths and root duplicates.

## SEO metadata, sitemap, canonical and redirects
- Define per-route metadata sources, canonical URL policy, structured data, sitemap live filtering and redirect status strategy.

## Migration sequence
- Snapshot V1 fixtures; migrate source data; migrate media; implement engines; implement routes; validate redirects; run parity; cut over; monitor.

## Parity and acceptance tests
- Promote route-contract, redirect-matrix, scoring, compare, quiz, generated-data schema and content-lineage evidence to automated tests.
- Add draft leakage, scheduled publish, revalidation fan-out, media role resolution, accessibility and SEO smoke tests.

## Deployment topology and rollback
- Define Next hosting, Supabase, R2/CDN, scheduled jobs, secrets, observability, cache purge/manual revalidation and rollback to prior deployment/data snapshot.
