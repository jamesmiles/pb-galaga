import Phaser from 'phaser';
import type { GameState, Player, Enemy, Projectile, Star } from '../../types';
import { registerTextures } from '../SpriteManager';
import { lerpPosition } from '../InterpolationUtils';
import { GAME_WIDTH, GAME_HEIGHT } from '../../engine/constants';

const GAME_VERSION = '0.1.2';
const EXPLOSION_DURATION = 400; // ms per explosion
const EXPLOSION_FRAMES = 4;

interface ExplosionEntry {
  sprite: Phaser.GameObjects.Image;
  startTime: number;
  frameIndex: number;
}

/**
 * Main game scene — renders all game objects by reading state.
 * This scene does NOT run any game logic.
 */
export class GameScene extends Phaser.Scene {
  // Sprite pools indexed by entity ID for O(1) lookup
  private playerSprites: Map<string, Phaser.GameObjects.Image> = new Map();
  private enemySprites: Map<string, Phaser.GameObjects.Image> = new Map();
  private projectileSprites: Map<string, Phaser.GameObjects.Image> = new Map();
  private starGraphics!: Phaser.GameObjects.Graphics;
  private starTexture: Phaser.GameObjects.RenderTexture | null = null;

  // Explosions
  private explosions: ExplosionEntry[] = [];
  private explodedEntities: Set<string> = new Set();

  // Track game status transitions for cleanup
  private lastGameStatus: string = '';

  // UI text
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private p2ScoreText!: Phaser.GameObjects.Text;
  private p2LivesText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private fpsText!: Phaser.GameObjects.Text;

  // Menu elements
  private menuContainer: Phaser.GameObjects.Container | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    registerTextures(this);

    // Star background (pre-rendered to texture)
    this.starGraphics = this.add.graphics();
    this.starGraphics.setVisible(false);

    // UI overlay
    this.scoreText = this.add.text(GAME_WIDTH - 10, 10, 'Score: 0', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(1, 0).setDepth(100);

    this.livesText = this.add.text(GAME_WIDTH - 10, 30, 'Lives: 3', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(1, 0).setDepth(100);

    this.p2ScoreText = this.add.text(GAME_WIDTH - 10, 54, 'P2 Score: 0', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#4488ff',
    }).setOrigin(1, 0).setDepth(100).setVisible(false);

    this.waveText = this.add.text(GAME_WIDTH / 2, 10, 'Wave 1', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#aaaaaa',
    }).setOrigin(0.5, 0).setDepth(100).setVisible(false);

