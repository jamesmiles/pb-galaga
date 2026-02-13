---
id: T-0018
title: "Implement level complete sequence"
type: task
status: todo
priority: P1
owner: null
labels:
  - ui
  - menu
depends_on: [T-0017]
parallel_with: []
parent_epic: E-0002
acceptance:
  - Level complete sequence triggers after all waves cleared
  - Level complete screen displays congratulations
  - Shows final scores for all players
  - Shows level statistics (enemies destroyed, accuracy, etc.)
  - Options to continue to next level (future) or return to menu
  - State transition from playing to levelcomplete works
  - Level complete integrates with game flow
  - Renderer displays level complete screen
  - Unit tests verify level complete detection
created_at: '2026-02-13'
updated_at: '2026-02-13'
---

## Context

The level complete sequence provides closure and reward for completing all waves. It's a critical part of the game flow and player satisfaction.

**Data Model**: MenuState with type: 'levelcomplete'  
**Architecture**: Game Status includes 'levelcomplete' state

## Plan

### Phase 1: Level Complete Detection
1. Extend LevelManager:
   - Detect when all waves complete
   - Trigger level complete state
   - Calculate level statistics
   - Prepare completion data
2. Add level completion logic
3. Add unit tests

### Phase 2: Level Complete Menu
1. Create `src/engine/menus/LevelCompleteMenu.ts`:
   - Extends MenuBase
   - Display "LEVEL COMPLETE!"
   - Show level number
   - Show player scores
   - Show statistics:
     - Total enemies destroyed
     - Accuracy (optional)
     - Time to complete (optional)
   - Options: "Next Level", "Main Menu"
2. Add menu state management

### Phase 3: State Transitions
1. Implement level complete transitions:
   - playing → levelcomplete (all waves done)
   - levelcomplete → menu (main menu selected)
   - levelcomplete → playing (next level - future)
2. Wire transitions in GameManager
3. Add transition tests

### Phase 4: Statistics Tracking
1. Implement statistics collection:
   - Track enemies destroyed per wave
   - Track total enemies destroyed
   - Track shots fired vs hits (accuracy)
   - Track time taken
   - Store in level complete data
2. Add statistics calculation
3. Add unit tests

### Phase 5: Rendering
1. Update renderer for level complete:
   - Level complete screen layout
   - Statistics display
   - Player score display
   - Menu options
   - Visual celebration (future: confetti, effects)
2. Test visual appearance

## Notes

**Level Complete Flow**:
1. Final enemy destroyed
2. Brief delay (~1 second)
3. Transition to level complete screen
4. Display statistics
5. Wait for player input
6. Transition to menu or next level

**Statistics Display**:
- Keep it simple for Sprint 2
- Focus on scores and enemies destroyed
- Detailed stats can be added later
- Consider A/B/C letter grades (future)

**Future Enhancements**:
- Level 2+ progression
- Bonus points for fast completion
- Perfect clear bonuses
- Ranking system
- Replay level option
- Statistics persistence

**Visual Polish**:
- Victory animation
- Confetti or particle effects
- Victory music/sound
- Smooth transitions
