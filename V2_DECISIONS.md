# ZombieBases V2 Decisions

## Purpose

This document records the approved product and technical decisions for ZombieBases V2. Its purpose is to prevent future architecture, implementation and content tasks from reinterpreting or reopening decisions that have already been made by the owner.

The source documents have distinct roles:

- the Product Brief defines intended user behaviour;
- the Technical Context describes the agreed technical direction;
- the V1 audit documents current implementation evidence;
- this document defines the owner-approved choices for V2.

These decisions are authoritative unless the owner explicitly changes them.

## Core principles

1. One authoritative source of truth.
2. Derive rather than duplicate.
3. Behavioural parity before feature expansion.
4. Build V2 for V2, not for hypothetical V3 requirements.
5. Server-render stable public content; use the browser for interaction.
6. AI-assisted content must be reviewed and approved by the owner before publication.
7. Cloudflare should provide infrastructure services, not application routing.

## Decision 1 — Public URLs and routing

Approved decision:

- Public base URLs remain root-level clean URLs, for example `/fort-george`.
- Next.js owns all application routing.
- Cloudflare application rewrite and redirect rules used by V1 will not be part of the V2 application architecture.
- Cloudflare remains responsible for infrastructure concerns such as DNS, security, CDN and R2.
- Next.js must reserve product and system routes so they cannot collide with base slugs.

Reasoning:

- Root-level base URLs preserve the clean V1 URL experience.
- Keeping the same public URL shape avoids migration damage to existing links, bookmarks, search results and shared URLs.
- Removing application routing from Cloudflare rewrite and redirect rules reduces operational ambiguity and avoids hidden dashboard configuration.
- Letting Next.js own routing keeps route behaviour version-controlled, reviewable and testable in the application codebase.
- Reserved product and system routes are required because root-level base slugs otherwise share the same namespace as application pages.

## Decision 2 — Rendering and caching

Approved decision:

- Use Next.js App Router.
- Public content pages should be server-rendered as generated and cached HTML.
- Use on-demand revalidation after publication or content changes.
- Do not render stable content from scratch on every request.
- One shared template generates all base detail pages.
- Interactive parts may use Client Components where required.

This applies to stable public content including:

- homepage;
- base details;
- rankings;
- regions;
- types;
- scenarios;
- Field Manual;
- Compare initial result;
- Quiz landing page.

Direct comparison result pages should have server-rendered initial content so that direct URLs, search crawlers and social previews receive meaningful content before browser interaction begins.

Cache invalidation must be dependency-aware:

- a changed base page must be revalidated;
- dependent pages such as the homepage, rankings, its region page, its type page and affected scenario pages must also be revalidated;
- the architecture must include a reliable manual revalidation fallback;
- scheduled publication must be handled automatically without requiring a person to clear the cache manually.

Reasoning:

- Generated and cached HTML gives public pages stable SEO, fast delivery and predictable sharing behaviour.
- On-demand revalidation keeps published content current without making every request recompute stable pages.
- A shared base detail template prevents V1-style page drift and makes content behaviour easier to validate.
- Client Components remain appropriate for genuinely interactive UI, but they must not replace server-rendered public content where SEO, sharing or initial load stability matters.

## Decision 3 — Supabase data philosophy

Approved decision:

- Supabase stores authoritative source content, configuration and scores only.
- Do not persist generated rankings, percentiles, comparison results, quiz matches or scenario results as separate product data in V2.
- Derived results may be cached for delivery performance but must not become a second source of truth.

Charlie may manually edit:

- base identity;
- taxonomy;
- editorial content;
- core scores;
- comparison scores;
- scenario definitions and weights;
- quiz questions, answers and profiles;
- curated relationships;
- media metadata;
- publishing state.

The system derives:

- global, regional and type rankings;
- percentiles;
- scenario rankings;
- comparison outcomes;
- quiz compatibility;
- aggregate homepage statistics.

Persistent generated-result tables may be reconsidered in V3 only if a proven performance, history or audit requirement exists.

Reasoning:

