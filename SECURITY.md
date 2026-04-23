# Security Baseline (Pre-Design Phase)

This repository is a static site and should remain GitHub Pages / Cloudflare friendly.
This document captures the current lightweight client-side baseline and known follow-up
items for a later hardening pass.

## Current external dependencies (for CSP allowlists)

The frontend currently depends on these remote origins:

- `https://unpkg.com` (Leaflet and Leaflet MarkerCluster CSS/JS loaded from CDN)
- `https://{s}.tile.openstreetmap.org` (map tile images via Leaflet)
- `https://zombiebases.com` (production canonical origin in SEO metadata)

No third-party embeds (iframes/widgets) are currently used.

## Secrets and public values

- No private secrets, tokens, or environment files are expected in this static client.
- Repository scan for common secret patterns did not identify committed API keys/tokens.
- There are currently no public API keys in runtime code that require provider-side
  restriction.

If public keys are introduced later, they should be:

1. Restricted by origin/domain at the provider.
2. Scoped to minimum required APIs.
3. Documented here with explicit provider restrictions.

## Baseline improvements implemented in this phase

- Reduced DOM injection risk by replacing string-based popup HTML assembly with safe
  DOM node creation in map popups (`textContent`/node APIs).
- Removed one remaining string `innerHTML` pattern in score rendering in favor of
  explicit DOM node creation.

## Known CSP/header blockers and follow-up items (deferred)

These are intentionally deferred to the full post-design hardening phase:

1. **CDN-hosted third-party JS/CSS**
   - Leaflet and MarkerCluster are loaded from `unpkg.com`, which requires allowing
     that origin in `script-src`/`style-src`.
   - Follow-up option: self-host pinned assets under this repo to reduce external
     script/style origins.

2. **Map tile network access**
   - Leaflet pulls tiles from OpenStreetMap subdomains.
   - Follow-up: explicitly model `img-src`/`connect-src` needs in final CSP policy.

3. **Security headers not yet enforced in deployment config**
   - Final strict headers (CSP, `X-Content-Type-Options`, `Referrer-Policy`,
     `Permissions-Policy`, etc.) should be set in hosting config (for example,
     Cloudflare Pages `_headers` / edge rules) after design/content stabilizes.

4. **Subresource Integrity (SRI) consistency**
   - Leaflet assets include integrity attributes today; MarkerCluster assets do not.
   - Follow-up: pin and add SRI hashes for all CDN resources or self-host them.

## Notes on `target="_blank"` link safety

- No current site links open in a new tab.
- If `target="_blank"` is introduced later, include
  `rel="noopener noreferrer"` on those links.
