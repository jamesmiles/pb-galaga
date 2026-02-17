---
id: T-0092
title: "Add difficulty selection submenu (Normal / Chaos)"
type: task
status: todo
priority: P2
owner: null
labels: [menu, chaos]
depends_on: [T-0090]
parallel_with: [T-0094, T-0095, T-0096]
parent_epic: E-0009
acceptance:
  - "Selecting 1P/2P/Test/2P-Test shows a 'SELECT DIFFICULTY' submenu"
  - "Options: Normal, Chaos"
  - "ESC returns to start menu"
  - "Normal sets state.difficulty = 'normal' and proceeds"
  - "Chaos sets state.difficulty = 'chaos' and proceeds"
  - "Test modes reach level select after difficulty choice"
  - "Menu overlay renders correctly for difficulty submenu"
  - "GameManager test confirms full flow: start -> difficulty -> playing"
created_at: '2026-02-17'
updated_at: '2026-02-17'
---

## Context

After selecting a game mode (1P/2P/Test/2P-Test), the player should see a submenu offering Normal and Chaos before the game starts.

## Plan

1. Add `'difficulty'` to `MenuState.type` union in `src/types.ts`
2. Add `pendingMode?: string` to `MenuState.data` to remember selected mode
3. In `src/engine/GameManager.ts` `updateMenu()`:
   - Modify start menu confirm handler: instead of directly starting game, transition to difficulty submenu with `pendingMode` stored
   - Add new `if (state.menu.type === 'difficulty')` block: handle back (→ start), handle confirm (→ set difficulty, start game or level select based on pendingMode)
4. In `src/renderer/MenuOverlay.ts`: render difficulty menu — title "SELECT DIFFICULTY", option list, ESC instruction

## Notes

- The difficulty submenu is a thin pass-through — it just sets `state.difficulty` then continues the existing flow
- Test modes go: start → difficulty → level select
- Normal modes go: start → difficulty → playing
