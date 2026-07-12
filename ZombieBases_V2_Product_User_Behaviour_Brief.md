**ZOMBIE BASES**

Product & User Behaviour Brief

Authoritative description of Zombie Bases V1 user journeys, page
behaviour and product intent to preserve during the V2 audit and
rebuild.

| **Document status** | For SOL audit briefing                                                                         |
|---------------------|------------------------------------------------------------------------------------------------|
| **Version**         | 1.0                                                                                            |
| **Audience**        | SOL / repository auditor / V2 implementation team                                              |
| **Purpose**         | Provide authoritative product intent and technical context before independent repository audit |

| **Important:** This document records intended behaviour and agreed V2 direction. It is not SOL’s audit finding. SOL should verify implementation independently and challenge assumptions where the repository disagrees. |
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|

# Contents

**1. How SOL should use this brief**

**2. Product overview**

**3. Global experience and navigation**

**4. Page-by-page behaviour**

> Homepage / Explore
>
> Base detail
>
> Compare landing
>
> Compare detail
>
> Rankings, Regions, Types and Scenarios
>
> Survival Quiz
>
> Field Manual

**5. Cross-product journeys**

**6. Mobile and desktop behaviour**

**7. Content principles and known weaknesses**

**8. Future product opportunities**

**9. Audit acceptance criteria**

# 1. How SOL should use this brief

Read this document before inspecting the repository. It explains why
each part of the product exists, what users are expected to do, and
which behaviours must not be lost merely because the V1 implementation
is awkward.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Audit stance<br />
</strong>Treat the repository as evidence of implementation, not as the
sole source of product truth. Record discrepancies between intended
behaviour and actual code as findings rather than silently copying
either side.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

- Identify where V1 behaviour is intentional, accidental, duplicated or
  constrained by the static architecture.

- Preserve the product’s core mental model: Explore, understand,
  compare, personalise and learn.

- Distinguish mandatory parity from opportunities to simplify or improve
  in V2.

- Flag ambiguity instead of inventing behaviour.

# 2. Product overview

Zombie Bases is an image-led discovery and analysis product that ranks
real-world locations as potential long-term survival bases during a
fictional zombie outbreak. The fiction is the hook; the differentiator
is grounded evaluation of defensibility, isolation, sustainability and
practical constraints.

| **Product pillar** | **Primary user need**        | **Key outcome**                                                             |
|--------------------|------------------------------|-----------------------------------------------------------------------------|
| Explore            | Browse the full dataset      | Find interesting locations through search, filters, map/list and categories |
| Base detail        | Understand one location      | See scores, rationale, trade-offs, survival timeline and alternatives       |
| Compare            | Evaluate two options         | Understand which base wins, where and why                                   |
| Quiz               | Receive a personalised match | Translate user priorities into a recommended base and profile               |
| Rankings           | Browse curated orderings     | Discover leaders globally, by region, type or scenario                      |
| Field Manual       | Understand the methodology   | Learn the principles behind the scoring and recommendations                 |

V1 contains 111 bases, 12 regions, 8 base types and three headline
survival scores. The dataset and imagery will expand in V2.

# 3. Global experience and navigation

## 3.1 Header and primary navigation

The standard header appears across the site. Desktop presents the logo,
global search, Explore, Compare, Survival Quiz, Rankings, Random and an
overflow menu. Mobile uses a compact logo, search and menu at the top
plus a persistent bottom navigation bar.

- Explore is the default/home destination.

- Compare opens the comparison builder.

- Survival Quiz opens the quiz landing page or allows the user to
  revisit a previous result.

- Rankings opens the global ranking list.

- Random immediately selects a base and opens its detail page.

- More/overflow exposes supporting destinations such as Regions, Types,
  Scenarios and Field Manual.

## 3.2 Search

Search is free text and ultimately returns the user to the homepage
Explore listing with the query applied. It searches across base names
and discoverable terms such as countries, regions and types. On mobile,
the expanded search interface also exposes preset suggestions (for
example Forts, Islands, Underground, Bases, Prisons, Lighthouses and
Polar). These presets are a mobile convenience rather than a desktop
requirement.

## 3.3 Random base

Random is a prominent, intentionally playful discovery path. Each
activation should choose a base and navigate directly to its detail
page. It must not require the user to visit or manipulate the listing
first.

## 3.4 Footer