    this.p2LivesText = this.add.text(GAME_WIDTH - 10, 74, 'P2 Lives: 3', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#4488ff',
    }).setOrigin(1, 0).setDepth(100).setVisible(false);

    this.fpsText = this.add.text(10, 10, 'Engine: 0 | Render: 0', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#88ff88',
    }).setOrigin(0, 0).setDepth(100);
  }

  /**
   * Render a frame by reading current + previous state and interpolating.
   */
  renderState(
    current: GameState,
    previous: GameState,
    alpha: number,
    engineFps: number,
    renderFps: number,
  ): void {
    // Clear explosion tracking on game (re)start
    if (current.gameStatus === 'playing' && this.lastGameStatus !== 'playing') {
      this.explodedEntities.clear();
    }
    this.lastGameStatus = current.gameStatus;

    if (current.gameStatus === 'menu' || current.gameStatus === 'gameover') {
      this.renderMenu(current);
      this.hideGameElements();
      this.fpsText.setText(`Engine: ${engineFps} | Render: ${renderFps}`);
      return;
    }

    // Hide menu when playing
    this.hideMenu();

    // Build previous-state lookup maps
    const prevPlayers = new Map(previous.players.map(p => [p.id, p]));
    const prevEnemies = new Map(previous.enemies.map(e => [e.id, e]));
    const prevProjectiles = new Map(previous.projectiles.map(p => [p.id, p]));

    // Render layers (back to front)
    this.renderBackground(current);
    this.renderEnemies(current.enemies, prevEnemies, alpha);
    this.renderProjectiles(current.projectiles, prevProjectiles, alpha);
    this.renderPlayers(current.players, prevPlayers, alpha, current.currentTime);
    this.updateExplosions(current.currentTime);
    this.renderUI(current, engineFps, renderFps);
  }

  private renderBackground(state: GameState): void {
    if (!state.background) return;

    // Clear and redraw stars each frame (they move with parallax)
    this.starGraphics.setVisible(true);
    this.starGraphics.clear();
    this.starGraphics.setDepth(-10);

    for (const star of state.background.stars) {
      const gray = Math.floor(star.brightness * 255);
      const color = (gray << 16) | (gray << 8) | gray;
      this.starGraphics.fillStyle(color, 1);
      this.starGraphics.fillRect(
        Math.floor(star.position.x),
        Math.floor(star.position.y),
        Math.ceil(star.size),
        Math.ceil(star.size),
      );
    }
  }

  private renderPlayers(
    players: Player[],
    prevMap: Map<string, Player>,
    alpha: number,
    currentTime: number,
  ): void {
    const activeIds = new Set<string>();

    for (const player of players) {
      if (!player.isAlive) {
        // Trigger explosion if just died
        this.triggerExplosion(player.position.x, player.position.y, player.id);
        continue;
      }

      activeIds.add(player.id);
      let sprite = this.playerSprites.get(player.id);

      if (!sprite) {
        const texture = player.shipColor === 'blue' ? 'player-ship-blue' : 'player-ship';
        sprite = this.add.image(0, 0, texture).setDepth(10);
        this.playerSprites.set(player.id, sprite);
      }

      // Interpolate position
      const prev = prevMap.get(player.id);
      const pos = prev ? lerpPosition(prev.position, player.position, alpha) : player.position;

      sprite.setPosition(pos.x, pos.y);
      sprite.setVisible(true);

      // Invulnerability flashing
      if (player.isInvulnerable) {
        const flash = Math.floor(currentTime / 100) % 2 === 0;
        sprite.setAlpha(flash ? 1 : 0.3);
      } else {
        sprite.setAlpha(1);
      }
    }

    // Remove sprites for dead/removed players
    for (const [id, sprite] of this.playerSprites) {
      if (!activeIds.has(id)) {
        sprite.setVisible(false);
      }
    }
  }

  private renderEnemies(
    enemies: Enemy[],
    prevMap: Map<string, Enemy>,
    alpha: number,
  ): void {
    const activeIds = new Set<string>();

    for (const enemy of enemies) {
      if (!enemy.isAlive) {
        if (enemy.collisionState === 'destroyed') {
          this.triggerExplosion(enemy.position.x, enemy.position.y, enemy.id);
        }
        continue;
      }

      activeIds.add(enemy.id);
      let sprite = this.enemySprites.get(enemy.id);

      if (!sprite) {
        const textureMap: Record<string, string> = { A: 'enemy-a', B: 'enemy-b', C: 'enemy-c' };
        const texture = textureMap[enemy.type] || 'enemy-a';
        sprite = this.add.image(0, 0, texture).setDepth(5);
        this.enemySprites.set(enemy.id, sprite);
      }

      const prev = prevMap.get(enemy.id);
      const pos = prev ? lerpPosition(prev.position, enemy.position, alpha) : enemy.position;

      sprite.setPosition(pos.x, pos.y);
      sprite.setVisible(true);
    }

    // Hide sprites for dead enemies
    for (const [id, sprite] of this.enemySprites) {
      if (!activeIds.has(id)) {
        sprite.setVisible(false);
      }
    }
  }

  private renderProjectiles(
    projectiles: Projectile[],
    prevMap: Map<string, Projectile>,
    alpha: number,
  ): void {
    const activeIds = new Set<string>();

    for (const proj of projectiles) {
      if (!proj.isActive) continue;

      activeIds.add(proj.id);
      let sprite = this.projectileSprites.get(proj.id);

      if (!sprite) {
        const texture = proj.type === 'bullet' ? 'bullet' : 'laser';
        sprite = this.add.image(0, 0, texture).setDepth(8);
        this.projectileSprites.set(proj.id, sprite);
      }

      const prev = prevMap.get(proj.id);
      const pos = prev ? lerpPosition(prev.position, proj.position, alpha) : proj.position;

      sprite.setPosition(pos.x, pos.y);
      sprite.setVisible(true);
    }

    // Hide inactive projectile sprites
    for (const [id, sprite] of this.projectileSprites) {
      if (!activeIds.has(id)) {
        sprite.setVisible(false);
      }
    }
  }

  private triggerExplosion(x: number, y: number, entityId: string): void {
    // Prevent duplicate explosions for the same entity
    if (this.explodedEntities.has(entityId)) return;
    this.explodedEntities.add(entityId);

    const sprite = this.add.image(x, y, 'explosion-0').setDepth(20);
    this.explosions.push({
      sprite,
      startTime: Date.now(),
      frameIndex: 0,
    });
  }

  private updateExplosions(currentTime: number): void {
    const now = Date.now();
    const frameDuration = EXPLOSION_DURATION / EXPLOSION_FRAMES;

    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const exp = this.explosions[i];
      const elapsed = now - exp.startTime;
      const frame = Math.floor(elapsed / frameDuration);

      if (frame >= EXPLOSION_FRAMES) {
        exp.sprite.destroy();
        this.explosions.splice(i, 1);
        continue;
      }

      if (frame !== exp.frameIndex) {
        exp.frameIndex = frame;
        exp.sprite.setTexture(`explosion-${frame}`);
      }
    }
  }

  private renderUI(state: GameState, engineFps: number, renderFps: number): void {
    const p1 = state.players.find(p => p.id === 'player1');
    if (p1) {
      const label = state.gameMode === 'co-op' ? 'P1 ' : '';
      this.scoreText.setText(`${label}Score: ${p1.score}`);
      this.livesText.setText(`${label}Lives: ${p1.lives}`);
      this.scoreText.setVisible(true);
      this.livesText.setVisible(true);
    }

    const p2 = state.players.find(p => p.id === 'player2');
    if (p2) {
      this.p2ScoreText.setText(`P2 Score: ${p2.score}`);
      this.p2LivesText.setText(`P2 Lives: ${p2.lives}`);
      this.p2ScoreText.setVisible(true);
      this.p2LivesText.setVisible(true);
    } else {
      this.p2ScoreText.setVisible(false);
      this.p2LivesText.setVisible(false);
    }

    // Wave indicator
    this.waveText.setText(`Wave ${state.currentWave}`);
    this.waveText.setVisible(true);

    this.fpsText.setText(`Engine: ${engineFps} | Render: ${renderFps}`);
    this.fpsText.setVisible(true);
  }

  private renderMenu(state: GameState): void {
    if (!state.menu) {
      this.hideMenu();
      return;
    }

    // Destroy existing menu container
    if (this.menuContainer) {
      this.menuContainer.destroy();
    }

    this.menuContainer = this.add.container(GAME_WIDTH / 2, 0).setDepth(200);
    const menu = state.menu;

    if (menu.type === 'start') {
      // Title
      const title = this.add.text(0, 120, 'PB-GALAGA', {
        fontFamily: 'monospace',
        fontSize: '48px',
        color: '#ffff44',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      this.menuContainer.add(title);

      // Subtitle
      const subtitle = this.add.text(0, 170, 'A Space Shooter', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#88aacc',
      }).setOrigin(0.5);
      this.menuContainer.add(subtitle);

      // Controls info
      const controls = [
        'Arrow Keys: Move Ship',
        'Spacebar: Fire Laser',
      ];
      controls.forEach((line, i) => {
        const text = this.add.text(0, 250 + i * 24, line, {
          fontFamily: 'monospace',
          fontSize: '14px',
          color: '#aaaaaa',
        }).setOrigin(0.5);
        this.menuContainer!.add(text);
      });

      // Menu options
      this.renderMenuOptions(menu.options, menu.selectedOption, 350);

      // Version
      const version = this.add.text(0, GAME_HEIGHT - 30, `v${GAME_VERSION}`, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#555555',
      }).setOrigin(0.5);
      this.menuContainer.add(version);

    } else if (menu.type === 'gameover') {
      const gameOverText = this.add.text(0, 150, 'GAME OVER', {
        fontFamily: 'monospace',
        fontSize: '48px',
        color: '#ff4444',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      this.menuContainer.add(gameOverText);

      if (menu.data?.finalScore !== undefined) {
        const scoreText = this.add.text(0, 220, `Final Score: ${menu.data.finalScore}`, {
          fontFamily: 'monospace',
          fontSize: '24px',
          color: '#ffffff',
        }).setOrigin(0.5);
        this.menuContainer.add(scoreText);
      }

      if (menu.data?.p2Score !== undefined) {
        const p2Score = this.add.text(0, 255, `P2 Score: ${menu.data.p2Score}`, {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#4488ff',
        }).setOrigin(0.5);
        this.menuContainer.add(p2Score);
      }

      this.renderMenuOptions(menu.options, menu.selectedOption, 320);
    }
  }

  private renderMenuOptions(options: string[], selected: number, startY: number): void {
    options.forEach((opt, i) => {
      const isSelected = i === selected;
      const prefix = isSelected ? '> ' : '  ';
      const text = this.add.text(0, startY + i * 36, `${prefix}${opt}`, {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: isSelected ? '#ffff44' : '#888888',
      }).setOrigin(0.5);
      this.menuContainer!.add(text);
    });
  }

  private hideMenu(): void {
    if (this.menuContainer) {
      this.menuContainer.destroy();
      this.menuContainer = null;
    }
  }

  private hideGameElements(): void {
    // Hide game sprites when on menu screens
    for (const sprite of this.playerSprites.values()) {
      sprite.setVisible(false);
    }
    for (const sprite of this.enemySprites.values()) {
      sprite.setVisible(false);
    }
    for (const sprite of this.projectileSprites.values()) {
      sprite.setVisible(false);
    }
    this.scoreText.setVisible(false);
    this.livesText.setVisible(false);
    this.p2ScoreText.setVisible(false);
    this.p2LivesText.setVisible(false);
    this.waveText.setVisible(false);
    if (this.starGraphics) {
      this.starGraphics.setVisible(false);
    }
  }
}
