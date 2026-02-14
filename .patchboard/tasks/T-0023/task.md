---
id: T-0023
title: Expand Level 1 with 5 enemy waves
type: task
status: done
priority: P1
owner: engineer
labels:
- gameplay
- level
depends_on:
- T-0015
- T-0016
parallel_with:
- T-0022
parent_epic: E-0002
acceptance:
- Level 1 has 5 distinct waves with escalating difficulty
- 'Wave 1: 5x4 Type A only (easy intro)'
- 'Wave 2: 4x4 Type A + 1x4 Type B (introduce B)'
- 'Wave 3: 3x4 Type A + 1x4 Type B + 1x4 Type C (introduce C)'
- 'Wave 4: 2x4 Type A + 2x4 Type B + 1x4 Type C (harder mix)'
- 'Wave 5: 1x4 Type A + 2x4 Type B + 2x4 Type C (boss wave)'
- Waves progress automatically after all enemies in wave destroyed
- Brief transition pause between waves (~3 seconds)
- Wave indicator displayed in HUD ("Wave 3/5")
- LevelManager handles wave transitions
- Unit tests verify wave configurations and progression
created_at: '2026-02-14'
updated_at: '2026-02-14'
---

## Context

The current Level 1 has a single wave of Type A enemies. Expanding to 5 waves creates a complete level experience that progressively introduces enemy types and escalates difficulty. Each wave teaches the player something new.

## Plan

### Phase 1: Wave Configurations
1. Update `src/levels/level1.ts` with 5 wave configs:

   **Wave 1: Type A Swarm** (existing, modified)
   - 5 rows x 4 columns of Type A
   - Easy intro, no return fire
   - Score: 100 per enemy

   **Wave 2: Introduce Type B**
   - 4 rows Type A + 1 row Type B (front row)
   - Type B fires lasers — first time player faces return fire
   - Players learn to dodge while shooting

   **Wave 3: Introduce Type C**
   - 3 rows Type A + 1 row Type B + 1 row Type C
   - Type C fires bullets — new projectile type
   - Mix of threats

   **Wave 4: Harder Mix**
   - 2 rows Type A + 2 rows Type B + 1 row Type C
   - More return fire, tougher enemies
   - Tests player's dodging skills

   **Wave 5: Boss Wave**
   - 1 row Type A + 2 rows Type B + 2 rows Type C
   - Heavy fire, mixed threats
   - Climactic challenge

2. Each wave config specifies: enemy types per row, formation dimensions, positions

### Phase 2: LevelManager Updates
1. Update `src/engine/LevelManager.ts`:
   - Track current wave index within level
   - `checkWaveComplete()`: all enemies in current wave destroyed
   - `advanceWave()`: load next wave config, spawn enemies
   - `isLevelComplete()`: all waves cleared
   - Add wave transition timer (3-second pause between waves)
2. Update state to track current wave number

### Phase 3: Wave HUD
1. Update `src/renderer/scenes/GameScene.ts`:
   - Display "Wave X/5" in HUD during gameplay
   - Brief "Wave X" announcement at wave start
   - Position: top-center or near FPS counter

### Phase 4: Formation Spawning
1. Update formation spawning for mixed-type waves:
   - Each row in the formation config specifies enemy type
   - Factory function creates correct enemy type per row
   - Formation dimensions may vary per wave
2. Verify FormationManager handles mixed-type formations

### Phase 5: Tests
1. Each wave has correct enemy composition
2. Wave completion detection
3. Wave transition timing (3-second pause)
4. Level complete after wave 5
5. Wave number tracking
6. Mixed-type formations work correctly

## Files to Modify
- `src/levels/level1.ts` (5 wave configs)
- `src/levels/LevelConfig.ts` (wave type per row)
- `src/engine/LevelManager.ts` (wave transitions)
- `src/renderer/scenes/GameScene.ts` (wave HUD)

## Notes

- Wave compositions chosen for teaching progression: A only → +B → +C → more B → mostly B+C
- Each wave should take 30-60 seconds to clear
- Total level: 3-5 minutes of gameplay
- The 3-second pause between waves lets the player breathe and builds anticipation
- Future: more levels with different compositions, bonus waves
