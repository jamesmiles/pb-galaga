---
id: T-0098
title: "Extend primary weapon to level 5 + HUD power bar revision"
type: task
status: todo
priority: P2
owner: null
labels: [engine, weapons, renderer]
depends_on: []
parallel_with: [T-0092, T-0094, T-0095, T-0096]
parent_epic: E-0009
acceptance:
  - "primaryLevel type supports 1-5"
  - "Bullet L5: same 5-bullet fan as L4, 2x visual bullet size, 25% more damage"
  - "Snake laser L5: homing snake, 2x visual length, 25% more damage"
  - "Weapon pickup upgrades to L5 (cap raised from 4 to 5)"
  - "HUD power bar shows 5 segments instead of 4"
  - "Visual rendering uses larger sizes at L5"
  - "Unit tests for L5 fire patterns, damage values, and upgrade cap"
created_at: '2026-02-17'
updated_at: '2026-02-17'
---

## Context

The current weapon upgrade path caps at level 4. Level 5 extends it with enhanced versions: bigger bullets with more damage (bullet path) and longer homing snakes with more damage (laser path).

## Plan

### Game logic
1. `src/types.ts` — Change `primaryLevel: 1|2|3|4` to `1|2|3|4|5`
2. `src/engine/constants.ts` — Add:
   - `PLAYER_BULLET_L5_DAMAGE = 31` (25% more than 25)
   - `SNAKE_L5_DAMAGE = 94` (25% more than 75)
   - `BULLET_L5_SIZE_MULTIPLIER = 2`
   - `SNAKE_L5_LENGTH_MULTIPLIER = 2`
3. `src/engine/WeaponManager.ts` — Raise upgrade cap from 4 to 5: `if (player.primaryLevel < 5)`
4. `src/objects/projectiles/laser/code/Laser.ts` — Add level 5 switch cases:
   - Bullet L5: same pattern as L4 (5-bullet fan at 0, +-8, +-16 degrees) but use `PLAYER_BULLET_L5_DAMAGE` and mark projectiles as "large" (e.g., via a flag or larger collision radius)
   - Laser L5: create snake with `SNAKE_L5_DAMAGE` and mark as "large"
5. `src/objects/projectiles/snake/code/Snake.ts` — Support L5 snake creation with higher damage

### Rendering
6. `src/renderer/drawing/drawProjectiles.ts` — Detect L5 projectiles and draw at 2x size:
   - Bullet L5: 8x12px body (vs 4x6), 4x8px core (vs 2x4)
   - Snake L5: 8x28px body (vs 8x14), trails proportionally longer
   - Could use increased `collisionRadius` or a flag on the projectile to identify L5
7. `src/renderer/HUD.ts` — Change power bar: `'\u2588'.repeat(level) + '\u2591'.repeat(5 - level)`

## Notes

- Bullet L5 damage: 25 * 1.25 = 31.25 → round to 31
- Snake L5 damage: 75 * 1.25 = 93.75 → round to 94
- The simplest way to mark L5 projectiles for rendering is to use a larger `collisionRadius` (e.g., `BULLET_COLLISION_RADIUS * 2` for L5 bullets) — this also gives gameplay benefit
- Alternatively, add an optional `level` field to `Projectile` interface
