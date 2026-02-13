---
id: T-0004
title: "Implement player collision detection and test harness"
type: task
status: todo
priority: P0
owner: null
labels:
  - gameplay
  - player
  - testing
depends_on: [T-0003]
parallel_with: []
parent_epic: E-0001
acceptance:
  - Collision detection system detects player-enemy collisions
  - Player collision sequence implemented (damage, invulnerability, death)
  - PlayerHarness allows isolated testing of player ship
  - Harness runs in both rendered and headless modes
  - Harness test menu lets developer trigger all player states
  - Harness can simulate collisions for testing
  - Unit tests verify collision detection accuracy
  - Integration tests verify collision sequence
created_at: '2026-02-13'
updated_at: '2026-02-13'
---

## Context

Collision detection is critical for gameplay. The test harness provides an isolated environment to validate player behavior without requiring a full game setup.

**Architecture**: `.patchboard/docs/design-architecture/core/architecture.md` (Test Harness System section)  
**ADR-004**: Test Harness for Each Object Type

## Plan

### Phase 1: Collision Detection
1. Create `src/engine/CollisionDetector.ts`:
   - Circle-circle collision detection
   - Collision radius configuration
   - Collision checking between player and enemies
   - Collision checking between player and projectiles
2. Add unit tests for collision math

### Phase 2: Player Collision Sequence
1. Extend Player class with collision handling:
   - Take damage on collision
   - Trigger invulnerability period
   - Handle death when health reaches 0
   - Decrement lives on death
   - Respawn logic
2. Add collision state transitions
3. Add unit tests

### Phase 3: Test Harness Base
1. Create `src/harness/HarnessBase.ts`:
   - Base class for all harnesses
   - Isolated game engine instance
   - Isolated state manager
   - Optional renderer attachment
   - Headless mode support
2. Create test menu system for harnesses

### Phase 4: Player Harness
1. Create `src/harness/PlayerHarness.ts`:
   - Extends HarnessBase
   - Spawns player ship
   - Test menu with options:
     - Movement tests
     - Collision simulation
     - Death/respawn tests
     - Invulnerability tests
   - Visual indicators for state changes
2. Test harness in both modes

### Phase 5: Integration
1. Wire collision detection into game loop
2. Test player collision in harness
3. Document harness usage

## Notes

**Collision Detection**:
- Use simple circle collision for performance
- Collision radius should be slightly smaller than sprite for better feel
- Consider collision layers (player vs enemy, player vs enemy projectiles)

**Invulnerability**:
- Default: 2 seconds after respawn or collision
- Visual indicator needed (flashing sprite in rendering)

**Test Harness**:
- Must work without full game setup
- Should be launchable from dev menu
- Essential for rapid iteration

**Future Enhancements** (out of scope):
- Pixel-perfect collision detection
- Collision effects (screen shake, particles)
