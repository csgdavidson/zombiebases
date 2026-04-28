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
  isolation: 'Isolation',
  sustainability: 'Sustainability'
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
  descriptionStrengths: document.getElementById('base-description-strengths'),
  descriptionWeaknesses: document.getElementById('base-description-weaknesses'),
  descriptionAnalysis: document.getElementById('base-description-analysis'),
  verdictSection: document.getElementById('verdict-section'),
  verdictBestUseCaseRow: document.getElementById('base-verdict-best-use-case-row'),
  verdictBestUseCase: document.getElementById('base-verdict-best-use-case'),
  verdictFailureModeRow: document.getElementById('base-verdict-failure-mode-row'),
  verdictFailureMode: document.getElementById('base-verdict-failure-mode'),
  scoreSection: document.getElementById('score-section'),
  scoreEmpty: document.getElementById('score-empty'),
  scoreOverall: document.getElementById('base-score-overall'),
  scoreList: document.getElementById('base-score-list'),
  scoreStrengths: document.getElementById('base-score-strengths'),
  scoreWeaknesses: document.getElementById('base-score-weaknesses'),
  survivalProfileSection: document.getElementById('survival-profile-section'),
  survivalInitialRow: document.getElementById('base-survival-initial-row'),
  survivalInitial: document.getElementById('base-survival-initial'),
  survivalShortTermRow: document.getElementById('base-survival-short-term-row'),
  survivalShortTerm: document.getElementById('base-survival-short-term'),
  survivalLongTermRow: document.getElementById('base-survival-long-term-row'),
  survivalLongTerm: document.getElementById('base-survival-long-term'),
  useCaseRiskSection: document.getElementById('use-case-risk-section'),
  useCaseRow: document.getElementById('base-use-case-row'),
  useCaseText: document.getElementById('base-use-case'),
  keyRiskRow: document.getElementById('base-key-risk-row'),
  keyRiskText: document.getElementById('base-key-risk'),
  realityCheckSection: document.getElementById('reality-check-section'),
  realityCheckText: document.getElementById('base-reality-check'),
  scoreNarrativeSection: document.getElementById('score-narrative-section'),
  scoreNarrativeText: document.getElementById('base-score-narrative'),
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
  const value = isNonEmptyString(base?.summary)
    ? base.summary
    : base?.description?.summary;
  return isNonEmptyString(value) ? value : '';
}

function getSummary(base) {
  const value = isNonEmptyString(base?.summary)
    ? base.summary
    : base?.description?.summary;
  return isNonEmptyString(value) ? value : '';
}

function getStructuredDescription(base) {
  const summary = getSummary(base) || getDescription(base);
  const analysis = getScoreNarrative(base);
  const strengths = getNonEmptyStringArray(base?.strengths ?? base?.description?.strengths);
  const weaknesses = getNonEmptyStringArray(base?.weaknesses ?? base?.description?.weaknesses);

  return {
    summary,
    analysis,
    strengths,
    weaknesses
  };
}

function getHeroImage(base) {
  const value = firstAvailableValue(base, ['hero_image', 'heroImage', 'image', 'image_url']);
  return isNonEmptyString(value) ? value : '';
}

function getScoreObject(base) {
  const source = base?.scores?.categories;
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
  return null;
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
  if (elements.descriptionAnalysis) {
    const analysis = isNonEmptyString(description.analysis) ? description.analysis : '';
    elements.descriptionAnalysis.hidden = !analysis;
    elements.descriptionAnalysis.textContent = analysis;
  }
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
  const rankedScores = Object.entries(scoreObject)
    .filter(([key, value]) => SCORE_LABELS[key] && isValidScoreValue(value))
    .sort((a, b) => b[1] - a[1]);

  const topTwoEntries = rankedScores.slice(0, 2);
  const topTwo = topTwoEntries.map(([key, value]) => `${SCORE_LABELS[key]} (${value.toFixed(1)})`);

  const topKeys = new Set(topTwoEntries.map(([key]) => key));
  const remainingLowestFirst = rankedScores
    .filter(([key]) => !topKeys.has(key))
    .sort((a, b) => a[1] - b[1]);
  const remainingBelowEight = remainingLowestFirst.filter(([, value]) => value < 8);
  const bottomCandidates = remainingBelowEight.length >= 2
    ? remainingBelowEight.slice(0, 2)
    : remainingLowestFirst.slice(0, 2);
  const bottomTwo = bottomCandidates.map(([key, value]) => `${SCORE_LABELS[key]} (${value.toFixed(1)})`);

  elements.scoreStrengths.parentElement.hidden = !topTwo.length;
  elements.scoreWeaknesses.parentElement.hidden = !bottomTwo.length;
  if (topTwo.length) {
    elements.scoreStrengths.textContent = topTwo.join(' • ');
  }
  if (bottomTwo.length) {
    elements.scoreWeaknesses.textContent = bottomTwo.join(' • ');
  }
}

