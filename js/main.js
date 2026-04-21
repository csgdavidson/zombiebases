const DATA_URL = './data/bases-index.json';

const LABELS = {
  type: {
    fortified_structure: 'Fortified Structure',
    isolated_landmass: 'Isolated Landmass',
    elevated_stronghold: 'Elevated Stronghold',
    subterranean: 'Subterranean',
    institutional_compound: 'Institutional Compound',
    industrial_site: 'Industrial Site',
    remote_settlement: 'Remote Settlement',
    transit_hub: 'Transit Hub',
    landmark_structure: 'Landmark Structure'
  },
  region: {
    uk_ireland: 'UK & Ireland',
    western_europe: 'Western Europe',
    eastern_europe: 'Eastern & Northern Europe',
    north_america: 'North America',
    south_america: 'South America',
    africa: 'Africa',
    middle_east: 'Middle East',
    south_asia: 'South Asia',
    east_asia: 'East Asia',
    southeast_asia: 'Southeast Asia',
    oceania: 'Oceania',
    polar_extreme: 'Polar & Extreme'
  }
};

const state = {
  bases: [],
  visibleBases: [],
  filteredBases: [],
  featuredBases: [],
  view: 'list'
};

const elements = {
  regionFilter: document.getElementById('region-filter'),
  typeFilter: document.getElementById('type-filter'),
  resetFilters: document.getElementById('reset-filters'),
  list: document.getElementById('bases-list'),
  resultCount: document.getElementById('result-count'),
  status: document.getElementById('status'),
  listView: document.getElementById('list-view'),
  mapView: document.getElementById('map-view'),
  mapStatus: document.getElementById('map-status'),
  mapElement: document.getElementById('bases-map'),
  listViewButton: document.getElementById('view-list'),
  mapViewButton: document.getElementById('view-map'),
  featuredSection: document.getElementById('featured-section'),
  featuredList: document.getElementById('featured-bases-list')
};

const baseMap = (window.createBaseMap && elements.mapElement && elements.mapStatus)
  ? window.createBaseMap({
    mapElement: elements.mapElement,
    statusElement: elements.mapStatus,
    labelFor,
    createBaseUrl
  })
  : null;

function toTitleCaseSlug(value) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function labelFor(kind, value) {
  return LABELS[kind][value] ?? toTitleCaseSlug(value);
}

function uniqueValues(items, key) {
  return [...new Set(items.map((item) => item[key]))].sort();
}

function hasStatus(base) {
  return typeof base.status === 'string' && base.status.trim().length > 0;
}

function normalizeStatus(base) {
  return hasStatus(base) ? base.status.trim().toLowerCase() : '';
}

function isFeatured(base) {
  return normalizeStatus(base) === 'featured';
}

function shouldDisplayBase(base) {
  return normalizeStatus(base) !== 'hidden';
}

function statusLabel(base) {
  const value = normalizeStatus(base);
  return value ? toTitleCaseSlug(value) : '';
}

function populateFilter(selectElement, values, kind) {
  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = labelFor(kind, value);
    selectElement.appendChild(option);
  });
}

function matchesFilters(base, region, type) {
  const matchesRegion = !region || base.region === region;
  const matchesType = !type || base.type === type;
  return matchesRegion && matchesType;
}

function readStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    view: params.get('view') === 'map' ? 'map' : 'list',
    region: params.get('region') ?? '',
    type: params.get('type') ?? ''
  };
}

function updateUrlFromState() {
  const params = new URLSearchParams();

  if (state.view === 'map') {
    params.set('view', 'map');
  }

  if (elements.regionFilter.value) {
    params.set('region', elements.regionFilter.value);
  }

  if (elements.typeFilter.value) {
    params.set('type', elements.typeFilter.value);
  }

  const query = params.toString();
  const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.replaceState({}, '', nextUrl);
}

function updateResultCount(count) {
  const baseLabel = count === 1 ? 'base' : 'bases';
  elements.resultCount.textContent = `${count} ${baseLabel} found`;
}

function createBaseUrl(slug) {
  const params = new URLSearchParams();
  params.set('slug', slug);

  if (state.view === 'map') {
    params.set('view', 'map');
  }

  if (elements.regionFilter.value) {
    params.set('region', elements.regionFilter.value);
  }

  if (elements.typeFilter.value) {
    params.set('type', elements.typeFilter.value);
  }

  return `./base.html?${params.toString()}`;
}

