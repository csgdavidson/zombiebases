const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const questionContext = { window: {} };
vm.runInNewContext(fs.readFileSync('js/quiz-questions.js', 'utf8'), questionContext);
globalThis.quizQuestions = questionContext.window.quizQuestions;
const engine = require('../js/quiz-engine.js');
const bases = JSON.parse(fs.readFileSync('data/bases-index.json', 'utf8'));

const answers = Object.fromEntries(globalThis.quizQuestions.questions.map((question) => [question.id, question.answers[0].id]));
const resourceAnswers = Object.fromEntries(globalThis.quizQuestions.questions.map((question) => [question.id, (question.answers.find((answer) => answer.weights?.resources) || question.answers[0]).id]));

assert.strictEqual(globalThis.quizQuestions.questions.length, 12, 'all twelve questions are available');
assert.ok(engine.PROFILES.length >= 6, 'all available survival profiles are configured');
assert.ok(engine.PROFILES.every((profile) => profile.id && profile.name && profile.shortDescription && profile.description && profile.strength && profile.compromise && profile.dimensions.length && profile.dimensionWeights), 'profiles include required content and trait weights');
assert.ok(engine.classifyProfile(engine.buildUserProfile(resourceAnswers)).id, 'profile classification returns a stable profile');
const baseProfile = engine.baseProfile(bases[0]);
assert.ok(Object.keys(baseProfile).includes('resources'), 'base compatibility profile uses shared factors');
const match = engine.compatibility(engine.buildUserProfile(answers), bases[0], baseProfile);
assert.ok(match >= 1 && match <= 99, 'compatibility calculation returns a bounded percentage');
const result = engine.recommend(bases, resourceAnswers);
assert.ok(result.best?.base?.slug, 'recommendation returns a primary base');
assert.strictEqual(new Set(result.alternatives.map((item) => item.base.slug)).size, result.alternatives.length, 'duplicates excluded from alternatives');
assert.ok(!result.alternatives.some((item) => item.base.slug === result.best.base.slug), 'primary match excluded from alternatives');
const ranked = bases.filter((base) => base && base.slug && base.name && base.status !== 'hidden').map((base) => {
  const prof = engine.baseProfile(base);
  return { base, match: engine.compatibility(result.userProfile, base, prof) };
}).sort((a, b) => b.match - a.match || (b.base?.scores?.overall || 0) - (a.base?.scores?.overall || 0) || a.base.name.localeCompare(b.base.name));
assert.deepStrictEqual(result.alternatives.map((item) => item.base.slug), ranked.slice(1, 4).map((item) => item.base.slug), 'alternatives are strongest remaining deterministic matches');
assert.ok(result.breakdown.every((row) => row.label && row.interpretation && row.interpretationLevel), 'compatibility breakdown is structured');

assert.strictEqual(engine.getFactorMatchInterpretation({ factor: { preferenceMode: 'target-match' }, userScore: 5, baseScore: 5 }).label, 'Exact match');
assert.strictEqual(engine.getFactorMatchInterpretation({ factor: { preferenceMode: 'higher-is-better' }, userScore: 6, baseScore: 8 }).label, 'Base exceeds your requirement');
assert.strictEqual(engine.getFactorMatchInterpretation({ factor: { preferenceMode: 'lower-is-better' }, userScore: 4, baseScore: 2 }).label, 'Lower than your limit');
assert.strictEqual(engine.getFactorMatchInterpretation({ factor: { preferenceMode: 'target-match' }, userScore: 8, baseScore: 6.5 }).label, 'Strong match');
assert.strictEqual(engine.getFactorMatchInterpretation({ factor: { preferenceMode: 'higher-is-better' }, userScore: 9, baseScore: 6 }).label, 'Moderate compromise');
assert.strictEqual(engine.getFactorMatchInterpretation({ factor: { preferenceMode: 'target-match' }, userScore: 10, baseScore: 3 }).label, 'Significant mismatch');

const fakeUser = { normalized: { isolation: 10, defence: 2, resources: 2, sustainability: 2, community: 2, complexity: 2, access: 2 } };
const primaryMatch = { baseProfile: { isolation: 5, defence: 5, resources: 5, sustainability: 5, community: 5, complexity: 5, access: 5 } };
const alternativeMatch = { baseProfile: { isolation: 9, defence: 1, resources: 1, sustainability: 1, community: 1, complexity: 1, access: 1 } };
assert.strictEqual(engine.getAlternativeReason({ userProfile: fakeUser, primaryMatch, alternativeMatch }).label, 'Better isolation match', 'alternative reasons consider priority fit');
assert.strictEqual(engine.getAlternativeReason({ userProfile: fakeUser, primaryMatch, alternativeMatch: primaryMatch }).label, 'Closest overall alternative', 'alternative reasons do not fake variation');
const fallback = engine.getAlternativeSummary({ alternativeMatch: { base: { name: 'Test Base', type: 'isolated_landmass', region: 'western_europe' }, baseProfile: alternativeMatch.baseProfile }, primaryMatch, userProfile: fakeUser });
assert.ok(!/coming soon/i.test(fallback), 'fallback summary avoids placeholder copy');
assert.ok(/isolation|defence|resources|sustainability|community|technical complexity|access/i.test(fallback), 'fallback summary references real factors');
assert.ok(engine.getProfileTraits(engine.PROFILES[0]).every((trait) => trait.factorId && trait.value <= trait.max), 'profile traits derive from profile weights');

const quizJs = fs.readFileSync('js/quiz.js', 'utf8');
assert.ok(quizJs.includes('STORAGE_VERSION = 2'), 'storage version constant exists');
assert.ok(quizJs.includes('stored.version !== STORAGE_VERSION'), 'storage version mismatch fails safely');
assert.ok(quizJs.includes('localStorage.removeItem'), 'retaking clears stored result');
assert.ok(!quizJs.includes('Compare Matches'), 'compare matches action is absent');
assert.ok(quizJs.includes('Explore this Base') && quizJs.includes('Retake Assessment') && quizJs.includes('Share Result'), 'primary actions remain available');
assert.ok(quizJs.includes('navigator.share') && quizJs.includes('My ZombieBases survival profile is'), 'share behavior remains available');
assert.ok(quizJs.includes('orderedProfiles(result.profileId)'), 'selected profile is ordered first');
assert.ok(quizJs.includes('aria-label') && quizJs.includes('details'), 'profile expanded content remains accessible');
console.log('quiz engine tests passed');
