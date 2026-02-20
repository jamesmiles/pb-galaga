---
id: E-0010
title: "Sprint 10 - Level 6: Mars Landing (v0.10.0)"
type: epic
status: done
priority: P1
owner: engineer
labels:
  - epic
  - level-6
  - mars
  - gameplay
depends_on: [E-0009]
children:
  - T-0100
  - T-0101
  - T-0102
  - T-0103
  - T-0104
  - T-0105
  - T-0106
  - T-0107
  - T-0108
  - T-0109
  - T-0110
acceptance:
  - "Level 6 playable with Mars ground combat theme"
  - "Player switches to tank mode (horizontal-only movement) on Level 6"
  - "4 new enemy types: Turret Cannon (H), Artillery (I), Mech Warrior (J), Missile Launcher (K)"
  - "Stationary enemy system — H/I fixed in place, aimed firing at player"
  - "Mobile enemies J/K use formation + dive system with speed multipliers"
  - "Procedural Mars terrain background replaces starfield"
  - "Dust cloud foreground overlay (sprite-based, above entities, below HUD)"
  - "Tank boss with 2-phase combat (tread turrets → exposed dome)"
  - "Level 6 music track and type-specific hit sounds"
  - "Version 0.10.0"
created_at: '2026-02-20'
updated_at: '2026-02-20'
---

## Context

v0.9.5 was stable with 5 space-based levels, co-op, chaos mode, weapon upgrades, and stats. Sprint 10 introduces a major gameplay shift: the player lands on Mars, switches from a spaceship to a ground tank, and fights new enemy types in a desert environment. This is the first non-space level and introduces stationary enemies, aimed firing, and a new tank boss pattern.

## Scope

1. **Dust cloud sprite processing** (T-0100) - Split 2x2 sprite sheets into individual PNGs
2. **Data model extensions** (T-0101) - types.ts, constants.ts, StateManager updates
3. **Enemy factories H-K** (T-0102) - 4 new enemy type factory functions + tests
4. **Stationary enemy system** (T-0103) - FormationManager, DiveManager, EnemyFiringManager, LevelManager
5. **Player tank mode** (T-0104) - Horizontal-only movement, ground Y lock, respawn
6. **Tank boss** (T-0105) - TankBoss factory, BossManager variant logic
7. **Level 6 config** (T-0106) - 6-wave level definition
8. **Enemy H-K rendering** (T-0107) - Draw functions + particle colors
9. **Mars terrain & dust clouds** (T-0108) - Procedural background + sprite overlay
10. **Tank boss & player tank rendering** (T-0109) - Draw functions for boss and tank
11. **Integration & finalization** (T-0110) - GameManager, audio, version bump, tests

## Out of scope

- New projectile types (H-K reuse existing projectiles)
- High score persistence
- Leaderboard / online features
- Additional Mars levels
