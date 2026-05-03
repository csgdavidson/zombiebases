(function () {
  const PRODUCTION_ORIGIN = 'https://zombiebases.com';
  const BRAND_NAME = 'Zombie Bases';
  const DEFAULT_TITLE = 'Zombie Bases | Survival Base Directory';
  const DEFAULT_DESCRIPTION = 'Explore zombie survival base locations by region and type, with list and map views for quick comparison.';
  const DEFAULT_IMAGE = `${PRODUCTION_ORIGIN}/images/bases/placeholder.png`;

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

  window.seo = {
    PRODUCTION_ORIGIN,
    BRAND_NAME,
    DEFAULT_TITLE,
    DEFAULT_DESCRIPTION,
    DEFAULT_IMAGE,
    applyPageMetadata,
    applySocialMetadata,
    normalizeImageUrl,
    truncateDescription
  };
})();
