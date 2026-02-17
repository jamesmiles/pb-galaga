---
id: T-0099
title: "Auto-fire HUD indicator, version bump v0.9.0, finalization"
type: task
status: todo
priority: P2
owner: null
labels: [renderer, release]
depends_on: [T-0089, T-0090, T-0091, T-0092, T-0093, T-0094, T-0095, T-0096, T-0097, T-0098]
parallel_with: []
parent_epic: E-0009
acceptance:
  - "HUD shows 'AUTO' indicator per-player when auto-fire is active"
  - "autoFire state in GameState reflects InputHandler toggle state"
  - "GAME_VERSION is '0.9.0'"
  - "All tests pass (existing + new from this sprint)"
  - "Build succeeds with acceptable bundle size"
  - "Version displayed correctly on menu screen"
created_at: '2026-02-17'
updated_at: '2026-02-17'
---

## Context

Sprint 9 finalization: sync auto-fire state to GameState for renderer access, display HUD indicator, bump version, and verify everything works.

## Plan

1. `src/types.ts` — Add `autoFire: { p1: boolean, p2: boolean }` to `GameState`
2. `src/engine/StateManager.ts` — Initialize `autoFire: { p1: false, p2: false }`, update `copyStateInto`
3. `src/engine/GameManager.ts` — Each tick: `state.autoFire = this.inputHandler.getAutoFireState()`
4. `src/renderer/HUD.ts` — Draw "AUTO" badge (green `#00ff00`) near weapon label when `state.autoFire.p1` or `.p2` is true
5. `src/engine/constants.ts` — `GAME_VERSION = '0.9.0'`
6. Run full `vitest` suite, fix any failures
7. Run `vite build`, verify bundle size

## Notes

- The auto-fire state must be on GameState (not read directly from InputHandler) to maintain headless-capability and double-buffered state architecture
- This is the final task — all other sprint tasks must be complete first
