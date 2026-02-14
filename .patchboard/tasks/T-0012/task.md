---
id: T-0012
title: "Implement Phaser renderer with interpolation"
type: task
status: review
priority: P0
owner: engineer
labels:
  - rendering
  - infrastructure
depends_on: [T-0002, T-0003, T-0005, T-0007, T-0009, T-0011]
parallel_with: []
parent_epic: E-0001
acceptance:
  - PhaserRenderer integrates with Phaser framework
  - Renderer interpolates between previous and current state
  - All game objects render correctly (player, enemies, projectiles, background)
  - Menu screens render properly
  - Renderer is "dumb" - only visualizes state
  - Renderer can be disabled for headless mode
  - Visual feedback for collisions and state changes
  - Smooth 60 FPS rendering achieved
  - Test harnesses integrate with renderer
  - Phaser's built-in game loop is disabled — rendering driven entirely by GameLoop's render callback
  - Phaser arcade physics is NOT enabled in config
  - Renderer is wired into GameManager via a typed GameRenderer interface (not monkey-patched via any casts)
  - Entity lookups use Map<id, entity> for O(1) previous-state matching (not Array.find)
  - Visual timing effects use state.currentTime, never Date.now()
  - Engine tick rate and render FPS counters displayed in top-left corner
  - Pixel art sprites loaded for player ship and Enemy Type A (not geometric primitives)
  - Explosion animations render for ship/enemy destruction
  - Pre-render static elements (star backgrounds) to texture — don't redraw every frame
created_at: '2026-02-13'
updated_at: '2026-02-13'
---

## Context

The Phaser renderer is the visual layer that brings the game to life. It must be completely decoupled from game logic and interpolate state for smooth animation.

**Architecture**: `.patchboard/docs/design-architecture/core/architecture.md` (Renderer Module, Data Flow)  
**ADR-002**: Double Buffered State  
**ADR-005**: Phaser for Rendering Only

## Plan

### Phase 1: Phaser Setup
1. Create `src/renderer/PhaserRenderer.ts`:
   - Initialize Phaser game instance
   - Configure canvas and WebGL
   - Set up game scenes
   - Create main game scene
2. Create `src/renderer/scenes/GameScene.ts`
3. Add Phaser configuration

### Phase 2: State Interpolation
1. Implement interpolation system:
   - Calculate alpha between previous and current state
   - Interpolate positions for smooth movement
   - Interpolate rotations
   - Create interpolation utilities
2. Add `src/renderer/InterpolationUtils.ts`
3. Add unit tests

### Phase 3: Sprite Management
1. Create `src/renderer/SpriteManager.ts`:
   - Load sprite assets
   - Create sprite pools for objects
   - Map game objects to sprites
   - Update sprite positions from state
   - Handle sprite lifecycle
2. Create placeholder sprite assets:
   - Player ship (red)
   - Enemy Type A
   - Laser projectile
   - Background stars
3. Add asset loading tests

### Phase 4: Object Rendering
1. Implement rendering for each object type:
   - **Player**: Ship sprite with rotation, invulnerability flashing
   - **Enemies**: Enemy sprites following flight paths
   - **Projectiles**: Laser sprites with trails
   - **Background**: Star field with depth
   - **UI**: Lives, score overlay
2. Wire renderer to game state
3. Test each object type

### Phase 5: Menu Rendering
1. Implement menu scene rendering:
   - Start menu with options
   - Game over menu with score
   - Menu navigation indicators
   - Text rendering
2. Create `src/renderer/scenes/MenuScene.ts`
3. Test menu transitions

### Phase 6: Integration
1. Wire renderer to game loop
2. Implement headless mode toggle
3. Test harness rendering integration
4. Performance optimization
5. Test visual polish

## Technical Specification

### Disabling Phaser's Loop

```typescript
new Phaser.Game({
  callbacks: {
    postBoot: (game) => {
      game.loop.stop()   // disable Phaser's internal rAF
    }
  }
  // NO physics config — do not enable arcade
})

// Custom render callback manually steps Phaser once per frame:
render(prev, curr, alpha) {
  phaserGame.loop.tick()  // manually advance Phaser one frame
  scene.renderState(prev, curr, alpha)
}
```

### Renderer Interface Wiring

```typescript
interface GameRenderer {
  render(current: GameState, previous: GameState, alpha: number): void
}
// GameManager accepts renderer via constructor — no monkey-patching
constructor(options: { renderer?: GameRenderer; headless?: boolean })
```

### FPS Counter

- Track engine ticks per second (count of fixed-step updates)
- Track render frames per second (count of render callback invocations)
- Display both as text overlay in top-left: "Engine: 60 | Render: 60"

## Anti-Patterns

- DO NOT enable `physics: { default: 'arcade' }` — all physics handled by engine
- DO NOT use `Array.find()` for matching prev/current entities — build a `Map<id, entity>` per frame
- DO NOT use `Date.now()` for game-dependent effects — use `state.currentTime`
- DO NOT redraw unchanged Graphics objects every frame — cache static elements to textures

## Notes

**Rendering Principles**:
- Renderer reads state, never modifies it
- All game logic happens in game loop
- Renderer only visualizes
- Interpolation for smooth animation

**Performance**:
- Target 60 FPS minimum
- Sprite pooling for efficiency
- Batch rendering where possible
- Profile and optimize hot paths

**Assets**:
- Placeholder art acceptable for Sprint 1
- Simple geometric shapes work
- Proper pixel art deferred
- Sound effects deferred to later

**Visual Polish** (incremental):
- Smooth interpolation
- Particle effects (future)
- Screen shake (future)
- Color flashing for damage

**Test Harnesses**:
- Harnesses should support rendered mode
- Visual debugging aids helpful
- Frame-by-frame control useful
