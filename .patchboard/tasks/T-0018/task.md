---
id: T-0018
title: Implement enemy projectile-player collision
type: task
status: done
priority: P1
owner: engineer
labels:
- gameplay
- collision
- combat
depends_on:
- T-0017
parallel_with: []
parent_epic: E-0002
acceptance:
- CollisionDetector extended for enemy-projectile vs player collision
- Enemy lasers and bullets damage the player on contact
- Player invulnerability frames prevent damage during invulnerability
- Enemy projectiles are deactivated on hit
- Player takes same damage/respawn sequence as player-enemy body collision
- Collision filtering prevents player's own projectiles from hitting player
- Unit tests verify enemy projectile collision, invulnerability, and filtering
created_at: '2026-02-13'
updated_at: '2026-02-14'
---

## Context

With enemies firing projectiles (T-0017), those projectiles need to damage the player on contact. This extends the existing CollisionDetector to handle enemy-owned projectile vs player collision, using the same damage/invulnerability/respawn pipeline already built for player-enemy body collision.

## Plan

### Phase 1: Extend CollisionDetector
1. Update `src/engine/CollisionDetector.ts`:
   - Add `detectEnemyProjectilePlayerCollisions(state: GameState)` function
   - For each active projectile where owner is not a player:
     a. Check circle-circle collision with each alive, non-invulnerable player
     b. On hit: call `damagePlayer()`, deactivate projectile
   - Call from main `detectCollisions()` function
2. Add unit tests

### Phase 2: Owner Filtering
1. Ensure projectile owner field is used correctly:
   - Player-owned projectiles (owner: 'player1', 'player2') should NOT hit the player
   - Enemy-owned projectiles (owner: enemy ID) should hit the player
   - Existing laser-enemy collision already filters by owner — mirror that logic
2. Add filtering tests

### Phase 3: Damage Pipeline
1. Verify enemy projectile damage uses same pipeline:
   - `damagePlayer()` sets `isAlive = false`, decrements lives
   - Invulnerability check (`isInvulnerable`) prevents damage
   - Respawn logic triggers after death (or death sequence in T-0020)
2. Add integration tests with full state

### Phase 4: Tests
1. Enemy bullet hits player → player damaged
2. Enemy laser hits player → player damaged
3. Player is invulnerable → no damage
4. Player's own laser doesn't hit player
5. Projectile deactivated after hitting player
6. Multiple projectiles, only hitting ones deactivate

## Files to Modify
- `src/engine/CollisionDetector.ts`

## Notes

- Reuses existing `damagePlayer()` from `PlayerShip.ts`
- Reuses existing circle-circle collision from `checkCollision()`
- The collision radius for bullets (3px) vs lasers (4px) creates slightly different dodge windows
- T-0020 (Player Death Sequence) will later modify what happens after `damagePlayer()` is called
