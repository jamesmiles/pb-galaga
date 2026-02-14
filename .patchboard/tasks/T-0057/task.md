---
id: T-0057
title: "Extend projectile update system with acceleration and homing"
type: task
status: review
priority: P1
owner: engineer
labels: [sprint-6, engine, projectile]
depends_on: [T-0054, T-0055, T-0056]
parallel_with: []
parent_epic: E-0006
acceptance:
  - "updateProjectile handles acceleration (speed increases up to maxSpeed)"
  - "updateProjectile handles homing (steers toward nearest alive enemy)"
  - "Homing delay prevents steering during initial fan-out period"
  - "Non-homing projectiles unaffected by changes"
  - "updateProjectile signature includes GameState parameter"
  - "Performance: 200 homing projectiles + 50 enemies, 1000 ticks < 500ms"
  - "~10 tests pass"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Rockets and homing missiles need per-frame acceleration. Homing missiles and snake lasers need per-frame steering toward enemies. This extends the existing `updateProjectile()` in Laser.ts.

## Plan

1. Modify `src/objects/projectiles/laser/code/Laser.ts`:
   - Extend `updateProjectile(proj, dtSeconds)` → `updateProjectile(proj, dtSeconds, state)`
   - Add acceleration logic: if proj.acceleration && proj.speed < proj.maxSpeed, increase speed
   - Add homing delay: if proj.homingDelay > 0, decrement and skip homing
   - Add homing: find nearest alive enemy, calculate angle delta, rotate velocity by turnRate * dt
   - Rebuild velocity vector from speed + direction angle
   - Update `updateAllProjectiles` to pass state through

2. Add ~10 tests including performance test