function getVerdict(base) {
  return {
    bestUseCase: base?.verdict?.bestUseCase ?? null,
    failureMode: base?.verdict?.failureMode ?? null
  };
}

function getSurvivalProfile(base) {
  return {
    initial: base?.survivalProfile?.initial ?? null,
    shortTerm: base?.survivalProfile?.shortTerm ?? null,
    longTerm: base?.survivalProfile?.longTerm ?? null
  };
}

function getUseCaseAndRisk(base) {
  return {
    bestUseCase: base?.useCaseAndRisk?.bestUseCase ?? null,
    keyRisk: base?.useCaseAndRisk?.keyRisk ?? null
  };
}

function getRealityCheck(base) {
  return base?.realityCheck ?? null;
}

function getScoreNarrative(base) {
  return base?.scoreNarrative ?? null;
}

function renderVerdict(base) {
  const verdict = getVerdict(base);
  const bestUseCase = isNonEmptyString(verdict.bestUseCase) ? verdict.bestUseCase : '';
  const failureMode = isNonEmptyString(verdict.failureMode) ? verdict.failureMode : '';

  const hasContent = Boolean(bestUseCase || failureMode);
  elements.verdictSection.hidden = !hasContent;
  if (!hasContent) {
    return;
  }

  elements.verdictBestUseCase.textContent = bestUseCase;
  elements.verdictFailureMode.textContent = failureMode;
  elements.verdictBestUseCaseRow.hidden = !bestUseCase;
  elements.verdictFailureModeRow.hidden = !failureMode;
}

function renderSurvivalProfile(base) {
  const profile = getSurvivalProfile(base);
  const initial = isNonEmptyString(profile.initial) ? profile.initial : '';
  const shortTerm = isNonEmptyString(profile.shortTerm) ? profile.shortTerm : '';
  const longTerm = isNonEmptyString(profile.longTerm) ? profile.longTerm : '';

  const hasContent = Boolean(initial || shortTerm || longTerm);
  elements.survivalProfileSection.hidden = !hasContent;
  if (!hasContent) {
    return;
  }

  elements.survivalInitial.textContent = initial;
  elements.survivalShortTerm.textContent = shortTerm;
  elements.survivalLongTerm.textContent = longTerm;
  elements.survivalInitialRow.hidden = !initial;
  elements.survivalShortTermRow.hidden = !shortTerm;
  elements.survivalLongTermRow.hidden = !longTerm;
}

function renderUseCaseAndRisk(base) {
  const useCaseAndRisk = getUseCaseAndRisk(base);
  const bestUseCase = isNonEmptyString(useCaseAndRisk.bestUseCase) ? useCaseAndRisk.bestUseCase : '';
  const keyRisk = isNonEmptyString(useCaseAndRisk.keyRisk) ? useCaseAndRisk.keyRisk : '';

  const hasContent = Boolean(bestUseCase || keyRisk);
  elements.useCaseRiskSection.hidden = !hasContent;
  if (!hasContent) {
    return;
  }

  elements.useCaseText.textContent = bestUseCase;
  elements.keyRiskText.textContent = keyRisk;
  elements.useCaseRow.hidden = !bestUseCase;
  elements.keyRiskRow.hidden = !keyRisk;
}

function renderRealityCheck(base) {
  const realityCheck = getRealityCheck(base);
  const content = isNonEmptyString(realityCheck) ? realityCheck : '';

  elements.realityCheckSection.hidden = !content;
  if (!content) {
    return;
  }

  elements.realityCheckText.textContent = content;
}

function renderScoreNarrative(base) {
  const scoreNarrative = getScoreNarrative(base);
  const content = isNonEmptyString(scoreNarrative) ? scoreNarrative : '';

  elements.scoreNarrativeSection.hidden = !content;
  if (!content) {
    return;
  }

  elements.scoreNarrativeText.textContent = content;
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
  renderVerdict(base);
  renderDescription(base);
  renderScore(base);
  renderSurvivalProfile(base);
  renderUseCaseAndRisk(base);
  renderRealityCheck(base);
  renderScoreNarrative(base);
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
  && elements.descriptionStrengths
  && elements.descriptionWeaknesses
) {
  loadBase();
}
