const DATA_URL = './data/bases-index.json';
const LEGACY_DATA_URL = './data/bases.json';
const STATS_URL = './data/base-stats.json';
const RANKINGS_URL = './data/rankings.json';
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

const SCORE_LABELS = {
  defensibility: 'Defensibility',
  isolation: 'Isolation',
  sustainability: 'Sustainability'
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
  backLink: document.getElementById('back-link'),
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
  comparisonInsight: document.getElementById('comparison-insight'),
  comparisonOverallTier: document.getElementById('comparison-overall-tier'),
  comparisonOverallExplanation: document.getElementById('comparison-overall-explanation'),
  comparisonOverallBlock: document.getElementById('comparison-overall-block'),
  comparisonStrengthBlock: document.getElementById('comparison-strength-block'),
  comparisonInterpretationBlock: document.getElementById('comparison-interpretation-block'),
  comparisonOverallList: document.getElementById('comparison-overall-list'),
  comparisonCategoryList: document.getElementById('comparison-category-list'),
  comparisonInterpretationList: document.getElementById('comparison-interpretation-list'),
  similarSection: document.getElementById('similar-section'),
  similarList: document.getElementById('similar-bases-list'),
  similarExploreLink: document.getElementById('similar-explore-link'),
  survivalProfileSection: document.getElementById('survival-profile-section'),
  survivalInitialRow: document.getElementById('base-survival-initial-row'),
  survivalInitial: document.getElementById('base-survival-initial'),
  survivalInitialNote: document.getElementById('base-survival-initial-note'),
  survivalShortTermRow: document.getElementById('base-survival-short-term-row'),
  survivalShortTerm: document.getElementById('base-survival-short-term'),
  survivalShortTermNote: document.getElementById('base-survival-short-term-note'),
  survivalLongTermRow: document.getElementById('base-survival-long-term-row'),
  survivalLongTerm: document.getElementById('base-survival-long-term'),
  survivalLongTermNote: document.getElementById('base-survival-long-term-note'),
  survivalTrajectoryLabel: document.getElementById('survival-trajectory-label'),
  survivalSummaryInsight: document.getElementById('survival-summary-insight'),
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
  const title = `${base.name} | ${window.seo?.BRAND_NAME || 'Zombie Bases'}`;
  const description = buildBaseDescription(base);
  const canonicalUrl = `${window.seo?.PRODUCTION_ORIGIN || 'https://zombiebases.com'}${slugHelper?.getBaseUrl ? slugHelper.getBaseUrl(base.slug) : `/${encodeURIComponent(base.slug)}`}`;

  document.title = title;
  if (description) {
    slugHelper?.createOrUpdateMetaTag?.('meta[name="description"]', { name: 'description', content: description });
  }
  slugHelper?.createOrUpdateCanonical?.(canonicalUrl);
  slugHelper?.createOrUpdateMetaTag?.('meta[property="og:title"]', { property: 'og:title', content: title });
  if (description) {
    slugHelper?.createOrUpdateMetaTag?.('meta[property="og:description"]', { property: 'og:description', content: description });
  }
  slugHelper?.createOrUpdateMetaTag?.('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
  slugHelper?.createOrUpdateMetaTag?.('meta[property="og:type"]', { property: 'og:type', content: 'article' });
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

function showLoadError() {
  elements.status.textContent = 'Unable to load base details right now. Please try again.';
  elements.detail.hidden = true;
  elements.notFound.hidden = true;
}

function renderMetaRow(base) {
  elements.metaRow.innerHTML = '';

  const items = [
    { label: 'Type', value: labelFor('type', base.type) },
    { label: 'Region', value: labelFor('region', base.region) },
    { label: 'Country', value: isNonEmptyString(base.country) ? base.country : null }
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
  elements.metaRow.hidden = elements.metaRow.children.length === 0;
}

function renderHero(base) {
  const imageUrl = getHeroImage(base);
  if (!imageUrl) {
    elements.heroSection.hidden = true;
    return;
  }

  elements.heroImage.src = imageUrl;
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
  elements.survivalInitialNote.textContent = 'Immediate viability at first occupancy and setup.';
  elements.survivalShortTermNote.textContent = 'Resilience once supplies tighten and pressure builds.';
  elements.survivalLongTermNote.textContent = 'Durability after systems, health, and logistics are stress-tested.';

  const stageRows = [
    { row: elements.survivalInitialRow, value: initial },
    { row: elements.survivalShortTermRow, value: shortTerm },
    { row: elements.survivalLongTermRow, value: longTerm }
  ];

  const stageLevels = [];
  stageRows.forEach(({ row, value }) => {
    if (!row || !value) {
      return;
    }

    const level = getSurvivalLevel(value);
    if (level !== null) {
      row.style.setProperty('--survival-level', String(level));
      row.setAttribute('data-survival-level', String(level));
      stageLevels.push(level);
    }
  });

  const visibleRows = stageRows.filter(({ value }) => Boolean(value));
  visibleRows.forEach((entry, index) => {
    const next = visibleRows[index + 1];
    const level = getSurvivalLevel(entry.value);
    const nextLevel = next ? getSurvivalLevel(next.value) : null;
    const segmentState = !next ? 'end' : nextLevel < level ? 'decline' : nextLevel > level ? 'improve' : 'flat';
    entry.row.setAttribute('data-segment', segmentState);
  });

  const trajectoryLabel = getTrajectoryLabel(stageLevels);
  elements.survivalTrajectoryLabel.textContent = trajectoryLabel;
  elements.survivalTrajectoryLabel.hidden = !trajectoryLabel;

  if (stageLevels.length) {
    const bestIndex = stageLevels.indexOf(Math.max(...stageLevels));
    const worstIndex = stageLevels.indexOf(Math.min(...stageLevels));
    const phaseNames = ['Initial', 'Short-term', 'Long-term'];
    elements.survivalSummaryInsight.textContent = `What this means: Best window is ${phaseNames[bestIndex]}; risk window is ${phaseNames[worstIndex]}.`;
    elements.survivalSummaryInsight.hidden = false;
  } else {
    elements.survivalSummaryInsight.hidden = true;
  }
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

function formatDelta(difference) {
  const sign = difference >= 0 ? '+' : '';
  return `${sign}${difference.toFixed(1)}`;
}

function appendComparisonItem(list, label, value, average, description) {
  if (!isValidScoreValue(value) || !isValidScoreValue(average)) {
    return;
  }

  const comparison = classifyComparison(value, average);
  if (!comparison) {
    return null;
  }

  const difference = value - average;
  const item = document.createElement('li');
  item.className = 'comparison-row';

  const heading = document.createElement('p');
  heading.className = 'comparison-row-heading';
  heading.innerHTML = `<strong>${label}:</strong> ${comparison.label}`;

  const details = document.createElement('p');
  details.className = 'comparison-values';
  details.textContent = description || `${value.toFixed(1)} vs ${average.toFixed(1)} (${formatDelta(difference)}).`;

  item.append(heading, details);
  list.appendChild(item);
  return { label, value, average, difference, comparison };
}

function comparisonOverallLabel(kind, base) {
  if (kind === 'global') return 'All bases';
  if (kind === 'region') return labelFor('region', base.region);
  if (kind === 'type') return labelFor('type', base.type);
  return '';
}

function buildInterpretationPoints(comparisons) {
  const traitEntries = comparisons.filter((entry) => ['Defensibility', 'Isolation', 'Sustainability'].includes(entry.label));
  const sorted = [...traitEntries].sort((a, b) => b.difference - a.difference);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const points = [];

  if (strongest) {
    points.push(`Excels most in ${strongest.label.toLowerCase()} (${strongest.comparison.label.toLowerCase()} vs type baseline, ${formatDelta(strongest.difference)}).`);
  }
  if (weakest && weakest !== strongest) {
    points.push(`Struggles most in ${weakest.label.toLowerCase()} (${weakest.comparison.label.toLowerCase()} vs type baseline, ${formatDelta(weakest.difference)}).`);
  }
  const overallEntry = comparisons.find((entry) => entry.label === 'All bases');
  if (overallEntry) {
    points.push(`Overall standing is ${overallEntry.comparison.label.toLowerCase()} compared with all listed bases (${formatDelta(overallEntry.difference)}).`);
  }

  return points.slice(0, 3);
}

function renderComparisonInsight(comparisons) {
  if (!elements.comparisonInsight || !elements.comparisonInterpretationList) {
    return;
  }

  if (!Array.isArray(comparisons) || !comparisons.length) {
    elements.comparisonInsight.hidden = true;
    elements.comparisonInsight.textContent = '';
    elements.comparisonInterpretationList.innerHTML = '';
    return;
  }

  elements.comparisonInsight.hidden = false;
  elements.comparisonInsight.textContent = 'This profile shows where this base gains advantage and where trade-offs may limit survival performance.';

  const points = buildInterpretationPoints(comparisons);
  elements.comparisonInterpretationList.innerHTML = '';
  points.forEach((point) => {
    const item = document.createElement('li');
    item.className = 'comparison-row';
    item.textContent = point;
    elements.comparisonInterpretationList.appendChild(item);
  });
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
  if (!elements.comparisonSection || !elements.comparisonOverallList || !elements.comparisonCategoryList || !elements.comparisonOverallTier || !elements.comparisonOverallExplanation) {
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
    appendComparisonItem(elements.comparisonOverallList, comparisonOverallLabel('global', base), overall, globalStats?.averages?.overall, `Compared with all bases: ${formatDelta(overall - (globalStats?.averages?.overall || 0))} (${overall.toFixed(1)} vs ${(globalStats?.averages?.overall || 0).toFixed(1)}).`),
    appendComparisonItem(elements.comparisonOverallList, comparisonOverallLabel('region', base), overall, regionStats?.averages?.overall, `Compared with region baseline: ${formatDelta(overall - (regionStats?.averages?.overall || 0))} (${overall.toFixed(1)} vs ${(regionStats?.averages?.overall || 0).toFixed(1)}).`),
    appendComparisonItem(elements.comparisonOverallList, comparisonOverallLabel('type', base), overall, typeStats?.averages?.overall, `Compared with type baseline: ${formatDelta(overall - (typeStats?.averages?.overall || 0))} (${overall.toFixed(1)} vs ${(typeStats?.averages?.overall || 0).toFixed(1)}).`)
  ].filter(Boolean);
  comparisonEntries.push(...overallEntries);

  if (scoreObject && typeStats?.averages) {
    Object.entries(SCORE_LABELS).forEach(([key, label]) => {
      const item = appendComparisonItem(elements.comparisonCategoryList, label, scoreObject[key], typeStats.averages[key], `${label}: ${formatDelta(scoreObject[key] - typeStats.averages[key])} vs type baseline (${scoreObject[key].toFixed(1)} vs ${typeStats.averages[key].toFixed(1)}).`);
      if (item) {
        comparisonEntries.push(item);
      }
    });
  }

  const hasContent = elements.comparisonOverallList.children.length > 0 || elements.comparisonCategoryList.children.length > 0;
  elements.comparisonSection.hidden = !hasContent;

  const globalEntry = comparisonEntries.find((entry) => entry.label === 'All bases');
  if (globalEntry) {
    elements.comparisonOverallTier.textContent = `${globalEntry.comparison.label} tier overall`;
    elements.comparisonOverallExplanation.textContent = `This base is ${globalEntry.comparison.label.toLowerCase()} against the full directory, with the numbers below showing secondary score deltas.`;
  }

  elements.comparisonOverallBlock.hidden = elements.comparisonOverallList.children.length === 0;
  elements.comparisonStrengthBlock.hidden = elements.comparisonCategoryList.children.length === 0;
  elements.comparisonInterpretationBlock.hidden = !hasContent;
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

function getSlugFromPathname(pathname) {
  if (typeof pathname !== 'string') {
    return '';
  }

  const pathSegment = pathname
    .split('/')
    .filter(Boolean)
    .pop() || '';

  if (!pathSegment || pathSegment.toLowerCase() === 'base.html') {
    return '';
  }

  return decodeURIComponent(pathSegment);
}

function renderSimilarBases(base, discovery, params) {
  if (!elements.similarSection || !elements.similarList) {
    return;
  }

  const similarEntries = discovery?.similarByBase?.[base.slug];
  if (!Array.isArray(similarEntries) || similarEntries.length === 0) {
    elements.similarSection.hidden = true;
    return;
  }

  elements.similarList.innerHTML = '';

  similarEntries.slice(0, 3).forEach((item) => {
    const li = document.createElement('li');
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

    li.append(link, scoreMeta);
    if (tags.length) {
      li.appendChild(tagRow);
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
  renderHero(base);
  renderSummary(base);
  renderHeroTraits(base);
  renderUseCaseAndRisk(base);
  renderScore(base);
  renderRankingPosition(base, rankings);
  renderComparison(base, stats);
  renderSurvivalProfile(base);
  renderRealityCheck(base);
  renderSimilarBases(base, discovery, params);
  elements.status.textContent = '';
  elements.notFound.hidden = true;
  elements.detail.hidden = false;
}

async function loadBase() {
  const params = new URLSearchParams(window.location.search);
  const slug = slugHelper?.getBaseSlugFromLocation ? slugHelper.getBaseSlugFromLocation(window.location) : (params.get('slug') || getSlugFromPathname(window.location.pathname));

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
