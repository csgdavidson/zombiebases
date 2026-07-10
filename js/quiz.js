(function () {
  const STORAGE_KEY = 'zombieBasesSurvivalQuiz';
  const DATA_URL = '/data/bases-index.json';
  const state = { bases: [], answers: {}, current: 0, result: null };
  const el = { landing: document.getElementById('quiz-landing'), info: document.querySelector('.quiz-info-grid'), begin: document.getElementById('begin-quiz'), previous: document.getElementById('view-previous'), retakeLanding: document.getElementById('retake-from-landing'), quiz: document.getElementById('quiz-panel'), analysis: document.getElementById('analysis-panel'), results: document.getElementById('results-panel') };
  const questions = window.quizQuestions.questions;
  const slugHelper = window.baseSlugHelper;
  const baseUrl = (base) => slugHelper?.getBaseUrl ? slugHelper.getBaseUrl(base) : `/${encodeURIComponent(base.slug)}`;
  const imageUrl = (base) => base.image || `/images/bases/${encodeURIComponent(base.slug)}.png`;

  function save(extra = {}) { localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers: state.answers, result: state.result, personality: state.result?.personality, completionDate: state.result?.completionDate, ...extra })); }
  function load() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; } }
  function show(panel) { [el.landing, el.info, el.quiz, el.analysis, el.results].forEach((node) => { if (node) node.hidden = node !== panel && !(panel === el.landing && node === el.info); }); }
  function hasAllAnswers() { return questions.every((question) => state.answers[question.id]); }
  function pct(value) { return `${Math.round(value)}%`; }

  function renderQuestion() {
    show(el.quiz);
    const question = questions[state.current];
    const selected = state.answers[question.id];
    el.quiz.innerHTML = `<div class="quiz-progress-row"><span>Question ${state.current + 1} of ${questions.length}</span><span>${pct(((state.current + 1) / questions.length) * 100)}</span></div><div class="quiz-progress"><span style="width:${((state.current + 1) / questions.length) * 100}%"></span></div><h2>${question.prompt}</h2><div class="quiz-answers" role="radiogroup" aria-label="${question.prompt}">${question.answers.map((answer) => `<button class="quiz-answer ${selected === answer.id ? 'is-selected' : ''}" type="button" role="radio" aria-checked="${selected === answer.id}" data-answer="${answer.id}"><span></span>${answer.label}</button>`).join('')}</div><div class="quiz-nav-row"><button class="quiz-secondary" type="button" data-action="back">Back</button><button class="compare-button" type="button" data-action="continue" ${selected ? '' : 'disabled'}>${state.current === questions.length - 1 ? 'Analyse Results' : 'Continue'}</button></div>`;
  }

  function runAnalysis() { state.result = window.quizEngine.recommend(state.bases, state.answers); state.result.completionDate = new Date().toISOString(); save(); show(el.analysis); setTimeout(renderResults, 2000); }
  function bar(label, value) { return `<div class="quiz-bar"><span>${label}</span><strong>${Math.round(value)}/10</strong><i><b style="width:${clamp(value * 10, 0, 100)}%"></b></i></div>`; }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function summary(base) { return base?.description?.summary || 'Survival dossier summary coming soon.'; }
  function baseSummary(base, match) { return `<article class="quiz-alt-card"><img src="${imageUrl(base)}" alt="${base.name}" loading="lazy"><div><h3>${base.name}</h3><p class="base-meta">${base.country ? `${base.country}, ` : ''}${window.quizEngine.labelFor('region', base.region)} • ${window.quizEngine.labelFor('type', base.type)}</p><p><strong>${base.scores?.overall?.toFixed ? base.scores.overall.toFixed(1) : '—'}</strong> overall • <strong>${match}%</strong> match</p><p>${summary(base)}</p><a class="subtle-link" href="${baseUrl(base)}">Open dossier</a></div></article>`; }

  function renderResults() {
    const result = state.result || window.quizEngine.recommend(state.bases, state.answers);
    const best = result.best.base;
    const user = result.userProfile.normalized;
    const cats = best.scores?.categories || {};
    show(el.results);
    el.results.innerHTML = `<p class="eyebrow">Your Survival Base</p><div class="quiz-result-hero"><img src="${imageUrl(best)}" alt="${best.name}"><div><h1>${best.name}</h1><p class="quiz-compatibility">${result.best.match}% compatibility</p><p class="quiz-personality">${result.personality}</p><div class="quiz-actions"><a class="compare-button" href="${baseUrl(best)}">Explore this Base</a><button class="quiz-secondary" type="button" data-action="retake">Retake Assessment</button><button class="quiz-secondary" type="button" data-action="copy">Copy Result</button></div><p id="copy-status" class="base-meta" role="status"></p></div></div><section class="quiz-result-grid"><article><p class="eyebrow">Why this matches</p><p>${result.explanation}</p></article><article><p class="eyebrow">Profile Summary</p>${bar('Defence', user.defence)}${bar('Isolation', user.isolation)}${bar('Sustainability', user.sustainability)}${bar('Resources', user.resources)}${bar('Community', user.community)}</article><article><p class="eyebrow">Base Summary</p>${bar('Defensibility', cats.defensibility || 0)}${bar('Isolation', cats.isolation || 0)}${bar('Sustainability', cats.sustainability || 0)}</article></section><section><div class="section-heading-row"><p class="eyebrow">Alternative Matches</p><h2>Three more bases to consider</h2></div><div class="quiz-alt-grid">${result.alternatives.map((item) => baseSummary(item.base, item.match)).join('')}</div></section>`;
  }
  function retake() { state.answers = {}; state.current = 0; state.result = null; localStorage.removeItem(STORAGE_KEY); renderQuestion(); }

  el.begin.addEventListener('click', retake);
  el.retakeLanding.addEventListener('click', retake);
  el.previous.addEventListener('click', () => { const stored = load(); if (stored?.answers) state.answers = stored.answers; if (stored?.result) state.result = stored.result; renderResults(); });
  el.quiz.addEventListener('click', (event) => {
    const answer = event.target.closest('[data-answer]');
    if (answer) { state.answers[questions[state.current].id] = answer.dataset.answer; save(); renderQuestion(); return; }
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'back') { if (state.current > 0) { state.current -= 1; renderQuestion(); } else { show(el.landing); } }
    if (action === 'continue' && state.answers[questions[state.current].id]) { if (state.current < questions.length - 1) { state.current += 1; renderQuestion(); } else if (hasAllAnswers()) runAnalysis(); }
  });
  el.results.addEventListener('click', async (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'retake') retake();
    if (action === 'copy' && state.result?.best) { const text = `My Zombie Bases survival match is ${state.result.best.base.name} — ${state.result.best.match}% compatible. I'm a ${state.result.personality}.`; await navigator.clipboard?.writeText(text); document.getElementById('copy-status').textContent = 'Result copied.'; }
  });

  fetch(DATA_URL).then((r) => r.json()).then((bases) => { state.bases = bases; const stored = load(); if (stored?.answers) state.answers = stored.answers; if (stored?.result) state.result = stored.result; if (stored?.result) { el.previous.hidden = false; el.retakeLanding.hidden = false; } }).catch(() => { el.begin.disabled = true; el.begin.textContent = 'Quiz unavailable'; });
})();
