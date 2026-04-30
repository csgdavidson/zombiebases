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

const SORT_OPTIONS = {
  highest_score: 'Highest score',
  lowest_score: 'Lowest score',
  name_az: 'Name A-Z',
  region: 'Region',
  type: 'Type'
};

function summarizeActiveFilters(region, type) {
  const parts = [];

  if (region) {
    parts.push(labelFor('region', region));
  }

  if (type) {
    parts.push(labelFor('type', type));
  }

  return parts;
}

function updateViewToggleLinks() {
  const listParams = new URLSearchParams();
  const mapParams = new URLSearchParams();

  const region = elements.regionFilter.value;
  const type = elements.typeFilter.value;
  const sort = state.sort !== 'highest_score' ? state.sort : '';

  if (region) {
    listParams.set('region', region);
    mapParams.set('region', region);
  }

  if (type) {
    listParams.set('type', type);
    mapParams.set('type', type);
  }

  if (state.search) {
    listParams.set('q', state.search);
    mapParams.set('q', state.search);
  }

  if (sort) {
    listParams.set('sort', sort);
    mapParams.set('sort', sort);
  }

  mapParams.set('view', 'map');

  const listQuery = listParams.toString();
  const mapQuery = mapParams.toString();

  elements.listViewButton.href = listQuery ? `./index.html?${listQuery}` : './index.html';
  elements.mapViewButton.href = mapQuery ? `./index.html?${mapQuery}` : './index.html?view=map';
}

function updateHomepageMetadata() {
  if (!window.seo) {
    return;
  }

  const region = elements.regionFilter.value;
  const type = elements.typeFilter.value;
  const filters = summarizeActiveFilters(region, type);
  const filterLabel = filters.length ? `${filters.join(' · ')} ` : '';
  const isMapView = state.view === 'map';

  const titlePrefix = isMapView ? 'Zombie Bases Map' : 'Zombie Bases';
  const title = `${titlePrefix}${filterLabel ? ` | ${filterLabel.trim()}` : ''} | Survival Base Directory`;

  const viewLabel = isMapView ? 'map' : 'list';
  const description = filters.length
    ? `Browse ${viewLabel} view zombie survival bases for ${filters.join(' and ')}.`
    : `Explore zombie survival base locations by region and type in ${viewLabel} and map views.`;

  window.seo.applyPageMetadata({
    title,
    description,
    canonicalPath: '/',
    canonicalParams: null
  });
}

const state = {
  bases: [],
  visibleBases: [],
  filteredBases: [],
  featuredBases: [],
  view: 'list',
  sort: 'highest_score',
  search: ''
};

const elements = {
  searchInput: document.getElementById('search-input'),
  regionFilter: document.getElementById('region-filter'),
  typeFilter: document.getElementById('type-filter'),
  sortSelect: document.getElementById('sort-select'),
  sortControl: document.getElementById('sort-select')?.closest('label') ?? null,
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
  featuredList: document.getElementById('featured-bases-list'),
  activeFilters: document.getElementById('active-filters')
};

const baseMap = (window.createBaseMap && elements.mapElement && elements.mapStatus)
  ? window.createBaseMap({
    mapElement: elements.mapElement,
    statusElement: elements.mapStatus,
    labelFor,
    createBaseUrl,
    onReset: resetFilters
  })
  : null;

const slugHelper = window.baseSlugHelper;

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

function isValidScoreValue(value) {
  return Number.isFinite(value);
}

function computeOverallScore(base) {
  if (isValidScoreValue(base?.scores?.overall)) {
    return base.scores.overall;
  }
  return null;
}

function formatOverallScore(base) {
  const score = computeOverallScore(base);
  return score === null ? '' : (slugHelper?.formatScore?.(score) || `${score.toFixed(1)}/10`);
}

function scoreToneClass(value) {
  if (!isValidScoreValue(value)) {
    return '';
  }
  if (value >= 8) {
    return 'score-high';
  }
  if (value >= 5) {
    return 'score-medium';
  }
  return 'score-low';
}

