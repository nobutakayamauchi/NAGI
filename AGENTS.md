# AGENTS.md

## Repository role
NAGI v0 is an adaptive human action load balancer that reconstructs the next useful step while treating interruption, forgetting, and plan drift as normal.

## Load order
1. Read `README.md`.
2. Read `docs/SPEC-v0-FROZEN.md` and `docs/SCOPE-FREEZE.md` before changing behavior.
3. Load WITNESS/backlog documents only when the active task needs attack history or deferred scope.

## Source of truth
- The frozen v0 spec and scope-freeze documents define current behavior and boundaries.
- Current code/tests verify implementation reality; do not promote an unverified claim over them.

## Context budget
- Do not load all WITNESS rounds or historical notes by default.
- Start from the frozen spec, current code path, and relevant tests only.

## Human gates
Permanent learned preference changes, external actions, publishing, destructive state changes, or scope expansion require explicit human approval.

## Stop conditions
Stop when WAITING state is stale/unknown, the task assumes a background watcher that v0 does not have, or a requested change exceeds the frozen scope without an explicit scope decision.