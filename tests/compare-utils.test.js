const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

function element() {
  return {
    hidden: false,
    textContent: '',
    innerHTML: '',
    className: '',
    value: '',
    disabled: false,
    append() {},
    appendChild() {},
    addEventListener() {},
    querySelector() { return { addEventListener() {} }; }
  };
}

const sandbox = {
  console,
  Option: function Option(text, value) { return { text, value }; },
  window: { baseSlugHelper: {}, location: { pathname: '/compare.html', search: '' }, history: { pushState() {}, replaceState() {} }, scrollTo() {} },
  document: { getElementById: () => element() },
  fetch: () => new Promise(() => {})
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('js/compare.js', 'utf8'), sandbox);

const { buildBaseComparison, normaliseScore, formatDifference } = sandbox.window.zombieBasesComparison;

function base(name, values) {
  return {
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    scores: {
      overall: values.overall,
      categories: {
        defensibility: values.defensibility,
        sustainability: values.sustainability,
        isolation: values.isolation
      }
    },
    comparisonScores: {
      exposure: { score: values.exposure },
      maintenanceBurden: { score: values.maintenanceBurden },
      populationCapacity: { score: values.populationCapacity },
      resourceSecurity: { score: values.resourceSecurity }
    }
  };
}

{
  const result = buildBaseComparison(
    base('Alpha Long Name That Should Not Matter', { overall: 7, defensibility: 9, sustainability: 6, isolation: 5, exposure: 7, maintenanceBurden: 8, populationCapacity: 4, resourceSecurity: 7 }),
    base('Beta', { overall: 6, defensibility: 5, sustainability: 7, isolation: 5, exposure: 6, maintenanceBurden: 5, populationCapacity: 8, resourceSecurity: 7 })
  );
  assert.strictEqual(result.overallWinner, 'baseA');
  assert.strictEqual(result.metrics.find((m) => m.key === 'defensibility').winner, 'baseA');
  assert.strictEqual(result.metrics.find((m) => m.key === 'sustainability').winner, 'baseB');
  assert.strictEqual(result.metrics.find((m) => m.key === 'isolation').winner, 'tie');
  assert.strictEqual(result.metrics.find((m) => m.key === 'maintenanceBurden').winner, 'baseA');
  assert.strictEqual(result.largestBaseAAdvantage.key, 'defensibility');
  assert.strictEqual(result.closestMetric.key, 'isolation');
  assert.strictEqual(result.baseAWins, 3);
  assert.strictEqual(result.baseBWins, 2);
  assert.strictEqual(result.ties, 2);
}

{
  const result = buildBaseComparison(
    base('Gamma', { overall: 7.04, defensibility: 5.04, sustainability: 5, isolation: 5, exposure: 5, maintenanceBurden: 5, populationCapacity: 5, resourceSecurity: 5 }),
    base('Delta', { overall: 7.01, defensibility: 5.01, sustainability: 5, isolation: 5, exposure: 5, maintenanceBurden: 5, populationCapacity: 5, resourceSecurity: 5 })
  );
  assert.strictEqual(result.overallWinner, 'tie');
  assert.strictEqual(result.metrics.find((m) => m.key === 'defensibility').winner, 'tie');
  assert.strictEqual(formatDifference(0.03), 'Even');
}


{
  const result = buildBaseComparison(
    base('Numeric String', { overall: '11', defensibility: '9', sustainability: 'bad', isolation: '5', exposure: '7', maintenanceBurden: '8', populationCapacity: undefined, resourceSecurity: '7' }),
    base('Number Values', { overall: 9, defensibility: 8, sustainability: 7, isolation: 5, exposure: 6, maintenanceBurden: 5, populationCapacity: 8, resourceSecurity: 7 })
  );
  assert.strictEqual(normaliseScore('11'), 10);
  assert.strictEqual(formatDifference('0.03'), 'Even');
  assert.strictEqual(result.overallWinner, 'baseA');
  assert.strictEqual(result.metrics.find((m) => m.key === 'overall').baseAValue, 10);
  assert.strictEqual(result.metrics.find((m) => m.key === 'sustainability').baseAValue, null);
  assert.strictEqual(result.metrics.find((m) => m.key === 'populationCapacity').baseAValue, null);
}

console.log('compare utility tests passed');
