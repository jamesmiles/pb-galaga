---
id: T-0054
title: "Create rocket projectile factory"
type: task
status: todo
priority: P1
owner: null
labels: [sprint-6, projectile, weapon]
depends_on: [T-0052]
parallel_with: [T-0055, T-0056]
parent_epic: E-0006
acceptance:
  - "createPlayerRocket(position, owner, side) factory function exists"
  - "Rocket fires upward with slight X offset based on side (left/right)"
  - "Rocket has acceleration and maxSpeed fields set"
  - "Speed: 200 initial → 420 max, acceleration 400 px/s^2"
  - "Damage: 40, collision radius: 5"
  - "~8 tests pass"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Rockets are a player secondary weapon. They fire from the ship sides, launch slowly, then accelerate to max speed in a straight line. Third fastest projectile, second highest damage.

## Plan

1. Create `src/objects/projectiles/rocket/code/Rocket.ts`:
   - `createPlayerRocket(position, owner, side: 'left' | 'right')` → Projectile
   - type: 'rocket', velocity with ±20px X offset, acceleration, maxSpeed set
2. Create `src/objects/projectiles/rocket/code/Rocket.test.ts` — ~8 tests
