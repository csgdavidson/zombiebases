**ZOMBIE BASES**

V1 Technical Context & V2 Rebuild Specification

Technical briefing for SOL: known V1 architecture, Cloudflare routing,
intended V2 stack, data/media direction, constraints and audit
questions.

| **Document status** | For SOL audit briefing                                                                         |
|---------------------|------------------------------------------------------------------------------------------------|
| **Version**         | 1.0                                                                                            |
| **Audience**        | SOL / repository auditor / V2 implementation team                                              |
| **Purpose**         | Provide authoritative product intent and technical context before independent repository audit |

| **Important:** This document records intended behaviour and agreed V2 direction. It is not SOL’s audit finding. SOL should verify implementation independently and challenge assumptions where the repository disagrees. |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

# Contents

**1. Purpose and boundaries**

**2. Current V1 context**

**3. Cloudflare rules in production**

**4. Target V2 architecture**

**5. Data and content model direction**

**6. Media architecture**

**7. Routing, rendering and SEO**

**8. Personalisation readiness**

**9. Security, operations and quality**

**10. Migration and rebuild approach**

**11. SOL audit work packages**

**12. Decisions and open questions**

**Appendix A: Initial entity model**

**Appendix B: Parity checklist**

# 1. Purpose and boundaries

V1 is officially in code freeze. This document gives SOL the known
technical context and agreed V2 direction before it conducts an
independent repository audit. It intentionally separates confirmed facts
from proposals and open questions.

| **Classification**  | **Meaning**                                                       |
|---------------------|-------------------------------------------------------------------|
| Confirmed V1 fact   | Observed in current product, screenshots or owner statement       |
| Agreed V2 direction | Current target unless audit reveals a compelling reason to change |
| TBC                 | Decision deliberately deferred pending audit/prototype            |
| Audit question      | SOL must verify in code/configuration                             |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Do not begin by rebuilding<br />
</strong>The first SOL task is read-only discovery. The audit should
establish the actual architecture, data dependencies, routing and
technical debt before implementation plans or code changes are
approved.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 2. Current V1 context

| **Area**   | **Known position**                                                                          | **Confidence**                                   |
|------------|---------------------------------------------------------------------------------------------|--------------------------------------------------|
| Hosting    | GitHub Pages serves the static site                                                         | Confirmed                                        |
| Repository | GitHub is the source repository and remains the planned V2 source-control platform          | Confirmed                                        |
| Frontend   | Static HTML/CSS/JavaScript with accumulated iteration and duplicated concerns               | Confirmed at a high level; audit exact structure |
| Data       | Approximately 111 base records; JSON/static files are believed to power much of the product | Part confirmed, exact files and joins to audit   |
| Images     | Images currently live in GitHub and are referenced by slug-based filenames                  | Confirmed                                        |
| URLs       | Cloudflare rewrites provide clean base paths over a static /base.html implementation        | Confirmed                                        |
| SEO        | More ambitious per-base/static SEO work was parked due to V1 limitations                    | Confirmed                                        |
| Map        | Homepage map uses Leaflet/OpenStreetMap in current UI                                       | Observed; audit implementation                   |
| Code state | V1 is officially frozen except urgent production fixes                                      | Confirmed                                        |

The V1 frontend is considered successful as a product prototype, but the
backend/data layer is described as messy after many iterations. V2
should preserve proven experience while rebuilding the underlying system
cleanly.

# 3. Cloudflare rules in production

The current Cloudflare configuration is part of V1’s runtime behaviour
and must be captured before DNS/hosting changes. The screenshots
supplied show one URL Rewrite Rule and two Redirect Rules.

## 3.1 Rewrite clean base URLs

Rule name: Rewrite clean base URLs. Placement: First.

Incoming request custom filter expression:

http.host eq "zombiebases.com"  
and http.request.method in {"GET" "HEAD"}  
and not http.request.uri.path in {"/" "/field-manual" "/field-manual/"
"/quiz" "/quiz/"}  
and not ends_with(http.request.uri.path, ".html")  
and not http.request.uri.path contains "."

Action: rewrite path to the static value /base.html and rewrite the
query dynamically to:

concat("slug=", substring(http.request.uri.path, 1))

Effect: a clean request such as /fort-george is internally served by
/base.html?slug=fort-george without exposing the implementation URL to
the visitor.

## 3.2 Redirect Field Manual

