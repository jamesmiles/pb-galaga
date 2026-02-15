---
id: T-0075
title: "Version bump to 0.7.0 and finalization"
type: task
status: todo
priority: P2
owner: engineer
labels: [level-5, release]
depends_on: [T-0065, T-0066, T-0067, T-0068, T-0069, T-0070, T-0071, T-0072, T-0073, T-0074]
parallel_with: []
parent_epic: E-0007
acceptance:
  - "GAME_VERSION = '0.7.0' in constants.ts"
  - "package.json version = '0.7.0'"
  - "tsc --noEmit passes"
  - "All ~385 tests pass"
  - "Production build succeeds"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Final task for Level 5. Version bump and verification.

## Plan

1. `src/engine/constants.ts` — GAME_VERSION = '0.7.0'
2. `package.json` — version: '0.7.0'
3. Run tsc, tests, build
4. Create PR
