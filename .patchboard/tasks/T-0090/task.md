---
id: T-0090
title: "Add game difficulty type and state management"
type: task
status: todo
priority: P1
owner: null
labels: [engine, chaos]
depends_on: []
parallel_with: [T-0089, T-0091, T-0097]
parent_epic: E-0009
acceptance:
  - "GameDifficulty type exported: 'normal' | 'chaos'"
  - "GameState.difficulty field defaults to 'normal'"
  - "CHAOS_ENEMY_MULTIPLIER = 2 and CHAOS_WEAPON_DROP_MULTIPLIER = 2 exported from constants"
  - "copyStateInto preserves difficulty field"
  - "StateManager tests verify difficulty initialization and copy"
created_at: '2026-02-17'
updated_at: '2026-02-17'
---

## Context

Chaos mode doubles enemy wave sizes and weapon drop rates. This task adds the data model and constants — the menu is T-0092 and the multiplier logic is T-0093.

## Plan

1. Add `GameDifficulty = 'normal' | 'chaos'` to `src/types.ts`
2. Add `difficulty: GameDifficulty` to `GameState` interface
3. Update `createInitialState()` in `src/engine/StateManager.ts` with `difficulty: 'normal'`
4. Update `copyStateInto()` to copy the `difficulty` field
5. Add constants to `src/engine/constants.ts`: `CHAOS_ENEMY_MULTIPLIER = 2`, `CHAOS_WEAPON_DROP_MULTIPLIER = 2`

## Notes

- Difficulty is set by the difficulty submenu (T-0092) and read by spawning systems (T-0093)
