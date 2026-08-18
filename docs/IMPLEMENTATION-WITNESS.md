# NAGI v0 — Implementation Witness

Subject: frozen v0 implementation in this directory.
Status: PASS / RETRY DOGFOOD

## What was executed
- Node built-in test suite.
- 15 executable regression tests (13 Core/invariant tests + 2 intent-aware UX tests).
- 400-step randomized switching invariant check.
- Syntax checks for JS modules and service worker.
- HTTP smoke check for app shell, manifest, service worker and runtime modules.
- Public GitHub Pages deployment and iPhone dogfood smoke.
- First real-device DOGFOOD-01 attempt, which exposed an interrupt UX failure.

## Findings discovered during implementation and dogfood

### I-01 — Explicit rest intent lost to task priority
Observed: first test run returned a work task when the user's explicit intent was rest.
Risk: NAGI degenerates into a productivity-pressure tool.
Repair: intent alignment now outranks ordinary task priority; only stronger deadline/material-risk evidence may dominate it.
Result: repaired, regression test PASS.

### I-02 — Manual WAITING was falsely treated as monitored
Observed: first UI implementation gave a 24h "manual watch lease" even though no actual watcher exists in v0.
Risk: false cognitive offload; user could forget a commitment because NAGI implied monitoring that did not exist.
Repair: manual WAITING is now UNKNOWN/unmonitored. UI explicitly says v0 cannot yet promise "forget it safely" and stale/unknown waits are surfaced.
Result: repaired.

### I-03 — External observation could resurrect terminal work
Observed by adversarial code review: raw observations could bypass task transition protection and set DONE back to READY.
Risk: delayed/out-of-order events can re-open completed obligations.
Repair: terminal DONE/CANCELLED state is protected from contradictory observation updates.
Result: repaired, regression test PASS.

### I-04 — RUNNING state could theoretically bypass current-task invariants
Observed by adversarial code review: generic state transition function could be used to enter RUNNING without updating currentId/return stack.
Risk: multiple simultaneous RUNNING tasks or broken resume semantics.
Repair: RUNNING may only be entered through startThing().
Result: repaired; randomized invariant test PASS.

### I-05 — Root-absolute asset paths break project-site hosting
Observed during public deployment preparation: root-absolute URLs (`/src/...`, `/sw.js`) work at domain root but break when hosted under a project path such as `/NAGI/`.
Risk: Web/PWA passes local smoke tests but fails after public deployment.
Repair: app shell, manifest start URL, service-worker registration and precache URLs are project-path relative.
Result: repaired; local root hosting remains valid and project-path resolution is now portable.

### I-06 — Rest was still framed as a fallback in no-candidate guidance
Observed in first public iPhone dogfood: after explicitly selecting `rest`, the local advisor said no action was available and suggested that resting was also an option.
Risk: the UI contradicts the already-selected intent and reintroduces the productivity-pressure framing that SC-11 exists to prevent.
Repair: the plan now carries current intent into the advisor; no-action guidance is intent-aware. `rest` is treated as the selected direction rather than a consolation prize. Work/no-candidate guidance no longer pushes rest as a fallback.
Result: repaired; 2 UX regression tests PASS.

### I-07 — Checkpoint context was persisted but not actually reconstructed for the user
Observed by post-dogfood code review: checkpoints stored `progress` and `nextAction`, but the UI only showed title and timestamp and resume messages did not expose that context.
Risk: NAGI could technically resume a Thing while still failing the human promise of "what was I doing / where do I continue?".
DA: a checkpoint is last-known memory, not current truth; displaying it as current fact would create false confidence.
Repair: checkpoint cards and resume guidance now surface `progress` as "最後に覚えた" and `nextAction` as "次にやる予定だった", and explicitly remind the user to re-check current reality.
Result: repaired. Real-device interruption/resume dogfood remains required.

### I-08 — Internal state/intent codes leaked into the public UI
Observed in public smoke and source review: values such as `READY` and raw intent codes such as `work` could be shown directly.
Risk: implementation vocabulary increases cognitive load in a product whose purpose is to reduce it.
Repair: internal values remain stable in Core, while the UI translates them to human language such as `今できる`, `いまやってる`, `待ち`, `完了`, `仕事・用事`, and `休む`.
Result: repaired.

### I-09 — Real emergency work could not be entered as an obvious stacked interrupt
Observed in the first DOGFOOD-01 real-device attempt: while task A was running, adding urgent task B only placed B in the normal task list. There was no explicit one-step emergency path, no visible return stack, and Plan Stability kept the current task favored. The user could not reliably tell that work was being stacked.
Risk: NAGI's SC-04 interrupt/return mechanism exists in Core but is practically inaccessible in the exact moment it is meant to reduce cognitive load.
DA: automatically interrupting on every new task would be worse, because ordinary capture would constantly destroy focus. Merely adding a priority field would also add decision work during an emergency.
Counter-DA: a separate explicit `緊急で割り込む` action preserves normal capture while allowing one deliberate interruption. It can reuse the existing `startThing()` invariant path, which checkpoints the current task and pushes it onto the return stack.
Repair:
- normal `追加` remains non-interrupting;
- `緊急で割り込む` appears only while something is running;
- the new task is added and immediately started through `startThing()`;
- `中断中 N件 · 戻る順：...` makes the stack visible;
- completing an interrupt shows an immediate `中断前に戻る` action;
- a nested A → B → C regression test locks LIFO unwind behavior;
- service-worker cache generation was bumped so the repaired UI replaces stale public assets.
Result: repaired in code; 15/15 regression tests PASS. Real-device retry required.

## Frozen success criteria status
- SC-01 <=3 next candidates: PASS
- SC-02 WAITING/BLOCKED excluded from action candidates: PASS
- SC-03 checkpoint survives state persistence model and carries restore context: PASS at Core; public UI exposes last-known progress/next-action semantics, awaiting real interruption/resume retry
- SC-04 interrupt/return stack: PASS at Core + nested LIFO regression; explicit public interrupt UX implemented, awaiting real-device retry
- SC-05 minimum-change plan stability: PASS
- SC-06 freshness/UNKNOWN guards: PASS at Core level
- SC-07 no silent permanent learning from behavior: PASS
- SC-08 confirmed rules reversible/deletable: PASS
- SC-09 no network/API keys required: PASS
- SC-10 Core independent from UI + executable tests: PASS
- SC-11 rest/play/social intent not automatically converted to productivity: PASS + UX regression locked
- SC-12 bounded candidate surface/no-action option: PASS for v0 UI

## Known deferred gates — not solver failures
1. Durable multi-device memory is NOT yet guaranteed. Browser storage may be cleared; UI states this and provides JSON export.
2. No real background watcher yet. WAITING cannot claim safe cognitive offload unless a future adapter proves watcher health.
3. No real Calendar/Gmail/GitHub/Maps/Weather/LLM adapters yet; only adapter boundaries/local fallback are present.
4. No native mobile shell yet; Web/PWA is app-ready, not the final mobile app.
5. Real external writes remain outside v0 and require aggregate-risk/autonomy review.

## Witness convergence
The first DOGFOOD-01 attempt did produce a materially new perspective: Core interrupt correctness is not enough if urgent capture cannot deliberately enter that path and the user cannot see the stack. The repair does not expand v0 scope; it exposes and makes legible an already-frozen SC-04 capability.

Next evidence gate: retry DOGFOOD-01 on iPhone using the explicit urgent-interrupt path and verify A → urgent B → optional urgent C → completion → visible LIFO return without relying on memory.

Verdict: REPAIRED / READY FOR DOGFOOD RETRY.
