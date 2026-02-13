---
id: T-0015
title: "Implement Enemy Type B (slow fighter with laser)"
type: task
status: todo
priority: P1
owner: null
labels:
  - gameplay
  - enemy
depends_on: [E-0001]
parallel_with: [T-0013, T-0014]
parent_epic: E-0002
acceptance:
  - Enemy Type B class implemented
  - Type B has distinct properties (slower, more health)
  - Type B fires laser projectiles at player
  - Type B follows appropriate flight paths
  - Type B destruction sequence works
  - Type B awards appropriate score
  - EnemyHarness supports Type B testing
  - Unit tests verify Type B behavior
created_at: '2026-02-13'
updated_at: '2026-02-13'
---

## Context

Enemy Type B is a slow fighter that poses a greater threat than Type A by firing laser projectiles at the player.

**Data Model**: Enemy Schema with type: 'B'  
**Architecture**: Enemy Type B description (slow fighter with laser)

## Plan

### Phase 1: Enemy Type B Class
1. Create `src/objects/enemies/enemyB/code/EnemyB.ts`:
   - Type: 'B'
   - Health: Higher than Type A (3-4 hits)
   - Speed: Slower than Type A
   - Fire mode: 'laser'
   - Fire rate: Moderate (1 shot per 2-3 seconds)
   - Score value: 200 points
2. Add initialization logic

### Phase 2: Firing Logic
1. Implement laser firing for Type B:
   - Target player position
   - Aim laser at player
   - Fire rate management
   - Cooldown between shots
2. Integrate with ProjectileManager
3. Add unit tests

### Phase 3: Flight Paths
1. Design Type B specific paths:
   - Slower, more deliberate movement
   - Hovering patterns for firing
   - Different from Type A paths
2. Create path configurations
3. Test path following

### Phase 4: Enemy Manager Integration
1. Extend EnemyManager for Type B:
   - Spawn Type B enemies
   - Update Type B firing logic
   - Handle Type B destruction
2. Add Type B to enemy pool
3. Add integration tests

### Phase 5: Test Harness
1. Extend EnemyHarness for Type B:
   - Spawn Type B tests
   - Firing behavior tests
   - Path visualization
   - Compare Type A vs Type B
2. Test in both modes

## Notes

**Type B Characteristics**:
- Slower but tougher than Type A
- More methodical attack pattern
- Fires at player position
- Greater threat, higher reward

**Balancing**:
- Health: 3-4 laser hits to destroy
- Fire rate: Every 2-3 seconds
- Movement: 0.7x Type A speed
- Score: 2x Type A value

**AI Behavior**:
- Simple aim at player
- No prediction (keep simple)
- Fire when in range
- Continue on path while firing

**Future Enhancements**:
- Predictive aiming
- Formation firing patterns
- Shield mechanic
