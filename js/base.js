const DATA_URL = '/data/bases-index.json';
const LEGACY_DATA_URL = '/data/bases.json';
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

const V2_PILOT_BASES = {
  'cheyenne-mountain-complex': {
    overall: 9.0,
    rankLabel: 'Elite',
    defensibility: 10.0,
    isolation: 6.9,
    sustainability: 7.3,
    pillarWeights: { defensibility: 30, isolation: 25, sustainability: 45 },
    timeline: [
      { stage: 'Initial Collapse', timeframe: '0–30 days', score: 9.8, label: 'Exceptional', explanation: 'Hardening, access control and engineered redundancy make the first month highly survivable if entry discipline holds.', risk: 'Early failure would come from command breakdown or unmanaged intake, not from the site envelope.' },
      { stage: 'Stabilisation', timeframe: '30 days–1 year', score: 8.8, label: 'Strong', explanation: 'The complex can run as a controlled refuge while stored supplies, water systems and power infrastructure remain maintained.', risk: 'Specialist maintenance and replacement parts become the critical constraint.' },
      { stage: 'Long-term', timeframe: '1+ years', score: 7.9, label: 'Strong', explanation: 'Survival remains plausible, but only with disciplined engineering crews and external food production or trade.', risk: 'Complex systems decay faster than local self-sufficiency can replace them.' }
    ],
    primaryFailureMode: 'Maintenance dependency',
    executiveVerdict: 'YES',
    narrative: 'Cheyenne Mountain is the benchmark for engineered survival infrastructure. It offers unmatched protection during the collapse phase, but its long-term weakness is dependence on specialist engineers, industrial supply chains and complex maintenance.',
    exceptional: 'Unmatched physical protection, hardened infrastructure and controlled access make the collapse phase safer here than almost anywhere else.',
    limitations: 'Food production, replacement parts and specialist engineering capacity are the limiting factors once outside supply chains fail.',
    bestSuitedFor: 'A disciplined technical group with stored provisions, maintenance expertise and a plan to secure food beyond the mountain.',
    recoveryPotential: { Agriculture: 2, Industry: 5, Education: 5, 'Trade / Logistics': 3, 'Population Growth': 2, 'Overall Recovery': 3 },
    metrics: [
      ['Physical Defence',10.0,15,'High','D','Deep mountain hardening and controlled portals give the site near-maximum assault resistance.'],
      ['Terrain Advantage',9.5,10,'High','D','Mountain cover, limited approaches and blast protection amplify the engineered defences.'],
      ['Isolation',6.9,15,'Medium','I','The site is protected, but it remains tied to a populated regional corridor.'],
      ['Food Security',3.2,15,'Low','S','Food survival depends on stores or external production rather than meaningful on-site agriculture.'],
      ['Water Security',8.8,10,'High','S','Engineered water systems and mountain siting provide strong baseline water resilience.'],
      ['Energy Independence',8.4,8,'High','S','Backup power capacity is strong, but fuel and technical upkeep still matter.'],
      ['Medical Capability',9.0,7,'High','S','Purpose-built infrastructure supports unusually strong medical and command continuity.'],
      ['Infrastructure',10.0,7,'High','S','Few locations match its hardened communications, utilities and internal systems.'],
      ['Maintainability',3.1,8,'Low','S','The same complexity that protects the site creates a major long-term maintenance burden.'],
      ['Population Capacity',5.4,3,'Medium','S','Capacity is useful for a selected group, not a large open settlement.'],
      ['Governance & Resilience',7.1,7,'Medium','S','Command structure can be strong if technical leadership and rationing authority remain intact.']
    ]
  },
  'andaman-islands': {
    overall: 8.6, rankLabel: 'Exceptional', defensibility: 7.8, isolation: 9.6, sustainability: 8.7,
    pillarWeights: { defensibility: 30, isolation: 25, sustainability: 45 },
    timeline: [
      { stage: 'Initial Collapse', timeframe: '0–30 days', score: 8.2, label: 'Strong', explanation: 'Distance from mainland collapse and distributed settlements reduce immediate pressure.', risk: 'Ports and local coordination must stay functional before panic disrupts movement.' },
      { stage: 'Stabilisation', timeframe: '30 days–1 year', score: 8.8, label: 'Strong', explanation: 'Fishing, freshwater, agriculture and inter-island dispersion create a resilient medium-term system.', risk: 'Failure comes if maritime logistics fragment between communities.' },
      { stage: 'Long-term', timeframe: '1+ years', score: 8.7, label: 'Strong', explanation: 'The island system can support durable recovery if governance protects water, crops and fleet capability.', risk: 'Storms, medical gaps and weak coordination can turn isolation into fragility.' }
    ],
    primaryFailureMode: 'Maritime coordination failure', executiveVerdict: 'YES',
    narrative: 'The Andaman Islands trade engineered protection for exceptional long-term resilience. Maritime isolation, freshwater, fishing, tropical agriculture and distributed settlements make them one of the strongest long-horizon survival systems, provided governance and inter-island mobility remain intact.',
    exceptional: 'High isolation combines with real food, water and settlement depth, so the score improves as the horizon lengthens.',
    limitations: 'The system depends on boats, port discipline, weather awareness and shared governance across separated communities.',
    bestSuitedFor: 'Maritime-capable groups that can defend harbours, maintain small craft and coordinate food and medical movement.',
    recoveryPotential: { Agriculture: 5, Industry: 3, Education: 3, 'Trade / Logistics': 4, 'Population Growth': 4, 'Overall Recovery': 4 },
    metrics: [
      ['Physical Defence',7.0,15,'Medium','D','Defence is distributed and coastal rather than bunker-like, but approaches are controllable.'],['Terrain Advantage',8.2,10,'High','D','Jungle, coastlines and dispersed settlements complicate hostile movement.'],['Isolation',9.6,15,'High','I','Maritime separation is the defining strength and sharply reduces overland threat exposure.'],['Food Security',8.5,15,'High','S','Fishing and tropical agriculture give the islands genuine long-term food depth.'],['Water Security',8.3,10,'High','S','Freshwater availability is strong if catchments and settlement loads are managed.'],['Energy Independence',6.8,8,'Medium','S','Local renewables and fuel rationing can work, but modern power systems remain limited.'],['Medical Capability',5.8,7,'Medium','S','Basic care is plausible, while advanced treatment and evacuation are weak points.'],['Infrastructure',6.7,7,'Medium','S','Ports, roads and settlements are useful but vulnerable to storms and deferred maintenance.'],['Maintainability',6.4,8,'Medium','S','Small craft, tools and simple systems are maintainable if spares are conserved.'],['Population Capacity',8.0,3,'High','S','The archipelago can disperse people better than compact fortress sites.'],['Governance & Resilience',7.4,7,'Medium','S','Survival depends on shared rules for fisheries, water, harbours and inter-island movement.']
    ]
  },
  'mont-saint-michel': {
    overall: 7.9, rankLabel: 'Strong', defensibility: 9.3, isolation: 6.8, sustainability: 5.9,
    pillarWeights: { defensibility: 30, isolation: 25, sustainability: 45 },
    timeline: [
      { stage: 'Initial Collapse', timeframe: '0–30 days', score: 9.2, label: 'Exceptional', explanation: 'Tidal separation, stone massing and limited access create an exceptional short-term refuge.', risk: 'Overcrowding and poor stock control can erase the defensive advantage.' },
      { stage: 'Stabilisation', timeframe: '30 days–1 year', score: 7.8, label: 'Strong', explanation: 'The site can remain defensible, but every essential supply must be tightly rationed or moved across a bottleneck.', risk: 'Food, water and medical throughput become the main operational hazard.' },
      { stage: 'Long-term', timeframe: '1+ years', score: 6.9, label: 'Moderate', explanation: 'Defence stays strong, but the compact footprint cannot support a large self-reliant settlement.', risk: 'Long-term survival fails through sustainment bottlenecks rather than assault.' }
    ],
    primaryFailureMode: 'Sustainment bottleneck', executiveVerdict: 'MAYBE',
    narrative: 'Mont Saint-Michel is an exceptional defensive refuge but a weak long-term settlement. Its tidal separation, compact footprint and visibility make assault difficult, but food, space, water, medical support and logistics become severe constraints over time.',
    exceptional: 'Few historic sites offer such a clear defensive edge: visible approaches, tidal timing and compact access points all help.',
    limitations: 'The same compactness that aids defence restricts food, water storage, sanitation, medical capacity and population growth.',
    bestSuitedFor: 'A small, disciplined group using the site as a defensive refuge while maintaining controlled mainland supply links.',
    recoveryPotential: { Agriculture: 1, Industry: 2, Education: 3, 'Trade / Logistics': 3, 'Population Growth': 1, 'Overall Recovery': 2 },
    metrics: [
      ['Physical Defence',9.3,15,'High','D','Stone fortification and narrow access make direct assault costly.'],['Terrain Advantage',9.0,10,'High','D','Tides, mudflats and visibility create strong natural warning and delay.'],['Isolation',6.8,15,'Medium','I','Isolation is intermittent and powerful, but not equivalent to remote island separation.'],['Food Security',3.8,15,'Low','S','The footprint cannot feed many people without mainland access.'],['Water Security',5.0,10,'Medium','S','Water can be managed for a small group, but storage and throughput are limiting.'],['Energy Independence',4.8,8,'Low','S','Local generation options are constrained by space, exposure and maintenance.'],['Medical Capability',4.5,7,'Low','S','Basic care is possible, but serious treatment depends on outside support.'],['Infrastructure',6.2,7,'Medium','S','Built fabric is durable, but modern utilities and sanitation become stressed.'],['Maintainability',5.0,8,'Medium','S','Stone structures endure, while access systems and utilities need regular upkeep.'],['Population Capacity',3.9,3,'Low','S','The site works for a small refuge, not a broad recovery community.'],['Governance & Resilience',5.6,7,'Medium','S','Rules can be enforced in a compact site, but scarcity can destabilise them quickly.']
    ]
  }
};

