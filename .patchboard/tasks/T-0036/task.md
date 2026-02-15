---
id: T-0036
title: "Collision impact flash rendering"
type: task
status: done
priority: P1
owner: engineer
labels:
- renderer
- effects
depends_on:
- T-0032
parent_epic: E-0004
acceptance:
- Projectile impacts detected via hasCollided flag in renderer
- Localized impact flashes emitted at collision points
- Collision IDs tracked to prevent duplicate flash emissions
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Complementary to the explosion flashes (T-0032), impact flashes provide visual feedback at the exact point where projectiles hit targets.

## What was delivered

Added localized impact flash rendering at collision points, detected via the hasCollided flag in the renderer. Collision IDs are tracked to prevent duplicate flash emissions for the same collision event.
