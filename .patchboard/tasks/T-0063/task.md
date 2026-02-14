---
id: T-0063
title: "Add level-specific music tracks"
type: task
status: review
priority: P2
owner: engineer
labels: [sprint-6, audio, music]
depends_on: []
parallel_with: [T-0052, T-0054, T-0055, T-0056]
parent_epic: E-0006
acceptance:
  - "Existing 'gameplay' track renamed to 'level1'"
  - "'level2' track: upbeat rock, 130 BPM"
  - "'level3' track: crazy synth, 140 BPM"
  - "'level4' track: drum and bass, 165 BPM"
  - "GameManager plays 'level' + currentLevel on level start"
  - "Music switches correctly on level transitions"
  - "~4 tests pass"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Each level gets its own distinct music track to enhance the atmosphere. Level 1 keeps the existing gameplay music, levels 2-4 get new compositions in ZzFXM format.

## Plan

1. Modify `src/audio/MusicManager.ts`:
   - Rename 'gameplay' → 'level1'
   - Compose and add 3 new ZzFXM tracks (level2, level3, level4)

2. Modify `src/engine/GameManager.ts`:
   - Change `MusicManager.play('gameplay')` → `MusicManager.play('level' + state.currentLevel)`
   - Ensure music switches on level transition

3. Add ~4 tests in MusicManager.test.ts
