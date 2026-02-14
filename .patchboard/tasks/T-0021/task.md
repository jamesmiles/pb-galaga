---
id: T-0021
title: Implement dive attack behavior
type: task
status: done
priority: P1
owner: engineer
labels:
- gameplay
- enemy
- ai
depends_on:
- T-0017
parallel_with:
- T-0020
parent_epic: E-0002
acceptance:
- DiveManager created in src/engine/DiveManager.ts
- Front-line enemies randomly break formation and dive toward player
- Dive path curves toward player X position then sweeps downward
- Enemies that exit the bottom respawn at their formation position
- Maximum 2 simultaneous divers
- Minimum 3-second cooldown between new dives
- Diving enemies can still fire (if they have fireMode)
- 'Dive speed varies by enemy type (A: 1.0x, B: 0.7x, C: 1.5x)'
- Wired into GameManager.updatePlaying()
- Unit tests verify dive selection, path calculation, and re-entry
created_at: '2026-02-14'
updated_at: '2026-02-14'
---

## Context

In classic Galaga, enemies periodically break from formation and dive toward the player. This adds excitement and unpredictability. Dive attacks make the player watch the entire screen, not just the bottom.

## Plan

### Phase 1: DiveManager
1. Create `src/engine/DiveManager.ts`:
   - `DiveManager` class with `update(state: GameState, dtSeconds: number)` method
   - Configuration:
     - `maxDivers`: 2 (maximum simultaneous diving enemies)
     - `diveCooldown`: 3.0s (minimum time between new dive initiations)
     - `diveSpeedMultiplier`: per enemy type (A: 1.0, B: 0.7, C: 1.5)
     - `baseSpeed`: 300 units/sec
   - Tracks which enemies are currently diving (Set<string>)
   - Cooldown timer for next dive initiation

### Phase 2: Dive Selection
1. Select dive candidates:
   - Must be alive and in formation (not already diving)
   - Prefer front-row enemies (more dramatic, already have clear path)
   - Random selection from candidates
   - Only initiate if `currentDivers < maxDivers` and cooldown expired
2. Add unit tests for selection logic

### Phase 3: Dive Path
1. Implement dive path calculation:
   - **Phase A — Break**: Enemy leaves formation position, curves toward player's current X
   - **Phase B — Approach**: Accelerate downward, slight tracking of player X
   - **Phase C — Sweep**: Continue past player, exit bottom of screen
   - Path is calculated as a series of waypoints or parametric curve
   - Enemy position updated each frame along the path
2. Add enemy state for dive tracking:
   - `diveState?: { phase: 'break' | 'approach' | 'sweep', progress: number, targetX: number }`
   - Store on the Enemy object or in DiveManager's internal map
3. Add path calculation tests

### Phase 4: Re-entry
1. When enemy exits bottom of screen (Y > GAME_HEIGHT + margin):
   - Reset enemy position to formation slot (above screen)
   - Clear dive state
   - Enemy rejoins formation movement
   - Remove from active divers set
2. Add re-entry tests

### Phase 5: GameManager Integration
1. Wire `DiveManager.update()` into `GameManager.updatePlaying()`:
   - Call after formation update, before collision detection
   - Diving enemies skip formation position updates
   - Diving enemies still participate in collision detection
2. Update FormationManager to skip position updates for diving enemies
3. Add integration tests

## Files to Create
- `src/engine/DiveManager.ts`

## Files to Modify
- `src/engine/GameManager.ts` (wire in DiveManager)
- `src/engine/FormationManager.ts` (skip diving enemies in position updates)
- `src/types.ts` (add diveState to Enemy if needed)

## Notes

- Dive path doesn't need to be pixel-perfect — a simple curve or bezier is fine
- Diving enemies should still be collidable (player can shoot them during dive)
- Diving enemies with fireMode can fire during the dive (handled by EnemyFiringManager)
- In co-op, diving enemies could target the nearest player
- The dive should feel threatening but dodgeable
- Classic Galaga had 1-3 enemies diving at once — 2 is a good starting point
