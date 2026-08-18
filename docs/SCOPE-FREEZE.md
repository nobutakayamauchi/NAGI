# NAGI v0 Scope Freeze

Freeze status: ACTIVE

Frozen subject: docs/SPEC-v0-FROZEN.md
Witness evidence: WITNESS-round1.md, WITNESS-round2.md

## Freeze rule
During v0 implementation, feature ideas do not enter Core unless they are required to satisfy a frozen success criterion or repair a demonstrated integrity defect. New product ideas go to BACKLOG.md.

## Allowed integrity repairs
A repair may be made without unfreezing when it restores a frozen invariant, testability, deterministic behavior, data integrity, or safety boundary without expanding the product promise.

## Return-to-human conditions
Stop and return when a change requires credentials/authentication, irreversible external operation, consequential external writes, material scope change, or an ambiguous product decision that cannot be resolved from the frozen principles.

## v0 implementation target
A dependency-light responsive Web/PWA that runs without external API keys, proves NAGI Core behavior locally, and keeps all future external integrations behind adapters.
