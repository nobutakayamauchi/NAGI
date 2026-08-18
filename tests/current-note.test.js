import test from 'node:test';
import assert from 'node:assert/strict';
import { addThing, appendCurrentNote, checkpointCurrent, createInitialState, startThing } from '../src/core/engine.js';

const at = s => new Date(s);

test('current work note can be appended without changing running state', () => {
  let s = createInitialState();
  s = addThing(s, { id: 'a', title: 'A' }, at('2026-08-18T00:00:00Z'));
  s = startThing(s, 'a', at('2026-08-18T00:01:00Z'));
  s = appendCurrentNote(s, 'first detail', at('2026-08-18T00:02:00Z'));
  s = appendCurrentNote(s, 'second detail', at('2026-08-18T00:03:00Z'));
  const a = s.things.find(t => t.id === 'a');
  assert.equal(s.currentId, 'a');
  assert.equal(a.state, 'RUNNING');
  assert.equal(a.notes, 'first detail\nsecond detail');
});

test('current work notes become checkpoint recovery material when progress is omitted', () => {
  let s = createInitialState();
  s = addThing(s, { id: 'a', title: 'A' }, at('2026-08-18T00:00:00Z'));
  s = startThing(s, 'a', at('2026-08-18T00:01:00Z'));
  s = appendCurrentNote(s, 'remember this context', at('2026-08-18T00:02:00Z'));
  const out = checkpointCurrent(s, { nextAction: 'continue here' }, at('2026-08-18T00:03:00Z'));
  assert.equal(out.checkpoint.progress, 'remember this context');
  assert.equal(out.checkpoint.nextAction, 'continue here');
});
