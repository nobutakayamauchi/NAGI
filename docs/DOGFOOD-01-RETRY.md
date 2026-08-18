# NAGI DOGFOOD-01 — Retry note

Status: READY FOR REAL-DEVICE RETRY

## New UX repair after first retry discussion

The first repair exposed an explicit interrupt action near normal task capture, but the user correctly identified a remaining usability problem: the emergency path was still not available from the primary `どうした？` entry point.

For NAGI, this is not a cosmetic issue. The product promise is that a person should open NAGI at the moment of confusion or interruption and immediately offload the next decision. Requiring the user to scroll to task capture and discover a secondary interrupt button reintroduces the navigation/search burden the product is intended to remove.

## Repair

`どうした？` now includes a prominent full-width action:

> 急ぎが入った

Flow:

1. Tap `急ぎが入った`.
2. NAGI asks only `急ぎは何？`.
3. The urgent item is created and immediately started.
4. If another item was running, that item is checkpointed by the existing `startThing()` interrupt path and pushed onto the return stack.
5. `中断中 N件 · 戻る順：...` remains visible.
6. Completing the urgent item surfaces `中断前に戻る`.
7. Nested urgent items continue to unwind LIFO (already locked by regression test).

The quick path intentionally does not ask for priority, due date, or estimated duration. During an emergency, those fields would add decision load before offloading can happen. The current v0 uses a neutral internal default duration; the running item is not selected by planner ranking because it starts immediately.

## Retry target

On iPhone:

A running
→ `どうした？ / 急ぎが入った`
→ B
→ optionally `急ぎが入った`
→ C
→ finish C
→ return to B
→ finish B
→ return to A

PASS requires that the user can understand the stack and return order without mentally remembering it.
