---
id: T-0077
title: "Reduce secondary weapon timer duration"
type: task
status: todo
priority: P2
owner: engineer
labels: [level-5, balance]
depends_on: []
parallel_with: [T-0065, T-0066, T-0067, T-0073]
parent_epic: E-0007
acceptance:
  - "SECONDARY_WEAPON_DURATION reduced from 60000ms"
  - "Timer bar visually reflects shorter duration"
  - "Existing tests updated if needed"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

The current 60-second secondary weapon duration feels too long. Reducing it increases tactical pressure and makes pickups more valuable.

## Plan

1. `src/engine/constants.ts` — Reduce SECONDARY_WEAPON_DURATION (e.g. to 15000-20000ms)
2. Update any tests that depend on the exact value