function compareByName(a, b) {
  return a.name.localeCompare(b.name);
}

function compareByOverallScore(a, b, descending = true) {
  const aScore = computeOverallScore(a);
  const bScore = computeOverallScore(b);

  if (aScore === null && bScore === null) {
    return compareByName(a, b);
  }

  if (aScore === null) {
    return 1;
  }

  if (bScore === null) {
    return -1;
  }

  const diff = descending ? (bScore - aScore) : (aScore - bScore);
  return diff || compareByName(a, b);
}

function sortBases(items) {
  const sorted = [...items];

  sorted.sort((a, b) => {
    switch (state.sort) {
      case 'lowest_score':
        return compareByOverallScore(a, b, false);
      case 'name_az':
        return compareByName(a, b);
      case 'region': {
        const regionDiff = labelFor('region', a.region).localeCompare(labelFor('region', b.region));
        return regionDiff || compareByName(a, b);
      }
      case 'type': {
        const typeDiff = labelFor('type', a.type).localeCompare(labelFor('type', b.type));
        return typeDiff || compareByName(a, b);
      }
      case 'highest_score':
      default:
        return compareByOverallScore(a, b, true);
    }
  });

  return sorted;
}

function populateFilter(selectElement, values, kind) {
  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = labelFor(kind, value);
    selectElement.appendChild(option);
  });
}

function populateSortOptions(selectElement) {
  if (!selectElement) {
    return;
  }

  Object.entries(SORT_OPTIONS).forEach(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    selectElement.appendChild(option);
  });
}

function matchesSearch(base, query) {
  if (!query) {
    return true;
  }

  const normalizedQuery = query.toLowerCase();
  const fields = [
    base.name,
    labelFor('region', base.region),
    base.country,
    labelFor('type', base.type)
  ];

  return fields.some((value) => typeof value === 'string' && value.toLowerCase().includes(normalizedQuery));
}

function matchesFilters(base, region, type, query) {
  const matchesRegion = !region || base.region === region;
  const matchesType = !type || base.type === type;
  const matchesQuery = matchesSearch(base, query);
  return matchesRegion && matchesType && matchesQuery;
}

function readStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const sort = params.get('sort') ?? 'highest_score';

  return {
    view: params.get('view') === 'map' ? 'map' : 'list',
    region: params.get('region') ?? '',
    type: params.get('type') ?? '',
    q: params.get('q') ?? '',
    sort: SORT_OPTIONS[sort] ? sort : 'highest_score'
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

  if (state.search) {
    params.set('q', state.search);
  }

  if (state.sort !== 'highest_score') {
    params.set('sort', state.sort);
  }

  const query = params.toString();
  const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.replaceState({}, '', nextUrl);
  updateViewToggleLinks();
}

function updateResultCount(count) {
  const baseLabel = count === 1 ? 'base' : 'bases';
  const hasActiveFilters = Boolean(elements.regionFilter.value || elements.typeFilter.value || state.search || state.sort !== 'highest_score');
  elements.resultCount.textContent = hasActiveFilters
    ? `${count} ${baseLabel} found for current filters`
    : `${count} ${baseLabel} found`;
}

function updateActiveFilters() {
  if (!elements.activeFilters) {
    return;
  }

  const chips = [];
  if (elements.regionFilter.value) {
    chips.push(`Region: ${labelFor('region', elements.regionFilter.value)}`);
  }
  if (elements.typeFilter.value) {
    chips.push(`Type: ${labelFor('type', elements.typeFilter.value)}`);
  }
  if (state.sort !== 'highest_score') {
    chips.push(`Sort: ${SORT_OPTIONS[state.sort]}`);
  }
  if (state.search) {
    chips.push(`Search: "${state.search}"`);
  }

  if (!chips.length) {
    elements.activeFilters.hidden = true;
    elements.activeFilters.textContent = '';
    return;
  }

  elements.activeFilters.innerHTML = chips
    .map((chip) => `<span class="filter-chip">${chip}</span>`)
    .join('');
  elements.activeFilters.hidden = false;
}

