---
id: T-0010
title: Implement Level 1 with enemy swarm wave
type: task
status: done
priority: P0
owner: engineer
labels:
- gameplay
- level
depends_on:
- T-0007
- T-0008
parallel_with: []
parent_epic: E-0001
acceptance:
- Level 1 configuration defined with metadata
- Single enemy swarm wave of Type A enemies
- Enemy formation spawns correctly (swarm pattern)
- Enemies follow appropriate flight paths
- Wave completes when all enemies destroyed
- Level loading system implemented
- LevelManager integrates with game engine
- Unit tests verify level configuration loading
- Integration tests verify wave spawning and completion
created_at: '2026-02-13'
updated_at: '2026-02-14'
---

## Context

Level 1 is the first playable level, featuring a simple swarm of Enemy Type A. It demonstrates the full game loop from start to enemy destruction.

**Data Model**: `.patchboard/docs/design-architecture/core/data-model.md` (Level Configuration Schema)  
**Architecture**: Levels Module section

## Plan

### Phase 1: Level Configuration System
1. Create `src/levels/LevelConfig.ts`:
   - Level configuration interface
   - Wave configuration interface
   - Enemy spawn configuration interface
   - Formation type definitions
2. Create JSON schema for level data
3. Add validation logic

### Phase 2: Level Manager
1. Create `src/engine/LevelManager.ts`:
   - Load level configurations
   - Manage current level/wave state
   - Spawn waves at appropriate times
   - Track wave completion
   - Progress to next wave
   - Handle level completion
2. Add unit tests

### Phase 3: Level 1 Definition
1. Create `src/levels/level1.ts`:
   - Level number: 1
   - Name: "First Contact"
   - Single wave configuration:
     - Wave 1: Enemy Type A swarm
     - Count: 10-15 enemies
     - Formation: swarm pattern
     - Flight paths: various arcing paths
     - Spawn staggered over ~3 seconds
2. Define flight paths for swarm
3. Configure enemy properties

### Phase 4: Wave Spawning
1. Implement wave spawning in LevelManager:
   - Spawn enemies according to configuration
   - Apply formation positioning
   - Assign flight paths
   - Stagger spawns based on delay
2. Track active wave
3. Add spawn timing tests

### Phase 5: Wave Completion
1. Implement wave completion detection:
   - Monitor active enemies
   - Detect when all enemies destroyed
   - Mark wave as complete
   - Trigger next wave or level complete
2. Wire into game loop
3. Add completion tests

## Notes

**Level 1 Design**:
- Intentionally simple for first level
- Gradual difficulty increase within wave
- Teaches player basic mechanics
- Satisfying to complete

**Swarm Formation**:
- Enemies enter from top of screen
- Loose, organic formation
- Individual flight paths
- Some enemies dive toward player

**Flight Path Design**:
- Mix of straight and curved paths
- Some enemies loop back
- Paths should feel dynamic
- Avoid predictability

**Wave Timing**:
- ~3 second spawn duration
- ~20-30 seconds to clear wave
- Brief pause before next wave (Sprint 2)

**Future Enhancements**:
- Multiple waves (Sprint 2)
- Boss encounters
- Bonus waves
- Dynamic difficulty
