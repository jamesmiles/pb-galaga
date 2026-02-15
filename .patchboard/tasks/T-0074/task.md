---
id: T-0074
title: "Level 5 configuration, backgrounds, and music"
type: task
status: review
priority: P1
owner: engineer
labels: [level-5, level-config]
depends_on: [T-0066, T-0067, T-0070, T-0073]
parallel_with: []
parent_epic: E-0007
acceptance:
  - "Level 5 config with 5 waves"
  - "Wave 5 has bossSpawn: true"
  - "Mars + small moon background config"
  - "Procedural background rendering (no PNGs)"
  - "Level 5 intro text"
  - "Level 5 music track (170+ BPM)"
  - "LevelManager handles bossSpawn wave"
  - "Boss wave completion detection"
  - "~8 new tests"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Level 5 "Defeat Mars Colony" has 4 standard waves escalating through all enemy types including the new F, then a final boss wave.

## Plan

1. New `src/levels/level5.ts` — 5 waves
2. `src/levels/backgrounds.ts` — Mars + moon config
3. `src/engine/GameManager.ts` — register level5, intro text
4. `src/engine/LevelManager.ts` — bossSpawn wave handling
5. `src/audio/MusicManager.ts` — level5 track
6. New `src/levels/level5.test.ts`