function preferredSlugFor(baseOrSlug) {
  if (slugHelper?.getPreferredSlug) {
    return slugHelper.getPreferredSlug(baseOrSlug);
  }

  if (typeof baseOrSlug === 'string') {
    return baseOrSlug;
  }

  return baseOrSlug?.slug ?? '';
}

function createBaseUrl(baseOrSlug) {
  const slug = preferredSlugFor(baseOrSlug);
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

  if (state.search) {
    params.set('q', state.search);
  }

  if (state.sort !== 'highest_score') {
    params.set('sort', state.sort);
  }

  const query = params.toString();
  const cleanUrl = slugHelper?.getBaseUrl ? slugHelper.getBaseUrl(slug) : `/${encodeURIComponent(slug)}`;
  return query ? `${cleanUrl}?${query}` : cleanUrl;
}

function createBaseThumbnail(slug, name) {
  const image = document.createElement('img');
  image.className = 'base-card-thumb';
  image.src = `/images/bases/${slug}.png`;
  image.alt = `${name} thumbnail`;
  image.width = 112;
  image.height = 63;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.addEventListener('error', () => {
    image.src = '/images/bases/placeholder.png';
  }, { once: true });
  return image;
}

function appendCardScore(container, base) {
  const scoreValue = computeOverallScore(base);
  const scoreText = formatOverallScore(base);
  if (!scoreText) {
    return;
  }

  const score = document.createElement('span');
  score.className = `base-score-pill ${scoreToneClass(scoreValue)}`.trim();
  score.textContent = scoreText.replace('/10', '');
  container.appendChild(score);
}

function appendCardBadges(container, base) {
  const candidateBadges = slugHelper?.getBaseBadges
    ? slugHelper.getBaseBadges(base, 2)
    : [];

  if (!candidateBadges.length) {
    return;
  }

  const row = document.createElement('p');
  row.className = 'card-badge-row';

  candidateBadges.forEach((badgeLabel) => {
    const badge = document.createElement('span');
    badge.className = 'badge badge-trait';
    badge.textContent = badgeLabel;
    row.appendChild(badge);
  });

  container.appendChild(row);
}

function getCardSummary(base) {
  if (typeof base?.description?.summary === 'string' && base.description.summary.trim()) {
    return base.description.summary.trim();
  }
  if (typeof base?.summary === 'string' && base.summary.trim()) {
    return base.summary.trim();
  }
  return '';
}

function createEmptyState() {
  const emptyState = document.createElement('li');
  emptyState.className = 'empty-state';

  const message = document.createElement('p');
  message.textContent = 'No bases match your filters';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'reset-filters empty-reset';
  button.textContent = 'Reset filters';
  button.addEventListener('click', resetFilters);

  emptyState.append(message, button);
  return emptyState;
}

