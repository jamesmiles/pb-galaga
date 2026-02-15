---
id: T-0082
title: "Level complete auto-advance (remove menu)"
type: task
status: review
priority: P1
owner: engineer
labels: [gameplay, bugfix, ui]
depends_on: []
parent_epic: E-0008
acceptance:
  - "Level complete screen has no menu options"
  - "Auto-advances to next level intro after 3 seconds"
  - "inputHandler.clearAll() called on level complete transition"
  - "Fixes bug where held Space key instantly selected menu option"
  - "Updated GameManager tests"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

In co-op mode, players hold Space (fire) during gameplay. When a level completed and showed a menu, the held Space key was consumed as "confirm" by getMenuInput(), instantly selecting the first menu option (often sending players back to the main menu unexpectedly).

## Changes

- `src/engine/GameManager.ts` — updateLevelComplete() now auto-advances after 3s timer
- `src/engine/GameManager.ts` — Level complete state sets empty options array
- `src/engine/GameManager.ts` — clearAll() called on state transitions
- `src/renderer/MenuOverlay.ts` — Level complete screen no longer renders menu options
- `src/engine/GameManager.test.ts` — Updated tests for auto-advance behavior
