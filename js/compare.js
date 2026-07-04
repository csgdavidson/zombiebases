const DATA_URL = '/data/bases-index.json';
const LEGACY_DATA_URL = '/data/bases.json';
const HERO_IMAGE_FALLBACK_URL = '/images/bases/placeholder.png';

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

const SCORE_ROWS = [
  { key: 'overall', label: 'Overall', source: 'overall', higherIsBetter: true },
  { key: 'defensibility', label: 'Defensibility', source: 'category', higherIsBetter: true },
  { key: 'sustainability', label: 'Sustainability', source: 'category', higherIsBetter: true },
  { key: 'isolation', label: 'Isolation', source: 'category', higherIsBetter: true },
  { key: 'exposure', label: 'Exposure', source: 'comparison', higherIsBetter: true },
  { key: 'maintenanceBurden', label: 'Maintenance Burden', source: 'comparison', higherIsBetter: true },
  { key: 'populationCapacity', label: 'Population Capacity', source: 'comparison', higherIsBetter: true },
  { key: 'resourceSecurity', label: 'Resource Security', source: 'comparison', higherIsBetter: true }
];

const WINNER_CARDS = [
  { title: 'Best Defended', keys: ['defensibility'] },
  { title: 'Best Long-Term Survivor', keys: ['sustainability', 'resourceSecurity', 'populationCapacity'] },
  { title: 'Lowest Exposure', keys: ['exposure'] },
  { title: 'Lowest Maintenance Burden', keys: ['maintenanceBurden'] },
  { title: 'Largest Population Capacity', keys: ['populationCapacity'] },
  { title: 'Strongest Resource Security', keys: ['resourceSecurity'] }
];

const VERDICTS = [
  {
    title: 'Early Outbreak Winner',
    keys: ['defensibility', 'isolation', 'exposure'],
    reason: (winner) => `${winner.name}'s balance of defensibility, isolation, and exposure control makes it harder to overrun during the first phase of collapse.`
  },
  {
    title: 'Long-Term Winner',
    keys: ['sustainability', 'resourceSecurity', 'populationCapacity'],
    reason: (winner) => `${winner.name}'s long-term profile is stronger because sustainability, resource security, and settlement capacity carry more weight after the first wave passes.`
  },
  {
    title: 'Low-Maintenance Winner',
    keys: ['maintenanceBurden'],
    reason: (winner) => `${winner.name} is the easier base to keep functioning because its maintenance score indicates the lower upkeep burden.`
  },
  {
    title: 'Best Overall',
    keys: ['overall'],
    reason: (winner) => `${winner.name} has the higher overall score across the full survival profile.`
  }
];

const elements = {
  status: document.getElementById('compare-status'),
  page: document.getElementById('compare-page'),
  setup: document.getElementById('compare-setup'),
  notFound: document.getElementById('compare-not-found'),
  notFoundMessage: document.getElementById('compare-not-found-message'),
  title: document.getElementById('comparison-title'),
  heroA: document.getElementById('hero-base-a'),
  heroB: document.getElementById('hero-base-b'),
  scoreBaseA: document.getElementById('score-base-a'),
  scoreBaseB: document.getElementById('score-base-b'),
  overallSummary: document.getElementById('overall-winner-summary'),
  scoreBody: document.getElementById('score-comparison-body'),
  winners: document.getElementById('category-winners'),
  advantages: document.getElementById('biggest-advantages'),
  verdicts: document.getElementById('verdict-list'),
  compareCurrentPrimary: document.getElementById('compare-current-primary'),
  compareCurrentSecondary: document.getElementById('compare-current-secondary'),
  compareCurrentButton: document.getElementById('compare-current-button'),
  setupPrimary: document.getElementById('compare-setup-primary'),
  setupSecondary: document.getElementById('compare-setup-secondary'),
  setupButton: document.getElementById('compare-setup-button')
};

const slugHelper = window.baseSlugHelper;

