---
id: T-0014
title: "Implement bullet projectile type"
type: task
status: review
priority: P1
owner: engineer
labels:
  - gameplay
  - projectile
depends_on: [T-0013]
parallel_with: [T-0015]
parent_epic: E-0002
acceptance:
  - Bullet projectile class implemented in src/objects/projectiles/bullet/code/Bullet.ts
  - Bullets differ from lasers (slower speed, lower damage, smaller visual)
  - ProjectileManager handles both laser and bullet types
  - Bullet sprite added to SpriteManager (small yellow/orange circle)
  - Bullet rendered correctly in GameScene
  - Unit tests verify bullet movement, lifetime, and damage values
  - Bullet collision detection works (reuses existing collision system)
created_at: '2026-02-13'
updated_at: '2026-02-14'
---

## Context

Bullets are a second projectile type used by Enemy Type C. They differ from lasers in speed, damage, and visual appearance, adding gameplay variety. Players need to dodge two distinct threat types.

**Data Model**: Projectile interface already supports `projectileType` field.

## Plan

### Phase 1: Bullet Class
1. Create `src/objects/projectiles/bullet/code/Bullet.ts`:
   - Implements Projectile interface with `projectileType: 'bullet'`
   - Speed: ~200 units/sec (laser is ~600)
   - Damage: 1 (same as laser for simplicity)
   - Collision radius: 3px (smaller than laser's 4px)
   - Lifetime: 3 seconds
   - Direction: downward (enemy-fired) — positive Y velocity
2. Create `createBullet()` factory function
3. Add unit tests for bullet creation and properties

### Phase 2: ProjectileManager Integration
1. Extend `src/engine/ProjectileManager.ts`:
   - `updateAllProjectiles()` already handles generic Projectile — verify it works for bullets
   - Add `spawnEnemyBullet(enemyId, position)` function
   - Bullets move downward (toward player), lasers move upward
2. Add integration tests

### Phase 3: Rendering
1. Add bullet sprite to `src/renderer/SpriteManager.ts`:
   - Small filled circle, yellow/orange color
   - 6x6 pixel canvas-drawn sprite
2. Extend `src/renderer/scenes/GameScene.ts`:
   - Select sprite based on `projectileType` field
   - Bullet uses 'bullet' texture, laser uses 'laser' texture

### Phase 4: Tests
1. Bullet movement (downward direction)
2. Bullet lifetime expiry
3. Bullet collision radius
4. Mixed projectile updates (lasers + bullets in same state)

## Files to Create
- `src/objects/projectiles/bullet/code/Bullet.ts`

## Files to Modify
- `src/engine/ProjectileManager.ts`
- `src/renderer/SpriteManager.ts`
- `src/renderer/scenes/GameScene.ts`
- `src/types.ts` (if projectileType not already defined)

## Notes

**Bullet vs Laser**:
| Property | Laser | Bullet |
|----------|-------|--------|
| Speed | ~600 u/s | ~200 u/s |
| Direction | Up (player) | Down (enemy) |
| Damage | 1 | 1 |
| Radius | 4px | 3px |
| Visual | Tall rectangle | Small circle |
| Lifetime | 2s | 3s |

- Bullets should be clearly visible and dodgeable
- Owner field distinguishes player vs enemy projectiles