- Source content and scoring inputs are the durable editorial product data.
- Rankings, percentiles, comparisons, quiz matches and scenario results are outputs of current formulas applied to current source data.
- Persisting generated results as product data would create duplicate truth, increase invalidation risk and make editorial changes harder to reason about.
- Performance caches are acceptable only when they can be regenerated from authoritative source records.

## Decision 4 — Search, filtering and sorting

Approved decision:

- Basic catalogue search, filtering and sorting run in the browser.
- The browser receives a compact catalogue of published bases.
- Full long-form content is not included in the catalogue.
- Filter state remains reflected in the URL.
- No normal search interaction should require a Supabase query.

The searchable fields are:

- name;
- aliases;
- region;
- country;
- type;
- short summary.

Do not search:

- long-form editorial content;
- strengths and weaknesses;
- survival profiles;
- Field Manual;
- Compare content;
- Quiz content.

The compact catalogue should include only fields needed for:

- search;
- filters;
- sorting;
- result counts;
- cards;
- list/map switching;
- map markers.

Hybrid or server-side search is deferred to V3 unless catalogue size or complexity genuinely requires it.

Reasoning:

- V2 needs predictable, fast catalogue discovery rather than a broad content search product.
- A compact browser-side catalogue preserves the responsive V1-style interaction while avoiding Supabase calls on each normal search or filter change.
- Keeping full editorial content out of the catalogue limits payload size and avoids turning basic search into full-document indexing.
- URL-reflected filter state preserves shareability and reload behaviour.

## Decision 5 — Rankings and scenarios

Approved decision:

- Rankings and scenarios are derived on the server using shared TypeScript logic.
- Calculate them while generating or revalidating pages.
- Do not calculate the authoritative ranking pages only in the browser.
- Do not move core product formulas into PostgreSQL for V2.
- Do not persist generated ranking or scenario result tables.

This covers:

- global rankings;
- region rankings;
- type rankings;
- percentiles;
- scenario rankings;
- homepage statistics where applicable.

The ranking and scenario engines must be deterministic, centralised and thoroughly tested.

Reasoning:

- Server-derived ranking pages provide stable public content for SEO, sharing and accessibility.
- Shared TypeScript logic keeps formulas close to the application behaviour and allows the same deterministic rules to be reused by generation, revalidation and tests.
- Moving formulas into PostgreSQL would add V2 complexity and split product logic across layers.
- Persisting generated ranking or scenario result tables would duplicate source-derived outputs and create avoidable invalidation risk.

## Decision 6 — Compare

Approved decision:

- Use a hybrid architecture.
- A direct comparison URL is initially calculated and server-rendered.
- Browser interaction allows users to swap bases and update the result responsively.
- Server and browser must use the same deterministic TypeScript comparison engine.
- Comparison results are always derived and never stored as authoritative data.
- Recommendation text must remain deterministic rather than use live AI generation.

The server-rendered initial result must support SEO, social previews and direct URL sharing. After a user swaps bases in the browser, the interface must update responsively and keep the URL in sync with the selected bases. Server and client output must remain equivalent for the same inputs.

Reasoning:

- Compare is both a shareable public result and an interactive tool.
- Server rendering protects direct URLs and previews, while browser updates preserve fast exploratory interaction.
- A shared deterministic engine prevents server/client drift.
- Deterministic recommendation text keeps published output reviewable and avoids unapproved live AI-generated public content.

## Decision 7 — Quiz

Approved decision:

- Questions are answered in the browser.
- The result and survival profile are calculated in the browser.
- No server request is required for each answer.
- The completed profile is stored in LocalStorage.
- No account is required.
- The profile may be used for restrained personalisation across the site.

There is no methodology versioning in V2. Previous results may change when current data or quiz logic changes. Accounts and cross-device syncing are deferred to a later version.

Reasoning:

- The quiz is an interactive session, not a server-authenticated workflow.
- Browser-side calculation keeps answers responsive and avoids unnecessary backend dependency.
- LocalStorage is sufficient for a lightweight anonymous survival profile.
- V2 deliberately favours one current model over historical compatibility.

## Decision 8 — Media

Approved decision:

