---
id: T-0044
title: "Enemy D/E procedural drawing"
type: task
status: done
priority: P1
owner: engineer
labels:
- renderer
depends_on:
- T-0040
- T-0041
parent_epic: E-0005
acceptance:
- drawEnemies.ts extended with Enemy D and E shapes
- Type D drawn as curved bracket/crescent shape
- Type E drawn as stealth bomber/flying wing silhouette (facing downward)
- Type-specific color presets and shadowBlur glow
- Plasma projectile rendering added (magenta glow, larger than bullets)
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Procedural Canvas 2D drawing for the two new enemy types, maintaining the neon glow aesthetic with distinct silhouettes for visual variety.
