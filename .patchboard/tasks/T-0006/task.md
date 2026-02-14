---
id: T-0006
title: "Implement laser collision detection and test harness"
type: task
status: review
priority: P0
owner: engineer
labels:
  - gameplay
  - projectile
  - testing
depends_on: [T-0005, T-0007]
parallel_with: []
parent_epic: E-0001
acceptance:
  - Collision detection between laser and enemies works
  - Laser collision sequence implemented (damage enemy, remove laser)
  - ProjectileHarness allows isolated testing of laser
  - Harness runs in both rendered and headless modes
  - Harness test menu lets developer test all projectile behaviors
  - Harness can simulate collisions
  - Unit tests verify laser collision detection
  - Integration tests verify collision effects
  - ProjectileHarness has its own index.html (e.g., src/harness/projectile/index.html)
  - Harness opens via file:// and lets users fire projectiles, spawn targets, test collisions
  - Harness provides clickable options to cycle through projectile behaviors
created_at: '2026-02-13'
updated_at: '2026-02-13'
---

## Context

Laser collision detection is what makes shooting enemies satisfying. The test harness enables rapid iteration on projectile behavior and collision tuning.

**Architecture**: `.patchboard/docs/design-architecture/core/architecture.md` (Test Harness System)

## Plan

### Phase 1: Projectile Collision Detection
1. Extend CollisionDetector for projectile collisions:
   - Detect projectile-enemy collisions
   - Detect projectile-player collisions (for enemy projectiles)
   - Handle collision filtering (owner-based)
2. Add unit tests

### Phase 2: Laser Collision Sequence
1. Implement collision handling in ProjectileManager:
   - Apply damage to target on collision
   - Mark projectile as inactive
   - Remove projectile from state
   - Trigger effects (future: explosion, sound)
2. Add collision response logic
3. Add unit tests

### Phase 3: Projectile Harness
1. Create `src/harness/ProjectileHarness.ts`:
   - Extends HarnessBase
   - Spawns test projectiles
   - Spawns test targets (enemies)
   - Test menu with options:
     - Fire single laser
     - Fire laser burst
     - Spawn moving targets
     - Trigger collision
     - Test lifetime expiry
   - Visual collision feedback
2. Test in both rendered and headless modes

### Phase 4: Integration
1. Wire projectile collision into game loop
2. Test laser-enemy collision in harness
3. Verify collision removes laser
4. Verify enemy takes damage
5. Document harness usage

## Notes

**Collision Tuning**:
- Laser collision radius should be forgiving
- Make it feel good to hit enemies
- Consider slight magnetism if needed

**Performance**:
- Efficient collision checking (spatial partitioning if needed)
- Only check active projectiles
- Only check projectiles against valid targets

**Test Harness Features**:
- Visual grid for alignment testing
- Slow motion mode for precision testing
- Collision radius visualization
- Frame-by-frame stepping

**Future Enhancements** (out of scope):
- Piercing lasers
- Laser upgrades
- Laser charge shots
