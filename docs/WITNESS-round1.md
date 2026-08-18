# NAGI v0 — Independent Witness Attack, Round 1

Subject: SPEC-v0.1-draft.md
Method: attack the frozen candidate from failure/recovery boundaries rather than feature desirability.

## W1 — WAITING can become a black hole (MATERIAL NEW PERSPECTIVE)
Attack: NAGI promises the user they can stop remembering WAITING items. If a watcher silently dies, permissions expire, network access disappears, or an adapter stops reporting, the user may miss an obligation precisely because NAGI told them to unload it from memory.

Counter-DA: freshness metadata alone is insufficient unless stale monitors change behavior.
Required repair:
- Every monitored WAITING item needs watch-health/freshness.
- STALE/UNKNOWN monitoring cannot silently preserve "you can forget this" semantics.
- A bounded revalidation/dead-man rule must surface material stale commitments before their safety window closes.

Classification: SELF_RESOLVABLE. Does not alter product purpose; strengthens it.

## W2 — Offline/stale context can produce confident situational advice (MATERIAL NEW PERSPECTIVE)
Attack: "予定空いた / このあとどうする" may later depend on current location, opening hours, weather or live calendar changes. If data are stale, the planner can generate a locally coherent but externally false recommendation.

Counter-DA: UNKNOWN rule exists but must be operational, not prose.
Required repair:
- Evidence-dependent constraints carry TTL/freshness policy.
- Planner may offer only claims supported by fresh evidence; otherwise it labels the missing check and asks/rechecks.
- Core recommendations that do not require live facts remain usable offline.

Classification: SELF_RESOLVABLE.

## W3 — "Minimum change" can protect a bad plan (MATERIAL NEW PERSPECTIVE)
Attack: plan stability is good for cognitive calm, but can become inertia. A newly arrived critical commitment can be suppressed if trigger classification is imperfect.

Counter-DA: hard commitments and material risk changes must dominate stability.
Required repair:
- Explicit precedence: SAFETY/AUTH BOUNDARY > HARD CONSTRAINT > MATERIAL RISK > CURRENT PLAN STABILITY > SOFT PREFERENCE.
- Stability is a tie-breaker, never a hard constraint.

Classification: SELF_RESOLVABLE.

## W4 — Checkpoints can become stale lies (MATERIAL NEW PERSPECTIVE)
Attack: a checkpoint says "next: send invoice", but meanwhile another device/user/event may have completed or invalidated the task. Resume could reintroduce obsolete work.

Counter-DA: checkpoint is memory, not authority.
Required repair:
- Resume revalidates current task state/constraints before suggesting the stored next action.
- If evidence cannot be revalidated, label it "last known checkpoint" and do not claim it is still actionable.

Classification: SELF_RESOLVABLE.

## W5 — Learning can create context collision
Attack: "auto-replan at work" leaks into dating/weekend context.
Counter-DA: CONTEXT is already separated, but rule matching needs explicit scope and a safe default when context is ambiguous.
Repair: delegation rules require scope; ambiguous context falls back one autonomy level (AUTO->SUGGEST, SUGGEST->ASK).
Classification: SELF_RESOLVABLE.

## W6 — User can reject suggestions for reasons the model should not infer
Attack: repeated rejection could be due to temporary mood, hidden obligation, accessibility, or privacy rather than preference.
Counter-DA: existing observe->hypothesis->confirm loop handles this if candidate generation stores "unknown reason" rather than inferred cause.
Repair: no causal label without user confirmation.
Classification: SELF_RESOLVABLE.

## Witness verdict round 1
New material perspectives found: 4 (W1-W4).
Non-material refinements: W5-W6.
SPEC FREEZE: NOT YET.
Action: revise specification, then re-Witness only the revised frozen subject.
