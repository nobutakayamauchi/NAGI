# NAGI DOGFOOD-01 — Interrupt → Remember → Return

Status: READY TO RUN
Implementation freeze: do not add the next feature until this gate produces evidence.

## Why this is the next task

NAGI's central promise is not merely that a state machine can resume a task. The human-facing promise is:

> 忘れても戻れる。

Core tests already prove checkpoint/return invariants. They do **not** prove that a person who is interrupted can stop remembering the work, come back later, and understand what to do next with low cognitive load.

Adding Calendar, WATCH, LLM, Places, sync, or native-app work before this evidence would increase scope while the primary product hypothesis remains unverified.

## DA

### DA-01 — Skip dogfood and build integrations first
Risk: integrations amplify a weak recovery UX and create a larger system whose core human value is still unknown.

### Counter-DA
The current v0 is already sufficient to run a real interruption/resume experiment. No external integration is required to answer the narrower question. Therefore new integration work is not yet essential.

Verdict: DOGFOOD FIRST.

### DA-02 — Core tests already prove resume
Risk: confusing state-machine correctness with human reconstructability.

### Counter-DA
The failure mode is UX/cognition: prompts may be annoying, the saved wording may be insufficient, the return point may not feel trustworthy, or the user may still need to remember context manually. Only real use can expose this.

Verdict: REAL-DEVICE EVIDENCE REQUIRED.

### DA-03 — Showing checkpoint memory may create false confidence
Risk: a saved checkpoint may no longer reflect current reality.

### Counter-DA
The public UI now labels the data explicitly as `最後に覚えた` / `次にやる予定だった` and asks the user to re-check current reality. The dogfood must verify that this distinction is understandable rather than merely technically present.

Verdict: TEST THE WORDING, DO NOT PROMOTE MEMORY TO TRUTH.

### DA-04 — A scripted interruption is artificial
Risk: passing a staged flow may not predict real interruptions.

### Counter-DA
DOGFOOD-01 is a functional/UX gate, not final ecological validation. Passing it allows natural daily dogfood to begin; failing it is immediately useful. Natural interruptions remain a later evidence layer.

Verdict: SCRIPTED FIRST, NATURAL DOGFOOD NEXT.

## Frozen test flow

Use the public NAGI site on the normal iPhone browser/PWA environment.

1. Add a real or realistic task A.
2. Start task A.
3. Do enough work that there is meaningful context to lose.
4. Tap `ここまで覚えといて`.
5. Record both:
   - what was completed / current progress;
   - the next concrete action.
6. Start a different task B so A is interrupted.
7. Complete B.
8. Reload/reopen NAGI once before returning to A. This checks browser persistence as part of the same flow.
9. Use `何してたっけ？` or the latest `戻れる場所`.
10. Attempt to continue A without relying on memory outside NAGI.

## PASS criteria

All must hold:

- P-01: A is recoverable after interruption.
- P-02: only the correct work item becomes current; no duplicate RUNNING state is visible.
- P-03: the saved progress is visible as last-known memory.
- P-04: the saved next action is visible and sufficient to restart work.
- P-05: NAGI does not present checkpoint memory as guaranteed current truth.
- P-06: the browser reload does not erase the checkpoint/state.
- P-07: returning requires materially less reconstruction from the user's own memory than starting from only the task title.
- P-08: no interaction in the flow feels so annoying or confusing that the user would realistically stop using the feature.

## FAIL / reopen conditions

Reopen implementation if any occurs:

- wrong task resumes;
- context is missing or misleading;
- checkpoint survives in data but is hard to understand;
- reload loses data;
- browser `prompt()` flow creates unacceptable friction;
- completion of B fails to make return to A obvious;
- the user still has to mentally remember the important context;
- any new architecture-level failure perspective appears.

## Evidence to capture

Minimum:

- short screen recording or screenshots;
- what the user expected;
- what NAGI showed;
- whether continuation was possible without reconstructing context manually;
- friction points, even if the test technically passed.

## What happens after PASS

Do **not** automatically choose the next feature from the backlog. Re-rank the remaining pain after this test.

Current likely contenders:

1. real WATCH foundation — makes WAITING genuinely safe to offload;
2. Calendar adapter — gives NAGI real time constraints instead of a manual available-minutes field;
3. in-app checkpoint/interrupt UX — replace browser prompts if DOGFOOD-01 shows interaction friction;
4. durable/cross-device persistence — if local browser durability becomes the dominant trust problem;
5. conversational/LLM advisor — only if deterministic candidate reduction proves insufficient.

The observed pain from DOGFOOD-01 decides the next implementation target.

## Stop point

This document is the pre-implementation stop requested by `/goal`.

Next action requires real-device evidence. No new product feature should be implemented before the result is reviewed through DA / Counter-DA / Essential thinking.
