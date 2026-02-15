---
id: T-0084
title: "Mini-boss Type G for Level 3"
type: task
status: review
priority: P1
owner: engineer
labels: [enemy, level-3, gameplay]
depends_on: []
parent_epic: E-0008
acceptance:
  - "Enemy type 'G' added to all type unions (Enemy, WaveSlot, EnemySpawnConfig)"
  - "createEnemyG factory function with 625 HP, radius 40, homing fire mode"
  - "Registered in ENEMY_FACTORY map in LevelManager"
  - "Added as Wave 7 (final wave) of Level 3"
  - "Fires double homing missiles from wing pod positions"
  - "Excluded from dive attacks"
  - "hitG sound effect for destruction"
  - "Level 3 test updated for 7 waves"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Level 3 ("Moon Battle") needed a climactic ending. A mini-boss serves as a bridge between regular formation waves and the full boss fight in Level 5, introducing players to fighting a single large powerful enemy.

## Changes

- `src/types.ts` — 'G' added to Enemy.type, WaveSlot.type, EnemySpawnConfig.type
- `src/engine/constants.ts` — ENEMY_G_HEALTH (625), ENEMY_G_SCORE_VALUE (1000), ENEMY_G_COLLISION_RADIUS (40)
- `src/objects/enemies/enemyG/code/EnemyG.ts` — Factory function
- `src/engine/LevelManager.ts` — G registered in factory map
- `src/engine/EnemyFiringManager.ts` — Double homing missile firing for type G
- `src/engine/DiveManager.ts` — Type G excluded from dive candidates
- `src/levels/level3.ts` — Wave 7 with single G enemy
- `src/levels/level3.test.ts` — Updated wave count to 7
