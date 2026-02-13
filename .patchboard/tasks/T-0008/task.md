---
id: T-0008
title: "Implement Enemy Type A destruction sequence and test harness"
type: task
status: todo
priority: P0
owner: null
labels:
  - gameplay
  - enemy
  - testing
depends_on: [T-0007]
parallel_with: []
parent_epic: E-0001
acceptance:
  - Enemy destruction sequence triggers properly on death
  - Score properly awarded to player on enemy destruction
  - Destroyed enemies removed from game state
  - EnemyHarness allows isolated testing of Enemy Type A
  - Harness runs in both rendered and headless modes
  - Harness test menu lets developer test all enemy behaviors
  - Harness can simulate destruction scenarios
  - Unit tests verify destruction logic
  - Integration tests verify score awarding
created_at: '2026-02-13'
updated_at: '2026-02-13'
---

## Context

The enemy destruction sequence provides player feedback and scoring. The test harness enables rapid iteration on enemy behavior and path design.

**Architecture**: `.patchboard/docs/design-architecture/core/architecture.md` (Test Harness System)

## Plan

### Phase 1: Complete Destruction Sequence
1. Enhance enemy destruction in EnemyManager:
   - Trigger destruction state when health = 0
   - Award points to attacking player
   - Play destruction effect (future: animation, sound)
   - Remove from active enemies
   - Update wave completion status
2. Add destruction state management
3. Add unit tests

### Phase 2: Score Integration
1. Link enemy destruction to player scoring:
   - Identify which player dealt killing blow
   - Award enemy scoreValue to player
   - Update player score in state
   - Handle multi-player scenarios (Sprint 2)
2. Add score tracking tests

### Phase 3: Enemy Harness
1. Create `src/harness/EnemyHarness.ts`:
   - Extends HarnessBase
   - Spawns test enemies (Type A)
   - Spawns test player/projectiles
   - Test menu with options:
     - Spawn single enemy
     - Spawn enemy formation
     - Test various flight paths
     - Simulate damage/destruction
     - Test score awarding
     - Visualize flight paths
   - Visual indicators for enemy state
2. Test in both rendered and headless modes

### Phase 4: Flight Path Testing
1. Add path visualization to harness
2. Add path editing/testing tools
3. Validate path smoothness
4. Test edge cases (path completion, looping)

### Phase 5: Integration
1. Wire destruction into game loop
2. Test full enemy lifecycle in harness
3. Verify destruction-to-scoring pipeline
4. Document harness usage

## Notes

**Destruction Effects** (future enhancement):
- Explosion animation
- Particle effects
- Sound effects
- Screen shake for larger enemies

**Score Tracking**:
- Ensure score attribution is correct
- Handle simultaneous kills
- Consider combo bonuses (future)

**Test Harness Features**:
- Path preview/playback
- Frame-by-frame enemy behavior
- Health bar visualization
- Collision radius visualization
- Grid overlay for positioning

**Future Enemy Types**:
- This harness will be extended for Types B & C
- Design for reusability
