const DATA_URL = './data/bases-index.json';

const state = {
  bases: [],
  filteredBases: []
};

const elements = {
  regionFilter: document.getElementById('region-filter'),
  typeFilter: document.getElementById('type-filter'),
  list: document.getElementById('bases-list'),
  status: document.getElementById('status')
};

function uniqueValues(items, key) {
  return [...new Set(items.map((item) => item[key]))].sort();
}

function populateFilter(selectElement, values) {
  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    selectElement.appendChild(option);
  });
}

function matchesFilters(base, region, type) {
  const matchesRegion = !region || base.region === region;
  const matchesType = !type || base.type === type;
  return matchesRegion && matchesType;
}

function renderBaseList(items) {
  elements.list.innerHTML = '';

  if (!items.length) {
    const emptyMessage = document.createElement('li');
    emptyMessage.className = 'empty-state';
    emptyMessage.textContent = 'No bases match the selected filters.';
    elements.list.appendChild(emptyMessage);
    return;
  }

  items.forEach((base) => {
    const listItem = document.createElement('li');
    listItem.className = 'base-card';

    const link = document.createElement('a');
    link.href = `./bases/${base.slug}.html`;
    link.textContent = base.name;

    const meta = document.createElement('p');
    meta.className = 'base-meta';
    meta.textContent = `${base.type} • ${base.region}`;

    listItem.append(link, meta);
    elements.list.appendChild(listItem);
  });
}

function applyFilters() {
  const region = elements.regionFilter.value;
  const type = elements.typeFilter.value;

  state.filteredBases = state.bases.filter((base) => matchesFilters(base, region, type));
  renderBaseList(state.filteredBases);
}

async function loadBases() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to load bases data (${response.status})`);
    }

    state.bases = await response.json();

    populateFilter(elements.regionFilter, uniqueValues(state.bases, 'region'));
    populateFilter(elements.typeFilter, uniqueValues(state.bases, 'type'));

    applyFilters();
    elements.status.textContent = '';
  } catch (error) {
    elements.status.textContent = 'Could not load base data. Please try again later.';
    console.error(error);
  }
}

if (elements.regionFilter && elements.typeFilter && elements.list) {
  elements.regionFilter.addEventListener('change', applyFilters);
  elements.typeFilter.addEventListener('change', applyFilters);
  loadBases();
}
