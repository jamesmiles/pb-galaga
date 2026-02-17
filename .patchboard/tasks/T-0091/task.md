---
id: T-0091
title: "Add auto-fire toggle (NumLock for P1, CapsLock for P2)"
type: task
status: todo
priority: P1
owner: null
labels: [engine, input]
depends_on: []
parallel_with: [T-0089, T-0090, T-0097]
parent_epic: E-0009
acceptance:
  - "Pressing NumLock toggles P1 auto-fire on/off"
  - "Pressing CapsLock toggles P2 auto-fire on/off"
  - "Auto-fire is OR'd with manual fire (holding Space/Q still works)"
  - "getAutoFireState() returns { p1: boolean, p2: boolean }"
  - "clearAll() resets both auto-fire flags"
  - "injectAutoFire() method for headless testing"
  - "Unit tests for toggle on/off and fire override"
created_at: '2026-02-17'
updated_at: '2026-02-17'
---

## Context

Players currently must hold Space (P1) or Q (P2) to fire continuously. Auto-fire lets them press a toggle key once to enable continuous fire without holding.

## Plan

1. In `src/engine/InputHandler.ts`:
   - Add `NumLock` and `CapsLock` to `GAME_KEYS` set
   - Add `private p1AutoFire = false` and `p2AutoFire = false`
   - In `handleKeyDown`: detect NumLock → toggle `p1AutoFire`, CapsLock → toggle `p2AutoFire`, `preventDefault()` to suppress OS behavior, return early (don't add to keyState)
   - In `getPlayerInput()`: `fire: this.p1AutoFire || !!this.keyState['Space']`
   - In `getPlayer2Input()`: `fire: this.p2AutoFire || !!this.keyState['KeyQ']`
   - Add `getAutoFireState(): { p1: boolean, p2: boolean }`
   - Add `injectAutoFire(player: 'p1' | 'p2', enabled: boolean)` for tests
   - Reset both flags in `clearAll()`

## Notes

- CapsLock/NumLock generate keydown events in most browsers — toggle on keydown only
- The toggle state lives entirely in InputHandler, not in GameState (GameState sync is T-0099)
