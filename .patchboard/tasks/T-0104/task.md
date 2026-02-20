---
id: T-0104
title: "Implement player tank mode movement"
type: task
status: done
priority: P1
owner: engineer
labels: [engine, player, movement]
depends_on: [T-0101]
parallel_with: [T-0103]
parent_epic: E-0010
acceptance:
  - "Player in tank mode moves horizontally only (up/down input ignored)"
  - "Player Y locked to TANK_GROUND_Y in tank mode"
  - "Respawn places player at TANK_GROUND_Y when in tank mode"
  - "Same weapons, firing, and powerup logic as ship mode"
created_at: '2026-02-20'
updated_at: '2026-02-20'
---

## Context

Level 6 changes the player from a spaceship to a ground tank. The tank moves only horizontally along a fixed Y position near the bottom of the screen. All weapons and firing logic remain unchanged.

## What was done

1. `src/objects/player/code/PlayerShip.ts` — In `updateMovement()`: when `movementMode === 'tank'`, only process left/right input, lock Y to `TANK_GROUND_Y`, early return. In `respawnPlayer()`: use `TANK_GROUND_Y` when tank mode.
