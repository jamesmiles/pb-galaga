import { describe, it, expect, beforeEach } from 'vitest';
import { LevelManager } from './LevelManager';
import { createInitialState, createPlayer } from './StateManager';
import { level1 } from '../levels/level1';
import { level3 } from '../levels/level3';
import { FIXED_TIMESTEP, WAVE_COMPLETE_BONUS, LEVEL_CLEAR_DELAY, ENEMY_G_HEALTH } from './constants';
import type { GameState } from '../types';

describe('LevelManager', () => {
  let manager: LevelManager;
  let state: GameState;

  beforeEach(() => {
    manager = new LevelManager();
    manager.registerLevel(level1);
    state = createInitialState();
    state.gameStatus = 'playing';
    state.players = [createPlayer('player1')];
  });

  describe('level start', () => {
    it('spawns wave 1 enemies on startLevel', () => {
      manager.startLevel(state, 1);
      expect(state.enemies.length).toBeGreaterThan(0);
      expect(state.currentLevel).toBe(1);
      expect(state.currentWave).toBe(1);
    });

    it('wave 1 contains only Type A enemies', () => {
      manager.startLevel(state, 1);
      const types = new Set(state.enemies.map(e => e.type));
      expect(types.has('A')).toBe(true);
      expect(types.size).toBe(1);
    });
  });

  describe('wave progression', () => {
    it('transitions to wave 2 after all wave 1 enemies destroyed', () => {
      manager.startLevel(state, 1);
      state.deltaTime = FIXED_TIMESTEP;

      // Activate the wave
      manager.update(state);
      expect(state.waveStatus).toBe('active');

      // Kill all enemies
      state.enemies.forEach(e => { e.isAlive = false; });
      manager.update(state);

      // Should transition to wave 2
      expect(state.currentWave).toBe(2);
      expect(state.waveStatus).toBe('transition');
      expect(state.enemies.length).toBeGreaterThan(0);
    });

    it('wave 2 includes Type B enemies', () => {
      manager.startLevel(state, 1);
      state.deltaTime = FIXED_TIMESTEP;
      manager.update(state); // activate

      // Kill wave 1
      state.enemies.forEach(e => { e.isAlive = false; });
      manager.update(state);

      const types = new Set(state.enemies.map(e => e.type));
      expect(types.has('A')).toBe(true);
      expect(types.has('B')).toBe(true);
    });

    it('progresses through all 5 waves', () => {
      manager.startLevel(state, 1);
      state.deltaTime = FIXED_TIMESTEP;

      for (let wave = 1; wave <= 5; wave++) {
        // Activate
        manager.update(state);
        if (state.waveStatus === 'transition') {
          // Fast-forward transition timer
          state.deltaTime = 3100;
          manager.update(state);
        }
        expect(state.waveStatus).toBe('active');

        if (wave < 5) {
          // Kill all enemies to advance
          state.enemies.forEach(e => { e.isAlive = false; });
          state.deltaTime = FIXED_TIMESTEP;
          manager.update(state);
          expect(state.currentWave).toBe(wave + 1);
        }
      }

      expect(state.currentWave).toBe(5);
    });

    it('wave 5 includes Type C enemies', () => {
      manager.startLevel(state, 1);
      state.deltaTime = FIXED_TIMESTEP;

      // Advance to wave 5
      for (let i = 0; i < 4; i++) {
        manager.update(state); // activate or transition
        if (state.waveStatus === 'transition') {
          state.deltaTime = 3100;
          manager.update(state);
        }
        state.enemies.forEach(e => { e.isAlive = false; });
        state.deltaTime = FIXED_TIMESTEP;
        manager.update(state);
      }

      // Now in wave 5
      const types = new Set(state.enemies.map(e => e.type));
      expect(types.has('C')).toBe(true);
    });

    it('status is clearing then complete after all enemies in final wave destroyed', () => {
      manager.startLevel(state, 1);
      state.deltaTime = FIXED_TIMESTEP;

      // Advance through all 5 waves
      for (let i = 0; i < 5; i++) {
        manager.update(state);
        if (state.waveStatus === 'transition') {
          state.deltaTime = 3100;
          manager.update(state);
        }
        state.enemies.forEach(e => { e.isAlive = false; });
        state.deltaTime = FIXED_TIMESTEP;
        manager.update(state);
      }

      // Final wave enters clearing phase first
      expect(state.waveStatus).toBe('clearing');

      // After clearing delay, transitions to complete
      state.deltaTime = LEVEL_CLEAR_DELAY + 100;
      manager.update(state);
      expect(state.waveStatus).toBe('complete');
    });
  });

  describe('mixed enemy types', () => {
    it('spawns correct enemy types per wave config', () => {
      manager.startLevel(state, 1);
      state.deltaTime = FIXED_TIMESTEP;
      manager.update(state); // activate wave 1

      // Wave 1: all A
      expect(state.enemies.every(e => e.type === 'A')).toBe(true);

      // Advance to wave 3
      state.enemies.forEach(e => { e.isAlive = false; });
      manager.update(state); // wave complete → transition to wave 2
      state.deltaTime = 3100;
      manager.update(state); // activate wave 2
      state.enemies.forEach(e => { e.isAlive = false; });
      state.deltaTime = FIXED_TIMESTEP;
      manager.update(state); // wave complete → transition to wave 3
      state.deltaTime = 3100;
      manager.update(state); // activate wave 3

      // Wave 3: A + B + C
      const types = new Set(state.enemies.map(e => e.type));
      expect(types.has('A')).toBe(true);
      expect(types.has('B')).toBe(true);
      expect(types.has('C')).toBe(true);
    });
  });

  describe('chaos mode mini-boss', () => {
    let chaosState: GameState;

    beforeEach(() => {
      manager.registerLevel(level3);
      chaosState = createInitialState();
      chaosState.gameStatus = 'playing';
      chaosState.players = [createPlayer('player1')];
      chaosState.difficulty = 'chaos';
      chaosState.deltaTime = FIXED_TIMESTEP;
    });

    /** Advance to a specific wave of a level. */
    function advanceToWave(st: GameState, level: number, targetWave: number): void {
      manager.startLevel(st, level);
      st.deltaTime = FIXED_TIMESTEP;
      for (let w = 1; w < targetWave; w++) {
        manager.update(st);
        if (st.waveStatus === 'transition') {
          st.deltaTime = 3100;
          manager.update(st);
        }
        st.enemies.forEach(e => { e.isAlive = false; });
        st.deltaTime = FIXED_TIMESTEP;
        manager.update(st);
      }
      // Activate target wave
      manager.update(st);
      if (st.waveStatus === 'transition') {
        st.deltaTime = 3100;
        manager.update(st);
      }
    }

    it('does NOT duplicate mini-boss (Type G) in chaos mode', () => {
      advanceToWave(chaosState, 3, 7);
      const typeG = chaosState.enemies.filter(e => e.type === 'G');
      expect(typeG).toHaveLength(1);
    });

    it('doubles mini-boss health in chaos mode', () => {
      advanceToWave(chaosState, 3, 7);
      const miniBoss = chaosState.enemies.find(e => e.type === 'G')!;
      expect(miniBoss.health).toBe(ENEMY_G_HEALTH * 2);
      expect(miniBoss.maxHealth).toBe(ENEMY_G_HEALTH * 2);
    });

    it('halves mini-boss fire rate in chaos mode', () => {
      advanceToWave(chaosState, 3, 7);
      const miniBoss = chaosState.enemies.find(e => e.type === 'G')!;
      expect(miniBoss.fireRate).toBe(900); // 1800 / 2
    });

    it('still duplicates other slot-based enemies in chaos mode', () => {
      // Level 3 wave 1 has slot-based non-G enemies
      advanceToWave(chaosState, 3, 1);
      const normalState = createInitialState();
      normalState.gameStatus = 'playing';
      normalState.players = [createPlayer('player1')];
      normalState.difficulty = 'normal';
      manager.startLevel(normalState, 3);
      normalState.deltaTime = FIXED_TIMESTEP;
      manager.update(normalState);
      if (normalState.waveStatus === 'transition') {
        normalState.deltaTime = 3100;
        manager.update(normalState);
      }

      // Chaos should have more enemies than normal for non-G waves
      expect(chaosState.enemies.length).toBeGreaterThan(normalState.enemies.length);
    });
  });

  describe('getTotalWaves', () => {
    it('returns correct wave count for level 1', () => {
      expect(manager.getTotalWaves(1)).toBe(5);
    });

    it('returns 0 for unregistered level', () => {
      expect(manager.getTotalWaves(99)).toBe(0);
    });
  });
});
