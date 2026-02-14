---
id: T-0013
title: Resize game canvas from 800x600 to 800x900
type: task
status: done
priority: P1
owner: engineer
labels:
- infrastructure
- rendering
depends_on:
- E-0001
parallel_with: []
parent_epic: E-0002
acceptance:
- GAME_HEIGHT constant updated from 600 to 900
- Phaser canvas renders at 800x900
- Player starting Y position adjusted for taller canvas
- Formation standoff distance adjusted (enemies stay in upper portion)
- Menu layouts adjusted for new height (title, options, version)
- Background star generation uses new bounds
- All existing tests pass with updated height references
- Playwright visual tests pass at new resolution
- Game remains centered horizontally in browser
created_at: '2026-02-13'
updated_at: '2026-02-14'
---

## Context

The current 800x600 canvas doesn't use vertical real-estate well, even on smaller laptop screens like a MacBook Pro. Increasing height to 900 gives more play area and better proportions for the shoot-em-up genre.

This is the first Sprint 2 task because all subsequent tasks build on the new dimensions.

## Plan

### Phase 1: Constants and Config
1. Update `src/engine/constants.ts`:
   - Change `GAME_HEIGHT` from 600 to 900
   - Adjust `FORMATION_STANDOFF_Y` if defined (enemies should stay in upper ~60% of screen)
   - Adjust player start Y position constant
2. Update `src/renderer/PhaserRenderer.ts` Phaser config height

### Phase 2: Game Object Adjustments
1. Update `src/objects/player/code/PlayerShip.ts`:
   - Adjust default spawn Y position (was near bottom of 600, now near bottom of 900)
2. Update `src/objects/environment/Background.ts`:
   - Star generation bounds use new GAME_HEIGHT
   - Wrapping logic uses new height
3. Update formation standoff in `src/engine/FormationManager.ts` if hardcoded

### Phase 3: Renderer Adjustments
1. Update `src/renderer/scenes/GameScene.ts`:
   - Menu layout positions (title, subtitle, controls, options, version)
   - Adjust any hardcoded Y positions
2. Verify canvas centering CSS still works in `src/index.html`

### Phase 4: Test Fixes
1. Find and fix all tests with hardcoded 600 references
2. Run full test suite: `npm run test`
3. Update Playwright visual tests if needed
4. Verify screenshots look correct at 900px height

## Files to Modify
- `src/engine/constants.ts`
- `src/renderer/PhaserRenderer.ts`
- `src/objects/player/code/PlayerShip.ts`
- `src/objects/environment/Background.ts`
- `src/engine/FormationManager.ts`
- `src/renderer/scenes/GameScene.ts`
- Various test files with hardcoded 600 references

## Notes

- 800x900 fits well on 1080p (900px visible in browser after chrome/address bar)
- MacBook Pro viewport is ~900px tall, so this fills the screen
- Keep width at 800 — no change needed for horizontal layout
