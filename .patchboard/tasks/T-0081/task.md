---
id: T-0081
title: "Co-op respawn pickup system"
type: task
status: review
priority: P1
owner: engineer
labels: [co-op, pickup, gameplay]
depends_on: []
parent_epic: E-0008
acceptance:
  - "RespawnPickup type added to types.ts with targetPlayerId field"
  - "respawnPickups array added to GameState"
  - "LifePickupManager spawns one respawn pickup per level in co-op when a player has 0 lives"
  - "Pickup appears 8-15 seconds after dead player detected"
  - "Rendered as pulsing '1P' or '2P' icon depending on target"
  - "Collection by alive player revives dead player with 1 life"
  - "respawnPickup sound effect plays on collection"
  - "Cleared on level transitions"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

In co-op mode, when one player loses all lives they are permanently out unless they get a respawn opportunity. This pickup gives the surviving player a chance to revive their partner once per level.

## Changes

- `src/types.ts` — RespawnPickup interface, added to GameState
- `src/engine/LifePickupManager.ts` — Respawn pickup spawn logic
- `src/engine/CollisionDetector.ts` — Respawn pickup collision detection, revive logic
- `src/engine/StateManager.ts` — respawnPickups in initial state and copyStateInto
- `src/engine/GameManager.ts` — Collection sound, cleanup on level transitions
- `src/renderer/drawing/drawBoss.ts` — drawRespawnPickups function
- `src/renderer/Canvas2DRenderer.ts` — Wired respawn pickup drawing
- `src/audio/SoundManager.ts` — respawnPickup sound effect
