---
id: T-0042
title: "Plasma projectile factory"
type: task
status: done
priority: P1
owner: engineer
labels:
- projectiles
depends_on:
- T-0039
parent_epic: E-0005
acceptance:
- Plasma.ts created in src/objects/projectiles/plasma/code/
- createPlasma(position, owner) factory function
- Speed 180 px/s, damage 75, max lifetime 3000ms, collision radius 6
- Fires downward from enemy position
- ~8 unit tests in Plasma.test.ts
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

The plasma projectile is a slow but high-damage projectile fired by Enemy Type D. Its large size and high damage make it a significant threat.
