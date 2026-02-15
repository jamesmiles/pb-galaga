---
id: T-0027
title: "FlightPathManager with bezier curve infrastructure"
type: task
status: done
priority: P1
owner: engineer
labels:
- engine
- animation
depends_on:
- T-0026
parent_epic: E-0004
acceptance:
- FlightPathManager created in src/engine/FlightPathManager.ts
- Cubic bezier evaluation at parametric t
- Formation-specific curve generators for each new FormationType
- updateFlightPaths() advances enemies along curves toward target formation slots
- Comprehensive unit tests (~17 tests)
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Core animation system using cubic bezier curves to create smooth, natural-looking entry animations as enemy formations assemble, replacing instant grid placement.

## What was delivered

Created FlightPathManager in src/engine/FlightPathManager.ts with cubic bezier evaluation, formation-specific curve generators for each new FormationType, and an updateFlightPaths() method that advances enemies along curves toward their target formation slots. Includes approximately 17 unit tests.
