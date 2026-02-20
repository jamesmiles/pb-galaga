---
id: T-0102
title: "Create enemy factory functions for types H, I, J, K"
type: task
status: done
priority: P1
owner: engineer
labels: [engine, enemies]
depends_on: [T-0101]
parallel_with: []
parent_epic: E-0010
acceptance:
  - "createEnemyH() returns Turret Cannon: type 'H', isStationary true, fireMode 'bullet', fireRate 2000, HP 120"
  - "createEnemyI() returns Artillery: type 'I', isStationary true, fireMode 'plasma', fireRate 2500, HP 150"
  - "createEnemyJ() returns Mech Warrior: type 'J', fireMode 'spread', fireRate 4000, HP 100"
  - "createEnemyK() returns Missile Launcher: type 'K', fireMode 'homing', fireRate 3500, HP 80"
  - "5 unit tests per factory function passing"
created_at: '2026-02-20'
updated_at: '2026-02-20'
---

## Context

Level 6 introduces 4 new enemy types for ground combat. H and I are stationary (turrets/artillery), J and K are mobile (mech/launcher). All follow the existing factory function pattern (see EnemyF.ts).

## What was done

Created 4 factory files + 4 test files:
- `src/objects/enemies/enemyH/code/EnemyH.ts` + `EnemyH.test.ts`
- `src/objects/enemies/enemyI/code/EnemyI.ts` + `EnemyI.test.ts`
- `src/objects/enemies/enemyJ/code/EnemyJ.ts` + `EnemyJ.test.ts`
- `src/objects/enemies/enemyK/code/EnemyK.ts` + `EnemyK.test.ts`

Each test verifies: correct type, health/maxHealth, score, collision radius, and type-specific properties (isStationary for H/I, fireMode for all).
