(function () {
  const TYPE_LABELS = {
    fortified_structure: 'Fortified Structure', isolated_landmass: 'Isolated Landmass', elevated_stronghold: 'Elevated Stronghold', subterranean: 'Subterranean', institutional_compound: 'Institutional Compound', industrial_site: 'Industrial Site', remote_settlement: 'Remote Settlement', transit_hub: 'Transit Hub', landmark_structure: 'Landmark Structure'
  };
  const REGION_LABELS = {
    uk_ireland: 'UK & Ireland', western_europe: 'Western Europe', eastern_europe: 'Eastern & Northern Europe', north_america: 'North America', south_america: 'South America', africa: 'Africa', middle_east: 'Middle East', south_asia: 'South Asia', east_asia: 'East Asia', southeast_asia: 'Southeast Asia', oceania: 'Oceania', polar_extreme: 'Polar & Extreme'
  };
  const BASE_TYPE_TRAITS = {
    fortified_structure: { defence: 9, isolation: 5, sustainability: 4, resources: 5, community: 6, complexity: 4, access: 5 },
    isolated_landmass: { defence: 6, isolation: 9, sustainability: 6, resources: 6, community: 5, complexity: 5, access: 2 },
    elevated_stronghold: { defence: 8, isolation: 7, sustainability: 4, resources: 4, community: 4, complexity: 3, access: 3 },
    subterranean: { defence: 8, isolation: 8, sustainability: 3, resources: 4, community: 4, complexity: 9, access: 2 },
    institutional_compound: { defence: 7, isolation: 5, sustainability: 5, resources: 7, community: 7, complexity: 7, access: 6 },
    industrial_site: { defence: 6, isolation: 6, sustainability: 4, resources: 7, community: 4, complexity: 8, access: 5 },
    remote_settlement: { defence: 5, isolation: 8, sustainability: 8, resources: 7, community: 8, complexity: 3, access: 3 },
    transit_hub: { defence: 5, isolation: 3, sustainability: 4, resources: 7, community: 5, complexity: 6, access: 9 },
    landmark_structure: { defence: 6, isolation: 5, sustainability: 4, resources: 4, community: 5, complexity: 4, access: 6 }
  };

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function labelFor(kind, value) { return (kind === 'type' ? TYPE_LABELS : REGION_LABELS)[value] || String(value || '').replace(/_/g, ' '); }
  function scoreCategories(base) { return base?.scores?.categories || {}; }
  function answerFor(question, id) { return question.answers.find((answer) => answer.id === id); }

  function buildUserProfile(answers) {
    const totals = { defence: 0, isolation: 0, sustainability: 0, resources: 0, community: 0, complexity: 0, access: 0 };
    const typeAffinity = {};
    window.quizQuestions.questions.forEach((question) => {
      const selected = answerFor(question, answers[question.id]);
      if (!selected) return;
      Object.entries(selected.weights || {}).forEach(([key, value]) => { totals[key] = (totals[key] || 0) + value; });
      Object.entries(selected.typeAffinity || {}).forEach(([key, value]) => { typeAffinity[key] = (typeAffinity[key] || 0) + value; });
    });
    const values = Object.values(totals);
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 1);
    const normalized = Object.fromEntries(Object.entries(totals).map(([key, value]) => [key, clamp(((value - min) / (max - min)) * 10, 0, 10)]));
    return { raw: totals, normalized, typeAffinity };
  }

  function baseProfile(base) {
    const categories = scoreCategories(base);
    const typeTraits = BASE_TYPE_TRAITS[base.type] || BASE_TYPE_TRAITS.landmark_structure;
    const defensibility = Number(categories.defensibility ?? base?.scores?.defensibility ?? typeTraits.defence);
    const isolation = Number(categories.isolation ?? base?.scores?.isolation ?? typeTraits.isolation);
    const sustainability = Number(categories.sustainability ?? base?.scores?.sustainability ?? typeTraits.sustainability);
    const comparison = base.comparisonScores || {};
    const resourceSecurity = Number(comparison.resourceSecurity?.score ?? typeTraits.resources);
    const populationCapacity = Number(comparison.populationCapacity?.score ?? typeTraits.community);
    const maintenance = Number(comparison.maintenanceBurden?.score ?? typeTraits.complexity);
    const exposure = Number(comparison.exposure?.score ?? typeTraits.access);
    return {
      defence: (defensibility * 0.75) + (typeTraits.defence * 0.25),
      isolation: (isolation * 0.75) + (typeTraits.isolation * 0.25),
      sustainability: (sustainability * 0.7) + (typeTraits.sustainability * 0.3),
      resources: (resourceSecurity * 0.6) + (sustainability * 0.25) + (typeTraits.resources * 0.15),
      community: (populationCapacity * 0.55) + (sustainability * 0.25) + (typeTraits.community * 0.2),
      complexity: (maintenance * 0.55) + (typeTraits.complexity * 0.45),
      access: (exposure * 0.6) + (typeTraits.access * 0.4)
    };
  }

  function compatibility(user, base, profile) {
    const axes = window.quizQuestions.axes;
    let weightedDistance = 0;
    let weightTotal = 0;
    axes.forEach((axis) => {
      const priority = clamp(user.normalized[axis] || 0, 0, 10);
      const weight = 0.7 + (priority / 10) * 1.8;
      weightedDistance += Math.abs(priority - clamp(profile[axis] || 0, 0, 10)) * weight;
      weightTotal += weight;
    });
    const typeBoost = user.typeAffinity[base.type] ? user.typeAffinity[base.type] * 1.8 : 0;
    const overallBoost = Number(base?.scores?.overall || 0) * 0.45;
    return Math.round(clamp(100 - ((weightedDistance / weightTotal) * 9.2) + typeBoost + overallBoost, 1, 99));
  }

  function personality(user) {
    const n = user.normalized;
    const ordered = Object.entries(n).sort((a, b) => b[1] - a[1]);
    const top = ordered[0];
    const second = ordered[1];
    if (top && second && top[1] - second[1] < 1.15) return 'Resilient Generalist';
    if (top[0] === 'defence') return 'Fortress Commander';
    if (top[0] === 'isolation') return 'Island Isolationist';
    if (top[0] === 'community' || top[0] === 'sustainability') return 'Community Builder';
    if (top[0] === 'resources') return 'Resource Planner';
    if (top[0] === 'complexity') return 'Systems Survivor';
    return 'Resilient Generalist';
  }

  function explain(user, base, baseProf) {
    const top = Object.entries(user.normalized).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([key]) => key);
    const strengths = Object.entries(baseProf).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([key]) => key);
    const typeLabel = labelFor('type', base.type).toLowerCase();
    return `${base.name} fits because your profile prioritises ${top.join(' and ')} while this ${typeLabel} is strongest in ${strengths.join(' and ')}. Its existing dossier scores and derived resource profile make it a close match for how you balance immediate safety with long-term survival.`;
  }

  function recommend(bases, answers) {
    const user = buildUserProfile(answers);
    const scored = bases.filter((base) => base && base.slug && base.name && normalizeStatus(base) !== 'hidden').map((base) => {
      const profile = baseProfile(base);
      return { base, baseProfile: profile, match: compatibility(user, base, profile) };
    }).sort((a, b) => b.match - a.match || (b.base?.scores?.overall || 0) - (a.base?.scores?.overall || 0) || a.base.name.localeCompare(b.base.name));
    const best = scored[0];
    return { userProfile: user, personality: personality(user), best, alternatives: scored.slice(1, 4), explanation: best ? explain(user, best.base, best.baseProfile) : '' };
  }
  function normalizeStatus(base) { return typeof base.status === 'string' ? base.status.trim().toLowerCase() : ''; }

  window.quizEngine = { recommend, buildUserProfile, baseProfile, labelFor };
})();