function toTitleCaseSlug(value) {
  return String(value || '')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function labelFor(kind, value) {
  return LABELS[kind][value] ?? toTitleCaseSlug(value);
}

function isValidScoreValue(value) {
  return Number.isFinite(value);
}

function formatScore(value) {
  return isValidScoreValue(value) ? value.toFixed(1) : '—';
}

function formatDifference(value) {
  if (!isValidScoreValue(value) || Math.abs(value) < 0.05) {
    return 'Even';
  }
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}`;
}

function scoreToneClass(value) {
  if (!isValidScoreValue(value)) return '';
  if (value >= 8) return 'score-high';
  if (value >= 5) return 'score-medium';
  return 'score-low';
}

function preferredSlugFor(baseOrSlug) {
  return slugHelper?.getPreferredSlug ? slugHelper.getPreferredSlug(baseOrSlug) : (typeof baseOrSlug === 'string' ? baseOrSlug : baseOrSlug?.slug || '');
}

function compareUrl(slugA, slugB) {
  return slugHelper?.getCompareUrl ? slugHelper.getCompareUrl(slugA, slugB) : `/base/${encodeURIComponent(slugA)}/vs/${encodeURIComponent(slugB)}`;
}

function isCleanCompareRoute() {
  return slugHelper?.isCompareRoute ? slugHelper.isCompareRoute(window.location) : /^\/base\/[^/]+\/vs\/[^/]+\/?$/i.test(window.location.pathname);
}

function syncCleanCompareUrl(baseA, baseB) {
  const cleanPath = compareUrl(preferredSlugFor(baseA), preferredSlugFor(baseB));
  if (!cleanPath || isCleanCompareRoute()) {
    return;
  }

  window.history.replaceState({}, '', cleanPath);
}

function baseUrl(base) {
  return slugHelper?.getBaseUrl ? slugHelper.getBaseUrl(base) : `/${encodeURIComponent(preferredSlugFor(base))}`;
}

function setupUrl(base) {
  return slugHelper?.getCompareSetupUrl ? slugHelper.getCompareSetupUrl(base) : `/compare.html?base=${encodeURIComponent(preferredSlugFor(base))}`;
}

function getScore(base, rowOrKey) {
  const row = typeof rowOrKey === 'string'
    ? SCORE_ROWS.find((item) => item.key === rowOrKey)
    : rowOrKey;

  if (!row) return null;
  if (row.source === 'overall') return isValidScoreValue(base?.scores?.overall) ? base.scores.overall : null;
  if (row.source === 'category') return isValidScoreValue(base?.scores?.categories?.[row.key]) ? base.scores.categories[row.key] : null;
  return isValidScoreValue(base?.comparisonScores?.[row.key]?.score) ? base.comparisonScores[row.key].score : null;
}

function normalizedDiff(baseA, baseB, row) {
  const scoreA = getScore(baseA, row);
  const scoreB = getScore(baseB, row);
  if (!isValidScoreValue(scoreA) || !isValidScoreValue(scoreB)) return null;
  return row.higherIsBetter ? scoreA - scoreB : scoreB - scoreA;
}

function winnerForRows(baseA, baseB, keys) {
  const rows = keys.map((key) => SCORE_ROWS.find((row) => row.key === key)).filter(Boolean);
  const validRows = rows.filter((row) => isValidScoreValue(getScore(baseA, row)) && isValidScoreValue(getScore(baseB, row)));
  if (!validRows.length) return { winner: null, margin: null, rows: [] };

  const total = validRows.reduce((sum, row) => sum + normalizedDiff(baseA, baseB, row), 0);
  return {
    winner: Math.abs(total) < 0.05 ? null : (total > 0 ? baseA : baseB),
    margin: total,
    rows: validRows
  };
}

function renderHeroCard(container, base, overallWinner) {
  const overall = getScore(base, 'overall');
  const slug = preferredSlugFor(base);
  const isWinner = overallWinner && preferredSlugFor(overallWinner) === slug;
  container.className = `versus-base-card${isWinner ? ' versus-base-card-winner' : ''}`;
  container.innerHTML = '';

  const image = document.createElement('img');
  image.className = 'versus-base-image';
  image.src = base.image || `/images/bases/${slug}.png`;
  image.alt = `${base.name} base image`;
  image.loading = 'eager';
  image.decoding = 'async';
  image.addEventListener('error', () => {
    image.src = HERO_IMAGE_FALLBACK_URL;
  }, { once: true });

  const content = document.createElement('div');
  content.className = 'versus-base-content';

  const title = document.createElement('h2');
  const link = document.createElement('a');
  link.href = baseUrl(base);
  link.textContent = base.name;
  title.appendChild(link);

  const meta = document.createElement('p');
  meta.className = 'base-meta';
  meta.textContent = `${labelFor('type', base.type)} • ${labelFor('region', base.region)}`;

  const score = document.createElement('p');
  score.className = `detail-overall-score versus-overall-score ${scoreToneClass(overall)}`.trim();
  score.textContent = isValidScoreValue(overall) ? `${overall.toFixed(1)}/10` : 'Score unavailable';

  const badge = document.createElement('span');
  badge.className = `badge ${isWinner ? 'badge-tier' : 'badge-trait'}`;
  badge.textContent = isWinner ? 'Overall lead' : 'Challenger';

  const stats = document.createElement('dl');
  stats.className = 'versus-mini-stats';
  ['defensibility', 'sustainability', 'isolation'].forEach((key) => {
    const row = SCORE_ROWS.find((item) => item.key === key);
    const value = getScore(base, row);
    const item = document.createElement('div');
    const dt = document.createElement('dt');
    dt.textContent = row.label;
    const dd = document.createElement('dd');
    dd.textContent = formatScore(value);
    item.append(dt, dd);
    stats.appendChild(item);
  });

  content.append(badge, title, meta, score, stats);
  container.append(image, content);
}

function renderOverallSummary(baseA, baseB, result) {
  if (!elements.overallSummary) return;
  elements.overallSummary.innerHTML = '';
  const scoreA = getScore(baseA, 'overall');
  const scoreB = getScore(baseB, 'overall');
  const diff = normalizedDiff(baseA, baseB, SCORE_ROWS[0]);
  const winner = result.winner;
  const leaderName = winner ? winner.name : 'No clear winner';
  const marginText = isValidScoreValue(diff) ? formatDifference(Math.abs(diff)) : '—';

  const lead = document.createElement('article');
  lead.className = 'overall-summary-card';
  const label = document.createElement('p');
  label.className = 'winner-card-label';
  label.textContent = winner ? 'Overall advantage' : 'Overall dead heat';
  const title = document.createElement('p');
  title.className = 'overall-summary-title';
  title.textContent = leaderName;
  const detail = document.createElement('p');
  detail.className = 'base-summary';
  detail.textContent = winner
    ? `${winner.name} leads the matchup by ${marginText} overall points, but the dossier below keeps each category weakness visible.`
    : 'The two bases are effectively tied overall, so category-level strengths and weaknesses decide the mission fit.';
  lead.append(label, title, detail);

  const metrics = document.createElement('div');
  metrics.className = 'overall-summary-metrics';
  [baseA, baseB].forEach((base) => {
    const item = document.createElement('div');
    const name = document.createElement('span');
    name.textContent = base.name;
    const score = document.createElement('strong');
    score.textContent = formatScore(getScore(base, 'overall'));
    item.append(name, score);
    metrics.appendChild(item);
  });
  lead.appendChild(metrics);
  elements.overallSummary.appendChild(lead);
}

function renderScoreRows(baseA, baseB) {
  elements.scoreBody.innerHTML = '';
  elements.scoreBaseA.textContent = baseA.name;
  elements.scoreBaseB.textContent = baseB.name;

  SCORE_ROWS.forEach((row) => {
    const scoreA = getScore(baseA, row);
    const scoreB = getScore(baseB, row);
    if (!isValidScoreValue(scoreA) && !isValidScoreValue(scoreB)) return;

    const diff = normalizedDiff(baseA, baseB, row);
    const winner = !isValidScoreValue(diff) || Math.abs(diff) < 0.05 ? null : (diff > 0 ? 'a' : 'b');
    const card = document.createElement('article');
    card.className = `score-comparison-card ${winner ? 'has-score-winner' : 'score-tie-row'}`;

    const label = document.createElement('h4');
    label.textContent = row.label;

    const aCell = document.createElement('p');
    aCell.className = `score-side score-side-a ${winner === 'a' ? 'score-cell-winner' : ''}`;
    aCell.innerHTML = `<span>${baseA.name}</span><strong>${formatScore(scoreA)}</strong>`;

    const diffCell = document.createElement('p');
    diffCell.className = winner ? 'score-difference-cell' : 'score-difference-even';
    diffCell.textContent = isValidScoreValue(diff)
      ? `${formatDifference(Math.abs(diff))}${winner ? ` ${winner === 'a' ? baseA.name : baseB.name}` : ''}`
      : '—';

    const bCell = document.createElement('p');
    bCell.className = `score-side score-side-b ${winner === 'b' ? 'score-cell-winner' : ''}`;
    bCell.innerHTML = `<span>${baseB.name}</span><strong>${formatScore(scoreB)}</strong>`;

    card.append(label, aCell, diffCell, bCell);
    elements.scoreBody.appendChild(card);
  });
}

function renderWinnerCards(baseA, baseB) {
  elements.winners.innerHTML = '';

  WINNER_CARDS.forEach((card) => {
    const result = winnerForRows(baseA, baseB, card.keys);
    const article = document.createElement('article');
    article.className = 'winner-card';

    const title = document.createElement('p');
    title.className = 'winner-card-label';
    title.textContent = card.title;

    const winner = document.createElement('p');
    winner.className = 'winner-card-name';
    winner.textContent = result.winner ? result.winner.name : 'Tie';

    const detail = document.createElement('p');
    detail.className = 'comparison-values';
    detail.textContent = result.rows.map((row) => `${row.label}: ${formatDifference(Math.abs(normalizedDiff(baseA, baseB, row)))}`).join(' • ') || 'Insufficient scores';

    article.append(title, winner, detail);
    elements.winners.appendChild(article);
  });
}

function biggestAdvantageFor(base, opponent) {
  const advantages = SCORE_ROWS
    .filter((row) => row.key !== 'overall')
    .map((row) => ({ row, diff: normalizedDiff(base, opponent, row) }))
    .filter((item) => isValidScoreValue(item.diff) && item.diff > 0.05)
    .sort((a, b) => b.diff - a.diff || a.row.label.localeCompare(b.row.label));
  return advantages[0] || null;
}

function renderAdvantages(baseA, baseB) {
  elements.advantages.innerHTML = '';
  [
    { base: baseA, opponent: baseB },
    { base: baseB, opponent: baseA }
  ].forEach(({ base, opponent }) => {
    const advantage = biggestAdvantageFor(base, opponent);
    const card = document.createElement('article');
    card.className = 'advantage-card';
    const line = document.createElement('p');
    line.className = 'comparison-primary comparison-primary-positive';
    line.textContent = advantage
      ? `${base.name}'s biggest advantage is ${advantage.row.label} (+${advantage.diff.toFixed(1)})`
      : `${base.name} has no positive scoring advantage over ${opponent.name}.`;
    card.appendChild(line);

    const weaknesses = SCORE_ROWS
      .filter((row) => row.key !== 'overall')
      .map((row) => ({ row, diff: normalizedDiff(base, opponent, row) }))
      .filter((item) => isValidScoreValue(item.diff) && item.diff < -0.05)
      .sort((a, b) => a.diff - b.diff || a.row.label.localeCompare(b.row.label));
    const weakness = weaknesses[0] || null;
    const weakLine = document.createElement('p');
    weakLine.className = 'comparison-primary comparison-primary-negative';
    weakLine.textContent = weakness
      ? `${base.name}'s biggest weakness is ${weakness.row.label} (${weakness.diff.toFixed(1)} vs ${opponent.name})`
      : `${base.name} has no clear scoring weakness against ${opponent.name}.`;
    card.appendChild(weakLine);
    elements.advantages.appendChild(card);
  });
}

