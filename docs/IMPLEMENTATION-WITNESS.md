# NAGI v0 — Implementation Witness

Subject: frozen v0 implementation in this directory.
Status: PASS / READY FOR DOGFOOD

## What was executed
- Node built-in test suite.
- 12 executable Core tests.
- 400-step randomized switching invariant check.
- Syntax checks for all JS modules and service worker.
- HTTP smoke check for app shell, manifest, service worker and every runtime module.

## Findings discovered during implementation

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

## Frozen success criteria status
- SC-01 <=3 next candidates: PASS
- SC-02 WAITING/BLOCKED excluded from action candidates: PASS
- SC-03 checkpoint survives state persistence model and carries restore context: PASS (browser reload path implemented; long-term durable storage deferred)
- SC-04 interrupt/return stack: PASS
- SC-05 minimum-change plan stability: PASS
- SC-06 freshness/UNKNOWN guards: PASS at Core level
- SC-07 no silent permanent learning from behavior: PASS
- SC-08 confirmed rules reversible/deletable: PASS
- SC-09 no network/API keys required: PASS
- SC-10 Core independent from UI + executable tests: PASS
- SC-11 rest/play/social intent not automatically converted to productivity: PASS
- SC-12 bounded candidate surface/no-action option: PASS for v0 UI

## Known deferred gates — not solver failures
1. Durable multi-device memory is NOT yet guaranteed. Browser storage may be cleared; UI states this and provides JSON export.
2. No real background watcher yet. WAITING cannot claim safe cognitive offload unless a future adapter proves watcher health.
3. No real Calendar/Gmail/GitHub/Maps/Weather/LLM adapters yet; only adapter boundaries/local fallback are present.
4. No native mobile shell yet; Web/PWA is app-ready, not the final mobile app.
5. Real external writes remain outside v0 and require aggregate-risk/autonomy review.

## Witness convergence
No new architecture-level perspective remained after the implementation repairs above. Remaining items map to explicitly deferred release gates rather than contradictions in frozen v0 Core.

Verdict: PASS / READY FOR SELF-DOGFOOD.
