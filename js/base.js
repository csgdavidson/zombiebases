const DATA_URL = '/data/bases-index.json';
const LEGACY_DATA_URL = '/data/bases.json';
const STATS_URL = '/data/base-stats.json';
const RANKINGS_URL = '/data/rankings.json';
const DISCOVERY_URL = '/data/discovery.json';
const HERO_IMAGE_FALLBACK_URL = '/images/bases/placeholder.png';
const CARD_IMAGE_FALLBACK_URL = '/images/bases/placeholder.png';

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

const SURVIVAL_CHARACTERISTIC_LABELS = {
  exposure: 'Exposure',
  maintenanceBurden: 'Maintenance Burden',
  populationCapacity: 'Population Capacity',
  resourceSecurity: 'Resource Security'
};

const elements = {
  status: document.getElementById('detail-status'),
  detail: document.getElementById('base-detail'),
  notFound: document.getElementById('not-found'),
  name: document.getElementById('base-name'),
  summaryLead: document.getElementById('base-summary-lead'),
  heroStrengthsRow: document.getElementById('base-hero-strengths-row'),
  heroStrengths: document.getElementById('base-hero-strengths'),
  heroWeaknessesRow: document.getElementById('base-hero-weaknesses-row'),
  heroWeaknesses: document.getElementById('base-hero-weaknesses'),
  bestUseRow: document.getElementById('base-best-use-row'),
  bestUseText: document.getElementById('base-best-use'),
  keyRiskRow: document.getElementById('base-key-risk-row'),
  keyRiskText: document.getElementById('base-key-risk'),
  metaRow: document.getElementById('base-meta-row'),
  quickFactsCard: document.getElementById('quick-facts-card'),
  quickFactsList: document.getElementById('quick-facts-list'),
  backLink: document.getElementById('back-link'),
  compareLink: document.getElementById('compare-link'),
  heroSection: document.getElementById('hero-section'),
  heroImage: document.getElementById('base-hero-image'),
  scoreSection: document.getElementById('score-section'),
  scoreEmpty: document.getElementById('score-empty'),
  scoreOverall: document.getElementById('base-score-overall'),
  scoreBadges: document.getElementById('base-score-badges'),
  scoreList: document.getElementById('base-score-list'),
  rankingSection: document.getElementById('ranking-section'),
  rankingList: document.getElementById('ranking-list'),
  comparisonSection: document.getElementById('comparison-section'),
  comparisonInsightBlock: document.getElementById('comparison-insight-block'),
  comparisonInsightOverview: document.getElementById('comparison-insight-overview'),
  comparisonOverallBlock: document.getElementById('comparison-overall-block'),
  comparisonOverallList: document.getElementById('comparison-overall-list'),
  comparisonStrengthBlock: document.getElementById('comparison-strength-block'),
  comparisonCategoryList: document.getElementById('comparison-category-list'),
  similarSection: document.getElementById('similar-section'),
  similarList: document.getElementById('similar-bases-list'),
  similarExploreLink: document.getElementById('similar-explore-link'),
  survivalCharacteristicsSection: document.getElementById('survival-characteristics-section'),
  survivalCharacteristicsGrid: document.getElementById('survival-characteristics-grid'),
  survivalProfileSection: document.getElementById('survival-profile-section'),
  survivalTimelineCards: document.getElementById('survival-timeline-cards'),
  realityCheckRow: document.getElementById('base-reality-check-row'),
  realityCheckText: document.getElementById('base-reality-check')
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
  const value = isNonEmptyString(base?.description?.summary)
    ? base.description.summary
    : base?.summary;
  return isNonEmptyString(value) ? value : '';
}

function getSummary(base) {
  const value = isNonEmptyString(base?.summary)
    ? base.summary
    : base?.description?.summary;
  return isNonEmptyString(value) ? value : '';
}

function getCardSummary(base) {
  if (isNonEmptyString(base?.description?.summary)) {
    return base.description.summary.trim();
  }
  if (isNonEmptyString(base?.summary)) {
    return base.summary.trim();
  }
  return '';
}

function buildIntroSummary(base) {
  const summary = getSummary(base);
  const description = getDescription(base);
  if (!summary && !description) {
    return '';
  }
  if (!summary) {
    return description;
  }
  if (!description) {
    return summary;
  }
  if (summary.trim().toLowerCase() === description.trim().toLowerCase()) {
    return summary;
  }

  const summaryFirstSentence = summary.trim().split(/(?<=[.!?])\s+/)[0];
  const descriptionFirstSentence = description.trim().split(/(?<=[.!?])\s+/)[0];
  if (summaryFirstSentence.toLowerCase() === descriptionFirstSentence.toLowerCase()) {
    return summaryFirstSentence;
  }
  return `${summaryFirstSentence} ${descriptionFirstSentence}`.trim();
}