function getV2Pilot(base) {
  // The experimental detail layout is disabled for the three pilot bases so
  // they render through the same production template as every other base.
  return null;
}


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
  compareSection: document.getElementById('detail-compare-section'),
  compareForm: document.getElementById('detail-compare-form'),
  compareSelect: document.getElementById('detail-compare-select'),
  heroSection: document.getElementById('hero-section'),
  heroImage: document.getElementById('base-hero-image'),
  scoreSection: document.getElementById('score-section'),
  scoreEmpty: document.getElementById('score-empty'),
  scoreOverall: document.getElementById('base-score-overall'),
  scoreRank: document.getElementById('base-score-rank'),
  scoreBadges: document.getElementById('base-score-badges'),
  scoreList: document.getElementById('base-score-list'),
  rankingSection: document.getElementById('ranking-section'),
  rankingList: document.getElementById('ranking-list'),
  similarSection: document.getElementById('similar-section'),
  similarList: document.getElementById('similar-bases-list'),
  similarExploreLink: document.getElementById('similar-explore-link'),
  survivalAssessmentSection: document.getElementById('survival-assessment-section'),
  survivalCharacteristicsSection: document.getElementById('survival-characteristics-section'),
  survivalCharacteristicsGrid: document.getElementById('survival-characteristics-grid'),
  survivalProfileSection: document.getElementById('survival-profile-section'),
  survivalTimelineCards: document.getElementById('survival-timeline-cards'),
  realityCheckRow: document.getElementById('base-reality-check-row'),
  realityCheckText: document.getElementById('base-reality-check')
};

