# 13 Assets and Images

## Image inventory

Primary base images live in `images/bases/` as PNG files. The filename convention is `<base-slug>.png`, plus `placeholder.png`. Several PNG files also exist at repository root, apparently as legacy or duplicate assets.

## Runtime image resolution

Image helpers usually prefer an explicit `base.image` value. If absent, they derive `/images/bases/${slug}.png`. Fallbacks use `/images/bases/placeholder.png`.

## Generated thumbnails

`scripts/generate-card-thumbnails.py` copies every source PNG from `images/bases/` to `images/generated/card-thumbs/`. The script does not resize or transform images; it creates build-time copies in a generated directory that is not currently committed.

## Image consumers

* Homepage and rankings cards.
* Base detail hero and card images.
* Compare hero cards and selector thumbnails.
* Quiz result and alternatives.
* Social metadata default image and per-base image URLs.

## External map imagery

Map view uses OpenStreetMap tiles through Leaflet. No static per-base map images are present in V1.

## Alt text strategy

Most templates use the base name as image alt text. There is no dedicated per-asset alt text, dimensions, attribution or role metadata model.

## Risks and assumptions

* Slug filename coupling is pervasive.
* PNG is assumed by most fallback URL construction.
* There is no responsive image set, width/height metadata or modern format generation in V1.
* Root-level duplicate PNGs can confuse asset inventory and migration if not reconciled.
