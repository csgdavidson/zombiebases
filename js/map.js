(function () {
  function hasCoordinates(base) {
    return Number.isFinite(base.lat) && Number.isFinite(base.lng);
  }

  function createBaseMap({ mapElement, statusElement, labelFor, createBaseUrl }) {
    let map = null;
    let tileLayer = null;
    let markersLayer = null;

    function ensureMap() {
      if (!window.L) {
        statusElement.textContent = 'Map failed to load. Please refresh or switch to list view.';
        mapElement.hidden = true;
        return false;
      }

      if (map) {
        return true;
      }

      map = window.L.map(mapElement, {
        worldCopyJump: true,
        minZoom: 2
      }).setView([18, 10], 2);

      tileLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors'
      });
      tileLayer.addTo(map);

      markersLayer = window.L.layerGroup().addTo(map);
      return true;
    }

    function render(bases) {
      if (!ensureMap()) {
        return;
      }

      mapElement.hidden = false;
      markersLayer.clearLayers();

      const mappableBases = bases.filter(hasCoordinates);

      if (!mappableBases.length) {
        statusElement.textContent = 'No map-ready bases match these filters yet. Try a different region/type or reset filters.';
        map.setView([18, 10], 2);
        map.invalidateSize();
        return;
      }

      statusElement.textContent = '';
      const bounds = [];

      mappableBases.forEach((base) => {
        const marker = window.L.marker([base.lat, base.lng]);
        const popupHtml = `
          <strong>${base.name}</strong><br>
          ${labelFor('type', base.type)} • ${labelFor('region', base.region)}<br>
          ${base.country ? `${base.country}<br>` : ''}
          <a href="${createBaseUrl(base.slug)}">View base details</a>
        `;

        marker.bindPopup(popupHtml);
        marker.addTo(markersLayer);
        bounds.push([base.lat, base.lng]);
      });

      if (bounds.length === 1) {
        map.setView(bounds[0], 5);
      } else {
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 5 });
      }

      map.invalidateSize();
    }

    return { render };
  }

  window.createBaseMap = createBaseMap;
})();
