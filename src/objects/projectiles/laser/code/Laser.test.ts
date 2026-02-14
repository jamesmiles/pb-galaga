import { describe, it, expect } from 'vitest';
import { createLaser, updateProjectile, updateAllProjectiles, spawnPlayerLasers } from './Laser';
import { createInitialState, createPlayer } from '../../../../engine/StateManager';
import { createEnemyA } from '../../../enemies/enemyA/code/EnemyA';

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

  describe('acceleration', () => {
    it('increases speed up to maxSpeed', () => {
      const proj = createLaser({ x: 100, y: 300 }, { type: 'player', id: 'player1' });
      proj.acceleration = 400;
      proj.maxSpeed = 420;
      proj.speed = 200;
      proj.velocity = { x: 0, y: -200 };

      updateProjectile(proj, 0.5); // 0.5s = 200 px/s increase

      expect(proj.speed).toBe(400); // 200 + 400*0.5 = 400
      expect(Math.abs(proj.velocity.y)).toBeCloseTo(400, 0);
    });

    it('caps speed at maxSpeed', () => {
      const proj = createLaser({ x: 100, y: 300 }, { type: 'player', id: 'player1' });
      proj.acceleration = 1000;
      proj.maxSpeed = 300;
      proj.speed = 250;
      proj.velocity = { x: 0, y: -250 };

      updateProjectile(proj, 1.0);

      expect(proj.speed).toBe(300);
      expect(Math.abs(proj.velocity.y)).toBeCloseTo(300, 0);
    });

    it('does not accelerate without acceleration field', () => {
      const proj = createLaser({ x: 100, y: 300 }, { type: 'player', id: 'player1' });
      const originalSpeed = proj.speed;

      updateProjectile(proj, 1 / 60);

      expect(proj.speed).toBe(originalSpeed);
    });
  });

  describe('homing', () => {
    it('steers toward nearest enemy', () => {
      const state = createInitialState();
      const enemy = createEnemyA(0, 0);
      enemy.position = { x: 200, y: 100 }; // To the right
      state.enemies = [enemy];

      const proj = createLaser({ x: 100, y: 300 }, { type: 'player', id: 'player1' });
      proj.isHoming = true;
      proj.turnRate = 3.0;
      proj.velocity = { x: 0, y: -500 };
      proj.speed = 500;

      updateProjectile(proj, 1 / 60, state);

      // Should have turned slightly toward the enemy (positive x component)
      expect(proj.velocity.x).toBeGreaterThan(0);
    });

    it('does not home without isHoming flag', () => {
      const state = createInitialState();
      const enemy = createEnemyA(0, 0);
      enemy.position = { x: 200, y: 100 };
      state.enemies = [enemy];

      const proj = createLaser({ x: 100, y: 300 }, { type: 'player', id: 'player1' });
      proj.turnRate = 3.0;
      proj.velocity = { x: 0, y: -500 };
      proj.speed = 500;

      updateProjectile(proj, 1 / 60, state);

      expect(proj.velocity.x).toBe(0); // No turning
    });

    it('respects homing delay', () => {
      const state = createInitialState();
      const enemy = createEnemyA(0, 0);
      enemy.position = { x: 200, y: 100 };
      state.enemies = [enemy];

      const proj = createLaser({ x: 100, y: 300 }, { type: 'player', id: 'player1' });
      proj.isHoming = true;
      proj.turnRate = 3.0;
      proj.homingDelay = 500; // 500ms delay
      proj.velocity = { x: 0, y: -500 };
      proj.speed = 500;

      updateProjectile(proj, 1 / 60, state);

      // Homing delay still active, should not have turned
      expect(proj.velocity.x).toBe(0);
      expect(proj.homingDelay).toBeLessThan(500); // But delay should decrement
    });

    it('starts homing after delay expires', () => {
      const state = createInitialState();
      const enemy = createEnemyA(0, 0);
      enemy.position = { x: 200, y: 100 };
      state.enemies = [enemy];

      const proj = createLaser({ x: 100, y: 300 }, { type: 'player', id: 'player1' });
      proj.isHoming = true;
      proj.turnRate = 3.0;
      proj.homingDelay = 0; // Delay already expired
      proj.velocity = { x: 0, y: -500 };
      proj.speed = 500;

      updateProjectile(proj, 1 / 60, state);

      // Should have turned toward enemy
      expect(proj.velocity.x).toBeGreaterThan(0);
    });
  });
});
