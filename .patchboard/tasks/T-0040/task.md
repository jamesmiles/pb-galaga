---
id: T-0040
title: "Enemy D (Curved Fighter) factory and behavior"
type: task
status: done
priority: P1
owner: engineer
labels:
- enemies
- gameplay
depends_on:
- T-0039
parent_epic: E-0005
acceptance:
- EnemyD.ts created in src/objects/enemies/enemyD/code/
- createEnemyD(row, col) factory function
- Health 75, score 250, collision radius 14
- Fire mode plasma (single large projectile)
- ~7 unit tests in EnemyD.test.ts
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Enemy Type D is a curved fighter that fires plasma projectiles, introduced in Level 3. Moderate health with high-damage projectiles makes it a threatening presence.
