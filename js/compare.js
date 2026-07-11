(() => {
const DATA_URL = '/data/bases-index.json';
const LEGACY_DATA_URL = '/data/bases.json';
const HERO_IMAGE_FALLBACK_URL = '/images/bases/placeholder.png';
const WIN_EPSILON = 0.05;
const MAX_SCORE = 10;

const LABELS = {
  type: {
    fortified_structure: 'Fortified Structure', isolated_landmass: 'Isolated Landmass', elevated_stronghold: 'Elevated Stronghold', subterranean: 'Subterranean', institutional_compound: 'Institutional Compound', industrial_site: 'Industrial Site', remote_settlement: 'Remote Settlement', transit_hub: 'Transit Hub', landmark_structure: 'Landmark Structure'
  },
  region: {
    uk_ireland: 'UK & Ireland', western_europe: 'Western Europe', eastern_europe: 'Eastern & Northern Europe', north_america: 'North America', south_america: 'South America', africa: 'Africa', middle_east: 'Middle East', south_asia: 'South Asia', east_asia: 'East Asia', southeast_asia: 'Southeast Asia', oceania: 'Oceania', polar_extreme: 'Polar & Extreme'
  }
};

const SCORE_ROWS = [
  { key: 'overall', label: 'Overall', source: 'overall', higherIsBetter: true, description: 'Composite survival score.' },
  { key: 'defensibility', label: 'Defensibility', source: 'category', higherIsBetter: true, description: 'Defensive strength and controlled access.' },
  { key: 'sustainability', label: 'Sustainability', source: 'category', higherIsBetter: true, description: 'Long-term food, water, energy and continuity.' },
  { key: 'isolation', label: 'Isolation', source: 'category', higherIsBetter: true, description: 'Separation from dense threat pressure.' },
  { key: 'exposure', label: 'Exposure Control', source: 'comparison', higherIsBetter: true, description: 'Higher score means lower practical exposure.' },
  { key: 'maintenanceBurden', label: 'Maintenance Resilience', source: 'comparison', higherIsBetter: true, description: 'Higher score means easier upkeep and lower burden.' },
  { key: 'populationCapacity', label: 'Population Capacity', source: 'comparison', higherIsBetter: true, description: 'Ability to support a larger group.' },
  { key: 'resourceSecurity', label: 'Resource Security', source: 'comparison', higherIsBetter: true, description: 'Reliability of useful local resources.' }
];
const VERDICTS = [
  { key: 'earlySurvivalWinner', title: 'Best early survival', keys: ['defensibility', 'isolation', 'exposure'], reason: (winner) => `${winner.name} has the stronger first-phase blend of defensibility, isolation, and exposure control.` },
  { key: 'longTermWinner', title: 'Best long-term', keys: ['sustainability', 'resourceSecurity', 'populationCapacity'], reason: (winner) => `${winner.name} is better positioned after the first wave because sustainability, resources, and capacity carry the result.` },
  { key: 'lowMaintenanceWinner', title: 'Lowest maintenance', keys: ['maintenanceBurden'], reason: (winner) => `${winner.name} has the easier upkeep profile according to the maintenance resilience score.` }
];

const elements = {
  status: document.getElementById('compare-status'), page: document.getElementById('compare-page'), setup: document.getElementById('compare-setup'), notFound: document.getElementById('compare-not-found'), notFoundMessage: document.getElementById('compare-not-found-message'), title: document.getElementById('comparison-title'), heroA: document.getElementById('hero-base-a'), heroB: document.getElementById('hero-base-b'), scoreBaseA: document.getElementById('score-base-a'), scoreBaseB: document.getElementById('score-base-b'), overallSummary: document.getElementById('overall-winner-summary'), scoreBody: document.getElementById('score-comparison-body'), findings: document.getElementById('key-findings'), strengths: document.getElementById('strength-tradeoffs'), categoryOverview: document.getElementById('category-overview'), recommendation: document.getElementById('recommendation-panel'), compareCurrentPrimary: document.getElementById('compare-current-primary'), compareCurrentSecondary: document.getElementById('compare-current-secondary'), compareCurrentButton: document.getElementById('compare-current-button'), setupPrimary: document.getElementById('compare-setup-primary'), setupSecondary: document.getElementById('compare-setup-secondary'), setupButton: document.getElementById('compare-setup-button'), setupHelp: document.getElementById('compare-setup-help'), featuredMatchups: document.getElementById('compare-featured-matchups'), scenarioTabs: document.getElementById('compare-scenario-tabs'), scenarioResults: document.getElementById('compare-scenario-results')
};
const slugHelper = window.baseSlugHelper;

function toTitleCaseSlug(value) { return String(value || '').split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' '); }
function labelFor(kind, value) { return LABELS[kind][value] ?? toTitleCaseSlug(value); }
function isValidScoreValue(value) { return Number.isFinite(value); }
function formatScore(value) { return isValidScoreValue(value) ? value.toFixed(1) : '—'; }
function formatDifference(value) { return !isValidScoreValue(value) || Math.abs(value) < WIN_EPSILON ? 'Even' : `+${Math.abs(value).toFixed(1)}`; }
function scoreToneClass(value) { if (!isValidScoreValue(value)) return ''; if (value >= 8) return 'score-high'; if (value >= 5) return 'score-medium'; return 'score-low'; }
function scoreLabel(value) { if (!isValidScoreValue(value)) return 'Unrated'; if (value >= 8.5) return 'Exceptional'; if (value >= 7) return 'Excellent'; if (value >= 5.5) return 'Good'; return 'Balanced'; }
function preferredSlugFor(baseOrSlug) { return slugHelper?.getPreferredSlug ? slugHelper.getPreferredSlug(baseOrSlug) : (typeof baseOrSlug === 'string' ? baseOrSlug : baseOrSlug?.slug || ''); }
function compareUrl(slugA, slugB) { return slugHelper?.getCompareUrl ? slugHelper.getCompareUrl(slugA, slugB) : `/base/${encodeURIComponent(slugA)}/vs/${encodeURIComponent(slugB)}`; }
function isCleanCompareRoute() { return slugHelper?.isCompareRoute ? slugHelper.isCompareRoute(window.location) : /^\/base\/[^/]+\/vs\/[^/]+\/?$/i.test(window.location.pathname); }
function baseUrl(base) { return slugHelper?.getBaseUrl ? slugHelper.getBaseUrl(base) : `/${encodeURIComponent(preferredSlugFor(base))}`; }
function getScore(base, rowOrKey) { const row = typeof rowOrKey === 'string' ? SCORE_ROWS.find((item) => item.key === rowOrKey) : rowOrKey; if (!row) return null; if (row.source === 'overall') return isValidScoreValue(base?.scores?.overall) ? base.scores.overall : null; if (row.source === 'category') return isValidScoreValue(base?.scores?.categories?.[row.key]) ? base.scores.categories[row.key] : null; return isValidScoreValue(base?.comparisonScores?.[row.key]?.score) ? base.comparisonScores[row.key].score : null; }
function normalizedDiff(baseA, baseB, row) { const scoreA = getScore(baseA, row); const scoreB = getScore(baseB, row); if (!isValidScoreValue(scoreA) || !isValidScoreValue(scoreB)) return null; return row.higherIsBetter ? scoreA - scoreB : scoreB - scoreA; }
function winnerFromDiff(diff) { if (!isValidScoreValue(diff) || Math.abs(diff) < WIN_EPSILON) return 'tie'; return diff > 0 ? 'baseA' : 'baseB'; }
function baseForWinner(result, winner) { return winner === 'baseA' ? result.baseA : winner === 'baseB' ? result.baseB : null; }
function shortName(base) { return String(base?.name || '').replace(/\s+(Island|Complex|Castle|Base|Plateau)$/i, '') || 'Base'; }
function compareRows(baseA, baseB, rows) { const total = rows.reduce((sum, row) => sum + (normalizedDiff(baseA, baseB, row) || 0), 0); return winnerFromDiff(total); }
function rowResult(baseA, baseB, row) { const baseAValue = getScore(baseA, row); const baseBValue = getScore(baseB, row); const rawDifference = isValidScoreValue(baseAValue) && isValidScoreValue(baseBValue) ? baseAValue - baseBValue : null; const decisiveDifference = normalizedDiff(baseA, baseB, row); return { ...row, baseAValue, baseBValue, rawDifference, decisiveDifference, absoluteDifference: isValidScoreValue(rawDifference) ? Math.abs(rawDifference) : null, winner: winnerFromDiff(decisiveDifference) }; }
function buildComparisonResult(baseA, baseB) {
  const metrics = SCORE_ROWS.map((row) => rowResult(baseA, baseB, row)).filter((metric) => isValidScoreValue(metric.baseAValue) || isValidScoreValue(metric.baseBValue));
  const attributes = metrics.filter((metric) => metric.key !== 'overall');
  const overallMetric = metrics.find((metric) => metric.key === 'overall');
  const byLargest = (items) => items.slice().sort((a, b) => (b.absoluteDifference || 0) - (a.absoluteDifference || 0));
  const largestBaseAAdvantage = byLargest(attributes.filter((metric) => metric.winner === 'baseA'))[0];
  const largestBaseBAdvantage = byLargest(attributes.filter((metric) => metric.winner === 'baseB'))[0];
  const closestMetric = attributes.slice().sort((a, b) => (a.absoluteDifference || 0) - (b.absoluteDifference || 0))[0];
  return {
    baseA, baseB, metrics, attributes, overallWinner: overallMetric?.winner || 'tie', overallMargin: overallMetric?.absoluteDifference || 0,
    baseAWins: attributes.filter((metric) => metric.winner === 'baseA').length,
    baseBWins: attributes.filter((metric) => metric.winner === 'baseB').length,
    ties: attributes.filter((metric) => metric.winner === 'tie').length,
    largestBaseAAdvantage, largestBaseBAdvantage, closestMetric,
    largestAdvantage: byLargest(attributes.filter((metric) => metric.winner !== 'tie'))[0] || null,
    biggestDecidingFactor: byLargest(attributes.filter((metric) => metric.winner !== 'tie'))[0],
    earlySurvivalWinner: compareRows(baseA, baseB, SCORE_ROWS.filter((row) => ['defensibility', 'isolation', 'exposure'].includes(row.key))),
    longTermWinner: compareRows(baseA, baseB, SCORE_ROWS.filter((row) => ['sustainability', 'resourceSecurity', 'populationCapacity'].includes(row.key))),
    lowMaintenanceWinner: compareRows(baseA, baseB, SCORE_ROWS.filter((row) => row.key === 'maintenanceBurden'))
  };
}

function baseOptionLabel(base) { return `${base.name} — ${labelFor('type', base.type)}, ${labelFor('region', base.region)}`; }
function searchTextFor(base) { const synonyms = { isolated_landmass: 'island islands archipelago landmass', fortified_structure: 'fort fortress castle fortification', elevated_stronghold: 'castle mountain elevated stronghold monastery', subterranean: 'underground bunker cave subterranean' }; return [base.name, labelFor('type', base.type), labelFor('region', base.region), base.continent, base.type, base.region, synonyms[base.type]].filter(Boolean).join(' ').toLowerCase(); }
function optionMeta(base) { return `${labelFor('type', base.type)} · ${labelFor('region', base.region)}`; }
function renderAutocompleteOption(base, id, active = false, disabled = false) {
  return `<button id="${id}" class="compare-autocomplete-option${active ? ' is-active' : ''}" type="button" role="option" data-slug="${preferredSlugFor(base)}" aria-selected="${active}"${disabled ? ' disabled aria-disabled="true"' : ''}><span class="compare-option-main"><strong>${base.name}</strong><em>${formatScore(getScore(base, 'overall'))}</em></span><span>${optionMeta(base)}</span></button>`;
}
function fillFilterOptions(select, kind, bases) {
  if (!select) return;
  const current = select.value;
  const values = [...new Set(bases.map((base) => base[kind]).filter(Boolean))].sort((a, b) => labelFor(kind, a).localeCompare(labelFor(kind, b)));
  const placeholder = kind === 'type' ? 'All Types' : 'All Regions';
  select.innerHTML = `<option value="">${placeholder}</option>` + values.map((value) => `<option value="${value}">${labelFor(kind, value)}</option>`).join('');
  if (values.includes(current)) select.value = current;
}
function filteredBasesForState(bases, state) {
  const query = String(state.input?.value || '').trim().toLowerCase();
  return bases.filter((base) => {
    if (state.typeSelect?.value && base.type !== state.typeSelect.value) return false;
    if (state.regionSelect?.value && base.region !== state.regionSelect.value) return false;
    return !query || searchTextFor(base).includes(query);
  });
}
function attachCompareSelector(panel, bases, callbacks = {}, initialBase = null) {
  const combo = panel.querySelector('[data-base-combobox]');
  const comboId = combo?.dataset.comboboxId || `compare-combobox-${panel.dataset.compareSide || 'side'}`;
  const button = combo?.querySelector('[data-combobox-button]');
  const valueNode = combo?.querySelector('[data-combobox-value]');
  const panelNode = combo?.querySelector('[data-combobox-panel]');
  const searchInput = combo?.querySelector('[data-combobox-search]');
  const listbox = combo?.querySelector('[data-combobox-list]');
  const emptyNode = combo?.querySelector('[data-combobox-empty]');
  const clearSearch = combo?.querySelector('[data-clear-search]');
  const footer = combo?.querySelector('[data-combobox-footer]');
  const typeSelect = panel.querySelector('select[data-filter="type"]');
  const regionSelect = panel.querySelector('select[data-filter="region"]');
  const count = panel.querySelector('[data-count]');
  const clearFilters = panel.querySelector('[data-clear-filters]');
  const selectorCard = panel.querySelector('[data-selector-card]');
  const selectedCard = panel.querySelector('[data-selected-card]');
  const state = { panel, typeSelect, regionSelect, selected: null, matches: [], visible: [], activeIndex: -1, open: false };
  fillFilterOptions(typeSelect, 'type', bases);
  fillFilterOptions(regionSelect, 'region', bases);
  typeSelect.disabled = false;
  regionSelect.disabled = false;

  const matchesCurrentFilters = (base) => Boolean(base)
    && (!typeSelect?.value || base.type === typeSelect.value)
    && (!regionSelect?.value || base.region === regionSelect.value);
  const filteredBases = () => bases.filter((base) => matchesCurrentFilters(base)).sort((a, b) => a.name.localeCompare(b.name));
  const countText = (total) => total === 0 ? 'No locations match' : `${total} location${total === 1 ? '' : 's'} match`;
  const closeOthers = () => document.querySelectorAll('[data-base-combobox].is-open').forEach((node) => { if (node !== combo) node.dispatchEvent(new CustomEvent('compare-combobox-close')); });
  const setActive = (index) => {
    state.activeIndex = state.visible.length ? Math.max(0, Math.min(index, state.visible.length - 1)) : -1;
    [...listbox.children].forEach((row, i) => {
      row.classList.toggle('is-active', i === state.activeIndex);
      row.setAttribute('aria-selected', i === state.activeIndex ? 'true' : 'false');
    });
    const active = listbox.children[state.activeIndex];
    if (active) { button.setAttribute('aria-activedescendant', active.id); active.scrollIntoView({ block: 'nearest' }); }
    else button.removeAttribute('aria-activedescendant');
  };
  const matchingSearch = () => {
    const query = String(searchInput.value || '').trim().toLowerCase();
    return state.matches.filter((base) => !query || searchTextFor(base).includes(query));
  };
  const renderList = () => {
    state.visible = matchingSearch();
    listbox.innerHTML = state.visible.map((base, index) => {
      const slug = preferredSlugFor(base);
      const duplicate = callbacks.isDuplicate?.(base);
      const score = getScore(base, 'overall');
      return `<button id="${comboId}-option-${index}" class="compare-combobox-option${duplicate ? ' is-disabled' : ''}" type="button" role="option" data-slug="${slug}" aria-selected="false"${duplicate ? ' disabled aria-disabled="true"' : ''}><img src="${imageFor(base)}" alt="" loading="lazy" decoding="async" width="48" height="38"><span class="compare-combobox-option-copy"><strong>${base.name}</strong><small>${optionMeta(base)}${duplicate ? ' · Already selected' : ''}</small></span><em class="${scoreToneClass(score)}">${formatScore(score)}</em></button>`;
    }).join('');
    listbox.querySelectorAll('img').forEach((img) => img.addEventListener('error', (event) => { event.currentTarget.src = HERO_IMAGE_FALLBACK_URL; }, { once: true }));
    emptyNode.hidden = state.visible.length > 0;
    footer.textContent = countText(state.matches.length);
    setActive(state.visible.findIndex((base) => state.selected && preferredSlugFor(base) === preferredSlugFor(state.selected)));
    if (state.activeIndex < 0 && state.visible.length) setActive(0);
  };
  const open = () => {
    if (button.disabled) return;
    closeOthers();
    state.open = true;
    combo.classList.add('is-open');
    panelNode.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    searchInput.placeholder = `Search within ${state.matches.length} location${state.matches.length === 1 ? '' : 's'}…`;
    searchInput.value = '';
    renderList();
    setTimeout(() => searchInput.focus(), 0);
  };
  const close = (focusButton = false) => {
    state.open = false;
    combo.classList.remove('is-open');
    panelNode.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    button.removeAttribute('aria-activedescendant');
    if (focusButton) button.focus();
  };
  combo?.addEventListener('compare-combobox-close', () => close(false));
  const choose = (base) => {
    if (!base || callbacks.isDuplicate?.(base)) { callbacks.onDuplicate?.(base); return; }
    state.selected = base;
    renderSelected();
    close(false);
    callbacks.onChange?.();
  };
  const chooseActive = () => { const base = state.visible[state.activeIndex]; if (base) choose(base); };
  const renderOptions = () => {
    state.matches = filteredBases();
    const noMatches = state.matches.length === 0;
    button.disabled = noMatches;
    valueNode.textContent = 'Choose a base';
    count.textContent = countText(state.matches.length);
    clearFilters.hidden = !noMatches || (!typeSelect.value && !regionSelect.value);
    if (state.open) {
      if (noMatches) close(false);
      else { searchInput.placeholder = `Search within ${state.matches.length} location${state.matches.length === 1 ? '' : 's'}…`; renderList(); }
    }
  };
  function renderSelected() {
    if (!state.selected) { selectorCard.hidden = false; selectedCard.hidden = true; selectedCard.innerHTML = ''; return; }
    const score = getScore(state.selected, 'overall');
    selectorCard.hidden = true; selectedCard.hidden = false;
    selectedCard.innerHTML = `<img class="compare-selected-image" src="${imageFor(state.selected)}" alt="${state.selected.name} base image" loading="lazy" decoding="async"><div class="compare-selected-copy"><p class="winner-card-label">${panel.dataset.compareSide === 'primary' ? 'First base' : 'Second base'}</p><h3>${state.selected.name}</h3><p>${labelFor('type', state.selected.type)}</p><p>${labelFor('region', state.selected.region)}</p><button type="button" class="change-base-button">Change</button></div><strong class="selected-base-score ${scoreToneClass(score)}">${formatScore(score)}</strong>`;
    selectedCard.querySelector('img').addEventListener('error', (event) => { event.currentTarget.src = HERO_IMAGE_FALLBACK_URL; }, { once: true });
    selectedCard.querySelector('button').addEventListener('click', () => { state.selected = null; renderSelected(); renderOptions(); callbacks.onChange?.(); setTimeout(() => button.focus(), 0); });
  }
  const clearSelectionIfInvalid = () => { if (state.selected && !matchesCurrentFilters(state.selected)) state.selected = null; };
  button.addEventListener('click', () => state.open ? close(false) : open());
  button.addEventListener('keydown', (event) => { if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) { event.preventDefault(); open(); } });
  searchInput.addEventListener('input', renderList);
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive(state.activeIndex + 1); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive(state.activeIndex - 1); }
    else if (event.key === 'Home') { event.preventDefault(); setActive(0); }
    else if (event.key === 'End') { event.preventDefault(); setActive(state.visible.length - 1); }
    else if (event.key === 'Enter') { event.preventDefault(); chooseActive(); }
    else if (event.key === 'Escape') { event.preventDefault(); close(true); }
  });
  listbox.addEventListener('click', (event) => { const row = event.target.closest('[data-slug]'); if (row) choose(state.visible.find((base) => preferredSlugFor(base) === row.dataset.slug)); });
  clearSearch?.addEventListener('click', () => { searchInput.value = ''; renderList(); searchInput.focus(); });
  document.addEventListener('click', (event) => { if (state.open && !combo.contains(event.target)) close(false); });
  [typeSelect, regionSelect].forEach((select) => select.addEventListener('change', () => { clearSelectionIfInvalid(); renderSelected(); renderOptions(); callbacks.onChange?.(); }));
  clearFilters?.addEventListener('click', () => { typeSelect.value = ''; regionSelect.value = ''; state.selected = null; renderSelected(); renderOptions(); callbacks.onChange?.(); button.focus(); });
  if (initialBase) state.selected = initialBase;
  renderSelected();
  renderOptions();
  return { getSelected: () => state.selected, setDuplicateCallbacks(next) { Object.assign(callbacks, next); renderOptions(); }, focus: () => button.focus(), refreshOptions: renderOptions };
}
function resolveBaseInput(bases, value) { const raw = String(value || '').trim(); if (!raw) return null; const name = raw.split(' — ')[0].trim(); return slugHelper?.resolveBaseBySlug?.(bases, raw) || bases.find((base) => preferredSlugFor(base) === raw || base.name.toLowerCase() === name.toLowerCase() || base.name.toLowerCase() === raw.toLowerCase()); }
function curatedMatchups(bases) {
  const specs = [
    { label: 'Close Contest', a: 'tasmania', b: 'andaman-islands', description: 'Two high-scoring isolated landmasses with different sustainability profiles.' },
    { label: 'Fortress Showdown', a: 'predjama-castle', b: 'malbork-castle', description: 'Natural concealment versus large-scale fortified defence.' },
    { label: 'Opposite Strategies', a: 'cheyenne-mountain-complex', b: 'jeju-island', description: 'Engineered protection versus a sustainable island refuge.' }
  ];
  return specs.map((spec) => ({ ...spec, baseA: slugHelper?.resolveBaseBySlug?.(bases, spec.a) || bases.find((base) => preferredSlugFor(base) === spec.a), baseB: slugHelper?.resolveBaseBySlug?.(bases, spec.b) || bases.find((base) => preferredSlugFor(base) === spec.b) })).filter((item) => item.baseA && item.baseB).slice(0, 3);
}
function renderMatchupCard(baseA, baseB, label = 'Recommended', description = '') {
  const labelClass = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `<a class="curated-matchup-card" href="${compareUrl(preferredSlugFor(baseA), preferredSlugFor(baseB))}" aria-label="Open matchup: ${baseA.name} versus ${baseB.name}"><div class="curated-matchup-image-wrap"><img src="${imageFor(baseA)}" alt="${baseA.name} survival base landscape" loading="lazy" decoding="async" width="420" height="220"><span class="curated-category-badge curated-category-${labelClass}">${label}</span></div><div class="curated-matchup-body"><div class="curated-pair"><strong>${baseA.name}</strong><span aria-hidden="true">VS</span><strong>${baseB.name}</strong></div><p class="curated-score-line"><strong>${formatScore(getScore(baseA, 'overall'))}</strong><span>vs</span><strong>${formatScore(getScore(baseB, 'overall'))}</strong></p><p class="curated-reason">${description || matchupReason(baseA, baseB)}</p><span class="curated-link-text">Open matchup →</span></div></a>`;
}
function renderSetupRecommendations(bases) {
  if (!elements.featuredMatchups) return;
  elements.featuredMatchups.innerHTML = curatedMatchups(bases).map((item) => renderMatchupCard(item.baseA, item.baseB, item.label, item.description)).join('');
  elements.featuredMatchups.querySelectorAll('img').forEach((img) => img.addEventListener('error', (event) => { event.currentTarget.src = HERO_IMAGE_FALLBACK_URL; }, { once: true }));
}
function getComparableScore(baseA, baseB, mode = 'interesting') { const sameRegion = baseA.region === baseB.region ? 1 : 0; const sameType = baseA.type === baseB.type ? 1 : 0; const overallGap = Math.abs((getScore(baseA, 'overall') || 0) - (getScore(baseB, 'overall') || 0)); const attributeGap = SCORE_ROWS.filter((row) => row.key !== 'overall').reduce((sum, row) => sum + Math.abs((getScore(baseA, row) || 0) - (getScore(baseB, row) || 0)), 0) / 7; if (mode === 'similar') return sameRegion * 3 + sameType * 3 + Math.max(0, 4 - overallGap) + Math.max(0, 4 - attributeGap); if (mode === 'alternative') return (getScore(baseB, 'overall') || 0) + (sameRegion ? 1.2 : 0) + (sameType ? .8 : 0); if (mode === 'contrast') return attributeGap + overallGap * .6 + (sameRegion ? .5 : 0) + (sameType ? 0 : 1); return attributeGap * .8 + Math.max(0, 2 - overallGap) + sameRegion + sameType; }
function topMatchesForBase(base, bases, mode = 'interesting', limit = 3) { return bases.filter((candidate) => preferredSlugFor(candidate) !== preferredSlugFor(base)).map((candidate) => ({ base: candidate, score: getComparableScore(base, candidate, mode) })).sort((a,b)=>b.score-a.score).slice(0, limit).map((item)=>item.base); }
function matchupReason(baseA, baseB) { const result = buildComparisonResult(baseA, baseB); const factor = result.biggestDecidingFactor; if (!factor) return 'A close survival profile with enough overlap to make the verdict debatable.'; const leader = baseForWinner(result, factor.winner); return `${leader ? shortName(leader) : 'One side'} creates the biggest separation in ${factor.label.toLowerCase()}.`; }
function marginLabel(metric, result) { if (!isValidScoreValue(metric.decisiveDifference) || metric.winner === 'tie') return '<span>Even</span>'; const base = baseForWinner(result, metric.winner); return `<span>${displayMargin(metric.absoluteDifference)}</span><small>${leadershipLabel(metric)} · ${shortName(base)} leads</small>`; }
function explanationFor(result) { if (result.overallWinner === 'tie') return 'The bases are level on weighted overall score, so the category profile determines which mission each location suits best.'; const winner = baseForWinner(result, result.overallWinner); const loser = result.overallWinner === 'baseA' ? result.baseB : result.baseA; const primary = result.overallWinner === 'baseA' ? result.largestBaseAAdvantage : result.largestBaseBAdvantage; const loserEdge = result.overallWinner === 'baseA' ? result.largestBaseBAdvantage : result.largestBaseAAdvantage; const categoryNote = result.overallWinner === 'baseA' && result.baseBWins > result.baseAWins || result.overallWinner === 'baseB' && result.baseAWins > result.baseBWins ? ' The weighted model favors the size and importance of those advantages over the raw category count.' : ''; return `${winner.name} leads the weighted overall model${primary ? ` through ${primary.label.toLowerCase()} (${formatDifference(primary.decisiveDifference)})` : ''}${loserEdge ? `, while ${loser.name} answers in ${loserEdge.label.toLowerCase()}` : ''}.${categoryNote}`; }
function imageFor(base) { const slug = preferredSlugFor(base); return base.image || `/images/bases/${slug}.png`; }

