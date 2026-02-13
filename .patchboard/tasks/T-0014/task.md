---
id: T-0014
title: "Implement bullet projectile system"
type: task
status: todo
priority: P1
owner: null
labels:
  - gameplay
  - projectile
depends_on: [E-0001]
parallel_with: [T-0013]
parent_epic: E-0002
acceptance:
  - Bullet projectile class implemented
  - Bullets differ from lasers (speed, damage, visual)
  - Bullet collision detection works
  - Enemy Type C can fire bullets
  - Bullet test harness functional
  - Unit tests verify bullet behavior
  - Integration tests verify bullet-player collision
created_at: '2026-02-13'
updated_at: '2026-02-13'
---

## Context

Bullets are a second projectile type used by Enemy Type C. They differ from lasers in speed and behavior, adding gameplay variety.

**Data Model**: Projectile Schema supports type: 'bullet'

## Plan

### Phase 1: Bullet Class
1. Create `src/objects/projectiles/bullet/code/Bullet.ts`:
   - Extends or implements Projectile interface
   - Type: 'bullet'
   - Different properties from laser:
     - Speed: Slower than laser
     - Damage: Lower than laser
     - Lifetime: Shorter
   - Visual style: Different from laser
2. Add bullet initialization logic

### Phase 2: Bullet Physics
1. Implement bullet movement:
   - Straight line movement
   - Constant velocity
   - Gravity effect (optional, for visual interest)
   - Boundary checking
2. Add lifetime management
3. Add unit tests

### Phase 3: Bullet Collision
1. Extend CollisionDetector for bullets:
   - Bullet-player collision
   - Same collision logic as lasers
   - Collision filtering by owner
2. Add collision response
3. Add unit tests

### Phase 4: Projectile Manager Integration
1. Extend ProjectileManager:
   - Support multiple projectile types
   - Type-specific update logic
   - Type-specific rendering hints
2. Add integration tests

### Phase 5: Test Harness
1. Extend ProjectileHarness for bullets:
   - Spawn bullet test
   - Bullet collision test
   - Compare bullet vs laser behavior
2. Test in both modes
3. Document differences

## Notes

**Bullet vs Laser**:
- Bullets: Slower, lower damage, visible projectile
- Lasers: Faster, higher damage, beam-like
- Visual distinction important

**Bullet Properties**:
- Speed: ~200 units/second (slower than laser)
- Damage: 0.5x laser damage
- Lifetime: ~2 seconds
- Visual: Small round projectile

**Design Considerations**:
- Bullets should be dodgeable
- Different threat profile than lasers
- Visual clarity crucial

**Future Enhancements**:
- Bullet spread patterns
- Bullet types (explosive, tracking)
- Player bullet power-ups
