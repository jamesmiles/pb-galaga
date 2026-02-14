---
id: T-0019
title: "Implement ZzFX sound effects"
type: task
status: todo
priority: P1
owner: null
labels:
  - audio
  - gameplay
depends_on: [T-0013]
parallel_with: [T-0017, T-0018]
parent_epic: E-0002
acceptance:
  - ZzFX library vendored into src/audio/zzfx.ts (MIT license, <1KB)
  - SoundManager created in src/audio/SoundManager.ts
  - Sound effects play for player fire (pew), enemy fire (lower pew), explosion (boom)
  - Sound effect plays for player death (longer explosion)
  - Sound effect plays for menu select (blip)
  - Mute toggle works via M key
  - Mute state stored in game state and persisted across game restarts
  - SoundManager API tested with mocked ZzFX (headless-safe)
  - No npm dependencies added (ZzFX vendored as source)
created_at: '2026-02-14'
updated_at: '2026-02-14'
---

## Context

Sound effects bring the game to life. ZzFX is a tiny (<1KB) procedural audio library that generates 8-bit sound effects from parameter arrays — no audio files needed. It works with the file:// protocol and has zero dependencies, making it ideal for this project.

**ZzFX**: https://github.com/KilledByAPixel/ZzFX (MIT license)

## Plan

### Phase 1: Vendor ZzFX
1. Create `src/audio/zzfx.ts`:
   - Copy ZzFX source (~800 bytes minified)
   - Export the `zzfx()` function and `ZZFX` object
   - Add TypeScript types for the parameter array
   - Ensure it works as an ES module import

### Phase 2: SoundManager
1. Create `src/audio/SoundManager.ts`:
   - Singleton class with static methods
   - `SoundManager.init()` — initialize AudioContext (lazy, on first user interaction)
   - `SoundManager.play(effect: SoundEffect)` — play a named effect
   - `SoundManager.setMuted(muted: boolean)` — toggle mute
   - `SoundManager.isMuted()` — query mute state
2. Define `SoundEffect` enum/type: 'playerFire', 'enemyFire', 'explosion', 'playerDeath', 'menuSelect'
3. Create ZzFX parameter presets for each effect:
   - playerFire: short high-pitched pew
   - enemyFire: short lower-pitched pew
   - explosion: medium boom with decay
   - playerDeath: long dramatic explosion
   - menuSelect: quick blip/chirp

### Phase 3: Integration
1. Wire into `src/engine/GameManager.ts`:
   - Call `SoundManager.play('playerFire')` when player fires
   - Call `SoundManager.play('enemyFire')` when enemy fires
   - Call `SoundManager.play('explosion')` when enemy destroyed
   - Call `SoundManager.play('playerDeath')` when player dies
   - Call `SoundManager.play('menuSelect')` on menu selection
2. Add M key to `InputHandler` for mute toggle
3. Store mute state in GameState (or separate audio state)

### Phase 4: Tests
1. SoundManager.play() calls zzfx with correct params (mock zzfx)
2. Mute toggle prevents zzfx calls
3. All effect presets are valid (no undefined params)
4. Init is idempotent

## Files to Create
- `src/audio/zzfx.ts`
- `src/audio/SoundManager.ts`

## Files to Modify
- `src/engine/GameManager.ts` (wire sound calls)
- `src/engine/InputHandler.ts` (M key for mute)

## Notes

- ZzFX uses WebAudio API — AudioContext must be created after user interaction (browser policy)
- In headless tests, mock the zzfx function to avoid AudioContext errors
- ZzFX parameter arrays are 20-element number arrays — each element controls a sound property
- Sound presets can be designed using the ZzFX sound designer tool
- Keep mute state so users who want silence don't get surprised on restart
