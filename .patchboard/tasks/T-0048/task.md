---
id: T-0048
title: "Background rendering with parallax scrolling"
type: task
status: done
priority: P1
owner: engineer
labels:
- renderer
- effects
depends_on:
- T-0047
parent_epic: E-0005
acceptance:
- Canvas2DRenderer extended with loadBackgrounds() and drawBackgrounds()
- Backgrounds start off-screen and drift through viewport at configured speed
- Per-layer parallax (different scroll speeds create depth illusion)
- Alpha transparency (10-20%) keeps gameplay readable
- Delivered across v0.5.0 and v0.5.1
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Background images drift slowly through the viewport during gameplay, creating a sense of movement through space. Different scroll speeds per layer add depth.
