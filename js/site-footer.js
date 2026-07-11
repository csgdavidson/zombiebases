(() => {
  const FOOTER_ID = 'site-footer';
  const STATS_URL = '/data/base-stats.json';

  const footerGroups = [
    {
      title: 'Explore',
      ariaLabel: 'Footer explore navigation',
      links: [
        { label: 'Overall Rankings', href: '/rankings.html' },
        { label: 'Regions', href: '/rankings-region.html' },
        { label: 'Base Types', href: '/rankings-type.html' },
        { label: 'Compare Bases', href: '/compare.html' },
        { label: 'Survival Quiz', href: '/quiz/' },
        { label: 'Field Manual', href: '/field-manual' }
      ]
    },
    {
      title: 'Field Manual',
      ariaLabel: 'Footer field manual navigation',
      links: [
        { label: 'Read the Field Manual', href: '/field-manual' },
        { label: 'How locations are scored', href: '/field-manual#how-zombie-bases-scores-every-location' },
        { label: 'Survival factors', href: '/field-manual#the-seven-survival-factors' }
      ]
    }
  ];

  const icons = {
    map: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Zm0 0V3m6 18V6"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 3v4m10-4v4M4 9h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/></svg>',
    document: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm7 0v6h5M9 14h6M9 18h6"/></svg>'
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);
  }

  function formatMonthYear(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
  }

  function locationLabel(count) {
    const normalized = Number(count);
    if (!Number.isFinite(normalized)) return '';
    return `${normalized.toLocaleString('en')} ${normalized === 1 ? 'location' : 'locations'}`;
  }

  function buildLinkGroup(group) {
    return `
      <nav class="site-footer-group" aria-label="${escapeHtml(group.ariaLabel)}">
        <h2 class="site-footer-heading">${escapeHtml(group.title)}</h2>
        <ul class="site-footer-links">
          ${group.links.map((link) => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`).join('')}
        </ul>
      </nav>`;
  }

  function buildIndexItems(metadata) {
    const items = [];
    const count = locationLabel(metadata.locationCount);
    if (count) items.push({ icon: icons.map, label: count });
    if (metadata.lastUpdated) items.push({ icon: icons.calendar, label: `Last updated ${metadata.lastUpdated}` });
    if (metadata.version) items.push({ icon: icons.document, label: `Version ${metadata.version}` });
    return items.map((item) => `<li>${item.icon}<span>${escapeHtml(item.label)}</span></li>`).join('');
  }

  function renderFooter(metadata) {
    if (document.getElementById(FOOTER_ID)) return;
    const footer = document.createElement('footer');
    footer.id = FOOTER_ID;
    footer.className = 'site-footer';
    footer.innerHTML = `
      <div class="site-footer-inner">
        <div class="site-footer-primary">
          <section class="site-footer-brand" aria-label="Zombie Bases">
            <a class="site-footer-logo" href="/" aria-label="Zombie Bases home"><img src="/logo.png" alt="Zombie Bases"></a>
            <p>Real-world survival locations ranked using a consistent scoring framework focused on long-term resilience rather than fantasy.</p>
          </section>
          ${footerGroups.map(buildLinkGroup).join('')}
          <section class="site-footer-index" aria-labelledby="site-footer-index-title">
            <h2 id="site-footer-index-title" class="site-footer-heading">Field Index</h2>
            <ul>${buildIndexItems(metadata)}</ul>
          </section>
        </div>
        <div class="site-footer-bottom" aria-label="Footer notes">
          <span>© ${new Date().getFullYear()} ZombieBases</span>
          <span>Real places. Long-term survival.</span>
          <span>Built for survivability, not fantasy.</span>
        </div>
      </div>`;
    document.body.append(footer);
  }

  async function getPublicSiteMetadata() {
    try {
      const response = await fetch(STATS_URL, { cache: 'force-cache' });
      if (!response.ok) throw new Error(`Stats request failed: ${response.status}`);
      const stats = await response.json();
      return {
        locationCount: stats.totalBases ?? stats.global?.count,
        lastUpdated: formatMonthYear(stats.generatedAt)
      };
    } catch (error) {
      console.warn('Unable to load public site metadata for footer.', error);
      return {};
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const metadata = await getPublicSiteMetadata();
    renderFooter(metadata);
  });
})();
