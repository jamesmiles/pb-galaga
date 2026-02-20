---
id: T-0106
title: "Create Level 6 wave config"
type: task
status: done
priority: P1
owner: engineer
labels: [levels, config]
depends_on: [T-0102, T-0105]
parallel_with: []
parent_epic: E-0010
acceptance:
  - "Level 6 'Mars Landing' defined with 6 waves"
  - "Wave 1: 4x Turret (H) stationary — tutorial wave"
  - "Wave 2: 2x Turret (H) + 2x Artillery (I) stationary — mixed stationary"
  - "Wave 3: 7x Mech (J) + 1x Launcher (K) in v-formation — introduce mobile"
  - "Wave 4: 3x stationary (H+I) flanks + 5x mobile (J+K) center — hybrid"
  - "Wave 5: 4x stationary (H+I) + 6x mobile (J+K) w-curve — heavy assault"
  - "Wave 6: Tank boss"
created_at: '2026-02-20'
updated_at: '2026-02-20'
---

## Context

Level 6 follows the existing level config pattern (see level5.ts). It introduces ground combat gradually: stationary turrets first, then mobile enemies, then hybrid waves, culminating in the tank boss.

## What was done

Created `src/levels/level6.ts` with 6 waves using the WaveConfig/WaveSlot system. Stationary enemies (H, I) use `fixedPosition` in their WaveSlot definitions. Mobile enemies (J, K) use standard formation system. Wave 6 uses `bossSpawn: true` with `bossVariant: 'tank'`.
