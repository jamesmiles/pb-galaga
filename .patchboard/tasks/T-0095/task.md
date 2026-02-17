---
id: T-0095
title: "Add post-level and end-of-game stats summary screen"
type: task
status: todo
priority: P2
owner: null
labels: [menu, stats, renderer]
depends_on: [T-0089]
parallel_with: [T-0092, T-0094, T-0096]
parent_epic: E-0009
acceptance:
  - "Stats screen appears between levels showing per-player level stats"
  - "Stats shown: kills, deaths, powerups collected, respawns"
  - "In co-op, both players' stats shown side by side"
  - "Stats screen advances on Enter/Space press or 5s timeout"
  - "Game complete screen includes cumulative game stats"
  - "levelStats reset after being captured for display"
  - "GameManager tests verify flow: playing -> levelcomplete -> levelstats -> levelintro"
created_at: '2026-02-17'
updated_at: '2026-02-17'
---

## Context

After completing a level, players should see a stats summary showing their performance before the next level begins. At game end, cumulative stats are shown.

## Plan

1. Add `'levelstats'` to `MenuState.type` and `GameStatus` unions in `src/types.ts`
2. Extend `MenuState.data` with `p1LevelStats?`, `p2LevelStats?`, `p1GameStats?`, `p2GameStats?` (all `PlayerStats`)
3. In `src/engine/GameManager.ts`:
   - Modify `updateLevelComplete()`: after 3s timer, transition to `gameStatus: 'levelstats'` with `menu.type: 'levelstats'`, capturing each player's `levelStats` into `menu.data`
   - Add `updateLevelStats()`: check for confirm input or 5s timeout → reset `levelStats` → start next level intro
4. Modify game complete screen to include cumulative `stats` in menu data
5. In `src/renderer/MenuOverlay.ts`:
   - New `'levelstats'` render: "LEVEL X STATS" title (green), per-player stat rows, "Press ENTER to continue" prompt
   - Co-op: side-by-side layout
   - Update `'gamecomplete'` to include cumulative stats display

**Flow change:**
```
Before: levelcomplete (3s) -> levelintro
After:  levelcomplete (3s) -> levelstats (Enter or 5s) -> levelintro
```

## Notes

- The stats screen is a brief pause for feedback — the 5s timeout prevents it from blocking progression
- In single player, only P1 stats are shown (no P2 column)
