---
id: T-0064
title: "Version bump to 0.6.0 and sprint finalization"
type: task
status: todo
priority: P2
owner: null
labels: [sprint-6, release]
depends_on: [T-0052, T-0053, T-0054, T-0055, T-0056, T-0057, T-0058, T-0059, T-0060, T-0061, T-0062, T-0063]
parallel_with: []
parent_epic: E-0006
acceptance:
  - "GAME_VERSION = '0.6.0' in constants.ts"
  - "package.json version = '0.6.0'"
  - "tsc --noEmit passes"
  - "All ~337 tests pass"
  - "Production build succeeds"
  - "Playwright visual tests pass"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Final task for Sprint 6. Version bump and verification that everything compiles, tests pass, and builds cleanly.

## Plan

1. Modify `src/engine/constants.ts` — `GAME_VERSION = '0.6.0'`
2. Modify `package.json` — `version: '0.6.0'`
3. Run `tsc --noEmit`
4. Run `npm test`
5. Run `npm run build`
6. Run `npx playwright test`
