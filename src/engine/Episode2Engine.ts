import type { GameState, EpisodeEngine } from '../types';
import { GAME_HEIGHT, LEVEL6_MAP_HEIGHT } from './constants';
import { InputHandler } from './InputHandler';
import { SoundManager } from '../audio/SoundManager';
import { MusicManager } from '../audio/MusicManager';
import { MapManager } from './MapManager';
import { createCamera, updateCamera, worldToScreen, isInViewport } from './CameraManager';
import { updateTankPlayer } from '../objects/player/code/TankPlayer';
import { spawnTankProjectiles } from '../objects/player/code/TankWeapons';
import { updateAllProjectiles } from '../objects/projectiles/laser/code/Laser';
import { createTankState, createTankPlayer } from './StateManager';
import { level6Map } from '../levels/level6';
import { drawTank } from '../renderer/drawing/drawTank';
import { drawMapSurface, drawMapObjects, drawClouds, drawDustEffects, drawFinishLine } from '../renderer/drawing/drawMap';
import { drawProjectiles } from '../renderer/drawing/drawProjectiles';
import type { TankTrailEffect } from '../renderer/effects/TankTrailEffect';
import { GAME_WIDTH, LEVEL6_MAP_WIDTH } from './constants';

/**
 * Episode 2 engine — tank mode on Mars.
 * Manages: tank movement, camera, map objects, arc projectiles, finish line.
 */
export class Episode2Engine implements EpisodeEngine {
  private inputHandler: InputHandler;
  private mapManager: MapManager;
  private tankTrailEffect: TankTrailEffect | null = null;

  constructor(inputHandler: InputHandler) {
    this.inputHandler = inputHandler;
    this.mapManager = new MapManager();
  }

  setTankTrailEffect(effect: TankTrailEffect): void {
    this.tankTrailEffect = effect;
  }

  update(state: GameState, dtSeconds: number): void {
    if (!state.map || !state.camera || !state.tankStates) return;

    // Check pause toggle
    if (this.inputHandler.getPauseToggle()) {
      state.gameStatus = 'paused';
      state.menu = {
        type: 'pause',
        selectedOption: 0,
        options: ['Resume', 'Main Menu'],
      };
      return;
    }

    // Check mute toggle
    if (this.inputHandler.getMuteToggle()) {
      const muted = SoundManager.toggleMute();
      MusicManager.onMuteChanged(muted);
    }

    // 1. Process input
    for (const player of state.players) {
      if (!player.isAlive) continue;
      if (player.id === 'player1') {
        player.input = this.inputHandler.getPlayerInput();
      } else if (player.id === 'player2') {
        player.input = this.inputHandler.getPlayer2Input();
      }
    }

    // 2. Sync auto-fire state
    state.autoFire = this.inputHandler.getAutoFireState();

    // 3. Update tank movement
    const mapHeight = state.map.totalHeight;
    const mapWidth = LEVEL6_MAP_WIDTH;
    for (const player of state.players) {
      if (!player.isAlive) continue;
      const tank = state.tankStates[player.id];
      if (!tank) continue;
      updateTankPlayer(player, tank, dtSeconds, mapHeight, mapWidth);
    }

    // 4. Boulder collision resolution
    for (const player of state.players) {
      this.mapManager.checkBoulderCollisions(player, state.map);
    }

    // 5. Fire cooldown and set firing state from input
    for (const player of state.players) {
      if (player.fireCooldown > 0) {
        player.fireCooldown -= dtSeconds * 1000;
        if (player.fireCooldown < 0) player.fireCooldown = 0;
      }
      player.isFiring = player.input.fire && player.fireCooldown <= 0 && player.isAlive;
    }
    const projCountBefore = state.projectiles.length;
    spawnTankProjectiles(state);
    if (state.projectiles.length > projCountBefore) {
      SoundManager.play('playerFire');
    }

    // 6. Update all projectiles
    updateAllProjectiles(state, dtSeconds);

    // 6b. Detect tank shell ground impacts (hasCollided set by lifetime expiry)
    // Queue impacts for the renderer — survives across multiple updates per render frame
    for (const proj of state.projectiles) {
      if (proj.hasCollided && (proj.type === 'cannon-shell' || proj.type === 'plasma-bolt')) {
        state.pendingImpacts.push({
          x: proj.position.x,
          y: proj.position.y,
          id: proj.id,
          type: proj.type,
        });
        if (state.camera) {
          const screenX = proj.position.x - state.camera.worldX;
          const screenY = proj.position.y - state.camera.worldY;
          if (screenX >= -50 && screenX <= GAME_WIDTH + 50 &&
              screenY >= -50 && screenY <= GAME_HEIGHT + 50) {
            SoundManager.play('shellImpact');
          }
        } else {
          SoundManager.play('shellImpact');
        }
      }
    }

    // 7. Projectile vs map object collisions (boulders block, destructible rocks take damage)
    for (const proj of state.projectiles) {
      if (!proj.isActive || proj.hasCollided) continue;
      if (proj.owner.type !== 'player') continue;

      for (const obj of state.map.objects) {
        if (obj.type !== 'boulder' && obj.type !== 'destructible-rock') continue;
        if (obj.type === 'destructible-rock' && obj.health !== undefined && obj.health <= 0) continue;
        if (!obj.collisionRadius) continue;

        const dx = proj.position.x - obj.position.x;
        const dy = proj.position.y - obj.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < obj.collisionRadius + proj.collisionRadius) {
          proj.hasCollided = true;
          proj.isActive = false;
          // Queue impact for renderer
          state.pendingImpacts.push({
            x: proj.position.x,
            y: proj.position.y,
            id: proj.id,
            type: proj.type as 'cannon-shell' | 'plasma-bolt',
          });
          if (obj.type === 'destructible-rock') {
            this.mapManager.damageMapObject(obj, proj.damage);
          }
          SoundManager.play('shellImpact');
          break;
        }
      }
    }

