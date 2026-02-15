---
id: T-0079
title: "Life drop pickup with heart icon"
type: task
status: review
priority: P1
owner: engineer
labels: [level-5, pickup, gameplay]
depends_on: []
parallel_with: [T-0065, T-0066, T-0067, T-0073]
parent_epic: E-0007
acceptance:
  - "50% chance of one life drop spawning per level"
  - "Spawns at random time during the level"
  - "Rendered as a heart icon pickup"
  - "Collected on player collision, awards +1 life"
  - "LifePickup type in types.ts or reuses existing pickup system"
  - "~6 new tests"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Players lose lives but have no way to earn them back. A rare life drop (50% chance per level, once per level) gives players a recovery mechanic while keeping it scarce.

## Plan

1. `src/types.ts` — LifePickup interface (or extend WeaponPickup with 'life' category)
2. `src/engine/constants.ts` — LIFE_DROP_CHANCE, LIFE_PICKUP_SPEED, LIFE_PICKUP_COLLISION_RADIUS
3. `src/engine/GameManager.ts` or new LifePickupManager — spawn logic (random time, 50% chance, once per level)
4. `src/engine/CollisionDetector.ts` — player-life pickup collision, +1 life
5. `src/renderer/Canvas2DRenderer.ts` or HUD — heart icon drawing
6. Tests for spawn chance, collection, life increment
