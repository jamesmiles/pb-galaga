---
id: T-0052
title: "Add types, constants, and state model extensions for Sprint 6"
type: task
status: todo
priority: P1
owner: null
labels: [sprint-6, foundation]
depends_on: []
parallel_with: []
parent_epic: E-0006
acceptance:
  - "WeaponPickup interface added to types.ts"
  - "Asteroid interface added to types.ts"
  - "GameState extended with weaponPickups and asteroids arrays"
  - "Projectile extended with optional acceleration, maxSpeed, turnRate, isHoming, homingDelay"
  - "'snake' added to Projectile.type union"
  - "Player.fireMode replaced with primaryWeapon, primaryLevel, secondaryWeapon, secondaryTimer, secondaryCooldown"
  - "All new constants added (player bullet, rocket, missile, snake, asteroid, weapon pickup)"
  - "BULLET_SPEED changed from 200 to 260"
  - "StateManager createPlayer() updated with weapon defaults"
  - "All existing tests pass with updated assertions"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Foundation task for Sprint 6. All other tasks depend on these type and constant definitions.

## Plan

1. Modify `src/types.ts`:
   - Add `WeaponPickup` and `Asteroid` interfaces
   - Add `weaponPickups: WeaponPickup[]` and `asteroids: Asteroid[]` to `GameState`
   - Add optional fields to `Projectile`: acceleration, maxSpeed, turnRate, isHoming, homingDelay
   - Add `'snake'` to `Projectile.type` union
   - Replace `Player.fireMode` with weapon state fields

2. Modify `src/engine/constants.ts`:
   - Add: PLAYER_BULLET_SPEED=550, PLAYER_BULLET_DAMAGE=25
   - Add: ROCKET_LAUNCH_SPEED=200, ROCKET_MAX_SPEED=420, ROCKET_ACCELERATION=400, ROCKET_DAMAGE=40, ROCKET_COLLISION_RADIUS=5, ROCKET_FIRE_COOLDOWN=500
   - Add: MISSILE_LAUNCH_SPEED=150, MISSILE_MAX_SPEED=350, MISSILE_ACCELERATION=350, MISSILE_DAMAGE=10, MISSILE_COLLISION_RADIUS=3, MISSILE_TURN_RATE=3.0, MISSILE_FIRE_COOLDOWN=800
   - Add: SNAKE_SPEED=400, SNAKE_DAMAGE=75, SNAKE_COLLISION_RADIUS=8, SNAKE_TURN_RATE=2.0
   - Add: ASTEROID_SMALL_HEALTH=100, ASTEROID_LARGE_HEALTH=300, ASTEROID_SMALL_RADIUS=12, ASTEROID_LARGE_RADIUS=24, ASTEROID_SMALL_SCORE=50, ASTEROID_LARGE_SCORE=150, ASTEROID_SPAWN_INTERVAL=3000, ASTEROID_SPEED_MIN=40, ASTEROID_SPEED_MAX=80, ASTEROID_DAMAGE=50
   - Add: WEAPON_PICKUP_DROP_CHANCE=0.15, WEAPON_PICKUP_CYCLE_INTERVAL=5000, WEAPON_PICKUP_SPEED=60, WEAPON_PICKUP_LIFETIME=10000, WEAPON_PICKUP_COLLISION_RADIUS=12, SECONDARY_WEAPON_DURATION=60000
   - Change: BULLET_SPEED 200→260

3. Modify `src/engine/StateManager.ts`:
   - Update createPlayer() defaults
   - Initialize new GameState arrays
