---
id: T-0047
title: "Per-level background image system"
type: task
status: done
priority: P1
owner: engineer
labels:
- renderer
- levels
depends_on: []
parent_epic: E-0005
acceptance:
- backgrounds.ts created in src/levels/ with LEVEL_BACKGROUNDS config
- BackgroundObjectConfig interface (url, x, y, scale, alpha, scrollSpeed)
- L1 starfield only, L2 Earth, L3 Moon + small moon, L4 three asteroid PNGs
- PNG assets stored in src/backgrounds/
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Each level now has distinct background imagery -- Earth for orbital defense, moons for the lunar battle, and asteroid fields for the belt approach. Configuration-driven for easy level authoring.
