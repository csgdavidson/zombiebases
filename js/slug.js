(function () {
  function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
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

  window.baseSlugHelper = {
    deriveSlug,
    getPreferredSlug,
    resolveBaseBySlug,
    normalizeSlugCandidate
  };
})();
