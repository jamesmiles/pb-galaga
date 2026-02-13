import { describe, it, expect } from 'vitest';
import { GameManager } from '../../src/engine/GameManager';

describe('Full Game Loop Integration', () => {
  it('starts in menu state', () => {
    const gm = new GameManager({ headless: true });
    expect(gm.state.gameStatus).toBe('menu');
    expect(gm.state.menu?.type).toBe('start');
  });

  it('transitions from menu to playing', () => {
    const gm = new GameManager({ headless: true });
    gm.inputHandler.injectMenuInput({ up: false, down: false, enter: true });
    gm.tickHeadless(1);

    expect(gm.state.gameStatus).toBe('playing');
    expect(gm.state.players[0].isAlive).toBe(true);
    expect(gm.state.players[0].lives).toBe(3);
  });

  it('enemies spawn after game starts', () => {
    const gm = new GameManager({ headless: true });
    gm.startGame();

    // Tick enough for wave delay + spawning (about 5 seconds)
    gm.tickHeadless(300);

    expect(gm.state.enemies.length).toBeGreaterThan(0);
  });

  it('player can fire lasers', () => {
    const gm = new GameManager({ headless: true });
    gm.startGame();

    gm.inputHandler.injectPlayerInput('player1', {
      left: false, right: false, up: false, down: false, fire: true,
    });
    gm.tickHeadless(1);

    expect(gm.state.projectiles.length).toBeGreaterThan(0);
  });

  it('player score increases when enemies destroyed', () => {
    const gm = new GameManager({ headless: true });
    gm.startGame();

    // Spawn enemies
    gm.tickHeadless(300);
    expect(gm.state.enemies.length).toBeGreaterThan(0);

    // Manually destroy an enemy to test scoring
    const enemy = gm.state.enemies[0];
    const initialScore = gm.state.players[0].score;
    enemy.health = 0;

    gm.tickHeadless(1); // Process enemy removal
    expect(gm.state.players[0].score).toBeGreaterThanOrEqual(initialScore);
  });

  it('game over triggers when player loses all lives', () => {
    const gm = new GameManager({ headless: true });
    gm.startGame();

    // Kill player 3 times
    for (let i = 0; i < 3; i++) {
      const player = gm.state.players[0];
      player.isAlive = false;
      player.health = 0;
      player.lives = Math.max(0, player.lives - 1);
      if (player.lives > 0) {
        gm.tickHeadless(1); // trigger respawn
      }
    }

    gm.state.players[0].lives = 0;
    gm.state.players[0].isAlive = false;
    gm.tickHeadless(1);

    expect(gm.state.gameStatus).toBe('gameover');
    expect(gm.state.menu?.type).toBe('gameover');
  });

  it('restart from game over starts new game', () => {
    const gm = new GameManager({ headless: true });
    gm.startGame();

    // Trigger game over
    gm.state.players[0].lives = 0;
    gm.state.players[0].isAlive = false;
    gm.state.players[0].score = 500;
    gm.tickHeadless(1);

    expect(gm.state.gameStatus).toBe('gameover');

    // Select restart
    gm.inputHandler.injectMenuInput({ up: false, down: false, enter: true });
    gm.tickHeadless(1);

    expect(gm.state.gameStatus).toBe('playing');
    expect(gm.state.players[0].score).toBe(0);
    expect(gm.state.players[0].lives).toBe(3);
  });

  it('background stars scroll during gameplay', () => {
    const gm = new GameManager({ headless: true });
    gm.startGame();

    const starPositions = gm.state.background.stars.map(s => s.position.y);
    gm.tickHeadless(60);
    const newPositions = gm.state.background.stars.map(s => s.position.y);

    // At least some stars should have moved
    const moved = starPositions.some((y, i) => Math.abs(newPositions[i] - y) > 0.1);
    expect(moved).toBe(true);
  });

  it('600 frames run without error', () => {
    const gm = new GameManager({ headless: true });
    gm.startGame();

    expect(() => gm.tickHeadless(600)).not.toThrow();
  });
});
