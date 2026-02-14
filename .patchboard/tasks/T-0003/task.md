---
id: T-0003
title: "Implement player ship with movement and controls"
type: task
status: in_progress
priority: P0
owner: engineer
labels:
  - gameplay
  - player
depends_on: [T-0002]
parallel_with: []
parent_epic: E-0001
acceptance:
  - PlayerShip class implements player state and behavior
  - Red ship (player 1) responds to arrow key controls
  - Ship movement bounded within game area
  - Ship movement physics feels responsive
  - Player starts with 3 lives
  - Lives decrease on collision (implementation in T-0004)
  - Score tracking functional
  - Player state integrates with engine state management
  - Unit tests verify movement calculations
  - Unit tests verify boundary constraints
  - Player ship uses a proper pixel art sprite (not geometric triangles/shapes)
  - Pixel art sprite for player ship (red, ~32x32 or appropriate game scale)
created_at: '2026-02-13'
updated_at: '2026-02-13'
---

## Context

The player ship is the core gameplay element. It must have precise controls, feel responsive, and integrate cleanly with the game engine's state management.

**Data Model**: `.patchboard/docs/design-architecture/core/data-model.md` (Player Schema)  
**Architecture**: Sections on Player Ships

## Plan

### Phase 1: Player Data Structure
1. Create `src/objects/player/code/Player.ts`:
   - Implement Player interface from data model
   - Position, velocity, rotation
   - Lives (start with 3), score, health
   - Status flags (isAlive, isInvulnerable, isThrusting)
2. Create player initialization logic

### Phase 2: Movement Logic
1. Implement movement calculations:
   - Left/right movement (horizontal velocity)
   - Up/down movement (vertical velocity)
   - Movement acceleration/deceleration
   - Maximum velocity limits
2. Implement boundary checking:
   - Keep ship within game area
   - Handle edge cases gracefully
3. Add unit tests for movement

### Phase 3: Input Integration
1. Wire player controls to InputHandler:
   - Arrow keys for movement
   - Spacebar for firing (wired in T-0005)
2. Update player state based on input each frame
3. Add tests for input-to-movement translation

### Phase 4: Engine Integration
1. Integrate PlayerShip with StateManager
2. Add player to game state structure
3. Update player in game loop
4. Add integration tests

### Phase 5: Lives and Score System
1. Implement lives tracking (3 at start)
2. Implement score accumulation
3. Add death/respawn logic (basic)
4. Add tests for game state persistence

## Notes

**Movement Tuning**:
- Movement should feel responsive but not twitchy
- Acceleration/deceleration should be smooth
- Consider player inertia for arcade feel

**Collision** (deferred to T-0004):
- Collision detection logic separate
- This task only sets up collision state fields

**Testing Considerations**:
- Test movement in headless mode
- Verify boundary constraints thoroughly
- Test input response latency

**State Mutation Rule**:
- Player update functions receive and mutate only `currentState` (post-swap). Never read or write `previousState` during updates.
- Sprite asset must be committed to the repo (e.g., `src/objects/player/sprites/`)

**Future Enhancements** (out of scope):
- Thruster animations
- Power-up modes
- Different fire modes