| **Property**          | **Value**                             |
|-----------------------|---------------------------------------|
| Rule name             | Redirect Field Manual                 |
| Request URL           | https://zombiebases.com/field-manual  |
| Target URL            | https://zombiebases.com/field-manual/ |
| Status                | 301 Permanent Redirect                |
| Preserve query string | Enabled                               |
| Order                 | First                                 |

## 3.3 Redirect Survival Quiz

| **Property**          | **Value**                           |
|-----------------------|-------------------------------------|
| Rule name             | Redirect Survival Quiz              |
| Request URL           | https://zombiebases.com/quiz        |
| Target URL            | https://zombiebases.com/quiz/       |
| Status                | 301 Permanent Redirect              |
| Preserve query string | Enabled                             |
| Order                 | Custom, after Redirect Field Manual |

There are no Configuration Rules shown in the supplied overview. SOL
should still export/check all active Cloudflare settings before cutover,
including DNS, caching, security, redirects, transform rules,
workers/pages configuration and any settings not visible in the
screenshots.

# 4. Target V2 architecture

| **Layer**             | **Planned choice**                               | **Reason**                                                                                                                                                                            |
|-----------------------|--------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Application framework | Next.js                                          | Supports structured routing, server/static rendering, metadata, image optimisation, component reuse and future personalisation; a better fit than continuing static handcrafted pages |
| Database/backend      | Supabase using PostgreSQL                        | Managed Postgres, relational data, API/auth/storage options, free/open-source foundations and a practical admin interface for the project scale                                       |
| CMS                   | TBC: either Supabase alone or a CMS layer on top | Most base content is structured, but long-form editorial blocks and richer authoring may justify a CMS. Audit and content modelling should decide rather than assuming one            |
| Hosting               | Vercel is the discussed/default candidate        | Natural operational fit for Next.js, preview deployments and simple GitHub integration. Confirm cost/limits and whether Cloudflare remains proxy/DNS in front                         |
| Source control        | GitHub                                           | Retain established repository workflow; V2 should use a clean new repository or clearly isolated V2 codebase                                                                          |
| Edge/DNS/security     | Cloudflare                                       | Retain DNS, protection, redirects and potentially caching/edge functions                                                                                                              |
| Object media          | Cloudflare R2                                    | Purpose-built image storage, scalable beyond repository-hosted assets and compatible with the existing Cloudflare footprint                                                           |

The working delivery approach is to build V2 in parallel on a new
repository and/or subdomain, migrate content and validate parity, then
switch the main domain at launch. The exact repository strategy should
be recommended by SOL after audit.

## 4.1 Why Next.js

- Real route files for base detail, rankings, filters and comparison
  results rather than Cloudflare disguising a single HTML template.

- Static generation or incremental regeneration for public pages with
  server-side capability where personalisation or dynamic data is later
  required.

- Central metadata generation for titles, descriptions, canonical URLs,
  Open Graph and structured data.

- Reusable shared components across homepage lists, rankings, related
  cards, quiz alternatives and compare pickers.

- First-class preview deployments and safer parallel V2 development.

- A path to server actions/API routes where needed without forcing a
  separate backend application at this scale.

## 4.2 Why Supabase/Postgres

- The domain is naturally relational: bases, regions, types, scores,
  scenarios, images, recommendations and quiz dimensions.

- A database removes duplicated JSON joins and allows one source of
  truth for values shown across multiple pages.

- Postgres can express ranking, filtering and scenario queries cleanly
  and can support materialised views or generated columns if performance
  requires them.

- Supabase offers a usable administration layer immediately, even if a
  dedicated CMS is never added.

- Future authentication and saved preferences are possible without
  committing to them for initial launch.

# 5. Data and content model direction

V2 should separate authoritative stored data from derived presentation.
Scores, metadata and editorial content must not be copied into multiple
page-specific files.

