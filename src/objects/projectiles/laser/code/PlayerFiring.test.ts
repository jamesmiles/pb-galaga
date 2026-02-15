import { describe, it, expect } from 'vitest';
import { spawnPlayerProjectiles } from './Laser';
import { createInitialState, createPlayer } from '../../../../engine/StateManager';

describe('spawnPlayerProjectiles', () => {
  describe('laser primary', () => {
    it('level 1 spawns single laser', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isFiring = true;
      player.primaryWeapon = 'laser';
      player.primaryLevel = 1;
      state.players = [player];

      spawnPlayerProjectiles(state);

      expect(state.projectiles.length).toBe(1);
      expect(state.projectiles[0].type).toBe('laser');
    });

    it('level 2 spawns double laser', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isFiring = true;
      player.primaryWeapon = 'laser';
      player.primaryLevel = 2;
      state.players = [player];

      spawnPlayerProjectiles(state);

      expect(state.projectiles.length).toBe(2);
      expect(state.projectiles.every(p => p.type === 'laser')).toBe(true);
    });

    it('level 3 spawns triple laser with angles', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isFiring = true;
      player.primaryWeapon = 'laser';
      player.primaryLevel = 3;
      state.players = [player];

      spawnPlayerProjectiles(state);

      expect(state.projectiles.length).toBe(3);
      // Center laser goes straight up
      expect(state.projectiles[0].velocity.x).toBe(0);
      // Side lasers have x velocity
      expect(state.projectiles[1].velocity.x).toBeLessThan(0);
      expect(state.projectiles[2].velocity.x).toBeGreaterThan(0);
    });

    it('level 4 spawns snake laser', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isFiring = true;
      player.primaryWeapon = 'laser';
      player.primaryLevel = 4;
      state.players = [player];

      spawnPlayerProjectiles(state);

      expect(state.projectiles.length).toBe(1);
      expect(state.projectiles[0].type).toBe('snake');
      expect(state.projectiles[0].isHoming).toBe(true);
    });
  });

  describe('bullet primary', () => {
    it('level 1 spawns single bullet', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isFiring = true;
      player.primaryWeapon = 'bullet';
      player.primaryLevel = 1;
      state.players = [player];

      spawnPlayerProjectiles(state);

      expect(state.projectiles.length).toBe(1);
      expect(state.projectiles[0].type).toBe('bullet');
    });

    it('level 2 spawns double bullet', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isFiring = true;
      player.primaryWeapon = 'bullet';
      player.primaryLevel = 2;
      state.players = [player];

      spawnPlayerProjectiles(state);

      expect(state.projectiles.length).toBe(2);
    });

    it('level 3 spawns 3 bullets in fan', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isFiring = true;
      player.primaryWeapon = 'bullet';
      player.primaryLevel = 3;
      state.players = [player];

      spawnPlayerProjectiles(state);

      expect(state.projectiles.length).toBe(3);
    });

    it('level 4 spawns 5 bullets in wide fan', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isFiring = true;
      player.primaryWeapon = 'bullet';
      player.primaryLevel = 4;
      state.players = [player];

      spawnPlayerProjectiles(state);

      expect(state.projectiles.length).toBe(5);
    });
  });

  describe('secondary weapons', () => {
    it('fires rockets when secondary is rocket and cooldown is 0', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isFiring = true;
      player.secondaryWeapon = 'rocket';
      player.secondaryCooldown = 0;
      state.players = [player];

      spawnPlayerProjectiles(state);

      const rockets = state.projectiles.filter(p => p.type === 'rocket');
      expect(rockets.length).toBe(2); // Left and right
    });

    it('fires missiles when secondary is missile and cooldown is 0', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isFiring = true;
      player.secondaryWeapon = 'missile';
      player.secondaryCooldown = 0;
      state.players = [player];

      spawnPlayerProjectiles(state);

      const missiles = state.projectiles.filter(p => p.type === 'missile');
      expect(missiles.length).toBe(3); // Fan of 3
    });

    it('does not fire secondary when cooldown is active', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isFiring = true;
      player.secondaryWeapon = 'rocket';
      player.secondaryCooldown = 200;
      state.players = [player];

      spawnPlayerProjectiles(state);

      const rockets = state.projectiles.filter(p => p.type === 'rocket');
      expect(rockets.length).toBe(0);
    });

    it('sets cooldown after firing secondary', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isFiring = true;
      player.secondaryWeapon = 'rocket';
      player.secondaryCooldown = 0;
      state.players = [player];

      spawnPlayerProjectiles(state);

      expect(player.secondaryCooldown).toBeGreaterThan(0);
    });

    it('does not fire secondary when secondaryWeapon is null', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isFiring = true;
      player.secondaryWeapon = null;
      player.secondaryCooldown = 0;
      state.players = [player];

      spawnPlayerProjectiles(state);

      // Only primary weapon (level 1) — P1 starts with bullet
      expect(state.projectiles.length).toBe(1);
      expect(state.projectiles[0].type).toBe('bullet');
    });
  });
});
