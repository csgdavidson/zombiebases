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
    eastern_europe: 'Eastern Europe',
    north_america: 'North America',
    central_south_america: 'Central & South America',
    middle_east_africa: 'Middle East & Africa',
    central_south_asia: 'Central & South Asia',
    east_southeast_asia: 'East & Southeast Asia',
    oceania: 'Oceania'
  }
};

const state = {
  bases: [],
  filteredBases: []
};

const elements = {
  regionFilter: document.getElementById('region-filter'),
  typeFilter: document.getElementById('type-filter'),
  resetFilters: document.getElementById('reset-filters'),
  list: document.getElementById('bases-list'),
  resultCount: document.getElementById('result-count'),
  status: document.getElementById('status')
};

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

function readFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    region: params.get('region') ?? '',
    type: params.get('type') ?? ''
  };
}

function setFiltersFromUrl() {
  const { region, type } = readFiltersFromUrl();

  const isValidRegion = !region || LABELS.region[region];
  const isValidType = !type || LABELS.type[type];

  elements.regionFilter.value = isValidRegion ? region : '';
  elements.typeFilter.value = isValidType ? type : '';
}

function updateUrlFromFilters(region, type) {
  const params = new URLSearchParams();

  if (region) {
    params.set('region', region);
  }

  if (type) {
    params.set('type', type);
  }

  const query = params.toString();
  const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.replaceState({}, '', nextUrl);
}

function updateResultCount(count) {
  const baseLabel = count === 1 ? 'base' : 'bases';
  elements.resultCount.textContent = `${count} ${baseLabel} found`;
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

    const link = document.createElement('a');
    link.href = `./base.html?slug=${encodeURIComponent(base.slug)}`;
    link.textContent = base.name;

    const meta = document.createElement('p');
    meta.className = 'base-meta';
    meta.textContent = `${labelFor('type', base.type)} • ${labelFor('region', base.region)}`;

    listItem.append(link, meta);
    elements.list.appendChild(listItem);
  });
}

function applyFilters() {
  const region = elements.regionFilter.value;
  const type = elements.typeFilter.value;

  state.filteredBases = state.bases.filter((base) => matchesFilters(base, region, type));
  updateResultCount(state.filteredBases.length);
  renderBaseList(state.filteredBases);
  updateUrlFromFilters(region, type);
}

function resetFilters() {
  elements.regionFilter.value = '';
  elements.typeFilter.value = '';
  applyFilters();
}

async function loadBases() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to load bases data (${response.status})`);
    }

    state.bases = await response.json();

    populateFilter(elements.regionFilter, uniqueValues(state.bases, 'region'), 'region');
    populateFilter(elements.typeFilter, uniqueValues(state.bases, 'type'), 'type');

    setFiltersFromUrl();
    applyFilters();
    elements.status.textContent = '';
  } catch (error) {
    elements.status.textContent = 'Could not load base data. Please try again later.';
    console.error(error);
  }
}

if (elements.regionFilter && elements.typeFilter && elements.list) {
  elements.regionFilter.addEventListener('change', applyFilters);
  elements.typeFilter.addEventListener('change', applyFilters);
  elements.resetFilters?.addEventListener('click', resetFilters);
  loadBases();
}
