---
id: T-0005
title: "Implement player laser projectile with firing"
type: task
status: todo
priority: P0
owner: null
labels:
  - gameplay
  - projectile
depends_on: [T-0003]
parallel_with: [T-0004]
parent_epic: E-0001
acceptance:
  - Projectile class implements laser projectile state and behavior
  - Player fires laser on spacebar press
  - Laser projectiles move upward at constant speed
  - Laser projectiles removed when exceeding screen bounds
  - Laser projectiles removed when exceeding lifetime
  - Fire rate limiting prevents spam (cooldown)
  - Projectile state integrates with engine
  - Unit tests verify projectile physics
  - Unit tests verify lifetime management
created_at: '2026-02-13'
updated_at: '2026-02-13'
---

## Context

Projectiles are essential for gameplay. The laser is the player's primary weapon and must feel responsive and reliable.

**Data Model**: `.patchboard/docs/design-architecture/core/data-model.md` (Projectile Schema)

## Plan

### Phase 1: Projectile Data Structure
1. Create `src/objects/projectiles/laser/code/Laser.ts`:
   - Implement Projectile interface from data model
   - Position, velocity, rotation
   - Owner tracking (player1 or enemy)
   - Damage, speed, lifetime
   - Collision radius
2. Create projectile initialization logic

### Phase 2: Projectile Physics
1. Implement projectile movement:
   - Constant velocity in fired direction
   - Rotation aligned with velocity
   - Boundary checking (remove when off-screen)
2. Implement lifetime tracking:
   - Decrement lifetime each frame
   - Remove when lifetime expires
3. Add unit tests

### Phase 3: Firing Logic
1. Extend Player class with firing:
   - Fire laser on spacebar input
   - Fire cooldown management
   - Spawn projectile at ship position
   - Set projectile owner and direction
2. Add fire rate limiting
3. Add unit tests

### Phase 4: Projectile Manager
1. Create `src/engine/ProjectileManager.ts`:
   - Manage active projectiles collection
   - Update all projectiles each frame
   - Remove inactive projectiles
   - Spawn new projectiles
2. Integrate with game loop
3. Add integration tests

### Phase 5: Engine Integration
1. Add projectiles to game state
2. Update projectiles in game loop
3. Wire player firing to projectile spawning
4. Test end-to-end firing

## Notes

**Laser Properties**:
- Speed: Fast (e.g., 500 units/second)
- Lifetime: ~3 seconds (enough to cross screen)
- Fire rate: ~5 shots/second (200ms cooldown)
- Damage: Medium

**Performance**:
- Projectiles should be lightweight
- Efficient removal of inactive projectiles
- Pool projectiles if performance issues arise

**Visual** (deferred to rendering task):
- Laser should be bright, visible
- Trail effect desirable

**Collision** (implemented in T-0006):
- Collision detection separate
- This task only sets up collision radius