function renderHeroCard(container, base, side, result) {
  const overall = getScore(base, 'overall'); const isWinner = result.overallWinner === side;
  container.className = `versus-base-card${isWinner ? ' versus-base-card-winner' : ''}`; container.innerHTML = '';
  container.innerHTML = `<a class="versus-image-link" href="${baseUrl(base)}"><img class="versus-base-image" src="${imageFor(base)}" alt="${base.name} base image" loading="eager" decoding="async"></a><div class="versus-base-content"><div class="versus-card-top"><span class="badge ${isWinner ? 'badge-tier' : 'badge-trait'}">${isWinner ? 'Overall leader' : scoreLabel(overall)}</span></div><p class="versus-score-label">Overall score</p><p class="detail-overall-score versus-overall-score ${scoreToneClass(overall)}">${isValidScoreValue(overall) ? `${formatScore(overall)}<span>/10</span>` : 'Score unavailable'}</p><h2><a href="${baseUrl(base)}">${base.name}</a></h2><p class="base-meta">${labelFor('type', base.type)} • ${labelFor('region', base.region)}</p></div>`;
  container.querySelector('img').addEventListener('error', (event) => { event.currentTarget.src = HERO_IMAGE_FALLBACK_URL; }, { once: true });
}

function leadershipLabel(metric) { if (!metric || metric.winner === 'tie') return 'Even'; const margin = metric.absoluteDifference || 0; if (margin >= 4) return 'Decisive lead'; if (margin >= 3) return 'Strong lead'; if (margin >= 2) return 'Clear lead'; return 'Narrow lead'; }
function displayMargin(value) { return isValidScoreValue(value) ? `+${Math.abs(value).toFixed(1)}` : 'Even'; }
function winnerStats(result) { if (result.overallWinner === 'baseA') return { wins: result.baseAWins, losses: result.baseBWins }; if (result.overallWinner === 'baseB') return { wins: result.baseBWins, losses: result.baseAWins }; return { wins: 0, losses: 0 }; }
function renderOverallSummary(result) { const winner = baseForWinner(result, result.overallWinner); const stats = winnerStats(result); const largest = result.largestAdvantage; const icon = '<svg viewBox="0 0 24 24" focusable="false"><path d="M6 4h12v3a6 6 0 0 1-5 5.92V16h3v2H8v-2h3v-3.08A6 6 0 0 1 6 7V4Zm2 2v1a4 4 0 0 0 8 0V6H8Zm-5 1h2a7.9 7.9 0 0 0 2 5.3C4.7 11.7 3 9.6 3 7Zm16 0h2c0 2.6-1.7 4.7-4 5.3A7.9 7.9 0 0 0 19 7Z"/></svg>'; elements.overallSummary.className = `overall-winner-summary ${winner ? 'has-winner' : 'is-tie'}`; elements.overallSummary.innerHTML = winner ? `<div class="summary-icon" aria-hidden="true">${icon}</div><div class="summary-main"><p class="eyebrow">Overall winner</p><h2>${winner.name}</h2><p class="base-meta">Wins by ${displayMargin(result.overallMargin)} weighted overall points</p></div><div class="summary-stats"><strong>${stats.wins}<span>Wins</span></strong><strong>${result.ties}<span>${result.ties === 1 ? 'Tie' : 'Ties'}</span></strong><strong>${stats.losses}<span>Losses</span></strong></div><div class="summary-copy"><p><strong>Largest advantage</strong><br>${largest ? `${largest.label} (${displayMargin(largest.absoluteDifference)})` : 'No clear category advantage'}</p></div>` : `<div class="summary-main"><p class="eyebrow">Overall draw</p><h2>Overall draw</h2><p class="base-meta">The bases are level on weighted overall score.</p></div><div class="summary-stats"><strong>${result.baseAWins}<span>${result.baseA.name} wins</span></strong><strong>${result.ties}<span>${result.ties === 1 ? 'Tie' : 'Ties'}</span></strong><strong>${result.baseBWins}<span>${result.baseB.name} wins</span></strong></div>`; }
function radarPoints(metrics, side, cx, cy, radius) { return metrics.map((m, index) => { const angle = -Math.PI / 2 + (Math.PI * 2 * index / metrics.length); const score = Math.max(0, Math.min(MAX_SCORE, side === 'baseA' ? m.baseAValue || 0 : m.baseBValue || 0)); const r = radius * (score / MAX_SCORE); return `${(cx + Math.cos(angle) * r).toFixed(1)},${(cy + Math.sin(angle) * r).toFixed(1)}`; }).join(' '); }
function radarGrid(metrics, cx, cy, radius) { return [2,4,6,8,10].map((step) => `<polygon points="${radarPoints(metrics.map(m=>({...m,baseAValue:step})), 'baseA', cx, cy, radius)}" fill="none" stroke="var(--border-soft)" stroke-width="1"/>`).join(''); }
function radarLabels(metrics, cx, cy, radius) { return metrics.map((m, index) => { const angle = -Math.PI / 2 + (Math.PI * 2 * index / metrics.length); return `<text x="${(cx + Math.cos(angle) * (radius + 22)).toFixed(1)}" y="${(cy + Math.sin(angle) * (radius + 16)).toFixed(1)}" text-anchor="middle">${m.label}</text>`; }).join(''); }
function renderCategoryOverview(result) { const metrics = result.attributes; const summary = metrics.map((m) => `${m.label}: ${result.baseA.name} ${formatScore(m.baseAValue)}, ${result.baseB.name} ${formatScore(m.baseBValue)}`).join('; '); elements.categoryOverview.innerHTML = `<div class="category-count-card"><p class="winner-card-label">At a glance</p><div class="category-counts"><strong>${result.baseAWins}<span>${result.baseA.name} wins</span></strong><strong>${result.ties}<span>${result.ties === 1 ? 'Tie' : 'Ties'}</span></strong><strong>${result.baseBWins}<span>${result.baseB.name} wins</span></strong></div><p>${result.overallWinner === 'tie' ? 'The weighted overall score is even.' : `${baseForWinner(result, result.overallWinner).name} leads the weighted result.`}</p></div><figure class="radar-card"><svg class="comparison-radar" viewBox="0 0 360 300" role="img" aria-labelledby="radar-title radar-desc"><title id="radar-title">Category radar chart</title><desc id="radar-desc">${summary}</desc>${radarGrid(metrics,180,145,88)}<polygon points="${radarPoints(metrics,'baseA',180,145,88)}" class="radar-fill-a"/><polygon points="${radarPoints(metrics,'baseB',180,145,88)}" class="radar-fill-b"/>${radarLabels(metrics,180,145,88)}</svg><figcaption><span><i class="legend-a"></i>${result.baseA.name}</span><span><i class="legend-b"></i>${result.baseB.name}</span><span><i class="legend-tie"></i>Tie</span></figcaption></figure>`; }
function renderScoreRows(result) { elements.scoreBody.innerHTML = ''; elements.scoreBaseA.textContent = result.baseA.name; elements.scoreBaseB.textContent = result.baseB.name; result.metrics.forEach((metric) => { const aWin = metric.winner === 'baseA'; const bWin = metric.winner === 'baseB'; const item = document.createElement('article'); item.className = `score-comparison-row${metric.key === 'overall' ? ' is-overall' : ''}`; const aWidth = Math.max(0, Math.min(100, ((metric.baseAValue || 0) / MAX_SCORE) * 100)); const bWidth = Math.max(0, Math.min(100, ((metric.baseBValue || 0) / MAX_SCORE) * 100)); item.innerHTML = `<div class="score-metric"><strong>${metric.label}</strong><small>${metric.description || ''}</small></div><div class="score-bar-cell"><span class="score-num ${aWin ? 'score-cell-winner' : ''}">${formatScore(metric.baseAValue)}</span><div class="score-track" role="img" aria-label="${result.baseA.name} ${metric.label}: ${formatScore(metric.baseAValue)} out of 10, ${aWin ? 'leads' : bWin ? 'trails' : 'ties'}"><span class="score-fill score-fill-a" style="width:${aWidth}%"></span></div></div><div class="score-margin ${metric.winner === 'tie' ? 'score-difference-even' : 'score-difference-cell'}">${marginLabel(metric, result)}</div><div class="score-bar-cell score-bar-cell-b"><div class="score-track" role="img" aria-label="${result.baseB.name} ${metric.label}: ${formatScore(metric.baseBValue)} out of 10, ${bWin ? 'leads' : aWin ? 'trails' : 'ties'}"><span class="score-fill score-fill-b" style="width:${bWidth}%"></span></div><span class="score-num ${bWin ? 'score-cell-winner' : ''}">${formatScore(metric.baseBValue)}</span></div>`; elements.scoreBody.appendChild(item); }); }
function findingCard(label, title, body, meta) { return `<article class="insight-card"><p class="winner-card-label">${label}</p><h3>${title}</h3><p>${body}</p>${meta ? `<strong>${meta}</strong>` : ''}</article>`; }
function advantageSentence(metric, result) { const base = baseForWinner(result, metric.winner); return `${shortName(base)}'s strongest advantage is ${metric.label.toLowerCase()}.`; }
function renderFindings(result) { const winner = baseForWinner(result, result.overallWinner); const winnerEdge = result.overallWinner === 'baseA' ? result.largestBaseAAdvantage : result.overallWinner === 'baseB' ? result.largestBaseBAdvantage : result.biggestDecidingFactor; const weakness = result.overallWinner === 'baseA' ? result.largestBaseBAdvantage : result.overallWinner === 'baseB' ? result.largestBaseAAdvantage : null; elements.findings.innerHTML = findingCard('Key advantage', winnerEdge?.label || 'No clear edge', winnerEdge ? advantageSentence(winnerEdge, result) : 'No single metric separates the two bases.', winnerEdge ? `Gap ${formatDifference(winnerEdge.decisiveDifference)}` : '') + findingCard('Key weakness', weakness?.label || 'No clear weakness', weakness && winner ? `${winner.name} gives ground to ${baseForWinner(result, weakness.winner).name} in this category.` : `${winner ? winner.name : 'Neither base'} leads or ties across the relevant measured categories.`, weakness ? `Gap ${formatDifference(weakness.decisiveDifference)}` : '') + findingCard('Closest match', result.closestMetric?.label || 'No comparable metric', result.closestMetric ? `${result.closestMetric.winner === 'tie' ? 'The bases are even here.' : `Only ${formatDifference(result.closestMetric.decisiveDifference)} separates the two.`}` : 'No shared metric was available.', result.closestMetric ? marginLabel(result.closestMetric, result) : '') + findingCard('Score breakdown', `${result.baseAWins}-${result.baseBWins}-${result.ties}`, `${result.baseA.name}: ${result.baseAWins} wins. ${result.baseB.name}: ${result.baseBWins} wins. Ties: ${result.ties}.`, 'Non-overall metrics'); }

