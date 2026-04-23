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

const DESCRIPTION_FALLBACKS = {
  summary: 'Summary coming soon.',
  strengths: 'Strengths not available yet.',
  weaknesses: 'Weaknesses not available yet.'
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
  descriptionSummary: document.getElementById('base-description-summary'),
  descriptionStrengths: document.getElementById('base-description-strengths'),
  descriptionWeaknesses: document.getElementById('base-description-weaknesses'),
  scoreSection: document.getElementById('score-section'),
  scoreEmpty: document.getElementById('score-empty'),
  scoreOverall: document.getElementById('base-score-overall'),
  scoreList: document.getElementById('base-score-list'),
  scoreStrengths: document.getElementById('base-score-strengths'),
  scoreWeaknesses: document.getElementById('base-score-weaknesses'),
  relatedSection: document.getElementById('related-section'),
  relatedList: document.getElementById('related-bases-list')
};

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

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function getNonEmptyStringArray(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => isNonEmptyString(item)).map((item) => item.trim());
  }

  if (isNonEmptyString(value)) {
    return [value.trim()];
  }

  return [];
}

function isValidScoreValue(value) {
  return Number.isFinite(value);
}

function firstAvailableValue(base, keys) {
  const matchedKey = keys.find((key) => base[key] !== undefined && base[key] !== null);
  return matchedKey ? base[matchedKey] : null;
}

function getDescription(base) {
  if (base && typeof base.description === 'object' && base.description) {
    const value = base.description.summary;
    return isNonEmptyString(value) ? value : '';
  }

  const value = firstAvailableValue(base, ['description', 'details', 'long_description']);
  return isNonEmptyString(value) ? value : '';
}

function getSummary(base) {
  if (base && typeof base.description === 'object' && base.description) {
    const value = base.description.summary;
    if (isNonEmptyString(value)) {
      return value;
    }
  }

  const value = firstAvailableValue(base, ['summary', 'short_description']);
  return isNonEmptyString(value) ? value : '';
}

function getStructuredDescription(base) {
  const description = base?.description;
  const summary = getSummary(base) || getDescription(base);

  if (!description || typeof description !== 'object') {
    return {
      summary,
      strengths: [],
      weaknesses: []
    };
  }

  return {
    summary: isNonEmptyString(description.summary) ? description.summary : summary,
    strengths: getNonEmptyStringArray(description.strengths),
    weaknesses: getNonEmptyStringArray(description.weaknesses)
  };
}

function getHeroImage(base) {
  const value = firstAvailableValue(base, ['hero_image', 'heroImage', 'image', 'image_url']);
  return isNonEmptyString(value) ? value : '';
}

function getScoreObject(base) {
  const source = base?.scores?.categories ?? base?.scores;
  if (!source || typeof source !== 'object') {
    return null;
  }

  const entries = Object.entries(source).filter(([key, value]) => SCORE_LABELS[key] && isValidScoreValue(value));
  return entries.length ? Object.fromEntries(entries) : null;
}

