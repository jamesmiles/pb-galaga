---
id: T-0076
title: "HUD primary weapon and level display"
type: task
status: review
priority: P2
owner: engineer
labels: [level-5, hud, rendering]
depends_on: []
parallel_with: [T-0065, T-0066, T-0067, T-0073]
parent_epic: E-0007
acceptance:
  - "Primary weapon type and power level shown at bottom of screen"
  - "Adjacent to existing secondary weapon timer bar"
  - "Updates when weapon type or level changes"
  - "Shows weapon name (LASER/BULLET) and level (L1-L4)"
  - "~3 new tests"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Players currently have no visual indicator of their primary weapon type or power level. This information should be displayed at the bottom of the screen adjacent to the existing secondary weapon timer bar.

## Plan

1. `src/renderer/HUD.ts` — Add primary weapon/level display near the secondary weapon bar
2. Tests for correct text output
