# 22 Live Routing Reconciliation

Status: repository routing INSPECTED; Cloudflare dashboard behaviour UNKNOWN except as described in the Technical Context brief.

| Browser URL | Served file | Data passed | Status | Canonical | Control | Collision/failure |
|---|---|---|---|---|---|---|
| `/` | `index.html` | query `q/region/type/sort/view` | 200 | `https://zombiebases.com/` | repo | JS required for catalogue. |
| `/base.html?slug=x` | `base.html` | query slug | 200 | preferred clean root/base URL from `js/seo.js`+`js/slug.js` | repo | duplicate canonical target. |
| `/base/x` | `_redirects` rewrite to `base.html` | path slug | 200 | clean base URL | Cloudflare+repo | `/base/:slug/vs/:slug` must precede. |
| `/x` | `_redirects` rewrite to `base.html` | path slug | 200 if slug exists, app not-found otherwise | root clean URL | Cloudflare+repo | conflicts with product/static paths; reserved list in `js/slug.js`. |
| `/compare.html` | `compare.html` | none | 200 | compare canonical | repo | setup only. |
| `/compare.html?a=x&b=y` | `compare.html` | query pair | 200 | clean compare if helper used | repo | invalid/same base shows setup/error. |
| `/base/x/vs/y` | `_redirects` rewrite to `compare.html` | path pair | 200 | clean compare | Cloudflare+repo | must precede `/base/:slug`. |
| `/rankings.html` | `rankings.html` | none | 200 | rankings page | repo | no clean `/rankings` rule in `_redirects`. |
| `/rankings-region.html?region=r` | shell | query region | 200 | query/state page | repo | invalid region falls back/default. |
| `/rankings-type.html?type=t` | shell | query type | 200 | query/state page | repo | invalid type falls back/default. |
| `/scenarios.html?scenario=s` | shell | query scenario | 200 | scenarios page | repo | invalid scenario defaults. |
| `/quiz.html`, `/quiz`, `/quiz/` | `quiz.html` or duplicate `quiz/index.html` | localStorage only | 200 | quiz canonical | both | `_redirects` handles clean; filesystem duplicate also exists. |
| `/field-manual.html`, `/field-manual`, `/field-manual/` | `field-manual.html` or duplicate | none | 200 | manual canonical | both | duplicate shell must stay in sync. |

Repository `_redirects` lacks clean rules for `/compare`, `/rankings`, `/scenarios`, `/rankings-region`, `/rankings-type` if the brief/dashboard imply them. Sitemap includes generated routes and legacy query routes, creating client-side canonical reliance. Filesystem duplicate pages exist only for quiz and field manual. Explicit mismatch to owner: technical brief dashboard screenshots/rules may include redirects not present in `_redirects`; live behaviour cannot be confirmed here.
