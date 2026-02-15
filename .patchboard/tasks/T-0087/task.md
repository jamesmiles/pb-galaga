---
id: T-0087
title: "Mini-boss health and fire rate tuning"
type: task
status: review
priority: P1
owner: engineer
labels: [enemy, balance, level-3]
depends_on: [T-0084]
parent_epic: E-0008
acceptance:
  - "Mini-boss HP doubled from 625 to 1250"
  - "Fire rate reduced from 2500ms to 1800ms for more aggressive firing"
  - "Mini-boss reliably fires multiple volleys before being destroyed"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Playtesting revealed the mini-boss could be killed before firing any missiles. The initial cooldown (3-4 seconds from homing config) combined with low HP (625) meant an upgraded player could burst it down instantly.

## Changes

- `src/engine/constants.ts` — ENEMY_G_HEALTH increased to 1250
- `src/objects/enemies/enemyG/code/EnemyG.ts` — fireRate reduced to 1800ms
