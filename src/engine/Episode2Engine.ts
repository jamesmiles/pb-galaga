import type { GameState, EpisodeEngine } from '../types';
import { GAME_HEIGHT, LEVEL6_MAP_HEIGHT, CLIFF_ELEVATION_SCALE, TANK_BODY_WIDTH, TANK_BODY_HEIGHT } from './constants';
import { InputHandler } from './InputHandler';
import { SoundManager } from '../audio/SoundManager';
import { MusicManager } from '../audio/MusicManager';
import { MapManager } from './MapManager';
import { CliffManager } from './CliffManager';
import { Ep2EnemyManager } from './Ep2EnemyManager';
import { createCamera, updateCamera, worldToScreen, isInViewport } from './CameraManager';
import { updateTankPlayer } from '../objects/player/code/TankPlayer';
import { spawnTankProjectiles } from '../objects/player/code/TankWeapons';
import { updateAllProjectiles } from '../objects/projectiles/laser/code/Laser';
import { createTankState, createTankPlayer } from './StateManager';
import { level6Map } from '../levels/level6';
import { drawTank } from '../renderer/drawing/drawTank';
import { drawMapSurface, drawMapObjects, drawClouds, drawDustEffects, drawFinishLine } from '../renderer/drawing/drawMap';
import { drawCliffStructures } from '../renderer/drawing/drawCliffs';
import { drawMapEnemies } from '../renderer/drawing/drawMapEnemies';
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
  private cliffManager: CliffManager;
  private ep2EnemyManager: Ep2EnemyManager;

  constructor(inputHandler: InputHandler) {
    this.inputHandler = inputHandler;
    this.mapManager = new MapManager();
    this.cliffManager = new CliffManager();
    this.ep2EnemyManager = new Ep2EnemyManager();
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

    // 4a. Tank-to-tank collision (co-op: prevent driving through each other)
    this.resolveTankCollisions(state);

    // 4b. Cliff collision + elevation resolution
    for (const player of state.players) {
      if (!player.isAlive) continue;
      const tank = state.tankStates[player.id];
      if (!tank) continue;
      this.cliffManager.checkCliffCollisions(player, tank, state.map);
      this.cliffManager.resolveElevationState(player, tank, state.map);
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
    // Tag newly spawned projectiles with firing tank's elevation
    if (state.projectiles.length > projCountBefore) {
      for (let i = projCountBefore; i < state.projectiles.length; i++) {
        const proj = state.projectiles[i];
        if (proj.owner.type === 'player') {
          const tank = state.tankStates[proj.owner.id];
          if (tank) proj.elevation = tank.elevation;
        }
      }
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

    // 6c. Projectile vs cliff wall collisions (low-ground projectiles destroyed)
    for (const proj of state.projectiles) {
      if (!proj.isActive || proj.hasCollided) continue;
      if (this.cliffManager.checkProjectileCliffCollision(proj, state.map)) {
        proj.hasCollided = true;
        proj.isActive = false;
        state.pendingImpacts.push({
          x: proj.position.x,
          y: proj.position.y,
          id: proj.id,
          type: proj.type as 'cannon-shell' | 'plasma-bolt',
        });
        SoundManager.play('shellImpact');
      }
    }

    // 7. Projectile vs map object collisions (boulders block, destructible rocks take damage)
    for (const proj of state.projectiles) {
      if (!proj.isActive || proj.hasCollided) continue;
      if (proj.owner.type !== 'player') continue;
      // High-ground projectiles pass over low-ground boulders
      if (this.cliffManager.shouldIgnoreLowGroundObject(proj.elevation)) continue;

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

    // 7b. Map enemy AI + firing
    if (state.mapEnemies) {
      this.ep2EnemyManager.update(state, dtSeconds);
    }

    // 7c. Player projectile vs map enemy collisions
    if (state.mapEnemies) {
      this.ep2EnemyManager.checkProjectileCollisions(state);
    }

    // 7d. Enemy projectile vs player tank collisions
    if (state.mapEnemies) {
      this.ep2EnemyManager.checkEnemyProjectileVsPlayer(state);
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

    // 2c. Cliff structures
    if (current.map.cliffs) {
      drawCliffStructures(ctx, current.map.cliffs, camera);
    }

    // 3. Finish line indicator
    drawFinishLine(ctx, current.map.finishLineY, camera);

    // 4. Projectiles (world→screen)
    ctx.save();
    ctx.translate(-camera.worldX, -camera.worldY);
    const prevProjectiles = new Map(previous.projectiles.map(p => [p.id, p]));
    drawProjectiles(ctx, current.projectiles, prevProjectiles, _alpha);
    ctx.restore();

    // 4b. Map enemies
    if (current.mapEnemies) {
      drawMapEnemies(ctx, current.mapEnemies, camera);
    }

    // 5. Tanks (world→screen) — sorted by elevation (low ground first, painter's algorithm)
    const sortedPlayers = [...current.players]
      .filter(p => p.isAlive && current.tankStates![p.id])
      .sort((a, b) => {
        const ea = current.tankStates![a.id]?.elevation ?? 0;
        const eb = current.tankStates![b.id]?.elevation ?? 0;
        return ea - eb;
      });
    for (const player of sortedPlayers) {
      const tank = current.tankStates[player.id]!;
      const screenPos = worldToScreen(player.position, camera);
      const elevationScale = 1.0 + CLIFF_ELEVATION_SCALE * tank.elevation;
      drawTank(ctx, screenPos, tank, player, elevationScale);
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

    // Create live map enemies from placement templates
    state.mapEnemies = map.enemyPlacements
      ? this.ep2EnemyManager.createFromPlacements(map.enemyPlacements)
      : [];
  }

  onLevelComplete(_state: GameState): void {
    // Handled inline in update()
  }

  /**
   * Push co-op tanks apart so they can't overlap.
   * Uses each tank's oriented half-dimensions projected onto the
   * center-to-center direction for an angle-aware collision distance.
   */
  private resolveTankCollisions(state: GameState): void {
    const halfW = TANK_BODY_WIDTH / 2;
    const halfH = TANK_BODY_HEIGHT / 2;
    const alive = state.players.filter(p => p.isAlive);

    for (let i = 0; i < alive.length; i++) {
      for (let j = i + 1; j < alive.length; j++) {
        const a = alive[i];
        const b = alive[j];
        const tankA = state.tankStates?.[a.id];
        const tankB = state.tankStates?.[b.id];
        if (!tankA || !tankB) continue;

        const dx = a.position.x - b.position.x;
        const dy = a.position.y - b.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) continue; // Avoid division by zero

        // Unit direction from B to A
        const nx = dx / dist;
        const ny = dy / dist;

        // Effective half-extent of each tank projected onto this direction
        const extentA = tankExtent(tankA.heading, nx, ny, halfW, halfH);
        const extentB = tankExtent(tankB.heading, nx, ny, halfW, halfH);
        const minDist = extentA + extentB;

        if (dist < minDist) {
          const overlap = minDist - dist;
          const half = overlap / 2;
          a.position.x += nx * half;
          a.position.y += ny * half;
          b.position.x -= nx * half;
          b.position.y -= ny * half;
        }
      }
    }
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

/**
 * Half-extent of an oriented rectangle projected onto a direction.
 * Forward axis: (cos(h), -sin(h)), Right axis: (sin(h), cos(h)).
 */
export function tankExtent(
  heading: number, nx: number, ny: number,
  halfW: number, halfH: number,
): number {
  const fwdDot = Math.abs(Math.cos(heading) * nx + (-Math.sin(heading)) * ny);
  const rgtDot = Math.abs(Math.sin(heading) * nx + Math.cos(heading) * ny);
  return halfH * fwdDot + halfW * rgtDot;
}
