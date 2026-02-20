---
id: T-0103
title: "Implement stationary enemy system"
type: task
status: done
priority: P1
owner: engineer
labels: [engine, enemies, formation]
depends_on: [T-0101, T-0102]
parallel_with: []
parent_epic: E-0010
acceptance:
  - "Stationary enemies (isStationary=true) skip formation movement in FormationManager"
  - "Stationary enemies excluded from dive candidates in DiveManager"
  - "Stationary enemies bypass front-row filter in EnemyFiringManager (always eligible to fire)"
  - "H/I types fire aimed shots toward nearest player using atan2"
  - "LevelManager places enemies at fixedPosition when WaveSlot specifies it"
  - "Chaos mode doubles stationary enemy HP"
  - "J/K have entry speed multipliers (0.8x and 1.2x) in FlightPathManager"
  - "J/K have dive speed multipliers (0.8x and 1.2x) in DiveManager"
created_at: '2026-02-20'
updated_at: '2026-02-20'
---

## Context

Level 6 introduces stationary enemies (turrets, artillery) that don't participate in formation movement or dives. They fire aimed shots at the player. This required changes across multiple engine systems.

## What was done

1. `src/engine/FormationManager.ts` — Added `if (enemy.isStationary) continue;` in updateEnemyPositions()
2. `src/engine/DiveManager.ts` — Added `&& !e.isStationary` to dive candidate filter; added J/K speed multipliers
3. `src/engine/EnemyFiringManager.ts` — Stationary enemies bypass front-row column filter; added aimed firing for H/I using `atan2(playerY - enemyY, playerX - enemyX)`; added `getNearestPlayerPosition()` helper
4. `src/engine/LevelManager.ts` — Extended ENEMY_FACTORY map with H-K; `fixedPosition` handling sets enemy position and `isStationary = true`; chaos mode 2x HP for stationary enemies; tank boss dispatch
5. `src/engine/FlightPathManager.ts` — Added J/K entry speed multipliers
