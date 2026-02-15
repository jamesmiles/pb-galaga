---
id: T-0041
title: "Enemy E (Strategic Bomber) factory and behavior"
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
- EnemyE.ts created in src/objects/enemies/enemyE/code/
- createEnemyE(row, col) factory function
- Health 150, score 300, collision radius 18
- Fire mode spread (4-bullet fan at -12, -4, +4, +12 degrees)
- ~7 unit tests in EnemyE.test.ts
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Enemy Type E is a strategic bomber -- the toughest enemy in the game with 150 HP. Its 4-bullet spread shot covers a wide area, making it dangerous in formations.