const METRIC_BENEFIT_COPY = {
  defensibility: 'Stronger defensive position',
  sustainability: 'Better long-term sustainability',
  isolation: 'Greater separation from threat pressure',
  exposure: 'Better control of practical exposure',
  maintenanceBurden: 'Easier upkeep and maintenance',
  populationCapacity: 'Better capacity for a larger group',
  resourceSecurity: 'More reliable access to resources'
};
function recommendationReasons(result) { if (result.overallWinner === 'tie') return []; return result.attributes.filter((metric) => metric.winner === result.overallWinner && (metric.absoluteDifference || 0) >= 2).sort((a,b)=>(b.absoluteDifference||0)-(a.absoluteDifference||0)).slice(0,4).map((metric) => METRIC_BENEFIT_COPY[metric.key] || `Advantage in ${metric.label.toLowerCase()}`); }
function alternativeNote(result) { if (result.overallWinner === 'tie') return ''; const losingSide = result.overallWinner === 'baseA' ? 'baseB' : 'baseA'; const loser = baseForWinner(result, losingSide); const win = result.attributes.filter((metric) => metric.winner === losingSide).sort((a,b)=>(b.absoluteDifference||0)-(a.absoluteDifference||0))[0]; if (win) return `Consider ${loser.name} if ${win.label.toLowerCase()} is your top priority.`; const tie = result.attributes.filter((metric) => metric.winner === 'tie').sort((a,b)=>(b.baseAValue||0)-(a.baseAValue||0))[0]; return tie ? `Consider ${loser.name} if matching ${tie.label.toLowerCase()} matters more than the weighted result.` : ''; }
function renderRecommendation(result) { const winner = baseForWinner(result, result.overallWinner); const reasons = recommendationReasons(result); const alt = alternativeNote(result); elements.recommendation.innerHTML = winner ? `<div class="recommendation-icon" aria-hidden="true">✓</div><div><p class="eyebrow">Recommendation</p><h3>${winner.name} is the stronger overall choice.</h3><p>${explanationFor(result)}</p></div><ul>${reasons.length ? reasons.map((reason)=>`<li>${reason}</li>`).join('') : '<li>The weighted overall model gives this base the edge.</li>'}</ul>${alt ? `<p class="alternative-note">${alt}</p>` : ''}` : `<div><p class="eyebrow">Recommendation</p><h3>This matchup is an overall draw.</h3><p>Use the tied and category-winning factors above to choose the better mission fit.</p></div>`; }
function renderStrengths(result) { elements.strengths.innerHTML = [ ['baseA', result.baseA], ['baseB', result.baseB] ].map(([side, base]) => { const wins = result.attributes.filter((m) => m.winner === side && (m.absoluteDifference || 0) >= 2).sort((a,b)=>(b.absoluteDifference||0)-(a.absoluteDifference||0)).slice(0,3); const losses = result.attributes.filter((m) => m.winner !== side && m.winner !== 'tie' && (m.absoluteDifference || 0) >= 2).sort((a,b)=>(b.absoluteDifference||0)-(a.absoluteDifference||0)).slice(0,2); return `<article class="tradeoff-card"><h3>${base.name}</h3><p class="winner-card-label">Strengths</p><ul>${wins.length ? wins.map((m)=>`<li>Leads in ${m.label} by ${formatDifference(m.decisiveDifference)}.</li>`).join('') : '<li>No decisive scoring advantages.</li>'}</ul><p class="winner-card-label">Trade-offs</p><ul>${losses.length ? losses.map((m)=>`<li>Trails in ${m.label} by ${formatDifference(m.decisiveDifference)}.</li>`).join('') : '<li>No clear scoring liabilities.</li>'}</ul></article>`; }).join(''); }
function verdictContext(result) { const overall = baseForWinner(result, result.overallWinner); if (!overall) return 'The weighted model does not produce a clear overall leader.'; const different = VERDICTS.map((v) => baseForWinner(result, result[v.key])).filter((winner) => winner && winner !== overall); if (!different.length) return `${overall.name} also aligns with the supporting scenario verdicts, so the recommendation is straightforward.`; const names = [...new Set(different.map((base) => base.name))].join(' and '); const edge = result.overallWinner === 'baseA' ? result.largestBaseAAdvantage : result.largestBaseBAdvantage; return `${overall.name} wins the weighted overall model${edge ? ` through ${edge.label.toLowerCase()} and related score strength` : ''}, while ${names} performs better in at least one scenario-specific verdict.`; }
function renderVerdicts(result) { const overall = baseForWinner(result, result.overallWinner); document.getElementById('verdict-heading').textContent = overall ? `${overall.name} is the stronger overall choice.` : 'This matchup is too close to call overall.'; const overallCard = `<article class="verdict-card verdict-card-primary"><p class="winner-card-label">Overall verdict</p><h3>${overall ? overall.name : 'Even'}</h3><p>${verdictContext(result)}</p></article>`; elements.verdicts.innerHTML = overallCard + VERDICTS.map((verdict) => { const side = result[verdict.key]; const winner = baseForWinner(result, side); return `<article class="verdict-card"><p class="winner-card-label">${verdict.title}</p><h3>${winner ? winner.name : 'Even'}</h3><p>${winner ? verdict.reason(winner) : 'The weighted score inputs are effectively even, so neither base has a deterministic edge here.'}</p></article>`; }).join(''); }
function populateSelect(select, bases, options = {}) { select.innerHTML = ''; if (options.placeholder) select.append(new Option(options.placeholder, '')); bases.filter((base) => preferredSlugFor(base) !== options.excludeSlug).slice().sort((a, b) => a.name.localeCompare(b.name)).forEach((base) => select.append(new Option(base.name, preferredSlugFor(base)))); if (options.value) select.value = options.value; }
function updatePickerButton() { const invalid = !elements.compareCurrentPrimary.value || !elements.compareCurrentSecondary.value || elements.compareCurrentPrimary.value === elements.compareCurrentSecondary.value; elements.compareCurrentButton.disabled = invalid; }
function updateMetadata(baseA, baseB) { if (!window.seo) return; const title = `${baseA.name} vs ${baseB.name} | Zombie Bases`; const description = `Compare ${baseA.name} and ${baseB.name} across survival scores, category winners, biggest advantages, and deterministic verdicts.`; const canonicalPath = `/base/${preferredSlugFor(baseA)}/vs/${preferredSlugFor(baseB)}`; const canonicalUrl = `${window.seo.PRODUCTION_ORIGIN}${canonicalPath}`; window.seo.applyPageMetadata({ title, description, canonicalPath, canonicalParams: null }); window.seo.applySocialMetadata({ title, description, url: canonicalUrl, type: 'website', image: `${window.seo.PRODUCTION_ORIGIN}/images/bases/${encodeURIComponent(preferredSlugFor(baseA))}.png` }); }
function pushCleanCompareUrl(baseA, baseB) { const cleanPath = compareUrl(preferredSlugFor(baseA), preferredSlugFor(baseB)); if (cleanPath) window.history.pushState({}, '', cleanPath); }
function syncCleanCompareUrl(baseA, baseB) { const cleanPath = compareUrl(preferredSlugFor(baseA), preferredSlugFor(baseB)); if (cleanPath && !isCleanCompareRoute()) window.history.replaceState({}, '', cleanPath); }
function renderComparison(baseA, baseB, bases) { const result = buildComparisonResult(baseA, baseB); elements.title.textContent = `${baseA.name} vs ${baseB.name}`; renderHeroCard(elements.heroA, baseA, 'baseA', result); renderHeroCard(elements.heroB, baseB, 'baseB', result); renderOverallSummary(result); renderCategoryOverview(result); renderScoreRows(result); renderRecommendation(result); renderStrengths(result); const slugA = preferredSlugFor(baseA); const slugB = preferredSlugFor(baseB); populateSelect(elements.compareCurrentPrimary, bases, { value: slugA, excludeSlug: slugB }); populateSelect(elements.compareCurrentSecondary, bases, { value: slugB, excludeSlug: slugA }); elements.compareCurrentPrimary.onchange = () => { populateSelect(elements.compareCurrentSecondary, bases, { value: elements.compareCurrentSecondary.value, excludeSlug: elements.compareCurrentPrimary.value }); updatePickerButton(); }; elements.compareCurrentSecondary.onchange = () => { populateSelect(elements.compareCurrentPrimary, bases, { value: elements.compareCurrentPrimary.value, excludeSlug: elements.compareCurrentSecondary.value }); updatePickerButton(); }; elements.compareCurrentButton.onclick = () => { const nextSlugA = elements.compareCurrentPrimary.value; const nextSlugB = elements.compareCurrentSecondary.value; if (!nextSlugA || !nextSlugB || nextSlugA === nextSlugB) return; const nextBaseA = slugHelper?.resolveBaseBySlug?.(bases, nextSlugA) || bases.find((base) => preferredSlugFor(base) === nextSlugA); const nextBaseB = slugHelper?.resolveBaseBySlug?.(bases, nextSlugB) || bases.find((base) => preferredSlugFor(base) === nextSlugB); if (!nextBaseA || !nextBaseB) return showNotFound(`We couldn't find ${[!nextBaseA ? nextSlugA : null, !nextBaseB ? nextSlugB : null].filter(Boolean).join(' and ')} in the current base dataset.`); pushCleanCompareUrl(nextBaseA, nextBaseB); renderComparison(nextBaseA, nextBaseB, bases); window.scrollTo({ top: 0, behavior: 'smooth' }); }; updatePickerButton(); syncCleanCompareUrl(baseA, baseB); updateMetadata(baseA, baseB); elements.status.textContent = ''; elements.setup.hidden = true; elements.notFound.hidden = true; elements.page.hidden = false; }
function getRequestedSlugs() { const params = new URLSearchParams(window.location.search); const cleanCompareSlugs = slugHelper?.getCompareSlugsFromLocation?.(window.location); if (cleanCompareSlugs) return { slugA: cleanCompareSlugs.baseSlug, slugB: cleanCompareSlugs.compareSlug }; return { slugA: params.get('a') || params.get('base') || '', slugB: params.get('b') || params.get('against') || '' }; }
function showNotFound(message) { elements.status.textContent = ''; elements.page.hidden = true; elements.setup.hidden = true; elements.notFoundMessage.textContent = message; elements.notFound.hidden = false; }
function showSetup(bases, slugA = '', slugB = '') {
  renderSetupRecommendations(bases);
  const baseA = slugA ? (slugHelper?.resolveBaseBySlug?.(bases, slugA) || bases.find((base) => preferredSlugFor(base) === slugA)) : null;
  const baseB = slugB ? (slugHelper?.resolveBaseBySlug?.(bases, slugB) || bases.find((base) => preferredSlugFor(base) === slugB)) : null;
  const primaryPanel = document.querySelector('[data-compare-side="primary"]');
  const secondaryPanel = document.querySelector('[data-compare-side="secondary"]');
  let primarySelector;
  let secondarySelector;
  const setHelp = (message) => { if (elements.setupHelp) elements.setupHelp.textContent = message; };
  const updateSetupButton = () => {
    const nextBaseA = primarySelector?.getSelected();
    const nextBaseB = secondarySelector?.getSelected();
    const duplicate = nextBaseA && nextBaseB && preferredSlugFor(nextBaseA) === preferredSlugFor(nextBaseB);
    const invalid = !nextBaseA || !nextBaseB || duplicate;
    elements.setupButton.disabled = invalid;
    if (duplicate) setHelp('Choose two different bases. The same location cannot be compared against itself.');
    else setHelp(invalid ? 'Choose two different bases to compare.' : 'Ready to see how they compare.');
    primarySelector?.refreshOptions?.();
    secondarySelector?.refreshOptions?.();
  };
  const duplicateWarning = (base) => { if (base) setHelp(`${base.name} is already selected on the other side.`); };
  primarySelector = attachCompareSelector(primaryPanel, bases, { onChange: updateSetupButton, onDuplicate: duplicateWarning }, baseA);
  secondarySelector = attachCompareSelector(secondaryPanel, bases, { onChange: updateSetupButton, onDuplicate: duplicateWarning }, baseB);
  primarySelector.setDuplicateCallbacks({ isDuplicate: (base) => preferredSlugFor(base) === preferredSlugFor(secondarySelector.getSelected()) });
  secondarySelector.setDuplicateCallbacks({ isDuplicate: (base) => preferredSlugFor(base) === preferredSlugFor(primarySelector.getSelected()) });
  elements.setupButton.onclick = () => {
    const nextBaseA = primarySelector?.getSelected();
    const nextBaseB = secondarySelector?.getSelected();
    if (nextBaseA && nextBaseB && preferredSlugFor(nextBaseA) !== preferredSlugFor(nextBaseB)) {
      pushCleanCompareUrl(nextBaseA, nextBaseB);
      renderComparison(nextBaseA, nextBaseB, bases);
    }
  };
  updateSetupButton();
  elements.status.textContent = '';
  elements.page.hidden = true;
  elements.notFound.hidden = true;
  elements.setup.hidden = false;
}
async function loadBasesData() { let lastError = null; for (const url of [DATA_URL, LEGACY_DATA_URL]) { try { const response = await fetch(url); if (!response.ok) { lastError = new Error(`Failed to load base data from ${url} (${response.status})`); continue; } const payload = await response.json(); if (Array.isArray(payload)) return payload; if (Array.isArray(payload?.bases)) return payload.bases; lastError = new Error(`Unexpected base data shape from ${url}`); } catch (error) { lastError = error; } } throw lastError || new Error('Unable to load base data'); }
async function initComparison() { if ([elements.status, elements.page, elements.setup, elements.notFound, elements.notFoundMessage].some((element) => !element)) return; elements.status.textContent = 'Loading comparison...'; try { const bases = await loadBasesData(); const { slugA, slugB } = getRequestedSlugs(); const baseA = slugA ? slugHelper?.resolveBaseBySlug?.(bases, slugA) || bases.find((base) => preferredSlugFor(base) === slugA) : null; const baseB = slugB ? slugHelper?.resolveBaseBySlug?.(bases, slugB) || bases.find((base) => preferredSlugFor(base) === slugB) : null; if (slugA && slugB && preferredSlugFor(slugA) === preferredSlugFor(slugB)) return showNotFound('Choose two different bases to compare. This comparison URL uses the same base on both sides.'); if ((slugA && !baseA) || (slugB && !baseB)) return showNotFound(`We couldn't find ${[slugA && !baseA ? slugA : null, slugB && !baseB ? slugB : null].filter(Boolean).join(' and ')} in the current base dataset.`); if (!baseA || !baseB) return showSetup(bases, baseA ? preferredSlugFor(baseA) : slugA, baseB ? preferredSlugFor(baseB) : slugB); renderComparison(baseA, baseB, bases); } catch (error) { console.error(error); showNotFound('The comparison data could not be loaded. Please try again later.'); } }
window.zombieBasesComparison = { SCORE_ROWS, buildComparisonResult, buildBaseComparison: buildComparisonResult, formatScore, formatDifference };
initComparison();
})();
