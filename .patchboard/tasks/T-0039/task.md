---
id: T-0039
title: "Constants and type extensions for Enemy D/E and plasma"
type: task
status: done
priority: P1
owner: engineer
labels:
- engine
- types
depends_on: []
parent_epic: E-0005
acceptance:
- ENEMY_D_HEALTH (75), ENEMY_D_SCORE_VALUE (250), ENEMY_D_COLLISION_RADIUS (14) constants added
- ENEMY_E_HEALTH (150), ENEMY_E_SCORE_VALUE (300), ENEMY_E_COLLISION_RADIUS (18) constants added
- PLASMA_SPEED (180), PLASMA_DAMAGE (75), PLASMA_MAX_LIFETIME (3000), PLASMA_COLLISION_RADIUS (6) constants added
- plasma and spread added to Enemy fireMode union
- Level name field added to LevelConfig
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Foundation task adding all constants and type definitions needed for the two new enemy types and plasma projectile.
