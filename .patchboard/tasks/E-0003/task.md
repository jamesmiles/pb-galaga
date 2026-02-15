---
id: E-0003
title: "Canvas 2D Renderer — Replace Phaser with zero-dependency neon glow"
type: epic
status: done
priority: P0
owner: engineer
labels:
- epic
- engine-v2
depends_on:
- E-0002
children: []
acceptance:
- Phaser dependency completely removed (zero runtime dependencies)
- Canvas 2D renderer with per-entity shadowBlur neon glow effects
- Procedural drawing modules for stars, players, enemies (A/B/C), projectiles
- ParticleSystem with explosions, screen shake, alpha fade
- HUD rendering (score, lives, wave, FPS)
- CSS-based MenuOverlay for game menus
- GAME_VERSION extracted to constants.ts as single source of truth
- Production build reduced from ~150KB to 36KB (11KB gzipped)
- Playwright visual tests updated and passing
- All 173 headless tests pass (engine unchanged)
created_at: '2026-02-14'
updated_at: '2026-02-14'
---

## Context

E-0003 replaced the Phaser 3 renderer with a custom Canvas 2D renderer achieving zero runtime dependencies. Phaser's Bloom PostFX was a blunt instrument that applied glow uniformly to everything (text, UI, stars, sprites). The Canvas 2D approach uses targeted per-entity `shadowBlur` for precise neon glow effects.

Implemented as a single cohesive feature branch (`pb-galaga-engine-v2`) merged via PR #11. No individual task breakdown was used — the migration was atomic.

## What was delivered

### Files created
- `src/renderer/Canvas2DRenderer.ts` — Main renderer with layered drawing, death detection, screen shake
- `src/renderer/HUD.ts` — Score, lives, wave, FPS text rendering
- `src/renderer/MenuOverlay.ts` — CSS-based menu overlay system
- `src/renderer/drawing/drawStars.ts` — Background stars with depth-based brightness
- `src/renderer/drawing/drawPlayer.ts` — Player ships as triangles with engine glow and invulnerability flash
- `src/renderer/drawing/drawEnemies.ts` — Enemy types A/B/C with unique shapes, eyes, color presets
- `src/renderer/drawing/drawProjectiles.ts` — Laser beams and bullets with glow
- `src/renderer/effects/ParticleSystem.ts` — Explosion particles, alpha fade, screen shake on death
- `src/renderer/InterpolationUtils.ts` — Per-entity lerp for smooth 60fps rendering

### Files removed (Phaser)
- `src/renderer/PhaserRenderer.ts`
- `src/renderer/scenes/GameScene.ts`
- `src/renderer/SpriteManager.ts`
- `src/assets/sprites.ts`

### Key commits
- `8a367d8` — Remove Phaser dependency, scaffold Canvas 2D renderer
- `6bba8e5` — Implement Canvas 2D renderer with all drawing modules
- `dcbc8bc` — Update Playwright visual tests for Canvas 2D renderer
- `d183222` — Bump version to 0.3.0
- `d0451f9` — Fix: wait for DOM ready before initializing renderer
