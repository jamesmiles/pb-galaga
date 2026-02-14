---
id: T-0053
title: "Rebalance projectile stats (bullet speed, plasma size)"
type: task
status: todo
priority: P2
owner: null
labels: [sprint-6, balance]
depends_on: [T-0052]
parallel_with: []
parent_epic: E-0006
acceptance:
  - "BULLET_SPEED is 260 (was 200, +30%)"
  - "PLASMA_COLLISION_RADIUS is 9 (was 6, +50%)"
  - "Existing tests updated with new assertion values"
  - "2 new tests verifying rebalanced values"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Quick rebalancing task. Enemy bullets become 30% faster (more challenging), plasma projectiles become 50% larger (more visible/threatening).

## Plan

1. Update `src/engine/constants.ts` — PLASMA_COLLISION_RADIUS = 9
2. Verify `src/objects/projectiles/bullet/code/Bullet.ts` uses BULLET_SPEED (now 260)
3. Update test assertions in Bullet.test.ts and Plasma.test.ts
4. Add 2 new tests verifying rebalanced values
