---
id: T-0088
title: "Weapon switch preserves power level"
type: task
status: review
priority: P1
owner: engineer
labels: [weapon, gameplay, bugfix]
depends_on: []
parent_epic: E-0008
acceptance:
  - "Picking up alternate primary weapon type switches weapon but keeps current power level"
  - "Picking up same primary weapon type still upgrades level (1→2→3→4)"
  - "Level cap at 4 still enforced"
  - "Updated WeaponManager tests"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Legacy behavior reset primary weapon level to 1 when switching types (e.g. bullet level 3 → laser level 1). This felt punishing — players avoided pickups of the other type. Now switching preserves the current level, making weapon pickups always beneficial.

## Changes

- `src/engine/WeaponManager.ts` — Removed `player.primaryLevel = 1` from type-switch branch
- `src/engine/WeaponManager.test.ts` — Updated tests to expect preserved power level on switch
