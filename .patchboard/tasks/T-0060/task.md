---
id: T-0060
title: "Integrate player weapon firing for all weapon types and levels"
type: task
status: review
priority: P1
owner: engineer
labels: [sprint-6, engine, weapon, firing]
depends_on: [T-0054, T-0055, T-0056, T-0058]
parallel_with: []
parent_epic: E-0006
acceptance:
  - "spawnPlayerLasers renamed to spawnPlayerProjectiles"
  - "Laser L1-L4: single → double → triple → snake"
  - "Bullet L1-L4: single → double → spread(3) → mega spread(5)"
  - "Secondary rocket fires 2 per volley (left + right sides)"
  - "Secondary missile fires 3 per volley (-15/0/+15 degree fan)"
  - "Secondary respects its own cooldown (rocket 500ms, missile 800ms)"
  - "Secondary timer counted down in update loop"
  - "createPlayerBullet added to Bullet.ts (fires upward)"
  - "~12 tests pass"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

This is the main firing integration task. It modifies spawnPlayerLasers to handle all weapon types and upgrade levels, spawning the correct projectiles based on the player's current weapon state.

## Plan

1. Modify `src/objects/projectiles/bullet/code/Bullet.ts`:
   - Add `createPlayerBullet(position, owner)` — fires UPWARD at PLAYER_BULLET_SPEED

2. Modify `src/objects/projectiles/laser/code/Laser.ts`:
   - Rename `spawnPlayerLasers` → `spawnPlayerProjectiles`
   - Based on player.primaryWeapon and primaryLevel, spawn appropriate projectiles
   - If secondaryWeapon active and secondaryCooldown <= 0, spawn secondary too

3. Modify `src/engine/GameManager.ts`:
   - Update import and call to renamed function
   - Call WeaponManager.updateSecondaryTimer() in update loop

4. Create `src/objects/projectiles/PlayerFiring.test.ts` — ~12 tests
