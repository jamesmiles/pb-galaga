---
id: T-0093
title: "Apply chaos mode multipliers (2x wave size, 2x weapon drops)"
type: task
status: todo
priority: P2
owner: null
labels: [engine, chaos]
depends_on: [T-0090, T-0092]
parallel_with: []
parent_epic: E-0009
acceptance:
  - "Chaos mode: each wave has 2x enemies via doubled rows (bigger waves, not more waves)"
  - "Slot-based waves: slots duplicated with row offset to double formation size"
  - "Boss waves (bossSpawn: true) are NOT doubled"
  - "Weapon pickup drop chance = 16% in chaos (2x of 8%)"
  - "Normal mode behavior completely unchanged"
  - "Doubled formations fit on screen without clipping"
  - "Unit tests verify doubled enemy counts and drop rates"
created_at: '2026-02-17'
updated_at: '2026-02-17'
---

## Context

Chaos mode doubles the SIZE of each wave (more enemies per wave) and doubles weapon drop frequency. This makes the game significantly harder and more chaotic.

## Plan

1. In `src/engine/LevelManager.ts` `spawnWave()`:
   - For `EnemySpawnConfig`-based waves: if chaos, double `rows` value before spawning (keeps formation width, doubles height/count)
   - For `WaveSlot`-based waves: if chaos, duplicate each slot with a row offset of `maxRow + 1` to mirror the formation below
   - Skip doubling for `bossSpawn: true` waves
   - May need to reduce `cellHeight` slightly in chaos mode to fit doubled formations
2. In `src/engine/WeaponPickupManager.ts` `maybeSpawnPickup()`:
   - Accept difficulty parameter (or read from state)
   - Use `WEAPON_PICKUP_DROP_CHANCE * CHAOS_WEAPON_DROP_MULTIPLIER` when chaos (cap at 1.0)
3. Update call site in `src/engine/GameManager.ts` to pass difficulty to pickup spawn

## Notes

- The key design decision is doubling ROWS not COLS — this doubles enemy count while preserving horizontal formation shape
- Formation standoffY and cellHeight may need adjustment to prevent off-screen issues in chaos mode
