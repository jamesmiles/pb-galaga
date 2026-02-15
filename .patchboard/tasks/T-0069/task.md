---
id: T-0069
title: "Enhanced explosions for stealth bomber and boss"
type: task
status: todo
priority: P2
owner: engineer
labels: [level-5, effects]
depends_on: [T-0066, T-0068]
parallel_with: [T-0071]
parent_epic: E-0007
acceptance:
  - "emitLargeExplosion() method on ParticleSystem"
  - "50 particles, 250 speed, 800ms life for large explosions"
  - "bossTurret and bossBridge color configs"
  - "Boss bridge: 80 particles, 300 speed, 1000ms life, heavy shake"
  - "Enemy F uses large explosion on death"
  - "'bossExplosion' sound effect"
  - "~4 new tests"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Stealth bombers and boss turrets/bridge need visually larger and more impactful explosions than regular enemies.

## Plan

1. `src/renderer/effects/ParticleSystem.ts` — emitLargeExplosion(), boss color configs
2. `src/renderer/Canvas2DRenderer.ts` — large explosion for F, boss death detection
3. `src/audio/SoundManager.ts` — bossExplosion sound
