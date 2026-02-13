---
id: T-0007
title: "Implement Enemy Type A (non-firing transport)"
type: task
status: todo
priority: P0
owner: null
labels:
  - gameplay
  - enemy
depends_on: [T-0002]
parallel_with: [T-0003, T-0005]
parent_epic: E-0001
acceptance:
  - Enemy class implements Enemy Type A state and behavior
  - Type A enemies follow flight paths
  - Type A enemies do not fire projectiles
  - Enemies removed when health reaches 0
  - Enemy state integrates with engine
  - Unit tests verify enemy movement
  - Unit tests verify path following
  - Unit tests verify health/damage system
created_at: '2026-02-13'
updated_at: '2026-02-13'
---

## Context

Enemy Type A is the simplest enemy - a non-firing transport that follows predefined flight paths. It serves as the foundation for all enemy types.

**Data Model**: `.patchboard/docs/design-architecture/core/data-model.md` (Enemy Schema)  
**Architecture**: Enemy objects section

## Plan

### Phase 1: Enemy Data Structure
1. Create `src/objects/enemies/enemyA/code/EnemyA.ts`:
   - Implement Enemy interface from data model
   - Position, velocity, rotation
   - Health tracking
   - Type 'A' designation
   - Score value (e.g., 100 points)
   - Fire mode: 'none'
2. Create enemy initialization logic

### Phase 2: Flight Path System
1. Create `src/engine/FlightPath.ts`:
   - FlightPath interface (points, duration, loop)
   - Path interpolation logic
   - Path progress tracking
2. Implement path following in Enemy:
   - Update position based on path
   - Progress along path over time
   - Handle path completion
3. Add unit tests

### Phase 3: Enemy Behavior
1. Implement basic enemy behavior:
   - Move along assigned flight path
   - Rotate to face movement direction
   - No firing logic (Type A specific)
2. Add movement smoothing
3. Add unit tests

### Phase 4: Enemy Manager
1. Create `src/engine/EnemyManager.ts`:
   - Manage active enemies collection
   - Update all enemies each frame
   - Remove destroyed enemies
   - Spawn new enemies
   - Track wave completion
2. Integrate with game loop
3. Add integration tests

### Phase 5: Enemy Destruction
1. Implement destruction sequence:
   - Health reaches 0 → mark for removal
   - Award score to player
   - Trigger destruction effects (future: animation, sound)
   - Remove from state
2. Add unit tests

## Notes

**Type A Properties**:
- Health: Low (1-2 hits to destroy)
- Speed: Moderate
- Score: 100 points
- No projectiles
- Simple flight patterns

**Flight Paths**:
- Predefined paths for consistency
- Smooth curves using interpolation
- Various patterns (straight, arc, swoop)

**Performance**:
- Efficient enemy updates
- Spatial partitioning if many enemies

**Testing**:
- Test path following accuracy
- Test destruction sequence
- Test score awarding
