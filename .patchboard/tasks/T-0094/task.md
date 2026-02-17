---
id: T-0094
title: "Display complete keybindings on start menu screen"
type: task
status: todo
priority: P2
owner: null
labels: [menu, ui]
depends_on: [T-0091]
parallel_with: [T-0092, T-0095, T-0096]
parent_epic: E-0009
acceptance:
  - "Start menu shows all P1 controls (Arrows, Space, NumLock auto-fire)"
  - "Start menu shows all P2 controls (WASD, Q, CapsLock auto-fire)"
  - "Start menu shows general controls (ESC pause, M mute, Enter select)"
  - "Controls display is compact and visually organized"
  - "Existing menu functionality unchanged"
created_at: '2026-02-17'
updated_at: '2026-02-17'
---

## Context

The current start menu only shows "Arrow Keys: Move Ship" and "Spacebar: Fire Laser". Players have no way to discover P2 controls, mute, pause, or auto-fire toggles.

## Plan

1. In `src/renderer/MenuOverlay.ts`, update the start menu HTML in `buildMenu()`:
   - Replace the current 2-line control hint with organized sections:
     ```
     — P1 CONTROLS —           — P2 CONTROLS —
     Arrows: Move               WASD: Move
     Space: Fire                 Q: Fire
     NumLock: Auto-fire          CapsLock: Auto-fire

     ESC: Pause  |  M: Mute  |  Enter: Select
     ```
   - Use existing CSS classes, add section headers with distinct color (e.g., `#aaaaaa`)
   - Keep compact to not push menu options off-screen

## Notes

- Visual-only change — no game logic or automated tests needed
- Verify via super harness that layout looks good on the game's 800x800 canvas