The footer provides redundant discovery and learning links grouped into
Discover, Browse and Learn. It includes Explore all bases, Rankings,
Compare, Quiz, Random, Regions, Base Types, Scenarios, Field Manual,
scoring methodology and survival factors.

# 4. Page-by-page behaviour

## 4.1 Homepage / Explore

The homepage is both the brand landing page and the primary catalogue.
It must quickly communicate the proposition, offer guided discovery and
then provide full control over the dataset.

| **Section**         | **Current behaviour**                                                                                             | **User intent**                             |
|---------------------|-------------------------------------------------------------------------------------------------------------------|---------------------------------------------|
| Hero                | H1, proposition copy and large featured image                                                                     | Understand the product immediately          |
| Statistics          | Static summary boxes for bases, regions, categories and scores                                                    | Establish scale and credibility             |
| Explore by category | Image-led cards for every base Type; selecting one anchors to the listing and applies that Type filter            | Start with a preferred survival strategy    |
| Popular links       | Quick routes to best overall, region, type and Field Manual                                                       | Reach common destinations without filtering |
| Catalogue controls  | Free search; Region and Type filters; sort; reset; List/Map toggle; live result count                             | Narrow the full dataset                     |
| List view           | Default view. Cards show image, name, country/region/type metadata, descriptive excerpt, badges and overall score | Scan and open a base                        |
| Map view            | Geographic map with markers/clusters representing the same filtered dataset                                       | Explore by location                         |

Filtering is cumulative. The result count updates as criteria change.
Selecting a result opens the corresponding base detail page. Category
cards are not separate category landing pages in V1; they are shortcuts
into a filtered homepage listing.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr class="header">
<th><strong>Parity requirement<br />
</strong>The homepage is not merely a marketing page. The
searchable/filterable full catalogue is part of the homepage product
contract.</th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 4.2 Base detail page

This is the most important page in the product and the definitive
explanation of one base.

1.  A large statement hero image with Back to List, base title, Region
    and Type.

2.  Ranking context: global rank/top percentage, rank within Region and
    rank within Type.

3.  Prominent overall score plus the three headline subscores:
    Defensibility, Isolation and Sustainability.

4.  The Bottom Line summary and supporting explanatory text.

5.  Expanded analysis for the three survival pillars, including
    evidence, advantages and limitations.

6.  Trade-off and failure framing: big trade-off, likely cause of
    failure, strengths, weaknesses, best use and key risk.

7.  Survival Profile across First 7 Days, First 100 Days and Long Term
    (100+ days).

8.  Choose the Next Rival: three one-click comparison recommendations,
    typically most similar, strongest alternative and a wildcard, plus a
    CTA to the full Compare page.

9.  Comparable locations / recommended next reads linking to other base
    detail pages and a broader similar/scenario route.

The page must explain not just the score but the causal reasoning behind
it. Users should understand what the base is good at, what compromises
it imposes and how it might fail.

### Future detail-page additions already discussed

- A static, editorially approved map showing the base and surrounding
  area. The first version would be generated using AI, Google Maps
  reference and owner feedback; the final image should open full-screen
  when clicked.

- Secondary images presented in a carousel or gallery.

- A full content review during Supabase migration because much current
  prose is considered weak or repetitive.

- A deliberate decision on which content fields remain structured in
  Supabase and whether a CMS layer is needed for richer editorial
  blocks.

## 4.3 Compare landing page

The compare landing page helps the user build a matchup without needing
to know exact base names.

10. Hero with H1, image and concise explanation of comparison.

11. Two equal selection panels, one for each base.

12. Each panel defaults to all bases and displays the total number of
    matching locations.

13. The user can filter independently by Type and/or Region. The count
    decreases as filters are applied.

14. The base picker is dynamic and visually rich, showing thumbnail,
    name, score, Region and Type.

15. A selected base is clearly represented in the interface and can be
    changed.

16. The Compare action becomes available only when two different bases
    are selected.

17. Curated preset matchups below provide low-friction starting points.

The two selectors are deliberately symmetrical. V2 should avoid making
one side feel primary or making the user complete a hidden sequence
unless there is strong UX evidence to do so.

## 4.4 Compare detail page

The comparison result converts raw scores into a clear recommendation
while retaining enough detail for the user to disagree intelligently.

18. Heading identifying Base A versus Base B and a brief comparison
    statement.

