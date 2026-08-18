import { STATES, watchHealth } from './model.js';

const PRECEDENCE = ['SAFETY_AUTH', 'HARD_CONSTRAINT', 'MATERIAL_RISK', 'PLAN_STABILITY', 'SOFT_PREFERENCE'];
export { PRECEDENCE };

function dueScore(thing, now) {
  if (!thing.dueAt) return { score: 0, label: null };
  const ms = Date.parse(thing.dueAt) - now.getTime();
  if (!Number.isFinite(ms)) return { score: 0, label: '期限不明' };
  const hours = ms / 3_600_000;
  if (hours <= 0) return { score: 80, label: '期限超過/到達' };
  if (hours <= 3) return { score: 60, label: '期限が近い' };
  if (hours <= 24) return { score: 35, label: '今日中の期限' };
  if (hours <= 72) return { score: 15, label: '期限が近づいている' };
  return { score: 2, label: null };
}

function isActionable(thing) {
  return thing.state === STATES.READY || thing.state === STATES.RUNNING;
}

export function planNext({ things, now = new Date(), availableMinutes = Infinity, intent = 'work', currentId = null, materialTrigger = false, limit = 3 }) {
  const candidates = [];
  const staleWatches = [];
  for (const thing of things) {
    const wh = watchHealth(thing, now);
    if (wh.status === 'STALE' || wh.status === 'UNKNOWN') staleWatches.push({ thingId: thing.id, title: thing.title, watch: wh });
    if (!isActionable(thing)) continue;
    if (Number.isFinite(availableMinutes) && thing.durationMinutes > availableMinutes) continue;

    let score = thing.priority * 10;
    const reasons = [];
    const due = dueScore(thing, now);
    score += due.score;
    if (due.label) reasons.push(due.label);

    if (thing.intent === intent) { score += 40; reasons.push(`${intent}の意図に合う`); }
    if (Number.isFinite(availableMinutes)) {
      const fit = Math.max(0, 10 - Math.abs(availableMinutes - thing.durationMinutes) / 10);
      score += fit;
      if (thing.durationMinutes <= availableMinutes) reasons.push(`空き時間${availableMinutes}分に収まる`);
    }
    if (!materialTrigger && currentId && thing.id === currentId && thing.state === STATES.RUNNING) {
      score += 25;
      reasons.push('今の作業を保つ方が切替負荷が小さい');
    }
    if (!reasons.length) reasons.push('今すぐ実行できる');
    candidates.push({ thing, score, reasons });
  }
  candidates.sort((a,b) => b.score - a.score || Date.parse(a.thing.createdAt) - Date.parse(b.thing.createdAt));

  return {
    candidates: candidates.slice(0, Math.max(1, Math.min(limit, 3))),
    staleWatches,
    noActionOption: { id: 'NO_ACTION', title: intent === 'rest' ? 'そのまま休む' : '今は決めない', reason: '何もしない/後で決めるのも有効な選択' }
  };
}

export function explainCandidate(candidate) {
  return `${candidate.thing.title}：${candidate.reasons.join('・')}`;
}
