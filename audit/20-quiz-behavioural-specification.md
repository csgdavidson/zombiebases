# 20 Quiz Behavioural Specification

Status: core algorithm VERIFIED by `node --test tests/quiz-engine.test.js` and deterministic extraction script; UI/persistence INSPECTED in `js/quiz.js`.

## Axes

`defence`, `isolation`, `sustainability`, `resources`, `community`, `complexity`, `access`.

## Questions and answer weights

Order is fixed in `js/quiz-questions.js`:

1. `group_size`: solo `{isolation:3,access:1,community:-1}`; small `{defence:1,resources:1,isolation:2}`; community `{community:3,sustainability:2,resources:1}`; settlement `{community:4,defence:2,sustainability:1,access:1}`.
2. `first_priority`: lockdown `{defence:4,community:1}`; vanish `{isolation:4,access:-1}`; supplies `{resources:4,sustainability:1}`; rally `{community:4,sustainability:1}`.
3. `preferred_isolation`: nearby `{access:3,resources:1,isolation:-1}`; regional `{isolation:2,access:1,resources:1}`; extreme `{isolation:4,defence:1,access:-2}`; hidden `{isolation:3,defence:2,complexity:1}`.
4. `zombie_strategy`: walls `{defence:4}`; distance `{isolation:4}`; visibility `{defence:2,isolation:1}`; mobility `{access:3,resources:1}`.
5. `food_water`: farms `{sustainability:4,community:1}`; freshwater `{resources:4,sustainability:1}`; stockpile `{resources:3,access:2}`; mixed `{sustainability:2,resources:3}`.
6. `base_type`: fortress `{defence:4,community:1}` affinity `{fortified_structure:3,institutional_compound:1}`; island `{isolation:4,resources:1}` affinity `{isolated_landmass:3}`; remote_settlement `{sustainability:3,community:3}` affinity `{remote_settlement:3}`; underground `{defence:2,isolation:2,complexity:3}` affinity `{subterranean:3,industrial_site:1}`.
7. `technical_complexity`: low `{sustainability:2,complexity:-2,community:1}`; medium `{resources:2,complexity:1}`; high `{complexity:4,defence:1,resources:1}`; expert `{complexity:5,defence:2}`.
8. `travel`: country `{access:3,community:1}`; continent `{access:1,resources:1}`; world `{isolation:2,resources:1}`; distance `{isolation:3,sustainability:1,access:-1}`.
9. `climate_tradeoff`: temperate `{sustainability:3,resources:2}`; cold `{isolation:2,defence:1}`; hot `{resources:3,isolation:1}`; any `{defence:2,complexity:1}`.
10. `biggest_tradeoff`: strong_walls `{defence:5}`; better_resources `{resources:4,sustainability:1}`; greater_isolation `{isolation:5}`; easier_access `{access:4,community:1}`.
11. `long_term_goal`: month `{defence:3,resources:2}`; year `{resources:3,sustainability:2}`; permanent `{sustainability:4,community:3}`; rebuild `{community:4,sustainability:3,complexity:1}`.
12. `final_priority`: defence `{defence:5}`; isolation `{isolation:5}`; sustainability `{sustainability:5,resources:1}`; flexibility `{access:2,resources:2,community:1}`.

## Aggregation, normalization and classification

Weights are summed per axis and affinities per type. Normalization is `((raw-min)/(max-min))*10` where `min = min(axisTotals,0)` and `max = max(axisTotals,1)`, clamped 0-10. Classification sorts normalized axes; if top-second < 1.15 the profile is `resilient-generalist`. Otherwise top axis maps defence→Fortress Commander, isolation→Island Isolationist, community/sustainability→Community Builder, resources→Resource Planner, complexity→Systems Survivor, default→Resilient Generalist.

Profiles are six hard-coded objects: Fortress Commander, Island Isolationist, Community Builder, Resource Planner, Systems Survivor, Resilient Generalist, each with id/name/icon/strategy/description/strength/compromise/dimensions/dimensionWeights.

## Base vectors and compatibility

Type trait vectors are hard-coded for nine types. Base vector blends stored scores and type traits: defence `category.defensibility*.75 + type.defence*.25`; isolation `category.isolation*.75 + type.isolation*.25`; sustainability `category.sustainability*.7 + type.sustainability*.3`; resources `resourceSecurity*.6 + sustainability*.25 + type.resources*.15`; community `populationCapacity*.55 + sustainability*.25 + type.community*.2`; complexity `maintenanceBurden*.55 + type.complexity*.45`; access `exposure*.6 + type.access*.4`.

Compatibility: for each axis priority=user normalized; weight=`0.7+(priority/10)*1.8`; add `abs(priority-baseAxis)*weight`; compatibility=`round(clamp(100 - (weightedDistance/weightTotal)*9.2 + typeAffinity[base.type]*1.8 + overall*.45, 1, 99))`.

Recommendations exclude `status:hidden`, sort by match desc, overall desc, name asc. Alternatives are first three unique non-primary results. Previous result storage is versioned localStorage in `js/quiz.js`; reconstruction reruns the engine against current data, so dataset changes can alter displayed results. Sharing uses Web Share API with clipboard fallback.

## Deterministic journeys

* Fortress journey answers: solo, lockdown, nearby, walls, farms, fortress, low, country, temperate, strong_walls, month, defence. Raw `{defence:25,isolation:2,sustainability:9,resources:5,community:4,complexity:-2,access:7}`; normalized defence 10/access 3.33/sustainability 4.07; profile Fortress Commander; top `himeji-castle` 93%; alternatives `elmina-castle` 93, `fort-copacabana` 93, `fort-denison` 93.
* Island journey: small, vanish, regional, distance, freshwater, island, medium, continent, cold, better_resources, year, isolation. Raw isolation 23/resources 17; normalized isolation 10/resources 7.39; profile Island Isolationist; top `heligoland` 83%; alternatives `kodiak-island` 82, `galapagos-islands` 82, `faroe-islands` 81.
* Community/resource journey: community, supplies, extreme, visibility, stockpile, remote_settlement, high, world, hot, greater_isolation, permanent, sustainability. Raw sustainability 15/resources 14/isolation 13; normalized sustainability 10/resources 9.33/isolation 8.67; profile Resilient Generalist due close top axes; top `isle-of-eigg-village` 92%; alternatives `siwa-oasis` 89, `cusco-highlands-village` 88, `shirakawa-go` 87.