| **Data class**              | **Examples**                                                                        | **Recommended ownership**                                      |
|-----------------------------|-------------------------------------------------------------------------------------|----------------------------------------------------------------|
| Identity                    | Base ID, name, slug, country, coordinates, status                                   | bases table                                                    |
| Taxonomy                    | Region, Type, tags                                                                  | region/type/tag tables and join tables                         |
| Core scores                 | Overall, Defensibility, Isolation, Sustainability                                   | structured numeric fields or versioned score records           |
| Extended comparison factors | Exposure Control, Maintenance Resilience, Population Capacity, Resource Security    | structured numeric fields / score dimension table              |
| Ranking context             | Global/region/type ordinal and percentile                                           | derived at query/build time or cached; not manually edited     |
| Editorial summary           | Bottom line, long description, strengths, weaknesses, trade-off, best use, key risk | structured text fields with editorial workflow                 |
| Survival profile            | 7-day, 100-day, long-term status and bullet points                                  | structured child records or typed JSON blocks                  |
| Recommendations             | Most similar, strongest alternative, wildcard, related bases                        | prefer rule-derived with optional editorial overrides          |
| Scenario logic              | Scenario title, intro, filters, weights, tags and result ordering                   | scenario table/configuration; exact current V1 source to audit |
| Quiz                        | Questions, answer options, dimension effects, profiles, result explanation          | versioned structured tables/configuration                      |
| Field Manual                | Chapters, sections, callouts and related links                                      | CMS or structured rich-content model; decision TBC             |
| SEO                         | Title/description overrides, canonical rules, indexability, structured data inputs  | generated defaults plus editable overrides                     |

## 5.1 Supabase versus CMS decision

Supabase can comfortably manage rows, numeric scores, short and medium
text, arrays/JSON, relationships and simple editorial updates. A CMS
becomes valuable when non-technical editing requires rich blocks,
draft/review/publish workflow, previews, reusable callouts, embedded
media and granular page composition.

| **Content**                           | **Supabase only likely sufficient?** | **CMS value**                 |
|---------------------------------------|--------------------------------------|-------------------------------|
| Base metadata and scores              | Yes                                  | Low                           |
| Base strengths/weaknesses/short prose | Yes                                  | Medium if workflow grows      |
| Survival timeline cards               | Yes                                  | Low to medium                 |
| Scenario definitions                  | Yes                                  | Low                           |
| Quiz questions/profiles               | Yes                                  | Medium for versioning/preview |
| Field Manual long-form chapters       | Possible but awkward                 | High                          |
| Future editorial landing pages        | Possible but awkward                 | High                          |
| SEO overrides                         | Yes                                  | Medium                        |

Recommended decision gate: model the content first, prototype editing
one base and one Field Manual chapter in Supabase, then decide whether
the authoring experience is acceptable. Do not add a CMS merely because
the site contains content.

# 6. Media architecture

Current images are committed to GitHub. V2 should migrate them to
purpose-built object storage, with Cloudflare R2 the agreed candidate.

- Current state: one PNG hero/featured image per base, with 111 bases.

- Filename convention: the image filename exactly matches the base slug,
  for example fort-george.png.

- Mid-term expectation: more than 500 assets as static maps and
  secondary images are added.

- R2 should be treated as the original-asset store. Delivery may use a
  custom media domain and Cloudflare image transformations or Next.js
  image optimisation subject to cost and architecture tests.

- The database should link media to a base explicitly; filename-by-slug
  may remain a migration convention but should not be the only
  relationship.

- Each asset should have role/type (hero, secondary, map), sort order,
  alt text, dimensions, format, attribution/source metadata and
  publication status.

- Do not assume PNG remains mandatory. Preserve originals but generate
  efficient delivery formats and responsive sizes.

At the expected volume, storage cost itself should be negligible or
within free allowances, but SOL must verify current Cloudflare pricing
and account entitlements at implementation time. The engineering concern
is a reliable pipeline and caching strategy, not raw capacity.

# 7. Routing, rendering and SEO

## 7.1 Target routes

| **Experience**   | **Illustrative route**                                           |
|------------------|------------------------------------------------------------------|
| Homepage/Explore | /                                                                |
| Base detail      | /base/\[slug\] or /\[slug\] - final convention TBC               |
| Compare landing  | /compare                                                         |
| Compare result   | /compare/\[slug-a\]-vs-\[slug-b\] or query-based canonical route |
| Quiz             | /quiz                                                            |
| Quiz result      | /quiz/result/... or persisted/share token - TBC                  |
| Global rankings  | /rankings                                                        |
| Region ranking   | /rankings/region/\[region-slug\]                                 |
| Type ranking     | /rankings/type/\[type-slug\]                                     |
| Scenario ranking | /rankings/scenario/\[scenario-slug\]                             |
| Field Manual     | /field-manual plus chapter anchors or child routes               |

The existing clean base URLs are attractive, but they collide
conceptually with top-level product routes and require a reserved-route
list. SOL should recommend whether to retain root-level /\[slug\] routes
or adopt /base/\[slug\]. Any decision needs a full redirect and
canonical plan.

## 7.2 Rendering strategy

- Public base, ranking, type, region, scenario and Field Manual pages
  should be statically generated where practical for performance and
  crawlability.

