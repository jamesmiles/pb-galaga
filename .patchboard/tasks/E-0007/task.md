---
id: E-0007
title: "Level 5 - Defeat Mars Colony (Boss Fight)"
type: epic
status: todo
priority: P1
owner: engineer
labels:
  - epic
  - level-5
depends_on: [E-0006]
children:
  - T-0065
  - T-0066
  - T-0067
  - T-0068
  - T-0069
  - T-0070
  - T-0071
  - T-0072
  - T-0073
  - T-0074
  - T-0075
acceptance:
  - "Level end delay (3s clearing phase) across all levels"
  - "Enemy Type F (green stealth bomber) with homing missiles"
  - "Boss fight with 4 turrets, two-layer collision, chain reaction death"
  - "X formation flight path"
  - "Mars + small moon backgrounds"
  - "Enhanced explosions for stealth bomber and boss"
  - "Level 5 music track"
  - "~57 new tests, all passing"
  - "Version 0.7.0"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Sprint 6 (v0.6.0) delivered weapons, power-ups, asteroids, and per-level music across 4 levels with 328 tests. Level 5 is the first boss level, introducing Enemy F (green stealth bomber with homing missiles called "whistling jacks"), an X wave formation, Mars/moon backgrounds, and a multi-phase boss fight.

## Scope

1. **Level End Delay** (T-0065) - 3s clearing phase after last enemy killed, all levels
2. **Boss Data Model** (T-0066) - BossState, turrets, collision zones on GameState
3. **Enemy Type F** (T-0067) - Stealth bomber with enemy-fired homing missiles
4. **Enemy F Rendering/Audio** (T-0068) - Green bomber drawing, hit sounds, missile whistle
5. **Enhanced Explosions** (T-0069) - Larger explosions for F, boss turrets, boss bridge
6. **Boss Manager** (T-0070) - Entry, active, dying phases with turret firing
7. **Boss Collision** (T-0071) - Two-layer collision (upper/lower), turret/bridge damage
8. **Boss Rendering** (T-0072) - Two-pass drawing with 3D depth effect
9. **X Formation** (T-0073) - New flight path type
10. **Level 5 Config** (T-0074) - 5 waves, backgrounds, music, boss wave integration
11. **Finalization** (T-0075) - Version 0.7.0, tests, build

## Out of scope

- High score persistence
- Additional levels beyond 5
- Multiplayer boss mechanics
