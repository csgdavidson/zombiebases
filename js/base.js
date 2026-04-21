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

const elements = {
  status: document.getElementById('detail-status'),
  detail: document.getElementById('base-detail'),
  notFound: document.getElementById('not-found'),
  name: document.getElementById('base-name'),
  meta: document.getElementById('base-meta'),
  backLink: document.getElementById('back-link')
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

function buildBackLink(params) {
  const query = new URLSearchParams();
  const view = params.get('view') === 'map' ? 'map' : 'list';

  if (view === 'map') {
    query.set('view', 'map');
  }

  const region = params.get('region') ?? '';
  const type = params.get('type') ?? '';

  if (region) {
    query.set('region', region);
  }

  if (type) {
    query.set('type', type);
  }

  const queryString = query.toString();
  const href = queryString ? `./index.html?${queryString}` : './index.html';
  const text = view === 'map' ? '← Back to Map' : '← Back to List';

  return { href, text };
}

function setBackLink(params) {
  const { href, text } = buildBackLink(params);
  elements.backLink.href = href;
  elements.backLink.textContent = text;
}

function showNotFound() {
  elements.status.textContent = '';
  elements.detail.hidden = true;
  elements.notFound.hidden = false;
}

function showBase(base) {
  elements.name.textContent = base.name;
  elements.meta.textContent = `${labelFor('type', base.type)} • ${labelFor('region', base.region)}`;
  elements.status.textContent = '';
  elements.notFound.hidden = true;
  elements.detail.hidden = false;
}

async function loadBase() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  setBackLink(params);

  if (!slug) {
    showNotFound();
    return;
  }

  elements.status.textContent = 'Loading base details...';

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to load bases data (${response.status})`);
    }

    const bases = await response.json();
    const matchedBase = bases.find((base) => base.slug === slug);

    if (!matchedBase) {
      showNotFound();
      return;
    }

    showBase(matchedBase);
  } catch (error) {
    console.error(error);
    showNotFound();
  }
}

if (elements.status && elements.detail && elements.notFound && elements.name && elements.meta && elements.backLink) {
  loadBase();
}
