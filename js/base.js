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

const elements = {
  status: document.getElementById('detail-status'),
  detail: document.getElementById('base-detail'),
  notFound: document.getElementById('not-found'),
  name: document.getElementById('base-name'),
  meta: document.getElementById('base-meta')
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

if (elements.status && elements.detail && elements.notFound && elements.name && elements.meta) {
  loadBase();
}
