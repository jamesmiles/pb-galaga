---
id: T-0017
title: "Expand Level 1 with multiple enemy waves"
type: task
status: todo
priority: P1
owner: null
labels:
  - gameplay
  - level
depends_on: [T-0015, T-0016]
parallel_with: []
parent_epic: E-0002
acceptance:
  - "Level 1 has 5 distinct waves"
  - "Wave 1 - Type A enemies (existing)"
  - "Wave 2 - Type B enemies only"
  - "Wave 3 - Mixed Type A and Type B"
  - "Wave 4 - Type C enemies only"
  - "Wave 5 - Mixed Type A and Type C"
  - "Waves progress automatically after completion"
  - "Brief transition pause between waves"
  - "Difficulty increases across waves"
  - "Wave spawning and completion logic works"
  - "Unit tests verify wave configurations"
created_at: '2026-02-13'
updated_at: '2026-02-13'
---

## Context

Expanding Level 1 with multiple waves creates a complete level experience that introduces players to all enemy types progressively.

**Architecture**: Wave sequence specified in Sprint 2 (A → B → A+B → C → A+C)

## Plan

### Phase 1: Wave Configurations
1. Update `src/levels/level1.ts` with 5 waves:
   
   **Wave 1: Type A Swarm** (existing)
   - 10-12 Type A enemies
   - Swarm formation
   - Tutorial wave
   
   **Wave 2: Type B Introduction**
   - 5-6 Type B enemies
   - Line or V-formation
   - Introduces laser threat
   
   **Wave 3: Mixed A+B**
   - 8 Type A + 4 Type B
   - Mixed formation
   - Coordinate both threats
   
   **Wave 4: Type C Introduction**
   - 6-8 Type C enemies
   - Swarm formation
   - Fast, aggressive
   
   **Wave 5: Mixed A+C Finale**
   - 6 Type A + 6 Type C
   - Complex formations
   - Climactic battle

2. Design formations and paths for each wave

### Phase 2: Wave Transitions
1. Implement wave transition system:
   - Detect wave completion (all enemies destroyed)
   - Pause before next wave (~2-3 seconds)
   - Display "Wave Complete" message
   - Load next wave configuration
   - Spawn next wave
2. Add transition state management
3. Add unit tests

### Phase 3: Difficulty Balancing
1. Tune wave difficulty:
   - Enemy counts
   - Spawn timing/patterns
   - Enemy health/damage
   - Score values
2. Test difficulty progression
3. Gather playtesting feedback

### Phase 4: Level Manager Updates
1. Extend LevelManager for multi-wave:
   - Track current wave number
   - Progress through waves
   - Detect level completion
   - Trigger level complete sequence
2. Add wave state management
3. Add integration tests

### Phase 5: Testing
1. Playtest full level flow
2. Test all wave configurations
3. Verify progression logic
4. Test in both single and co-op modes
5. Document wave designs

## Notes

**Wave Design Philosophy**:
- Introduce mechanics gradually
- Build on previous waves
- Mix enemy types for variety
- Final wave should feel climactic

**Balancing Considerations**:
- Each wave: 30-60 seconds to clear
- Total level: 3-5 minutes
- Allow player learning time
- Reward skillful play

**Transition Polish**:
- Clear visual feedback
- Brief rest between waves
- Show wave number
- Build anticipation

**Future Enhancements**:
- Bonus waves
- Secret waves
- Dynamic difficulty
- Wave skip for skilled players