    // 8. Update camera to follow players
    updateCamera(state.camera, state.players, dtSeconds, LEVEL6_MAP_WIDTH);

    // 9. Update clouds and dust drift
    this.mapManager.updateClouds(state.map, dtSeconds);
    this.mapManager.updateDust(state.map, dtSeconds);

    // 10. Check finish line
    const alivePlayers = state.players.filter(p => p.isAlive);
    if (alivePlayers.length > 0) {
      const lowestY = Math.min(...alivePlayers.map(p => p.position.y));
      if (lowestY <= state.map.finishLineY) {
        // Level complete
        MusicManager.stop();
        this.inputHandler.clearAll();
        const totalScore = state.players.reduce((sum, p) => sum + p.score, 0);
        state.gameStatus = 'levelcomplete';
        state.menu = {
          type: 'levelcomplete',
          selectedOption: 0,
          options: [],
          data: { finalScore: totalScore, wave: 1, level: state.currentLevel },
        };
        return;
      }
    }

    // 11. Handle invulnerability timers (already handled in TankPlayer updateInvulnerability)

    // 12. Check game over
    this.checkGameOver(state);
  }

  render(
    ctx: CanvasRenderingContext2D,
    current: GameState,
    previous: GameState,
    _alpha: number,
    _renderDt: number,
  ): void {
    if (!current.map || !current.camera || !current.tankStates) return;

    const camera = current.camera;

    // 1. Mars surface
    drawMapSurface(ctx, current.map, camera);

    // 2. Map objects (boulders, rocks, decorations)
    drawMapObjects(ctx, current.map, camera);

    // 2b. Tank tracks + dust (on the ground, under tanks)
    if (this.tankTrailEffect) {
      this.tankTrailEffect.update(_renderDt, current.players, current.tankStates);
      this.tankTrailEffect.draw(ctx, camera);
    }

    // 3. Finish line indicator
    drawFinishLine(ctx, current.map.finishLineY, camera);

    // 4. Projectiles (world→screen)
    ctx.save();
    ctx.translate(-camera.worldX, -camera.worldY);
    const prevProjectiles = new Map(previous.projectiles.map(p => [p.id, p]));
    drawProjectiles(ctx, current.projectiles, prevProjectiles, _alpha);
    ctx.restore();

    // 5. Tanks (world→screen)
    for (const player of current.players) {
      if (!player.isAlive) continue;
      const tank = current.tankStates[player.id];
      if (!tank) continue;
      const screenPos = worldToScreen(player.position, camera);
      drawTank(ctx, screenPos, tank, player);
    }

    // 6. Clouds overlay (foreground)
    drawClouds(ctx, current.map, camera);

    // 7. Dust effects overlay (disabled — ellipses look like white ovals without sprites)
    // drawDustEffects(ctx, current.map, camera);
  }

  renderPaused(
    ctx: CanvasRenderingContext2D,
    current: GameState,
    previous: GameState,
  ): void {
    this.render(ctx, current, previous, 1, 0);
  }

  onLevelStart(state: GameState, level: number): void {
    // Load map based on level
    const map = level === 6 ? level6Map : level6Map; // Only level 6 for now

    state.map = map;
    // Center camera horizontally on start position
    const startCameraX = Math.max(0, Math.min(
      map.startPosition.x - GAME_WIDTH / 2,
      LEVEL6_MAP_WIDTH - GAME_WIDTH,
    ));
    state.camera = createCamera(map.startPosition.y - GAME_HEIGHT + 200, startCameraX);

    // Create tank states for each player
    state.tankStates = {};
    for (const player of state.players) {
      state.tankStates[player.id] = createTankState();
      // Position player at map start
      player.position.x = map.startPosition.x;
      player.position.y = map.startPosition.y;
    }

    // If 2 players, offset them horizontally
    if (state.players.length === 2) {
      state.players[0].position.x = map.startPosition.x - 40;
      state.players[1].position.x = map.startPosition.x + 40;
    }

    state.currentLevel = level;
    state.currentWave = 1;
    state.waveStatus = 'active';
    state.projectiles = [];
    state.enemies = [];
    state.asteroids = [];
  }

  onLevelComplete(_state: GameState): void {
    // Handled inline in update()
  }

  private checkGameOver(state: GameState): void {
    const alivePlayers = state.players.filter(p => p.isAlive || p.lives > 0);
    if (state.players.length > 0 && alivePlayers.length === 0) {
      state.gameStatus = 'gameover';
      MusicManager.play('menu');
      const p1 = state.players.find(p => p.id === 'player1');
      const p2 = state.players.find(p => p.id === 'player2');
      const finalScore = p1?.score ?? 0;
      state.menu = {
        type: 'gameover',
        selectedOption: 0,
        options: ['Restart', 'Main Menu'],
        data: {
          finalScore,
          ...(p2 ? { p2Score: p2.score } : {}),
        },
      };
    }
  }
}
