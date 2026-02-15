---
id: T-0043
title: "EnemyFiringManager — plasma and spread shot integration"
type: task
status: done
priority: P1
owner: engineer
labels:
- engine
- combat
depends_on:
- T-0040
- T-0041
- T-0042
parent_epic: E-0005
acceptance:
- EnemyFiringManager extended with plasma fire mode (2500ms +/-400ms rate)
- Spread shot fire mode added (4000ms +/-600ms rate)
- Spread shot spawns 4 bullets in symmetric fan pattern
- createEnemyD and createEnemyE registered in enemy factory lookup
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Extended the firing system to support the new enemy types' unique attack patterns -- plasma for Type D and spread shot for Type E.
