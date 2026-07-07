(() => {
  const suggestions = ['Islands', 'Castles', 'Prisons', 'Mountains', 'Airports', 'Bunkers'];
  const icon = (name) => ({
    explore: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    rankings: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0zm0 2H4v2a3 3 0 0 0 3 3m10-5h3v2a3 3 0 0 1-3 3"/></svg>',
    map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3zm0 0V3m6 18V6"/></svg>',
    compare: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17M5 5l2 2m10-2-2 2M5 19l2-2m10 2-2-2"/></svg>',
    more: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h.01M12 12h.01M19 12h.01"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>'
  })[name];

  function isHome() { return location.pathname === '/' || location.pathname.endsWith('/index.html'); }
  function setBodyLocked(locked) { document.body.classList.toggle('mobile-nav-locked', locked); }

  function enhanceHeader() {
    const inner = document.querySelector('.site-header .header-inner');
    if (!inner || document.querySelector('.mobile-header-actions')) return;
    const actions = document.createElement('div');
    actions.className = 'mobile-header-actions';
    actions.innerHTML = `
      <button class="mobile-icon-button" type="button" data-open-search aria-label="Search Zombie Bases">${icon('search')}</button>
      <button class="mobile-icon-button" type="button" data-open-more aria-label="Open menu">${icon('menu')}</button>`;
    inner.append(actions);
  }

  function makeBottomNav() {
    if (document.querySelector('.mobile-bottom-nav')) return;
    const nav = document.createElement('nav');
    nav.className = 'mobile-bottom-nav';
    nav.setAttribute('aria-label', 'Mobile primary navigation');
    const mapActive = isHome() && new URLSearchParams(location.search).get('view') === 'map';
    const items = [
      ['Explore', '/', 'explore', isHome() && !mapActive],
      ['Rankings', '/rankings.html', 'rankings', location.pathname.endsWith('/rankings.html')],
      ['Map', '/?view=map', 'map', mapActive],
      ['Compare', '/compare.html', 'compare', location.pathname.endsWith('/compare.html')],
    ];
    nav.innerHTML = items.map(([label, href, key, active]) => `<a href="${href}" ${active ? 'aria-current="page"' : ''}>${icon(key)}<span>${label}</span></a>`).join('') +
      `<button type="button" data-open-more aria-label="Open more navigation">${icon('more')}<span>More</span></button>`;
    document.body.append(nav);
  }

  function makeMoreMenu() {
    if (document.querySelector('#mobile-more-menu')) return;
    const menuItems = [
      ['Regions', '/rankings-region.html', 'Browse best bases by world region'],
      ['Types', '/rankings-type.html', 'Castles, islands, bunkers and more'],
      ['Field Manual', '/field-manual', 'Methodology & scoring'],
      ['Scenarios', '/scenarios.html', 'Outbreak planning lenses'],
      ['Latest Bases', '/rankings.html', 'Recently updated rankings'], // TODO: Replace with a dedicated latest-bases route if one is added.
      ['Random Base', '#random-base', 'Discover a surprise dossier'],
      ['About Zombie Bases', '/field-manual#what-is-zombie-bases', 'Project background and scoring philosophy'],
      ['View all bases', '/', 'Full base directory']
    ];
    const overlay = document.createElement('div');
    overlay.id = 'mobile-more-menu';
    overlay.className = 'mobile-sheet-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `<div class="mobile-sheet-backdrop" data-close-more></div><section class="mobile-sheet" role="dialog" aria-modal="true" aria-labelledby="mobile-more-title">
      <div class="mobile-sheet-handle" aria-hidden="true"></div><div class="mobile-sheet-top"><h2 id="mobile-more-title">More</h2><button class="mobile-icon-button" type="button" data-close-more aria-label="Close menu">${icon('close')}</button></div>
      <div class="mobile-menu-list">${menuItems.map(([label, href, help]) => `<a href="${href}" data-menu-link="${label}"><span><strong>${label}</strong><small>${help}</small></span>${icon('chevron')}</a>`).join('')}</div>
    </section>`;
    document.body.append(overlay);
  }

  function makeSearch() {
    if (document.querySelector('#mobile-search-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'mobile-search-overlay';
    overlay.className = 'mobile-search-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `<section class="mobile-search-panel" role="dialog" aria-modal="true" aria-labelledby="mobile-search-title"><h2 id="mobile-search-title" class="visually-hidden">Search</h2>
      <form class="mobile-search-form"><label>${icon('search')}<input type="search" placeholder="Search bases, regions, types…" autocomplete="off"></label><button type="button" data-close-search>Cancel</button></form>
      <p class="mobile-search-kicker">Suggested searches</p><div class="mobile-search-chips">${suggestions.map(s => `<button type="button">${s}</button>`).join('')}</div>
      <a class="mobile-search-all" href="/">View all bases →</a></section>`;
    document.body.append(overlay);
  }

  function openOverlay(el) { el.hidden = false; setBodyLocked(true); setTimeout(() => el.querySelector('input, button, a')?.focus(), 30); }
  function closeAll() { document.querySelectorAll('.mobile-sheet-overlay, .mobile-search-overlay').forEach(el => el.hidden = true); setBodyLocked(false); }
  function runSearch(q) { if (!q) return; if (isHome()) { closeAll(); const input = document.querySelector('#search-input'); if (input) { input.value = q; input.dispatchEvent(new Event('input', { bubbles: true })); input.focus(); return; } } location.href = `/?q=${encodeURIComponent(q)}`; }

  function bind() {
    document.addEventListener('click', async (event) => {
      const target = event.target;
      if (target.closest('[data-open-more]')) openOverlay(document.querySelector('#mobile-more-menu'));
      if (target.closest('[data-close-more], .mobile-sheet-backdrop')) closeAll();
      if (target.closest('[data-open-search]')) { openOverlay(document.querySelector('#mobile-search-overlay')); setTimeout(() => document.querySelector('.mobile-search-form input')?.focus(), 50); }
      if (target.closest('[data-close-search]')) closeAll();
      const chip = target.closest('.mobile-search-chips button');
      if (chip) runSearch(chip.textContent.trim());
      const random = target.closest('[data-menu-link="Random Base"]');
      if (random) { event.preventDefault(); try { const data = await fetch('/data/bases-index.json').then(r => r.json()); const base = data[Math.floor(Math.random() * data.length)]; if (base?.slug) location.href = `/base.html?slug=${base.slug}`; } catch { location.href = '/rankings.html'; } }
    });
    document.addEventListener('submit', (event) => { if (event.target.matches('.mobile-search-form')) { event.preventDefault(); runSearch(event.target.querySelector('input').value.trim()); } });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeAll(); });
  }

  enhanceHeader(); makeBottomNav(); makeMoreMenu(); makeSearch(); bind();
})();
