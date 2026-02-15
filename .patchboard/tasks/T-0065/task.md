---
id: T-0065
title: "Level end delay - clearing phase (all levels)"
type: task
status: todo
priority: P1
owner: engineer
labels: [level-5, engine]
depends_on: []
parallel_with: [T-0066, T-0067, T-0073]
parent_epic: E-0007
acceptance:
  - "'clearing' added to waveStatus union in types.ts"
  - "LEVEL_CLEAR_DELAY = 3000 in constants.ts"
  - "Final wave all-dead transitions to 'clearing', then 'complete' after delay"
  - "Mid-level waves still use 'transition' flow"
  - "Wave bonus awarded on active -> clearing transition"
  - "Player can still move during clearing phase"
  - "~5 new tests"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

All levels currently end abruptly — the moment the last enemy dies, the level complete screen appears. Players need 3-5 seconds of "clear air" to register the victory.

## Plan

1. `src/types.ts` — Add `'clearing'` to waveStatus union
2. `src/engine/constants.ts` — Add `LEVEL_CLEAR_DELAY = 3000`
3. `src/engine/LevelManager.ts` — Add clearingTimer, clearing phase logic
4. `src/engine/GameManager.ts` — Award wave bonus on active → clearing for final wave
