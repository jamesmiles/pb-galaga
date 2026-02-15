---
id: T-0035
title: "Level progression — level complete to next level"
type: task
status: done
priority: P1
owner: engineer
labels:
- engine
- gameplay
depends_on:
- T-0029
parent_epic: E-0004
acceptance:
- Next Level option on level complete screen
- Level transition maintains player scores and lives
- Enemies, projectiles cleared on transition
- Firing and dive managers reset on level change
created_at: '2026-02-15'
updated_at: '2026-02-15'
---

## Context

Enabled multi-level gameplay by wiring up level transitions that preserve player state while resetting the battlefield.

## What was delivered

Added a Next Level option on the level complete screen with level transitions that maintain player scores and lives. On transition, enemies and projectiles are cleared, and firing and dive managers are reset for the new level.
