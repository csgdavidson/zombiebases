# Zombie Bases

## Project Overview

Zombie Bases is a static site that evaluates real-world locations as potential zombie survival bases. The product is built around scoring, comparison, and decision support rather than lore or fiction-first storytelling.

The site is optimized for fast delivery and SEO stability using a static architecture hosted on GitHub Pages and fronted by Cloudflare.

## Current Product State

- The framework is alpha-complete.
- Core UX and structural patterns are stable.
- Current work is focused on data quality, scoring quality, and content refinement rather than major feature expansion.

## Core Features

### Base detail pages

Each base detail page includes:

- Summary, strengths, weaknesses, and a reality check.
- Best use and key risk integrated near the top of the page.
- Score breakdown across Defensibility, Isolation, and Sustainability.
- Positioning context across global, regional, and type-specific views.
- Comparisons vs global, regional, and type baselines.
- Survival profile timeline from initial viability to short-term and long-term viability.
- Similar base recommendations.

### Homepage

The homepage supports exploration and decision workflows through:

- Explore panel (rankings and scenario paths).
- Search.
- Filters (region and type).
- Score-based sorting.
- List / Map toggle.
- Map clustering.

### Rankings

- Best overall.
- By region.
- By type.

### Scenario views

- Long-term survival.
- Short-term refuge.
- Community bases.
- High risk / high reward.

## URL Structure

- Canonical URLs use clean slug paths:
  - `https://zombiebases.com/{slug}`
- Legacy URLs remain supported for backward compatibility:
  - `/base.html?slug={slug}`
- Cloudflare Transform Rules rewrite clean slug paths to `base.html` internally.
- Internal links should use clean URLs only.

## Tech Stack

- Static site: HTML, CSS, JavaScript.
- Data-driven frontend via JSON.
- GitHub Pages for hosting.
- Cloudflare for DNS, HTTPS, and URL rewrites.
- Leaflet for map rendering.

## Architecture

- `index.html` is the homepage shell for list and map exploration.
- `base.html` is the base detail template.
- `data/*.json` stores base records and derived datasets.
- Rendering is client-side via JavaScript.

Shared logic includes:

- Slug resolution from query parameter and pathname.
- Badge generation.
- Score formatting.
- Comparison rendering.
- URL helper utilities.

## Data Model (High Level)

Each base record includes:

- `slug`
- `name`
- `type`, `region`, `country`
- `summary`
- `strengths`, `weaknesses`
- `realityCheck`
- `bestUse`, `keyRisk`
- `scores` (`defensibility`, `isolation`, `sustainability`)

Derived fields include:

- `overallScore`
- `positioning`
- `comparisonStats`
- `survivalProfile`
- `similarBases`

## Current Priorities

Current focus:

1. Data cleaning and consistency.
2. Content quality and narrative sharpness.
3. Score distribution tuning to avoid clustering.
4. SEO refinement.

Not current focus:

- New feature development.
- Major UI redesign.
- Backend systems.

## Roadmap (High Level)

1. Data cleaning (current).
2. Security hardening.
3. SEO improvements.
4. Visual polish.
5. UX refinement.

## Development Principles

- Static-first architecture.
- Keep logic simple and transparent.
- Avoid over-engineering.
- Prefer data improvements over feature complexity.
- UX should feel decisive and intentional.
- Every base should stand on scoring quality and narrative clarity.

## Contributing / Workflow

Most repository updates are executed through Codex prompts.

Preferred contribution style:

- Small, controlled PRs.
- Data-first updates.
- Minimal layout impact unless explicitly scoped.

Avoid:

- Large refactors without clear scope.
- Changing rendering and data model behavior in the same update unless strictly necessary.

## Notes

- Clean URLs depend on Cloudflare Transform Rules, not native server routing.
- The site must remain fully functional as a static deployment with no server logic.
- Backward compatibility for query-parameter URLs is intentional.
