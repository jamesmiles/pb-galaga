---
id: T-0002
title: "Implement core game engine with fixed time step"
type: task
status: todo
priority: P0
owner: null
labels:
  - engine
  - core
depends_on: [T-0001]
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
  - swapBuffers() is called BEFORE state mutations in each tick (not after)
  - StateManager uses two pre-allocated GameState buffers with pointer swap — no structuredClone, no JSON.parse/stringify, no deep copy per tick
  - GameLoop is the SOLE requestAnimationFrame consumer in the application
  - InputHandler stores bound listener references and removeEventListener correctly removes them
  - InputHandler calls preventDefault() for game-relevant keys (arrows, space)
  - Engine tick rate counter tracks actual fixed-step update frequency
  - Headless tickHeadless(n) correctly advances n ticks with proper swap semantics
created_at: '2026-02-13'
updated_at: '2026-02-13'
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

## Technical Specification

### Buffer Swap Pattern

Two pre-allocated buffers: bufferA, bufferB. Pointers: `previousState` → one buffer, `currentState` → the other.

```
swapBuffers():
  temp = previousState
  previousState = currentState     // previous now points to last frame's final state
  currentState = temp              // current reuses the old previous buffer
  copyStateInto(currentState, previousState)  // shallow-copy previousState into currentState as starting point for mutations
```

### Tick Order (the correct sequence)

```
tick(timestamp):
  elapsed = min(timestamp - lastTimestamp, MAX_ACCUMULATED)
  accumulator += elapsed

  while accumulator >= FIXED_TIMESTEP:
    swapBuffers()                          // ← BEFORE mutations
    processInput(currentState)
    updateGameState(currentState, dt)
    detectCollisions(currentState)
    handleStateTransitions(currentState)
    accumulator -= FIXED_TIMESTEP

  alpha = accumulator / FIXED_TIMESTEP
  render(previousState, currentState, alpha)
```

### InputHandler Listener Pattern

```
// Class properties with arrow functions for stable references
private handleKeyDown = (e: KeyboardEvent) => { ... e.preventDefault() for game keys ... }
private handleKeyUp = (e: KeyboardEvent) => { ... }

// addEventListener and removeEventListener use the SAME references
constructor() {
  window.addEventListener('keydown', this.handleKeyDown)
  window.addEventListener('keyup', this.handleKeyUp)
}
destroy() {
  window.removeEventListener('keydown', this.handleKeyDown)
  window.removeEventListener('keyup', this.handleKeyUp)
}
```

## Performance Testing Strategy

- Measure engine tick consistency over 10,000+ ticks — standard deviation of tick intervals should be < 1ms
- Measure `swapBuffers()` cost — must be < 0.5ms (no deep clone)
- Measure full update cycle time — must fit within 16.67ms budget at max entity count
- Measure GC pauses — no per-tick allocations that create GC pressure
- Headless stress test: run 10,000 ticks with max entities, measure total time and memory
- These tests run via `npm run test` (Vitest)

## Anti-Patterns

- DO NOT use `structuredClone()` or any deep-clone per tick
- DO NOT call `swapBuffers()` at the end of update — must be at the start
- DO NOT use `any` casts to wire components — use typed interfaces
- DO NOT use anonymous arrow wrappers in addEventListener without storing the reference
- DO NOT put heavyweight cosmetic state (e.g. 200 stars) in the double-buffered game state

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
