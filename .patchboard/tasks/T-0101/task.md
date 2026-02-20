---
id: T-0101
title: "Extend data model for Level 6 (types, constants, state)"
type: task
status: done
priority: P1
owner: engineer
labels: [engine, data-model]
depends_on: []
parallel_with: [T-0100, T-0102]
parent_epic: E-0010
acceptance:
  - "Enemy.type union includes 'H' | 'I' | 'J' | 'K'"
  - "Enemy has optional isStationary field"
  - "Player has movementMode: 'ship' | 'tank'"
  - "BossState has optional variant: 'mothership' | 'tank'"
  - "WaveSlot has optional fixedPosition: Vector2D"
  - "WaveConfig has optional bossVariant: 'mothership' | 'tank'"
  - "Constants defined for enemies H-K (health, score, collision radius)"
  - "TANK_GROUND_Y constant defined"
  - "Tank boss constants defined (dimensions, health, fire rates)"
  - "StateManager defaults movementMode to 'ship' in createPlayer()"
created_at: '2026-02-20'
updated_at: '2026-02-20'
---

## Context

Level 6 introduces new enemy types, player tank mode, stationary enemies, and a tank boss variant. The data model needed foundational extensions before any gameplay or rendering code could be written.

## What was done

1. `src/types.ts` — Extended Enemy.type union to `'A'-'K'`, added `isStationary?`, added Player `movementMode`, added BossState `variant?`, added WaveSlot `fixedPosition?`, added WaveConfig `bossVariant?`, expanded EnemySpawnConfig type union
2. `src/engine/constants.ts` — Added ENEMY_H/I/J/K_HEALTH, _SCORE_VALUE, _COLLISION_RADIUS; TANK_GROUND_Y; TANK_BOSS_* constants
3. `src/engine/StateManager.ts` — Default `movementMode: 'ship'` in createPlayer()