19. Two large featured-image cards with overall score and standard
    metadata.

20. Overall winner summary including weighted margin and category
    win/tie/loss count.

21. Category overview and radar/spider chart across seven comparison
    factors.

22. Detailed side-by-side scoreboard for Overall, Defensibility,
    Sustainability, Isolation, Exposure Control, Maintenance Resilience,
    Population Capacity and Resource Security.

23. Explicit reminder that overall scoring is weighted, so the weighted
    winner can differ from the base that wins the most individual
    categories.

24. Recommendation explaining the stronger overall choice and practical
    reasons.

25. Strengths and trade-offs for each base.

26. Final control allowing either base to be changed and the comparison
    rerun.

The result is expected to be explainable. Charts are supporting
evidence, not decoration. Every highlighted win or margin should be
traceable to source data and weighting rules.

## 4.5 Rankings, Regions, Types and Scenarios

These are four closely related views powered by a common ranked-list
pattern.

| **Family** | **Behaviour**                                                                             | **Selection control**              |
|------------|-------------------------------------------------------------------------------------------|------------------------------------|
| Rankings   | All bases sorted highest to lowest overall score                                          | None; canonical global leaderboard |
| Regions    | Only bases in the selected Region, ranked by overall score                                | Region dropdown at top             |
| Types      | Only bases in the selected Type, ranked by overall score                                  | Type dropdown at top               |
| Scenarios  | A preselected scenario applies alternative inclusion/weighting logic and explanatory copy | Scenario dropdown at top           |

Every card links to the relevant base detail page. The ranked card
contains image, name, Region/Type metadata, excerpt, overall score and
ordinal rank.

### Known scenario set in V1

- Best long-term survival bases

- Best short-term refuges

- Best community bases

- Highest risk / highest reward

The owner recalls the scenario configuration as probably JSON-backed,
but SOL must verify the actual source and calculation path in the
repository. This is explicitly an audit question, not a settled fact.

## 4.6 Survival Quiz

### Quiz landing

The landing page explains the assessment, presents a featured image and
sets expectations: 12 quick questions, every base analysed and no
sign-up required. First-time users see Begin Assessment. Returning users
who have completed the quiz also see View Previous Result and Retake
Assessment.

### Questions

- Exactly 12 questions.

- Each question has exactly four single-select answers.

- The user cannot continue until one answer is selected.

- Back and Continue allow movement through the assessment.

- The current question number, total and percentage progress are
  visible.

- All 12 questions must be answered before results are generated.

### Results

27. Recommended base presented prominently with hero image and
    compatibility percentage.

28. Named survival profile with summary, primary strength and main
    compromise.

29. Actions to explore the base detail page, retake the assessment and
    share the result.

30. Why this matches: strongest alignment, what the user gains and the
    clearest compromise.

31. Compatibility breakdown comparing user priorities with the
    recommended base across Defence, Isolation, Sustainability,
    Resources, Community, Technical Complexity and Access.

32. Three alternative matches with image, metadata, score, match
    percentage and route to each dossier.

33. Six possible survival profiles, with the user’s profile clearly
    highlighted and expandable detail.

### Future personalisation direction

The quiz is the foundation for future personalisation enabled by the V2
stack. Potential later capabilities include preserving a user’s
preference profile, reordering rankings and homepage recommendations,
tailoring related bases, showing “match for you” indicators across the
site and allowing results to evolve when base data changes. These are
future opportunities, not launch requirements unless separately agreed.

## 4.7 Field Manual

The Field Manual is a long-form knowledge and methodology page. It gives
the scoring system credibility and links educational content back into
real locations.

- Hero title, introduction and estimated reading time (currently 45
  minutes).

- Chapter-based table of contents. Desktop uses persistent/sticky side
  navigation; mobile uses an expandable table of contents.

- Continuous long-form chapters with headings, paragraphs and lists.

- Editorial callouts such as “What kills you here”, “Field note”, case
  studies and strategic insights.

- “Continue your research” blocks link to relevant rankings, types,
  comparisons and base detail pages.

- The content functions as documentation/evergreen guidance rather than
  a news blog.

### Current chapters

- Survival Begins Before the Outbreak

- What Makes a Great Survival Base?

- The Seven Survival Factors

- Defence Is Only the Beginning

- Feeding a Community

- Building a Community That Lasts

- Survival Myths That Refuse to Die

