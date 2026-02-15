---
id: T-0028
title: "FlightPathManager integration into LevelManager and GameManager"
type: task
status: done
priority: P1
owner: engineer
labels:
- engine
- integration
depends_on:
- T-0027
parent_epic: E-0004
acceptance:
- generateFlightPaths() called when spawning non-grid formations
- Flight path update step added in GameManager updatePlaying()
- Dive attacks skipped for enemies currently on flight paths
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Wired FlightPathManager into the main game loop so enemies animate along bezier curves during wave spawning before settling into formation positions.

## What was delivered

Integrated FlightPathManager into LevelManager's wave spawning (calling generateFlightPaths() for non-grid formations) and GameManager's updatePlaying() loop. Added logic to skip dive attacks for enemies currently traversing flight paths.
