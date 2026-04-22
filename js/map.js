(function () {
  function hasCoordinates(base) {
    return base?.lat != null && base?.long != null && Number.isFinite(base.lat) && Number.isFinite(base.long);
  }

  function createBaseMap({ mapElement, statusElement, labelFor, createBaseUrl, onReset }) {
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
        statusElement.innerHTML = '';
        const message = document.createElement('span');
        message.textContent = 'No bases match your filters';
        statusElement.appendChild(message);

        if (typeof onReset === 'function') {
          const resetButton = document.createElement('button');
          resetButton.type = 'button';
          resetButton.className = 'reset-filters map-reset';
          resetButton.textContent = 'Reset filters';
          resetButton.addEventListener('click', onReset);
          statusElement.appendChild(resetButton);
        }
        map.setView([18, 10], 2);
        map.invalidateSize();
        return;
      }

      statusElement.innerHTML = '';
      const bounds = [];

      mappableBases.forEach((base) => {
        const marker = window.L.marker([base.lat, base.long]);
        const popupHtml = `
          <strong>${base.name}</strong><br>
          ${labelFor('type', base.type)} • ${labelFor('region', base.region)}<br>
          ${base.country ? `${base.country}<br>` : ''}
          <a href="${createBaseUrl(base.slug)}">View base details</a>
        `;

        marker.bindPopup(popupHtml);
        marker.addTo(markersLayer);
        bounds.push([base.lat, base.long]);
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