- Cloudflare R2 stores media files.
- Supabase stores media records, metadata and relationships.
- A base may have multiple media items.
- Initial supported media roles include:
  - hero;
  - static map;
  - gallery.
- The model should allow additional roles later without redesigning the base entity.
- The application must resolve media by database role, not by guessing from filenames.

Use human-readable filename conventions such as:

- `{slug}-hero.webp`
- `{slug}-map.webp`
- `{slug}-gallery-01.webp`

Filenames are conventions, not relationships. The database relationship and media role determine how an asset is used.

Media metadata should include:

- role;
- storage key;
- alt text;
- caption;
- attribution;
- display order;
- publication state;
- optional focal point.

Reasoning:

- R2 is the appropriate infrastructure store for media files, while Supabase is the appropriate source for structured metadata and relationships.
- Role-based lookup prevents brittle filename guessing and supports multiple assets per base.
- Human-readable filenames help editors and operators, but they must not be treated as application logic.
- A role-based model allows future media roles without redesigning the base entity.

## Decision 9 — Publishing workflow

Approved decision:

Only two statuses exist:

- Draft
- Published

Use:

- `status`
- `publish_at`
- `published_at`
- `updated_at`

Rules:

- Draft content is never public.
- Published content is public only when `publish_at` is null or less than or equal to the current time.
- `published_at` is system-managed and records first publication.
- `updated_at` is system-managed.
- Scheduled publication is supported.
- There is no In Review status.
- Public search, rankings, Compare, Quiz, sitemap and SEO output include only content that is currently live.

Reasoning:

- Draft and Published are enough for the V2 editorial workflow.
- Scheduled publication needs explicit timing fields without introducing a larger approval-state machine.
- System-managed timestamps protect publication history and update ordering.
- Public outputs must share the same live-content rule to avoid unpublished content leaking through search, rankings, comparison, quiz, sitemap or SEO surfaces.

## Decision 10 — No methodology versioning

Approved decision:

- V2 maintains one current scoring model.
- V2 maintains one current scenario model.
- V2 maintains one current quiz model.
- When those models change, the site moves forward as a whole.
- Do not preserve historical scoring engines or result compatibility.
- Historical versioning may be reconsidered in a later version only if there is a demonstrated need.

Reasoning:

- V2 is not required to reproduce historical results after methodology changes.
- Maintaining historical engines would add complexity across scoring, rankings, Compare, Quiz and content explanations.
- A single current model is simpler to test, explain and operate.

## Decision 11 — Authentication

Approved decision:

- No user accounts in V2.
- All core features work anonymously.
- LocalStorage may hold the quiz profile and lightweight preferences.
- Do not build authentication, password reset, profile syncing or account UI.
- The architecture should not deliberately make future accounts impossible, but account-readiness must not add V2 complexity.

Reasoning:

- V2 core value does not require identity.
- Anonymous use reduces friction and implementation scope.
- LocalStorage supports lightweight continuity without creating an account system.
- Future account support should not drive V2 architecture beyond reasonable avoidance of dead ends.

## Decision 12 — Search capability

Approved decision:

Use basic, predictable catalogue search rather than semantic or vector search.

Search only:

- name;
- aliases;
- region;
- country;
- type;
- short summary.

Do not add semantic search, AI search or full-document indexing in V2.

Reasoning:

- V2 search should be understandable, deterministic and easy to validate.
- The approved searchable fields match catalogue discovery needs.
- Semantic search, AI search and full-document indexing would expand product scope and require additional infrastructure, tuning and moderation decisions.

## Decision 13 — Personalisation

Approved decision:

- The quiz result becomes the user’s survival profile.
- Store it in LocalStorage.
- Use it subtly across the site.
- The site must remain completely usable without taking the quiz.

Initial V2 personalisation may influence:

- homepage recommendations;
- suggested comparisons;
- profile-specific ranking views;
- Field Manual recommendations;
- related bases.

Do not include:

- user accounts;
- cloud syncing;
- live AI-generated personalised copy;
- fully different page structures;
- a heavy recommendation platform.

Reasoning:

- The survival profile is a useful lightweight context signal, not an identity system.
- Personalisation should enhance discovery without making the site depend on quiz completion.
- Restrained, deterministic personalisation keeps V2 understandable and avoids creating a large recommendation platform.

