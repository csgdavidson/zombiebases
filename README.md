# Zombie Bases

Zombie Bases is a static, GitHub Pages-friendly directory of fictional and real-world survival locations, with list and map browsing, filtering, scoring, and base detail pages.

## Current feature set (alpha)

- Homepage list/map toggle
- Featured bases section
- Search by name, region, country, and type
- Region and type filters
- Sort options (score, name, region, type)
- Overall score display on cards/details
- Interactive Leaflet map with popups
- Dedicated detail pages via `base.html`
- Related bases on detail pages
- URL state persistence for view, filters, sort, and search

## Project structure

- `index.html` — homepage with featured, controls, list, and map views
- `base.html` — shared detail page template loaded by `slug`
- `css/` — site styles (`styles.css`)
- `js/` — homepage, map, and detail logic (`main.js`, `map.js`, `base.js`)
- `bases/` — generated/curated static base content pages
- `data/base-matrix-source.json` — source matrix and editorial input data
- `data/bases-index.json` — normalized index consumed by homepage/detail scripts
- `CNAME` — custom domain config for GitHub Pages

## Data model overview

Each base entry in `data/bases-index.json` includes core fields used by filters, cards, map markers, and detail rendering:

- Identity: `slug`, `name`, `status`
- Location/classification: `region`, `country`, `type`, `coordinates`
- Content: `summary`, `description`, `highlights`, `pros`, `cons`
- Scoring: `score` and/or category `scores`
- Relationships: `related` (for detail-page recommendations)

## Run locally

Because this project uses browser `fetch()` for JSON, run it from a local HTTP server (not `file://`).

Examples:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

or

```bash
npx serve .
```

## Deployment (GitHub Pages + custom domain)

1. Push the repo to GitHub.
2. In repository settings, enable **GitHub Pages** for the main branch root (or your configured pages branch).
3. Keep `CNAME` in the repo root for your custom domain.
4. Point your DNS records to GitHub Pages per GitHub documentation.

## Alpha/curation note

The dataset is currently curated for alpha and still being refined. Expect scoring, summaries, and base metadata to evolve as content quality and consistency improve.
