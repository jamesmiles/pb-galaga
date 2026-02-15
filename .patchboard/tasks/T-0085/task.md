---
id: T-0085
title: "Mini-boss rendering and audio"
type: task
status: review
priority: P1
owner: engineer
labels: [rendering, audio, enemy]
depends_on: [T-0084]
parent_epic: E-0008
acceptance:
  - "Type G drawn as 2.5x scaled stealth bomber (green)"
  - "Health bar displayed above the mini-boss"
  - "Color transitions: green → yellow → red based on health %"
  - "Twin missile bays visible in ship design"
  - "Large explosion particle effect on death"
  - "G added to EXPLOSION_COLORS in ParticleSystem"
  - "hitG sound effect: heavy resonant explosion"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

The mini-boss needs to be visually distinct from regular Type F enemies, clearly communicating its threat level through size, health bar, and dramatic death effects.

## Changes

- `src/renderer/drawing/drawEnemies.ts` — drawEnemyG function (2.5x scaled F with health bar)
- `src/renderer/drawing/drawEnemies.ts` — G color config added to ENEMY_COLORS
- `src/renderer/effects/ParticleSystem.ts` — G explosion colors (green + yellow + white)
- `src/renderer/Canvas2DRenderer.ts` — G included in large explosion detection
- `src/audio/SoundManager.ts` — hitG sound effect preset
