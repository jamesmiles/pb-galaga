---
id: T-0020
title: "Implement player death sequence"
type: task
status: review
priority: P1
owner: engineer
labels:
  - gameplay
  - animation
depends_on: [T-0018]
parallel_with: [T-0021]
parent_epic: E-0002
acceptance:
  - Player death triggers a 2-second explosion sequence before respawn or gameover
  - During death sequence player ship is invisible and no input is processed
  - Multi-frame explosion animation plays at death position
  - After sequence with lives remaining, player respawns with invulnerability
  - After sequence with 0 lives, game transitions to gameover
  - Death sequence state tracked in Player type (deathSequence field)
  - GameScene renders the extended death explosion animation
  - Unit tests verify death timing, state transitions, and respawn delay
created_at: '2026-02-14'
updated_at: '2026-02-14'
---

## Context

Currently when the player dies, respawn is nearly instant — just invulnerability frames. A 2-second explosion sequence adds dramatic weight to death, gives the player a moment to process what happened, and creates tension before the respawn or gameover screen.

## Plan

### Phase 1: Death Sequence State
1. Add to Player type in `src/types.ts`:
   ```typescript
   deathSequence?: {
     active: boolean;
     startTime: number;  // game currentTime when death occurred
     duration: number;    // 2000ms
     position: Position;  // where the explosion plays
   }
   ```
2. Update `damagePlayer()` in `src/objects/player/code/PlayerShip.ts`:
   - When player dies (isAlive → false), set `deathSequence.active = true`
   - Record startTime and death position
   - Do NOT immediately respawn

### Phase 2: Engine Logic
1. Update `src/engine/GameManager.ts` `updatePlaying()`:
   - Check for players in active death sequence
   - Skip input processing for players in death sequence
   - When `currentTime - deathSequence.startTime >= duration`:
     a. Set `deathSequence.active = false`
     b. If lives > 0: call `respawnPlayer()`
     c. If lives === 0: trigger gameover (but wait for all players' sequences to finish in co-op)
2. Remove immediate respawn logic for dead players

### Phase 3: Rendering
1. Update `src/renderer/scenes/GameScene.ts`:
   - When player has `deathSequence.active`:
     a. Hide player sprite
     b. Play extended explosion at `deathSequence.position`
     c. Use more frames / larger explosion than enemy death
   - Explosion animation: 8 frames over 2 seconds (250ms per frame)
   - Could scale up existing explosion sprite or create new death explosion
2. Add death explosion sprite frames to SpriteManager if needed

### Phase 4: Tests
1. Death sets deathSequence.active = true
2. No input processed during death sequence
3. Respawn triggers after 2 seconds with lives > 0
4. Gameover triggers after 2 seconds with 0 lives
5. Death sequence position matches death position
6. Multiple deaths in sequence work correctly

## Files to Modify
- `src/types.ts` (add deathSequence to Player)
- `src/objects/player/code/PlayerShip.ts` (trigger death sequence)
- `src/engine/GameManager.ts` (death sequence timing, delayed respawn)
- `src/renderer/scenes/GameScene.ts` (death explosion rendering)
- `src/renderer/SpriteManager.ts` (death explosion sprites if needed)

## Notes

- The 2-second duration is a design choice — can be tuned based on feel
- In co-op mode, gameover should wait for ALL players' death sequences to finish
- The explosion should feel more dramatic than an enemy explosion (larger, more frames, shake effect optional)
- This modifies the respawn flow established in Sprint 1 — existing respawn tests will need updating
