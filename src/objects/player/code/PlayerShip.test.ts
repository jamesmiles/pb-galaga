import { describe, it, expect } from 'vitest';
import { updatePlayerShip, respawnPlayer, damagePlayer } from './PlayerShip';
import { createPlayer } from '../../../engine/StateManager';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_SPEED, PLAYER_FIRE_COOLDOWN } from '../../../engine/constants';

function makeDt(ms: number = 16.667) {
  return ms / 1000;
}

describe('PlayerShip', () => {
  describe('updatePlayerShip', () => {
    it('moves right when right input is pressed', () => {
      const player = createPlayer('player1');
      player.isInvulnerable = false;
      const startX = player.position.x;
      player.input = { left: false, right: true, up: false, down: false, fire: false };
      updatePlayerShip(player, makeDt());
      expect(player.position.x).toBeGreaterThan(startX);
    });

    it('moves left when left input is pressed', () => {
      const player = createPlayer('player1');
      player.isInvulnerable = false;
      const startX = player.position.x;
      player.input = { left: true, right: false, up: false, down: false, fire: false };
      updatePlayerShip(player, makeDt());
      expect(player.position.x).toBeLessThan(startX);
    });

    it('normalizes diagonal movement', () => {
      const player = createPlayer('player1');
      player.isInvulnerable = false;
      player.position = { x: 400, y: 300 };
      player.input = { left: false, right: true, up: true, down: false, fire: false };

      updatePlayerShip(player, makeDt());

      const dx = player.position.x - 400;
      const dy = player.position.y - 300;
      const diagonalSpeed = Math.sqrt(dx * dx + dy * dy);
      const straightSpeed = PLAYER_SPEED * makeDt();

      // Diagonal distance should equal straight distance (normalized)
      expect(diagonalSpeed).toBeCloseTo(straightSpeed, 1);
    });

    it('clamps to left boundary', () => {
      const player = createPlayer('player1');
      player.isInvulnerable = false;
      player.position = { x: 5, y: 300 };
      player.input = { left: true, right: false, up: false, down: false, fire: false };
      updatePlayerShip(player, makeDt());
      expect(player.position.x).toBeGreaterThanOrEqual(16);
    });

    it('clamps to right boundary', () => {
      const player = createPlayer('player1');
      player.isInvulnerable = false;
      player.position = { x: GAME_WIDTH - 5, y: 300 };
      player.input = { left: false, right: true, up: false, down: false, fire: false };
      updatePlayerShip(player, makeDt());
      expect(player.position.x).toBeLessThanOrEqual(GAME_WIDTH - 16);
    });

    it('does not update dead players', () => {
      const player = createPlayer('player1');
      player.isAlive = false;
      const startPos = { ...player.position };
      player.input = { left: false, right: true, up: false, down: false, fire: false };
      updatePlayerShip(player, makeDt());
      expect(player.position.x).toBe(startPos.x);
    });

    it('decrements invulnerability timer', () => {
      const player = createPlayer('player1');
      player.isInvulnerable = true;
      player.invulnerabilityTimer = 500;
      player.input = { left: false, right: false, up: false, down: false, fire: false };
      updatePlayerShip(player, makeDt());
      expect(player.invulnerabilityTimer).toBeLessThan(500);
    });

    it('sets isFiring when fire pressed and cooldown is 0', () => {
      const player = createPlayer('player1');
      player.isInvulnerable = false;
      player.fireCooldown = 0;
      player.input = { left: false, right: false, up: false, down: false, fire: true };
      updatePlayerShip(player, makeDt());
      expect(player.isFiring).toBe(true);
      expect(player.fireCooldown).toBe(PLAYER_FIRE_COOLDOWN);
    });

    it('does not fire when cooldown is active', () => {
      const player = createPlayer('player1');
      player.isInvulnerable = false;
      player.fireCooldown = 100;
      player.input = { left: false, right: false, up: false, down: false, fire: true };
      updatePlayerShip(player, makeDt());
      expect(player.isFiring).toBe(false);
    });
  });

  describe('damagePlayer', () => {
    it('reduces health', () => {
      const player = createPlayer('player1');
      player.isInvulnerable = false;
      damagePlayer(player, 30);
      expect(player.health).toBe(70);
    });

    it('kills player when health reaches 0', () => {
      const player = createPlayer('player1');
      player.isInvulnerable = false;
      const died = damagePlayer(player, 100);
      expect(died).toBe(true);
      expect(player.isAlive).toBe(false);
      expect(player.lives).toBe(2);
      expect(player.collisionState).toBe('destroyed');
    });

    it('does not damage invulnerable players', () => {
      const player = createPlayer('player1');
      player.isInvulnerable = true;
      const died = damagePlayer(player, 100);
      expect(died).toBe(false);
      expect(player.health).toBe(100);
    });

    it('grants invulnerability on non-lethal damage', () => {
      const player = createPlayer('player1');
      player.isInvulnerable = false;
      damagePlayer(player, 30);
      expect(player.isInvulnerable).toBe(true);
      expect(player.collisionState).toBe('colliding');
    });
  });

  describe('respawnPlayer', () => {
    it('respawns player at center bottom', () => {
      const player = createPlayer('player1');
      player.isAlive = false;
      player.health = 0;
      player.position = { x: 100, y: 100 };
      respawnPlayer(player);
      expect(player.isAlive).toBe(true);
      expect(player.health).toBe(player.maxHealth);
      expect(player.position.x).toBe(GAME_WIDTH / 2);
      expect(player.isInvulnerable).toBe(true);
    });

    it('does not respawn if no lives remaining', () => {
      const player = createPlayer('player1');
      player.isAlive = false;
      player.lives = 0;
      respawnPlayer(player);
      expect(player.isAlive).toBe(false);
    });
  });
});