function renderVerdicts(baseA, baseB) {
  elements.verdicts.innerHTML = '';

  VERDICTS.forEach((verdict) => {
    const result = winnerForRows(baseA, baseB, verdict.keys);
    const winner = result.winner;
    const card = document.createElement('article');
    card.className = 'verdict-card';

    const title = document.createElement('p');
    title.className = 'winner-card-label';
    title.textContent = verdict.title;

    const name = document.createElement('p');
    name.className = 'winner-card-name';
    name.textContent = winner ? winner.name : 'Tie';

    const reason = document.createElement('p');
    reason.className = 'base-summary';
    reason.textContent = winner
      ? verdict.reason(winner, result)
      : 'The weighted score inputs are effectively even, so neither base has a deterministic edge here.';

    card.append(title, name, reason);
    elements.verdicts.appendChild(card);
  });
}

function populateSelect(select, bases, options = {}) {
  select.innerHTML = '';
  if (options.placeholder) {
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = options.placeholder;
    select.appendChild(placeholder);
  }

  bases
    .filter((base) => preferredSlugFor(base) !== options.excludeSlug)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((base) => {
      const option = document.createElement('option');
      option.value = preferredSlugFor(base);
      option.textContent = base.name;
      select.appendChild(option);
    });

  if (options.value) {
    select.value = options.value;
  }
}