function getStructuredDescription(base) {
  const summary = getSummary(base) || getDescription(base);
  const strengths = getNonEmptyStringArray(base?.strengths ?? base?.description?.strengths);
  const weaknesses = getNonEmptyStringArray(base?.weaknesses ?? base?.description?.weaknesses);

  return {
    summary,
    strengths,
    weaknesses
  };
}

function firstSentence(value) {
  if (!isNonEmptyString(value)) {
    return '';
  }
  return value.trim().split(/(?<=[.!?])\s+/)[0];
}

function normalizeComparisonText(value) {
  return isNonEmptyString(value)
    ? value.trim().toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ')
    : '';
}

function getHeroImage(base) {
  const value = firstAvailableValue(base, ['hero_image', 'heroImage', 'image', 'image_url']);
  return isNonEmptyString(value) ? value : '';
}

function getCardImage(baseOrSlug) {
  const slug = typeof baseOrSlug === 'string' ? baseOrSlug : baseOrSlug?.slug;
  const value = typeof baseOrSlug === 'string'
    ? ''
    : firstAvailableValue(baseOrSlug, ['image', 'image_url']);

  if (isNonEmptyString(value)) {
    return value;
  }

  return isNonEmptyString(slug) ? `/images/bases/${encodeURIComponent(slug)}.png` : CARD_IMAGE_FALLBACK_URL;
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
  const href = queryString ? `/?${queryString}` : '/';
  const text = view === 'map' ? '← Back to Map' : '← Back to List';

  return { href, text };
}

function setBackLink(params) {
  const { href, text } = buildBackLink(params);
  elements.backLink.href = href;
  elements.backLink.textContent = text;
}

function buildBaseDescription(base) {
  const name = isNonEmptyString(base?.name) ? base.name.trim() : 'This survival base';
  const template = `${name} survival base analysis covers defensibility, isolation, and long-term viability with strengths, weaknesses, and practical trade-offs.`;
  return window.seo?.truncateDescription(template, 155) || template;
}

