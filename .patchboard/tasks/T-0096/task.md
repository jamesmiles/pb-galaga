---
id: T-0096
title: "Auto-respawn dead co-op player on level complete"
type: task
status: todo
priority: P2
owner: null
labels: [engine, co-op]
depends_on: [T-0089]
parallel_with: [T-0092, T-0094, T-0095]
parent_epic: E-0009
acceptance:
  - "In co-op, dead player (0 lives, not alive) auto-respawns with 1 life on level complete"
  - "Respawned player has full health and invulnerability"
  - "Respawn sound (respawnPickup) plays on auto-respawn"
  - "Respawn stat incremented on the revived player"
  - "Single player mode unaffected"
  - "Player who was alive is unaffected"
  - "GameManager co-op test verifies auto-respawn on level complete"
created_at: '2026-02-17'
updated_at: '2026-02-17'
---

## Context

In co-op, if one player dies permanently (0 lives) but the other completes the level, the dead player should be auto-respawned with 1 life as a reward.

## Plan

1. In `src/engine/GameManager.ts` `updateLevelComplete()`, at the transition point (after 3s timer):
   - Check `state.gameMode === 'co-op'`
   - Find players with `!isAlive && lives <= 0 && !deathSequence?.active`
   - For each: set `lives = 1`, call `respawnPlayer(player)`, play `respawnPickup` sound
   - Increment `player.stats.respawns` and `player.levelStats.respawns`
2. This happens before the stats screen transition (T-0095) so the respawn is reflected in stats

## Notes

- The existing `respawnPlayer()` in PlayerShip.ts handles position, health, and invulnerability
- Auto-respawn is a silent reward — the stats screen will show it happened
- Only players with 0 lives AND not alive qualify (don't interfere with normal death sequences)
