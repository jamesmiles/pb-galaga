---
id: T-0026
title: "Types and constants extensions for flight paths and formations"
type: task
status: done
priority: P1
owner: engineer
labels:
- engine
- types
depends_on: []
parent_epic: E-0004
acceptance:
- FlightPathState interface added to types.ts (progress, controlPoints, targetSlot, speed)
- FormationType union extended with w-curve, chiral, diagonal, side-wave, m-shape, inverted-v
- flightPath optional field added to Enemy interface
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Foundation task extending the type system to support bezier-curve flight path animations and 6 new formation types for Level 2.

## What was delivered

Added FlightPathState interface to types.ts with progress, controlPoints, targetSlot, and speed fields. Extended the FormationType union with 6 new formation shapes (w-curve, chiral, diagonal, side-wave, m-shape, inverted-v). Added an optional flightPath field to the Enemy interface.
