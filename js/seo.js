(function () {
  const PRODUCTION_ORIGIN = 'https://zombiebases.com';
  const BRAND_NAME = 'Zombie Bases';
  const DEFAULT_TITLE = 'Zombie Bases | Survival Base Directory';
  const DEFAULT_DESCRIPTION = 'Explore zombie survival base locations by region and type, with list and map views for quick comparison.';
  const DEFAULT_IMAGE = '/logo.png';

  function cleanText(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function ensureMetaDescription() {
    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', 'description');
      document.head.appendChild(tag);
    }
    return tag;
  }

  function ensureCanonical() {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    return link;
  }

  function ensureMetaTag(selector, attributes) {
    let tag = document.querySelector(selector);
    if (!tag) {
      tag = document.createElement('meta');
      document.head.appendChild(tag);
    }

    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        tag.setAttribute(key, value);
      }
    });

    return tag;
  }

  function buildCanonicalUrl(pathname, params = null) {
    const url = new URL(PRODUCTION_ORIGIN);
    url.pathname = pathname;
    url.search = params ? params.toString() : '';
    url.hash = '';
    return url.toString();
  }

  function applyPageMetadata({ title, description, canonicalPath, canonicalParams = null }) {
    document.title = cleanText(title) || DEFAULT_TITLE;
    ensureMetaDescription().setAttribute('content', cleanText(description) || DEFAULT_DESCRIPTION);

    if (canonicalPath) {
      ensureCanonical().setAttribute('href', buildCanonicalUrl(canonicalPath, canonicalParams));
    }
  }

  function normalizeImageUrl(imageUrl) {
    const value = cleanText(imageUrl);
    if (!value) {
      return DEFAULT_IMAGE;
    }

    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }

    if (value.startsWith('/')) {
      return `${PRODUCTION_ORIGIN}${value}`;
    }

    return `${PRODUCTION_ORIGIN}/${value}`;
  }

  function applySocialMetadata({ title, description, url, type = 'website', image }) {
    const normalizedTitle = cleanText(title) || DEFAULT_TITLE;
    const normalizedDescription = cleanText(description) || DEFAULT_DESCRIPTION;
    const normalizedImage = normalizeImageUrl(image);

    ensureMetaTag('meta[property="og:title"]', { property: 'og:title', content: normalizedTitle });
    ensureMetaTag('meta[property="og:description"]', { property: 'og:description', content: normalizedDescription });
    if (cleanText(url)) {
      ensureMetaTag('meta[property="og:url"]', { property: 'og:url', content: cleanText(url) });
    }
    ensureMetaTag('meta[property="og:type"]', { property: 'og:type', content: cleanText(type) || 'website' });
    ensureMetaTag('meta[property="og:image"]', { property: 'og:image', content: normalizedImage });

    ensureMetaTag('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    ensureMetaTag('meta[name="twitter:title"]', { name: 'twitter:title', content: normalizedTitle });
    ensureMetaTag('meta[name="twitter:description"]', { name: 'twitter:description', content: normalizedDescription });
    ensureMetaTag('meta[name="twitter:image"]', { name: 'twitter:image', content: normalizedImage });
  }

  function truncateDescription(value, maxLength = 160) {
    const normalized = cleanText(value).replace(/\s+/g, ' ');
    if (!normalized || normalized.length <= maxLength) {
      return normalized;
    }

    const clipped = normalized.slice(0, maxLength - 1);
    const cutoff = clipped.lastIndexOf(' ');
    return `${(cutoff > 100 ? clipped.slice(0, cutoff) : clipped).trim()}…`;
  }

  function sanitizeStructuredData(value) {
    if (Array.isArray(value)) {
      const sanitizedArray = value
        .map((item) => sanitizeStructuredData(item))
        .filter((item) => item !== undefined);
      return sanitizedArray.length ? sanitizedArray : undefined;
    }

    if (value && typeof value === 'object') {
      const sanitizedObject = {};
      Object.entries(value).forEach(([key, nestedValue]) => {
        const sanitizedValue = sanitizeStructuredData(nestedValue);
        if (sanitizedValue !== undefined) {
          sanitizedObject[key] = sanitizedValue;
        }
      });
      return Object.keys(sanitizedObject).length ? sanitizedObject : undefined;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed ? trimmed : undefined;
    }

    if (Number.isFinite(value) || typeof value === 'boolean') {
      return value;
    }

    return undefined;
  }

  function stableStringify(value) {
    if (Array.isArray(value)) {
      return `[${value.map((item) => stableStringify(item)).join(',')}]`;
    }
    if (value && typeof value === 'object') {
      const keys = Object.keys(value).sort();
      const entries = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`);
      return `{${entries.join(',')}}`;
    }
    return JSON.stringify(value);
  }

  function setJsonLd(key, schemaObject) {
    const normalizedKey = cleanText(key);
    if (!normalizedKey || !schemaObject || typeof schemaObject !== 'object') {
      return;
    }

    const sanitized = sanitizeStructuredData(schemaObject);
    if (!sanitized || typeof sanitized !== 'object') {
      return;
    }

    const nextPayload = `${JSON.stringify(sanitized, null, 2)}\n`;
    const nextHash = stableStringify(sanitized);
    const scriptSelector = `script[type="application/ld+json"][data-zb-jsonld-key="${normalizedKey}"]`;
    let script = document.head.querySelector(scriptSelector);

    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-zb-jsonld-key', normalizedKey);
      document.head.appendChild(script);
    }

    const duplicateCandidates = document.head.querySelectorAll('script[type="application/ld+json"]');
    duplicateCandidates.forEach((candidate) => {
      if (candidate === script) {
        return;
      }
      const candidateKey = cleanText(candidate.getAttribute('data-zb-jsonld-key'));
      if (candidateKey === normalizedKey) {
        candidate.remove();
      }
    });

    if (script.getAttribute('data-zb-jsonld-hash') !== nextHash || script.textContent !== nextPayload) {
      script.textContent = nextPayload;
      script.setAttribute('data-zb-jsonld-hash', nextHash);
    }
  }

  window.seo = {
    PRODUCTION_ORIGIN,
    BRAND_NAME,
    DEFAULT_TITLE,
    DEFAULT_DESCRIPTION,
    DEFAULT_IMAGE,
    applyPageMetadata,
    applySocialMetadata,
    normalizeImageUrl,
    truncateDescription,
    setJsonLd
  };
})();
