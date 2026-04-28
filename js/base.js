const DATA_URL = './data/bases-index.json';
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
  scoreBadges: document.getElementById('base-score-badges'),
  scoreSummary: document.getElementById('base-score-summary'),
  scoreList: document.getElementById('base-score-list'),
  scoreInterpretation: document.getElementById('base-score-interpretation'),
  rankingSection: document.getElementById('ranking-section'),
  rankingList: document.getElementById('ranking-list'),
  comparisonSection: document.getElementById('comparison-section'),
  comparisonInsight: document.getElementById('comparison-insight'),
  comparisonOverallList: document.getElementById('comparison-overall-list'),
  comparisonCategoryList: document.getElementById('comparison-category-list'),
  similarSection: document.getElementById('similar-section'),
  similarList: document.getElementById('similar-bases-list'),
  similarExploreLink: document.getElementById('similar-explore-link'),
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
  const strengths = getNonEmptyStringArray(base?.strengths ?? base?.description?.strengths);
  const weaknesses = getNonEmptyStringArray(base?.weaknesses ?? base?.description?.weaknesses);

  return {
    summary,
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
    const sentence = isNonEmptyString(description.summary)
      ? `${description.summary.trim().split(/(?<=[.!?])\s+/)[0]}`
      : '';
    elements.descriptionAnalysis.hidden = !sentence;
    elements.descriptionAnalysis.textContent = sentence;
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

function getStrengthWeakness(scoreObject) {
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
  return {
    topTwo,
    topEntry: topTwoEntries[0] ?? null,
    weakEntry: bottomCandidates[0] ?? null
  };
}

function getTierBadge(overall) {
  if (!isValidScoreValue(overall)) {
    return null;
  }
  if (overall >= 9) return 'Elite';
  if (overall >= 8) return 'Exceptional';
  if (overall >= 7) return 'Strong';
  if (overall >= 6) return 'Viable';
  if (overall >= 4) return 'Fragile';
  return 'Non-viable';
}

function getIdentityBadge(scoreObject, overall) {
  const defensibility = scoreObject?.defensibility ?? 0;
  const isolation = scoreObject?.isolation ?? 0;
  const sustainability = scoreObject?.sustainability ?? 0;
  const values = [defensibility, isolation, sustainability].filter(isValidScoreValue);
  if (overall < 4 || values.every((value) => value < 4)) {
    return 'Trap';
  }
  if (sustainability < 5) {
    return 'Fragile';
  }
  if (isolation >= 8 && sustainability >= 8) {
    return 'Long-term';
  }
  if (defensibility >= 8 && isolation >= 8) {
    return 'Defensive';
  }
  const spread = Math.max(...values) - Math.min(...values);
  if (spread <= 1.25) {
    return 'Balanced';
  }
  return 'Balanced';
}

function getTraitBadges(scoreObject) {
  const badges = [];
  if (scoreObject?.defensibility >= 8) badges.push('High defence');
  if (scoreObject?.isolation >= 8) badges.push('High isolation');
  if (scoreObject?.sustainability >= 8) badges.push('High sustainability');
  return badges.slice(0, 2);
}

function renderScoreBadges(scoreObject, overall) {
  if (!elements.scoreBadges) {
    return;
  }

  elements.scoreBadges.innerHTML = '';
  const tier = getTierBadge(overall);
  const identity = getIdentityBadge(scoreObject, overall);
  const traits = getTraitBadges(scoreObject);
  const badges = [
    tier ? { text: tier, tone: 'tier' } : null,
    identity ? { text: identity, tone: 'identity' } : null,
    ...traits.map((trait) => ({ text: trait, tone: 'trait' }))
  ].filter(Boolean).slice(0, 4);

  badges.forEach((badge) => {
    const pill = document.createElement('span');
    pill.className = `badge badge-${badge.tone}`;
    pill.textContent = badge.text;
    elements.scoreBadges.appendChild(pill);
  });

  elements.scoreBadges.hidden = badges.length === 0;
}

function renderScoreSummary(scoreObject) {
  if (!elements.scoreSummary) {
    return;
  }

  const rankedScores = Object.entries(scoreObject)
    .filter(([key, value]) => SCORE_LABELS[key] && isValidScoreValue(value))
    .sort((a, b) => b[1] - a[1]);
  const topTwo = rankedScores.slice(0, 2).map(([key]) => SCORE_LABELS[key]);
  const weakest = rankedScores.length ? SCORE_LABELS[rankedScores[rankedScores.length - 1][0]] : '';
  const line = topTwo.length
    ? `Top: ${topTwo.join(' • ')}\nWeakest: ${weakest}`
    : '';
  elements.scoreSummary.textContent = line;
  elements.scoreSummary.hidden = !line;
}

function renderScoreInterpretation(scoreObject) {
  if (!elements.scoreInterpretation) {
    return;
  }
  const strengths = getStrengthWeakness(scoreObject);
  const dominant = strengths.topEntry ? `${SCORE_LABELS[strengths.topEntry[0]].toLowerCase()} (${strengths.topEntry[1].toFixed(1)})` : 'core strengths';
  const constraint = strengths.weakEntry ? `${SCORE_LABELS[strengths.weakEntry[0]].toLowerCase()} (${strengths.weakEntry[1].toFixed(1)})` : 'exposure';
  elements.scoreInterpretation.textContent = `Built around ${dominant}, with ${constraint} as the key constraint.`;
  elements.scoreInterpretation.hidden = false;
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
  const content = isNonEmptyString(realityCheck)
    ? realityCheck.trim().split(/(?<=[.!?])\s+/)[0]
    : '';

  elements.realityCheckSection.hidden = !content;
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
    elements.scoreSummary.hidden = true;
    elements.scoreList.hidden = true;
    elements.scoreInterpretation.hidden = true;
    return;
  }

  elements.scoreEmpty.hidden = true;
  elements.scoreOverall.hidden = overall === null;
  if (overall !== null) {
    elements.scoreOverall.textContent = `${overall.toFixed(1)}/10`;
  }

  elements.scoreList.hidden = !scoreObject;
  if (!scoreObject) {
    elements.scoreBadges.hidden = true;
    elements.scoreSummary.hidden = true;
    elements.scoreInterpretation.hidden = true;
    return;
  }

  renderScoreBreakdown(scoreObject);
  renderScoreBadges(scoreObject, overall);
  renderScoreSummary(scoreObject);
  renderScoreInterpretation(scoreObject);
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

function appendComparisonItem(list, label, value, average) {
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

  const rowLabel = document.createElement('span');
  rowLabel.className = 'comparison-label';
  rowLabel.textContent = label;

  const judgement = document.createElement('span');
  judgement.className = `comparison-judgement comparison-judgement-${comparison.tone}`;
  judgement.textContent = `${comparison.marker} ${comparison.label}`;

  const values = document.createElement('span');
  values.className = 'comparison-values';
  values.textContent = `${value.toFixed(1)} vs ${average.toFixed(1)}`;

  const bar = document.createElement('span');
  bar.className = 'comparison-bar';
  bar.title = `Base score ${value.toFixed(1)} vs benchmark ${average.toFixed(1)}`;
  bar.setAttribute('aria-label', `Base score ${value.toFixed(1)} out of 10. Benchmark ${average.toFixed(1)} out of 10.`);
  const barFill = document.createElement('span');
  barFill.className = 'comparison-bar-fill';
  barFill.style.width = `${Math.max(0, Math.min(100, (value / 10) * 100))}%`;
  barFill.setAttribute('aria-hidden', 'true');
  const barMarker = document.createElement('span');
  barMarker.className = 'comparison-bar-marker';
  barMarker.style.left = `${Math.max(0, Math.min(100, (average / 10) * 100))}%`;
  barMarker.title = `Benchmark: ${average.toFixed(1)}`;
  barMarker.setAttribute('aria-hidden', 'true');
  bar.append(barFill, barMarker);

  item.append(rowLabel, judgement, values, bar);
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
  if (!elements.comparisonInsight) {
    return;
  }

  if (!Array.isArray(comparisons) || !comparisons.length) {
    elements.comparisonInsight.hidden = true;
    elements.comparisonInsight.textContent = '';
    return;
  }

  const overallEntry = comparisons.find((entry) => entry.label.includes('Against all bases'));
  const traitEntries = comparisons.filter((entry) => !entry.label.startsWith('Against '));
  const weakestTrait = traitEntries.reduce((worst, current) => (!worst || current.difference < worst.difference ? current : worst), null);

  if (!overallEntry) {
    elements.comparisonInsight.hidden = true;
    elements.comparisonInsight.textContent = '';
    return;
  }

  const sentence = weakestTrait
    ? `${overallEntry.comparison.label} overall • Weakest: ${weakestTrait.label}`
    : `${overallEntry.comparison.label} overall`;
  elements.comparisonInsight.hidden = false;
  elements.comparisonInsight.textContent = sentence;
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
      text: `Top ${topPercent}% globally`,
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
      text: `Top ${typeEntry.rank} in ${typeLabel}`,
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
    appendComparisonItem(elements.comparisonOverallList, comparisonOverallLabel('global', base), overall, globalStats?.averages?.overall),
    appendComparisonItem(elements.comparisonOverallList, comparisonOverallLabel('region', base), overall, regionStats?.averages?.overall),
    appendComparisonItem(elements.comparisonOverallList, comparisonOverallLabel('type', base), overall, typeStats?.averages?.overall)
  ].filter(Boolean);
  comparisonEntries.push(...overallEntries);

  if (scoreObject && typeStats?.averages) {
    Object.entries(SCORE_LABELS).forEach(([key, label]) => {
      const item = appendComparisonItem(elements.comparisonCategoryList, label, scoreObject[key], typeStats.averages[key]);
      if (item) {
        comparisonEntries.push(item);
      }
    });
  }

  const hasContent = elements.comparisonOverallList.children.length > 0 || elements.comparisonCategoryList.children.length > 0;
  elements.comparisonSection.hidden = !hasContent;
  renderComparisonInsight(hasContent ? comparisonEntries : []);
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
    scoreMeta.textContent = `${item.overall.toFixed(1)}/10 • ${labelFor('region', item.region)} • ${labelFor('type', item.type)}`;

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
  elements.meta.textContent = `${labelFor('type', base.type)} • ${labelFor('region', base.region)}`;
  renderMetaRow(base);
  renderHero(base);
  renderSummary(base);
  renderVerdict(base);
  renderDescription(base);
  renderScore(base);
  renderRankingPosition(base, rankings);
  renderComparison(base, stats);
  renderSimilarBases(base, discovery, params);
  renderSurvivalProfile(base);
  renderUseCaseAndRisk(base);
  renderRealityCheck(base);
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
    const [basesResponse, statsResponse, rankingsResponse, discoveryResponse] = await Promise.all([
      fetch(DATA_URL),
      fetch(STATS_URL),
      fetch(RANKINGS_URL),
      fetch(DISCOVERY_URL)
    ]);
    if (!basesResponse.ok) {
      throw new Error(`Failed to load bases data (${basesResponse.status})`);
    }

    const bases = await basesResponse.json();
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