function renderBaseList(items) {
  elements.list.innerHTML = '';

  if (!items.length) {
    const emptyMessage = document.createElement('li');
    emptyMessage.className = 'empty-state';
    emptyMessage.textContent = 'No zombie bases match your filters. Try resetting filters or choosing different values.';
    elements.list.appendChild(emptyMessage);
    return;
  }

  items.forEach((base) => {
    const listItem = document.createElement('li');
    listItem.className = 'base-card';

    const header = document.createElement('div');
    header.className = 'base-card-header';

    const link = document.createElement('a');
    link.className = 'base-card-title';
    link.href = createBaseUrl(base.slug);
    link.textContent = base.name;

    header.appendChild(link);

    if (isFeatured(base)) {
      const badge = document.createElement('span');
      badge.className = `status-badge status-${normalizeStatus(base)}`;
      badge.textContent = statusLabel(base);
      header.appendChild(badge);
    }

    const meta = document.createElement('p');
    meta.className = 'base-meta';
    meta.textContent = `${labelFor('type', base.type)} • ${labelFor('region', base.region)}`;

    listItem.append(header, meta);

    if (base.country) {
      const country = document.createElement('p');
      country.className = 'base-country';
      country.textContent = base.country;
      listItem.appendChild(country);
    }

    if (base.summary) {
      const summary = document.createElement('p');
      summary.className = 'base-summary';
      summary.textContent = base.summary;
      listItem.appendChild(summary);
    }

    elements.list.appendChild(listItem);
  });
}

function renderFeaturedBases(items) {
  if (!elements.featuredSection || !elements.featuredList) {
    return;
  }

  elements.featuredList.innerHTML = '';

  if (!items.length) {
    elements.featuredSection.hidden = true;
    return;
  }

  items.slice(0, 3).forEach((base) => {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.className = 'featured-link';
    link.href = createBaseUrl(base.slug);
    link.textContent = base.name;

    const meta = document.createElement('p');
    meta.className = 'base-meta';
    meta.textContent = `${labelFor('type', base.type)} • ${labelFor('region', base.region)}`;

    listItem.append(link, meta);
    elements.featuredList.appendChild(listItem);
  });

  elements.featuredSection.hidden = false;
}

function renderCurrentView() {
  const isMapView = state.view === 'map';
  elements.listView.hidden = isMapView;
  elements.mapView.hidden = !isMapView;
  elements.listViewButton.setAttribute('aria-pressed', String(!isMapView));
  elements.mapViewButton.setAttribute('aria-pressed', String(isMapView));

  if (isMapView) {
    if (baseMap) {
      baseMap.render(state.filteredBases);
    } else {
      elements.mapStatus.textContent = 'Map is unavailable right now. Please use list view.';
    }
  }
}

function applyFilters() {
  const region = elements.regionFilter.value;
  const type = elements.typeFilter.value;

  state.filteredBases = state.visibleBases.filter((base) => matchesFilters(base, region, type));
  updateResultCount(state.filteredBases.length);
  renderBaseList(state.filteredBases);
  renderCurrentView();
  updateUrlFromState();
}

function setView(nextView) {
  state.view = nextView === 'map' ? 'map' : 'list';
  renderCurrentView();
  updateUrlFromState();
}

function resetFilters() {
  elements.regionFilter.value = '';
  elements.typeFilter.value = '';
  applyFilters();
}

function setInitialControls() {
  const { view, region, type } = readStateFromUrl();

  state.view = view;

  const isValidRegion = !region || LABELS.region[region];
  const isValidType = !type || LABELS.type[type];

  elements.regionFilter.value = isValidRegion ? region : '';
  elements.typeFilter.value = isValidType ? type : '';
}

async function loadBases() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to load bases data (${response.status})`);
    }

    state.bases = await response.json();
    state.visibleBases = state.bases.filter(shouldDisplayBase);
    state.featuredBases = state.visibleBases.filter(isFeatured);

    populateFilter(elements.regionFilter, uniqueValues(state.visibleBases, 'region'), 'region');
    populateFilter(elements.typeFilter, uniqueValues(state.visibleBases, 'type'), 'type');

    setInitialControls();
    renderFeaturedBases(state.featuredBases);
    applyFilters();
    elements.status.textContent = '';
  } catch (error) {
    elements.status.textContent = 'Could not load base data. Please try again later.';
    console.error(error);
  }
}

if (elements.regionFilter && elements.typeFilter && elements.list && elements.listViewButton && elements.mapViewButton) {
  elements.regionFilter.addEventListener('change', applyFilters);
  elements.typeFilter.addEventListener('change', applyFilters);
  elements.resetFilters?.addEventListener('click', resetFilters);
  elements.listViewButton.addEventListener('click', () => setView('list'));
  elements.mapViewButton.addEventListener('click', () => setView('map'));
  loadBases();
}
