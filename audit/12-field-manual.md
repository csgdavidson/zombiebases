# 12 Field Manual

## Structure

The Field Manual is implemented as long-form static HTML in `field-manual.html`, with `field-manual/index.html` as a generated duplicate. It contains a hero, reading-time framing, desktop/mobile table-of-contents containers, and sequential `.field-section` chapters.

## Current chapter set

The implemented chapter set matches the brief's themes:

1. Survival Begins Before the Outbreak
2. What Makes a Great Survival Base?
3. The Seven Survival Factors
4. Defence Is Only the Beginning
5. Feeding a Community
6. Building a Community That Lasts
7. Survival Myths That Refuse to Die
8. Choosing the Right Base
9. How Zombie Bases Scores Every Location
10. Frequently Asked Questions

## Behaviour

`js/field-manual.js` derives the TOC from sections, writes links into desktop and mobile navigation, observes visible sections to mark the active chapter, updates a scroll progress bar, and applies metadata through `window.seo`.

## Internal linking

Manual chapters include “Continue Your Research” panels linking to rankings, type pages, compare and specific base detail routes. Many links use legacy `.html?slug=` or `.html?type=` forms rather than clean routes.

## Content model

The manual is not stored as JSON or markdown at runtime. Its rich content, callouts, FAQ entries and related links are embedded directly in HTML. This makes it crawlable in the raw shell but harder to migrate into structured content without extraction.

## Risks and assumptions

* TOC behaviour depends on `.field-section` IDs and `data-title` attributes.
* Progress calculation assumes normal document scrolling.
* Callout types are CSS class conventions rather than data types.
* Manual links may need route/canonical normalization during migration.
