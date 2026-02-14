---
id: T-0058
title: "Implement player weapon state and upgrade logic"
type: task
status: todo
priority: P1
owner: null
labels: [sprint-6, engine, weapon]
depends_on: [T-0052]
parallel_with: [T-0061]
parent_epic: E-0006
acceptance:
  - "WeaponManager.upgradeWeapon() handles all collection rules"
  - "Same primary type → upgrade level (1→2→3→4, capped)"
  - "Different primary type → switch weapon, reset to level 1"
  - "Secondary weapon → set/replace, reset 60s timer"
  - "Same secondary type → refresh timer"
  - "WeaponManager.updateSecondaryTimer() counts down and clears at 0"
  - "~15 tests pass"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

The weapon state system manages what the player is currently firing. Primary weapons (laser/bullet) have 4 upgrade levels. Secondary weapons (rocket/missile) last 60 seconds. Collection rules determine upgrades vs switches.

## Plan

1. Create `src/engine/WeaponManager.ts`:
   - `upgradeWeapon(player, pickup: WeaponPickup)` — all collection rules
   - `updateSecondaryTimer(player, dt)` — countdown, clear when expired
   - `getPlayerWeaponState(player)` — helper to read current state

2. Create `src/engine/WeaponManager.test.ts` — ~15 tests
