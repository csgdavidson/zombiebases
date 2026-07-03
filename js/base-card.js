(function initBaseCardRenderer() {
  const SCENARIO_BADGES = {
    short_term_refuge: ['Fast defence', 'Low setup'],
    long_term_survival: ['Resource depth', 'Sustainable'],
    community_bases: ['High control', 'Sustainable'],
    high_risk_high_reward: ['High exposure', 'All-in']
  };

  function scoreToneClass(value) {
    if (!Number.isFinite(value)) return '';
    if (value >= 8) return 'score-high';
    if (value >= 5) return 'score-medium';
    return 'score-low';
  }

  function createThumbnail(slug, name) {
    const image = document.createElement('img');
    image.className = 'base-card-thumb';
    image.src = `/images/generated/card-thumbs/${slug}.png`;
    image.alt = `${name} thumbnail`;
    image.width = 112;
    image.height = 63;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.addEventListener('error', () => {
      image.src = '/images/generated/card-thumbs/placeholder.png';
    }, { once: true });
    return image;
  }

  function appendBadges(row, tags, scenarioId) {
    const seen = new Set();
    const pushBadge = (value, className) => {
      if (!value || seen.has(value)) return;
      seen.add(value);
      const badge = document.createElement('span');
      badge.className = className;
      badge.textContent = value;
      row.appendChild(badge);
    };

    (tags || []).forEach((tag) => pushBadge(tag, 'badge badge-trait'));
    (SCENARIO_BADGES[scenarioId] || []).slice(0, 2).forEach((badge) => {
      if (!seen.has(badge)) {
        pushBadge(badge, 'badge badge-scenario');
      }
    });
  }

  function createBaseCard({ slug, name, href, metaText, description, score, rank, tags, scenarioId }) {
    const listItem = document.createElement('li');
    listItem.className = 'base-card-item';

    const card = document.createElement('a');
    card.className = 'base-card-link';
    card.href = href;

    card.appendChild(createThumbnail(slug, name));

    const content = document.createElement('div');
    content.className = 'base-card-content';

    const title = document.createElement('p');
    title.className = 'base-card-title';
    title.textContent = name;

    const meta = document.createElement('p');
    meta.className = 'base-meta';
    meta.textContent = metaText;

    const tagRow = document.createElement('p');
    tagRow.className = 'card-badge-row';
    appendBadges(tagRow, tags, scenarioId);

    const summary = document.createElement('p');
    summary.className = 'base-summary base-summary-clamp';
    summary.textContent = description;

    const aside = document.createElement('div');
    aside.className = 'base-card-aside';
    if (Number.isFinite(score)) {
      const scoreEl = document.createElement('span');
      scoreEl.className = `base-score-pill ${scoreToneClass(score)}`.trim();
      scoreEl.textContent = score.toFixed(1);
      aside.appendChild(scoreEl);
    }
    if (Number.isFinite(rank)) {
      const rankEl = document.createElement('span');
      rankEl.className = 'ranking-chip';
      rankEl.textContent = `#${rank}`;
      aside.appendChild(rankEl);
    }

    content.append(title, meta, tagRow, summary);
    card.append(content, aside);
    listItem.appendChild(card);

    return listItem;
  }

  window.baseCardRenderer = { createBaseCard, SCENARIO_BADGES };
})();
