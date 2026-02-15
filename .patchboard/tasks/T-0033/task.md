---
id: T-0033
title: "Projectile trail afterimage effects"
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
- 3-4 fading afterimage segments drawn behind each projectile
- Trail positions computed from velocity direction with configurable TRAIL_SPACING
- Additive blending (cyan for lasers, yellow/orange for bullets)
- Trail segments shrink and fade with distance
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Projectile trails add visual motion cues and enhance the neon aesthetic, making the battlefield more readable and visually appealing.

## What was delivered

Implemented 3-4 fading afterimage segments drawn behind each projectile, with trail positions computed from velocity direction using configurable TRAIL_SPACING. Uses additive blending with cyan for player lasers and yellow/orange for enemy bullets. Trail segments progressively shrink and fade with distance from the projectile.
