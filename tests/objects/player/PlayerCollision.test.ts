import { describe, it, expect } from 'vitest';
import { createPlayer, applyDamage, handleDeath, respawnPlayer } from '../../../src/objects/player/code/PlayerShip';
import { PLAYER_INVULNERABILITY_DURATION, GAME_WIDTH } from '../../../src/engine/constants';

describe('Player Collision', () => {
  it('applyDamage reduces health', () => {
    const player = createPlayer();
    applyDamage(player, 30);
    expect(player.health).toBe(70);
  });

  it('applyDamage does nothing to invulnerable player', () => {
    const player = createPlayer();
    player.isInvulnerable = true;
    const result = applyDamage(player, 100);
    expect(result).toBe(false);
    expect(player.health).toBe(100);
  });

  it('applyDamage does nothing to dead player', () => {
    const player = createPlayer();
    player.isAlive = false;
    const result = applyDamage(player, 100);
    expect(result).toBe(false);
  });

  it('applyDamage returns true when player dies', () => {
    const player = createPlayer();
    const gameOver = applyDamage(player, 200);
    expect(player.isAlive).toBe(false);
    expect(player.lives).toBe(2);
    // Not game over since lives > 0
    expect(gameOver).toBe(false);
  });

  it('handleDeath decrements lives', () => {
    const player = createPlayer();
    handleDeath(player);
    expect(player.lives).toBe(2);
    expect(player.isAlive).toBe(false);
  });

  it('handleDeath returns true when no lives remain', () => {
    const player = createPlayer();
    player.lives = 1;
    const gameOver = handleDeath(player);
    expect(gameOver).toBe(true);
    expect(player.lives).toBe(0);
  });

  it('respawnPlayer resets position and grants invulnerability', () => {
    const player = createPlayer();
    player.isAlive = false;
    player.health = 0;
    player.lives = 2;

    respawnPlayer(player);

    expect(player.isAlive).toBe(true);
    expect(player.health).toBe(100);
    expect(player.isInvulnerable).toBe(true);
    expect(player.invulnerabilityTimer).toBe(PLAYER_INVULNERABILITY_DURATION);
    expect(player.position.x).toBe(GAME_WIDTH / 2);
  });

  it('respawnPlayer does nothing with 0 lives', () => {
    const player = createPlayer();
    player.isAlive = false;
    player.lives = 0;

    respawnPlayer(player);

    expect(player.isAlive).toBe(false);
  });
});
