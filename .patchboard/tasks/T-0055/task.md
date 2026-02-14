---
id: T-0055
title: "Create homing missile projectile factory"
type: task
status: review
priority: P1
owner: engineer
labels: [sprint-6, projectile, weapon]
depends_on: [T-0052]
parallel_with: [T-0054, T-0056]
parent_epic: E-0006
acceptance:
  - "createPlayerMissile(position, owner, angle) factory function exists"
  - "Missile fires upward at given angle with homing enabled"
  - "isHoming: true, homingDelay: 200ms (fan-out before homing)"
  - "Speed: 150 initial → 350 max, acceleration 350 px/s^2"
  - "Damage: 10 per missile (3 per volley = 30 total), collision radius: 3"
  - "Turn rate: 3.0 rad/s"
  - "~8 tests pass"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Homing missiles are a player secondary weapon. "Whistling jacks" behavior — 3 missiles fire in a fan pattern (-15/0/+15 degrees), travel briefly in a straight line, then curve toward nearest enemies. Slowest projectile, third highest damage.

## Plan

1. Create `src/objects/projectiles/missile/code/Missile.ts`:
   - `createPlayerMissile(position, owner, angle)` → Projectile
   - type: 'missile', isHoming: true, homingDelay: 200, turnRate: MISSILE_TURN_RATE
2. Create `src/objects/projectiles/missile/code/Missile.test.ts` — ~8 tests
