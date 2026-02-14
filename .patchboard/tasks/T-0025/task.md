---
id: T-0025
title: "Implement ZzFXM background music"
type: task
status: todo
priority: P1
owner: null
labels:
  - audio
depends_on: [T-0019]
parallel_with: [T-0024]
parent_epic: E-0002
acceptance:
  - ZzFXM library vendored into src/audio/zzfxm.ts (MIT license, ~442 bytes)
  - MusicManager created in src/audio/MusicManager.ts
  - Menu theme plays on loop during start/gameover menus
  - Gameplay theme plays on loop during gameplay
  - Music switches tracks on game state transitions
  - Music respects mute toggle from T-0019
  - No npm dependencies added (ZzFXM vendored as source)
  - MusicManager API tested (mock audio in headless tests)
created_at: '2026-02-14'
updated_at: '2026-02-14'
---

## Context

Background music adds atmosphere and immersion. ZzFXM is a tiny (~442 bytes) music tracker that builds on ZzFX to play multi-channel chiptune patterns. It generates music from compact data arrays — no audio files needed.

**ZzFXM**: https://github.com/keithclark/ZzFXM (MIT license)

## Plan

### Phase 1: Vendor ZzFXM
1. Create `src/audio/zzfxm.ts`:
   - Copy ZzFXM source (~442 bytes)
   - Export the `zzfxM()` function
   - Add TypeScript types for song data format
   - Ensure it imports and uses the vendored ZzFX from `src/audio/zzfx.ts`

### Phase 2: MusicManager
1. Create `src/audio/MusicManager.ts`:
   - `MusicManager.init()` — initialize (shares AudioContext with SoundManager)
   - `MusicManager.play(track: MusicTrack)` — play a track on loop
   - `MusicManager.stop()` — stop current track
   - `MusicManager.setMuted(muted: boolean)` — sync with SoundManager mute
2. Define `MusicTrack` type: 'menu' | 'gameplay'

### Phase 3: Music Composition
1. Create music data for two tracks:
   - **Menu theme**: Slower, atmospheric chiptune loop (4-8 bars)
   - **Gameplay theme**: Faster, energetic chiptune loop (8-16 bars)
   - Use ZzFXM song format (instrument definitions + pattern data)
   - Can use the ZzFXM tracker tool to compose, or hand-code simple patterns
2. Store song data in `src/audio/tracks/` or inline in MusicManager

### Phase 4: Integration
1. Wire into `src/engine/GameManager.ts`:
   - On state transition to 'menu': play menu track
   - On state transition to 'playing': play gameplay track
   - On state transition to 'gameover': play menu track (or silence)
   - On state transition to 'levelcomplete': stop music or play victory jingle
2. Share mute state with SoundManager (M key toggles both)

### Phase 5: Tests
1. MusicManager.play() starts correct track
2. MusicManager.stop() stops playback
3. Track switching on state transitions
4. Mute toggle stops music
5. Init is idempotent

## Files to Create
- `src/audio/zzfxm.ts`
- `src/audio/MusicManager.ts`

## Files to Modify
- `src/engine/GameManager.ts` (wire music state transitions)

## Notes

- ZzFXM song data is very compact — entire songs fit in a few hundred bytes
- Music should not overpower sound effects — keep volume balanced
- AudioContext sharing between SoundManager and MusicManager avoids browser limits
- The ZzFXM tracker (web tool) can be used to compose and export song data
- If composing music is too complex, start with a very simple 4-bar loop and iterate
- Consider adding volume control in the future (separate from mute)
