---
id: T-0070
title: "Boss Manager - update logic"
type: task
status: todo
priority: P1
owner: engineer
labels: [level-5, boss, engine]
depends_on: [T-0066]
parallel_with: [T-0068]
parent_epic: E-0007
acceptance:
  - "BossManager class with update(state, dtSeconds)"
  - "Entry phase: drift down from above screen to y~120"
  - "Active phase: sinusoidal horizontal oscillation"
  - "Independent turret firing with own cooldowns"
  - "Dying phase: 5-phase chain reaction (4 turrets + bridge, ~800ms each)"
  - "Boss marked dead after death sequence completes"
  - "Integrated into GameManager.updatePlaying()"
  - "~10 new tests"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

The boss needs its own update manager separate from the enemy system. It has three phases: entry (descent), active (oscillation + firing), and dying (chain reaction).

## Plan

1. New `src/engine/BossManager.ts` — BossManager class
2. `src/engine/GameManager.ts` — integrate BossManager
3. New `src/engine/BossManager.test.ts`
