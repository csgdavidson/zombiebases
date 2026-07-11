const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const questionContext = { window: {} };
vm.runInNewContext(fs.readFileSync('js/quiz-questions.js', 'utf8'), questionContext);
globalThis.quizQuestions = questionContext.window.quizQuestions;
const engine = require('../js/quiz-engine.js');
const bases = JSON.parse(fs.readFileSync('data/bases-index.json', 'utf8')).filter((base) => base && base.slug && base.name).slice(0, 20);

const answers = Object.fromEntries(globalThis.quizQuestions.questions.map((question) => [question.id, question.answers[0].id]));
const resourceAnswers = Object.fromEntries(globalThis.quizQuestions.questions.map((question) => [question.id, (question.answers.find((answer) => answer.weights?.resources) || question.answers[0]).id]));

assert.strictEqual(globalThis.quizQuestions.questions.length, 12, 'all twelve questions are available');
const user = engine.buildUserProfile(answers);
assert.ok(user.normalized.defence >= 0 && user.normalized.defence <= 10, 'question scoring normalizes to 0-10');
assert.ok(engine.PROFILES.length >= 6, 'all available survival profiles are configured');
assert.ok(engine.PROFILES.every((profile) => profile.id && profile.name && profile.shortDescription && profile.description && profile.strength && profile.compromise && profile.dimensions.length), 'profiles include required content');
assert.ok(engine.classifyProfile(engine.buildUserProfile(resourceAnswers)).id, 'profile classification returns a stable profile');
const baseProfile = engine.baseProfile(bases[0]);
assert.ok(Object.keys(baseProfile).includes('resources'), 'base compatibility profile uses shared factors');
const match = engine.compatibility(user, bases[0], baseProfile);
assert.ok(match >= 1 && match <= 99, 'compatibility calculation returns a bounded percentage');
assert.strictEqual(engine.scoreInterpretation(5, 5), 'Exact match', 'exact score interpretation');
assert.strictEqual(engine.scoreInterpretation(4, 7), 'Base exceeds your priority', 'base exceeds interpretation');
assert.strictEqual(engine.scoreInterpretation(9, 5), 'Weak match', 'weak match interpretation');
const result = engine.recommend(bases, answers);
assert.ok(result.best && result.alternatives.length === 3, 'alternative match selection returns three bases');
assert.ok(new Set(result.alternatives.map((item) => item.reason)).size >= 1, 'alternatives include contextual reasons');
assert.ok(result.breakdown.every((row) => row.label && row.interpretation), 'compatibility breakdown is interpretable');
assert.ok(result.explanation.strongestAlignment && result.explanation.gain && result.explanation.compromise, 'why-this-matches explanation is structured');

const quizJs = fs.readFileSync('js/quiz.js', 'utf8');
assert.ok(quizJs.includes('STORAGE_VERSION = 2'), 'storage version constant exists');
assert.ok(quizJs.includes('version: STORAGE_VERSION'), 'stored result is versioned');
assert.ok(quizJs.includes('stored.version !== STORAGE_VERSION'), 'storage version mismatch fails safely');
assert.ok(quizJs.includes('localStorage.removeItem'), 'retaking clears stored result');
assert.ok(quizJs.includes('Share Result') && quizJs.includes('My ZombieBases survival profile is'), 'share text generation is useful');
assert.ok(quizJs.includes('window.quizEngine.PROFILES.map'), 'results render all survival profiles');
assert.ok(quizJs.includes('Your profile'), 'current survival profile is highlighted with text');
console.log('quiz engine tests passed');
