(function () {
  const MAPBOX_STYLE = 'mapbox/dark-v11';
  const MAPBOX_IMAGE_SIZE = '1200x600@2x';
  const MAPBOX_ZOOM = 8;
  const MAPBOX_MARKER_COLOR = '1f2937';
  const MAPBOX_PUBLIC_TOKEN = 'YOUR_MAPBOX_PUBLIC_TOKEN';

  function hasCoordinate(value) {
    return Number.isFinite(value);
  }

  function getStaticMapUrl(base) {
    if (!base || !hasCoordinate(base.lat) || !hasCoordinate(base.long)) {
      return null;
    }

    const lat = base.lat;
    const lng = base.long;

    return `https://api.mapbox.com/styles/v1/${MAPBOX_STYLE}/static/pin-s+${MAPBOX_MARKER_COLOR}(${lng},${lat})/${lng},${lat},${MAPBOX_ZOOM}/${MAPBOX_IMAGE_SIZE}?access_token=${MAPBOX_PUBLIC_TOKEN}`;
  }

  window.getStaticMapUrl = getStaticMapUrl;
})();
