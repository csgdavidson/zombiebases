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
  summaryLead: document.getElementById('base-summary-lead'),
  meta: document.getElementById('base-meta'),
  metaRow: document.getElementById('base-meta-row'),
  backLink: document.getElementById('back-link'),
  heroSection: document.getElementById('hero-section'),
  heroImage: document.getElementById('base-hero-image'),
  summarySection: document.getElementById('summary-section'),
  summary: document.getElementById('base-summary'),
  descriptionSection: document.getElementById('description-section'),
  description: document.getElementById('base-description'),
  scoreSection: document.getElementById('score-section'),
  score: document.getElementById('base-score'),
  relatedSection: document.getElementById('related-section'),
  relatedList: document.getElementById('related-bases-list')
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

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function firstAvailableValue(base, keys) {
  const matchedKey = keys.find((key) => base[key] !== undefined && base[key] !== null);
  return matchedKey ? base[matchedKey] : null;
}

function getDescription(base) {
  const value = firstAvailableValue(base, ['description', 'details', 'long_description']);
  return isNonEmptyString(value) ? value : '';
}

function getSummary(base) {
  const value = firstAvailableValue(base, ['summary', 'short_description']);
  return isNonEmptyString(value) ? value : '';
}

function getHeroImage(base) {
  const value = firstAvailableValue(base, ['hero_image', 'heroImage', 'image', 'image_url']);
  return isNonEmptyString(value) ? value : '';
}

function getScore(base) {
  return firstAvailableValue(base, ['score', 'scores']);
}

function formatScore(score) {
  if (typeof score === 'number') {
    return `${score}/10`;
  }

  if (isNonEmptyString(score)) {
    return score;
  }

  if (score && typeof score === 'object') {
    const entries = Object.entries(score).filter(([, value]) => typeof value === 'number' || isNonEmptyString(value));
    if (!entries.length) {
      return '';
    }

    return entries
      .map(([key, value]) => `${toTitleCaseSlug(key)}: ${value}`)
      .join(' • ');
  }

  return '';
}

function normalizeStatus(base) {
  return isNonEmptyString(base.status) ? base.status.trim().toLowerCase() : '';
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

function renderMetaRow(base) {
  elements.metaRow.innerHTML = '';

  const items = [
    { label: 'Type', value: labelFor('type', base.type) },
    { label: 'Region', value: labelFor('region', base.region) },
    { label: 'Country', value: isNonEmptyString(base.country) ? base.country : null },
    { label: 'Status', value: normalizeStatus(base) ? toTitleCaseSlug(normalizeStatus(base)) : null }
  ];

  items.forEach((item) => {
    if (!item.value) {
      return;
    }

    const listItem = document.createElement('li');
    const label = document.createElement('strong');
    label.textContent = `${item.label}: `;
    listItem.append(label, item.value);
    elements.metaRow.appendChild(listItem);
  });
}

function renderHero(base) {
  const imageUrl = getHeroImage(base);
  if (!imageUrl) {
    elements.heroSection.hidden = true;
    return;
  }

  elements.heroImage.src = imageUrl;
  elements.heroImage.alt = `${base.name} hero image`;
  elements.heroSection.hidden = false;
}

function renderSummary(base) {
  const summary = getSummary(base);
  const hasLead = Boolean(elements.summaryLead);

  if (hasLead) {
    elements.summaryLead.hidden = !summary;
    elements.summaryLead.textContent = summary;
  }

  if (!summary) {
    elements.summarySection.hidden = true;
    return;
  }

  elements.summary.textContent = summary;
  elements.summarySection.hidden = false;
}

function renderDescription(base) {
  const description = getDescription(base);
  elements.description.textContent = description || 'Description coming soon.';
}

function renderScore(base) {
  const scoreText = formatScore(getScore(base));
  if (!scoreText) {
    elements.scoreSection.hidden = true;
    return;
  }

  elements.score.textContent = scoreText;
  elements.scoreSection.hidden = false;
}

function createBaseUrl(slug, sourceParams) {
  const params = new URLSearchParams();
  params.set('slug', slug);

  const view = sourceParams.get('view');
  const region = sourceParams.get('region');
  const type = sourceParams.get('type');

  if (view === 'map') {
    params.set('view', view);
  }
  if (region) {
    params.set('region', region);
  }
  if (type) {
    params.set('type', type);
  }

  return `./base.html?${params.toString()}`;
}

function renderRelatedBases(base, bases, params) {
  elements.relatedList.innerHTML = '';

  const related = bases
    .filter((candidate) => candidate.slug !== base.slug && normalizeStatus(candidate) !== 'hidden')
    .sort((a, b) => {
      const aRegion = a.region === base.region ? 1 : 0;
      const bRegion = b.region === base.region ? 1 : 0;
      if (aRegion !== bRegion) {
        return bRegion - aRegion;
      }

      const aType = a.type === base.type ? 1 : 0;
      const bType = b.type === base.type ? 1 : 0;
      if (aType !== bType) {
        return bType - aType;
      }

      return a.name.localeCompare(b.name);
    })
    .slice(0, 3);

  if (!related.length) {
    elements.relatedSection.hidden = true;
    return;
  }

  related.forEach((item) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = createBaseUrl(item.slug, params);
    link.textContent = item.name;
    const meta = document.createElement('p');
    meta.className = 'base-meta';
    meta.textContent = `${labelFor('type', item.type)} • ${labelFor('region', item.region)}`;
    li.append(link, meta);
    elements.relatedList.appendChild(li);
  });

  elements.relatedSection.hidden = false;
}

function showBase(base, bases, params) {
  elements.name.textContent = base.name;
  elements.meta.textContent = `${labelFor('type', base.type)} • ${labelFor('region', base.region)}`;
  renderMetaRow(base);
  renderHero(base);
  renderSummary(base);
  renderDescription(base);
  renderScore(base);
  renderRelatedBases(base, bases, params);
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

    showBase(matchedBase, bases, params);
  } catch (error) {
    console.error(error);
    showNotFound();
  }
}

if (elements.status && elements.detail && elements.notFound && elements.name && elements.meta && elements.backLink) {
  loadBase();
}
