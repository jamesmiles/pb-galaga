---
id: T-0009
title: Implement start menu and game over sequences
type: task
status: done
priority: P0
owner: engineer
labels:
- ui
- menu
depends_on:
- T-0002
parallel_with: []
parent_epic: E-0001
acceptance:
- Start menu displays on game launch
- Start menu shows control information for player 1
- Start menu has "Start Game" and "Quit" options
- Menu navigation works with keyboard
- Game transitions from menu to playing state on start
- Game over sequence displays when player has 0 lives
- Game over shows final score
- Game over has "Restart" and "Main Menu" options
- State transitions work correctly (menu ↔ playing ↔ gameover)
- Menu state integrates with engine
created_at: '2026-02-13'
updated_at: '2026-02-14'
---

## Context

Menus provide game flow structure and player information. Start menu introduces controls; game over sequence provides closure and restart options.

**Data Model**: `.patchboard/docs/design-architecture/core/data-model.md` (Menu State Schema)  
**Architecture**: Menu Systems section

## Plan

### Phase 1: Menu System Base
1. Create `src/engine/menus/MenuBase.ts`:
   - Base menu class
   - Option selection (up/down navigation)
   - Option execution (enter key)
   - Menu state management
2. Create menu state interface
3. Add unit tests

### Phase 2: Start Menu
1. Create `src/engine/menus/StartMenu.ts`:
   - Extends MenuBase
   - Display game title
   - Show control instructions:
     - Arrow keys: Move ship
     - Spacebar: Fire laser
     - ESC: Pause (future)
   - Options: "Start Game", "Quit"
   - Handle start game transition
2. Add menu-to-game state transition
3. Add unit tests

### Phase 3: Game Over Menu
1. Create `src/engine/menus/GameOverMenu.ts`:
   - Extends MenuBase
   - Display "GAME OVER"
   - Show final score
   - Show high score if applicable
   - Options: "Restart", "Main Menu"
   - Handle transitions
2. Add game-over state detection in GameManager
3. Add unit tests

### Phase 4: State Transitions
1. Implement state machine in GameManager:
   - menu → playing (start selected)
   - playing → gameover (all lives lost)
   - gameover → menu (main menu selected)
   - gameover → playing (restart selected)
2. Wire menu navigation to state changes
3. Add integration tests

### Phase 5: Integration
1. Initialize game with start menu
2. Test full flow: menu → play → game over → menu
3. Verify state persistence and resets
4. Test in headless mode

## Notes

**Menu Design**:
- Simple, clean text-based initially
- Visual polish in rendering task
- Keyboard-only navigation for Sprint 1
- Gamepad support deferred

**Control Display**:
- Clear, readable instructions
- Visual key indicators desirable
- Consider animated demonstration (future)

**High Scores** (future):
- Local storage persistence
- Top 10 leaderboard
- Player name entry

**Pause Menu** (deferred):
- ESC key to pause
- Resume/quit options
- Pause state in engine
