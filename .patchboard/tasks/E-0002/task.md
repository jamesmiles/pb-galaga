---
id: E-0002
title: Implement Sprint 2 - Enhanced Gameplay
type: epic
status: done
priority: P1
owner: engineer
labels:
- epic
- sprint-2
depends_on:
- E-0001
children:
- T-0013
- T-0014
- T-0015
- T-0016
- T-0017
- T-0018
- T-0019
- T-0020
- T-0021
- T-0022
- T-0023
- T-0024
- T-0025
acceptance:
- Game canvas resized to 800x900 for better vertical real-estate
- Bullet projectile system implemented (distinct from laser)
- Enemy Type B implemented (slow fighter, 2 HP, fires lasers)
- Enemy Type C implemented (fast fighter, 1 HP, fires bullets)
- Enemy firing system with front-row targeting and configurable rates
- Enemy projectiles damage the player (respects invulnerability)
- ZzFX sound effects for fire, explosion, menu, death
- Player death sequence with 2-second explosion before respawn/gameover
- Dive attack behavior for front-line enemies
- Two player co-op mode with blue ship (WASD + Q)
- Level 1 expanded to 5 waves with escalating difficulty
- Level complete sequence with score bonus between waves
- ZzFXM background music with menu and gameplay tracks
- All features have comprehensive unit tests
- Playwright visual tests pass at new resolution
created_at: '2026-02-13'
updated_at: '2026-02-14'
---

## Context

Sprint 2 builds on Sprint 1's complete foundation (12 tasks, 151 tests) by adding sound/music, enemy AI (firing + dive attacks), a player death sequence, two-player co-op, multi-wave levels, and a taller canvas. This transforms the game from a single-player proof-of-concept into a rich, challenging arcade experience.

**Architecture Reference**: `.patchboard/docs/design-architecture/core/architecture.md`

## Scope

This epic delivers 13 tasks across 7 phases:

### Phase 1: Foundation
1. **Canvas Resize** (T-0013) - 800x600 → 800x900 for better vertical real-estate

### Phase 2: Combat Systems
2. **Bullet Projectile** (T-0014) - New projectile type for enemy fire
3. **Enemy Type B** (T-0015) - Slow fighter with laser, 2 HP
4. **Enemy Type C** (T-0016) - Fast fighter with bullets, 1 HP
5. **Enemy Firing System** (T-0017) - Front-row targeting, configurable rates
6. **Enemy Projectile-Player Collision** (T-0018) - Damage from enemy fire

### Phase 3: Audio
7. **ZzFX Sound Effects** (T-0019) - Procedural 8-bit audio (<1KB)

### Phase 4: Enhanced Gameplay
8. **Player Death Sequence** (T-0020) - 2-second explosion before respawn/gameover
9. **Dive Attack Behavior** (T-0021) - Front-line enemies dive at player

### Phase 5: Multiplayer
10. **Two-Player Co-op** (T-0022) - Blue ship, WASD+Q, separate scores/lives

### Phase 6: Level Structure
11. **Multi-Wave Level 1** (T-0023) - 5 waves with escalating enemy variety
12. **Level Complete Sequence** (T-0024) - Wave/level complete screens

### Phase 7: Music
13. **ZzFXM Background Music** (T-0025) - Chiptune menu + gameplay tracks

## Out of scope

Items deferred to future sprints:
- Power-ups (health, shield, firepower, stealth)
- Additional levels (Level 2+)
- Boss enemies
- Pause menu
- High score persistence
- Combo scoring system

## Key Technical Decisions

- **ZzFX/ZzFXM** for audio: Zero dependencies, procedural generation, works with file:// protocol, <1.5KB total
- **Canvas 800x900**: Good balance for laptop screens, keeps 800px width
- **Vendor audio libs**: Copy source into `src/audio/` rather than npm install
- **Death sequence in game state**: Engine-level 2-second delay, not renderer-only
- **DiveManager separate from FormationManager**: Clean separation of concerns

## Notes

- All new features extend existing Sprint 1 systems
- Maintain test-first methodology with headless testing
- Target ~250+ tests total
- All game logic remains headless-capable (Phaser for rendering only)
