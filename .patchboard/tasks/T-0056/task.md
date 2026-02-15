---
id: T-0056
title: "Create snake laser projectile factory"
type: task
status: review
priority: P1
owner: engineer
labels: [sprint-6, projectile, weapon]
depends_on: [T-0052]
parallel_with: [T-0054, T-0055]
parent_epic: E-0006
acceptance:
  - "createSnakeLaser(position, owner) factory function exists"
  - "Snake laser fires upward with homing enabled (no delay)"
  - "Speed: 400 px/s, damage: 75, collision radius: 8"
  - "Turn rate: 2.0 rad/s (gentle curves toward enemies)"
  - "~6 tests pass"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

The snake laser is the level-4 laser upgrade. It fires a single large homing beam that gently curves toward the nearest enemy. Higher damage than regular laser as reward for reaching max upgrade level.

## Plan

1. Create `src/objects/projectiles/snake/code/Snake.ts`:
   - `createSnakeLaser(position, owner)` → Projectile
   - type: 'snake', isHoming: true, turnRate: SNAKE_TURN_RATE, no homingDelay
2. Create `src/objects/projectiles/snake/code/Snake.test.ts` — ~6 tests