function updateMetadata(baseA, baseB) {
  if (!window.seo) return;
  const title = `${baseA.name} vs ${baseB.name} | Zombie Bases`;
  const description = `Compare ${baseA.name} and ${baseB.name} across survival scores, category winners, biggest advantages, and deterministic verdicts.`;
  const canonicalPath = `/base/${preferredSlugFor(baseA)}/vs/${preferredSlugFor(baseB)}`;
  const canonicalUrl = `${window.seo.PRODUCTION_ORIGIN}${canonicalPath}`;

  window.seo.applyPageMetadata({ title, description, canonicalPath, canonicalParams: null });
  window.seo.applySocialMetadata({
    title,
    description,
    url: canonicalUrl,
    type: 'website',
    image: `${window.seo.PRODUCTION_ORIGIN}/images/bases/${encodeURIComponent(preferredSlugFor(baseA))}.png`
  });
}

function pushCleanCompareUrl(baseA, baseB) {
  const cleanPath = compareUrl(preferredSlugFor(baseA), preferredSlugFor(baseB));
  if (cleanPath) {
    window.history.pushState({}, '', cleanPath);
  }
}

function renderComparison(baseA, baseB, bases) {
  const overallResult = winnerForRows(baseA, baseB, ['overall']);
  elements.title.textContent = `${baseA.name} vs ${baseB.name}`;
  renderHeroCard(elements.heroA, baseA, overallResult.winner);
  renderHeroCard(elements.heroB, baseB, overallResult.winner);
  renderOverallSummary(baseA, baseB, overallResult);
  renderScoreRows(baseA, baseB);
  renderWinnerCards(baseA, baseB);
  renderAdvantages(baseA, baseB);
  renderVerdicts(baseA, baseB);
  const slugA = preferredSlugFor(baseA);
  const slugB = preferredSlugFor(baseB);
  populateSelect(elements.compareCurrentPrimary, bases, { value: slugA, excludeSlug: slugB });
  populateSelect(elements.compareCurrentSecondary, bases, { value: slugB, excludeSlug: slugA });
  elements.compareCurrentPrimary.onchange = () => {
    populateSelect(elements.compareCurrentSecondary, bases, {
      value: elements.compareCurrentSecondary.value,
      excludeSlug: elements.compareCurrentPrimary.value
    });
  };
  elements.compareCurrentSecondary.onchange = () => {
    populateSelect(elements.compareCurrentPrimary, bases, {
      value: elements.compareCurrentPrimary.value,
      excludeSlug: elements.compareCurrentSecondary.value
    });
  };
  elements.compareCurrentButton.onclick = () => {
    const nextSlugA = elements.compareCurrentPrimary.value;
    const nextSlugB = elements.compareCurrentSecondary.value;
    if (!nextSlugA || !nextSlugB || nextSlugA === nextSlugB) {
      return;
    }

    const nextBaseA = slugHelper?.resolveBaseBySlug?.(bases, nextSlugA) || bases.find((base) => preferredSlugFor(base) === nextSlugA);
    const nextBaseB = slugHelper?.resolveBaseBySlug?.(bases, nextSlugB) || bases.find((base) => preferredSlugFor(base) === nextSlugB);
    if (!nextBaseA || !nextBaseB) {
      const missing = [!nextBaseA ? nextSlugA : null, !nextBaseB ? nextSlugB : null].filter(Boolean).join(' and ');
      showNotFound(`We couldn't find ${missing} in the current base dataset.`);
      return;
    }

    pushCleanCompareUrl(nextBaseA, nextBaseB);
    renderComparison(nextBaseA, nextBaseB, bases);
  };
  syncCleanCompareUrl(baseA, baseB);
  updateMetadata(baseA, baseB);
  elements.status.textContent = '';
  elements.setup.hidden = true;
  elements.notFound.hidden = true;
  elements.page.hidden = false;
}

