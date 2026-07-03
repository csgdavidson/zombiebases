(function () {
  function hasCoordinates(base) {
    return base?.lat != null && base?.long != null && Number.isFinite(base.lat) && Number.isFinite(base.long);
  }

  function createBaseMap({ mapElement, statusElement, labelFor, createBaseUrl, onReset }) {
    let map = null;
    let tileLayer = null;
    let markers = null;

    function ensureMap() {
      if (!window.L || typeof window.L.markerClusterGroup !== 'function') {
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

      markers = window.L.markerClusterGroup();
      map.addLayer(markers);
      return true;
    }

    function render(bases) {
      if (!ensureMap()) {
        return;
      }

      mapElement.hidden = false;
      markers.clearLayers();

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
        const popupContent = document.createElement('div');
        popupContent.className = 'map-popup-card';

        const title = document.createElement('strong');
        title.className = 'map-popup-title';
        title.textContent = base.name;
        popupContent.appendChild(title);

        const typeAndRegion = document.createElement('span');
        typeAndRegion.className = 'map-popup-meta';
        typeAndRegion.textContent = `${labelFor('type', base.type)} • ${labelFor('region', base.region)}`;
        popupContent.appendChild(typeAndRegion);

        if (base.country) {
          const country = document.createElement('span');
          country.className = 'map-popup-country';
          country.textContent = base.country;
          popupContent.appendChild(country);
        }

        const detailsLink = document.createElement('a');
        detailsLink.href = createBaseUrl(base.slug);
        detailsLink.className = 'map-popup-link';
        detailsLink.textContent = 'View base details';
        popupContent.appendChild(detailsLink);

        marker.bindPopup(popupContent);
        markers.addLayer(marker);
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
