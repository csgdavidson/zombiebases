# 08 Search and Filtering

## Homepage Explore filtering

Homepage state includes:

* `query` — free text search;
* `region` — selected region taxonomy key;
* `type` — selected type taxonomy key;
* `sort` — one of score/name/region/type variants;
* `view` — list or map.

Filtering is cumulative. `matchesSearch`, `matchesFilters`, `sortBases` and `applyFilters` in `js/main.js` implement the pipeline:

```mermaid
flowchart LR
  Load[Bases] --> Status[Displayable bases]
  Status --> Query[Search match]
  Query --> Region[Region filter]
  Region --> Type[Type filter]
  Type --> Sort[Sort]
  Sort --> Render[List or map]
  Render --> URL[replaceState URL sync]
```

## Search fields

Homepage search text includes base name, country, type label/key, region label/key, description summary and hard-coded aliases for common terms such as islands, forts, castles, bunkers, lighthouses and polar/arctic concepts.

## Header/mobile search

`js/mobile-nav.js` handles desktop header search form submission, mobile search UI and preset chips. Searches redirect to the homepage with `?q=` applied; they do not search in-place on every page.

## Compare selector filtering

Compare selectors are independent per side. Each selector has its own search query, type filter and region filter. Counts update per selector, and disabled state prevents selecting the same base on both sides where applicable.

## Rankings filters

Region and type rankings are not general filters over the homepage; they are separate ranking pages driven by `data/rankings.json` groups and a dropdown query parameter.

## Scenario selector

Scenarios use a scenario dropdown rather than free filters. Selection changes the `scenario` query parameter and renders a precomputed scenario list.

## Hidden assumptions and duplication

* Search aliases are hard-coded in homepage and compare logic separately.
* Header search always routes to homepage; it does not preserve current page context.
* Region/type labels are duplicated across scripts, creating risk of label drift.
* Map view depends on valid `lat` and `long` values and on Leaflet being available.
