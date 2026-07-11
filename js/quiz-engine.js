(function () {
  const TYPE_LABELS = {
    fortified_structure: 'Fortified Structure', isolated_landmass: 'Isolated Landmass', elevated_stronghold: 'Elevated Stronghold', subterranean: 'Subterranean', institutional_compound: 'Institutional Compound', industrial_site: 'Industrial Site', remote_settlement: 'Remote Settlement', transit_hub: 'Transit Hub', landmark_structure: 'Landmark Structure'
  };
  const REGION_LABELS = {
    uk_ireland: 'UK & Ireland', western_europe: 'Western Europe', eastern_europe: 'Eastern & Northern Europe', north_america: 'North America', south_america: 'South America', africa: 'Africa', middle_east: 'Middle East', south_asia: 'South Asia', east_asia: 'East Asia', southeast_asia: 'Southeast Asia', oceania: 'Oceania', polar_extreme: 'Polar & Extreme'
  };
  const AXIS_LABELS = { defence: 'Defence', isolation: 'Isolation', sustainability: 'Sustainability', resources: 'Resources', community: 'Community', complexity: 'Technical complexity', access: 'Access' };
  const FACTOR_DEFINITIONS = {
    defence: { id: 'defence', label: 'Defence', preferenceMode: 'higher-is-better', icon: '☆' },
    isolation: { id: 'isolation', label: 'Isolation', preferenceMode: 'target-match', icon: '◎' },
    sustainability: { id: 'sustainability', label: 'Sustainability', preferenceMode: 'higher-is-better', icon: '♧' },
    resources: { id: 'resources', label: 'Resources', preferenceMode: 'higher-is-better', icon: '▣' },
    community: { id: 'community', label: 'Community', preferenceMode: 'target-match', icon: '☷' },
    complexity: { id: 'complexity', label: 'Technical complexity', preferenceMode: 'target-match', icon: '⚙' },
    access: { id: 'access', label: 'Access', preferenceMode: 'target-match', icon: '↗' }
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
  const PROFILES = [
    { id: 'fortress-commander', name: 'Fortress Commander', strategyLabel: 'Protection first', icon: '🛡', shortDescription: 'You prioritise strong barriers, chokepoints and early control.', description: 'Fortress Commanders want the first phase of collapse to be survivable through walls, high ground and defensible approaches. They accept that the strongest positions can need more supply discipline over time.', strength: 'Defensible perimeters and immediate threat control', compromise: 'May trade resource depth or easy access for stronger protection', dimensions: ['defence'], dimensionWeights: { defence: 10, resources: 6, access: 4 } },
    { id: 'island-isolationist', name: 'Island Isolationist', strategyLabel: 'Distance first', icon: '⛯', shortDescription: 'You favour distance, separation and fewer approach routes.', description: 'Island Isolationists reduce contact with infected areas and hostile traffic by choosing places that are hard to reach. The price is slower movement, limited salvage and heavier reliance on what is already on site.', strength: 'Low exposure through remoteness and controlled approaches', compromise: 'Harder resupply, evacuation and outside contact', dimensions: ['isolation'], dimensionWeights: { isolation: 10, resources: 6, community: 4 } },
    { id: 'community-builder', name: 'Community Builder', strategyLabel: 'People first', icon: '👥', shortDescription: 'You focus on people, skills and renewable settlement life.', description: 'Community Builders see survival as a long-term group project. They value food systems, shared labour and governance, even when that means accepting more visible or less bunker-like locations.', strength: 'Long-term resilience through skills, food and cooperation', compromise: 'Larger groups can increase visibility and coordination pressure', dimensions: ['community', 'sustainability'], dimensionWeights: { community: 10, sustainability: 9, resources: 7 } },
    { id: 'resource-planner', name: 'Resource Planner', strategyLabel: 'Supplies first', icon: '▣', shortDescription: 'You prioritise dependable supplies, sustainability and long-term resilience.', description: 'Resource Planners look for places where food, water, medical basics and renewable supplies can keep a group alive after stored goods run down. They often accept less extreme isolation if the resource base is stronger.', strength: 'Long-term resource planning', compromise: 'Less emphasis on extreme isolation or immediate mobility', dimensions: ['resources', 'sustainability'], dimensionWeights: { resources: 10, sustainability: 9, complexity: 5 } },
    { id: 'systems-survivor', name: 'Systems Survivor', strategyLabel: 'Infrastructure first', icon: '⚙', shortDescription: 'You are willing to use complex infrastructure if it improves resilience.', description: 'Systems Survivors accept engineered sites, technical maintenance and specialist knowledge when those systems provide protection, power, water or control. Their risk is that complexity becomes a burden without skilled people and spare parts.', strength: 'Engineered resilience and infrastructure leverage', compromise: 'Higher maintenance burden and dependency on expertise', dimensions: ['complexity', 'defence', 'resources'], dimensionWeights: { complexity: 10, defence: 8, resources: 7 } },
    { id: 'resilient-generalist', name: 'Resilient Generalist', strategyLabel: 'Balance first', icon: '⌖', shortDescription: 'You balance defence, resources, isolation and people rather than maximising one axis.', description: 'Resilient Generalists avoid all-in strategies. They prefer bases with fewer severe weaknesses and enough flexibility to adapt as conditions change.', strength: 'Balanced survivability across multiple pressures', compromise: 'May miss the strongest specialist advantage in any single category', dimensions: ['defence', 'isolation', 'sustainability', 'resources', 'community'], dimensionWeights: { defence: 7, isolation: 7, sustainability: 7, resources: 7, community: 7 } }
  ];
  const PROFILE_BY_ID = Object.fromEntries(PROFILES.map((profile) => [profile.id, profile]));
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function labelFor(kind, value) { if (kind === 'axis') return AXIS_LABELS[value] || value; return (kind === 'type' ? TYPE_LABELS : REGION_LABELS)[value] || String(value || '').replace(/_/g, ' '); }
  function scoreCategories(base) { return base?.scores?.categories || {}; }
  function answerFor(question, id) { return question.answers.find((answer) => answer.id === id); }
  function getQuestions() { return (typeof window !== 'undefined' ? window.quizQuestions?.questions : globalThis.quizQuestions?.questions) || []; }
  function getAxes() { return (typeof window !== 'undefined' ? window.quizQuestions?.axes : globalThis.quizQuestions?.axes) || ['defence', 'isolation', 'sustainability', 'resources', 'community', 'complexity', 'access']; }
  function buildUserProfile(answers) {
    const totals = { defence: 0, isolation: 0, sustainability: 0, resources: 0, community: 0, complexity: 0, access: 0 };
    const typeAffinity = {};
    getQuestions().forEach((question) => {
      const selected = answerFor(question, answers[question.id]);
      if (!selected) return;
      Object.entries(selected.weights || {}).forEach(([key, value]) => { totals[key] = (totals[key] || 0) + value; });
      Object.entries(selected.typeAffinity || {}).forEach(([key, value]) => { typeAffinity[key] = (typeAffinity[key] || 0) + value; });
    });
    const values = Object.values(totals); const min = Math.min(...values, 0); const max = Math.max(...values, 1);
    const normalized = Object.fromEntries(Object.entries(totals).map(([key, value]) => [key, clamp(((value - min) / (max - min)) * 10, 0, 10)]));
    return { raw: totals, normalized, typeAffinity };
  }
  function baseProfile(base) {
    const categories = scoreCategories(base); const typeTraits = BASE_TYPE_TRAITS[base.type] || BASE_TYPE_TRAITS.landmark_structure;
    const defensibility = Number(categories.defensibility ?? base?.scores?.defensibility ?? typeTraits.defence);
    const isolation = Number(categories.isolation ?? base?.scores?.isolation ?? typeTraits.isolation);
    const sustainability = Number(categories.sustainability ?? base?.scores?.sustainability ?? typeTraits.sustainability);
    const comparison = base.comparisonScores || {};
    const resourceSecurity = Number(comparison.resourceSecurity?.score ?? typeTraits.resources);
    const populationCapacity = Number(comparison.populationCapacity?.score ?? typeTraits.community);
    const maintenance = Number(comparison.maintenanceBurden?.score ?? typeTraits.complexity);
    const exposure = Number(comparison.exposure?.score ?? typeTraits.access);
    return { defence: (defensibility * 0.75) + (typeTraits.defence * 0.25), isolation: (isolation * 0.75) + (typeTraits.isolation * 0.25), sustainability: (sustainability * 0.7) + (typeTraits.sustainability * 0.3), resources: (resourceSecurity * 0.6) + (sustainability * 0.25) + (typeTraits.resources * 0.15), community: (populationCapacity * 0.55) + (sustainability * 0.25) + (typeTraits.community * 0.2), complexity: (maintenance * 0.55) + (typeTraits.complexity * 0.45), access: (exposure * 0.6) + (typeTraits.access * 0.4) };
  }
  function compatibility(user, base, profile) { let weightedDistance = 0; let weightTotal = 0; getAxes().forEach((axis) => { const priority = clamp(user.normalized[axis] || 0, 0, 10); const weight = 0.7 + (priority / 10) * 1.8; weightedDistance += Math.abs(priority - clamp(profile[axis] || 0, 0, 10)) * weight; weightTotal += weight; }); const typeBoost = user.typeAffinity[base.type] ? user.typeAffinity[base.type] * 1.8 : 0; const overallBoost = Number(base?.scores?.overall || 0) * 0.45; return Math.round(clamp(100 - ((weightedDistance / weightTotal) * 9.2) + typeBoost + overallBoost, 1, 99)); }
  function classifyProfile(user) { const n = user.normalized; const ordered = Object.entries(n).sort((a, b) => b[1] - a[1]); const top = ordered[0]; const second = ordered[1]; if (top && second && top[1] - second[1] < 1.15) return PROFILE_BY_ID['resilient-generalist']; if (top[0] === 'defence') return PROFILE_BY_ID['fortress-commander']; if (top[0] === 'isolation') return PROFILE_BY_ID['island-isolationist']; if (top[0] === 'community' || top[0] === 'sustainability') return PROFILE_BY_ID['community-builder']; if (top[0] === 'resources') return PROFILE_BY_ID['resource-planner']; if (top[0] === 'complexity') return PROFILE_BY_ID['systems-survivor']; return PROFILE_BY_ID['resilient-generalist']; }
  function factorDefinition(axis) { return FACTOR_DEFINITIONS[axis] || { id: axis, label: labelFor('axis', axis), preferenceMode: 'target-match', icon: '•' }; }
  function scoreInterpretation(userScore, baseScore, axis) { return getFactorMatchInterpretation({ factor: factorDefinition(axis), userScore, baseScore }).label; }
  function getFactorMatchInterpretation({ factor, userScore, baseScore }) {
    const mode = factor?.preferenceMode || 'target-match'; const diff = baseScore - userScore; const abs = Math.abs(diff);
    if (abs < 0.25) return { level: 'excellent', label: 'Exact match' };
    if (mode === 'higher-is-better') {
      if (diff >= 1.5) return { level: 'strong', label: 'Base exceeds your requirement', explanation: 'Extra capability may help, but can still carry trade-offs.' };
      if (diff >= -1) return { level: 'excellent', label: 'Excellent match' };
      if (diff >= -2.25) return { level: 'strong', label: 'Strong match' };
      if (diff >= -4) return { level: 'moderate', label: 'Moderate compromise' };
      return { level: 'weak', label: 'Significant compromise' };
    }
    if (mode === 'lower-is-better') {
      if (diff <= -1.5) return { level: 'strong', label: 'Lower than your limit' };
      if (diff <= 1) return { level: 'excellent', label: 'Excellent match' };
      if (diff <= 2.25) return { level: 'strong', label: 'Manageable compromise' };
      if (diff <= 4) return { level: 'moderate', label: 'Moderate compromise' };
      return { level: 'weak', label: 'Significant compromise' };
    }
    if (abs <= 1) return { level: 'excellent', label: 'Excellent match' };
    if (abs <= 2.25) return { level: 'strong', label: 'Strong match' };
    if (abs <= 4) return { level: 'moderate', label: 'Moderate compromise' };
    return { level: 'weak', label: 'Significant mismatch' };
  }
  function compatibilityBreakdown(user, baseProf) { return getAxes().map((axis) => { const userScore = clamp(user.normalized[axis] || 0, 0, 10); const baseScore = clamp(baseProf[axis] || 0, 0, 10); const factor = factorDefinition(axis); const match = getFactorMatchInterpretation({ factor, userScore, baseScore }); return { axis, factorId: axis, icon: factor.icon, label: factor.label, userScore, baseScore, interpretation: match.label, interpretationLevel: match.level, interpretationDetail: match.explanation }; }); }
  function scoreFit(axis, userScore, baseScore) { const mode = factorDefinition(axis).preferenceMode; if (mode === 'higher-is-better') return baseScore >= userScore ? 10 - Math.min(baseScore - userScore, 2) * 0.2 : Math.max(0, 10 - (userScore - baseScore) * 2); if (mode === 'lower-is-better') return baseScore <= userScore ? 10 - Math.min(userScore - baseScore, 2) * 0.2 : Math.max(0, 10 - (baseScore - userScore) * 2); return Math.max(0, 10 - Math.abs(userScore - baseScore) * 2); }
  function getProfileTraits(profile, limit = 3) { return Object.entries(profile.dimensionWeights || Object.fromEntries((profile.dimensions || []).map((axis) => [axis, 10]))).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([factorId, value]) => ({ factorId, label: labelFor('axis', factorId), value: clamp(value, 0, 10), max: 10 })); }
  function generateExplanation(user, base, baseProf, breakdown) { const priorities = Object.entries(user.normalized).sort((a, b) => b[1] - a[1]).slice(0, 2); const aligned = breakdown.filter((row) => ['excellent', 'strong'].includes(row.interpretationLevel)).sort((a, b) => Math.abs(a.userScore - a.baseScore) - Math.abs(b.userScore - b.baseScore)).slice(0, 2); const compromise = breakdown.slice().sort((a, b) => Math.abs(b.userScore - b.baseScore) - Math.abs(a.userScore - a.baseScore))[0]; return { priorities: priorities.map(([key]) => labelFor('axis', key)), strongestAlignment: `${base.name} aligns most closely on ${aligned.map((row) => row.label.toLowerCase()).join(' and ') || 'your highest weighted factors'}, matching the priorities that scored highest in your answers: ${priorities.map(([key]) => labelFor('axis', key).toLowerCase()).join(' and ')}.`, gain: `You gain a ${labelFor('type', base.type).toLowerCase()} whose assessed strengths include ${Object.entries(baseProf).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([key]) => labelFor('axis', key).toLowerCase()).join(' and ')} while still scoring ${base.scores?.overall?.toFixed ? base.scores.overall.toFixed(1) : 'well'} overall.`, compromise: compromise ? `${labelFor('axis', compromise.axis)} is the clearest trade-off: your priority is ${Math.round(compromise.userScore)}/10 and ${base.name} rates ${Math.round(compromise.baseScore)}/10, which is a ${compromise.interpretation.toLowerCase()}.` : 'No major compromise was detected from the available scoring data.' }; }
  function getAlternativeReason({ userProfile, primaryMatch, alternativeMatch }) { const map = { defence: 'Stronger defensive option', isolation: 'Better isolation match', sustainability: 'Better sustainability fit', resources: 'Better resource fit', community: 'Better community fit', complexity: 'Better systems fit', access: 'Better access fit' }; const priorities = Object.entries(userProfile.normalized).sort((a, b) => b[1] - a[1]).slice(0, 4); const bestProfile = primaryMatch?.baseProfile || {}; const altProfile = alternativeMatch?.baseProfile || {}; const improved = priorities.map(([axis, priority]) => { const before = scoreFit(axis, priority, bestProfile[axis] || 0); const after = scoreFit(axis, priority, altProfile[axis] || 0); return { axis, gain: after - before, priority }; }).filter((row) => row.gain >= 1.25).sort((a, b) => b.gain - a.gain || b.priority - a.priority)[0]; if (improved) return { factorId: improved.axis, label: map[improved.axis] || `Better ${labelFor('axis', improved.axis).toLowerCase()} fit`, explanation: `Improves ${labelFor('axis', improved.axis).toLowerCase()} against one of your strongest priorities.` }; return { label: 'Closest overall alternative' }; }
  function alternativeReason(item, best, user) { return getAlternativeReason({ userProfile: user, primaryMatch: best, alternativeMatch: item }); }
  function getAlternativeSummary({ alternativeMatch, primaryMatch, userProfile }) { const base = alternativeMatch.base; const trusted = base?.description?.summary; if (trusted && !/coming soon/i.test(trusted)) return trusted; const rows = compatibilityBreakdown(userProfile, alternativeMatch.baseProfile); const strongest = rows.slice().sort((a, b) => scoreFit(b.axis, b.userScore, b.baseScore) - scoreFit(a.axis, a.userScore, a.baseScore))[0]; const trade = rows.slice().sort((a, b) => scoreFit(a.axis, a.userScore, a.baseScore) - scoreFit(b.axis, b.userScore, b.baseScore))[0]; const primaryLower = primaryMatch && trade && (alternativeMatch.baseProfile[trade.axis] || 0) < (primaryMatch.baseProfile[trade.axis] || 0) - 0.5; const region = labelFor('region', base.region); return `${strongest ? `Strong ${strongest.label.toLowerCase()} alignment` : `This ${labelFor('type', base.type).toLowerCase()}`} makes ${base.name} a close ${region} option${trade ? `, although ${trade.label.toLowerCase()} is ${primaryLower ? 'lower than your primary match' : 'the main trade-off'}` : ''}.`; }
  function recommend(bases, answers) { const user = buildUserProfile(answers); const profile = classifyProfile(user); const scored = bases.filter((base) => base && base.slug && base.name && normalizeStatus(base) !== 'hidden').map((base) => { const profile = baseProfile(base); return { base, baseProfile: profile, match: compatibility(user, base, profile) }; }).sort((a, b) => b.match - a.match || (b.base?.scores?.overall || 0) - (a.base?.scores?.overall || 0) || a.base.name.localeCompare(b.base.name)); const best = scored[0]; const breakdown = best ? compatibilityBreakdown(user, best.baseProfile) : []; const seen = new Set([best?.base?.slug]); const alternatives = scored.filter((item) => item.base?.slug && !seen.has(item.base.slug) && seen.add(item.base.slug)).slice(0, 3).map((item) => ({ ...item, reason: alternativeReason(item, best, user), summary: getAlternativeSummary({ alternativeMatch: item, primaryMatch: best, userProfile: user }) })); return { userProfile: user, profile, profileId: profile.id, personality: profile.name, best, alternatives, breakdown, explanation: best ? generateExplanation(user, best.base, best.baseProfile, breakdown) : null }; }
  function normalizeStatus(base) { return typeof base.status === 'string' ? base.status.trim().toLowerCase() : ''; }
  const api = { PROFILES, FACTOR_DEFINITIONS, recommend, buildUserProfile, baseProfile, compatibility, classifyProfile, compatibilityBreakdown, scoreInterpretation, getFactorMatchInterpretation, getAlternativeReason, getAlternativeSummary, getProfileTraits, labelFor };
  if (typeof module !== 'undefined') module.exports = api;
  if (typeof window !== 'undefined') window.quizEngine = api;
})();