function applyDetailMetadata(base) {
  const cleanUrl = slugHelper?.getBaseUrl ? slugHelper.getBaseUrl(base.slug) : `/${encodeURIComponent(base.slug)}`;
  const canonicalUrlForSchema = `${window.seo?.PRODUCTION_ORIGIN || 'https://zombiebases.com'}${cleanUrl}`;
  const imageUrl = `${window.seo?.PRODUCTION_ORIGIN || 'https://zombiebases.com'}/images/bases/${encodeURIComponent(base.slug)}.png`;
  const summary = getDescription(base);
  const latitude = Number(base?.lat);
  const longitude = Number(base?.long);
  const hasValidGeo = Number.isFinite(latitude) && Number.isFinite(longitude);

  window.seo?.setJsonLd?.('base-article', {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${base.name} Zombie Survival Analysis`,
    description: summary,
    image: imageUrl,
    url: canonicalUrlForSchema,
    mainEntityOfPage: canonicalUrlForSchema,
    publisher: {
      '@type': 'Organization',
      name: 'Zombie Bases'
    }
  });

  window.seo?.setJsonLd?.('base-place', {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: base.name,
    description: summary,
    image: imageUrl,
    url: canonicalUrlForSchema,
    geo: hasValidGeo ? {
      '@type': 'GeoCoordinates',
      latitude,
      longitude
    } : undefined,
    address: isNonEmptyString(base?.country) ? {
      '@type': 'PostalAddress',
      addressCountry: base.country
    } : undefined
  });
}

function getQuickFactItems(base) {
  return [
    { label: 'Type', value: labelFor('type', base.type) },
    { label: 'Region', value: labelFor('region', base.region) },
    { label: 'Country', value: isNonEmptyString(base.country) ? base.country : null },
    { label: 'Best for', value: isNonEmptyString(base.best_for) ? base.best_for : firstSentence(base?.useCaseAndRisk?.bestUseCase) }
  ].filter((item) => item.value);
}

function renderMetaRow(base) {
  elements.metaRow.innerHTML = '';

  const items = getQuickFactItems(base).slice(0, 3);

  items.forEach((item) => {
    const listItem = document.createElement('li');
    const label = document.createElement('strong');
    label.textContent = `${item.label}: `;
    listItem.append(label, item.value);
    elements.metaRow.appendChild(listItem);
  });
  elements.metaRow.hidden = elements.metaRow.children.length === 0;

  if (elements.quickFactsCard && elements.quickFactsList) {
    elements.quickFactsList.innerHTML = '';
    getQuickFactItems(base).forEach((item) => {
      const term = document.createElement('dt');
      term.textContent = item.label;
      const description = document.createElement('dd');
      description.textContent = item.value;
      elements.quickFactsList.append(term, description);
    });
    elements.quickFactsCard.hidden = elements.quickFactsList.children.length === 0;
  }
}

function renderCompareEntry(base) {
  if (!elements.compareLink) {
    return;
  }

  elements.compareLink.href = slugHelper?.getCompareSetupUrl
    ? slugHelper.getCompareSetupUrl(base)
    : `/compare.html?base=${encodeURIComponent(base.slug)}`;
  elements.compareLink.hidden = false;
}

function renderHero(base) {
  const imageUrl = getHeroImage(base);
  if (!imageUrl) {
    elements.heroSection.hidden = true;
    return;
  }

  elements.heroImage.src = imageUrl;
  elements.heroImage.onerror = () => {
    elements.heroImage.onerror = null;
    elements.heroImage.src = HERO_IMAGE_FALLBACK_URL;
  };
  elements.heroImage.alt = `Feature image for ${base.name}`;
  elements.heroSection.hidden = false;
}

function renderSummary(base) {
  const summary = buildIntroSummary(base);
  const hasLead = Boolean(elements.summaryLead);

  if (!hasLead) {
    return;
  }

  elements.summaryLead.hidden = !summary;
  elements.summaryLead.textContent = summary;
}

function renderHeroTraits(base) {
  const description = getStructuredDescription(base);
  const strengthsText = description.strengths.length ? description.strengths.join(' • ') : '';
  const weaknessesText = description.weaknesses.length ? description.weaknesses.join(' • ') : '';

  elements.heroStrengths.textContent = strengthsText;
  elements.heroWeaknesses.textContent = weaknessesText;
  elements.heroStrengthsRow.hidden = !strengthsText;
  elements.heroWeaknessesRow.hidden = !weaknessesText;
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
    const scoreValue = document.createElement('span');
    scoreValue.className = `score-value ${scoreToneClass(scoreObject[key])}`.trim();
    scoreValue.textContent = ` ${scoreObject[key].toFixed(1)}/10`;
    item.append(itemLabel, scoreValue);
    elements.scoreList.appendChild(item);
  });
}

function renderScoreBadges(base) {
  if (!elements.scoreBadges) {
    return;
  }

  elements.scoreBadges.innerHTML = '';
  const badges = (slugHelper?.getBaseBadges ? slugHelper.getBaseBadges(base, 4) : [])
    .map((text, index) => ({ text, tone: index === 0 ? 'tier' : (index === 1 ? 'identity' : 'trait') }));

  badges.forEach((badge) => {
    const pill = document.createElement('span');
    pill.className = `badge badge-${badge.tone}`;
    pill.textContent = badge.text;
    elements.scoreBadges.appendChild(pill);
  });

  elements.scoreBadges.hidden = badges.length === 0;
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

function getSurvivalCharacteristics(base) {
  const source = base?.comparisonScores;
  if (!source || typeof source !== 'object') {
    return [];
  }

  return Object.entries(SURVIVAL_CHARACTERISTIC_LABELS)
    .map(([key, label]) => {
      const entry = source[key];
      if (!entry || typeof entry !== 'object' || !isValidScoreValue(entry.score)) {
        return null;
      }

      return {
        key,
        label,
        score: entry.score,
        rationale: isNonEmptyString(entry.rationale) ? entry.rationale.trim() : ''
      };
    })
    .filter(Boolean);
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

function getSurvivalLevel(value) {
  if (!isNonEmptyString(value)) {
    return null;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

  const strongest = ['very strong', 'very high', 'high', 'strong'];
  const medium = ['moderate', 'medium'];
  const low = ['weak', 'low'];
  const weakest = ['very weak', 'very low', 'nonviable', 'non viable', 'failing'];

  if (strongest.includes(normalized) || ((normalized.includes('very') || normalized.includes('high')) && normalized.includes('strong'))) {
    return 4;
  }
  if (medium.includes(normalized) || normalized.includes('moderate') || normalized.includes('medium')) {
    return 3;
  }
  if (weakest.includes(normalized) || normalized.includes('non viable') || normalized.includes('nonviable') || normalized.includes('very weak') || normalized.includes('very low') || normalized.includes('failing')) {
    return 1;
  }
  if (low.includes(normalized) || normalized.includes('weak') || normalized.includes('low')) {
    return 2;
  }

  return 3;
}

function getTrajectoryLabel(levels) {
  if (levels.length < 3) {
    return '';
  }

  const [initial, shortTerm, longTerm] = levels;
  const allSame = initial === shortTerm && shortTerm === longTerm;
  const improves = initial <= shortTerm && shortTerm <= longTerm && (initial < longTerm || shortTerm < longTerm);
  const gradualDecline = initial >= shortTerm && shortTerm >= longTerm && (initial > longTerm);
  const overallDrop = initial - longTerm;

  if (allSame) {
    return 'Stable profile';
  }
  if (improves) {
    return 'Improves over time';
  }
  if (initial >= 4 && longTerm <= 1) {
    return 'Late-stage collapse';
  }
  if (overallDrop >= 2) {
    return 'Sharp drop-off';
  }
  if (gradualDecline) {
    return 'Gradual decline';
  }

  return 'Variable profile';
}

function renderUseCaseAndRisk(base) {
  const verdict = getVerdict(base);
  const useCaseAndRisk = getUseCaseAndRisk(base);
  const bestUseCase = firstSentence(verdict.bestUseCase);
  const failureMode = firstSentence(verdict.failureMode);
  const fallbackBestUseCase = isNonEmptyString(useCaseAndRisk.bestUseCase) ? useCaseAndRisk.bestUseCase : '';
  const bestUseCaseText = bestUseCase || firstSentence(fallbackBestUseCase);
  const keyRisk = firstSentence(useCaseAndRisk.keyRisk);
  const failureModeNorm = failureMode.trim().toLowerCase();
  const keyRiskNorm = keyRisk.trim().toLowerCase();
  const mergedKeyRisk = keyRiskNorm && keyRiskNorm !== failureModeNorm ? keyRisk : '';
  const riskText = mergedKeyRisk || failureMode;

  const description = getStructuredDescription(base);
  const repeatedTexts = new Set([
    normalizeComparisonText(buildIntroSummary(base)),
    normalizeComparisonText(getRealityCheck(base)),
    ...description.strengths.map((item) => normalizeComparisonText(item)),
    ...description.weaknesses.map((item) => normalizeComparisonText(item))
  ]);
  const bestUseNormalized = normalizeComparisonText(bestUseCaseText);
  const riskNormalized = normalizeComparisonText(riskText);
  const showBestUse = Boolean(bestUseCaseText) && !repeatedTexts.has(bestUseNormalized);
  const showRisk = Boolean(riskText) && !repeatedTexts.has(riskNormalized);

  elements.bestUseRow.hidden = !showBestUse;
  if (showBestUse) {
    elements.bestUseText.textContent = bestUseCaseText;
  }

  elements.keyRiskRow.hidden = !showRisk;
  if (showRisk) {
    elements.keyRiskText.textContent = riskText;
  }
}


function renderSurvivalProfile(base) {
  const profile = getSurvivalProfile(base);
  const useCaseAndRisk = getUseCaseAndRisk(base);
  const verdict = getVerdict(base);

  const phases = [
    { timeframe: 'First 7 Days', value: isNonEmptyString(profile.initial) ? profile.initial : '' },
    { timeframe: 'First 100 Days', value: isNonEmptyString(profile.shortTerm) ? profile.shortTerm : '' },
    { timeframe: 'Long-term (100+ Days)', value: isNonEmptyString(profile.longTerm) ? profile.longTerm : '' }
  ];

  const hasContent = phases.some((phase) => phase.value);
  elements.survivalProfileSection.hidden = !hasContent;
  if (!hasContent || !elements.survivalTimelineCards) {
    return;
  }

  const primaryRisk = firstSentence(useCaseAndRisk.keyRisk || verdict.failureMode) || 'core systems start to fail';
  const cardsMarkup = phases.map((phase, index) => {
    const status = phase.value || 'Moderate';
    const level = getSurvivalLevel(status);
    const tone = level >= 4 ? 'strong' : level <= 2 ? 'weak' : 'moderate';
    const bullets = getSurvivalCardBullets(index, tone);
    const failureLine = getFailureLine(index, primaryRisk);

    return `
      <article class="survival-card" data-status="${tone}">
        <p class="survival-card-timeframe">${phase.timeframe}</p>
        <p class="survival-card-status">${status}</p>
        <ul class="survival-card-points">
          ${bullets.map((item) => `<li>${item}</li>`).join('')}
        </ul>
        <p class="survival-card-failure">→ ${failureLine}</p>
      </article>
    `;
  }).join('');

  elements.survivalTimelineCards.innerHTML = cardsMarkup;
}

function getSurvivalCardBullets(index, tone) {
  const phaseBullets = {
    strong: [
      ['✔ Secure and defensible', '✔ Controlled access', '✖ Early supply dependency'],
      ['✔ Stable control', '✔ Defensible perimeter', '✖ Supply strain emerging'],
      ['✔ Survivable with discipline', '✔ Systems can hold', '✖ Long-tail maintenance burden']
    ],
    moderate: [
      ['✔ Initial setup is workable', '✔ Access can be managed', '✖ Early logistics can wobble'],
      ['✔ Control is maintainable', '✔ Defenses remain useful', '✖ Resource pressure grows'],
      ['✔ Survivable with strict rationing', '✖ Resource depletion risk', '✖ Maintenance complexity rises']
    ],
    weak: [
      ['✔ Short burst survivability', '✖ Exposure points remain', '✖ Supply chain fragility'],
      ['✔ Some control is possible', '✖ Defenses are hard to sustain', '✖ Logistics become brittle'],
      ['✔ Pockets may remain viable', '✖ Resource exhaustion likely', '✖ System decay compounds']
    ]
  };

  return phaseBullets[tone][index] || phaseBullets.moderate[index];
}

function getFailureLine(index, risk) {
  const stem = risk.charAt(0).toLowerCase() + risk.slice(1);
  if (index === 0) return `You fail if early logistics break: ${stem}`;
  if (index === 1) return `You fail when sustained operations crack: ${stem}`;
  return `You fail through slow system decay: ${stem}`;
}

function renderRealityCheck(base) {
  const realityCheck = getRealityCheck(base);
  const content = firstSentence(realityCheck);

  elements.realityCheckRow.hidden = !content;
  if (!content) {
    return;
  }

  elements.realityCheckText.textContent = content;
}

function renderSurvivalCharacteristics(base) {
  if (!elements.survivalCharacteristicsSection || !elements.survivalCharacteristicsGrid) {
    return;
  }

  const characteristics = getSurvivalCharacteristics(base);
  elements.survivalCharacteristicsGrid.innerHTML = '';
  elements.survivalCharacteristicsSection.hidden = characteristics.length === 0;

  if (!characteristics.length) {
    return;
  }

  characteristics.forEach((characteristic) => {
    const card = document.createElement('article');
    card.className = 'survival-characteristic-card';

    const header = document.createElement('div');
    header.className = 'survival-characteristic-card-header';

    const label = document.createElement('p');
    label.className = 'survival-characteristic-label';
    label.textContent = characteristic.label;

    const score = document.createElement('p');
    score.className = `survival-characteristic-score ${scoreToneClass(characteristic.score)}`.trim();
    score.textContent = `${characteristic.score.toFixed(1)}/10`;

    header.append(label, score);

    const meter = document.createElement('div');
    meter.className = 'survival-characteristic-meter';
    meter.setAttribute('aria-hidden', 'true');

    const meterFill = document.createElement('span');
    meterFill.className = `survival-characteristic-meter-fill ${scoreToneClass(characteristic.score)}`.trim();
    meterFill.style.width = `${Math.max(0, Math.min(10, characteristic.score)) * 10}%`;
    meter.appendChild(meterFill);

    card.append(header, meter);

    if (characteristic.rationale) {
      const rationale = document.createElement('p');
      rationale.className = 'survival-characteristic-rationale';
      rationale.textContent = characteristic.rationale;
      card.appendChild(rationale);
    }

    elements.survivalCharacteristicsGrid.appendChild(card);
  });
}

function renderScore(base) {
  const scoreObject = getScoreObject(base);
  const overall = computeOverallScore(base);

  elements.scoreSection.hidden = false;

  if (!scoreObject && overall === null) {
    elements.scoreEmpty.hidden = false;
    elements.scoreOverall.hidden = true;
    elements.scoreBadges.hidden = true;
    elements.scoreList.hidden = true;
    return;
  }

  elements.scoreEmpty.hidden = true;
  elements.scoreOverall.hidden = overall === null;
  if (overall !== null) {
    elements.scoreOverall.className = `detail-overall-score ${scoreToneClass(overall)}`.trim();
    elements.scoreOverall.textContent = `${overall.toFixed(1)}/10`;
  }

  elements.scoreList.hidden = !scoreObject;
  if (!scoreObject) {
    elements.scoreBadges.hidden = true;
    return;
  }

  renderScoreBreakdown(scoreObject);
  renderScoreBadges(base);
}

function classifyComparison(value, average) {
  if (!isValidScoreValue(value) || !isValidScoreValue(average)) {
    return null;
  }

  const difference = value - average;
  if (difference >= 1.5) {
    return { label: 'Elite', marker: '▲', tone: 'positive' };
  }
  if (difference >= 0.5) {
    return { label: 'Strong', marker: '▲', tone: 'positive' };
  }
  if (difference > -0.5) {
    return { label: 'Average', marker: '▬', tone: 'neutral' };
  }
  if (difference > -1.5) {
    return { label: 'Weak', marker: '▼', tone: 'negative' };
  }
  return { label: 'Critical', marker: '▼', tone: 'negative' };
}

function appendComparisonItem(list, label, value, average, options = {}) {
  if (!isValidScoreValue(value) || !isValidScoreValue(average)) {
    return;
  }

  const { averageLabel = "Global avg" } = options;
  const comparison = classifyComparison(value, average);
  if (!comparison) {
    return null;
  }
  const difference = value - average;

  const item = document.createElement('li');
  item.className = 'comparison-row';

  const rowLabel = document.createElement('span');
  rowLabel.className = 'comparison-label';
  rowLabel.textContent = label;

  const primary = document.createElement('span');
  primary.className = `comparison-primary comparison-primary-${comparison.tone}`;
  primary.textContent = `${difference >= 0 ? '+' : ''}${difference.toFixed(1)} vs avg`;

  const values = document.createElement('span');
  values.className = 'comparison-values';
  values.textContent = `${value.toFixed(1)} vs ${averageLabel} ${average.toFixed(1)}`;

  const judgement = document.createElement('span');
  judgement.className = `comparison-judgement comparison-judgement-${comparison.tone}`;
  judgement.textContent = `${comparison.marker} ${comparison.label}`;

  item.append(rowLabel, primary, values, judgement);
  list.appendChild(item);
  return { label, value, average, difference, comparison };
}

function comparisonOverallLabel(kind, base) {
  if (kind === 'global') {
    return 'Against all bases';
  }
  if (kind === 'region') {
    return `Against ${labelFor('region', base.region)}`;
  }
  if (kind === 'type') {
    return `Against ${labelFor('type', base.type)}`;
  }
  return '';
}

function renderComparisonInsight(comparisons) {
  if (!elements.comparisonInsightBlock || !elements.comparisonInsightOverview) {
    return;
  }

  if (!Array.isArray(comparisons) || !comparisons.length) {
    elements.comparisonInsightBlock.hidden = true;
    elements.comparisonInsightOverview.textContent = '';
    return;
  }

  const overallEntry = comparisons.find((entry) => entry.label.includes('Against all bases'));

  if (!overallEntry) {
    elements.comparisonInsightBlock.hidden = true;
    elements.comparisonInsightOverview.textContent = '';
    return;
  }

  elements.comparisonInsightOverview.textContent = `Overall tier: ${overallEntry.comparison.label}`;
  elements.comparisonInsightBlock.hidden = false;
}



function buildRankingsLinks(base, rankings) {
  if (!rankings || typeof rankings !== 'object') {
    return [];
  }

  const globalEntry = (rankings.global || []).find((entry) => entry.slug === base.slug);
  const regionEntry = (rankings.byRegion?.[base.region] || []).find((entry) => entry.slug === base.slug);
  const typeEntry = (rankings.byType?.[base.type] || []).find((entry) => entry.slug === base.slug);

  const entries = [];

  if (globalEntry) {
    const topPercent = Math.max(1, Math.round(globalEntry.percentile));
    entries.push({
      text: `Global #${globalEntry.rank} · Top ${topPercent}%`,
      href: './rankings.html'
    });
  }

  if (regionEntry) {
    const regionLabel = labelFor('region', base.region);
    entries.push({
      text: `#${regionEntry.rank} in ${regionLabel}`,
      href: `./rankings-region.html?region=${encodeURIComponent(base.region)}`
    });
  }

  if (typeEntry) {
    const typeLabel = labelFor('type', base.type);
    entries.push({
      text: `${typeLabel} #${typeEntry.rank}`,
      href: `./rankings-type.html?type=${encodeURIComponent(base.type)}`
    });
  }

  return entries;
}

