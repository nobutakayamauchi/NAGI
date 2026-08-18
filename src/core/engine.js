import { createThing, STATES, transition, uid, watchHealth } from './model.js';
import { planNext } from './planner.js';

export function createInitialState() {
  return {
    version: 1,
    things: [],
    currentId: null,
    checkpoints: [],
    returnStack: [],
    decisionLog: [],
    routingRules: [],
    routingObservations: [],
    learningCandidates: [],
    intent: 'work'
  };
}

function replaceThing(state, nextThing) {
  return { ...state, things: state.things.map(t => t.id === nextThing.id ? nextThing : t) };
}

export function addThing(state, input, now = new Date()) {
  return { ...state, things: [...state.things, createThing(input, now)] };
}

export function appendCurrentNote(state, note, now = new Date()) {
  if (!state.currentId) return state;
  const text = String(note ?? '').trim();
  if (!text) return state;
  const thing = state.things.find(t => t.id === state.currentId);
  if (!thing) return state;
  const notes = [thing.notes, text].filter(Boolean).join('\n');
  return replaceThing(state, { ...thing, notes, updatedAt: now.toISOString() });
}

export function setIntent(state, intent) { return { ...state, intent }; }

export function setThingState(state, thingId, nextState, now = new Date()) {
  const thing = state.things.find(t => t.id === thingId);
  if (!thing) throw new Error('Thing not found');
  if (nextState === STATES.RUNNING) throw new Error('Use startThing() to enter RUNNING so current/return-stack invariants are preserved');
  let next = replaceThing(state, transition(thing, nextState, now));
  if (nextState !== STATES.RUNNING && state.currentId === thingId) next = { ...next, currentId: null };
  return next;
}

export function checkpointCurrent(state, details = {}, now = new Date()) {
  if (!state.currentId) return { state, checkpoint: null };
  const thing = state.things.find(t => t.id === state.currentId);
  if (!thing) return { state, checkpoint: null };
  const cp = {
    id: uid('cp'), thingId: thing.id, title: thing.title,
    progress: details.progress || thing.notes || '',
    nextAction: details.nextAction || thing.nextAction || '',
    openLoops: details.openLoops || [],
    stopReason: details.stopReason || 'manual checkpoint',
    references: details.references || [],
    createdAt: now.toISOString(),
    authority: 'LAST_KNOWN_MEMORY'
  };
  return { state: { ...state, checkpoints: [...state.checkpoints, cp] }, checkpoint: cp };
}

export function startThing(state, thingId, now = new Date(), stopReason='switch') {
  const target = state.things.find(t => t.id === thingId);
  if (!target) throw new Error('Thing not found');
  if (![STATES.READY, STATES.RUNNING].includes(target.state)) throw new Error(`Thing is not actionable: ${target.state}`);
  let next = state;
  if (state.currentId && state.currentId !== thingId) {
    const prior = state.things.find(t => t.id === state.currentId);
    const cp = checkpointCurrent(next, { stopReason }, now);
    next = cp.state;
    if (prior && prior.state === STATES.RUNNING) {
      next = replaceThing(next, transition(prior, STATES.READY, now));
      next = { ...next, returnStack: [...next.returnStack, { thingId: prior.id, checkpointId: cp.checkpoint?.id || null }] };
    }
  }
  const refreshed = next.things.find(t => t.id === thingId);
  next = replaceThing(next, transition(refreshed, STATES.RUNNING, now));
  return { ...next, currentId: thingId };
}

export function completeCurrent(state, now = new Date()) {
  if (!state.currentId) return { state, resumeCandidate: null };
  const current = state.things.find(t => t.id === state.currentId);
  let next = replaceThing(state, transition(current, STATES.DONE, now));
  next = { ...next, currentId: null };
  const stack = [...next.returnStack];
  let resumeCandidate = null;
  while (stack.length) {
    const entry = stack.pop();
    const thing = next.things.find(t => t.id === entry.thingId);
    if (thing && thing.state === STATES.READY) { resumeCandidate = entry; break; }
  }
  next = { ...next, returnStack: stack };
  return { state: next, resumeCandidate };
}

export function resumeFromCheckpoint(state, checkpointId, now = new Date()) {
  const cp = state.checkpoints.find(c => c.id === checkpointId);
  if (!cp) return { state, status: 'NOT_FOUND', checkpoint: null };
  const thing = state.things.find(t => t.id === cp.thingId);
  if (!thing) return { state, status: 'THING_MISSING', checkpoint: cp };
  if (thing.state !== STATES.READY && thing.state !== STATES.RUNNING) {
    return { state, status: 'LAST_KNOWN_NOT_ACTIONABLE', checkpoint: cp, thing };
  }
  const nextState = startThing(state, thing.id, now, 'resume');
  return { state: nextState, status: 'RESUMED', checkpoint: cp, thing };
}

export function getPlan(state, { now = new Date(), availableMinutes = Infinity, materialTrigger = false } = {}) {
  return planNext({ things: state.things, now, availableMinutes, intent: state.intent, currentId: state.currentId, materialTrigger });
}

export function staleWaitingItems(state, now = new Date()) {
  return state.things.filter(t => {
    const h = watchHealth(t, now);
    return h.status === 'STALE' || h.status === 'UNKNOWN';
  });
}
