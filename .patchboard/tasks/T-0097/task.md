---
id: T-0097
title: "Return player ships to starting position on level complete"
type: task
status: todo
priority: P2
owner: null
labels: [engine, gameplay]
depends_on: []
parallel_with: [T-0089, T-0090, T-0091]
parent_epic: E-0009
acceptance:
  - "On level complete transition, all alive players move to starting positions"
  - "Single player: center (GAME_WIDTH/2, GAME_HEIGHT - 60)"
  - "Co-op P1: (GAME_WIDTH * 0.33, GAME_HEIGHT - 60)"
  - "Co-op P2: (GAME_WIDTH * 0.66, GAME_HEIGHT - 60)"
  - "Player velocity zeroed"
  - "Players receive invulnerability for new level"
  - "GameManager test verifies positions after level complete"
created_at: '2026-02-17'
updated_at: '2026-02-17'
---

## Context

When a level ends, players may be anywhere on screen. Moving them back to starting positions ensures they're not exposed when the next level spawns enemies.

## Plan

1. In `src/engine/GameManager.ts` `updateLevelComplete()`, at the transition point (after 3s timer):
   - For each alive player, reset position based on game mode:
     - Single: `{ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 60 }`
     - Co-op P1: `{ x: GAME_WIDTH * 0.33, y: GAME_HEIGHT - 60 }`
     - Co-op P2: `{ x: GAME_WIDTH * 0.66, y: GAME_HEIGHT - 60 }`
   - Zero velocity: `{ x: 0, y: 0 }`
   - Grant invulnerability: `isInvulnerable = true`, `invulnerabilityTimer = PLAYER_INVULNERABILITY_DURATION`
2. This runs in the same transition block as T-0096 (auto-respawn), applying to both surviving and newly respawned players

## Notes

- Uses the same starting positions as `startGame()` in StateManager
- The invulnerability ensures players aren't immediately hit at level start