function renderRankingPosition(base, rankings) {
  if (!elements.rankingSection || !elements.rankingList) {
    return;
  }

  const rankingLinks = buildRankingsLinks(base, rankings);
  elements.rankingList.innerHTML = '';

  if (!rankingLinks.length) {
    elements.rankingSection.hidden = true;
    return;
  }

  rankingLinks.forEach((item) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.className = 'image-positioning-badge';
    link.href = item.href;
    link.textContent = item.text;
    li.appendChild(link);
    elements.rankingList.appendChild(li);
  });

  elements.rankingSection.hidden = false;
}

function renderComparison(base, stats) {
  if (!elements.comparisonSection || !elements.comparisonOverallList || !elements.comparisonCategoryList) {
    return;
  }

  if (!stats || typeof stats !== 'object') {
    elements.comparisonSection.hidden = true;
    renderComparisonInsight([]);
    return;
  }

  const scoreObject = getScoreObject(base);
  const overall = computeOverallScore(base);
  const regionStats = stats.byRegion?.[base.region];
  const typeStats = stats.byType?.[base.type];
  const globalStats = stats.global;

  elements.comparisonOverallList.innerHTML = '';
  elements.comparisonCategoryList.innerHTML = '';
  const comparisonEntries = [];

  const overallEntries = [
    appendComparisonItem(elements.comparisonOverallList, comparisonOverallLabel('global', base), overall, globalStats?.averages?.overall, { averageLabel: 'Global avg', showDelta: true }),
    appendComparisonItem(elements.comparisonOverallList, comparisonOverallLabel('region', base), overall, regionStats?.averages?.overall, { averageLabel: 'Region avg', showDelta: true }),
    appendComparisonItem(elements.comparisonOverallList, comparisonOverallLabel('type', base), overall, typeStats?.averages?.overall, { averageLabel: 'Type avg', showDelta: true })
  ].filter(Boolean);
  comparisonEntries.push(...overallEntries);

  if (scoreObject && globalStats?.averages) {
    Object.entries(SCORE_LABELS).forEach(([key, label]) => {
      const item = appendComparisonItem(elements.comparisonCategoryList, label, scoreObject[key], globalStats.averages[key], { averageLabel: 'Global avg' });
      if (item) {
        comparisonEntries.push(item);
      }
    });
  }

  const hasContent = elements.comparisonOverallList.children.length > 0 || elements.comparisonCategoryList.children.length > 0;
  if (elements.comparisonOverallBlock) {
    elements.comparisonOverallBlock.hidden = elements.comparisonOverallList.children.length === 0;
  }
  if (elements.comparisonStrengthBlock) {
    elements.comparisonStrengthBlock.hidden = elements.comparisonCategoryList.children.length === 0;
  }

  elements.comparisonSection.hidden = !hasContent;
  renderComparisonInsight(hasContent ? comparisonEntries : []);
}

