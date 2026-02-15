---
id: T-0032
title: "Explosion light flash effects"
type: task
status: done
priority: P1
owner: engineer
labels:
- renderer
- effects
depends_on: []
parent_epic: E-0004
acceptance:
- Flash interface added to ParticleSystem
- Screen-wide additive flashes on enemy death (100ms duration)
- globalCompositeOperation lighter used for additive blending
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Added brief screen-wide light flashes on enemy destruction for visual impact, using Canvas 2D additive blending.

## What was delivered

Added a Flash interface to ParticleSystem with screen-wide additive flashes triggered on enemy death (100ms duration). Uses globalCompositeOperation set to "lighter" for additive blending to create a brief, dramatic light burst effect.
