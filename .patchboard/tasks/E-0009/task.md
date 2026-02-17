---
id: E-0009
title: "Sprint 9 - Chaos Mode, Auto-fire, Weapons, Stats (v0.9.0)"
type: epic
status: todo
priority: P1
owner: null
labels:
  - epic
  - gameplay
  - weapons
  - co-op
depends_on: [E-0008]
children:
  - T-0089
  - T-0090
  - T-0091
  - T-0092
  - T-0093
  - T-0094
  - T-0095
  - T-0096
  - T-0097
  - T-0098
  - T-0099
acceptance:
  - "Chaos difficulty mode: 2x wave size, 2x weapon drop rate"
  - "Difficulty selection submenu after mode select (Normal / Chaos)"
  - "NumLock toggles P1 auto-fire, CapsLock toggles P2 auto-fire"
  - "Complete keybindings displayed on start menu for both players"
  - "Dead co-op player auto-respawns on level complete as reward"
  - "Player ships return to starting position on level complete"
  - "Per-player stats summary between levels and at game end"
  - "Primary weapon level 5: bullet 2x size +25% damage, snake 2x length +25% damage"
  - "HUD power bar revised to 5 segments"
  - "HUD auto-fire indicator"
  - "Version 0.9.0"
created_at: '2026-02-17'
updated_at: '2026-02-17'
---

## Context

v0.8.6 is stable with 5 levels, co-op, weapon pickups, mini-boss, and respawn pickups. Sprint 9 adds replayability (chaos difficulty), quality-of-life (auto-fire, keybindings display, ship repositioning, co-op respawn reward), player feedback (stats summary), and extends the weapon upgrade path to level 5.

## Scope

1. **PlayerStats Tracking** (T-0089) - Per-player kills, deaths, powerups, respawns
2. **Difficulty State** (T-0090) - GameDifficulty type and chaos constants
3. **Auto-fire Toggle** (T-0091) - NumLock/CapsLock toggle input
4. **Difficulty Submenu** (T-0092) - Normal/Chaos selection after mode pick
5. **Chaos Multipliers** (T-0093) - 2x wave size, 2x weapon drops
6. **Keybindings Display** (T-0094) - Full controls on start menu
7. **Stats Summary Screen** (T-0095) - Post-level and end-game stats
8. **Co-op Auto-respawn** (T-0096) - Dead player respawns on level complete
9. **Ship Reposition** (T-0097) - Return to starting position on level complete
10. **Level 5 Weapons** (T-0098) - Extended upgrade path + HUD bar revision
11. **Finalization** (T-0099) - Auto-fire HUD indicator, version bump, tests

## Out of scope

- New enemy types
- New levels
- High score persistence
- Leaderboard / online features
