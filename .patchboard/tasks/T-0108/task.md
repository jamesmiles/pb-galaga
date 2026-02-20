---
id: T-0108
title: "Implement Mars terrain background and dust cloud overlay"
type: task
status: done
priority: P1
owner: engineer
labels: [renderer, background, effects]
depends_on: [T-0100]
parallel_with: [T-0107, T-0109]
parent_epic: E-0010
acceptance:
  - "Procedural Mars terrain replaces starfield for Level 6"
  - "Rust-red sky gradient, rocky ground, jagged horizon, craters, distant hills"
  - "Terrain scrolls subtly for motion feel"
  - "DustCloudManager loads 5 dust/swirl sprites from src/backgrounds/"
  - "Dust clouds spawn from screen edges, drift across at alpha 0.15-0.35"
  - "Max 6 clouds, 2.5s spawn interval"
  - "Dust clouds render above entities but below HUD"
  - "Level 6 entry in backgrounds.ts (empty array, terrain is procedural)"
created_at: '2026-02-20'
updated_at: '2026-02-20'
---

## Context

Level 6 is set on Mars, so the space starfield is replaced with a ground-level desert scene. The dust cloud overlay is a new render layer that adds atmosphere without affecting gameplay.

## What was done

1. `src/renderer/drawing/drawMarsTerrain.ts` — Procedural Mars terrain: dark rust-red sky gradient (#1a0505 to #331111), ground plane, jagged horizon line, rocky craters, distant hill silhouettes, dust haze overlay
2. `src/renderer/drawing/drawDustClouds.ts` — DustCloudManager class: loads 5 dust/swirl sprite PNGs, spawns clouds from screen edges, semi-transparent alpha, rotation, max 6 active clouds
3. `src/levels/backgrounds.ts` — Added `6: []` entry
4. `src/renderer/Canvas2DRenderer.ts` — Conditional terrain rendering for level 6, dust cloud manager integration, terrain scroll tracking