function computeOverallScore(base) {
  if (isValidScoreValue(base?.scores?.overall)) {
    return base.scores.overall;
  }

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

function buildBaseDescription(base) {
  const summary = getSummary(base);
  const description = getDescription(base);
  const fallback = 'Read details for this zombie survival base, including region, type, and preparedness notes.';
  return window.seo?.truncateDescription(summary || description || fallback, 160) || fallback;
}

function applyDetailMetadata(base) {
  if (!window.seo) {
    return;
  }

  const canonicalParams = new URLSearchParams();
  canonicalParams.set('slug', base.slug);

  window.seo.applyPageMetadata({
    title: `${base.name} | ${window.seo.BRAND_NAME}`,
    description: buildBaseDescription(base),
    canonicalPath: '/base.html',
    canonicalParams
  });
}

function applyNotFoundMetadata() {
  if (!window.seo) {
    return;
  }

  window.seo.applyPageMetadata({
    title: `Base Not Found | ${window.seo.BRAND_NAME}`,
    description: 'The requested base page could not be found in the Zombie Bases directory.',
    canonicalPath: '/base.html'
  });
}

function showNotFound() {
  elements.status.textContent = '';
  elements.detail.hidden = true;
  elements.notFound.hidden = false;
  applyNotFoundMetadata();
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
  const description = getStructuredDescription(base);
  elements.descriptionSummary.textContent = description.summary || DESCRIPTION_FALLBACKS.summary;
  elements.descriptionStrengths.textContent = description.strengths.length
    ? description.strengths.join(' • ')
    : DESCRIPTION_FALLBACKS.strengths;
  elements.descriptionWeaknesses.textContent = description.weaknesses.length
    ? description.weaknesses.join(' • ')
    : DESCRIPTION_FALLBACKS.weaknesses;
}

function renderScoreBreakdown(scoreObject) {
  elements.scoreList.innerHTML = '';

  Object.entries(SCORE_LABELS).forEach(([key, label]) => {
    if (!isValidScoreValue(scoreObject[key])) {
      return;
    }

    const item = document.createElement('li');
    const itemLabel = document.createElement('strong');
    itemLabel.textContent = `${label}:`;
    item.append(itemLabel, ` ${scoreObject[key].toFixed(1)}/10`);
    elements.scoreList.appendChild(item);
  });
}

function renderStrengthsAndWeaknesses(scoreObject) {
  const sortedScores = Object.entries(scoreObject)
    .filter(([key, value]) => SCORE_LABELS[key] && isValidScoreValue(value))
    .sort((a, b) => b[1] - a[1]);

  const topTwo = sortedScores.slice(0, 2).map(([key, value]) => `${SCORE_LABELS[key]} (${value.toFixed(1)})`);
  const bottomTwo = [...sortedScores].reverse().slice(0, 2).map(([key, value]) => `${SCORE_LABELS[key]} (${value.toFixed(1)})`);

  if (!topTwo.length || !bottomTwo.length) {
    elements.scoreStrengths.parentElement.hidden = true;
    elements.scoreWeaknesses.parentElement.hidden = true;
    return;
  }

  elements.scoreStrengths.parentElement.hidden = false;
  elements.scoreWeaknesses.parentElement.hidden = false;
  elements.scoreStrengths.textContent = topTwo.join(' • ');
  elements.scoreWeaknesses.textContent = bottomTwo.join(' • ');
}

function renderScore(base) {
  const scoreObject = getScoreObject(base);
  const overall = computeOverallScore(base);

  elements.scoreSection.hidden = false;

  if (!scoreObject && overall === null) {
    elements.scoreEmpty.hidden = false;
    elements.scoreOverall.hidden = true;
    elements.scoreList.hidden = true;
    elements.scoreStrengths.parentElement.hidden = true;
    elements.scoreWeaknesses.parentElement.hidden = true;
    return;
  }

  elements.scoreEmpty.hidden = true;
  elements.scoreOverall.hidden = overall === null;
  if (overall !== null) {
    elements.scoreOverall.textContent = `${overall.toFixed(1)}/10`;
  }

  elements.scoreList.hidden = !scoreObject;
  if (!scoreObject) {
    elements.scoreStrengths.parentElement.hidden = true;
    elements.scoreWeaknesses.parentElement.hidden = true;
    return;
  }

  renderScoreBreakdown(scoreObject);
  renderStrengthsAndWeaknesses(scoreObject);
}

function createBaseUrl(slug, sourceParams) {
  const resolvedSlug = slugHelper?.getPreferredSlug ? slugHelper.getPreferredSlug(slug) : slug;
  const params = new URLSearchParams();
  params.set('slug', resolvedSlug);

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
  applyDetailMetadata(base);
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
    const matchedBase = slugHelper?.resolveBaseBySlug
      ? slugHelper.resolveBaseBySlug(bases, slug)
      : bases.find((base) => base.slug === slug);

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

if (
  elements.status
  && elements.detail
  && elements.notFound
  && elements.name
  && elements.meta
  && elements.backLink
  && elements.descriptionSummary
  && elements.descriptionStrengths
  && elements.descriptionWeaknesses
) {
  loadBase();
}
