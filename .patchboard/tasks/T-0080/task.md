---
id: T-0080
title: "P1 default weapon changed to bullets"
type: task
status: review
priority: P1
owner: engineer
labels: [gameplay, weapon, rebalance]
depends_on: []
parent_epic: E-0008
acceptance:
  - "createPlayer('player1') returns primaryWeapon 'bullet'"
  - "createPlayer('player2') still returns primaryWeapon 'laser'"
  - "Death weapon reset gives P1 'bullet' not 'laser'"
  - "Updated tests reflect new P1 default"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

The red player (P1) was starting with laser which didn't match the intended gameplay feel. Bullets are now the P1 default, with laser available as a pickup upgrade.

## Changes

- `src/engine/StateManager.ts` — `createPlayer()` returns `'bullet'` for P1, `'laser'` for P2
- `src/engine/GameManager.ts` — Death weapon reset uses player ID to determine default
- `src/engine/WeaponManager.test.ts` — Updated to expect P1 bullet default
- `src/objects/projectiles/laser/code/PlayerFiring.test.ts` — Updated projectile type assertion
