---
id: T-0086
title: "Finalization: version 0.8.1, tests, build, PR"
type: task
status: review
priority: P1
owner: engineer
labels: [release, testing]
depends_on: [T-0080, T-0081, T-0082, T-0083, T-0084, T-0085]
parent_epic: E-0008
acceptance:
  - "GAME_VERSION bumped to '0.8.1'"
  - "All 378 tests passing"
  - "TypeScript compiles cleanly"
  - "Production build succeeds"
  - "PR #23 created and pushed"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Final rollup task for the v0.8.1 release. All gameplay enhancements, bug fixes, and the mini-boss feature are integrated, tested, and shipped.

## Changes

- `src/engine/constants.ts` — Version bumped to 0.8.1
- `dist/` — Production build output
- PR #23 — gameplay-enhancements-v0.8.1 branch
