---
id: T-0002
title: Implement core game engine with fixed time step
type: task
status: done
priority: P0
owner: engineer
labels:
- engine
- core
depends_on:
- T-0001
parallel_with: []
parent_epic: E-0001
acceptance:
- GameLoop.ts implements fixed time step with synchronization
- StateManager.ts manages double-buffered state (current/previous)
- GameManager.ts orchestrates game lifecycle and state transitions
- InputHandler.ts processes keyboard input for single player
- Engine runs in headless mode without rendering
- Unit tests verify fixed time step accuracy
- Unit tests verify state buffer swapping
- Game loop maintains consistent 60 FPS update rate
created_at: '2026-02-13'
updated_at: '2026-02-14'
---

## Context

The core engine is the heart of PB-Galaga. It must implement a fixed time step game loop that's completely decoupled from rendering, enabling headless testing and consistent gameplay.

**Architecture**: `.patchboard/docs/design-architecture/core/architecture.md` (sections: Key Principles, Core Modules, Data Flow)  
**ADR-001**: Fixed Time Step with Interpolation  
**ADR-002**: Double Buffered State  
**ADR-003**: Headless Testing Capability

## Plan

### Phase 1: Game Loop (Fixed Time Step)
1. Create `src/engine/GameLoop.ts`:
   - Fixed update rate (60 Hz / 16.67ms per frame)
   - Accumulator pattern for consistent updates
   - Delta time tracking
   - Support for headless and rendered modes
2. Add unit tests for time step accuracy

### Phase 2: State Management
1. Create `src/engine/StateManager.ts`:
   - Initialize game state structure from data model
   - Implement double buffering (current/previous)
   - Swap buffers after each update
   - Provide state access methods
2. Define GameState interface matching data model
3. Add unit tests for buffer management

### Phase 3: Game Manager
1. Create `src/engine/GameManager.ts`:
   - Game lifecycle management (init, start, pause, stop)
   - State transition logic (menu → playing → gameover)
   - Integration with GameLoop and StateManager
2. Add integration tests

### Phase 4: Input Handler
1. Create `src/engine/InputHandler.ts`:
   - Keyboard event listeners
   - Input state management
   - Single player controls (arrow keys + spacebar)
   - Input polling interface for game loop
2. Add unit tests for input processing

### Phase 5: Integration
1. Wire all components together
2. Create headless test mode
3. Verify 60 FPS consistency
4. Document API

## Notes

**Key Requirements**:
- Game loop must run independently of rendering
- State must be immutable between buffer swaps
- All components must support headless operation
- Input should be pollable, not event-driven in game loop

**Testing Strategy**:
- Unit test each component in isolation
- Integration test full engine in headless mode
- Verify frame timing accuracy over 1000+ frames
- Test state transition correctness
