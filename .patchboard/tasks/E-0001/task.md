---
id: E-0001
title: "Implement Sprint 1 - Core Game Engine and Single Player"
type: epic
status: todo
priority: P0
owner: null
labels:
  - epic
  - sprint-1
depends_on: []
children: [T-0001, T-0002, T-0003, T-0004, T-0005, T-0006, T-0007, T-0008, T-0009, T-0010, T-0011, T-0012]
acceptance:
  - Core game engine with fixed time step runs in browser
  - Single player red ship is playable with keyboard controls
  - Player can fire laser projectiles that collide with enemies
  - Enemy Type A appears and can be destroyed
  - Start menu displays with control information
  - Level 1 loads with enemy swarm
  - Player lives system works (starts with 3 lives)
  - Player score accumulates when enemies destroyed
  - Background stars scroll with player motion
  - Game over sequence triggers on player death
  - All game objects have functional test harnesses
created_at: '2026-02-13'
updated_at: '2026-02-13'
---

## Context

This epic implements Sprint 1 of the PB-Galaga architecture, establishing the foundation for the entire game. Sprint 1 focuses on creating a playable single-player experience with core mechanics in place.

**Architecture Reference**: `.patchboard/docs/design-architecture/core/architecture.md`  
**Data Model**: `.patchboard/docs/design-architecture/core/data-model.md`

## Scope

This epic delivers a complete vertical slice of the game with end-to-end functionality:

1. **Core Engine** (T-0001, T-0002) - Game loop, state management, headless mode
2. **Player Ship System** (T-0003, T-0004) - Red ship with controls, collision, harness
3. **Projectile System** (T-0005, T-0006) - Laser projectile with collision, harness
4. **Enemy System** (T-0007, T-0008) - Enemy Type A with destruction, harness
5. **Menu Systems** (T-0009) - Start menu and game over sequence
6. **Level 1** (T-0010) - First level with enemy swarm
7. **Game Mechanics** (T-0011) - Lives, scoring, background parallax
8. **Rendering** (T-0012) - Phaser renderer with interpolation

Each component must be independently testable via test harnesses and support headless operation.

## Out of scope

Items deferred to Sprint 2 or later:
- Two player co-op mode (Sprint 2)
- Enemy Types B and C (Sprint 2)
- Bullet projectiles (Sprint 2)
- Multiple enemy waves (Sprint 2)
- Level complete sequence (Sprint 2)
- Power-ups (Future)
- Additional levels (Future)
- Boss enemies (Future)

## Notes

**Implementation Approach**:
- Test-first methodology: Test harnesses and headless tests before rendering
- Incremental integration: Each task produces a working feature
- Phaser is used only for rendering, not game logic
- All game logic must work in headless mode

**Dependencies**:
- TypeScript project setup required first
- Phaser library integration needed
- Asset loading infrastructure needed early
