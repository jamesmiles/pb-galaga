---
id: T-0061
title: "Implement asteroid system for Level 4"
type: task
status: review
priority: P1
owner: engineer
labels: [sprint-6, engine, asteroid]
depends_on: [T-0052]
parallel_with: [T-0058]
parent_epic: E-0006
acceptance:
  - "Asteroids spawn only during Level 4"
  - "Mixed sizes: ~60% small (HP 100, radius 12), ~40% large (HP 300, radius 24)"
  - "New asteroid every ~3 seconds (±1s jitter)"
  - "Asteroids drift downward at 40-80 px/s with slow rotation"
  - "Player ↔ asteroid collision: 50 damage to player, destroy asteroid"
  - "Player projectile ↔ asteroid: projectile damage applied, score on kill"
  - "Enemy projectiles pass through asteroids"
  - "Performance: 50 asteroids + 100 projectiles, 1000 ticks < 300ms"
  - "~16 tests pass (10 manager + 6 collision)"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Foreground asteroids add environmental hazards to Level 4 "Asteroid Belt". They continuously drift through the play area, can be destroyed for score, and damage the player on contact.

## Plan

1. Create `src/engine/AsteroidManager.ts`:
   - `update(state, dt)` — spawn timer, movement, rotation, remove off-screen
   - `spawnAsteroid(state)` — random X, size (60/40 split), drift down
   - Only active when currentLevel === 4
   - `reset()` — clear on level change

2. Modify `src/engine/CollisionDetector.ts`:
   - Add `detectPlayerAsteroidCollisions()` and `detectProjectileAsteroidCollisions()`
   - Add calls in `detectCollisions()`

3. Modify `src/engine/GameManager.ts`:
   - Instantiate AsteroidManager, call update/reset

4. Create `src/engine/AsteroidManager.test.ts` — ~10 tests
5. Add ~6 collision tests to `src/engine/CollisionDetector.test.ts`
