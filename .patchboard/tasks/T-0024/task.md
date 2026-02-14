---
id: T-0024
title: "Implement level complete sequence"
type: task
status: review
priority: P1
owner: engineer
labels:
  - ui
  - menu
  - gameplay
depends_on: [T-0023]
parallel_with: []
parent_epic: E-0002
acceptance:
  - '"WAVE COMPLETE" text displays between waves with score bonus'
  - 3-second pause before next wave spawns
  - '"LEVEL COMPLETE" displays after final wave (wave 5)'
  - Level complete screen shows total score
  - Options to return to menu after level complete
  - State transition from playing → levelcomplete works
  - GameScene renders wave complete and level complete overlays
  - Unit tests verify status transitions, timing, and score bonus
created_at: '2026-02-14'
updated_at: '2026-02-14'
---

## Context

Wave and level completion sequences provide closure and reward. Between waves, a brief "WAVE COMPLETE" message with a score bonus gives the player positive feedback. After the final wave, a "LEVEL COMPLETE" screen celebrates their achievement.

**Data Model**: GameStatus already includes 'levelcomplete'.

## Plan

### Phase 1: Wave Complete Overlay
1. Add wave complete handling to `src/engine/GameManager.ts`:
   - When LevelManager signals wave complete (not final wave):
     a. Display "WAVE COMPLETE" overlay (cosmetic, not a full state change)
     b. Award score bonus (e.g., 500 points per wave)
     c. 3-second timer before next wave spawns
   - Game stays in 'playing' status during wave transitions
2. Track wave transition state

### Phase 2: Level Complete State
1. Add level complete handling:
   - When LevelManager signals final wave complete:
     a. Transition gameStatus to 'levelcomplete'
     b. Show "LEVEL COMPLETE" screen
     c. Display total score, enemies destroyed
     d. Menu options: "Main Menu" (future: "Next Level")
   - Create level complete menu in `src/engine/menus/`
2. Wire state transitions in GameManager

### Phase 3: Rendering
1. Update `src/renderer/scenes/GameScene.ts`:
   - Wave complete overlay: centered text "WAVE COMPLETE", score bonus text
   - Fade in/out during 3-second pause
   - Level complete screen: large "LEVEL COMPLETE" text, total score, menu options
   - Reuse menu rendering pattern from start/gameover menus

### Phase 4: Score Bonus
1. Implement wave completion bonus:
   - Base bonus: 500 points per wave cleared
   - Optional: time bonus, accuracy bonus (keep simple for now)
   - Award to all alive players
   - Display bonus amount in wave complete overlay

### Phase 5: Tests
1. Wave complete triggers at correct time
2. Score bonus awarded correctly
3. 3-second pause before next wave
4. Level complete triggers after final wave
5. State transitions work correctly
6. Menu options functional on level complete screen

## Files to Modify
- `src/engine/GameManager.ts` (wave/level complete logic)
- `src/renderer/scenes/GameScene.ts` (overlays and level complete screen)
- `src/engine/menus/` (level complete menu if needed)

## Notes

- Wave complete is a brief overlay during 'playing' status, not a full menu
- Level complete IS a full status change to 'levelcomplete'
- Keep score bonuses simple for Sprint 2 — can add complexity later
- The 3-second inter-wave pause is also used by T-0023's wave transition timer
- Future: "Next Level" option when Level 2 exists
