---
id: T-0071
title: "Boss collision detection"
type: task
status: review
priority: P1
owner: engineer
labels: [level-5, boss, collision]
depends_on: [T-0066, T-0070]
parallel_with: [T-0069]
parent_epic: E-0007
acceptance:
  - "detectProjectileBossTurretCollisions() - circle collision"
  - "detectProjectileBossBridgeCollisions() - rect collision, only when all turrets dead"
  - "detectPlayerBossCollisions() - upper zones, instant kill"
  - "Score awarded per turret kill and bridge kill"
  - "Bridge immune while turrets alive"
  - "No collision with lower hull"
  - "~8 new tests"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

The boss has a two-layer collision model. The lower hull is visual-only (player flies over). The upper layer (turrets + bridge) causes player collision and takes projectile damage. Bridge is only vulnerable after all 4 turrets destroyed.

## Plan

1. `src/engine/CollisionDetector.ts` — three new collision functions
2. Extend `src/engine/CollisionDetector.test.ts`
