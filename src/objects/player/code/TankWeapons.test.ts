import { describe, it, expect } from 'vitest';
import { spawnTankProjectiles } from './TankWeapons';
import { createTankState, createTankPlayer, createInitialState } from '../../../engine/StateManager';
import { CANNON_FIRE_COOLDOWN, PLASMA_BOLT_FIRE_COOLDOWN, TANK_TURRET_LENGTH } from '../../../engine/constants';

function makeState(weapon: 'cannon' | 'plasma-artillery' = 'cannon') {
  const state = createInitialState();
  const player = createTankPlayer(weapon === 'cannon' ? 'player1' : 'player2');
  player.isFiring = true;
  player.isAlive = true;
  player.fireCooldown = 0;
  state.players = [player];
  state.tankStates = { [player.id]: createTankState() };
  state.projectiles = [];
  return state;
}

describe('TankWeapons', () => {
  describe('spawnTankProjectiles', () => {
    it('spawns a cannon shell when P1 is firing', () => {
      const state = makeState('cannon');
      spawnTankProjectiles(state);

      expect(state.projectiles.length).toBe(1);
      expect(state.projectiles[0].type).toBe('cannon-shell');
      expect(state.projectiles[0].owner.id).toBe('player1');
    });

    it('spawns a plasma bolt when P2 is firing', () => {
      const state = makeState('plasma-artillery');
      spawnTankProjectiles(state);

      expect(state.projectiles.length).toBe(1);
      expect(state.projectiles[0].type).toBe('plasma-bolt');
      expect(state.projectiles[0].owner.id).toBe('player2');
    });

    it('sets fire cooldown after spawning cannon', () => {
      const state = makeState('cannon');
      spawnTankProjectiles(state);
      expect(state.players[0].fireCooldown).toBe(CANNON_FIRE_COOLDOWN);
    });

    it('sets fire cooldown after spawning plasma bolt', () => {
      const state = makeState('plasma-artillery');
      spawnTankProjectiles(state);
      expect(state.players[0].fireCooldown).toBe(PLASMA_BOLT_FIRE_COOLDOWN);
    });

    it('does not spawn if player is on cooldown', () => {
      const state = makeState('cannon');
      state.players[0].fireCooldown = 1000;
      spawnTankProjectiles(state);
      expect(state.projectiles.length).toBe(0);
    });

    it('does not spawn if player is not firing', () => {
      const state = makeState('cannon');
      state.players[0].isFiring = false;
      spawnTankProjectiles(state);
      expect(state.projectiles.length).toBe(0);
    });

    it('does not spawn if player is dead', () => {
      const state = makeState('cannon');
      state.players[0].isAlive = false;
      spawnTankProjectiles(state);
      expect(state.projectiles.length).toBe(0);
    });

    it('does not spawn if no tankStates', () => {
      const state = makeState('cannon');
      state.tankStates = null;
      spawnTankProjectiles(state);
      expect(state.projectiles.length).toBe(0);
    });

    it('triggers turret recoil on fire', () => {
      const state = makeState('cannon');
      const tank = state.tankStates!['player1'];
      expect(tank.turretRecoil).toBe(0);

      spawnTankProjectiles(state);
      expect(tank.turretRecoil).toBe(1.0);
    });

    it('spawns projectile at turret tip position', () => {
      const state = makeState('cannon');
      const player = state.players[0];
      player.position = { x: 400, y: 6000 };
      const tank = state.tankStates!['player1'];
      tank.turretAngle = Math.PI / 2; // North

      spawnTankProjectiles(state);

      const proj = state.projectiles[0];
      // Tip should be offset north from player position
      expect(proj.position.x).toBeCloseTo(400, 0);
      expect(proj.position.y).toBeCloseTo(6000 - TANK_TURRET_LENGTH, 0);
    });
  });
});
