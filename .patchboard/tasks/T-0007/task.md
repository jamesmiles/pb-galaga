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
  - Type A enemies move in a classic block formation (left-to-right, step down, repeat)
  - Formation progressively advances toward the player
  - Formation stands off at one ship-height distance from player and continues moving left-to-right
  - Enemies within a formation NEVER overlap — each occupies a distinct grid position
  - Type A enemies do not fire projectiles
  - Enemy Type A uses a proper pixel art sprite (not geometric diamonds/shapes)
  - Enemies removed when health reaches 0
  - Enemy explodes when destroyed (explosion animation/effect)
  - Enemy state integrates with engine
  - Unit tests verify formation movement and boundary reversal
  - Unit tests verify grid spacing (no overlap)
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

### Phase 2: Formation System
1. Create `src/engine/FormationManager.ts`:
   - Defines a grid-based formation (rows × columns)
   - Each enemy has a grid slot (row, col) → screen position
   - Formation moves as a unit: left → right → step down → right → left → step down...
   - Formation speed increases as enemies are destroyed
   - Formation stops advancing when front row is one ship-height from player
   - Individual enemies may animate within their slot (small oscillation) but never leave slot bounds
2. Collision with screen boundaries triggers direction reversal + step down
3. Add unit tests for formation movement, boundary detection, and spacing

### Phase 3: Enemy Behavior
1. Implement basic enemy behavior:
   - Occupy assigned formation slot
   - Move with formation
   - No firing logic (Type A specific)
2. Add unit tests

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
- Speed: Moderate (formation speed increases as enemies are destroyed)
- Score: 100 points
- No projectiles
- Pixel art sprite committed to repo (e.g., `src/objects/enemies/enemyA/sprites/`)

**Formation Behavior**:
- Classic Space Invaders/Galaga-style block movement
- Formation grid ensures enemies never overlap: each slot has fixed spacing
- As enemies are destroyed, remaining enemies maintain their grid positions (gaps appear)
- Formation reverses direction when any enemy in the outermost column reaches screen edge
- Formation steps down one row-height on each direction reversal
- Formation stops descending when front row is one ship-height from the player

**Testing**:
- Test formation movement and direction reversal
- Test grid spacing invariant (no overlaps)
- Test stand-off distance from player
- Test speed increase as enemies are destroyed
- Test destruction sequence and score awarding
