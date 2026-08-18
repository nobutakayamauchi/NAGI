export const STATES = Object.freeze({
  READY: 'READY', RUNNING: 'RUNNING', WAITING: 'WAITING', BLOCKED: 'BLOCKED',
  DONE: 'DONE', CANCELLED: 'CANCELLED', UNKNOWN: 'UNKNOWN'
});

export const ROUTING = Object.freeze({ AUTO: 'AUTO', SUGGEST: 'SUGGEST', ASK: 'ASK', NEVER: 'NEVER' });

export function uid(prefix='id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
}

export function createThing(input, now = new Date()) {
  return {
    id: input.id ?? uid('thing'),
    title: String(input.title ?? '').trim() || '名前のないこと',
    state: input.state ?? STATES.READY,
    durationMinutes: Number.isFinite(Number(input.durationMinutes)) ? Math.max(1, Number(input.durationMinutes)) : 25,
    dueAt: input.dueAt || null,
    intent: input.intent || 'work',
    priority: Math.max(0, Math.min(3, Number(input.priority ?? 1))),
    notes: input.notes || '',
    nextAction: input.nextAction || '',
    watch: input.watch || null,
    createdAt: input.createdAt || now.toISOString(),
    updatedAt: now.toISOString(),
    latestEvidenceAt: input.latestEvidenceAt || null,
    latestEvidenceSource: input.latestEvidenceSource || null
  };
}

const terminal = new Set([STATES.DONE, STATES.CANCELLED]);
export function transition(thing, nextState, now = new Date()) {
  if (!Object.values(STATES).includes(nextState)) throw new Error(`Unknown state: ${nextState}`);
  if (terminal.has(thing.state) && nextState !== thing.state) throw new Error(`Cannot transition terminal thing ${thing.state} -> ${nextState}`);
  return { ...thing, state: nextState, updatedAt: now.toISOString() };
}

export function applyObservation(thing, observation) {
  const currentTs = thing.latestEvidenceAt ? Date.parse(thing.latestEvidenceAt) : -Infinity;
  const incomingTs = Date.parse(observation.observedAt);
  if (!Number.isFinite(incomingTs)) throw new Error('Observation requires valid observedAt');
  if (incomingTs < currentTs) return { thing, applied: false, reason: 'OLDER_THAN_CURRENT_EVIDENCE' };
  if ([STATES.DONE, STATES.CANCELLED].includes(thing.state) && observation.state && observation.state !== thing.state) {
    return { thing, applied: false, reason: 'TERMINAL_STATE_PROTECTED' };
  }
  const next = {
    ...thing,
    ...(observation.state ? { state: observation.state } : {}),
    latestEvidenceAt: observation.observedAt,
    latestEvidenceSource: observation.source || 'unknown',
    updatedAt: observation.observedAt
  };
  return { thing: next, applied: true, reason: 'APPLIED' };
}

export function watchHealth(thing, now = new Date()) {
  if (thing.state !== STATES.WAITING || !thing.watch) return { status: 'NOT_APPLICABLE' };
  const leaseUntil = thing.watch.leaseUntil ? Date.parse(thing.watch.leaseUntil) : NaN;
  if (!Number.isFinite(leaseUntil)) return { status: 'UNKNOWN', reason: 'NO_LEASE' };
  return now.getTime() <= leaseUntil
    ? { status: 'HEALTHY', leaseUntil: thing.watch.leaseUntil }
    : { status: 'STALE', leaseUntil: thing.watch.leaseUntil };
}
