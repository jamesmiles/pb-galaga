---
id: T-0016
title: "Implement Enemy Type C (fast fighter with bullets)"
type: task
status: review
priority: P1
owner: engineer
labels:
  - gameplay
  - enemy
depends_on: [T-0013, T-0014]
parallel_with: [T-0015]
parent_epic: E-0002
acceptance:
  - Enemy Type C class implemented in src/objects/enemies/enemyC/code/EnemyC.ts
  - Type C has 1 HP (one laser hit to destroy)
  - Type C has fireMode 'bullet' configured
  - Type C has distinct red/orange pixel art sprite
  - Type C awards 150 points on destruction
  - Type C works in existing formation system
  - GameScene renders Type C with correct sprite
  - Unit tests verify Type C properties
created_at: '2026-02-13'
updated_at: '2026-02-14'
---

## Context

Enemy Type C is a fast, fragile fighter that fires bullets. It has 1 HP like Type A but moves faster (1.5x speed when diving). It's a glass cannon — hard to hit but easy to destroy, creating a different threat dynamic from Types A and B.

**Data Model**: Enemy interface already supports `type: 'C'` and `fireMode: 'bullet'`.

## Plan

### Phase 1: Enemy Type C Class
1. Create `src/objects/enemies/enemyC/code/EnemyC.ts`:
   - Factory function `createEnemyC(id, position)` returning Enemy object
   - Type: 'C'
   - Health: 1
   - Fire mode: 'bullet'
   - Score value: 150 points
   - Collision radius: 12px (smaller than Type A's 14px — sleeker ship)
2. Add unit tests for creation and properties

### Phase 2: Sprite
1. Add Type C sprite to `src/renderer/SpriteManager.ts`:
   - Red/orange color scheme (aggressive, distinct from A and B)
   - Sleeker, more angular shape than Type A
   - 32x32 pixel canvas-drawn sprite
   - Register as 'enemy-c' texture

### Phase 3: Renderer Integration
1. Verify `src/renderer/scenes/GameScene.ts` sprite selection handles 'C' type:
   - 'C' → 'enemy-c' texture (should be handled by T-0015's type-based selection)
2. Test that Type C renders with correct sprite

### Phase 4: Tests
1. Type C creation with correct properties
2. Type C in mixed-type formations
3. Verify fireMode is 'bullet' (firing handled by T-0017)

## Files to Create
- `src/objects/enemies/enemyC/code/EnemyC.ts`

## Files to Modify
- `src/renderer/SpriteManager.ts`

## Notes

**Type C Characteristics**:
- Fragile: 1 HP (same as Type A)
- Fires bullets (handled by T-0017)
- Worth 150 points (between A's 100 and B's 200)
- Speed matters when diving (T-0021) — 1.5x normal dive speed
- Depends on T-0014 (Bullet Projectile) for its projectile type

**Enemy Type Comparison**:
| Property | Type A | Type B | Type C |
|----------|--------|--------|--------|
| HP | 1 | 2 | 1 |
| Fire Mode | none | laser | bullet |
| Score | 100 | 200 | 150 |
| Dive Speed | 1.0x | 0.7x | 1.5x |
| Radius | 14px | 16px | 12px |