- Incremental regeneration or webhook-triggered rebuilds should publish
  content changes without full manual redeploys.

- Interactive filtering and comparison selection can hydrate client-side
  while preserving indexable server-rendered shells.

- Quiz questions can be client-side, but landing content and any
  shareable result page need deliberate metadata/caching rules.

- Avoid creating thousands of thin combinatorial pages merely because
  the database permits it.

## 7.3 SEO expansion

- Unique, stable canonical URL for each base and indexable ranking page.

- Generated title, description, Open Graph image and social metadata
  with editorial override capability.

- XML sitemap split by content type when scale requires it.

- Structured data appropriate to site/navigation/article content without
  misrepresenting fictional analysis as real emergency guidance.

- Breadcrumbs and consistent internal linking between base, type,
  region, scenario, compare and Field Manual.

- Redirect map from all V1 URLs, .html routes, query routes and
  Cloudflare-rewritten paths.

- Robots and noindex rules for duplicate filter states and non-canonical
  comparison/quiz URLs.

# 8. Personalisation readiness

Personalisation is a future expansion, not a reason to overbuild V2
launch. The architecture should nonetheless avoid making it impossible.

- Represent quiz answers and profile dimensions as data rather than
  hard-coded UI branches.

- Separate anonymous browser persistence from optional authenticated
  saved profiles.

- Design recommendation functions so the same preference vector can rank
  bases on the quiz result, homepage and rankings.

- Version quiz/scoring models so an old result can be explained after
  logic changes.

- Do not expose sensitive personal data; survival preferences are low
  sensitivity but still require clear storage and deletion choices if
  accounts are introduced.

# 9. Security, operations and quality

| **Concern**         | **Baseline requirement**                                                                  |
|---------------------|-------------------------------------------------------------------------------------------|
| Secrets             | No keys or service-role credentials in browser bundles or repository                      |
| Supabase RLS        | Explicit policies; public read only for published content; write operations restricted    |
| Admin/editor access | Authenticated, least privilege, auditability appropriate to chosen CMS/admin path         |
| Input validation    | Validate slugs, filters, comparison inputs and any share tokens server-side               |
| Headers             | CSP, HSTS, referrer and permissions policy reviewed with Cloudflare/Vercel                |
| Dependencies        | Lockfiles, automated vulnerability alerts and intentional upgrade policy                  |
| Accessibility       | Keyboard operation, focus states, semantics, alt text, contrast and reduced-motion checks |
| Performance         | Core Web Vitals budget, responsive images, caching and bundle analysis                    |
| Observability       | Error monitoring, deployment logs, uptime monitoring and privacy-conscious analytics      |
| Backups             | Supabase backup/export plan plus R2 asset inventory and repository versioning             |
| Environments        | Local, preview/staging and production with isolated data/configuration                    |

# 10. Migration and rebuild approach

1.  Freeze and inventory V1. Export Cloudflare configuration and capture
    production routes.

2.  Complete SOL’s read-only audit and agree a parity matrix.

3.  Create the clean V2 repository and deployment skeleton on Next.js.

4.  Design and migrate the data model before copying page code.

5.  Build shared design system and global navigation using the current
    frontend as reference, not as code to transplant blindly.

6.  Implement homepage catalogue and base detail first because they
    exercise most data and components.

7.  Implement rankings and related recommendations from the shared query
    layer.

8.  Implement compare and verify every displayed metric against central
    scoring data.

9.  Implement quiz with versioned configuration and deterministic result
    tests.

10. Migrate Field Manual and decide CMS after real authoring tests.

11. Migrate images to R2 and introduce responsive delivery.

12. Run automated and manual parity testing across mobile and desktop.

13. Build redirect/canonical plan, stage on a subdomain, crawl it and
    then cut over.

14. Retain rollback capability and monitor production after launch.

# 11. SOL audit work packages