function createBaseUrl(slug, sourceParams) {
  const resolvedSlug = slugHelper?.getPreferredSlug ? slugHelper.getPreferredSlug(slug) : slug;
  const params = new URLSearchParams();

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

  const queryString = params.toString();
  const cleanUrl = slugHelper?.getBaseUrl ? slugHelper.getBaseUrl(resolvedSlug) : `/${encodeURIComponent(resolvedSlug)}`;
  return queryString ? `${cleanUrl}?${queryString}` : cleanUrl;
}

function getSlug() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('slug')) {
    return params.get('slug');
  }

  const path = window.location.pathname.replace(/^\/|\/$/g, '');
  if (!path || path.toLowerCase() === 'base.html' || path.toLowerCase() === 'index.html') {
    return null;
  }

  return decodeURIComponent(path.split('/').pop() || '') || null;
}

function renderSimilarBases(base, bases, discovery, params) {
  if (!elements.similarSection || !elements.similarList) {
    return;
  }

  const similarEntries = discovery?.similarByBase?.[base.slug];
  if (!Array.isArray(similarEntries) || similarEntries.length === 0) {
    elements.similarSection.hidden = true;
    return;
  }

  elements.similarList.innerHTML = '';

  const baseLookup = new Map((Array.isArray(bases) ? bases : []).map((entry) => [entry.slug, entry]));

  similarEntries.slice(0, 3).forEach((item) => {
    const li = document.createElement('li');
    li.className = 'similar-base-item';

    const imageLink = document.createElement('a');
    imageLink.className = 'similar-base-thumb-link';
    imageLink.href = createBaseUrl(item.slug, params);
    imageLink.setAttribute('aria-label', `View details for ${item.name}`);

    const image = document.createElement('img');
    image.className = 'similar-base-thumb';
    image.src = getCardImage(baseLookup.get(item.slug) || item.slug);
    image.alt = `${item.name} thumbnail`;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = 180;
    image.height = 101;
    image.addEventListener('error', () => {
      image.src = CARD_IMAGE_FALLBACK_URL;
    }, { once: true });
    imageLink.appendChild(image);

    const textWrap = document.createElement('div');
    textWrap.className = 'similar-base-text';

    const link = document.createElement('a');
    link.href = createBaseUrl(item.slug, params);
    link.textContent = item.name;

    const scoreMeta = document.createElement('p');
    scoreMeta.className = 'base-meta';
    const summaryParts = [];
    const formattedScore = slugHelper?.formatScore ? slugHelper.formatScore(item.overall) : (Number.isFinite(item.overall) ? `${item.overall.toFixed(1)}/10` : '');
    if (formattedScore) summaryParts.push(formattedScore);
    if (item.region) summaryParts.push(labelFor('region', item.region));
    if (item.type) summaryParts.push(labelFor('type', item.type));
    scoreMeta.textContent = summaryParts.join(' • ');

    const tags = deriveSimilarTags(item);
    const tagRow = document.createElement('p');
    tagRow.className = 'badge-row';
    tags.forEach((tag) => {
      const badge = document.createElement('span');
      badge.className = 'badge badge-trait';
      badge.textContent = tag;
      tagRow.appendChild(badge);
    });

    textWrap.append(link, scoreMeta);

    const sourceBase = baseLookup.get(item.slug);
    const summaryText = getCardSummary(sourceBase);
    let description;
    if (summaryText) {
      description = document.createElement('p');
      description.className = 'similar-base-description';
      description.textContent = summaryText;
    }

    li.append(imageLink, textWrap);
    if (tags.length) {
      li.appendChild(tagRow);
    }
    if (description) {
      li.appendChild(description);
    }
    elements.similarList.appendChild(li);
  });

  if (elements.similarExploreLink) {
    const hint = discovery?.baseScenarioHints?.[base.slug];
    if (hint?.scenario) {
      elements.similarExploreLink.href = `./scenarios.html?scenario=${encodeURIComponent(hint.scenario)}`;
      elements.similarExploreLink.hidden = false;
    } else {
      elements.similarExploreLink.hidden = true;
    }
  }

  elements.similarSection.hidden = false;
}

