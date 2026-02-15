import { describe, it, expect, beforeEach } from 'vitest';
import { BossManager } from './BossManager';
import { createBoss } from '../objects/boss/code/Boss';
import { createInitialState, createPlayer } from './StateManager';
import { BOSS_ENTRY_SPEED, BOSS_DEATH_PHASE_DURATION, BOSS_FIGHTER_SPAWN_INTERVAL, BOSS_WIDTH, GAME_WIDTH } from './constants';
import type { GameState } from '../types';

describe('BossManager', () => {
  let manager: BossManager;
  let state: GameState;

  beforeEach(() => {
    manager = new BossManager();
    state = createInitialState();
    state.gameStatus = 'playing';
    state.players = [createPlayer('player1')];
    state.boss = createBoss();
  });

  describe('entry phase', () => {
    it('drifts boss downward during entry', () => {
      const yBefore = state.boss!.position.y;
      manager.update(state, 1); // 1 second
      expect(state.boss!.position.y).toBeGreaterThan(yBefore);
    });

    it('transitions to active when reaching target Y', () => {
      expect(state.boss!.layer).toBe('entering');
      // Fast-forward entry
      manager.update(state, 10); // Should reach target
      expect(state.boss!.layer).toBe('active');
    });
  });

  describe('active phase', () => {
    beforeEach(() => {
      // Skip entry
      state.boss!.layer = 'active';
      state.boss!.position.y = 120;
    });

    it('oscillates horizontally', () => {
      state.currentTime = 0;
      manager.update(state, 0.5);
      const x1 = state.boss!.position.x;

      state.currentTime = 500; // Quarter cycle of oscillation
      manager.update(state, 0.5);
      const x2 = state.boss!.position.x;

      // Position should change as time changes
      expect(Math.abs(x1 - x2)).toBeGreaterThan(0.01);
    });

    it('turrets fire bullets', () => {
      // Set low cooldowns to trigger fire
      for (const turret of state.boss!.turrets) {
        turret.fireCooldown = 0;
      }

      const projsBefore = state.projectiles.length;
      manager.update(state, 0.1);
      expect(state.projectiles.length).toBeGreaterThan(projsBefore);
    });

    it('updates turret positions relative to boss', () => {
      manager.update(state, 0.1);
      for (const turret of state.boss!.turrets) {
        expect(turret.position.x).toBeCloseTo(
          state.boss!.position.x + turret.offsetX, 0,
        );
      }
    });

    it('spawns fighters from bridge when all turrets destroyed', () => {
      // Kill all turrets
      for (const turret of state.boss!.turrets) {
        turret.isAlive = false;
      }

      const enemiesBefore = state.enemies.length;
      // Advance past spawn interval
      manager.update(state, (BOSS_FIGHTER_SPAWN_INTERVAL + 100) / 1000);
      expect(state.enemies.length).toBe(enemiesBefore + 1);
    });

    it('spawned fighters appear at bridge position, not screen bottom', () => {
      state.boss!.position = { x: 400, y: 120 };
      for (const turret of state.boss!.turrets) {
        turret.isAlive = false;
      }

      manager.update(state, (BOSS_FIGHTER_SPAWN_INTERVAL + 100) / 1000);

      const fighter = state.enemies[state.enemies.length - 1];
      // Fighter should spawn near the boss, not at the bottom of the screen
      expect(fighter.position.y).toBeLessThan(300);
      expect(fighter.position.x).toBeCloseTo(400, -1);
    });

    it('spawned fighters have dive state so formation does not override position', () => {
      for (const turret of state.boss!.turrets) {
        turret.isAlive = false;
      }

      manager.update(state, (BOSS_FIGHTER_SPAWN_INTERVAL + 100) / 1000);

      const fighter = state.enemies[state.enemies.length - 1];
      expect(fighter.diveState).not.toBeNull();
    });

    it('rocket turret fires rockets', () => {
      const rocketTurret = state.boss!.turrets.find(t => t.fireType === 'rocket')!;
      rocketTurret.fireCooldown = 0;
      // Suppress other turrets
      for (const t of state.boss!.turrets) {
        if (t !== rocketTurret) t.fireCooldown = 99999;
      }

      manager.update(state, 0.1);
      const rocket = state.projectiles.find(p => p.type === 'rocket');
      expect(rocket).toBeDefined();
      expect(rocket!.velocity.y).toBeGreaterThan(0); // fires downward
    });

    it('homing turret fires homing missiles', () => {
      const homingTurret = state.boss!.turrets.find(t => t.fireType === 'homing')!;
      homingTurret.fireCooldown = 0;
      for (const t of state.boss!.turrets) {
        if (t !== homingTurret) t.fireCooldown = 99999;
      }

      manager.update(state, 0.1);
      const missile = state.projectiles.find(p => p.isHoming);
      expect(missile).toBeDefined();
    });

    it('has 6 turrets total', () => {
      expect(state.boss!.turrets.length).toBe(6);
    });

    it('does not spawn fighters while turrets are alive', () => {
      const enemiesBefore = state.enemies.length;
      manager.update(state, (BOSS_FIGHTER_SPAWN_INTERVAL + 100) / 1000);
      expect(state.enemies.length).toBe(enemiesBefore);
    });

    it('turrets are separated from bridge zone', () => {
      const boss = state.boss!;
      const bridgeHalfW = boss.width * 0.09; // Matches CollisionDetector
      for (const turret of boss.turrets) {
        // Every turret offset should be outside the bridge zone
        expect(Math.abs(turret.offsetX)).toBeGreaterThan(bridgeHalfW + turret.collisionRadius);
      }
    });
  });

  describe('death sequence', () => {
    beforeEach(() => {
      state.boss!.layer = 'active';
      state.boss!.position.y = 120;
    });

    it('starts death sequence correctly', () => {
      manager.startDeathSequence(state.boss!);
      expect(state.boss!.layer).toBe('dying');
      expect(state.boss!.deathSequence).not.toBeNull();
      expect(state.boss!.deathSequence!.phase).toBe(0);
    });

    it('progresses through all death phases (turrets + bridge)', () => {
      manager.startDeathSequence(state.boss!);
      const totalPhases = state.boss!.turrets.length + 1; // turrets + bridge

      for (let i = 0; i < totalPhases; i++) {
        const dtMs = BOSS_DEATH_PHASE_DURATION + 100;
        manager.update(state, dtMs / 1000);
      }

      // After all phases, boss should be dead
      expect(state.boss!.isAlive).toBe(false);
      expect(state.boss!.deathSequence).toBeNull();
    });

    it('awards score to alive players after death', () => {
      const scoreBefore = state.players[0].score;
      manager.startDeathSequence(state.boss!);
      const totalPhases = state.boss!.turrets.length + 2; // extra margin

      for (let i = 0; i < totalPhases; i++) {
        manager.update(state, (BOSS_DEATH_PHASE_DURATION + 100) / 1000);
      }

      expect(state.players[0].score).toBeGreaterThan(scoreBefore);
    });
  });
});
