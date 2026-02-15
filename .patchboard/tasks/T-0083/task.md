---
id: T-0083
title: "2P Test Mode menu option"
type: task
status: review
priority: P2
owner: engineer
labels: [ui, co-op, testing]
depends_on: []
parent_epic: E-0008
acceptance:
  - "'2P Test Mode' added as 4th option on start menu"
  - "Opens level select with co-op mode enabled"
  - "Level select shows '(CO-OP)' label"
  - "Launching a level starts in co-op with two players"
  - "Back navigation returns to start menu with all 4 options"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Testing co-op features required starting a full 2-player game from level 1. A dedicated "2P Test Mode" allows jumping to any level in co-op mode for faster testing and debugging.

## Changes

- `src/engine/StateManager.ts` — Start menu options include '2P Test Mode'
- `src/engine/GameManager.ts` — Menu handling for 2P test mode, stores testCoop flag
- `src/renderer/MenuOverlay.ts` — Level select shows "(CO-OP)" label when testCoop
- `src/types.ts` — testCoop added to MenuState data type
