---
id: T-0045
title: "Level 3 Moon Battle configuration"
type: task
status: done
priority: P1
owner: engineer
labels:
- levels
- gameplay
depends_on:
- T-0043
parent_epic: E-0005
acceptance:
- Level 3 created in src/levels/level3.ts with 6 waves
- Enemy D introduced in wave 2, escalates through types A-D
- Level 1 renamed to Invasion, Level 2 renamed to Earth Defence
- ~6 unit tests in level3.test.ts
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Level 3 takes place around the Moon and introduces Enemy Type D. Progressive difficulty ramps from familiar A/B enemies to challenging D-heavy formations.