function getRequestedSlugs() {
  const params = new URLSearchParams(window.location.search);
  const cleanCompareSlugs = slugHelper?.getCompareSlugsFromLocation?.(window.location);
  if (cleanCompareSlugs) {
    return { slugA: cleanCompareSlugs.baseSlug, slugB: cleanCompareSlugs.compareSlug };
  }

  return {
    slugA: params.get('a') || params.get('base') || '',
    slugB: params.get('b') || params.get('against') || ''
  };
}

function showNotFound(message) {
  elements.status.textContent = '';
  elements.page.hidden = true;
  elements.setup.hidden = true;
  elements.notFoundMessage.textContent = message;
  elements.notFound.hidden = false;
}

function showSetup(bases, slugA = '', slugB = '') {
  populateSelect(elements.setupPrimary, bases, { placeholder: 'Select first base', value: slugA });
  populateSelect(elements.setupSecondary, bases, { placeholder: 'Select second base', value: slugB, excludeSlug: slugA });

  elements.setupPrimary.addEventListener('change', () => {
    populateSelect(elements.setupSecondary, bases, {
      placeholder: 'Select second base',
      excludeSlug: elements.setupPrimary.value,
      value: elements.setupSecondary.value
    });
  });
  elements.setupButton.addEventListener('click', () => {
    const nextSlugA = elements.setupPrimary.value;
    const nextSlugB = elements.setupSecondary.value;
    if (!nextSlugA || !nextSlugB) {
      return;
    }

    const nextBaseA = slugHelper?.resolveBaseBySlug?.(bases, nextSlugA) || bases.find((base) => preferredSlugFor(base) === nextSlugA);
    const nextBaseB = slugHelper?.resolveBaseBySlug?.(bases, nextSlugB) || bases.find((base) => preferredSlugFor(base) === nextSlugB);
    if (!nextBaseA || !nextBaseB) {
      const missing = [!nextBaseA ? nextSlugA : null, !nextBaseB ? nextSlugB : null].filter(Boolean).join(' and ');
      showNotFound(`We couldn't find ${missing} in the current base dataset.`);
      return;
    }

    pushCleanCompareUrl(nextBaseA, nextBaseB);
    renderComparison(nextBaseA, nextBaseB, bases);
  });

  elements.status.textContent = '';
  elements.page.hidden = true;
  elements.notFound.hidden = true;
  elements.setup.hidden = false;
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
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.bases)) return payload.bases;
      lastError = new Error(`Unexpected base data shape from ${url}`);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Unable to load base data');
}

