# NAGI v0 — Independent Witness Attack, Round 2

Subject: SPEC-v0.2-witness-revised.md only.
Goal: find materially new failure perspectives, not restate Round 1.

## Lens A — Memory durability
Attack: local browser storage can be cleared or unavailable. This matters because the product invites cognitive offloading.
Assessment: real risk, but v0 explicitly claims reload persistence, not durable cloud custody. Production/public messaging must not claim durable memory until persistence/sync guarantees exist. Add a visible storage-health/export path before broad trust claims.
Classification: DEFERRED RELEASE GATE, not a v0 Core contradiction.

## Lens B — Rule drift and reversibility
Attack: old confirmed rules can become wrong over time.
Assessment: reversible/forgettable rules already exist. Add last-used/created timestamps and an explicit review/disable path; no new architecture required.
Classification: covered refinement.

## Lens C — Time/order ambiguity
Attack: event ordering, timezone or delayed observations may reorder reality.
Assessment: EVIDENCE has observed_at and source provenance. Core must use event timestamps and reject older observations from overwriting newer authoritative state. This is an implementation invariant, not a new product perspective.
Classification: covered implementation requirement.

## Lens D — Autonomy escalation through combined low-risk actions
Attack: multiple individually reversible/low-risk actions can compose into a consequential outcome.
Assessment: v0 does not execute external writes. Future automation needs transaction/aggregate risk evaluation, but it is outside frozen v0 execution scope.
Classification: deferred adapter/autonomy gate.

## Lens E — "Helpful" recommendation becomes productivity coercion
Attack: planner may always optimize for work and turn recovery/free time into productivity pressure.
Assessment: product raison says action-load reduction, not output maximization. Ranking must accept user intent/context (rest, fun, work) and never assume productivity is the objective.
Classification: already implied, add explicit UX invariant before freeze.

## Lens F — Recommendation loop trap
Attack: user repeatedly asks "別の候補" and receives endless variations, increasing load.
Assessment: decision compression needs a stop condition. After bounded alternatives, NAGI should ask which constraint is wrong or offer "決めない/休む/あとで" rather than infinite regeneration.
Classification: local refinement, self-resolvable.

## Lens G — User cannot tell what NAGI actually knows
Attack: confidence/source may exist internally but UI hides uncertainty.
Assessment: "why this?" plus evidence requirements cover rationale, but uncertainty should be surfaced only when decision-relevant, not as debug noise.
Classification: local refinement.

## Round 2 verdict
No new architectural/root-cause perspective beyond the revised model.
New local refinements: E, F, G.
Deferred release gates: durable persistence trust, aggregate external-action risk.

Convergence criterion: no materially new perspective found under memory, recovery, time/order, autonomy composition, motivational bias, decision-loop and epistemic-visibility lenses.

SPEC FREEZE: READY after incorporating E/F/G and the implementation ordering rule.
