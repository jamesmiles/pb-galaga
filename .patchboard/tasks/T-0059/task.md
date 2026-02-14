---
id: T-0059
title: "Implement weapon pickup drop and collection system"
type: task
status: todo
priority: P1
owner: null
labels: [sprint-6, engine, powerup]
depends_on: [T-0058]
parallel_with: []
parent_epic: E-0006
acceptance:
  - "15% chance to drop weapon pickup on enemy kill"
  - "70/30 split between primary and secondary pickups"
  - "Primary pickups cycle laser(blue) ↔ bullet(red) every 5 seconds"
  - "Secondary pickups cycle rocket(purple) ↔ missile(green) every 5 seconds"
  - "Pickups drift downward at 60 px/s, despawn after 10s"
  - "Player collision with pickup triggers upgradeWeapon()"
  - "GameManager integrates pickup spawning and updating"
  - "~10 tests pass"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Weapon pickups are the mechanism for players to acquire and upgrade weapons. They drop from dead enemies with cycling visual indicators that show which weapon they'll give.

## Plan

1. Create `src/engine/WeaponPickupManager.ts`:
   - `maybeSpawnPickup(state, enemyPosition)` — 15% roll, 70/30 split
   - `updatePickups(state, dt)` — movement, cycle timer, despawn
   - Cycling: flip currentWeapon every 5s

2. Modify `src/engine/CollisionDetector.ts`:
   - Add `detectPlayerPickupCollisions()` — circle check, trigger upgrade
   - Add call in `detectCollisions()`

3. Modify `src/engine/GameManager.ts`:
   - Call updatePickups() in update loop
   - Call maybeSpawnPickup() when enemy killed

4. Create `src/engine/WeaponPickupManager.test.ts` — ~10 tests
