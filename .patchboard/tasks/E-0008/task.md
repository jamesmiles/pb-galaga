---
id: E-0008
title: "Sprint 6.5 - Gameplay Enhancements (v0.8.1)"
type: epic
status: review
priority: P1
owner: engineer
labels:
  - epic
  - gameplay
  - co-op
depends_on: [E-0007]
children:
  - T-0080
  - T-0081
  - T-0082
  - T-0083
  - T-0084
  - T-0085
  - T-0086
  - T-0087
  - T-0088
acceptance:
  - "P1 starts with bullets instead of laser"
  - "Co-op respawn pickup system (once per level when player is dead)"
  - "Level complete auto-advances after 3s (no menu)"
  - "2P Test Mode in start menu"
  - "Mini-boss (Type G) at end of Level 3"
  - "Death weapon reset respects P1 default (bullet)"
  - "New sound effects: respawnPickup, hitG"
  - "All 378 tests passing"
  - "Weapon switch preserves power level"
  - "Mini-boss HP and fire rate tuned"
  - "Version 0.8.2"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Sprint 7 (v0.7.x) delivered patches including game complete sequence, level intros, HUD 2-player mode, and landing page. Sprint 6.5 is a mid-cycle gameplay enhancement pass focused on co-op improvements, weapon rebalancing, bug fixes, and a mini-boss.

## Scope

1. **P1 Default Weapon** (T-0080) — Red player starts with bullets instead of laser
2. **Co-op Respawn Pickup** (T-0081) — "1P"/"2P" pickup when a player runs out of lives
3. **Level Complete Auto-Advance** (T-0082) — Remove menu, auto-advance after 3s delay
4. **2P Test Mode** (T-0083) — Co-op level select from start menu
5. **Mini-Boss Type G** (T-0084) — Large stealth bomber at end of Level 3
6. **Mini-Boss Rendering & Audio** (T-0085) — 2.5x scaled F drawing, health bar, sounds
7. **Finalization** (T-0086) — Version bump, tests, build, PR #23

## Out of scope

- Full boss fight rework
- New levels
- High score persistence
