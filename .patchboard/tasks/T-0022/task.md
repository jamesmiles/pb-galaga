---
id: T-0022
title: "Implement two-player co-op mode"
type: task
status: todo
priority: P1
owner: null
labels:
  - gameplay
  - multiplayer
depends_on: [T-0018]
parallel_with: [T-0020, T-0021]
parent_epic: E-0002
acceptance:
  - Player 2 blue ship implemented alongside Player 1 red ship
  - Player 2 controls work (WASD for movement, Q for fire)
  - Both players can play simultaneously with independent input
  - Players cannot damage each other (no friendly collision)
  - Separate score tracking for each player
  - Separate lives (3 each) for each player
  - Game over when both players have 0 lives
  - Start menu updated with "2 Player" option
  - GameScene renders both ships and dual score/lives HUD
  - Unit tests verify dual input, independent lives/scores, gameover condition
created_at: '2026-02-14'
updated_at: '2026-02-14'
---

## Context

Two-player co-op transforms the game from a solo experience into a social one. Players cooperate to clear waves together, each with independent controls, lives, and scores. The data model already supports two players (player1/player2 with red/blue colors).

**Data Model**: Player interface supports `id: 'player1' | 'player2'`, `color: 'red' | 'blue'`.
**Architecture**: GameMode supports `'single' | 'co-op'`.

## Plan

### Phase 1: Input Handling
1. Extend `src/engine/InputHandler.ts`:
   - Add Player 2 key bindings: W/A/S/D for movement, Q for fire
   - New method: `getPlayer2Input(): PlayerInput`
   - Both players' inputs processed independently
   - Prevent key conflicts (W/Up both shouldn't move P1)
2. Add input tests for dual controls

### Phase 2: Game State
1. Update `src/engine/GameManager.ts`:
   - Add "2 Player" option to start menu via `src/engine/menus/StartMenu.ts`
   - When co-op selected, initialize state with 2 players
   - Player 2: id 'player2', color 'blue', starting position offset right
   - Update `updatePlaying()` to process both players' input
2. Update collision detection to skip player-player collisions

### Phase 3: Player 2 Rendering
1. Add blue ship sprite to `src/renderer/SpriteManager.ts`:
   - Same shape as red ship but blue color scheme
   - Register as 'player-ship-blue' texture
2. Update `src/renderer/scenes/GameScene.ts`:
   - Select player sprite based on player color/id
   - Render both players simultaneously

### Phase 4: Dual HUD
1. Update `src/renderer/scenes/GameScene.ts` UI:
   - P1 score/lives: top-right (existing position)
   - P2 score/lives: top-right below P1, or left side
   - Color-coded labels (P1 red, P2 blue)
   - When a player is dead (0 lives), show "P2: DEAD" or dim
2. Update game over screen to show both scores

### Phase 5: Gameover Logic
1. Update gameover condition in `GameManager`:
   - Single player: gameover when player1 has 0 lives
   - Co-op: gameover when ALL players have 0 lives
   - Player with 0 lives stays dead, other continues
   - Game over screen shows both scores
2. Add co-op gameover tests

### Phase 6: Tests
1. Dual input processing (arrow keys + WASD simultaneously)
2. Independent lives (P1 dies, P2 still plays)
3. Independent scores
4. No player-player collision damage
5. Both players fire independently
6. Gameover requires all players dead
7. Start menu 1P/2P selection

## Files to Modify
- `src/engine/InputHandler.ts` (P2 controls)
- `src/engine/GameManager.ts` (co-op init, dual update, gameover)
- `src/engine/menus/StartMenu.ts` (2P option)
- `src/engine/CollisionDetector.ts` (skip player-player)
- `src/renderer/SpriteManager.ts` (blue ship sprite)
- `src/renderer/scenes/GameScene.ts` (dual rendering, dual HUD)

## Notes

- Players should start at different X positions (P1 center-left, P2 center-right)
- Both players share the same screen — no split screen
- Enemy projectiles can hit either player
- Each player's lasers are distinct (use owner field for scoring)
- Future: player revival mechanics, team combos
