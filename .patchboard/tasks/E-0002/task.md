---
id: E-0002
title: "Implement Sprint 2 - Two Player and Content Expansion"
type: epic
status: todo
priority: P1
owner: null
labels:
  - epic
  - sprint-2
depends_on: [E-0001]
children: [T-0013, T-0014, T-0015, T-0016, T-0017, T-0018]
acceptance:
  - Two player co-op mode functional with blue ship
  - Player 2 has separate controls (WASD + Q for fire)
  - Enemy Type B implemented with laser projectiles
  - Enemy Type C implemented with bullet projectiles
  - Bullet projectile system implemented
  - Level 1 expanded with multiple enemy waves
  - Wave sequence works (Type A → Type B → A+B → Type C → A+C)
  - Level complete sequence displays after all waves cleared
  - Both players can play through full level cooperatively
created_at: '2026-02-13'
updated_at: '2026-02-13'
---

## Context

Sprint 2 builds on Sprint 1's foundation by adding cooperative multiplayer gameplay and expanding enemy variety. This transforms the game from a single-player proof-of-concept into a richer, more engaging experience.

**Architecture Reference**: `.patchboard/docs/design-architecture/core/architecture.md`  
**Sprint 2 Requirements**: Architecture document Sprint 2 section

## Scope

This epic delivers multiplayer support and content expansion:

1. **Two Player Support** (T-0013) - Blue ship, player 2 controls, co-op mechanics
2. **Bullet Projectile** (T-0014) - New projectile type for Enemy Type C
3. **Enemy Type B** (T-0015) - Slow fighter with laser projectile
4. **Enemy Type C** (T-0016) - Mobile fighter with bullet projectile
5. **Level 1 Expansion** (T-0017) - Multiple waves with enemy variety
6. **Level Complete** (T-0018) - Level completion sequence and transition

Each component extends existing systems and maintains architectural consistency.

## Out of scope

Items deferred to future sprints:
- Power-ups (health, shield, firepower, stealth)
- Additional levels (Level 2+)
- Boss enemies
- Pause menu
- High score persistence
- Sound effects and music
- Advanced enemy behaviors
- Combo scoring system
- Player revival mechanics

## Notes

**Implementation Approach**:
- Leverage Sprint 1 architecture
- Extend existing systems, don't rebuild
- Maintain test-first methodology
- All new features must have test harnesses
- Headless testing remains critical

**Co-op Design Considerations**:
- Shared lives vs separate lives
- Score sharing vs competition
- Collision between players (should not damage)
- Screen positioning (both visible)
- Revival mechanics (future)

**Enemy Variety**:
- Type B: Slower, more health, laser attacks
- Type C: Faster, less health, bullet spray
- Mix of enemy types creates dynamic gameplay
- Balance difficulty curve

**Wave Design**:
- Progressive difficulty
- Teaches player new enemy types
- Mixed waves more challenging
- Final wave should feel climactic
