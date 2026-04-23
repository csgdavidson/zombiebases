(function () {
  const PRODUCTION_ORIGIN = 'https://zombiebases.com';
  const BRAND_NAME = 'Zombie Bases';
  const DEFAULT_TITLE = 'Zombie Bases | Survival Base Directory';
  const DEFAULT_DESCRIPTION = 'Explore zombie survival base locations by region and type, with list and map views for quick comparison.';

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
    applyPageMetadata,
    truncateDescription
  };
})();
