import test from 'node:test';
import assert from 'node:assert/strict';
import { planNext } from '../src/core/planner.js';
import { advise } from '../src/adapters/local-advisor.js';

test('rest with no actionable candidate respects selected intent instead of framing rest as fallback', () => {
  const plan = planNext({ things: [], intent: 'rest', availableMinutes: 60 });
  const out = advise(plan);
  assert.equal(plan.intent, 'rest');
  assert.equal(out.type, 'REST_SELECTED');
  assert.match(out.message, /今日は休む方向/);
  assert.doesNotMatch(out.message, /候補が見つからない.*休むのもあり/);
});

test('work with no candidate does not push rest as a productivity fallback', () => {
  const plan = planNext({ things: [], intent: 'work', availableMinutes: 60 });
  const out = advise(plan);
  assert.equal(out.type, 'NO_ACTION');
  assert.match(out.message, /今は決めないでもOK/);
});
