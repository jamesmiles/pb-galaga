---
id: T-0105
title: "Implement tank boss factory and BossManager variant logic"
type: task
status: done
priority: P1
owner: engineer
labels: [engine, boss]
depends_on: [T-0101]
parallel_with: [T-0103, T-0104]
parent_epic: E-0010
acceptance:
  - "createTankBoss() returns boss with variant 'tank'"
  - "Tank boss enters from right side (not top)"
  - "4 tread turrets (bullet, fireRate 800ms, HP 250 each)"
  - "1 dome turret (homing, fireRate 1000ms, starts inactive)"
  - "Phase 1: tread turrets fire bullets while boss moves horizontally"
  - "Phase 2: when all treads destroyed, dome activates and fires homing missiles"
  - "Death sequence reuses existing BossDeathSequence infrastructure"
  - "Bridge health 800, score value 7500"
  - "7 unit tests passing"
created_at: '2026-02-20'
updated_at: '2026-02-20'
---

## Context

Level 6 features a "Mars Siege Tank" boss — a large tracked vehicle with 2-phase combat. Unlike the mothership which enters from the top, the tank enters from the right side.

## What was done

1. `src/objects/boss/code/TankBoss.ts` — createTankBoss() factory: variant 'tank', width 400, height 150, enters from right (startX = GAME_WIDTH + width/2), 4 tread turrets (2 per side) + 1 dome turret (starts with isAlive: false)
2. `src/objects/boss/code/TankBoss.test.ts` — 7 tests covering creation, dimensions, turret count/types, dome inactive state, entry position, score value
3. `src/engine/BossManager.ts` — Added updateTankEntry() (horizontal entry from right), updateTankActive() (2-phase: tread turrets fire bullets, dome activates when treads dead and fires homing missiles), dispatch on boss.variant