const slugHelper = window.baseSlugHelper;

function showNotFound(message = "We couldn't find a base for this link.") {
  if (elements.status) elements.status.textContent = '';
  if (elements.detail) elements.detail.hidden = true;
  const messageElement = elements.notFound?.querySelector('p');
  if (messageElement) messageElement.textContent = message;
  if (elements.notFound) elements.notFound.hidden = false;
}

function showLoadError() {
  showNotFound('Base details could not be loaded. Please try again later.');
}

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

function renderCompareCard(base, bases) {
  if (!elements.compareSection || !elements.compareForm || !elements.compareSelect) {
    return;
  }

  const currentSlug = slugHelper?.getPreferredSlug ? slugHelper.getPreferredSlug(base) : base.slug;
  const options = (Array.isArray(bases) ? bases : [])
    .filter((entry) => (slugHelper?.getPreferredSlug ? slugHelper.getPreferredSlug(entry) : entry.slug) !== currentSlug)
    .sort((a, b) => a.name.localeCompare(b.name));

  elements.compareSelect.innerHTML = '<option value="">Select a base</option>';
  options.forEach((entry) => {
    const option = document.createElement('option');
    option.value = slugHelper?.getPreferredSlug ? slugHelper.getPreferredSlug(entry) : entry.slug;
    option.textContent = entry.name;
    elements.compareSelect.appendChild(option);
  });

  elements.compareForm.onsubmit = (event) => {
    event.preventDefault();
    const selectedSlug = elements.compareSelect.value;
    if (!selectedSlug) {
      elements.compareSelect.focus();
      return;
    }
    window.location.href = slugHelper?.getCompareUrl
      ? slugHelper.getCompareUrl(currentSlug, selectedSlug)
      : `/base/${encodeURIComponent(currentSlug)}/vs/${encodeURIComponent(selectedSlug)}`;
  };

  elements.compareSection.hidden = options.length === 0;
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
    itemLabel.textContent = label;
    const scoreValue = document.createElement('span');
    scoreValue.className = `score-value ${scoreToneClass(scoreObject[key])}`.trim();
    scoreValue.textContent = `${scoreObject[key].toFixed(1)}/10`;
    const meter = document.createElement('span');
    meter.className = 'score-list-meter';
    meter.setAttribute('aria-hidden', 'true');
    const meterFill = document.createElement('span');
    meterFill.className = `score-list-meter-fill ${scoreToneClass(scoreObject[key])}`.trim();
    meterFill.style.width = `${Math.max(0, Math.min(10, scoreObject[key])) * 10}%`;
    meter.appendChild(meterFill);
    item.append(itemLabel, scoreValue, meter);
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


function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getPillarBullets(base, pillarKey) {
  const characteristic = base?.comparisonScores?.[pillarKey];
  const rationale = firstSentence(characteristic?.rationale);
  const description = getStructuredDescription(base);
  const fallback = {
    defensibility: description.strengths,
    isolation: description.strengths,
    sustainability: description.weaknesses
  }[pillarKey] || [];

  return [rationale, ...fallback.map(firstSentence)]
    .filter(Boolean)
    .filter((item, index, array) => array.findIndex((other) => normalizeComparisonText(other) === normalizeComparisonText(item)) === index)
    .slice(0, 3);
}

function buildGenericAssessmentContent(base) {
  const description = getStructuredDescription(base);
  const useCaseAndRisk = getUseCaseAndRisk(base);
  const verdict = getVerdict(base);
  const scores = getScoreObject(base) || {};
  const bottomLine = buildIntroSummary(base) || description.summary;
  const headline = firstSentence(bottomLine) || `${base?.name || 'This base'} survival assessment.`;
  const strengths = description.strengths.join('<br>');
  const weaknesses = description.weaknesses.join('<br>');
  const bestUse = firstSentence(verdict.bestUseCase) || firstSentence(useCaseAndRisk.bestUseCase);
  const keyRisk = firstSentence(useCaseAndRisk.keyRisk) || firstSentence(verdict.failureMode);
  const weakestPillar = Object.entries(scores)
    .filter(([key, value]) => SCORE_LABELS[key] && isValidScoreValue(value))
    .sort(([, a], [, b]) => a - b)[0]?.[0];
  const strongestPillar = Object.entries(scores)
    .filter(([key, value]) => SCORE_LABELS[key] && isValidScoreValue(value))
    .sort(([, a], [, b]) => b - a)[0]?.[0];
  const tradeoffSource = firstSentence(description.weaknesses[0]) || firstSentence(keyRisk) || 'its weakest long-term constraint must be managed carefully.';
  const tradeoff = `${base?.name || 'This base'} trades ${strongestPillar ? SCORE_LABELS[strongestPillar].toLowerCase() : 'its strongest advantages'} for pressure around ${weakestPillar ? SCORE_LABELS[weakestPillar].toLowerCase() : 'its weakest constraints'}. ${tradeoffSource}`;
  const failureTitle = keyRisk || (weakestPillar ? `${SCORE_LABELS[weakestPillar]} failure` : 'Survival failure');
  const failureBody = firstSentence(useCaseAndRisk.keyRisk) || firstSentence(verdict.failureMode) || firstSentence(description.weaknesses[0]) || 'The most likely failure mode comes from the base’s existing weaknesses overtaking its survival advantages.';

  return {
    headline,
    bottomLine,
    pillars: [
      { title: 'Defensibility', question: 'Can the community survive the outbreak?', scoreKey: 'defensibility', bullets: getPillarBullets(base, 'defensibility') },
      { title: 'Isolation', question: 'Can the community avoid outside threat and pressure?', scoreKey: 'isolation', bullets: getPillarBullets(base, 'isolation') },
      { title: 'Sustainability', question: 'Can the community sustain itself long term?', scoreKey: 'sustainability', bullets: getPillarBullets(base, 'sustainability') }
    ],
    tradeoff: [tradeoff],
    failureTitle,
    failureBody,
    evidence: [
      ['Strengths', strengths],
      ['Weaknesses', weaknesses],
      ['Best Use', bestUse],
      ['Key Risk', keyRisk]
    ]
  };
}

function renderCheyenneSurvivalAssessment(base) {
  if (!elements.survivalAssessmentSection) {
    return false;
  }

  const canonicalAssessmentContent = {
    'cheyenne-mountain-complex': {
      headline: 'Exceptionally secure and built to last—but its greatest risk is the systems that keep it alive.',
      bottomLine: 'Cheyenne Mountain is engineered for survival. Deep underground, heavily protected and self-contained. The challenge is long-term maintenance. If critical systems fail and cannot be repaired, the mountain becomes a trap instead of a sanctuary.',
      pillars: [
        { title: 'Defensibility', question: 'Can the community survive the outbreak?', scoreKey: 'defensibility', bullets: ['Extremely limited access', 'Hardened infrastructure', 'Excellent defensive position'] },
        { title: 'Isolation', question: 'Can the community avoid outside threat and pressure?', scoreKey: 'isolation', bullets: ['Remote subterranean location', 'Minimal external visibility', 'Not completely cut off'] },
        { title: 'Sustainability', question: 'Can the community sustain itself long term?', scoreKey: 'sustainability', bullets: ['Strong water security', 'Advanced infrastructure', 'High maintenance burden'] }
      ],
      tradeoff: [
        'Cheyenne Mountain solves almost every short-term survival problem.',
        'Its greatest weakness is that it replaces zombie risk with infrastructure risk.',
        'If critical systems fail and cannot be repaired, the community becomes increasingly dependent on skills and spare parts that may no longer exist.'
      ],
      failureTitle: 'Infrastructure failure',
      failureBody: 'Complex systems, specialised parts and skilled maintenance requirements become unsustainable over time.',
      evidence: null
    }
  }[base?.slug];

  const assessmentContent = canonicalAssessmentContent || buildGenericAssessmentContent(base);
  elements.survivalAssessmentSection.hidden = false;

  const scores = getScoreObject(base) || {};
  const description = getStructuredDescription(base);
  const useCaseAndRisk = getUseCaseAndRisk(base);
  const verdict = getVerdict(base);
  const evidenceCards = assessmentContent.evidence || [
    ['Strengths', description.strengths.slice(0, 2).join(' ')],
    ['Weaknesses', description.weaknesses.slice(0, 2).join(' ')],
    ['Best Use', firstSentence(verdict.bestUseCase) || firstSentence(useCaseAndRisk.bestUseCase)],
    ['Key Risk', firstSentence(useCaseAndRisk.keyRisk) || firstSentence(verdict.failureMode)]
  ];
  const pillarCards = assessmentContent.pillars.map((card) => ({ ...card, score: scores[card.scoreKey] }));

  elements.survivalAssessmentSection.innerHTML = `
    <div class="survival-assessment-row survival-assessment-top-row">
      <div class="survival-assessment-bottom-line">
        <p class="survival-assessment-label">The bottom line</p>
        <h2>${escapeHtml(assessmentContent.headline)}</h2>
        <p>${escapeHtml(assessmentContent.bottomLine)}</p>
      </div>
      <div class="survival-assessment-pillars">
        <p class="survival-assessment-label">The three survival pillars</p>
        <div class="survival-assessment-pillar-grid">
          ${pillarCards.map((card) => `
            <article class="survival-assessment-card survival-assessment-pillar-card">
              <div class="survival-assessment-card-heading">
                <h3>${escapeHtml(card.title)}</h3>
                <p class="survival-assessment-score ${scoreToneClass(card.score)}">${isValidScoreValue(card.score) ? card.score.toFixed(1) : '—'}<span>/10</span></p>
              </div>
              <p class="survival-assessment-question">${escapeHtml(card.question)}</p>
              <ul>${card.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
            </article>
          `).join('')}
        </div>
      </div>
    </div>
    <div class="survival-assessment-row survival-assessment-tradeoff-row">
      <article class="survival-assessment-card survival-assessment-text-card">
        <p class="survival-assessment-label">The big trade-off</p>
        ${assessmentContent.tradeoff.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
      </article>
      <article class="survival-assessment-card survival-assessment-text-card">
        <p class="survival-assessment-label">What would most likely cause failure?</p>
        <h3>${escapeHtml(assessmentContent.failureTitle)}</h3>
        <p>${escapeHtml(assessmentContent.failureBody)}</p>
      </article>
    </div>
    <div class="survival-assessment-row survival-assessment-evidence-row">
      ${evidenceCards.filter(([, value]) => value).map(([label, value]) => `<article class="survival-assessment-card survival-assessment-evidence-card"><p class="survival-assessment-label">${escapeHtml(label)}</p><p>${String(value).split('<br>').map(escapeHtml).join('<br>')}</p></article>`).join('')}
    </div>
  `;
  return true;
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
    const bullets = getSurvivalCardBullets(index, tone, base?.slug);
    const failureLine = getFailureLine(index, primaryRisk);

    return `
      <article class="survival-card" data-status="${tone}">
        <span class="survival-card-step">0${index + 1}</span>
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

function getSurvivalCardBullets(index, tone, slug) {
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

  const bullets = [...(phaseBullets[tone][index] || phaseBullets.moderate[index])];
  if (slug === 'isle-of-eigg-village' && index === 2 && tone === 'strong') {
    bullets[1] = '✔ Core systems remain sustainable';
  }
  return bullets;
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
    const icon = document.createElement('span');
    icon.className = 'survival-characteristic-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = getSurvivalCharacteristicIcon(characteristic.key);
    const labelText = document.createElement('span');
    labelText.textContent = characteristic.label;
    label.append(icon, labelText);

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

function getSurvivalCharacteristicIcon(key) {
  return {
    exposure: '◐',
    maintenanceBurden: '⚙',
    populationCapacity: '▦',
    resourceSecurity: '◆'
  }[key] || '•';
}

function renderScore(base) {
  const pilot = getV2Pilot(base);
  const scoreObject = pilot
    ? { defensibility: pilot.defensibility, isolation: pilot.isolation, sustainability: pilot.sustainability }
    : getScoreObject(base);
  const overall = pilot ? pilot.overall : computeOverallScore(base);

  elements.scoreSection.hidden = false;

  if (!scoreObject && overall === null) {
    elements.scoreEmpty.hidden = false;
    elements.scoreOverall.hidden = true;
    if (elements.scoreRank) {
      elements.scoreRank.hidden = true;
      elements.scoreRank.textContent = '';
    }
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

  if (elements.scoreRank) {
    const rankLabel = pilot?.rankLabel || (slugHelper?.getScoreTierBadge ? slugHelper.getScoreTierBadge(base) : null);
    elements.scoreRank.textContent = rankLabel || '';
    elements.scoreRank.hidden = !rankLabel;
  }

  elements.scoreList.hidden = !scoreObject;
  if (!scoreObject) {
    elements.scoreBadges.hidden = true;
    return;
  }

  renderScoreBreakdown(scoreObject);
  if (elements.scoreBadges) {
    elements.scoreBadges.innerHTML = '';
    elements.scoreBadges.hidden = true;
  }
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

function isReservedBaseSlug(value) {
  if (slugHelper?.isReservedBaseSlug) {
    return slugHelper.isReservedBaseSlug(value);
  }

  return String(value || '').trim().toLowerCase() === 'field-manual';
}

function getSlug() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('slug')) {
    const querySlug = params.get('slug');
    return isReservedBaseSlug(querySlug) ? null : querySlug;
  }

  const path = window.location.pathname.replace(/^\/|\/$/g, '');
  if (!path || path.toLowerCase() === 'base.html' || path.toLowerCase() === 'index.html') {
    return null;
  }

  const slug = decodeURIComponent(path.split('/').pop() || '') || null;
  return isReservedBaseSlug(slug) ? null : slug;
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

function formatV2Score(value) {
  return Number.isFinite(value) ? value.toFixed(1) : '—';
}

function renderV2Detail(base, rankings) {
  const pilot = getV2Pilot(base);
  document.querySelectorAll('.v2-detail-section').forEach((node) => node.remove());
  document.body.classList.toggle('base-detail-v2-active', Boolean(pilot));
  if (!pilot) return false;
  const globalRank = (rankings?.global || []).find((entry) => entry.slug === base.slug)?.rank;
  renderV2ScorePanel(pilot, globalRank);
  renderV2ExecutiveVerdict(pilot);
  renderV2OperationalAssessment(pilot);
  renderV2Timeline(pilot);
  renderV2InsightCards(pilot);
  renderV2IntelligenceReport(base, pilot);
  return true;
}

function appendV2Section(section) {
  const anchor = document.getElementById('survival-characteristics-section');
  anchor?.parentNode?.insertBefore(section, anchor);
}

function getMetricHighlightClass(score) {
  if (!Number.isFinite(score)) return '';
  if (score >= 8.8) return 'is-exceptional';
  if (score <= 4.2) return 'is-critical';
  return 'is-muted';
}

function sentenceLimit(text, max = 150) {
  if (!isNonEmptyString(text)) return '';
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  const clipped = trimmed.slice(0, max).replace(/\s+\S*$/, '').trim();
  return `${clipped}…`;
}

function renderV2ScorePanel(pilot, globalRank) {
  const section = document.createElement('section');
  section.className = 'content-section v2-detail-section v2-score-panel';
  section.setAttribute('aria-label', 'Survival score dossier');
  const pillars = [
    ['Defensibility', pilot.defensibility, pilot.pillarWeights.defensibility, 'Physical protection, access control, and terrain advantage.'],
    ['Isolation', pilot.isolation, pilot.pillarWeights.isolation, 'Separation from population pressure and uncontrolled approach routes.'],
    ['Sustainability', pilot.sustainability, pilot.pillarWeights.sustainability, 'Food, water, infrastructure, medical capacity, and maintainability.']
  ];
  section.innerHTML = `
    <div class="v2-score-lead">
      <p class="section-kicker">Overall Survival Score</p>
      <div class="v2-score-lockup">
        <p class="v2-overall-score ${scoreToneClass(pilot.overall)}">${formatV2Score(pilot.overall)}<span>/10</span></p>
        <div>
          <p class="v2-rank-label">${pilot.rankLabel}</p>
          <p class="v2-global-rank">${globalRank ? `Global Rank #${globalRank}` : 'Global Rank —'}</p>
          <p class="v2-score-note">Survival intelligence summary</p>
        </div>
      </div>
    </div>
    <div class="v2-score-fingerprint" aria-label="Survival score fingerprint">
      ${pillars.map(([name, score]) => `<div class="v2-fingerprint-row"><span>${name}</span><div class="v2-fingerprint-track"><i class="${scoreToneClass(score)}" style="width:${score * 10}%"></i></div><strong>${formatV2Score(score)}</strong></div>`).join('')}
    </div>
    <div class="v2-pillar-evidence" aria-label="Pillar score evidence">
      ${pillars.map(([name, score, weight, note]) => `<article class="v2-pillar-card">
        <div class="v2-pillar-top"><h3>${name}</h3><p class="v2-pillar-score ${scoreToneClass(score)}">${formatV2Score(score)}</p></div>
        <div class="v2-meter"><span class="${scoreToneClass(score)}" style="width:${score * 10}%"></span></div>
        <p class="v2-pillar-meaning">${pillarMeaning(name, score)}</p><p>${note}</p><span>Model weight ${weight}%</span>
      </article>`).join('')}
    </div>`;
  appendV2Section(section);
}

function pillarMeaning(name, score) {
  const high = score >= 8.5;
  const medium = score >= 6.5;
  if (name === 'Defensibility') return high ? 'Nearly impossible to assault' : medium ? 'Hard to approach and breach' : 'Defence requires active management';
  if (name === 'Isolation') return high ? 'Protected from population pressure' : medium ? 'Meaningful separation from threat corridors' : 'Exposure must be actively controlled';
  return high ? 'Long-term self sufficiency' : medium ? 'Viable with disciplined rationing' : 'Sustainment is the limiting factor';
}

function renderV2FailureBrief(pilot) {
  const section = document.createElement('section');
  section.className = 'content-section v2-detail-section v2-failure-brief';
  section.innerHTML = `
    <div>
      <p class="section-kicker">What kills you here</p>
      <h2>${pilot.primaryFailureMode}</h2>
    </div>
    <p>${pilot.limitations}</p>`;
  appendV2Section(section);
}

function renderV2ExecutiveVerdict(pilot) {
  const section = document.createElement('section');
  section.className = 'content-section v2-detail-section v2-executive-verdict';
  section.innerHTML = `
    <div class="v2-verdict-copy">
      <p class="section-kicker">Executive Verdict</p>
      <h2>Would I choose this base?</h2>
      <p class="v2-verdict-answer">${pilot.executiveVerdict}.</p>
      <p class="v2-verdict-summary">${pilot.narrative}</p>
    </div>
    <aside class="v2-failure-card">
      <p class="section-kicker">Primary failure mode</p>
      <h3>${pilot.primaryFailureMode}</h3>
      <p>${pilot.limitations}</p>
    </aside>`;
  appendV2Section(section);
}

function metricCategory(name) {
  if (['Physical Defence', 'Terrain Advantage', 'Isolation'].includes(name)) return 'Defence';
  if (['Food Security', 'Water Security', 'Energy Independence', 'Infrastructure'].includes(name)) return 'Resources';
  return 'Survivability';
}

function renderV2OperationalAssessment(pilot) {
  const section = document.createElement('section');
  section.className = 'content-section v2-detail-section v2-operational-section';
  const groups = ['Defence', 'Resources', 'Survivability'].map((category) => [category, pilot.metrics.filter(([name]) => metricCategory(name) === category)]);
  section.innerHTML = `
    <div class="v2-section-intro">
      <p class="section-kicker">Operational Assessment</p>
      <h3>The evidence behind the score</h3>
      <p>Grouped operational metrics show why the headline score holds, where it is fragile, and which constraints matter most.</p>
    </div>
    <div class="v2-operational-groups">
      ${groups.map(([category, metrics]) => `<section class="v2-operational-group"><h4>${category}</h4><div class="v2-operational-table">
        ${metrics.map(([name, score, weight, impact, pillar, explanation]) => `<article class="v2-operational-row ${getMetricHighlightClass(score)}">
          <div class="v2-metric-name"><strong>${name}</strong><span>${sentenceLimit(explanation, 118)}</span></div>
          <div class="v2-meter"><span class="${scoreToneClass(score)}" style="width:${score * 10}%"></span></div>
          <div class="v2-metric-score ${scoreToneClass(score)}">${formatV2Score(score)}</div>
          <div class="v2-metric-meta"><span class="impact-${impact.toLowerCase()}">${impact}</span><span>${pillar} pillar</span><span>${weight}% model weight</span></div>
        </article>`).join('')}
      </div></section>`).join('')}
    </div>`;
  appendV2Section(section);
}

function renderV2Timeline(pilot) {
  const section = document.createElement('section');
  section.className = 'content-section v2-detail-section v2-timeline-section';
  section.innerHTML = `
    <div class="v2-section-intro"><p class="section-kicker">Survival Timeline</p><h3>The survival story</h3><p>How conditions change from initial collapse through long-term isolation.</p></div>
    <div class="v2-timeline-grid">
      ${pilot.timeline.map((stage, index) => `<article class="v2-timeline-card">
        <p class="v2-step">Phase 0${index + 1}</p>
        <p class="v2-timeframe">${stage.timeframe}</p>
        <h4>${stage.stage}</h4>
        <p class="v2-timeline-score ${scoreToneClass(stage.score)}">${formatV2Score(stage.score)} <span>${stage.label}</span></p>
        <p>${stage.explanation}</p>
        <p class="v2-risk">Eventually: ${stage.risk}</p>
      </article>`).join('')}
    </div>`;
  appendV2Section(section);
}

function renderV2InsightCards(pilot) {
  const blocks = (count) => Array.from({ length: 5 }, (_, i) => `<span class="${i < count ? 'is-filled' : ''}"></span>`).join('');
  const recovery = Object.entries(pilot.recoveryPotential).map(([label, value]) => `<li><span>${label}</span><span class="v2-capability-bar" aria-label="${value} out of 5">${blocks(value)}</span></li>`).join('');
  const section = document.createElement('section');
  section.className = 'content-section v2-detail-section v2-insight-grid';
  section.innerHTML = `
    <article class="v2-wide-insight"><p class="section-kicker">Why this base works</p><h3>The score is built on this advantage</h3><p>${pilot.exceptional}</p></article>
    <article><p class="section-kicker">Trade-offs</p><h3>Key limitations</h3><p>${pilot.limitations}</p></article>
    <article><p class="section-kicker">Best suited for</p><h3>Best operating model</h3><p>${pilot.bestSuitedFor}</p></article>
    <article class="v2-recovery-card"><p class="section-kicker">Recovery</p><h3>Capability matrix</h3><ul class="v2-recovery-list">${recovery}</ul></article>`;
  appendV2Section(section);
}

function renderV2IntelligenceReport(base, pilot) {
  const sources = ['Military records', 'Satellite imagery', 'Topographic analysis', 'Historical documentation', 'Engineering assessment'];
  const section = document.createElement('section');
  section.className = 'content-section v2-detail-section v2-intel-report';
  section.innerHTML = `
    <div><p class="section-kicker">Intelligence Report</p><h3>${base.name} survival assessment</h3><p class="v2-report-lede">Assessment: ${pilot.narrative}</p><p class="v2-report-finding"><strong>Critical finding:</strong> ${pilot.primaryFailureMode} is the decisive long-term constraint.</p></div>
    <aside><span class="v2-confidence">High confidence</span><p>Confidence is supported by cross-checking the score against physical geography, built infrastructure and operational constraints.</p><div class="v2-source-tags">${sources.map((source) => `<span>${source}</span>`).join('')}</div></aside>`;
  appendV2Section(section);
}

function showBase(base, bases, params, rankings, discovery) {
  elements.name.textContent = base.name;
  applyDetailMetadata(base);
  renderMetaRow(base);
  renderCompareCard(base, bases);
  renderHero(base);
  const hasCheyenneAssessment = renderCheyenneSurvivalAssessment(base);
  const summaryPanel = document.querySelector('.base-summary-panel');
  if (summaryPanel) {
    summaryPanel.hidden = hasCheyenneAssessment;
  }
  renderSummary(base);
  renderHeroTraits(base);
  renderUseCaseAndRisk(base);
  renderScore(base);
  const isV2Pilot = renderV2Detail(base, rankings);
  if (elements.survivalCharacteristicsSection) {
    elements.survivalCharacteristicsSection.hidden = true;
  }
  renderRankingPosition(base, rankings);
  if (!isV2Pilot) {
    renderSurvivalProfile(base);
  } else {
    elements.survivalProfileSection.hidden = true;
  }
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
    const [bases, rankingsResponse, discoveryResponse] = await Promise.all([
      loadBasesData(),
      fetch(RANKINGS_URL),
      fetch(DISCOVERY_URL)
    ]);
    const rankings = rankingsResponse.ok ? await rankingsResponse.json() : null;
    const discovery = discoveryResponse.ok ? await discoveryResponse.json() : null;
    const matchedBase = slugHelper?.resolveBaseBySlug
      ? slugHelper.resolveBaseBySlug(bases, slug)
      : bases.find((base) => base.slug === slug);

    if (!matchedBase) {
      showNotFound();
      return;
    }

    showBase(matchedBase, bases, params, rankings, discovery);
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

function loadComparisonShell() {
  elements.status.textContent = 'Loading comparison...';

  fetch('/compare.html')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load comparison shell (${response.status})`);
      }
      return response.text();
    })
    .then((html) => {
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      const comparisonMain = parsed.querySelector('.comparison-page-main');

      if (!comparisonMain) {
        throw new Error('Comparison shell is missing its main content.');
      }

      document.title = parsed.title || document.title;
      document.body.innerHTML = parsed.body.innerHTML;

      const script = document.createElement('script');
      script.src = '/js/compare.js';
      script.defer = true;
      script.onerror = () => showLoadError();
      document.body.appendChild(script);
    })
    .catch((error) => {
      console.error(error);
      showLoadError();
    });
}

if (slugHelper?.isCompareRoute?.(window.location)) {
  loadComparisonShell();
} else if (
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
