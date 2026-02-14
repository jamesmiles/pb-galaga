import { describe, it, expect } from 'vitest';
import { createLaser, updateProjectile, updateAllProjectiles, spawnPlayerLasers } from './Laser';
import { createInitialState, createPlayer } from '../../../../engine/StateManager';

describe('Laser', () => {
  describe('createLaser', () => {
    it('creates a laser at the given position', () => {
      const laser = createLaser({ x: 100, y: 200 }, { type: 'player', id: 'player1' });
      expect(laser.position.x).toBe(100);
      expect(laser.position.y).toBe(200);
      expect(laser.type).toBe('laser');
      expect(laser.isActive).toBe(true);
      expect(laser.velocity.y).toBeLessThan(0); // moves upward
    });

    it('generates unique IDs', () => {
      const a = createLaser({ x: 0, y: 0 }, { type: 'player', id: 'player1' });
      const b = createLaser({ x: 0, y: 0 }, { type: 'player', id: 'player1' });
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('updateProjectile', () => {
    it('moves projectile upward', () => {
      const laser = createLaser({ x: 100, y: 300 }, { type: 'player', id: 'player1' });
      updateProjectile(laser, 1 / 60);
      expect(laser.position.y).toBeLessThan(300);
    });

    it('increments lifetime', () => {
      const laser = createLaser({ x: 100, y: 300 }, { type: 'player', id: 'player1' });
      updateProjectile(laser, 1 / 60);
      expect(laser.lifetime).toBeGreaterThan(0);
    });

    it('deactivates when off-screen', () => {
      const laser = createLaser({ x: 100, y: -25 }, { type: 'player', id: 'player1' });
      updateProjectile(laser, 1 / 60);
      expect(laser.isActive).toBe(false);
    });

    it('deactivates when lifetime expires', () => {
      const laser = createLaser({ x: 100, y: 300 }, { type: 'player', id: 'player1' });
      laser.lifetime = laser.maxLifetime;
      updateProjectile(laser, 1 / 60);
      expect(laser.isActive).toBe(false);
    });

    it('does not move inactive projectiles', () => {
      const laser = createLaser({ x: 100, y: 300 }, { type: 'player', id: 'player1' });
      laser.isActive = false;
      const startY = laser.position.y;
      updateProjectile(laser, 1 / 60);
      expect(laser.position.y).toBe(startY);
    });
  });

  describe('updateAllProjectiles', () => {
    it('removes inactive projectiles from state', () => {
      const state = createInitialState();
      const active = createLaser({ x: 100, y: 300 }, { type: 'player', id: 'player1' });
      const inactive = createLaser({ x: 100, y: -50 }, { type: 'player', id: 'player1' });
      state.projectiles = [active, inactive];

      updateAllProjectiles(state, 1 / 60);

      // The off-screen one should be removed
      expect(state.projectiles.length).toBe(1);
      expect(state.projectiles[0].id).toBe(active.id);
    });
  });

  describe('spawnPlayerLasers', () => {
    it('spawns a laser when player is firing', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isFiring = true;
      state.players = [player];
      state.projectiles = [];

      spawnPlayerLasers(state);

      expect(state.projectiles.length).toBe(1);
      expect(state.projectiles[0].owner).toEqual({ type: 'player', id: 'player1' });
    });

    it('does not spawn when player is not firing', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isFiring = false;
      state.players = [player];
      state.projectiles = [];

      spawnPlayerLasers(state);

      expect(state.projectiles.length).toBe(0);
    });
  });
});