## Content creation workflow

Approved workflow:

1. The owner provides a V1 URL or screenshot for a base.
2. The owner and ChatGPT review the V1 content against an agreed rubric.
3. ChatGPT prepares the revised V2 content.
4. The owner reviews and approves it.
5. The owner manually enters the content into Supabase.
6. The content remains Draft until the owner marks it Published and optionally sets `publish_at`.
7. Publication triggers the relevant page revalidation.

AI does not publish directly. There is no automated AI-to-Supabase writing workflow in V2. Supabase is the initial editorial interface. A separate CMS is not approved for launch. A CMS may be reconsidered only after real editorial use shows that Supabase is inadequate.

Reasoning:

- Owner review is required before publication of AI-assisted content.
- Manual Supabase entry keeps the launch workflow simple and controlled.
- Deferring a CMS avoids adding editorial infrastructure before there is evidence that Supabase is insufficient.

## Deferred to V3 or later

The following capabilities are explicitly deferred to V3 or later unless the owner changes these decisions:

- persistent generated ranking/result tables;
- server-side or semantic catalogue search;
- user accounts and cross-device profiles;
- full historical methodology versioning;
- full DAM functionality;
- fully personalised page structures;
- live AI-generated public content;
- advanced publishing workflows;
- enterprise editorial approval processes.

## Decision summary table

| ID | Decision | Approved approach | V2 status | Deferred alternative |
| --- | --- | --- | --- | --- |
| 1 | Public URLs and routing | Root-level clean base URLs with Next.js-owned application routing | Approved for V2 | Cloudflare application rewrite/redirect routing |
| 2 | Rendering and caching | Next.js App Router with generated, cached public HTML and on-demand revalidation | Approved for V2 | Rendering stable public content from scratch on every request |
| 3 | Supabase data philosophy | Store authoritative source content, configuration and scores only | Approved for V2 | Persistent generated result tables unless V3 proves a need |
| 4 | Search, filtering and sorting | Browser-side catalogue search, filters and sorting using a compact published-base catalogue | Approved for V2 | Hybrid or server-side search unless size or complexity requires it |
| 5 | Rankings and scenarios | Server-derived deterministic TypeScript engines during generation or revalidation | Approved for V2 | Browser-only authoritative rankings, PostgreSQL formulas or persisted result tables |
| 6 | Compare | Hybrid server-rendered direct result plus responsive browser interaction | Approved for V2 | Stored comparison results or live AI recommendations |
| 7 | Quiz | Browser-side quiz with LocalStorage survival profile and no accounts | Approved for V2 | Server-per-answer workflow, methodology versioning or cross-device syncing |
| 8 | Media | R2 file storage with Supabase media metadata, relationships and roles | Approved for V2 | Filename-guessed relationships or full DAM scope |
| 9 | Publishing workflow | Draft/Published with `publish_at`, `published_at` and `updated_at` | Approved for V2 | In Review status or advanced approval workflows |
| 10 | No methodology versioning | One current scoring, scenario and quiz model | Approved for V2 | Historical scoring engines or result compatibility |
| 11 | Authentication | Anonymous core features with LocalStorage preferences only | Approved for V2 | Accounts, password reset, profile syncing or account UI |
| 12 | Search capability | Basic predictable catalogue search over selected fields | Approved for V2 | Semantic search, AI search or full-document indexing |
| 13 | Personalisation | Restrained LocalStorage-based survival-profile personalisation | Approved for V2 | Accounts, cloud syncing, live AI copy or heavy recommendation platform |
| CW | Content creation workflow | Owner-reviewed AI assistance with manual Supabase entry and owner-controlled publication | Approved for V2 | Automated AI-to-Supabase publishing or separate launch CMS |

## Final instruction to future architecture and implementation tasks

These decisions are approved. Future tasks must implement them rather than reopen them.

A decision may only be challenged where it is technically impossible, internally contradictory, unsafe or explicitly changed by the owner. Any suggested deviation must identify the relevant decision, explain the impact and seek owner approval before implementation.
