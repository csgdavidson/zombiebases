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

const SCORE_LABELS = {
  defensibility: 'Defensibility',
  food: 'Food',
  water: 'Water',
  isolation: 'Isolation',
  escape: 'Escape',
  sustainability: 'Sustainability',
  human_risk: 'Human Risk'
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
  descriptionSection: document.getElementById('description-section'),
  description: document.getElementById('base-description'),
  scoreSection: document.getElementById('score-section'),
  scoreEmpty: document.getElementById('score-empty'),
  scoreOverall: document.getElementById('base-score-overall'),
  scoreList: document.getElementById('base-score-list'),
  scoreStrengths: document.getElementById('base-score-strengths'),
  scoreWeaknesses: document.getElementById('base-score-weaknesses'),
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

function isValidScoreValue(value) {
  return Number.isFinite(value);
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

function getScoreObject(base) {
  if (!base || typeof base.scores !== 'object' || !base.scores) {
    return null;
  }

  const entries = Object.entries(base.scores).filter(([key, value]) => SCORE_LABELS[key] && isValidScoreValue(value));
  return entries.length ? Object.fromEntries(entries) : null;
}

function computeOverallScore(base) {
  if (isValidScoreValue(base?.score)) {
    return base.score;
  }

  const scoreObject = getScoreObject(base);
  if (!scoreObject) {
    return null;
  }

  const values = Object.values(scoreObject);
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Number(average.toFixed(1));
}

function normalizeStatus(base) {
  return isNonEmptyString(base.status) ? base.status.trim().toLowerCase() : '';
}

function buildBackLink(params) {
  const linkParams = new URLSearchParams();
  const view = params.get('view') === 'map' ? 'map' : 'list';

  if (view === 'map') {
    linkParams.set('view', 'map');
  }

  const region = params.get('region') ?? '';
  const type = params.get('type') ?? '';
  const sort = params.get('sort') ?? '';
  const query = params.get('q') ?? '';

  if (region) {
    linkParams.set('region', region);
  }

  if (type) {
    linkParams.set('type', type);
  }

  if (sort) {
    linkParams.set('sort', sort);
  }

  if (query) {
    linkParams.set('q', query);
  }

  const queryString = linkParams.toString();
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

  if (!hasLead) {
    return;
  }

  elements.summaryLead.hidden = !summary;
  elements.summaryLead.textContent = summary;
}

function renderDescription(base) {
  const description = getDescription(base);
  elements.description.textContent = description || 'Description coming soon.';
}

function renderScoreBreakdown(scoreObject) {
  elements.scoreList.innerHTML = '';

  Object.entries(SCORE_LABELS).forEach(([key, label]) => {
    if (!isValidScoreValue(scoreObject[key])) {
      return;
    }

    const item = document.createElement('li');
    item.innerHTML = `<strong>${label}:</strong> ${scoreObject[key].toFixed(1)}/10`;
    elements.scoreList.appendChild(item);
  });
}

function renderStrengthsAndWeaknesses(scoreObject) {
  const sortedScores = Object.entries(scoreObject)
    .filter(([key, value]) => SCORE_LABELS[key] && isValidScoreValue(value))
    .sort((a, b) => b[1] - a[1]);

  const topTwo = sortedScores.slice(0, 2).map(([key, value]) => `${SCORE_LABELS[key]} (${value.toFixed(1)})`);
  const bottomTwo = [...sortedScores].reverse().slice(0, 2).map(([key, value]) => `${SCORE_LABELS[key]} (${value.toFixed(1)})`);

  elements.scoreStrengths.textContent = topTwo.join(' • ');
  elements.scoreWeaknesses.textContent = bottomTwo.join(' • ');
}

function renderScore(base) {
  const scoreObject = getScoreObject(base);
  const overall = computeOverallScore(base);

  elements.scoreSection.hidden = false;

  if (!scoreObject || overall === null) {
    elements.scoreEmpty.hidden = false;
    elements.scoreOverall.hidden = true;
    elements.scoreList.hidden = true;
    elements.scoreStrengths.parentElement.hidden = true;
    elements.scoreWeaknesses.parentElement.hidden = true;
    return;
  }

  elements.scoreEmpty.hidden = true;
  elements.scoreOverall.hidden = false;
  elements.scoreOverall.textContent = `${overall.toFixed(1)}/10`;
  elements.scoreList.hidden = false;
  elements.scoreStrengths.parentElement.hidden = false;
  elements.scoreWeaknesses.parentElement.hidden = false;

  renderScoreBreakdown(scoreObject);
  renderStrengthsAndWeaknesses(scoreObject);
}

function createBaseUrl(slug, sourceParams) {
  const params = new URLSearchParams();
  params.set('slug', slug);

  const view = sourceParams.get('view');
  const region = sourceParams.get('region');
  const type = sourceParams.get('type');
  const sort = sourceParams.get('sort');
  const query = sourceParams.get('q');

  if (view === 'map') {
    params.set('view', view);
  }
  if (region) {
    params.set('region', region);
  }
  if (type) {
    params.set('type', type);
  }
  if (sort) {
    params.set('sort', sort);
  }
  if (query) {
    params.set('q', query);
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
