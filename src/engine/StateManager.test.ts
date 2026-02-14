import { describe, it, expect } from 'vitest';
import { StateManager, createInitialState, copyStateInto, createPlayer } from './StateManager';

describe('StateManager', () => {
  describe('construction', () => {
    it('initializes with two distinct buffer objects', () => {
      const sm = new StateManager();
      expect(sm.currentState).not.toBe(sm.previousState);
    });

    it('initializes both buffers with menu status', () => {
      const sm = new StateManager();
      expect(sm.currentState.gameStatus).toBe('menu');
      expect(sm.previousState.gameStatus).toBe('menu');
    });
  });

  describe('swapBuffers', () => {
    it('swaps the pointer references', () => {
      const sm = new StateManager();
      const originalCurrent = sm.currentState;
      const originalPrevious = sm.previousState;

      sm.swapBuffers();

      // After swap: previous points to the old current buffer
      expect(sm.previousState).toBe(originalCurrent);
      // current reuses the old previous buffer
      expect(sm.currentState).toBe(originalPrevious);
    });

    it('copies previous state values into current after swap', () => {
      const sm = new StateManager();
      sm.currentState.gameStatus = 'playing';
      sm.currentState.currentTime = 1000;

      sm.swapBuffers();

      // previousState should be the old currentState (playing, time=1000)
      expect(sm.previousState.gameStatus).toBe('playing');
      expect(sm.previousState.currentTime).toBe(1000);

      // currentState should be a copy of previousState (starting point for mutations)
      expect(sm.currentState.gameStatus).toBe('playing');
      expect(sm.currentState.currentTime).toBe(1000);
    });

    it('does NOT use structuredClone (pointer swap is O(1))', () => {
      const sm = new StateManager();
      sm.currentState.players = [createPlayer('player1')];

      const start = performance.now();
      for (let i = 0; i < 10000; i++) {
        sm.swapBuffers();
      }
      const elapsed = performance.now() - start;

      // 10,000 swaps should be < 50ms (no deep copy)
      expect(elapsed).toBeLessThan(50);
    });

    it('allows mutations on currentState without affecting previousState (for primitives)', () => {
      const sm = new StateManager();
      sm.currentState.currentTime = 500;

      sm.swapBuffers();
      // Now both have currentTime = 500
      expect(sm.currentState.currentTime).toBe(500);
      expect(sm.previousState.currentTime).toBe(500);

      // Mutate currentState
      sm.currentState.currentTime = 600;

      // previousState should still be 500 (primitive, copied by value)
      expect(sm.previousState.currentTime).toBe(500);
    });

    it('shares array references after swap (by design)', () => {
      const sm = new StateManager();
      const player = createPlayer('player1');
      sm.currentState.players = [player];

      sm.swapBuffers();

      // Both states share the same players array reference
      // This is by design — the update must create new arrays when modifying
      expect(sm.currentState.players).toBe(sm.previousState.players);
    });
  });

  describe('reset', () => {
    it('resets to initial state', () => {
      const sm = new StateManager();
      sm.currentState.gameStatus = 'playing';
      sm.currentState.currentTime = 5000;

      sm.reset();

      expect(sm.currentState.gameStatus).toBe('menu');
      expect(sm.currentState.currentTime).toBe(0);
    });
  });
});

describe('copyStateInto', () => {
  it('copies all primitive fields', () => {
    const source = createInitialState();
    source.currentTime = 42;
    source.gameStatus = 'playing';
    source.currentLevel = 3;

    const target = createInitialState();
    copyStateInto(target, source);

    expect(target.currentTime).toBe(42);
    expect(target.gameStatus).toBe('playing');
    expect(target.currentLevel).toBe(3);
  });
});

describe('createPlayer', () => {
  it('creates player1 as red ship', () => {
    const p = createPlayer('player1');
    expect(p.id).toBe('player1');
    expect(p.shipColor).toBe('red');
    expect(p.lives).toBe(3);
    expect(p.isAlive).toBe(true);
  });

  it('creates player2 as blue ship', () => {
    const p = createPlayer('player2');
    expect(p.id).toBe('player2');
    expect(p.shipColor).toBe('blue');
  });
});
