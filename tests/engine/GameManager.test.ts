import { describe, it, expect } from 'vitest';
import { GameManager } from '../../src/engine/GameManager';

describe('GameManager', () => {
  it('initializes in menu state', () => {
    const gm = new GameManager({ headless: true });
    expect(gm.state.gameStatus).toBe('menu');
    expect(gm.state.menu?.type).toBe('start');
  });

  it('startGame transitions from menu to playing', () => {
    const gm = new GameManager({ headless: true });
    gm.startGame();

    expect(gm.state.gameStatus).toBe('playing');
    expect(gm.state.menu).toBeNull();
    expect(gm.state.players[0].isAlive).toBe(true);
    expect(gm.state.players[0].lives).toBe(3);
  });

  it('startGame does nothing if not in menu state', () => {
    const gm = new GameManager({ headless: true });
    gm.startGame();
    gm.state.gameStatus = 'playing';

    // Try to start again — should not reset
    gm.state.players[0].score = 500;
    gm.startGame();
    expect(gm.state.players[0].score).toBe(500);
  });

  it('gameOver transitions from playing to gameover', () => {
    const gm = new GameManager({ headless: true });
    gm.startGame();
    gm.state.players[0].score = 1200;
    gm.gameOver();

    expect(gm.state.gameStatus).toBe('gameover');
    expect(gm.state.menu?.type).toBe('gameover');
    expect(gm.state.menu?.data?.finalScore).toBe(1200);
    expect(gm.state.menu?.options).toContain('Restart');
    expect(gm.state.menu?.options).toContain('Main Menu');
  });

  it('gameOver does nothing if not playing', () => {
    const gm = new GameManager({ headless: true });
    gm.gameOver(); // in menu state
    expect(gm.state.gameStatus).toBe('menu');
  });

  it('returnToMenu resets state', () => {
    const gm = new GameManager({ headless: true });
    gm.startGame();
    gm.state.players[0].score = 999;
    gm.gameOver();
    gm.returnToMenu();

    expect(gm.state.gameStatus).toBe('menu');
    expect(gm.state.players[0].score).toBe(0);
    expect(gm.state.menu?.type).toBe('start');
  });

  it('restartGame starts a new game from gameover', () => {
    const gm = new GameManager({ headless: true });
    gm.startGame();
    gm.state.players[0].score = 500;
    gm.gameOver();
    gm.restartGame();

    expect(gm.state.gameStatus).toBe('playing');
    expect(gm.state.players[0].score).toBe(0);
    expect(gm.state.players[0].lives).toBe(3);
  });

  it('tickHeadless advances game time', () => {
    const gm = new GameManager({ headless: true });
    gm.startGame();

    const timeBefore = gm.state.currentTime;
    gm.tickHeadless(60); // 1 second of game time
    const timeAfter = gm.state.currentTime;

    expect(timeAfter - timeBefore).toBeGreaterThan(900);
    expect(timeAfter - timeBefore).toBeLessThan(1100);
  });

  it('tickHeadless 600 frames runs without error', () => {
    const gm = new GameManager({ headless: true });
    gm.startGame();

    expect(() => gm.tickHeadless(600)).not.toThrow();
  });

  it('menu navigation via injected input works', () => {
    const gm = new GameManager({ headless: true });

    // Inject enter to start game
    gm.inputHandler.injectMenuInput({ up: false, down: false, enter: true });
    gm.tickHeadless(1);

    expect(gm.state.gameStatus).toBe('playing');
  });

  it('checkGameOver returns true when all players dead', () => {
    const gm = new GameManager({ headless: true });
    gm.startGame();

    gm.state.players[0].lives = 0;
    gm.state.players[0].isAlive = false;

    expect(gm.checkGameOver()).toBe(true);
  });

  it('checkGameOver returns false when player has lives', () => {
    const gm = new GameManager({ headless: true });
    gm.startGame();

    expect(gm.checkGameOver()).toBe(false);
  });
});
