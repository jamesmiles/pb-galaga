---
id: T-0109
title: "Add tank boss and player tank rendering"
type: task
status: done
priority: P1
owner: engineer
labels: [renderer, boss, player]
depends_on: [T-0101]
parallel_with: [T-0107, T-0108]
parent_epic: E-0010
acceptance:
  - "drawTankBossLower renders hull and track segments"
  - "drawTankBossUpper renders tread turrets with health bars and central dome"
  - "Tread turrets show individual health bars"
  - "Bridge health bar shown above boss"
  - "drawPlayerTank renders rectangular hull, tracks, turret dome, barrel"
  - "Player rendering dispatches on movementMode (ship vs tank)"
  - "Canvas2DRenderer dispatches to tank boss draw functions when variant is 'tank'"
created_at: '2026-02-20'
updated_at: '2026-02-20'
---

## Context

The tank boss and player tank need Canvas 2D procedural rendering matching the game's neon glow style. The boss uses the existing lower/upper split rendering pattern (hull behind entities, turrets in front).

## What was done

1. `src/renderer/drawing/drawTankBoss.ts` — drawTankBossLower (hull rectangle, track segments with detail lines), drawTankBossUpper (tread turrets with per-turret health bars, central dome with glow, bridge health bar)
2. `src/renderer/drawing/drawPlayer.ts` — Added drawPlayerTank() (rectangular hull, side tracks with detail, turret dome, barrel pointing up, exhaust glow); dispatch in drawPlayers() based on player.movementMode
3. `src/renderer/Canvas2DRenderer.ts` — Added tank boss variant dispatch in boss rendering sections (both playing and paused states)
