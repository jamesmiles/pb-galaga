---
id: T-0066
title: "Boss data model and GameState integration"
type: task
status: todo
priority: P1
owner: engineer
labels: [level-5, boss, types]
depends_on: []
parallel_with: [T-0065, T-0067, T-0073]
parent_epic: E-0007
acceptance:
  - "BossTurret, BossDeathSequence, CollisionZone, BossState interfaces in types.ts"
  - "boss: BossState | null on GameState"
  - "bossSpawn?: boolean on WaveConfig"
  - "Boss constants in constants.ts"
  - "createBoss() factory with 4 turrets"
  - "~5 new tests"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

The boss is fundamentally different from formation enemies — it has multiple hit zones (4 turrets + bridge), two collision layers, and doesn't join the formation grid. A separate BossState on GameState keeps the existing enemy system untouched.

## Plan

1. `src/types.ts` — Add boss interfaces and GameState field
2. `src/engine/StateManager.ts` — boss: null in createInitialState() and copyStateInto()
3. `src/engine/constants.ts` — Boss constants (BOSS_WIDTH, BOSS_HEALTH, BOSS_TURRET_*, etc.)
4. New `src/objects/boss/code/Boss.ts` — createBoss() factory
5. New `src/objects/boss/code/Boss.test.ts`
