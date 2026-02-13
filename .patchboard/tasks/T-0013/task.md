---
id: T-0013
title: "Implement two player co-op with blue ship"
type: task
status: todo
priority: P1
owner: null
labels:
  - gameplay
  - multiplayer
depends_on: [E-0001]
parallel_with: []
parent_epic: E-0002
acceptance:
  - Blue ship (player 2) implemented alongside red ship
  - Player 2 controls work (WASD for movement, Q for fire)
  - Both players can play simultaneously
  - Player collision does not cause damage
  - Separate score tracking for each player
  - Lives system works for both players (separate or shared)
  - Game over when both players have no lives
  - Start menu updated with player 2 controls
  - Renderer displays both ships correctly
  - Test harness supports two player testing
created_at: '2026-02-13'
updated_at: '2026-02-13'
---

## Context

Two player co-op mode is a core feature that significantly enhances gameplay. Players 1 and 2 cooperate to clear waves together.

**Data Model**: Player Schema supports both player1 and player2  
**Architecture**: Multiplayer Ready principle

## Plan

### Phase 1: Player 2 State
1. Extend game state to support two players:
   - Add player2 to players array
   - Initialize blue ship for player 2
   - Set player2 controls (WASD + Q)
2. Update StateManager for two players
3. Add unit tests

### Phase 2: Input Handling
1. Extend InputHandler for two players:
   - Player 1: Arrow keys + Spacebar
   - Player 2: WASD + Q
   - Simultaneous input support
   - Independent input processing
2. Add input tests

### Phase 3: Co-op Mechanics
1. Implement co-op rules:
   - Players cannot damage each other
   - Player-player collision: no damage
   - Separate or shared lives (design decision)
   - Separate score tracking
   - Game over: both players at 0 lives
2. Update collision detection
3. Add co-op tests

### Phase 4: UI Updates
1. Update start menu:
   - Show player 1 and player 2 controls
   - Mode selection (1P / 2P) or auto-detect
2. Update in-game UI:
   - P1 lives and score (left side)
   - P2 lives and score (right side)
3. Update game over to show both scores

### Phase 5: Rendering
1. Update renderer for two ships:
   - Blue ship sprite for player 2
   - Both ships visible simultaneously
   - Separate visual indicators (colors)
2. Add player 2 to test harnesses

## Notes

**Lives System Decision**:
- Option A: Shared lives pool (3 total)
- Option B: Separate lives (3 each)
- Recommendation: Separate for fairness

**Score System**:
- Individual scores preferred
- Shows final scores on game over
- Friendly competition

**Design Considerations**:
- Players should stay on screen together
- Prevent players from blocking each other
- Consider friendly fire (off for co-op)

**Future Enhancements**:
- Player revival mechanics
- Team score/combo bonuses
- Special two-player abilities
