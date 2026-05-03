const DISCOVERY_URL = './data/discovery.json';

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

const slugHelper = window.baseSlugHelper;

const elements = {
  title: document.getElementById('scenario-title'),
  description: document.getElementById('scenario-description'),
  status: document.getElementById('scenario-status'),
  list: document.getElementById('scenario-list'),
  empty: document.getElementById('scenario-empty')
};

function toTitleCaseSlug(value) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function labelFor(kind, value) {
  return LABELS[kind]?.[value] ?? toTitleCaseSlug(value);
}

function createBaseUrl(slug) {
  return slugHelper?.getBaseUrl ? slugHelper.getBaseUrl(slug) : `/${encodeURIComponent(slug)}`;
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

function updateScenarioParam(value) {
  const params = new URLSearchParams(window.location.search);
  params.set('scenario', value);
  const query = params.toString();
  const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.replaceState({}, '', url);
}

function renderList(entries) {
  elements.list.innerHTML = '';
  elements.empty.hidden = entries.length > 0;

  entries.forEach((entry) => {
    const item = document.createElement('li');
    item.className = 'ranking-row';
    item.appendChild(createBaseThumbnail(entry.slug, entry.name));

    const content = document.createElement('div');
    content.className = 'ranking-row-content';

    const heading = document.createElement('p');
    heading.className = 'ranking-row-heading';

    const rank = document.createElement('span');
    rank.className = 'ranking-chip';
    rank.textContent = `#${entry.rank}`;

    const nameLink = document.createElement('a');
    nameLink.href = createBaseUrl(entry.slug);
    nameLink.textContent = entry.name;

    const score = document.createElement('span');
    score.className = 'ranking-score';
    score.textContent = `${entry.overall.toFixed(1)}/10`;

    heading.append(rank, nameLink, score);

    const meta = document.createElement('p');
    meta.className = 'base-meta';
    meta.textContent = `${labelFor('region', entry.region)} • ${labelFor('type', entry.type)}`;

    const reason = document.createElement('p');
    reason.className = 'base-summary';
    reason.textContent = entry.reason || 'Scenario fit details coming soon.';

    content.append(heading, meta, reason);
    item.appendChild(content);
    elements.list.appendChild(item);
  });
}

function applyScenarioMetadata(scenarioName) {
  if (!window.seo) {
    return;
  }

  const normalizedScenario = scenarioName || 'Scenario';
  const normalizedTitle = `Best ${normalizedScenario} Survival Bases | Zombie Bases`;
  const normalizedDescription = `Explore the best bases for ${normalizedScenario} survival. See which locations perform strongest across short-term, long-term, and high-risk scenarios.`;

  window.seo.applyPageMetadata({
    title: normalizedTitle,
    description: normalizedDescription,
    canonicalPath: '/scenarios.html'
  });

  window.seo.applySocialMetadata({
    title: normalizedTitle,
    description: normalizedDescription,
    url: `${window.seo.PRODUCTION_ORIGIN}/scenarios.html`,
    type: 'website',
    image: window.seo.DEFAULT_IMAGE
  });
}

function updateScenarioItemListJsonLd(title, description, entries) {
  if (!window.seo) {
    return;
  }
  window.seo.setJsonLd('scenarios-itemlist', {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    description,
    itemListElement: (entries || []).map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      url: `${window.seo.PRODUCTION_ORIGIN}${createBaseUrl(entry.slug)}`
    }))
  });
}

function setScenario(discovery, scenarioId) {
  const scenario = discovery.scenarios?.[scenarioId];
  if (!scenario) {
    elements.title.textContent = 'Scenario discovery';
    elements.description.textContent = 'Choose a scenario to explore ranked bases.';
    applyScenarioMetadata('Scenario');
    renderList([]);
    updateScenarioItemListJsonLd('Scenario Discovery', 'Explore zombie survival scenarios to compare which bases perform best under different outbreak conditions.', []);
    return;
  }

  elements.title.textContent = scenario.title;
  elements.description.textContent = scenario.description;
  applyScenarioMetadata(scenario.title);
  renderList(scenario.entries || []);
  updateScenarioItemListJsonLd(scenario.title, scenario.description, scenario.entries || []);
}

function initScenario(discovery) {
  const order = discovery.scenarioOrder || Object.keys(discovery.scenarios || {});
  const available = order.filter((id) => discovery.scenarios?.[id]);

  if (!available.length) {
    elements.status.textContent = 'No scenario data available.';
    renderList([]);
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const requested = params.get('scenario');
  const active = available.includes(requested) ? requested : available[0];

  if (requested !== active) {
    updateScenarioParam(active);
  }

  setScenario(discovery, active);
  elements.status.textContent = '';
}

async function init() {
  if (!elements.list || !elements.status) {
    return;
  }

  elements.status.textContent = 'Loading scenario discovery...';

  try {
    const response = await fetch(DISCOVERY_URL);
    if (!response.ok) {
      throw new Error(`Failed to load discovery data (${response.status})`);
    }

    const discovery = await response.json();
    initScenario(discovery);
  } catch (error) {
    console.error(error);
    elements.status.textContent = 'Unable to load scenario discovery right now.';
    renderList([]);
  }
}

init();
