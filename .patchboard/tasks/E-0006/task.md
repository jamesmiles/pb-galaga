---
id: E-0006
title: "Sprint 6 - Weapons, Power-ups, Asteroids, Music"
type: epic
status: todo
priority: P1
owner: null
labels:
  - epic
  - sprint-6
depends_on: []
children:
  - T-0052
  - T-0053
  - T-0054
  - T-0055
  - T-0056
  - T-0057
  - T-0058
  - T-0059
  - T-0060
  - T-0061
  - T-0062
  - T-0063
  - T-0064
acceptance:
  - "Player weapon upgrade system with 4 laser levels and 4 bullet levels"
  - "Secondary weapons (rockets and homing missiles) fire alongside primary"
  - "Weapon pickups drop from enemies with cycling colors"
  - "Destructible foreground asteroids in Level 4"
  - "Projectile speed/damage hierarchy: bullets fastest/weakest, lasers most damage"
  - "Level-specific music tracks (L2 rock, L3 synth, L4 DnB)"
  - "All features have comprehensive unit tests (~91 new, ~337 total)"
  - "Performance tests for homing projectiles and asteroid collisions"
  - "Version 0.6.0"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Sprint 5 (v0.5.3) delivered Enemy D/E, plasma projectile, Levels 3-4, per-level backgrounds, level intro cutscenes, and test mode. The game has ~246 tests and 4 levels of content.

Sprint 6 adds a full player weapon upgrade system with power-up pickups, destructible foreground asteroids in Level 4, rebalanced projectile stats, and per-level music tracks.

## Scope

1. **Projectile Rebalancing** (T-0052, T-0053) - Speed/damage hierarchy, bullet +30%, plasma +50% size
2. **New Projectile Factories** (T-0054, T-0055, T-0056) - Rocket, homing missile, snake laser
3. **Projectile Update System** (T-0057) - Acceleration and homing steering
4. **Player Weapon System** (T-0058, T-0060) - Weapon state, upgrade levels, firing integration
5. **Weapon Pickups** (T-0059) - Drop, cycle, collect mechanics
6. **Asteroids** (T-0061) - Level 4 foreground obstacles
7. **Rendering** (T-0062) - Visual drawing for all new entities
8. **Music** (T-0063) - 3 new ZzFXM tracks with per-level switching
9. **Finalization** (T-0064) - Version bump, all tests pass

## Out of scope

- Boss enemies
- High score persistence
- Additional levels beyond 4
- Combo scoring system