async function initComparison() {
  elements.status.textContent = 'Loading comparison...';
  try {
    const bases = await loadBasesData();
    const { slugA, slugB } = getRequestedSlugs();
    const baseA = slugA ? slugHelper?.resolveBaseBySlug?.(bases, slugA) || bases.find((base) => preferredSlugFor(base) === slugA) : null;
    const baseB = slugB ? slugHelper?.resolveBaseBySlug?.(bases, slugB) || bases.find((base) => preferredSlugFor(base) === slugB) : null;

    if (slugA && slugB && preferredSlugFor(slugA) === preferredSlugFor(slugB)) {
      showNotFound('Choose two different bases to compare. This comparison URL uses the same base on both sides.');
      return;
    }

    if ((slugA && !baseA) || (slugB && !baseB)) {
      const missing = [slugA && !baseA ? slugA : null, slugB && !baseB ? slugB : null].filter(Boolean).join(' and ');
      showNotFound(`We couldn't find ${missing} in the current base dataset.`);
      return;
    }

    if (!baseA || !baseB) {
      showSetup(bases, baseA ? preferredSlugFor(baseA) : slugA, baseB ? preferredSlugFor(baseB) : slugB);
      return;
    }

    renderComparison(baseA, baseB, bases);
  } catch (error) {
    console.error(error);
    showNotFound('The comparison data could not be loaded. Please try again later.');
  }
}

initComparison();
