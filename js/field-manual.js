const sections = Array.from(document.querySelectorAll('.field-section'));
const desktopToc = document.getElementById('field-toc-desktop-nav');
const mobileToc = document.getElementById('field-toc-mobile-nav');
const progressBar = document.getElementById('field-progress-bar');

function buildToc(target) {
  if (!target) return;
  target.innerHTML = sections.map((section) => {
    const title = section.dataset.title || section.querySelector('h2')?.textContent || section.id;
    return `<a href="#${section.id}" data-target="${section.id}">${title}</a>`;
  }).join('');
}

function setActiveSection(id) {
  document.querySelectorAll('.field-toc-links a').forEach((link) => {
    link.classList.toggle('is-active', link.dataset.target === id);
  });
}

function updateProgress() {
  if (!progressBar) return;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100)) : 0;
  progressBar.style.width = `${progress}%`;
}

function initMetadata() {
  if (!window.seo) return;
  const title = 'Zombie Survival Field Manual | Zombie Bases';
  const description = 'A permanent Zombie Bases field manual for choosing, comparing, and stress-testing real-world zombie survival locations.';
  window.seo.applyPageMetadata({ title, description, canonicalPath: '/field-manual', canonicalParams: null });
  window.seo.applySocialMetadata({ title, description, url: `${window.seo.PRODUCTION_ORIGIN}/field-manual`, type: 'website', image: window.seo.DEFAULT_IMAGE });
}

buildToc(desktopToc);
buildToc(mobileToc);
initMetadata();

const observer = new IntersectionObserver((entries) => {
  const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (visible?.target?.id) setActiveSection(visible.target.id);
}, { rootMargin: '-22% 0px -58% 0px', threshold: [0.1, 0.35, 0.6] });

sections.forEach((section) => observer.observe(section));
window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();
if (sections[0]) setActiveSection(sections[0].id);