| **Work package**          | **Questions to answer**                                                                    | **Expected output**                                 |
|---------------------------|--------------------------------------------------------------------------------------------|-----------------------------------------------------|
| Repository map            | What files, entry points, build steps and dependencies exist?                              | Annotated tree and architecture diagram             |
| Route/runtime map         | Which URLs are static files, query-driven templates or Cloudflare rewrites?                | Route table including redirects and canonical risks |
| Data map                  | Where are bases, scores, text, scenarios, quiz and recommendations stored and transformed? | Source-to-screen data lineage                       |
| UI/component map          | What patterns are duplicated and what is already reusable?                                 | Component inventory and duplication hotspots        |
| Scoring/ranking audit     | How are overall and seven comparison factors calculated and weighted?                      | Formula specification plus consistency tests        |
| Quiz audit                | How do answers map to dimensions, profiles and base compatibility?                         | Deterministic algorithm description and edge cases  |
| SEO audit                 | What metadata, sitemaps, canonical tags and route limitations exist?                       | Current-state SEO inventory and migration risks     |
| Performance/accessibility | Where are the largest UX and technical risks?                                              | Measured findings prioritised by severity           |
| Security/dependency audit | Are there exposed secrets, unsafe patterns or obsolete dependencies?                       | Risk register                                       |
| Migration assessment      | What can be retained, translated or retired?                                               | Preserve/rebuild/improve/retire matrix              |

# 12. Decisions and open questions

| **Decision / question**             | **Current position**       | **Owner / trigger**                                  |
|-------------------------------------|----------------------------|------------------------------------------------------|
| Next.js                             | Agreed direction           | Proceed unless audit finds a material blocker        |
| Supabase/Postgres                   | Agreed direction           | Proceed to data model prototype                      |
| CMS layer                           | TBC                        | Decide after base + Field Manual authoring prototype |
| Vercel hosting                      | Preferred discussed option | Confirm pricing, deployment and Cloudflare topology  |
| Root /\[slug\] vs /base/\[slug\]    | Open                       | Resolve during route/SEO design                      |
| Scenario source and algorithm       | Unknown / likely JSON      | SOL must verify                                      |
| Recommendation generation           | Current mix/logic unknown  | SOL must trace                                       |
| Overall score weighting             | Must be formally specified | SOL audit then owner approval                        |
| Quiz result persistence/share model | Future/TBC                 | Define launch scope                                  |
| Image transformation pipeline       | TBC                        | Prototype R2 + Next/Image/Cloudflare options         |
| Static map legal/technical workflow | Future feature             | Design separately with source/licensing review       |
| Content review workflow             | Required during migration  | Owner + editorial process                            |

# Appendix A: Initial entity model

| **Entity**                       | **Key fields / relationships**                                                                     |
|----------------------------------|----------------------------------------------------------------------------------------------------|
| bases                            | id, slug, name, country_id, region_id, type_id, coordinates, publish_status, core editorial fields |
| regions                          | id, slug, name, description, SEO overrides                                                         |
| base_types                       | id, slug, name, description, category image                                                        |
| score_dimensions                 | id, key, name, description, default_weight                                                         |
| base_scores                      | base_id, dimension_id, value, model_version, rationale/source                                      |
| survival_profiles                | base_id, horizon, rating, positives, negatives, failure_statement                                  |
| media_assets                     | id, base_id, role, storage_key, alt_text, dimensions, sort_order, attribution                      |
| scenarios                        | id, slug, name, description, rules/weights, publish_status                                         |
| scenario_results or derived view | scenario_id, base_id, scenario_score/rank                                                          |
| quiz_questions                   | id, version, order, text, active                                                                   |
| quiz_answers                     | question_id, text, dimension_effects/profile_effects                                               |
| quiz_profiles                    | id, slug, name, summary, strengths, compromises, dimension targets                                 |
| manual_chapters                  | id, slug, title, order, rich content or CMS reference                                              |
| related_links                    | source_type/id, target_type/id, relationship, editorial order                                      |

This is a briefing-level model, not a final schema. SOL should compare
it to actual V1 fields and propose normalisation only where it improves
integrity, editing or querying.

# Appendix B: Parity checklist

- All 111 bases migrate with stable slugs or explicit redirects.

- All headline and extended scores match approved source data.

- Homepage search, Region, Type, sort, reset, result count and List/Map
  work.

- Category cards correctly filter/anchor into Explore.

- Random base works across breakpoints.

- Base ranking badges agree with ranking pages.

- Compare landing filters and counts are independent and accurate.

- Compare result winner, margins, chart and recommendation agree
  mathematically.

- All four ranking families produce deterministic orderings.

- Quiz requires 12 answered questions and reproduces expected test
  outcomes.

- Previous quiz result behaviour is defined and tested.

- Field Manual chapter navigation and contextual links work on
  mobile/desktop.

- Cloudflare/V1 redirects are represented in the launch redirect map.

- Every public page has approved metadata, canonical and sitemap
  inclusion.

- Images have alt text, responsive delivery and no dependency on
  repository raw URLs.

- Accessibility and performance acceptance thresholds are met before
  cutover.
