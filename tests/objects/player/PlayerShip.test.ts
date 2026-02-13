import { describe, it, expect } from 'vitest';
import { createPlayer, updatePlayer, getPlayerBounds } from '../../../src/objects/player/code/PlayerShip';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_MARGIN, PLAYER_SPEED } from '../../../src/engine/constants';

describe('PlayerShip', () => {
  it('creates player with correct defaults', () => {
    const player = createPlayer('player1');
    expect(player.id).toBe('player1');
    expect(player.shipColor).toBe('red');
    expect(player.lives).toBe(3);
    expect(player.score).toBe(0);
    expect(player.health).toBe(100);
    expect(player.isAlive).toBe(true);
    expect(player.position.x).toBe(GAME_WIDTH / 2);
  });

  it('creates player 2 with blue ship', () => {
    const player = createPlayer('player2');
    expect(player.shipColor).toBe('blue');
  });

  it('moves right when right input applied', () => {
    const player = createPlayer();
    const startX = player.position.x;

    for (let i = 0; i < 30; i++) {
      updatePlayer(player, { left: false, right: true, up: false, down: false, fire: false }, 1/60);
    }

    expect(player.position.x).toBeGreaterThan(startX);
  });

  it('moves left when left input applied', () => {
    const player = createPlayer();
    const startX = player.position.x;

    for (let i = 0; i < 30; i++) {
      updatePlayer(player, { left: true, right: false, up: false, down: false, fire: false }, 1/60);
    }

    expect(player.position.x).toBeLessThan(startX);
  });

  it('moves up when up input applied', () => {
    const player = createPlayer();
    const startY = player.position.y;

    for (let i = 0; i < 30; i++) {
      updatePlayer(player, { left: false, right: false, up: true, down: false, fire: false }, 1/60);
    }

    expect(player.position.y).toBeLessThan(startY);
  });

  it('decelerates with friction when no input', () => {
    const player = createPlayer();
    // First accelerate
    for (let i = 0; i < 30; i++) {
      updatePlayer(player, { left: false, right: true, up: false, down: false, fire: false }, 1/60);
    }
    const speedAfterAccel = player.velocity.x;
    expect(speedAfterAccel).toBeGreaterThan(0);

    // Now stop input — should decelerate
    for (let i = 0; i < 60; i++) {
      updatePlayer(player, { left: false, right: false, up: false, down: false, fire: false }, 1/60);
    }
    expect(player.velocity.x).toBeLessThan(speedAfterAccel);
  });

  it('clamps position within bounds', () => {
    const player = createPlayer();
    // Push far right
    for (let i = 0; i < 300; i++) {
      updatePlayer(player, { left: false, right: true, up: false, down: false, fire: false }, 1/60);
    }

    expect(player.position.x).toBeLessThanOrEqual(GAME_WIDTH - PLAYER_MARGIN);
  });

  it('clamps position at left bound', () => {
    const player = createPlayer();
    for (let i = 0; i < 300; i++) {
      updatePlayer(player, { left: true, right: false, up: false, down: false, fire: false }, 1/60);
    }

    expect(player.position.x).toBeGreaterThanOrEqual(PLAYER_MARGIN);
  });

  it('velocity does not exceed max speed', () => {
    const player = createPlayer();
    for (let i = 0; i < 600; i++) {
      updatePlayer(player, { left: false, right: true, up: false, down: false, fire: false }, 1/60);
    }

    expect(Math.abs(player.velocity.x)).toBeLessThanOrEqual(PLAYER_SPEED + 1);
  });

  it('does not update dead player', () => {
    const player = createPlayer();
    player.isAlive = false;
    const startX = player.position.x;

    updatePlayer(player, { left: false, right: true, up: false, down: false, fire: false }, 1/60);
    expect(player.position.x).toBe(startX);
  });

  it('isThrusting is true when input active', () => {
    const player = createPlayer();
    updatePlayer(player, { left: true, right: false, up: false, down: false, fire: false }, 1/60);
    expect(player.isThrusting).toBe(true);
  });

  it('isThrusting is false when no input', () => {
    const player = createPlayer();
    updatePlayer(player, { left: false, right: false, up: false, down: false, fire: false }, 1/60);
    expect(player.isThrusting).toBe(false);
  });

  it('fire cooldown decreases over time', () => {
    const player = createPlayer();
    player.fireCooldown = 200; // 200ms
    updatePlayer(player, { left: false, right: false, up: false, down: false, fire: false }, 1/60);

    expect(player.fireCooldown).toBeLessThan(200);
  });
});
