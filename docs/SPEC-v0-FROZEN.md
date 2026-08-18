# NAGI v0 — Formal Specification Draft

Status: FROZEN / Witness Round 2 converged
Product definition: Adaptive Human Action Load Balancer
Tagline candidate: 困った時に、少し持ちます。

## 1. Raison d'être
NAGI reduces the mental load required to act by routing memory, monitoring, comparison, planning, recovery and low-risk decision work away from the user's working memory and into explicit system components.

NAGI does not require life to proceed according to plan. Interruption, forgetting, delay and plan failure are normal states. When reality changes, NAGI reconstructs the smallest useful next step from the current world state.

NAGI learns not "who the user is", but which kinds of load the user wants delegated, suggested, retained for human judgment, or never automated.

## 2. Product invariant
Every feature MUST answer: "Which human action load does this remove, route, compress, remember, monitor or restore?"
If it cannot answer that question, it is out of scope.

## 3. Core primitives
- THING: an actionable or monitored object.
- STATE: READY | RUNNING | WAITING | BLOCKED | DONE | CANCELLED | UNKNOWN.
- CONSTRAINT: deadline, fixed event, dependency, duration, availability, cost/risk boundary.
- EVENT: an observed change to a THING or the environment.
- CHECKPOINT: recoverable work context: what, progress, next action, open loops, stop reason, references.
- DECISION: user/system choice and rationale.
- PLAN: ordered actionable candidates and fixed commitments.
- ROUTING: AUTO | SUGGEST | ASK | NEVER for a decision/load category.
- EVIDENCE: source, observed_at, freshness, TTL/watch health and confidence.
- WATCH_LEASE: the bounded period during which a WAITING item may safely remain cognitively unloaded without revalidation.

## 4. Required behavior
### 4.1 Next action
Given current WORLD STATE, fixed commitments and available time, NAGI filters non-actionable items before ranking. It returns a small candidate set (default <=3), not an unbounded task list.

### 4.2 Hard constraints before AI
Hard constraints are evaluated before any probabilistic/LLM judgment. UNKNOWN cannot be silently converted to READY.

### 4.3 Checkpoint / Resume
A user can explicitly say "ここまで覚えといて". NAGI stores enough context to reconstruct the last known work state. A checkpoint is memory, not current authority. Before resume, NAGI revalidates the THING state and relevant constraints. If revalidation is unavailable, it presents the checkpoint as "last known" and does not claim the stored next action is still actionable. Observed checkpoints may supplement explicit checkpoints, but inferred data must be labeled as inferred.

### 4.4 Interrupt / return
Starting an interruption while another task is RUNNING creates a checkpoint and pushes the prior task onto a return stack. Finishing the interruption offers the most recent still-actionable return point.

### 4.5 Replanning
Replanning uses minimum necessary change. Small timing drift does not rebuild the day. Stability is a tie-breaker, never a hard constraint. Decision precedence is: SAFETY/AUTH BOUNDARY > HARD CONSTRAINT > MATERIAL RISK > CURRENT PLAN STABILITY > SOFT PREFERENCE. Replan triggers include hard infeasibility, fixed-event changes, material deadline risk, large newly-free time, explicit user request, or newly actionable high-impact work.

### 4.6 Waiting / monitoring
WAITING items may be removed from active cognitive load only while their watch evidence remains healthy within a bounded WATCH_LEASE. WATCH adapters may move them back to READY on admissible evidence. If a watcher becomes STALE/UNKNOWN, NAGI must not silently continue "you can forget this" semantics: material commitments enter revalidation and are surfaced before the applicable safety/deadline window closes. Raw events do not automatically notify the user; notifications are emitted only when the user's next action, monitoring trust, or a material risk changes.

### 4.7 Decision compression
Search and external data are internal evidence-gathering functions. NAGI should normally output <=3 situationally relevant options rather than expose long search result lists. Any option that depends on live facts must be supported by evidence within the source-specific freshness policy/TTL. When live evidence is stale or unavailable, NAGI names the missing check rather than inventing the fact. Offline recommendations may still use constraints that do not depend on live data.

### 4.8 Adaptive routing
Learning dimensions are separate: PREFERENCE, FRICTION, CAPABILITY, DELEGATION, CONTEXT.
Observed behavior alone MUST NOT become a permanent preference. The loop is OBSERVE -> HYPOTHESIS -> USER CONFIRMATION -> RULE. Rejection/override behavior is stored with unknown cause unless the user confirms the reason. Rules are inspectable, reversible and forgettable. Delegation rules are context-scoped; ambiguous context reduces autonomy one level (AUTO->SUGGEST, SUGGEST->ASK).

## 5. Safety / autonomy boundary
- Low-risk reversible decisions may be AUTO only when the user has delegated that category.
- SUGGEST provides a reasoned recommendation.
- ASK requires user choice.
- NEVER forbids automation.
- High-risk, irreversible, credential/authorization-changing, financial, legal/medical consequential actions are not silently auto-executed.

