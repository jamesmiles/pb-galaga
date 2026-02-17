---
id: T-0089
title: "Add PlayerStats interface and stat accumulation tracking"
type: task
status: todo
priority: P1
owner: null
labels: [engine, stats]
depends_on: []
parallel_with: [T-0090, T-0091, T-0097]
parent_epic: E-0009
acceptance:
  - "PlayerStats interface exported: { kills, deaths, powerupsCollected, respawns }"
  - "Player has stats (cumulative) and levelStats (per-level) fields, both default to zeros"
  - "kills increments when player projectile kills enemy"
  - "deaths increments when player health reaches 0"
  - "powerupsCollected increments on weapon or life pickup collection"
  - "respawns increments when player respawns"
  - "levelStats resets at start of each level"
  - "stats accumulates across entire game"
  - "Unit tests for all stat increment paths (~8-10 new tests)"
created_at: '2026-02-17'
updated_at: '2026-02-17'
---

## Context

The stats summary screen (T-0095) needs per-player kills, deaths, powerups collected, and respawn counts. Currently only score/lives/health are tracked. This task adds the data model and accumulation hooks.

## Plan

1. Add `PlayerStats` interface to `src/types.ts`: `{ kills, deaths, powerupsCollected, respawns }` all `number`
2. Add `stats: PlayerStats` and `levelStats: PlayerStats` to `Player` interface
3. Update `createPlayer()` in `src/engine/StateManager.ts` to initialize both stats objects to zeros
4. Increment `kills` in `src/engine/CollisionDetector.ts` — in projectile-enemy and player-enemy collision handlers when enemy dies
5. Increment `deaths` in `src/objects/player/code/PlayerShip.ts` — in the `health <= 0` death branch
6. Increment `powerupsCollected` in `src/engine/CollisionDetector.ts` — weapon pickup and life pickup collection
7. Increment `respawns` in `src/objects/player/code/PlayerShip.ts` — in `respawnPlayer()`
8. Add `resetLevelStats()` called at level start in `src/engine/GameManager.ts`

## Notes

- Both `stats` and `levelStats` use the same `PlayerStats` interface
- `levelStats` is captured into menu data before reset (used by T-0095)
- The `stats` field persists for the entire game session
