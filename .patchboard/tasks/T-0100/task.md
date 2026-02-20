---
id: T-0100
title: "Process dust cloud sprite sheets into individual PNGs"
type: task
status: done
priority: P1
owner: engineer
labels: [assets, sprites]
depends_on: []
parallel_with: []
parent_epic: E-0010
acceptance:
  - "2x2 sprite sheets from tmp/ split into individual PNGs"
  - "5 dust/swirl sprites saved to src/backgrounds/ as dust-cloud-*.png and dust-swirl-*.png"
  - "Sprites importable by Vite as asset URLs"
created_at: '2026-02-20'
updated_at: '2026-02-20'
---

## Context

Dust cloud sprite sheets were generated as 2x2 grids in /tmp/. They needed to be split into individual sprites for use in the DustCloudManager foreground overlay system.

## What was done

Used Python Pillow to split 2x2 sprite sheets into individual PNGs:
- `dust-cloud-1.png` through `dust-cloud-3.png`
- `dust-swirl-1.png` through `dust-swirl-2.png`

Saved to `src/backgrounds/` alongside existing background assets. Additional sprites (cloud-*, rocks-*, mars-surface.png) were also processed but only dust/swirl sprites are used by the DustCloudManager.
