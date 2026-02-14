import { describe, it, expect } from 'vitest';
import { GameManager } from './GameManager';
import { WAVE_COMPLETE_BONUS } from './constants';

describe('GameManager', () => {
  describe('construction', () => {
    it('creates in headless mode', () => {
      const gm = new GameManager({ headless: true });
      expect(gm.getState().gameStatus).toBe('menu');
      gm.destroy();
    });

    it('starts on the menu screen', () => {
      const gm = new GameManager({ headless: true });
      expect(gm.getState().menu?.type).toBe('start');
      expect(gm.getState().menu?.options).toContain('1 Player');
      gm.destroy();
    });
  });

  describe('headless ticking', () => {
    it('advances time correctly', () => {
      const gm = new GameManager({ headless: true });
      gm.tickHeadless(60); // 1 second of game time
      const state = gm.getState();
      expect(state.currentTime).toBeGreaterThan(900);
      expect(state.currentTime).toBeLessThan(1100);
      gm.destroy();
    });

    it('swap occurs before mutations (previousState != currentState after tick)', () => {
      const gm = new GameManager({ headless: true });

      gm.tickHeadless(1);
      const current = gm.getState();
      const previous = gm.getPreviousState();

      // currentTime should differ: previous is from before the tick
      expect(current.currentTime).toBeGreaterThan(previous.currentTime);
      gm.destroy();
    });
  });

  describe('state transitions', () => {
    it('transitions from menu to playing on Start Game', () => {
      const gm = new GameManager({ headless: true });

      // Inject "confirm" to select Start Game
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);

      expect(gm.getState().gameStatus).toBe('playing');
      expect(gm.getState().players).toHaveLength(1);
      expect(gm.getState().players[0].id).toBe('player1');
      gm.destroy();
    });

    it('navigates menu options with up/down', () => {
      const gm = new GameManager({ headless: true });
      expect(gm.getState().menu?.selectedOption).toBe(0);

      gm.inputHandler.injectMenuInput({ down: true });
      gm.tickHeadless(1);
      expect(gm.getState().menu?.selectedOption).toBe(1);

      gm.inputHandler.injectMenuInput({ up: true });
      gm.tickHeadless(1);
      expect(gm.getState().menu?.selectedOption).toBe(0);

      gm.destroy();
    });
  });

  describe('player movement', () => {
    function startGame(gm: GameManager): void {
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);
    }

    it('moves player right on ArrowRight input', () => {
      const gm = new GameManager({ headless: true });
      startGame(gm);

      const startX = gm.getState().players[0].position.x;
      gm.inputHandler.injectPlayerInput({ right: true });
      gm.tickHeadless(10);
      const endX = gm.getState().players[0].position.x;

      expect(endX).toBeGreaterThan(startX);
      gm.destroy();
    });

    it('moves player left on ArrowLeft input', () => {
      const gm = new GameManager({ headless: true });
      startGame(gm);

      const startX = gm.getState().players[0].position.x;
      gm.inputHandler.injectPlayerInput({ left: true });
      gm.tickHeadless(10);
      const endX = gm.getState().players[0].position.x;

      expect(endX).toBeLessThan(startX);
      gm.destroy();
    });

    it('clamps player within game bounds', () => {
      const gm = new GameManager({ headless: true });
      startGame(gm);

      // Move far right
      gm.inputHandler.injectPlayerInput({ right: true });
      gm.tickHeadless(600);

      const pos = gm.getState().players[0].position;
      expect(pos.x).toBeLessThanOrEqual(784); // GAME_WIDTH - PLAYER_HALF_SIZE (800 - 16)
      expect(pos.x).toBeGreaterThanOrEqual(16); // PLAYER_HALF_SIZE
      gm.destroy();
    });
  });

  describe('invulnerability', () => {
    it('player starts invulnerable then becomes vulnerable', () => {
      const gm = new GameManager({ headless: true });
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);

      expect(gm.getState().players[0].isInvulnerable).toBe(true);

      // Tick past invulnerability duration (2 seconds = ~120 ticks)
      gm.tickHeadless(130);
      expect(gm.getState().players[0].isInvulnerable).toBe(false);
      gm.destroy();
    });
  });

  describe('pause menu', () => {
    it('pauses game when Escape is pressed during gameplay', () => {
      const gm = new GameManager({ headless: true });
      // Start game
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);
      expect(gm.getState().gameStatus).toBe('playing');

      // Press Escape
      gm.inputHandler.injectMenuInput({ back: true });
      gm.tickHeadless(1);
      expect(gm.getState().gameStatus).toBe('paused');
      expect(gm.getState().menu?.type).toBe('pause');
      expect(gm.getState().menu?.options).toContain('Resume');
      expect(gm.getState().menu?.options).toContain('Main Menu');
      gm.destroy();
    });

    it('resumes game when selecting Resume', () => {
      const gm = new GameManager({ headless: true });
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);

      // Pause
      gm.inputHandler.injectMenuInput({ back: true });
      gm.tickHeadless(1);
      expect(gm.getState().gameStatus).toBe('paused');

      // Select Resume (already selected by default)
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);
      expect(gm.getState().gameStatus).toBe('playing');
      expect(gm.getState().menu).toBeNull();
      gm.destroy();
    });

    it('resumes game when pressing Escape again', () => {
      const gm = new GameManager({ headless: true });
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);

      // Pause
      gm.inputHandler.injectMenuInput({ back: true });
      gm.tickHeadless(1);
      expect(gm.getState().gameStatus).toBe('paused');

      // Escape again to resume
      gm.inputHandler.injectMenuInput({ back: true });
      gm.tickHeadless(1);
      expect(gm.getState().gameStatus).toBe('playing');
      gm.destroy();
    });

    it('returns to main menu when selecting Main Menu from pause', () => {
      const gm = new GameManager({ headless: true });
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);

      // Pause
      gm.inputHandler.injectMenuInput({ back: true });
      gm.tickHeadless(1);

      // Navigate down to "Main Menu" and confirm
      gm.inputHandler.injectMenuInput({ down: true });
      gm.tickHeadless(1);
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);
      expect(gm.getState().gameStatus).toBe('menu');
      expect(gm.getState().menu?.type).toBe('start');
      gm.destroy();
    });

    it('does not advance game state while paused', () => {
      const gm = new GameManager({ headless: true });
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);

      const playerPosBefore = { ...gm.getState().players[0].position };

      // Pause and tick
      gm.inputHandler.injectMenuInput({ back: true });
      gm.tickHeadless(1);
      gm.tickHeadless(60); // Tick 60 more times while paused

      const playerPosAfter = gm.getState().players[0].position;
      expect(playerPosAfter.x).toBe(playerPosBefore.x);
      expect(playerPosAfter.y).toBe(playerPosBefore.y);
      gm.destroy();
    });
  });

  describe('game over', () => {
    it('triggers game over when player has 0 lives and no active death sequence', () => {
      const gm = new GameManager({ headless: true });
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);

      // Manually set player state to dead with 0 lives (no death sequence)
      const player = gm.getState().players[0];
      player.lives = 0;
      player.isAlive = false;

      gm.tickHeadless(1);
      expect(gm.getState().gameStatus).toBe('gameover');
      expect(gm.getState().menu?.type).toBe('gameover');
      gm.destroy();
    });

    it('delays game over during active death sequence', () => {
      const gm = new GameManager({ headless: true });
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);

      const player = gm.getState().players[0];
      player.lives = 0;
      player.isAlive = false;
      player.deathSequence = {
        active: true,
        startTime: gm.getState().currentTime,
        duration: 2000,
        position: { x: 400, y: 840 },
      };

      // Tick a few frames — should NOT be gameover yet
      gm.tickHeadless(10);
      expect(gm.getState().gameStatus).toBe('playing');

      // Tick past the 2-second death sequence (~120 ticks)
      gm.tickHeadless(130);
      expect(gm.getState().gameStatus).toBe('gameover');
      gm.destroy();
    });
  });

  describe('death sequence', () => {
    function startGame(gm: GameManager): void {
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);
    }

    it('respawns player after death sequence with lives remaining', () => {
      const gm = new GameManager({ headless: true });
      startGame(gm);

      const player = gm.getState().players[0];
      player.lives = 2;
      player.isAlive = false;
      player.health = 0;
      player.deathSequence = {
        active: true,
        startTime: gm.getState().currentTime,
        duration: 2000,
        position: { x: 400, y: 840 },
      };

      // Tick a few frames — should NOT respawn yet
      gm.tickHeadless(10);
      expect(player.isAlive).toBe(false);

      // Tick past 2 seconds
      gm.tickHeadless(130);
      expect(player.isAlive).toBe(true);
      expect(player.isInvulnerable).toBe(true);
      expect(player.deathSequence).toBe(null);
      gm.destroy();
    });

    it('does not process input during death sequence', () => {
      const gm = new GameManager({ headless: true });
      startGame(gm);

      const player = gm.getState().players[0];
      const startX = player.position.x;
      player.lives = 2;
      player.isAlive = false;
      player.health = 0;
      player.deathSequence = {
        active: true,
        startTime: gm.getState().currentTime,
        duration: 2000,
        position: { x: startX, y: 840 },
      };

      gm.inputHandler.injectPlayerInput({ right: true });
      gm.tickHeadless(10);

      // Position should not change during death sequence
      // (player is dead so updatePlayerShip is skipped)
      expect(player.position.x).toBe(startX);
      gm.destroy();
    });
  });

  describe('two-player co-op', () => {
    function startCoOp(gm: GameManager): void {
      // Navigate to "2 Players" option (index 1)
      gm.inputHandler.injectMenuInput({ down: true });
      gm.tickHeadless(1);
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);
    }

    it('starts with 2 players in co-op mode', () => {
      const gm = new GameManager({ headless: true });
      startCoOp(gm);
      expect(gm.getState().gameMode).toBe('co-op');
      expect(gm.getState().players).toHaveLength(2);
      expect(gm.getState().players[0].id).toBe('player1');
      expect(gm.getState().players[1].id).toBe('player2');
      gm.destroy();
    });

    it('places players at different X positions', () => {
      const gm = new GameManager({ headless: true });
      startCoOp(gm);
      const p1x = gm.getState().players[0].position.x;
      const p2x = gm.getState().players[1].position.x;
      expect(p1x).not.toBe(p2x);
      expect(p1x).toBeLessThan(p2x);
      gm.destroy();
    });

    it('P2 has blue ship color', () => {
      const gm = new GameManager({ headless: true });
      startCoOp(gm);
      expect(gm.getState().players[0].shipColor).toBe('red');
      expect(gm.getState().players[1].shipColor).toBe('blue');
      gm.destroy();
    });

    it('both players have independent scores', () => {
      const gm = new GameManager({ headless: true });
      startCoOp(gm);
      const p1 = gm.getState().players[0];
      const p2 = gm.getState().players[1];
      p1.score = 500;
      p2.score = 300;
      expect(p1.score).toBe(500);
      expect(p2.score).toBe(300);
      gm.destroy();
    });

    it('game continues when only one player dies', () => {
      const gm = new GameManager({ headless: true });
      startCoOp(gm);
      const p1 = gm.getState().players[0];
      p1.lives = 0;
      p1.isAlive = false;
      gm.tickHeadless(1);
      expect(gm.getState().gameStatus).toBe('playing');
      gm.destroy();
    });

    it('game over when both players have 0 lives', () => {
      const gm = new GameManager({ headless: true });
      startCoOp(gm);
      for (const player of gm.getState().players) {
        player.lives = 0;
        player.isAlive = false;
      }
      gm.tickHeadless(1);
      expect(gm.getState().gameStatus).toBe('gameover');
      gm.destroy();
    });
  });

  describe('wave and level complete', () => {
    function startGame(gm: GameManager): void {
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);
    }

    it('awards wave bonus when wave is cleared', () => {
      const gm = new GameManager({ headless: true });
      startGame(gm);

      // Tick to activate the wave (transition → active)
      gm.tickHeadless(1);

      const player = gm.getState().players[0];
      player.isInvulnerable = false;
      const scoreBefore = player.score;

      // Kill all enemies to clear wave
      gm.getState().enemies.forEach(e => { e.isAlive = false; });
      gm.tickHeadless(1);

      expect(player.score).toBe(scoreBefore + WAVE_COMPLETE_BONUS);
      gm.destroy();
    });

    it('transitions to levelcomplete after final wave', () => {
      const gm = new GameManager({ headless: true });
      startGame(gm);

      // Speed through all 5 waves
      for (let wave = 0; wave < 5; wave++) {
        gm.getState().enemies.forEach(e => { e.isAlive = false; });
        gm.tickHeadless(1);

        // Wait for wave transition if not final
        if (wave < 4) {
          gm.tickHeadless(200); // ~3.3s to pass transition
        }
      }

      expect(gm.getState().gameStatus).toBe('levelcomplete');
      expect(gm.getState().menu?.type).toBe('levelcomplete');
      gm.destroy();
    });

    it('level complete menu returns to main menu', () => {
      const gm = new GameManager({ headless: true });
      startGame(gm);

      // Clear all 5 waves
      for (let wave = 0; wave < 5; wave++) {
        gm.getState().enemies.forEach(e => { e.isAlive = false; });
        gm.tickHeadless(1);
        if (wave < 4) gm.tickHeadless(200);
      }

      expect(gm.getState().gameStatus).toBe('levelcomplete');

      // Navigate down to "Main Menu" (first option is now "Next Level")
      gm.inputHandler.injectMenuInput({ down: true });
      gm.tickHeadless(1);
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);

      expect(gm.getState().gameStatus).toBe('menu');
      gm.destroy();
    });

    it('level complete advances to next level', () => {
      const gm = new GameManager({ headless: true });
      startGame(gm);

      // Clear all 5 waves of level 1
      for (let wave = 0; wave < 5; wave++) {
        gm.getState().enemies.forEach(e => { e.isAlive = false; });
        gm.tickHeadless(1);
        if (wave < 4) gm.tickHeadless(200);
      }

      expect(gm.getState().gameStatus).toBe('levelcomplete');
      expect(gm.getState().currentLevel).toBe(1);

      // Select "Next Level"
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);

      expect(gm.getState().gameStatus).toBe('playing');
      expect(gm.getState().currentLevel).toBe(2);
      expect(gm.getState().enemies.length).toBeGreaterThan(0);
      gm.destroy();
    });
  });

  describe('performance', () => {
    it('runs 10,000 ticks in under 500ms (headless)', () => {
      const gm = new GameManager({ headless: true });
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);

      const start = performance.now();
      gm.tickHeadless(10000);
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(500);
      gm.destroy();
    });
  });
});
