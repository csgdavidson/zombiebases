(function () {
  function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  function safeText(value) {
    if (value === undefined || value === null) {
      return '';
    }
    return String(value).trim();
  }

  function normalizeSlugCandidate(value) {
    if (!isNonEmptyString(value)) {
      return '';
    }

    return value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
  }

  function deriveSlug(baseOrValue) {
    if (typeof baseOrValue === 'string') {
      return normalizeSlugCandidate(baseOrValue);
    }

    if (!baseOrValue || typeof baseOrValue !== 'object') {
      return '';
    }

    if (isNonEmptyString(baseOrValue.slug)) {
      return normalizeSlugCandidate(baseOrValue.slug);
    }

    if (isNonEmptyString(baseOrValue.id)) {
      return normalizeSlugCandidate(baseOrValue.id);
    }

    return normalizeSlugCandidate(baseOrValue.name);
  }

  function listLegacySlugs(base) {
    if (!base || typeof base !== 'object') {
      return [];
    }

    if (Array.isArray(base.legacy_slugs)) {
      return base.legacy_slugs.filter(isNonEmptyString);
    }

    if (isNonEmptyString(base.legacy_slug)) {
      return [base.legacy_slug];
    }

    return [];
  }

  function buildCandidates(base) {
    if (!base || typeof base !== 'object') {
      return [];
    }

    const candidates = [
      base.slug,
      ...listLegacySlugs(base),
      base.id,
      base.name
    ];

    return candidates
      .filter(isNonEmptyString)
      .map((value) => normalizeSlugCandidate(value));
  }

  function getPreferredSlug(base) {
    return deriveSlug(base);
  }

  function getBaseUrl(baseOrSlug) {
    const slug = getPreferredSlug(baseOrSlug);
    if (!slug) {
      return '/';
    }
    return `/${encodeURIComponent(slug)}`;
  }

  function getCompareSetupUrl(baseOrSlug) {
    const slug = getPreferredSlug(baseOrSlug);
    const params = new URLSearchParams();
    if (slug) {
      params.set('base', slug);
    }
    const query = params.toString();
    return query ? `/compare.html?${query}` : '/compare.html';
  }

  function getCompareUrl(baseA, baseB) {
    const slugA = getPreferredSlug(baseA);
    const slugB = getPreferredSlug(baseB);
    if (!slugA || !slugB) {
      return getCompareSetupUrl(slugA || slugB || '');
    }
    return `/base/${encodeURIComponent(slugA)}/vs/${encodeURIComponent(slugB)}`;
  }

  function getCompareSlugsFromLocation(location = window.location) {
    const pathParts = safeText(location.pathname || '')
      .split('/')
      .filter(Boolean)
      .map((part) => normalizeSlugCandidate(decodeURIComponent(part)));
    const baseIndex = pathParts.findIndex((part) => part === 'base');
    const vsIndex = pathParts.findIndex((part) => part === 'vs');

    if (baseIndex !== -1 && vsIndex === baseIndex + 2 && pathParts[baseIndex + 1] && pathParts[vsIndex + 1]) {
      return { baseSlug: pathParts[baseIndex + 1], compareSlug: pathParts[vsIndex + 1] };
    }

    return null;
  }

  function isCompareRoute(location = window.location) {
    return Boolean(getCompareSlugsFromLocation(location));
  }

  function getBaseSlugFromLocation(location = window.location) {
    const params = new URLSearchParams(location.search || '');
    const fromQuery = normalizeSlugCandidate(params.get('slug') || '');
    if (fromQuery) {
      return fromQuery;
    }

    if (isCompareRoute(location)) {
      return '';
    }

    const path = safeText(location.pathname || '').replace(/^\/+|\/+$/g, '');
    if (!path || path.toLowerCase() === 'base.html' || path.toLowerCase() === 'index.html') {
      return '';
    }

    return normalizeSlugCandidate(decodeURIComponent(path.split('/').pop() || ''));
  }

  function resolveBaseBySlug(bases, slugValue) {
    const target = normalizeSlugCandidate(slugValue);
    if (!target || !Array.isArray(bases) || !bases.length) {
      return null;
    }

    const byExplicitSlug = bases.find((base) => normalizeSlugCandidate(base?.slug) === target);
    if (byExplicitSlug) {
      return byExplicitSlug;
    }

    const byLegacyOrDerived = bases.find((base) => buildCandidates(base).includes(target));
    return byLegacyOrDerived || null;
  }

  function formatScore(score) {
    return Number.isFinite(score) ? `${score.toFixed(1)}/10` : '';
  }

  function getScoreTierBadge(base) {
    const overall = base?.scores?.overall;
    if (!Number.isFinite(overall)) return null;
    if (overall >= 9) return 'Elite';
    if (overall >= 8) return 'Exceptional';
    if (overall >= 7) return 'Strong';
    if (overall >= 6) return 'Viable';
    if (overall >= 4) return 'Fragile';
    return 'Non-viable';
  }

  function getIdentityBadge(base) {
    const categories = base?.scores?.categories || {};
    const overall = base?.scores?.overall;
    const defensibility = Number.isFinite(categories.defensibility) ? categories.defensibility : 0;
    const isolation = Number.isFinite(categories.isolation) ? categories.isolation : 0;
    const sustainability = Number.isFinite(categories.sustainability) ? categories.sustainability : 0;
    const values = [defensibility, isolation, sustainability].filter(Number.isFinite);

    if (!Number.isFinite(overall) && !values.length) {
      return null;
    }
    if (overall < 4 || values.every((value) => value < 4)) return 'Trap';
    if (sustainability < 5) return 'Fragile';
    if (isolation >= 8 && sustainability >= 8) return 'Long-term';
    if (defensibility >= 8 && isolation >= 8) return 'Defensive';
    return 'Balanced';
  }

  function getTraitBadges(base) {
    const categories = base?.scores?.categories || {};
    const badges = [];
    if (categories.defensibility >= 8) badges.push('High defence');
    if (categories.isolation >= 8) badges.push('High isolation');
    if (categories.sustainability >= 8) badges.push('High sustainability');
    return badges;
  }

  function getBaseBadges(base, max = 4) {
    return [getScoreTierBadge(base), getIdentityBadge(base), ...getTraitBadges(base)]
      .filter(Boolean)
      .slice(0, max);
  }

  function renderBadges(badges) {
    return (badges || [])
      .map((badge) => `<span class=\"badge badge-trait\">${safeText(badge)}</span>`)
      .join('');
  }

  function createOrUpdateMetaTag(selector, attributes) {
    let tag = document.querySelector(selector);
    if (!tag) {
      tag = document.createElement('meta');
      document.head.appendChild(tag);
    }
    Object.entries(attributes || {}).forEach(([key, value]) => {
      if (isNonEmptyString(value)) {
        tag.setAttribute(key, value);
      }
    });
    return tag;
  }

  function createOrUpdateCanonical(url) {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    if (isNonEmptyString(url)) {
      link.setAttribute('href', url);
    }
    return link;
  }

  window.baseSlugHelper = {
    deriveSlug,
    getPreferredSlug,
    getBaseUrl,
    getCompareSetupUrl,
    getCompareUrl,
    getCompareSlugsFromLocation,
    isCompareRoute,
    getBaseSlugFromLocation,
    resolveBaseBySlug,
    normalizeSlugCandidate,
    formatScore,
    getScoreTierBadge,
    getIdentityBadge,
    getTraitBadges,
    getBaseBadges,
    renderBadges,
    safeText,
    createOrUpdateMetaTag,
    createOrUpdateCanonical
  };
})();
