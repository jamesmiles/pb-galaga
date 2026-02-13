---
id: T-0016
title: "Implement Enemy Type C (mobile fighter with bullets)"
type: task
status: todo
priority: P1
owner: null
labels:
  - gameplay
  - enemy
depends_on: [E-0001, T-0014]
parallel_with: [T-0013, T-0015]
parent_epic: E-0002
acceptance:
  - Enemy Type C class implemented
  - Type C has distinct properties (faster, less health)
  - Type C fires bullet projectiles
  - Type C follows aggressive flight paths
  - Type C destruction sequence works
  - Type C awards appropriate score
  - EnemyHarness supports Type C testing
  - Unit tests verify Type C behavior
created_at: '2026-02-13'
updated_at: '2026-02-13'
---

## Context

Enemy Type C is a fast, mobile fighter that uses bullet projectiles. It's more aggressive but fragile, creating a different threat dynamic.

**Data Model**: Enemy Schema with type: 'C'  
**Architecture**: Enemy Type C description (mobile fighter with bullets)

## Plan

### Phase 1: Enemy Type C Class
1. Create `src/objects/enemies/enemyC/code/EnemyC.ts`:
   - Type: 'C'
   - Health: Lower than Type A (1 hit)
   - Speed: Faster than Type A and B
   - Fire mode: 'bullet'
   - Fire rate: Fast (burst fire)
   - Score value: 150 points
2. Add initialization logic

### Phase 2: Bullet Firing
1. Implement bullet firing for Type C:
   - Fire bullets at player
   - Burst fire pattern (2-3 bullets)
   - Faster fire rate than Type B
   - Bullet spread for difficulty
2. Integrate with ProjectileManager
3. Add unit tests

### Phase 3: Flight Paths
1. Design Type C specific paths:
   - Fast, aggressive movement
   - Swooping attack patterns
   - Quick exits after firing
   - Erratic movement
2. Create path configurations
3. Test path following

### Phase 4: Enemy Manager Integration
1. Extend EnemyManager for Type C:
   - Spawn Type C enemies
   - Update Type C firing logic
   - Handle Type C destruction
2. Add Type C to enemy pool
3. Add integration tests

### Phase 5: Test Harness
1. Extend EnemyHarness for Type C:
   - Spawn Type C tests
   - Burst fire tests
   - Fast path visualization
   - Compare all three types
2. Test in both modes

## Notes

**Type C Characteristics**:
- Fast and fragile (glass cannon)
- Aggressive attack patterns
- Burst fire bullets
- High mobility

**Balancing**:
- Health: 1 laser hit to destroy
- Fire rate: Burst of 2-3 bullets every 3 seconds
- Movement: 1.5x Type A speed
- Score: 150 points (mid-value)

**AI Behavior**:
- Fast swooping attacks
- Fire burst during approach
- Quick retreat after firing
- Harder to hit due to speed

**Design Considerations**:
- Speed makes them challenging targets
- Fragility balances their aggression
- Bullet spray adds unpredictability
- Should feel distinct from Types A and B

**Future Enhancements**:
- Kamikaze attacks
- Dodge player shots
- Formation attacks
