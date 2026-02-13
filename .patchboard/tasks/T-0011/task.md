---
id: T-0011
title: "Implement background stars with parallax scrolling"
type: task
status: review
priority: P1
owner: engineer
labels:
  - visual
  - environment
depends_on: [T-0002]
parallel_with: [T-0003, T-0005, T-0007]
parent_epic: E-0001
acceptance:
  - Background star field generated procedurally
  - Stars scroll downward simulating player forward motion
  - Parallax effect with multiple depth layers
  - Stars wrap around screen edges for infinite scrolling
  - Star density and distribution feel natural
  - Background integrates with game state
  - Performance impact is minimal
  - Unit tests verify parallax calculations
created_at: '2026-02-13'
updated_at: '2026-02-13'
---

## Context

The scrolling star field provides visual context for player movement and adds depth to the game. The parallax effect creates a sense of speed and dimension.

**Data Model**: `.patchboard/docs/design-architecture/core/data-model.md` (Background State Schema)  
**Architecture**: Environment Objects section

## Plan

### Phase 1: Star Data Structure
1. Create `src/objects/environment/Background.ts`:
   - BackgroundState interface
   - Star interface (position, depth, size, brightness)
   - Star generation logic
2. Define star properties by depth layer
3. Add initialization logic

### Phase 2: Star Generation
1. Implement procedural star generation:
   - Random positions across screen
   - Multiple depth layers (3-5 layers)
   - Varying sizes based on depth
   - Varying brightness for visual interest
   - Appropriate density per layer
2. Add star population logic
3. Add unit tests

### Phase 3: Parallax Scrolling
1. Implement scrolling logic:
   - Scroll speed varies by depth (closer = faster)
   - Base scroll speed (e.g., 50 units/second)
   - Depth multipliers (e.g., 0.2x, 0.5x, 1.0x, 1.5x)
   - Update star positions each frame
2. Add parallax calculation tests

### Phase 4: Screen Wrapping
1. Implement infinite scrolling:
   - Detect stars moving off bottom of screen
   - Wrap to top of screen
   - Maintain star properties
   - Ensure seamless transition
2. Add edge case tests

### Phase 5: Integration
1. Add background to game state
2. Update background in game loop
3. Wire to state manager
4. Optimize performance
5. Test in headless mode

## Notes

**Visual Design**:
- Stars should look natural, not uniform
- Varying brightness adds depth
- Consider some colored stars (future)
- Twinkling effect (future enhancement)

**Performance**:
- Hundreds of stars needed for good effect
- Simple update calculations
- No collision detection needed
- Consider instancing for rendering

**Parallax Tuning**:
- Depth layers: 3-5 for good effect
- Speed multipliers: exponential feels better
- Closest layer: fastest, most visible
- Farthest layer: slowest, subtle

**Future Enhancements**:
- Nebula clouds
- Distant planets
- Asteroids
- Dynamic background changes per level

**Rendering Note**:
- Background renders first (behind everything)
- Simple points or small sprites
- Alpha blending for brightness
