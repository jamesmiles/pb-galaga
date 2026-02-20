---
id: T-0107
title: "Add rendering for enemies H, I, J, K"
type: task
status: done
priority: P1
owner: engineer
labels: [renderer, enemies]
depends_on: [T-0101]
parallel_with: [T-0108, T-0109]
parent_epic: E-0010
acceptance:
  - "drawEnemyH renders squat turret with rotating barrel"
  - "drawEnemyI renders tall artillery emplacement"
  - "drawEnemyJ renders bipedal mech walker"
  - "drawEnemyK renders compact vehicle with missile rack"
  - "Each type has unique color scheme in ENEMY_COLORS"
  - "H/I/J/K explosion and flash colors added to ParticleSystem"
created_at: '2026-02-20'
updated_at: '2026-02-20'
---

## Context

New enemy types need procedural Canvas 2D draw functions matching the existing neon glow style. Each has a distinct silhouette for visual identification.

## What was done

1. `src/renderer/drawing/drawEnemies.ts` — Added H/I/J/K color configs, draw dispatch in main loop, and 4 new draw functions: drawEnemyH (squat turret base + barrel), drawEnemyI (tall platform + heavy barrel), drawEnemyJ (bipedal body + legs), drawEnemyK (tracked vehicle + missile rack)
2. `src/renderer/effects/ParticleSystem.ts` — Added H/I/J/K entries to EXPLOSION_COLORS and FLASH_COLORS