function deriveSimilarTags(item) {
  const tags = [];
  const reason = isNonEmptyString(item?.reason) ? item.reason.toLowerCase() : '';

  if (reason.includes('protection') || reason.includes('defen')) tags.push('High defence');
  if (reason.includes('sustainability')) tags.push('Lower sustainability');
  if (reason.includes('isolat') || reason.includes('remote')) tags.push('Isolation-led');
  if (reason.includes('balanced') || reason.includes('trade-off')) tags.push('Balanced');

  if (!tags.length) tags.push('Balanced');
  return tags.slice(0, 2);
}

function showBase(base, bases, params, stats, rankings, discovery) {
  elements.name.textContent = base.name;
  applyDetailMetadata(base);
  renderMetaRow(base);
  renderCompareEntry(base);
  renderHero(base);
  renderSummary(base);
  renderHeroTraits(base);
  renderUseCaseAndRisk(base);
  renderScore(base);
  renderSurvivalCharacteristics(base);
  renderRankingPosition(base, rankings);
  renderComparison(base, stats);
  renderSurvivalProfile(base);
  renderRealityCheck(base);
  renderSimilarBases(base, bases, discovery, params);
  elements.status.textContent = '';
  elements.notFound.hidden = true;
  elements.detail.hidden = false;
}

