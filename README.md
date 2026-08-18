# NAGI v0

**Adaptive Human Action Load Balancer**  
困った時に、少し持ちます。

NAGI is a Web-first / App-ready prototype for reducing the mental load required to act. It treats forgetting, interruption and plan drift as normal states and helps reconstruct the next useful step.

## v0 features
- "何したらいい？" — <=3 actionable candidates, with reasons
- "何してたっけ？" — restore a last-known checkpoint after revalidating task state
- "予定が崩れた" — minimal-change replanning
- "予定が空いた" — re-evaluate options using current intent/time budget
- "ここまで覚えといて" — explicit work checkpoint
- Interrupt/return stack
- READY/RUNNING/WAITING/BLOCKED/DONE model
- Stale/unknown WAITING protection
- Local-first browser persistence + JSON export
- PWA manifest/service worker
- Core/UI/adapter separation
- Adaptive routing rule model with confirmation before permanent learning

## Run
```bash
npm start
```
Then open `http://localhost:4173`.

## Test
```bash
npm test
```

## Documents
- `docs/SPEC-v0-FROZEN.md` — frozen formal spec
- `docs/SCOPE-FREEZE.md` — scope/change rules
- `docs/WITNESS-round1.md` — first independent attack
- `docs/WITNESS-round2.md` — convergence attack
- `docs/IMPLEMENTATION-WITNESS.md` — implementation-level findings and verdict
- `docs/BACKLOG.md` — intentionally deferred features

## Important v0 limitation
NAGI v0 has no real background watcher. A manually-created WAITING state is **not** treated as safely monitored. Browser persistence is also not a durable cloud backup. These are explicit release gates, not hidden claims.
