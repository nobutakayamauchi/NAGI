import { explainCandidate } from '../core/planner.js';

export function advise(plan) {
  if (plan.staleWatches?.length) {
    return { type: 'WATCH_STALE', message: `待ち状態の監視を${plan.staleWatches.length}件、確認し直した方がよさそう。`, candidates: plan.candidates };
  }
  if (!plan.candidates.length) {
    return { type: 'NO_ACTION', message: '今すぐ実行できる候補が見つからない。条件を見直すか、今は休むのもあり。', candidates: [] };
  }
  return { type: 'NEXT', message: `まずは「${plan.candidates[0].thing.title}」がよさそう。`, why: explainCandidate(plan.candidates[0]), candidates: plan.candidates };
}
