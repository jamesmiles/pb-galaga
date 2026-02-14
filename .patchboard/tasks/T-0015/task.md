---
id: T-0015
title: "Implement Enemy Type B (slow fighter with laser)"
type: task
status: review
priority: P1
owner: engineer
labels:
  - gameplay
  - enemy
depends_on: [T-0013]
parallel_with: [T-0014]
parent_epic: E-0002
acceptance:
  - Enemy Type B class implemented in src/objects/enemies/enemyB/code/EnemyB.ts
  - Type B has 2 HP (takes 2 laser hits to destroy)
  - Type B has fireMode 'laser' configured
  - Type B has distinct blue/green pixel art sprite
  - Type B awards 200 points on destruction
  - Type B works in existing formation system (type field selects behavior)
  - GameScene selects correct sprite based on enemy type
  - Unit tests verify Type B HP, score value, and properties
created_at: '2026-02-13'
updated_at: '2026-02-14'
---

## Context

Enemy Type B is a slow, tough fighter that fires lasers at the player. It has more health than Type A (2 HP vs 1 HP) and moves at 0.7x speed. It appears starting in Wave 2 and adds a more resilient threat to the formation.

**Data Model**: Enemy interface already has `type: 'A' | 'B' | 'C'` and `fireMode: 'none' | 'laser' | 'bullet'`.

## Plan

### Phase 1: Enemy Type B Class
1. Create `src/objects/enemies/enemyB/code/EnemyB.ts`:
   - Factory function `createEnemyB(id, position)` returning Enemy object
   - Type: 'B'
   - Health: 2
   - Fire mode: 'laser'
   - Score value: 200 points
   - Collision radius: 16px (slightly larger than Type A's 14px)
2. Add unit tests for creation and properties

### Phase 2: Sprite
1. Add Type B sprite to `src/renderer/SpriteManager.ts`:
   - Blue/green color scheme (distinct from Type A's green/yellow)
   - Slightly larger body than Type A
   - 32x32 pixel canvas-drawn sprite
   - Register as 'enemy-b' texture

### Phase 3: Renderer Integration
1. Update `src/renderer/scenes/GameScene.ts`:
   - In `renderEnemies()`, select sprite texture based on `enemy.type`
   - 'A' → 'enemy-a', 'B' → 'enemy-b', 'C' → 'enemy-c'
2. Test that Type B renders with correct sprite

### Phase 4: Formation Integration
1. Verify Type B works in existing FormationManager:
   - Formation grid placement works for mixed types
   - Movement speed is per-formation (not per-enemy), so Type B's slower nature is cosmetic in formation
   - Type B's speed matters when diving (T-0021)
2. Add tests for mixed-type formations

## Files to Create
- `src/objects/enemies/enemyB/code/EnemyB.ts`

## Files to Modify
- `src/renderer/SpriteManager.ts`
- `src/renderer/scenes/GameScene.ts`

## Notes

**Type B Characteristics**:
- Tougher than Type A (2 hits vs 1)
- Fires lasers (handled by T-0017 Enemy Firing System)
- Worth more points (200 vs 100)
- In formation, moves at formation speed
- When diving (T-0021), moves at 0.7x speed

The firing logic itself is NOT part of this task — that's T-0017 (Enemy Firing System). This task creates the enemy type and its properties. T-0017 reads `fireMode` to determine what to fire.
