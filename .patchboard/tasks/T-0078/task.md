---
id: T-0078
title: "Shield (health) status bar in HUD"
type: task
status: todo
priority: P2
owner: engineer
labels: [level-5, hud, rendering]
depends_on: []
parallel_with: [T-0065, T-0066, T-0067, T-0073]
parent_epic: E-0007
acceptance:
  - "Health/shield bar displayed in HUD"
  - "Visually shows current health as percentage of max health"
  - "Color-coded (green > yellow > red as health decreases)"
  - "Positioned adjacent to lives display"
  - "~3 new tests"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

The player ship can take multiple hits before dying, but there is no visual indicator of current health. A shield/health bar next to the lives counter gives players critical survival information.

## Plan

1. `src/renderer/HUD.ts` — Add health bar with color gradient based on health percentage
2. Tests for bar rendering at different health levels
