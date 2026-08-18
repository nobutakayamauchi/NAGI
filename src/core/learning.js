import { ROUTING, uid } from './model.js';

const ORDER = [ROUTING.NEVER, ROUTING.ASK, ROUTING.SUGGEST, ROUTING.AUTO];

export function lowerAutonomy(level) {
  const i = ORDER.indexOf(level);
  return i <= 0 ? ORDER[0] : ORDER[i - 1];
}

export function recordRoutingObservation(state, { category, context='default', requestedLevel, reason='unknown' }, now = new Date()) {
  const event = { id: uid('obs'), category, context, requestedLevel, reason, at: now.toISOString() };
  const observations = [...(state.routingObservations || []), event];
  const recent = observations.filter(x => x.category === category && x.context === context && x.requestedLevel === requestedLevel).slice(-3);
  const candidate = recent.length >= 3
    ? { id: uid('candidate'), category, context, level: requestedLevel, status: 'PENDING_CONFIRMATION', evidenceCount: recent.length, createdAt: now.toISOString() }
    : null;
  return { ...state, routingObservations: observations, learningCandidates: candidate ? [...(state.learningCandidates || []), candidate] : (state.learningCandidates || []) };
}

export function confirmLearningCandidate(state, candidateId, now = new Date()) {
  const candidate = (state.learningCandidates || []).find(c => c.id === candidateId);
  if (!candidate) throw new Error('Learning candidate not found');
  const rule = { id: uid('rule'), category: candidate.category, context: candidate.context, level: candidate.level, enabled: true, createdAt: now.toISOString(), lastUsedAt: null };
  return {
    ...state,
    routingRules: [...(state.routingRules || []), rule],
    learningCandidates: state.learningCandidates.map(c => c.id === candidateId ? { ...c, status: 'CONFIRMED', confirmedAt: now.toISOString() } : c)
  };
}

export function disableRule(state, ruleId) {
  return { ...state, routingRules: (state.routingRules || []).map(r => r.id === ruleId ? { ...r, enabled: false } : r) };
}

export function deleteRule(state, ruleId) {
  return { ...state, routingRules: (state.routingRules || []).filter(r => r.id !== ruleId) };
}

export function routingFor(state, category, context) {
  const exact = (state.routingRules || []).find(r => r.enabled && r.category === category && r.context === context);
  if (exact) return { level: exact.level, source: 'EXACT_RULE' };
  const generic = (state.routingRules || []).find(r => r.enabled && r.category === category && r.context === 'default');
  if (generic) return { level: lowerAutonomy(generic.level), source: 'AMBIGUOUS_CONTEXT_DOWNGRADED' };
  return { level: ROUTING.ASK, source: 'DEFAULT' };
}
