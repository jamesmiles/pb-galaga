---
id: T-0068
title: "Enemy F rendering and audio"
type: task
status: review
priority: P2
owner: engineer
labels: [level-5, rendering, audio]
depends_on: [T-0067]
parallel_with: [T-0070]
parent_epic: E-0007
acceptance:
  - "drawEnemyF() green stealth bomber procedural shape"
  - "F explosion/flash colors (green) in ParticleSystem"
  - "'hitF' sound effect (deep boom, louder)"
  - "'missileWhistle' sound effect for in-flight homing"
  - "~3 new tests"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Enemy F needs visual and audio representation consistent with existing enemy types.

## Plan

1. `src/renderer/drawing/drawEnemies.ts` — F color config + drawEnemyF()
2. `src/renderer/effects/ParticleSystem.ts` — F explosion/flash colors
3. `src/audio/SoundManager.ts` — hitF and missileWhistle sounds
