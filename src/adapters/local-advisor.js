import { explainCandidate } from '../core/planner.js';

const NO_ACTION_MESSAGES = Object.freeze({
  rest: '今日は休む方向でいこう。何もしないでもいいし、過ごし方を決めたい時だけ呼んで。',
  play: '遊ぶ方向で考えてるね。今の条件に合う候補がまだない。必要なら別の案を一緒に探せるよ。',
  social: '人と過ごす方向で考えてるね。今の条件に合う候補がまだない。必要なら別の案を一緒に探そう。',
  work: '今すぐ実行できる候補が見つからない。条件を見直すか、今は決めないでもOK。'
});

export function advise(plan) {
  if (plan.staleWatches?.length) {
    return { type: 'WATCH_STALE', message: `待ち状態の監視を${plan.staleWatches.length}件、確認し直した方がよさそう。`, candidates: plan.candidates };
  }
  if (!plan.candidates.length) {
    const intent = plan.intent || 'work';
    return { type: intent === 'rest' ? 'REST_SELECTED' : 'NO_ACTION', message: NO_ACTION_MESSAGES[intent] || NO_ACTION_MESSAGES.work, candidates: [] };
  }
  return { type: 'NEXT', message: `まずは「${plan.candidates[0].thing.title}」がよさそう。`, why: explainCandidate(plan.candidates[0]), candidates: plan.candidates };
}
