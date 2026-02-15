---
id: T-0072
title: "Boss rendering - two-layer drawing"
type: task
status: review
priority: P2
owner: engineer
labels: [level-5, boss, rendering]
depends_on: [T-0066, T-0069, T-0070]
parallel_with: []
parent_epic: E-0007
acceptance:
  - "drawBossLower() - dark muted hull, 0.6 alpha, no glow"
  - "drawBossUpper() - bright turrets with shadowBlur, bridge with command window"
  - "Destroyed turrets rendered as burned-out husks"
  - "Two-pass rendering in Canvas2DRenderer"
  - "3D depth effect via desaturation and glow difference between layers"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

The boss must render in two passes to create the two-layer depth effect: lower hull behind the player, upper turrets/bridge at or in front of the player.

## Plan

1. New `src/renderer/drawing/drawBoss.ts` — drawBossLower() + drawBossUpper()
2. `src/renderer/Canvas2DRenderer.ts` — two-pass rendering integration
