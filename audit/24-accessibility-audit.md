# 24 Accessibility Audit

Status: static INSPECTED; no axe/screen-reader browser run.

| Severity | Finding | Evidence | Recommendation |
|---|---|---|---|
| High | Client-rendered dynamic regions lack consistent live announcements. | Explore, compare and quiz replace large containers from JS. | Add `aria-live`/status updates for filter counts, quiz validation, compare errors. |
| High | Map accessibility is likely weak. | `js/map.js` depends on Leaflet markers/tiles; map/list toggle exists. | Provide keyboard-accessible equivalent list, descriptive controls, non-map fallback. |
| Medium | Quiz answer controls are custom cards/buttons; validation/navigation depends on JS state. | `quiz.html`, `js/quiz.js`. | Ensure radio semantics or `aria-pressed`, focus movement, errors associated to controls. |
| Medium | Compare selectors are custom searchable selectors. | `compare.html`, `js/compare.js`. | Implement combobox/listbox ARIA, keyboard arrow behaviour and same-base error announcement. |
| Medium | Image alt text is generic base name only. | Card/base/compare templates. | Add contextual alt or empty decorative alt where appropriate; store asset alt metadata. |
| Medium | Mobile fixed navigation may overlap content/touch targets. | `mobile-nav.js`, global CSS fixed nav patterns. | Test mobile viewport and ensure safe-area/padding. |
| Low | Heading hierarchy and landmarks mostly present in static shells but dynamic card headings vary. | HTML shells and card renderer. | Preserve single H1 and structured H2/H3 order in V2. |
| Low | Reduced-motion support not verified. | CSS static inspection did not find a comprehensive motion strategy. | Add `prefers-reduced-motion` checks for transitions/progress. |
| Low | Contrast risks require visual measurement. | Large single CSS theme. | Run automated contrast audit before launch. |

Positive evidence: static pages use semantic sectioning and visible text labels in many forms; list view provides non-map path. UNKNOWN: real keyboard tab order/focus visibility without browser exercise.
