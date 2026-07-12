(() => {
  const FOOTER_ID = 'site-footer';
  const STATS_URL = '/data/base-stats.json';

  const footerGroups = [
    {
      title: 'Discover',
      ariaLabel: 'Footer discover navigation',
      links: [
        { label: 'Explore all bases', href: '/' },
        { label: 'Rankings', href: '/rankings.html' },
        { label: 'Compare bases', href: '/compare.html' },
        { label: 'Survival Quiz', href: '/quiz/' },
        { label: 'Random Base', href: '#random-base', random: true }
      ]
    },
    {
      title: 'Browse',
      ariaLabel: 'Footer browse navigation',
      links: [
        { label: 'Regions', href: '/rankings-region.html' },
        { label: 'Base Types', href: '/rankings-type.html' },
        { label: 'Scenarios', href: '/scenarios.html' }
      ]
    },
    {
      title: 'Learn',
      ariaLabel: 'Footer learn navigation',
      links: [
        { label: 'Field Manual', href: '/field-manual' },
        { label: 'How locations are scored', href: '/field-manual#how-zombie-bases-scores-every-location' },
        { label: 'Survival factors', href: '/field-manual#the-seven-survival-factors' }
      ]
    }
  ];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);
  }

  function formatMonthYear(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
  }



  function footerIntro(metadata) {
    const count = Number(metadata.locationCount);
    if (Number.isFinite(count)) return `Explore ${count.toLocaleString('en')} real-world survival locations ranked for long-term resilience.`;
    return 'Explore real-world survival locations ranked for long-term resilience.';
  }

  function buildLinkGroup(group) {
    return `
      <nav class="site-footer-group" aria-label="${escapeHtml(group.ariaLabel)}">
        <h2 class="site-footer-heading">${escapeHtml(group.title)}</h2>
        <ul class="site-footer-links">
          ${group.links.map((link) => `<li><a href="${escapeHtml(link.href)}"${link.random ? ' data-random-base' : ''}>${escapeHtml(link.label)}</a></li>`).join('')}
        </ul>
      </nav>`;
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
            <p>${escapeHtml(footerIntro(metadata))}</p>
          </section>
          ${footerGroups.map(buildLinkGroup).join('')}
        </div>
        <div class="site-footer-bottom" aria-label="Footer notes">
          <span>© ${new Date().getFullYear()} ZombieBases</span>
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