## 6. UX invariants
- Do not shame users for incomplete plans.
- PLAN FAILED is represented as PLAN NO LONGER FITS REALITY -> REPLAN, not USER FAILED.
- The system should be useful when opened only at moments of difficulty; daily streaks are not required.
- Zero-management bias: natural language over mandatory tagging/configuration.
- "なぜこれ?" must be available for recommendations.
- "別の候補" must be available without penalty.
- NAGI does not assume productivity is the goal; user intent may be work, rest, play, social time or recovery.
- Alternative generation is bounded. If repeated alternatives fail, ask which constraint/intent is wrong or offer "decide later / rest / no action" rather than infinite regeneration.
- Surface uncertainty when it can materially change the decision; do not flood the user with internal confidence/debug metadata.

## 7. Privacy / data
- Local-first for v0.
- External adapters are opt-in and minimum-permission.
- Store only data needed for action-load reduction.
- Track provenance/freshness for external observations.
- User can export, delete and forget learned rules.
- UI must not render untrusted content as HTML.

## 8. Architecture
NAGI Core is independent from UI and adapters.

NAGI Core
- state model
- planner
- checkpoint/return stack
- routing/learning
- decision log
- monotonic observation reducer: older evidence cannot silently overwrite newer authoritative state

Adapters
- calendar
- watch sources (GitHub/mail/etc.)
- location/places/weather
- LLM advisor

Surfaces
- Web v0
- PWA
- future native app

App is a user cockpit, not the watcher. Background monitoring must not depend on a foreground mobile app.

## 9. v0 Scope
IN:
1. Responsive Web/PWA shell.
2. Local-first state store.
3. Create THING with minimal fields.
4. READY/RUNNING/WAITING/BLOCKED/DONE transitions.
5. "今なにする?" deterministic candidate generation.
6. "ここまで覚えといて" checkpoint.
7. Interrupt and resume stack.
8. Replan with plan-stability rule.
9. Explain why a recommendation was made.
10. Adaptive delegation rule model + explicit confirmation path.
11. Adapter interfaces for Calendar/Watch/LLM, with no-auth local fallback implementations.
12. Evidence freshness, source TTL, watch-health and UNKNOWN handling.
13. WAITING watch lease / stale-monitor revalidation behavior.
14. Resume-time checkpoint revalidation.

OUT / deferred:
- Real Gmail/GitHub/Calendar OAuth.
- Server-side background watcher.
- Maps/place search/weather APIs.
- Native mobile apps.
- Cross-device sync.
- Automatic consequential external writes.
- Medical/therapeutic claims.

## 10. v0 success criteria
SC-01: From "どうしよう", user gets <=3 actionable next candidates with reasons.
SC-02: Non-actionable WAITING/BLOCKED items are excluded.
SC-03: A checkpoint survives reload and can restore next action.
SC-04: An interruption can be completed and prior work resumed.
SC-05: Replan preserves a still-valid current plan unless a material trigger exists.
SC-06: UNKNOWN/freshness prevents unsupported external-world claims.
SC-06a: A stale/failed watch cannot silently keep a material WAITING commitment cognitively unloaded.
SC-06b: Resume cannot treat a checkpoint as current truth without revalidation or an explicit last-known label.
SC-07: Behavior observations cannot silently create permanent delegation/preferences.
SC-08: Delegation rule can be explicitly accepted, reversed and deleted.
SC-09: Core works without network or API keys.
SC-10: Core logic is UI-independent and covered by executable tests.
SC-11: The planner does not default all free time to productivity; intent is an explicit input/context.
SC-12: Repeated "another option" requests terminate in constraint clarification or a valid no-action choice.

## 11. Frozen design principles candidate
MUST-01 Unknown != known.
MUST-02 Hard constraints precede AI judgment.
MUST-03 Preference/Friction/Capability/Delegation/Context remain distinct.
MUST-04 Behavior alone never creates permanent rules.
MUST-05 Learning is reversible.
MUST-06 Replanning minimizes change.
MUST-07 Notify on action/risk change, not raw events.
MUST-08 Do not make the user manage the management tool.
MUST-09 Minimum permission/minimum retention.
MUST-10 Core != Adapter != UI.
MUST-11 Interruption/forgetting/plan drift are normal states, not user failure.
MUST-12 Do not cross high-risk/irreversible authorization boundaries automatically.
MUST-13 A watcher that loses freshness also loses the right to carry the user's memory silently.
MUST-14 Checkpoint != current truth; revalidate before resume.
MUST-15 Stability never outranks safety, hard constraints or material risk.
MUST-16 Context ambiguity reduces autonomy; it never increases it.
MUST-17 Older observations cannot silently overwrite newer authoritative state.
MUST-18 NAGI optimizes for user-stated intent and action-load reduction, not maximum productivity.
MUST-19 Candidate regeneration is bounded; failure to choose is treated as information, not a demand for infinite options.