- Choosing the Right Base

- How Zombie Bases Scores Every Location

- Frequently Asked Questions

# 5. Cross-product journeys

| **Starting point** | **Typical journey**                                     | **Expected continuity**                                              |
|--------------------|---------------------------------------------------------|----------------------------------------------------------------------|
| Homepage category  | Type card → filtered catalogue → base detail            | Chosen Type remains understandable and Back to List returns sensibly |
| Search             | Header search → homepage filtered results → base detail | Query is visible and results reflect it                              |
| Base detail        | Suggested rival → one-click compare detail              | Current base is preselected and comparison opens directly            |
| Base detail        | Comparable location → another detail page               | User can continue browsing related dossiers                          |
| Quiz result        | Explore this Base → recommended base detail             | Recommendation and detail data must agree                            |
| Quiz result        | Alternative match → detail page                         | Alternative metadata and score must agree                            |
| Rankings           | Ranked card → base detail                               | Rank shown on list must align with detail-page ranking context       |
| Field Manual       | Contextual link → type/ranking/base/compare             | Educational claims connect to relevant product evidence              |

Consistency across these journeys is a major audit concern. V1 may
calculate or format the same facts in multiple places; V2 should
centralise them without changing the user-facing meaning.

# 6. Mobile and desktop behaviour

V1 is responsively designed rather than having separate products. SOL
should identify shared components and true breakpoint-specific
behaviour.

| **Area**                | **Mobile**                                       | **Desktop**                                               |
|-------------------------|--------------------------------------------------|-----------------------------------------------------------|
| Primary navigation      | Persistent bottom bar; compact top header        | Top navigation with search and primary destinations       |
| Search                  | Dedicated expanded search with preset chips      | Inline header search                                      |
| Homepage hero           | Stacked headline and image                       | Two-column statement hero                                 |
| Category cards          | Vertical image-led cards                         | Compact multi-column grid                                 |
| Catalogue controls      | Stacked controls and list/map toggle             | Single horizontal control strip                           |
| Result cards            | Large stacked cards                              | Horizontal rows                                           |
| Base detail hero        | Image with title/metadata followed by score card | Score card overlays/sits within wide hero composition     |
| Compare builder         | Panels stack vertically                          | Equal side-by-side panels                                 |
| Compare result          | Sequential stacked analysis                      | Side-by-side cards, table-like scoreboard and wide charts |
| Field Manual navigation | Collapsible table of contents                    | Sticky left chapter rail                                  |

Visual parity does not mean pixel-identical layouts. Behaviour,
hierarchy and access to information should remain equivalent at each
breakpoint.

# 7. Content principles and known weaknesses

- Images are central to discovery and must remain high-impact,
  especially on hero and listing cards.

- Scores must be accompanied by explanation and trade-offs; unsupported
  numbers undermine the product.

- The tone should be grounded and analytical despite the fictional
  premise.

- Current base prose is considered uneven and will be reviewed during
  data migration. V2 must not lock weak copy into an inflexible schema.

- Repeated text fragments and derived summaries should be audited for
  whether they are stored, generated or duplicated.

- SEO content was deliberately constrained in V1 and should not be
  treated as the desired ceiling.

# 8. Future product opportunities

- Personalised homepage, rankings and related-base recommendations based
  on quiz profile.

- Static map and secondary image gallery per base.

- Richer editorial and methodology content with structured internal
  linking.

- More scenario types and combinable ranking filters.

- Shareable quiz and comparison results with stable URLs and suitable
  social metadata.

- Analytics-informed refinement of funnels, filters and recommendation
  quality.

- Expanded SEO landing pages that remain genuinely useful rather than
  thin permutations.

# 9. Audit acceptance criteria

SOL’s product audit should, at minimum, produce the following evidence:

34. A route and page inventory mapped to the behaviours in this
    document.

35. A component inventory showing duplicated and shared UI patterns.

36. A user-flow map for search, filtering, random, compare, quiz and
    related-content journeys.

37. A catalogue of data fields consumed by every page and calculation.

38. A list of behaviour mismatches, broken states, inaccessible
    interactions and responsive inconsistencies.

39. A parity matrix classifying each V1 behaviour as Preserve, Rebuild
    differently, Improve after parity, or Retire with approval.

40. Open questions where intent cannot be proven from brief plus code.

41. No code changes during the first audit unless explicitly authorised.
