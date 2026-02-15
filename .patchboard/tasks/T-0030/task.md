---
id: T-0030
title: "Type-specific collision sound effects"
type: task
status: done
priority: P1
owner: engineer
labels:
- audio
depends_on: []
parent_epic: E-0004
acceptance:
- hitA sound added (crisp pop, 600Hz)
- hitB sound added (metallic crunch, 300Hz, longer sustain)
- hitC sound added (sharp crack, 500Hz, pitch slide)
- Impact sound for projectile collisions without kills
- SoundManager extended with new sound definitions
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Each enemy type now has a distinct destruction sound, making combat more satisfying and helping players distinguish between enemy types aurally.

## What was delivered

Added three type-specific destruction sounds (hitA at 600Hz crisp pop, hitB at 300Hz metallic crunch, hitC at 500Hz sharp crack with pitch slide) and an impact sound for non-lethal projectile collisions. Extended SoundManager with new sound definitions.
