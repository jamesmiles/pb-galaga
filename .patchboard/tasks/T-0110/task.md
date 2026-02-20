---
id: T-0110
title: "GameManager integration, audio, version bump v0.10.0"
type: task
status: done
priority: P1
owner: engineer
labels: [engine, audio, release]
depends_on: [T-0103, T-0104, T-0105, T-0106, T-0107, T-0108, T-0109]
parallel_with: []
parent_epic: E-0010
acceptance:
  - "Level 6 registered in GameManager level list"
  - "Level 6 intro text: '// 06:12 UTC\\ninitiating mars landing sequence...'"
  - "Player movementMode set to 'tank' on Level 6 start, reset to 'ship' on exit"
  - "Player Y position set to TANK_GROUND_Y during level intro for Level 6"
  - "hitH, hitI, hitJ, hitK sound effects added to SoundManager"
  - "Level 6 music track added to MusicManager (G minor, 135 BPM)"
  - "GAME_VERSION bumped to '0.10.0'"
  - "All tests pass (existing + new)"
  - "Build succeeds"
created_at: '2026-02-20'
updated_at: '2026-02-20'
---

## Context

Final integration task: wire Level 6 into the game lifecycle, add audio, bump version, and verify everything works end-to-end.

## What was done

1. `src/engine/GameManager.ts` — Imported level6, registered in level list, added intro text, tank mode transitions in updateLevelIntro() (sets movementMode and Y position based on level), updated game complete text
2. `src/audio/SoundManager.ts` — Added hitH, hitI, hitJ, hitK to SoundEffect type and SOUND_PRESETS
3. `src/audio/MusicManager.ts` — Added 'level6' to MusicTrack type, created LEVEL6_SONG (G minor, heavy mechanical feel, 135 BPM), registered in TRACKS
4. `src/engine/constants.ts` — GAME_VERSION bumped from '0.9.5' to '0.10.0'
5. All tests pass, build succeeds
