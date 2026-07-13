# 25 Performance and Assets Audit

Status: byte counts MEASURED by Python stat script; render/LCP risks INFERRED.

## Measured byte totals

* Root HTML files: 77,829 bytes.
* `js/*.js`: 253,665 bytes.
* `css/*.css`: 297,638 bytes.
* PNG images in root plus `images/**`: 123 files, 349,902,572 bytes.

Largest 20 PNGs: `images/bases/kargil-war-bunkers.png` 3,914,759; `predjama-castle` 3,646,939; `danum-valley-field-centre` 3,616,656; `images/bases/ajanta-caves.png` and root duplicate `ajanta-caves.png` 3,435,138 each; `naours-underground-city` 3,408,372; `cheyenne-mountain-complex` 3,384,625; `kibber-village` 3,369,904; `shirakawa-go` 3,365,770; `kimberley-big-hole-mining-complex` 3,347,131; `images/bases/elmina-castle.png` and root duplicate `elmina-castle.png` 3,290,011 each; `quiz.png` 3,249,753; `lakshadweep` 3,244,835; `hm-prison-dartmoor` 3,242,021; `eguisheim` 3,223,794; `cu-chi-tunnels` 3,221,330; `clovelly` 3,218,517; `images/bases/cheddar-gorge-caves.png` and root duplicate `cheddar-gorge-caves.png` 3,213,835 each.

## Static findings

Generated thumbnails are copies, not resized or optimized. PNG dimensions are not modeled in JSON and width/height attributes are inconsistent/absent in templates, causing possible layout shift. Likely LCP images: homepage hero/logo/card image, base detail hero image, quiz hero/result image. External requests include Leaflet CSS/JS and OpenStreetMap tiles where map view is used. Lazy-loading appears in some image templates but not as a complete image pipeline. DOM risk: homepage can render 111 cards plus map markers client-side; acceptable today, but V2 should virtualize or paginate if dataset grows. Caching depends on static hosting; no repo-controlled immutable asset hashing.
