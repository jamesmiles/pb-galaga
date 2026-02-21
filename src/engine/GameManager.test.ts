import { describe, it, expect, vi } from 'vitest';
import { GameManager } from './GameManager';
import { WAVE_COMPLETE_BONUS, GAME_WIDTH, GAME_HEIGHT, LEVEL_STATS_MIN_INPUT_DELAY, LEVEL_STATS_TIMEOUT } from './constants';
import { SoundManager } from '../audio/SoundManager';

/** Tick past the level intro typing animation (~6s for longest intro). */
function skipIntro(gm: GameManager): void {
  gm.tickHeadless(400);
}

/** Select "Episode 1" → "1 Player" → skip intro → playing. */
function startSinglePlayer(gm: GameManager): void {
  gm.inputHandler.injectMenuInput({ confirm: true }); // Select "Episode 1"
  gm.tickHeadless(1); // → playercount menu
  gm.inputHandler.injectMenuInput({ confirm: true }); // Select "1 Player"
  gm.tickHeadless(1); // → levelintro
  skipIntro(gm);
}

/** Select "Episode 1" → "2 Players" → skip intro → playing. */
function startCoOpGame(gm: GameManager): void {
  gm.inputHandler.injectMenuInput({ confirm: true }); // Select "Episode 1"
  gm.tickHeadless(1); // → playercount menu
  gm.inputHandler.injectMenuInput({ down: true });
  gm.tickHeadless(1);
  gm.inputHandler.injectMenuInput({ confirm: true }); // Select "2 Players"
  gm.tickHeadless(1); // → levelintro
  skipIntro(gm);
}

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
      expect(gm.getState().menu?.options).toContain('Episode 1 - The Invasion Begins');
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

      // Select "Episode 1" → goes to playercount menu
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);
      expect(gm.getState().menu?.type).toBe('playercount');

      // Select "1 Player" → goes to level intro
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);
      expect(gm.getState().gameStatus).toBe('levelintro');
      expect(gm.getState().players).toHaveLength(1);
      expect(gm.getState().players[0].id).toBe('player1');

      // Skip through intro to playing
      skipIntro(gm);
      expect(gm.getState().gameStatus).toBe('playing');
      gm.destroy();
    });

    it('playercount menu starts with selectedOption 0 (1 Player)', () => {
      const gm = new GameManager({ headless: true });
      gm.inputHandler.injectMenuInput({ confirm: true }); // Select "Episode 1"
      gm.tickHeadless(1);
      expect(gm.getState().menu?.type).toBe('playercount');
      expect(gm.getState().menu?.selectedOption).toBe(0);
      expect(gm.getState().menu?.options[0]).toBe('1 Player');
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
      startSinglePlayer(gm);
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
      startSinglePlayer(gm);

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
      startSinglePlayer(gm);
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
      startSinglePlayer(gm);

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
      startSinglePlayer(gm);

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
      startSinglePlayer(gm);

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
      startSinglePlayer(gm);

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
      startSinglePlayer(gm);

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
      startSinglePlayer(gm);

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
      startSinglePlayer(gm);
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
      startCoOpGame(gm);
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
      startSinglePlayer(gm);
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
        gm.tickHeadless(200); // Pass wave transition or clearing delay
      }

      expect(gm.getState().gameStatus).toBe('levelcomplete');
      expect(gm.getState().menu?.type).toBe('levelcomplete');
      gm.destroy();
    });

    it('level complete auto-advances to next level after 3 seconds', () => {
      const gm = new GameManager({ headless: true });
      startGame(gm);

      // Clear all 5 waves of level 1
      for (let wave = 0; wave < 5; wave++) {
        gm.getState().enemies.forEach(e => { e.isAlive = false; });
        gm.tickHeadless(1);
        gm.tickHeadless(200); // Pass wave transition or clearing delay
      }

      expect(gm.getState().gameStatus).toBe('levelcomplete');
      expect(gm.getState().currentLevel).toBe(1);

      // Wait 3 seconds (180 ticks at 60Hz) → goes to levelstats screen
      gm.tickHeadless(200);
      expect(gm.getState().gameStatus).toBe('levelstats');

      // Wait past minimum input delay (3s = 180 ticks) then confirm
      gm.tickHeadless(200);
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);
      expect(gm.getState().gameStatus).toBe('levelintro');
      expect(gm.getState().currentLevel).toBe(2);

      // Skip through intro to playing
      skipIntro(gm);
      expect(gm.getState().gameStatus).toBe('playing');
      expect(gm.getState().enemies.length).toBeGreaterThan(0);
      gm.destroy();
    });

    it('triggers game over when player dies during level complete', () => {
      const gm = new GameManager({ headless: true });
      startGame(gm);

      // Clear all 5 waves of level 1
      for (let wave = 0; wave < 5; wave++) {
        gm.getState().enemies.forEach(e => { e.isAlive = false; });
        gm.tickHeadless(1);
        gm.tickHeadless(200); // Pass wave transition or clearing delay
      }

      expect(gm.getState().gameStatus).toBe('levelcomplete');

      // Simulate player death with 0 lives during level complete
      const player = gm.getState().players[0];
      player.isAlive = false;
      player.lives = 0;
      player.deathSequence = null;

      // Tick should detect game over instead of auto-advancing
      gm.tickHeadless(200);
      expect(gm.getState().gameStatus).toBe('gameover');
      gm.destroy();
    });
  });

  describe('boss bridge sound', () => {
    it('plays hitGClang when boss bridge takes damage', () => {
      const gm = new GameManager({ headless: true });
      startSinglePlayer(gm);

      const state = gm.getState();
      // Set up a boss with all turrets dead (bridge exposed)
      state.boss = {
        position: { x: 400, y: 100 },
        velocity: { x: 0, y: 0 },
        width: 720,
        height: 200,
        isAlive: true,
        health: 500,
        maxHealth: 1000,
        turrets: [],
        layer: 'active',
        deathSequence: null,
        scoreValue: 5000,
        upperCollisionZones: [],
      };

      // Place a player projectile on the bridge
      state.projectiles.push({
        id: 'test-proj',
        type: 'laser',
        owner: { type: 'player', id: 'player1' },
        position: { x: 400, y: 100 },
        velocity: { x: 0, y: -500 },
        rotation: 0,
        speed: 500,
        damage: 50,
        isActive: true,
        lifetime: 0,
        maxLifetime: 3000,
        collisionRadius: 4,
        hasCollided: false,
      });

      const playSpy = vi.spyOn(SoundManager, 'play');
      gm.tickHeadless(1);

      const bridgeSoundCalls = playSpy.mock.calls.filter(
        ([effect]) => effect === 'bridgeHit' || effect === 'hitGClang' || effect === 'hitF'
      );
      expect(bridgeSoundCalls.length).toBeGreaterThan(0);
      expect(bridgeSoundCalls[0][0]).toBe('bridgeHit');

      playSpy.mockRestore();
      gm.destroy();
    });
  });

  describe('ship repositioning timing', () => {
    it('does NOT change player position during levelcomplete→levelstats', () => {
      const gm = new GameManager({ headless: true });
      startSinglePlayer(gm);

      // Clear all waves but DON'T tick past 3s on the last wave
      for (let wave = 0; wave < 5; wave++) {
        gm.getState().enemies.forEach(e => { e.isAlive = false; });
        gm.tickHeadless(1);
        if (wave < 4) gm.tickHeadless(200);
      }
      // Tick through clearing delay (3s) to reach levelcomplete
      gm.tickHeadless(200);
      expect(gm.getState().gameStatus).toBe('levelcomplete');

      // NOW set a custom position after reaching levelcomplete
      gm.getState().players[0].position = { x: 200, y: 600 };

      // Tick through levelcomplete timer (3s) to reach levelstats
      gm.tickHeadless(200);
      expect(gm.getState().gameStatus).toBe('levelstats');

      // Position should NOT have changed during this transition
      expect(gm.getState().players[0].position.x).toBe(200);
      expect(gm.getState().players[0].position.y).toBe(600);
      gm.destroy();
    });

    it('resets player position when advancing from levelstats to levelintro', () => {
      const gm = new GameManager({ headless: true });
      startSinglePlayer(gm);

      // Clear all waves
      for (let wave = 0; wave < 5; wave++) {
        gm.getState().enemies.forEach(e => { e.isAlive = false; });
        gm.tickHeadless(1);
        if (wave < 4) gm.tickHeadless(200);
      }
      gm.tickHeadless(200); // clearing delay → levelcomplete
      gm.getState().players[0].position = { x: 200, y: 600 };
      gm.tickHeadless(200); // → levelstats
      expect(gm.getState().gameStatus).toBe('levelstats');

      // Wait past min delay then confirm
      gm.tickHeadless(200);
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);
      expect(gm.getState().gameStatus).toBe('levelintro');

      // Position should now be reset to center
      const pos = gm.getState().players[0].position;
      expect(pos.x).toBe(GAME_WIDTH / 2);
      expect(pos.y).toBe(GAME_HEIGHT - 60);
      gm.destroy();
    });
  });

  describe('level stats timing', () => {
    /** Clear all waves and advance to levelstats screen. */
    function advanceToLevelStats(gm: GameManager): void {
      startSinglePlayer(gm);
      for (let wave = 0; wave < 5; wave++) {
        gm.getState().enemies.forEach(e => { e.isAlive = false; });
        gm.tickHeadless(1);
        gm.tickHeadless(200);
      }
      expect(gm.getState().gameStatus).toBe('levelcomplete');
      gm.tickHeadless(200); // 3s → levelstats
      expect(gm.getState().gameStatus).toBe('levelstats');
    }

    it('does NOT advance when confirm pressed before minimum delay', () => {
      const gm = new GameManager({ headless: true });
      advanceToLevelStats(gm);

      // Press confirm at ~1 second (60 ticks)
      gm.tickHeadless(60);
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);

      expect(gm.getState().gameStatus).toBe('levelstats');
      gm.destroy();
    });

    it('advances when confirm pressed after minimum delay', () => {
      const gm = new GameManager({ headless: true });
      advanceToLevelStats(gm);

      // Wait past 3s minimum (210 ticks at 60Hz = 3.5s)
      gm.tickHeadless(210);
      gm.inputHandler.injectMenuInput({ confirm: true });
      gm.tickHeadless(1);

      expect(gm.getState().gameStatus).toBe('levelintro');
      expect(gm.getState().currentLevel).toBe(2);
      gm.destroy();
    });

    it('auto-advances after timeout', () => {
      const gm = new GameManager({ headless: true });
      advanceToLevelStats(gm);

      // Wait past 10s timeout (610 ticks at 60Hz)
      gm.tickHeadless(610);

      expect(gm.getState().gameStatus).toBe('levelintro');
      expect(gm.getState().currentLevel).toBe(2);
      gm.destroy();
    });
  });

  describe('performance', () => {
    it('runs 10,000 ticks in under 500ms (headless)', () => {
      const gm = new GameManager({ headless: true });
      startSinglePlayer(gm);

      const start = performance.now();
      gm.tickHeadless(10000);
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(500);
      gm.destroy();
    });
  });
});
