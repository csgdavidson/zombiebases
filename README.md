# Zombie Bases

Zombie Bases is a static, GitHub Pages-friendly directory of fictional and real-world survival locations.
It currently provides a browseable homepage (list + map), query-parameter-driven detail pages,
and a small set of standalone proof-of-concept dedicated pages under `bases/`.

## Current status

- **Framework stage:** alpha-complete (core browsing, filtering, map, and detail flows are in place).
- **Data stage:** cleanup/normalization is still in progress.
- **Design stage:** a full visual design pass is still deferred.
- **Dedicated base pages:** currently partial proof-of-concept content and intentionally not indexable.

## Site structure

- `index.html` — homepage entry point with featured bases, controls, list view, and map view.
- `base.html` — dynamic detail template loaded by `slug` query parameter.
- `bases/*.html` — static dedicated-page proof-of-concept files (not production-indexed yet).
- `js/main.js` — homepage data loading, filtering, sorting, URL-state syncing, metadata updates.
- `js/map.js` — Leaflet map + marker clustering renderer.
- `js/base.js` — detail-page data loading, rendering, related bases, metadata updates.
- `js/seo.js` — shared metadata/canonical helpers.
- `data/bases-index.json` — normalized dataset consumed by the frontend.
- `scripts/generate-sitemap.py` — deterministic sitemap generation for canonical/indexable URLs.
- `.github/workflows/sitemap.yml` — GitHub Actions automation that regenerates and commits `sitemap.xml` on relevant changes.
- `robots.txt` and `sitemap.xml` — crawl/index controls.

## Detail data schema (current)

`base.html?slug=...` reads detail content directly from `data/bases-index.json`.

- `description` supports either a legacy string or a structured object:
  - `description.summary`
  - `description.strengths`
  - `description.weaknesses`
- `scores` supports either a legacy flat object or a structured object:
  - `scores.overall`
  - `scores.categories.<metric>` for metric keys such as `defensibility`, `food`, `water`, `isolation`, `escape`, `sustainability`, and `human_risk`

Fallback behavior remains in place for incomplete records (for example, missing description parts or missing scores).

## Purpose of index, list, map, and detail pages

- **Index / list view (`/`):** primary crawlable landing page for the directory and broad discovery.
- **Map view (`/index.html?view=map`):** interactive exploration mode for users; not separately canonicalized.
- **Detail view (`/base.html?slug=...`):** canonical per-base landing route for indexable base detail content.
- **Dedicated static pages (`/bases/*.html`):** content experiments/templates only, currently excluded from indexing.

## SEO baseline (current)

- Homepage has a stable default `<title>`, meta description, and canonical URL.
- Runtime metadata updates for homepage view/filter context while keeping canonical pinned to `/`.
- Detail pages set per-base title, description, and canonical URL as `/base.html?slug=...`.
- Query-parameter UX state (`view`, `region`, `type`, `sort`, `q`) is intentionally excluded from canonicals.
- `robots.txt` allows site crawl but disallows `/bases/` proof-of-concept pages.
- `sitemap.xml` is generated from canonical URL sources (homepage, data slugs, and indexable dedicated pages).

## Security baseline (current)

- Rendering paths use DOM node APIs (`textContent`, `createElement`) for user/data-driven content.
- No `target="_blank"` links are currently used.
- No inline scripts are used in HTML templates.
- External dependencies currently required by frontend:
  - `https://unpkg.com` (Leaflet + MarkerCluster JS/CSS)
  - `https://{s}.tile.openstreetmap.org` (tile images)
  - `https://zombiebases.com` (canonical origin)
- No private secrets/tokens are expected in this static repo; baseline scan should remain clean.

See `SECURITY.md` for deferred post-design hardening items.

## Robots and sitemap behavior

### `robots.txt`

- Allows crawl of the public site.
- Disallows `/bases/` (template/POC pages).
- Declares sitemap location at `https://zombiebases.com/sitemap.xml`.

### `sitemap.xml`

- **Generated (not hand-maintained).**
- Produced by `scripts/generate-sitemap.py` and written to `sitemap.xml`.
- Uses the production canonical origin `https://zombiebases.com` for every URL.
- Includes:
  - homepage root (`https://zombiebases.com/`)
  - each unique detail route from `data/bases-index.json` as `https://zombiebases.com/base.html?slug=<slug>`
  - dedicated pages under `/bases/*.html` only if they are indexable (pages with `meta robots` containing `noindex` are excluded)
- Excludes non-canonical URL-state variants (filters/sort/search/map view query params such as `view`, `region`, `type`, `sort`, `q`).
- Adds `<lastmod>` using `git log` timestamps when available (entry source file-based).

### When sitemap generation runs

- **Automatically on GitHub:** `.github/workflows/sitemap.yml` runs on pushes to `main` that touch sitemap inputs and auto-commits `sitemap.xml` if it changed.
- **Locally/manual (optional):**

```bash
python3 scripts/generate-sitemap.py
```

### If a new page type is introduced later

1. Decide whether the page type is canonical/indexable in production.
2. Add deterministic URL generation for that page type in `scripts/generate-sitemap.py`.
3. Ensure non-canonical query-state URLs remain excluded.
4. If new source files drive those URLs, add them to workflow `paths` in `.github/workflows/sitemap.yml`.

## Adding a new dedicated base page (current workflow)

Dedicated static pages are still experimental. If you add one under `bases/`:

1. Start from `bases/template.html`.
2. Keep `meta name="robots" content="noindex, nofollow"` unless and until the project decides to make these pages production-indexable.
3. Keep links/styles static-site safe (relative paths, no server-only behavior).
4. Keep POC pages `noindex` while this section remains deferred so they stay out of sitemap and search indices.

If the new page corresponds to a production base entry, prefer adding/updating the record in `data/bases-index.json` so the `base.html?slug=` route becomes the canonical searchable detail page.

## Cloudflare assumptions

The project assumes Cloudflare is in front of GitHub Pages for production routing/caching.
Security/header hardening is expected to be enforced at Cloudflare (or equivalent edge config) in a later phase, including CSP and related headers.

## Intentionally deferred (post-design / later hardening)

- Strict production security headers (full CSP, Permissions-Policy, etc.).

<!-- redeploy trigger -->
- Self-hosting third-party map assets and completing SRI coverage for all third-party files.
- Final indexability decision for static dedicated pages in `bases/`.
- Broad data cleanup and consistency improvements across all base records.
- Major UX and visual design refinements.
