---
id: T-0062
title: "Add rendering for new projectiles, pickups, and asteroids"
type: task
status: todo
priority: P2
owner: null
labels: [sprint-6, renderer, visual]
depends_on: [T-0054, T-0055, T-0056, T-0059, T-0061]
parallel_with: []
parent_epic: E-0006
acceptance:
  - "Rocket drawn as small orange/red rect with flame trail and glow"
  - "Missile drawn as tiny white dart with faint trail"
  - "Snake laser drawn as thick cyan beam (8px wide) with heavy glow and afterimages"
  - "Weapon pickups drawn as pulsing colored orbs (blue/red/green/purple)"
  - "Asteroids drawn as rocky polygon shapes with rotation"
  - "Secondary weapon timer shown in HUD"
  - "All new entities visible in game"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Visual rendering for all new Sprint 6 game entities. This task creates the drawing functions and integrates them into the renderer.

## Plan

1. Modify `src/renderer/drawing/drawProjectiles.ts`:
   - Add rocket, missile, snake cases

2. Modify `src/renderer/Canvas2DRenderer.ts`:
   - Add `drawWeaponPickups()` — pulsing orbs with weapon-type colors
   - Add `drawAsteroids()` — rocky polygons, brown/grey, rotation-based
   - Add `drawSecondaryTimer()` in HUD area
   - Call new draw functions in render loop

3. Tests: 0 (visual, verified by Playwright + manual testing)
