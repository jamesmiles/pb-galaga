---
id: T-0067
title: "Enemy Type F - stealth bomber with homing missiles"
type: task
status: review
priority: P1
owner: engineer
labels: [level-5, enemy, projectile]
depends_on: []
parallel_with: [T-0065, T-0066, T-0073]
parent_epic: E-0007
acceptance:
  - "'F' added to Enemy type union"
  - "'homing' added to fireMode union"
  - "createEnemyF() factory with correct stats"
  - "createEnemyHoming() projectile factory"
  - "Enemy homing missiles target state.players not state.enemies"
  - "EnemyFiringManager fires homing for type F"
  - "F registered in ENEMY_FACTORY, FlightPathManager, DiveManager"
  - "~10 new tests"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Enemy F is a green stealth bomber that fires homing missiles ("whistling jacks"). The existing homing system targets enemies; for enemy-fired homing, it must target players instead.

## Plan

1. `src/types.ts` — 'F' in Enemy type, 'homing' in fireMode
2. `src/engine/constants.ts` — ENEMY_F_* and ENEMY_HOMING_* constants
3. New `src/objects/enemies/enemyF/code/EnemyF.ts` — factory
4. New `src/objects/projectiles/missile/code/EnemyHoming.ts` — factory
5. `src/objects/projectiles/laser/code/Laser.ts` — enemy homing targets players
6. `src/engine/EnemyFiringManager.ts` — homing fire rate + case
7. `src/engine/LevelManager.ts` — register createEnemyF
8. `src/engine/FlightPathManager.ts` — F: 0.7 entry speed
9. `src/engine/DiveManager.ts` — F: 0.8 dive speed
10. Tests for factory, homing, and firing
