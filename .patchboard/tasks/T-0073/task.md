---
id: T-0073
title: "X formation flight path"
type: task
status: todo
priority: P2
owner: engineer
labels: [level-5, formation]
depends_on: []
parallel_with: [T-0065, T-0066, T-0067]
parent_epic: E-0007
acceptance:
  - "'x-formation' added to FormationType union"
  - "generateXFormationPaths() implemented in FlightPathManager"
  - "Enemies enter from top-left and top-right, crossing to form X"
  - "~4 new tests"
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Level 5 needs a new wave formation type where enemies fly in crossing diagonal paths forming an X shape.

## Plan

1. `src/types.ts` — 'x-formation' in FormationType
2. `src/engine/FlightPathManager.ts` — generateXFormationPaths()
3. Tests for path generation