function renderBaseList(items) {
  elements.list.innerHTML = '';

  if (!items.length) {
    elements.list.appendChild(createEmptyState());
    return;
  }

  items.forEach((base) => {
    const listItem = document.createElement('li');
    listItem.className = 'base-card';

    const link = document.createElement('a');
    link.className = 'base-card-link';
    link.href = createBaseUrl(base);
    link.appendChild(createBaseThumbnail(preferredSlugFor(base), base.name));

    const content = document.createElement('div');
    content.className = 'base-card-content';

    const header = document.createElement('div');
    header.className = 'base-card-header';

    const title = document.createElement('span');
    title.className = 'base-card-title';
    title.textContent = base.name;

    header.appendChild(title);
    appendCardScore(header, base);

    const meta = document.createElement('p');
    meta.className = 'base-meta';
    const location = base.country
      ? `${base.country}, ${labelFor('region', base.region)}`
      : labelFor('region', base.region);
    meta.textContent = `${location} • ${labelFor('type', base.type)}`;

    content.append(header, meta);

    appendCardBadges(content, base);

    const summaryText = getCardSummary(base);
    if (summaryText) {
      const summary = document.createElement('p');
      summary.className = 'base-summary';
      summary.textContent = summaryText;
      content.appendChild(summary);
    }

    link.appendChild(content);
    listItem.appendChild(link);
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

  sortBases(items).slice(0, 3).forEach((base) => {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.className = 'featured-link';
    link.href = createBaseUrl(base);
    link.textContent = base.name;

    const meta = document.createElement('p');
    meta.className = 'base-meta';
    meta.textContent = `${labelFor('type', base.type)} • ${labelFor('region', base.region)}`;

    listItem.append(link, meta);

    appendCardScore(listItem, base);

    const summaryText = getCardSummary(base);
    if (summaryText) {
      const summary = document.createElement('p');
      summary.className = 'base-summary';
      summary.textContent = summaryText;
      listItem.appendChild(summary);
    }

    elements.featuredList.appendChild(listItem);
  });

  elements.featuredSection.hidden = false;
}

function renderCurrentView() {
  const isMapView = state.view === 'map';
  elements.listView.hidden = isMapView;
  elements.mapView.hidden = !isMapView;
  if (elements.sortControl) {
    elements.sortControl.hidden = isMapView;
  }
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
  state.search = elements.searchInput.value.trim();

  const filtered = state.visibleBases.filter((base) => matchesFilters(base, region, type, state.search));
  state.filteredBases = sortBases(filtered);

  updateResultCount(state.filteredBases.length);
  updateActiveFilters();
  renderBaseList(state.filteredBases);
  renderFeaturedBases(state.featuredBases);
  renderCurrentView();
  updateUrlFromState();
  updateHomepageMetadata();
}

function setView(nextView) {
  state.view = nextView === 'map' ? 'map' : 'list';
  renderCurrentView();
  updateUrlFromState();
  updateHomepageMetadata();
}

function resetFilters() {
  elements.searchInput.value = '';
  elements.regionFilter.value = '';
  elements.typeFilter.value = '';
  state.sort = 'highest_score';
  elements.sortSelect.value = state.sort;
  applyFilters();
}

function setInitialControls() {
  const { view, region, type, sort, q } = readStateFromUrl();

  state.view = view;
  state.sort = sort;

  const isValidRegion = !region || LABELS.region[region];
  const isValidType = !type || LABELS.type[type];

  elements.regionFilter.value = isValidRegion ? region : '';
  elements.typeFilter.value = isValidType ? type : '';
  elements.searchInput.value = q;

  if (elements.sortSelect) {
    elements.sortSelect.value = state.sort;
  }
}

async function loadBases() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to load bases data (${response.status})`);
    }

    state.bases = await response.json();
    state.bases.forEach((base) => {
      const preferredSlug = preferredSlugFor(base);
      if (preferredSlug && !base.slug) {
        base.slug = preferredSlug;
      }
    });
    state.visibleBases = state.bases.filter(shouldDisplayBase);
    state.featuredBases = state.visibleBases.filter(isFeatured);

    populateFilter(elements.regionFilter, uniqueValues(state.visibleBases, 'region'), 'region');
    populateFilter(elements.typeFilter, uniqueValues(state.visibleBases, 'type'), 'type');
    populateSortOptions(elements.sortSelect);

    setInitialControls();
    applyFilters();
    elements.status.textContent = '';
  } catch (error) {
    elements.status.textContent = 'Could not load base data. Please try again later.';
    console.error(error);
  }
}

if (elements.searchInput && elements.regionFilter && elements.typeFilter && elements.list && elements.listViewButton && elements.mapViewButton) {
  elements.searchInput.addEventListener('input', applyFilters);
  elements.regionFilter.addEventListener('change', applyFilters);
  elements.typeFilter.addEventListener('change', applyFilters);
  elements.sortSelect?.addEventListener('change', () => {
    state.sort = elements.sortSelect.value;
    applyFilters();
  });
  elements.resetFilters?.addEventListener('click', resetFilters);
  elements.listViewButton.addEventListener('click', (event) => {
    event.preventDefault();
    setView('list');
  });
  elements.mapViewButton.addEventListener('click', (event) => {
    event.preventDefault();
    setView('map');
  });
  loadBases();
}