async function loadBase() {
  const params = new URLSearchParams(window.location.search);
  const slug = slugHelper?.getBaseSlugFromLocation ? slugHelper.getBaseSlugFromLocation(window.location) : getSlug();

  setBackLink(params);

  if (!slug) {
    showNotFound();
    return;
  }

  elements.status.textContent = 'Loading base details...';

  try {
    const [bases, statsResponse, rankingsResponse, discoveryResponse] = await Promise.all([
      loadBasesData(),
      fetch(STATS_URL),
      fetch(RANKINGS_URL),
      fetch(DISCOVERY_URL)
    ]);
    const stats = statsResponse.ok ? await statsResponse.json() : null;
    const rankings = rankingsResponse.ok ? await rankingsResponse.json() : null;
    const discovery = discoveryResponse.ok ? await discoveryResponse.json() : null;
    const matchedBase = slugHelper?.resolveBaseBySlug
      ? slugHelper.resolveBaseBySlug(bases, slug)
      : bases.find((base) => base.slug === slug);

    if (!matchedBase) {
      showNotFound();
      return;
    }

    showBase(matchedBase, bases, params, stats, rankings, discovery);
  } catch (error) {
    console.error(error);
    showLoadError();
  }
}

async function loadBasesData() {
  const candidates = [DATA_URL, LEGACY_DATA_URL];
  let lastError = null;

  for (const url of candidates) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        lastError = new Error(`Failed to load base data from ${url} (${response.status})`);
        continue;
      }

      const payload = await response.json();
      if (Array.isArray(payload)) {
        return payload;
      }

      if (Array.isArray(payload?.bases)) {
        return payload.bases;
      }

      lastError = new Error(`Unexpected base data shape from ${url}`);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Failed to load base data.');
}

if (
  elements.status
  && elements.detail
  && elements.notFound
  && elements.name
  && elements.backLink
  && elements.heroStrengths
  && elements.heroWeaknesses
) {
  loadBase();
}
