---
id: T-0017
title: "Implement enemy firing system"
type: task
status: todo
priority: P1
owner: null
labels:
  - gameplay
  - enemy
  - combat
depends_on: [T-0014, T-0015, T-0016]
parallel_with: []
parent_epic: E-0002
acceptance:
  - EnemyFiringManager created in src/engine/EnemyFiringManager.ts
  - Type B enemies fire lasers downward at configurable intervals (~3s)
  - Type C enemies fire bullets downward at configurable intervals (~2s)
  - Type A enemies do not fire (fireMode 'none')
  - Only front-row enemies fire (no friendly fire through formation)
  - Fire intervals have random jitter to avoid synchronized volleys
  - Enemy projectiles are spawned via ProjectileManager with owner 'enemy'
  - Wired into GameManager.updatePlaying()
  - Unit tests verify fire rates, cooldowns, and front-row targeting
created_at: '2026-02-13'
updated_at: '2026-02-14'
---

## Context

Enemies need to shoot back at the player. This system reads each enemy's `fireMode` property and spawns projectiles at configurable intervals. Only front-row enemies (no ally blocking their line of fire) should fire, preventing projectiles from hitting friendly ships.

## Plan

### Phase 1: EnemyFiringManager
1. Create `src/engine/EnemyFiringManager.ts`:
   - `EnemyFiringManager` class with `update(state: GameState, dtSeconds: number)` method
   - Maintains per-enemy cooldown timers (Map<string, number>)
   - On each update:
     a. For each alive enemy with `fireMode !== 'none'`
     b. Check if enemy is in front row (no alive enemy directly below in formation)
     c. Decrement cooldown timer
     d. If cooldown <= 0, spawn projectile and reset cooldown with jitter
   - Cooldown config per fire mode:
     - 'laser': base 3.0s, jitter +/- 0.5s
     - 'bullet': base 2.0s, jitter +/- 0.5s

### Phase 2: Front-Row Detection
1. Implement front-row check:
   - An enemy is "front-row" if no alive enemy in the same column has a higher Y position
   - Use formation grid column info or compare positions
   - Enemies not in formation (diving) can always fire
2. Add unit tests for front-row logic

### Phase 3: Projectile Spawning
1. When an enemy fires:
   - Call ProjectileManager to spawn a projectile at enemy's position
   - Set projectile owner to the enemy's ID (or 'enemy' generic)
   - Set projectile direction to downward (+Y velocity)
   - Laser projectile for fireMode 'laser', bullet for 'bullet'
2. Add spawning tests

### Phase 4: GameManager Integration
1. Wire `EnemyFiringManager.update()` into `GameManager.updatePlaying()`:
   - Call after enemy position updates, before collision detection
   - Initialize in GameManager constructor
2. Add integration tests

### Phase 5: Tests
1. Type B fires lasers at correct rate
2. Type C fires bullets at correct rate
3. Type A never fires
4. Only front-row enemies fire
5. Cooldown reset with jitter
6. Firing stops when enemy dies
7. Multiple enemies fire independently

## Files to Create
- `src/engine/EnemyFiringManager.ts`

## Files to Modify
- `src/engine/GameManager.ts` (wire in EnemyFiringManager)

## Notes

- This task handles the firing logic only — collision of enemy projectiles with the player is T-0018
- Enemy projectiles move downward (positive Y), player lasers move upward (negative Y)
- The owner field on projectiles is critical for collision filtering
- Jitter prevents all enemies from firing in sync, which would be unfair
