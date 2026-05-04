const RANKINGS_URL = './data/rankings.json';

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

const slugHelper = window.baseSlugHelper;

const elements = {
  title: document.getElementById('rankings-title'),
  subtitle: document.getElementById('rankings-subtitle'),
  status: document.getElementById('rankings-status'),
  list: document.getElementById('rankings-list'),
  empty: document.getElementById('rankings-empty'),
  groupSelect: document.getElementById('rankings-group-select')
};

function toTitleCaseSlug(value) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function labelFor(kind, value) {
  return LABELS[kind]?.[value] ?? toTitleCaseSlug(value);
}

function getMode() {
  return document.body.dataset.rankingsMode || 'global';
}

function getGroupParam(mode) {
  return mode === 'region' ? 'region' : 'type';
}

function updateQueryParameter(key, value) {
  const params = new URLSearchParams(window.location.search);
  params.set(key, value);
  const query = params.toString();
  const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.replaceState({}, '', url);
}

function createBaseUrl(slug) {
  return slugHelper?.getBaseUrl ? slugHelper.getBaseUrl(slug) : `/${encodeURIComponent(slug)}`;
}

function applyRankingsMetadata({ title, description, canonicalPath }) {
  if (!window.seo) {
    return;
  }

  window.seo.applyPageMetadata({
    title,
    description,
    canonicalPath
  });

  window.seo.applySocialMetadata({
    title,
    description,
    url: `${window.seo.PRODUCTION_ORIGIN}${canonicalPath}`,
    type: 'website',
    image: window.seo.DEFAULT_IMAGE
  });
}

function updateRankingsItemListJsonLd(title, description, entries) {
  if (!window.seo) {
    return;
  }
  window.seo.setJsonLd('rankings-itemlist', {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    description,
    itemListElement: (entries || []).map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      url: `${window.seo.PRODUCTION_ORIGIN}${createBaseUrl(entry.slug)}`
    }))
  });
}



function summarize(entry) {
  if (typeof entry.summary === 'string' && entry.summary.trim()) {
    return entry.summary.trim();
  }

  return 'Summary coming soon.';
}

function renderList(entries, mode) {
  elements.list.innerHTML = '';
  elements.empty.hidden = entries.length > 0;

  entries.forEach((entry) => {
    const topPercent = Math.max(1, Math.round(entry.percentile));
    const qualifiers = [`Top ${topPercent}%`];

    if (mode === 'global') {
      qualifiers.unshift(`${labelFor('region', entry.region)} • ${labelFor('type', entry.type)}`);
    }

    const item = window.baseCardRenderer.createBaseCard({
      slug: entry.slug,
      name: entry.name,
      href: createBaseUrl(entry.slug),
      metaText: qualifiers.join(' • '),
      description: summarize(entry),
      score: entry.overall,
      rank: entry.rank,
      tags: [],
      scenarioId: null
    });
    elements.list.appendChild(item);
  });
}

function configureGroupPage(mode, rankings) {
  const groupKey = getGroupParam(mode);
  const params = new URLSearchParams(window.location.search);
  const groups = Object.keys(rankings).sort((a, b) => labelFor(groupKey, a).localeCompare(labelFor(groupKey, b)));

  if (!groups.length) {
    elements.status.textContent = 'No rankings available.';
    renderList([], mode);
    return;
  }

  elements.groupSelect.innerHTML = '';

  groups.forEach((group) => {
    const option = document.createElement('option');
    option.value = group;
    option.textContent = labelFor(groupKey, group);
    elements.groupSelect.appendChild(option);
  });

  const selectedGroup = params.get(groupKey);
  const activeGroup = groups.includes(selectedGroup) ? selectedGroup : groups[0];
  elements.groupSelect.value = activeGroup;
  if (selectedGroup !== activeGroup) {
    updateQueryParameter(groupKey, activeGroup);
  }

  const entries = rankings[activeGroup] || [];
  const groupLabel = labelFor(groupKey, activeGroup);
  elements.title.textContent = mode === 'region' ? `Best Bases in ${groupLabel}` : `Best ${groupLabel} Bases`;
  elements.subtitle.textContent = `Ranked by overall score within ${groupLabel}.`;
  applyRankingsMetadata({
    title: `Top Zombie Survival Bases by ${groupLabel} | Zombie Bases`,
    description: `Discover the best survival bases by ${groupLabel}. Compare top locations based on defensibility, isolation, and long-term sustainability.`,
    canonicalPath: mode === 'region' ? '/rankings-region.html' : '/rankings-type.html'
  });
  elements.status.textContent = '';
  renderList(entries, mode);
  updateRankingsItemListJsonLd(elements.title.textContent, elements.subtitle.textContent, entries);

  elements.groupSelect.addEventListener('change', () => {
    const chosenGroup = elements.groupSelect.value;
    updateQueryParameter(groupKey, chosenGroup);
    const chosenEntries = rankings[chosenGroup] || [];
    const chosenLabel = labelFor(groupKey, chosenGroup);
    elements.title.textContent = mode === 'region' ? `Best Bases in ${chosenLabel}` : `Best ${chosenLabel} Bases`;
    elements.subtitle.textContent = `Ranked by overall score within ${chosenLabel}.`;
    applyRankingsMetadata({
      title: `Top Zombie Survival Bases by ${chosenLabel} | Zombie Bases`,
      description: `Discover the best survival bases by ${chosenLabel}. Compare top locations based on defensibility, isolation, and long-term sustainability.`,
      canonicalPath: mode === 'region' ? '/rankings-region.html' : '/rankings-type.html'
    });
    renderList(chosenEntries, mode);
    updateRankingsItemListJsonLd(elements.title.textContent, elements.subtitle.textContent, chosenEntries);
  });
}

async function initRankingsPage() {
  if (!elements.list || !elements.status) {
    return;
  }

  const mode = getMode();
  elements.status.textContent = 'Loading rankings...';

  try {
    const response = await fetch(RANKINGS_URL);
    if (!response.ok) {
      throw new Error(`Failed to load rankings (${response.status})`);
    }

    const payload = await response.json();
    if (mode === 'global') {
      applyRankingsMetadata({
        title: 'Top Zombie Survival Bases by Overall | Zombie Bases',
        description: 'Discover the best survival bases by Overall. Compare top locations based on defensibility, isolation, and long-term sustainability.',
        canonicalPath: '/rankings.html'
      });
      elements.status.textContent = '';
      renderList(payload.global || [], mode);
      updateRankingsItemListJsonLd(
        'Top Zombie Survival Bases by Overall',
        'Discover the best survival bases by Overall. Compare top locations based on defensibility, isolation, and long-term sustainability.',
        payload.global || []
      );
      return;
    }

    const groupedRankings = mode === 'region' ? payload.byRegion : payload.byType;
    configureGroupPage(mode, groupedRankings || {});
  } catch (error) {
    console.error(error);
    elements.status.textContent = 'Unable to load rankings right now.';
    renderList([], mode);
  }
}

initRankingsPage();
