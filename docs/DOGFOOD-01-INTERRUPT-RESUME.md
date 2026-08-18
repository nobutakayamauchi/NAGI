# NAGI DOGFOOD-01 — Interrupt → Remember → Return

Status: FIRST ATTEMPT FAILED / REPAIRED / READY TO RETRY
Implementation freeze: do not add the next feature until this gate produces evidence.

## Central promise

> 忘れても戻れる。

Core tests prove checkpoint/return invariants, but real-device dogfood must prove that a person can actually offload the interrupted work and come back with low reconstruction cost.

## First attempt finding

The first iPhone attempt failed before the intended resume test could be completed.

Observed:
- Task A could be started.
- A new urgent task could be added only through the ordinary capture flow.
- Ordinary `追加` did not explicitly interrupt A.
- The return stack was not visible.
- Plan Stability continued to favor the current task.
- The user could not tell how to make urgent work stack on top of the current job.

Classification: UX / access-path failure, not Core stack failure.

## DA / Counter-DA on repair

### Option: every new task automatically interrupts
Rejected. Normal capture must not destroy focus.

### Option: add a priority field and let Planner decide
Rejected. This adds decision work at the exact moment NAGI is supposed to reduce it.

### Selected repair: explicit urgent interrupt
- Normal `追加` remains ordinary capture.
- While a task is running, `緊急で割り込む` appears.
- Pressing it adds the new task and immediately starts it through `startThing()`.
- The current task is checkpointed and pushed onto `returnStack`.
- `中断中 N件 · 戻る順：...` makes stacking visible.
- Completing the interrupt exposes `中断前に戻る` immediately.
- Nested A → B → C interrupts are locked by a LIFO regression test.

Verdict: SELF_RESOLVABLE / REPAIRED.

## Retry flow

Use the public NAGI site on iPhone.

1. Add task A and start it.
2. Do enough work that there is context worth recovering.
3. Optionally tap `ここまで覚えといて` and leave progress / next action.
4. In `置いておく`, enter urgent task B.
5. Tap **`緊急で割り込む`** — do not use ordinary `追加` for this step.
6. Confirm the screen shows `中断中 1件` and A as the return target.
7. Optional stress test: while B is running, add C and tap `緊急で割り込む` again. Confirm `中断中 2件` and return order B → A.
8. Complete the current urgent task.
9. Use the immediate `中断前に戻る` action.
10. If C was used, complete B and confirm A is offered next.
11. Reload/reopen NAGI once and verify state/checkpoints survive.
12. Attempt to continue A using NAGI's displayed last-known context rather than memory alone.

## PASS criteria

All must hold:
- P-01: urgent work can deliberately interrupt in one obvious action.
- P-02: the interrupted work visibly stacks rather than disappearing.
- P-03: nested interrupts unwind LIFO.
- P-04: only one task is current at a time.
- P-05: completion makes the next return target obvious.
- P-06: saved progress/next action are visible as last-known memory, not guaranteed current truth.
- P-07: reload does not erase the state/checkpoint.
- P-08: return requires materially less reconstruction from the user's own memory.
- P-09: the interaction is not annoying/confusing enough that the user would avoid using it in a real interruption.

## Reopen conditions

Reopen implementation if any occurs:
- `緊急で割り込む` is hard to notice or understand;
- the stack count/order is wrong;
- wrong work resumes;
- context is missing or misleading;
- duplicate current tasks appear;
- completion does not expose the return path;
- browser prompts create unacceptable friction;
- the user still needs to remember the important interrupted context;
- any new architecture-level failure perspective appears.

## After PASS

Do not automatically pick a backlog feature. Re-rank the remaining observed pain first. Likely contenders remain WATCH foundation, Calendar adapter, checkpoint/interrupt UX replacement, durable sync, or conversational advisor.
