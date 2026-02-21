import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Ep2EnemyManager } from './Ep2EnemyManager';
import { updateAllProjectiles } from '../objects/projectiles/laser/code/Laser';
import type { GameState, MapEnemyPlacement, MapEnemy, Player, Projectile, CameraState } from '../types';
import { createInitialState, createTankState, createTankPlayer } from './StateManager';
import {
  GUN_NEST_HEALTH, GUN_NEST_FIRE_RATE, GUN_NEST_COLLISION_RADIUS, GUN_NEST_SCORE_VALUE,
  TURRET_HEALTH, TURRET_FIRE_RATE, TURRET_COLLISION_RADIUS, TURRET_SCORE_VALUE,
  POPUP_MINE_HEALTH, POPUP_MINE_COLLISION_RADIUS, POPUP_MINE_SCORE_VALUE,
  POPUP_MINE_ACTIVATION_RANGE, POPUP_MINE_BURST_PROJECTILES,
  POPUP_MINE_COOLDOWN, EP2_ENEMY_FIRE_RANGE, TANK_COLLISION_RADIUS,
  ROCKET_COPTER_HEALTH, ROCKET_COPTER_COLLISION_RADIUS, ROCKET_COPTER_SCORE_VALUE,
  ROCKET_COPTER_ENGAGE_RANGE, ROCKET_COPTER_FIRE_RATE, ROCKET_COPTER_PATROL_RANGE,
  LASER_COPTER_HEALTH, LASER_COPTER_COLLISION_RADIUS, LASER_COPTER_SCORE_VALUE,
  LASER_COPTER_ENGAGE_RANGE, LASER_COPTER_FIRE_RATE,
  SPREAD_BOMBER_HEALTH, SPREAD_BOMBER_COLLISION_RADIUS, SPREAD_BOMBER_SCORE_VALUE,
  SPREAD_BOMBER_SPREAD_COUNT,
  HOMING_BOMBER_HEALTH, HOMING_BOMBER_COLLISION_RADIUS, HOMING_BOMBER_SCORE_VALUE,
  HOVER_TANK_HEALTH, HOVER_TANK_COLLISION_RADIUS, HOVER_TANK_SCORE_VALUE,
  HOVER_TANK_FIRE_RATE, HOVER_TANK_PATROL_RANGE,
} from './constants';

// Mock SoundManager
vi.mock('../audio/SoundManager', () => ({
  SoundManager: { play: vi.fn() },
}));

// --- Helpers ---

const placements: MapEnemyPlacement[] = [
  { id: 'gn-1', type: 'gun-nest', position: { x: 400, y: 5800 }, elevation: 0 },
  { id: 'tur-1', type: 'turret', position: { x: 500, y: 5000 }, elevation: 0 },
  { id: 'mine-1', type: 'popup-mine', position: { x: 300, y: 4500 }, elevation: 0 },
];

function makeState(): GameState {
  const state = createInitialState();
  const player = createTankPlayer('player1');
  player.position = { x: 400, y: 5900 };
  player.isAlive = true;
  player.isInvulnerable = false;
  state.players = [player];
  state.tankStates = { player1: createTankState() };
  state.camera = { worldX: 0, worldY: 5400, viewportWidth: 800, viewportHeight: 800 };
  state.mapEnemies = [];
  return state;
}

function makeProjectile(
  x: number, y: number,
  ownerType: 'player' | 'enemy' = 'player',
  elevation = 0,
): Projectile {
  return {
    id: `proj-${Math.random()}`,
    type: 'cannon-shell',
    owner: { type: ownerType, id: ownerType === 'player' ? 'player1' : 'enemy-1' },
    position: { x, y },
    velocity: { x: 0, y: -400 },
    rotation: 0,
    speed: 400,
    damage: 80,
    isActive: true,
    lifetime: 0,
    maxLifetime: 3000,
    collisionRadius: 6,
    hasCollided: false,
    elevation,
  };
}

// --- Tests ---

describe('Ep2EnemyManager', () => {
  let manager: Ep2EnemyManager;

  beforeEach(() => {
    manager = new Ep2EnemyManager();
  });

  // --- createFromPlacements ---

  describe('createFromPlacements', () => {
    it('creates correct number of enemies', () => {
      const enemies = manager.createFromPlacements(placements);
      expect(enemies).toHaveLength(3);
    });

    it('creates gun-nest with correct defaults', () => {
      const enemies = manager.createFromPlacements(placements);
      const gn = enemies.find(e => e.type === 'gun-nest')!;
      expect(gn.health).toBe(GUN_NEST_HEALTH);
      expect(gn.maxHealth).toBe(GUN_NEST_HEALTH);
      expect(gn.collisionRadius).toBe(GUN_NEST_COLLISION_RADIUS);
      expect(gn.scoreValue).toBe(GUN_NEST_SCORE_VALUE);
      expect(gn.fireRate).toBe(GUN_NEST_FIRE_RATE);
      expect(gn.isAlive).toBe(true);
      expect(gn.elevation).toBe(0);
    });

    it('creates turret with correct defaults', () => {
      const enemies = manager.createFromPlacements(placements);
      const tur = enemies.find(e => e.type === 'turret')!;
      expect(tur.health).toBe(TURRET_HEALTH);
      expect(tur.maxHealth).toBe(TURRET_HEALTH);
      expect(tur.collisionRadius).toBe(TURRET_COLLISION_RADIUS);
      expect(tur.scoreValue).toBe(TURRET_SCORE_VALUE);
      expect(tur.fireRate).toBe(TURRET_FIRE_RATE);
    });

    it('creates popup-mine with correct defaults', () => {
      const enemies = manager.createFromPlacements(placements);
      const mine = enemies.find(e => e.type === 'popup-mine')!;
      expect(mine.health).toBe(POPUP_MINE_HEALTH);
      expect(mine.collisionRadius).toBe(POPUP_MINE_COLLISION_RADIUS);
      expect(mine.scoreValue).toBe(POPUP_MINE_SCORE_VALUE);
      expect(mine.activationRange).toBe(POPUP_MINE_ACTIVATION_RANGE);
      expect(mine.isActivated).toBe(false);
      expect(mine.popupProgress).toBe(0);
      expect(mine.burstFired).toBe(false);
    });

    it('preserves position and elevation from placement', () => {
      const enemies = manager.createFromPlacements([
        { id: 'gn-high', type: 'gun-nest', position: { x: 200, y: 3000 }, elevation: 1 },
      ]);
      expect(enemies[0].position).toEqual({ x: 200, y: 3000 });
      expect(enemies[0].elevation).toBe(1);
    });

    it('staggers initial fire cooldown randomly', () => {
      const enemies = manager.createFromPlacements([
        { id: 'gn-a', type: 'gun-nest', position: { x: 100, y: 5000 }, elevation: 0 },
        { id: 'gn-b', type: 'gun-nest', position: { x: 200, y: 5000 }, elevation: 0 },
      ]);
      // Initial fireCooldown is random * fireRate, should be in [0, fireRate)
      for (const e of enemies) {
        expect(e.fireCooldown).toBeGreaterThanOrEqual(0);
        expect(e.fireCooldown).toBeLessThan(GUN_NEST_FIRE_RATE);
      }
    });
  });

  // --- AI aiming ---

  describe('aiming', () => {
    it('rotates gun-nest aim toward nearest player', () => {
      const state = makeState();
      const gn: MapEnemy = manager.createFromPlacements([
        { id: 'gn-1', type: 'gun-nest', position: { x: 400, y: 5800 }, elevation: 0 },
      ])[0];
      gn.aimAngle = 0; // pointing right
      gn.fireCooldown = 99999; // prevent firing
      state.mapEnemies = [gn];

      // Player is directly south (positive y direction)
      state.players[0].position = { x: 400, y: 5900 };

      manager.update(state, 0.5);

      // Should have rotated toward PI/2 (south)
      expect(gn.aimAngle).toBeGreaterThan(0);
      expect(gn.aimAngle).toBeLessThanOrEqual(Math.PI / 2);
    });

    it('rate-limits aim rotation', () => {
      const state = makeState();
      const gn: MapEnemy = manager.createFromPlacements([
        { id: 'gn-1', type: 'gun-nest', position: { x: 400, y: 5800 }, elevation: 0 },
      ])[0];
      gn.aimAngle = 0;
      gn.fireCooldown = 99999;
      state.mapEnemies = [gn];

      // Player directly behind (angle = PI)
      state.players[0].position = { x: 0, y: 5800 };

      // Small dt so rotation is limited
      manager.update(state, 0.016);

      // Should not have snapped to PI, only rotated a small amount
      expect(Math.abs(gn.aimAngle)).toBeLessThan(Math.PI);
    });
  });

  // --- Firing ---

  describe('firing', () => {
    it('gun-nest fires bullet when cooldown ready and player in range', () => {
      const state = makeState();
      const gn = manager.createFromPlacements([
        { id: 'gn-1', type: 'gun-nest', position: { x: 400, y: 5800 }, elevation: 0 },
      ])[0];
      gn.fireCooldown = 0;
      gn.aimAngle = Math.PI / 2;
      state.mapEnemies = [gn];
      state.players[0].position = { x: 400, y: 5900 }; // 100px away, within range

      manager.update(state, 0.016);

      expect(state.projectiles.length).toBe(1);
      expect(state.projectiles[0].owner.type).toBe('enemy');
      expect(gn.fireCooldown).toBe(GUN_NEST_FIRE_RATE);
    });

    it('turret fires plasma when cooldown ready and player in range', () => {
      const state = makeState();
      const tur = manager.createFromPlacements([
        { id: 'tur-1', type: 'turret', position: { x: 400, y: 5800 }, elevation: 0 },
      ])[0];
      tur.fireCooldown = 0;
      tur.aimAngle = Math.PI / 2;
      state.mapEnemies = [tur];
      state.players[0].position = { x: 400, y: 5900 };

      manager.update(state, 0.016);

      expect(state.projectiles.length).toBe(1);
      expect(state.projectiles[0].type).toBe('plasma');
      expect(tur.fireCooldown).toBe(TURRET_FIRE_RATE);
    });

    it('does not fire when player is out of range', () => {
      const state = makeState();
      const gn = manager.createFromPlacements([
        { id: 'gn-1', type: 'gun-nest', position: { x: 400, y: 5800 }, elevation: 0 },
      ])[0];
      gn.fireCooldown = 0;
      state.mapEnemies = [gn];
      // Place player far away
      state.players[0].position = { x: 400, y: 5800 + EP2_ENEMY_FIRE_RANGE + 100 };

      manager.update(state, 0.016);

      expect(state.projectiles.length).toBe(0);
    });

    it('does not fire while cooldown is active', () => {
      const state = makeState();
      const gn = manager.createFromPlacements([
        { id: 'gn-1', type: 'gun-nest', position: { x: 400, y: 5800 }, elevation: 0 },
      ])[0];
      gn.fireCooldown = 200; // still cooling down
      state.mapEnemies = [gn];
      state.players[0].position = { x: 400, y: 5900 };

      manager.update(state, 0.016);

      expect(state.projectiles.length).toBe(0);
    });

    it('projectile inherits enemy elevation', () => {
      const state = makeState();
      const gn = manager.createFromPlacements([
        { id: 'gn-1', type: 'gun-nest', position: { x: 400, y: 5800 }, elevation: 1 },
      ])[0];
      gn.fireCooldown = 0;
      gn.aimAngle = Math.PI / 2;
      state.mapEnemies = [gn];
      state.players[0].position = { x: 400, y: 5900 };

      manager.update(state, 0.016);

      expect(state.projectiles[0].elevation).toBe(1);
    });
  });

  // --- Popup Mine ---

  describe('popup mine', () => {
    it('activates when player is within activation range', () => {
      const state = makeState();
      const mine = manager.createFromPlacements([
        { id: 'mine-1', type: 'popup-mine', position: { x: 400, y: 5800 }, elevation: 0 },
      ])[0];
      mine.dormantTimer = 99999; // prevent timer trigger
      state.mapEnemies = [mine];
      state.players[0].position = { x: 400, y: 5800 + POPUP_MINE_ACTIVATION_RANGE - 10 };

      manager.update(state, 0.016);

      expect(mine.isActivated).toBe(true);
    });

    it('stays dormant when player is out of range and timer not expired', () => {
      const state = makeState();
      const mine = manager.createFromPlacements([
        { id: 'mine-1', type: 'popup-mine', position: { x: 400, y: 5800 }, elevation: 0 },
      ])[0];
      mine.dormantTimer = 99999;
      state.mapEnemies = [mine];
      state.players[0].position = { x: 400, y: 5800 + POPUP_MINE_ACTIVATION_RANGE + 100 };

      manager.update(state, 0.016);

      expect(mine.isActivated).toBe(false);
    });

    it('activates when dormant timer expires', () => {
      const state = makeState();
      const mine = manager.createFromPlacements([
        { id: 'mine-1', type: 'popup-mine', position: { x: 400, y: 5800 }, elevation: 0 },
      ])[0];
      mine.dormantTimer = 10; // about to expire
      state.mapEnemies = [mine];
      state.players[0].position = { x: 400, y: 9000 }; // far away

      manager.update(state, 0.016); // 16ms > 10ms timer

      expect(mine.isActivated).toBe(true);
    });

    it('animates popup progress', () => {
      const state = makeState();
      const mine = manager.createFromPlacements([
        { id: 'mine-1', type: 'popup-mine', position: { x: 400, y: 5800 }, elevation: 0 },
      ])[0];
      mine.isActivated = true;
      mine.popupProgress = 0;
      state.mapEnemies = [mine];

      manager.update(state, 0.1); // 100ms

      expect(mine.popupProgress).toBeGreaterThan(0);
      expect(mine.popupProgress).toBeLessThanOrEqual(1);
    });

    it('fires 8-directional burst when popup complete', () => {
      const state = makeState();
      const mine = manager.createFromPlacements([
        { id: 'mine-1', type: 'popup-mine', position: { x: 400, y: 5800 }, elevation: 0 },
      ])[0];
      mine.isActivated = true;
      mine.popupProgress = 1;
      mine.burstFired = false;
      state.mapEnemies = [mine];

      manager.update(state, 0.016);

      expect(state.projectiles.length).toBe(POPUP_MINE_BURST_PROJECTILES);
      expect(mine.burstFired).toBe(true);
      expect(mine.cooldownTimer).toBe(POPUP_MINE_COOLDOWN);
    });

    it('burst projectiles spread in all directions', () => {
      const state = makeState();
      const mine = manager.createFromPlacements([
        { id: 'mine-1', type: 'popup-mine', position: { x: 400, y: 5800 }, elevation: 0 },
      ])[0];
      mine.isActivated = true;
      mine.popupProgress = 1;
      mine.burstFired = false;
      state.mapEnemies = [mine];

      manager.update(state, 0.016);

      // Check that velocities point in different directions
      const angles = state.projectiles.map(p => Math.atan2(p.velocity.y, p.velocity.x));
      const uniqueAngles = new Set(angles.map(a => Math.round(a * 100)));
      expect(uniqueAngles.size).toBe(POPUP_MINE_BURST_PROJECTILES);
    });

    it('returns to dormant after cooldown', () => {
      const state = makeState();
      const mine = manager.createFromPlacements([
        { id: 'mine-1', type: 'popup-mine', position: { x: 400, y: 5800 }, elevation: 0 },
      ])[0];
      mine.isActivated = true;
      mine.popupProgress = 1;
      mine.burstFired = true;
      mine.cooldownTimer = 10; // about to expire
      state.mapEnemies = [mine];

      manager.update(state, 0.016); // 16ms > 10ms

      expect(mine.isActivated).toBe(false);
      expect(mine.popupProgress).toBe(0);
      expect(mine.burstFired).toBe(false);
      expect(mine.dormantTimer).toBeGreaterThan(0);
    });
  });

  // --- Player projectile vs enemy collisions ---

  describe('checkProjectileCollisions', () => {
    it('player projectile destroys enemy at same elevation', () => {
      const state = makeState();
      const gn = manager.createFromPlacements([
        { id: 'gn-1', type: 'gun-nest', position: { x: 400, y: 5800 }, elevation: 0 },
      ])[0];
      gn.health = 10; // low health so one shot kills
      state.mapEnemies = [gn];

      const proj = makeProjectile(400, 5800, 'player', 0);
      state.projectiles = [proj];

      manager.checkProjectileCollisions(state);

      expect(proj.hasCollided).toBe(true);
      expect(proj.isActive).toBe(false);
      expect(gn.isAlive).toBe(false);
      expect(gn.health).toBe(0);
    });

    it('awards score to firing player on kill', () => {
      const state = makeState();
      const gn = manager.createFromPlacements([
        { id: 'gn-1', type: 'gun-nest', position: { x: 400, y: 5800 }, elevation: 0 },
      ])[0];
      gn.health = 10;
      state.mapEnemies = [gn];

      const proj = makeProjectile(400, 5800, 'player', 0);
      state.projectiles = [proj];

      const scoreBefore = state.players[0].score;
      manager.checkProjectileCollisions(state);

      expect(state.players[0].score).toBe(scoreBefore + GUN_NEST_SCORE_VALUE);
      expect(state.players[0].stats.kills).toBe(1);
      expect(state.players[0].levelStats.kills).toBe(1);
    });

    it('damages enemy without killing when health remains', () => {
      const state = makeState();
      const gn = manager.createFromPlacements([
        { id: 'gn-1', type: 'gun-nest', position: { x: 400, y: 5800 }, elevation: 0 },
      ])[0];
      state.mapEnemies = [gn];

      const proj = makeProjectile(400, 5800, 'player', 0);
      proj.damage = 50;
      state.projectiles = [proj];

      manager.checkProjectileCollisions(state);

      expect(gn.isAlive).toBe(true);
      expect(gn.health).toBe(GUN_NEST_HEALTH - 50);
    });

    it('cross-elevation projectile misses enemy', () => {
      const state = makeState();
      const gn = manager.createFromPlacements([
        { id: 'gn-1', type: 'gun-nest', position: { x: 400, y: 5800 }, elevation: 1 },
      ])[0];
      state.mapEnemies = [gn];

      const proj = makeProjectile(400, 5800, 'player', 0); // elevation 0 vs enemy elevation 1
      state.projectiles = [proj];

      manager.checkProjectileCollisions(state);

      expect(proj.hasCollided).toBe(false);
      expect(gn.health).toBe(GUN_NEST_HEALTH);
    });

    it('same-elevation projectile hits enemy', () => {
      const state = makeState();
      const gn = manager.createFromPlacements([
        { id: 'gn-1', type: 'gun-nest', position: { x: 400, y: 5800 }, elevation: 1 },
      ])[0];
      state.mapEnemies = [gn];

      const proj = makeProjectile(400, 5800, 'player', 1);
      state.projectiles = [proj];

      manager.checkProjectileCollisions(state);

      expect(proj.hasCollided).toBe(true);
    });

    it('enemy projectile is ignored', () => {
      const state = makeState();
      const gn = manager.createFromPlacements([
        { id: 'gn-1', type: 'gun-nest', position: { x: 400, y: 5800 }, elevation: 0 },
      ])[0];
      state.mapEnemies = [gn];

      const proj = makeProjectile(400, 5800, 'enemy', 0);
      state.projectiles = [proj];

      manager.checkProjectileCollisions(state);

      expect(proj.hasCollided).toBe(false);
    });

    it('queues pending impact on hit', () => {
      const state = makeState();
      const gn = manager.createFromPlacements([
        { id: 'gn-1', type: 'gun-nest', position: { x: 400, y: 5800 }, elevation: 0 },
      ])[0];
      state.mapEnemies = [gn];

      const proj = makeProjectile(400, 5800, 'player', 0);
      state.projectiles = [proj];

      manager.checkProjectileCollisions(state);

      expect(state.pendingImpacts.length).toBe(1);
      expect(state.pendingImpacts[0].x).toBe(400);
    });
  });

  // --- Enemy projectile vs player ---

  describe('checkEnemyProjectileVsPlayer', () => {
    it('enemy projectile damages player at same elevation', () => {
      const state = makeState();
      state.players[0].position = { x: 400, y: 5900 };
      state.tankStates!.player1.elevation = 0;

      const proj = makeProjectile(400, 5900, 'enemy', 0);
      proj.damage = 30;
      state.projectiles = [proj];

      const healthBefore = state.players[0].health;
      manager.checkEnemyProjectileVsPlayer(state);

      expect(proj.hasCollided).toBe(true);
      expect(state.players[0].health).toBe(healthBefore - 30);
    });

    it('low-ground enemy projectile misses high-ground player (blocked by cliff)', () => {
      const state = makeState();
      state.players[0].position = { x: 400, y: 5900 };
      state.tankStates!.player1.elevation = 1;

      const proj = makeProjectile(400, 5900, 'enemy', 0);
      state.projectiles = [proj];

      const healthBefore = state.players[0].health;
      manager.checkEnemyProjectileVsPlayer(state);

      expect(proj.hasCollided).toBe(false);
      expect(state.players[0].health).toBe(healthBefore);
    });

    it('high-ground enemy projectile hits low-ground player (shooting downhill)', () => {
      const state = makeState();
      state.players[0].position = { x: 400, y: 5900 };
      state.tankStates!.player1.elevation = 0;

      const proj = makeProjectile(400, 5900, 'enemy', 1);
      proj.damage = 30;
      state.projectiles = [proj];

      const healthBefore = state.players[0].health;
      manager.checkEnemyProjectileVsPlayer(state);

      expect(proj.hasCollided).toBe(true);
      expect(state.players[0].health).toBe(healthBefore - 30);
    });

    it('skips invulnerable player', () => {
      const state = makeState();
      state.players[0].position = { x: 400, y: 5900 };
      state.players[0].isInvulnerable = true;
      state.tankStates!.player1.elevation = 0;

      const proj = makeProjectile(400, 5900, 'enemy', 0);
      state.projectiles = [proj];

      manager.checkEnemyProjectileVsPlayer(state);

      expect(proj.hasCollided).toBe(false);
    });

    it('kills player when health drops to 0', () => {
      const state = makeState();
      state.players[0].position = { x: 400, y: 5900 };
      state.players[0].health = 20;
      state.tankStates!.player1.elevation = 0;

      const proj = makeProjectile(400, 5900, 'enemy', 0);
      proj.damage = 100;
      state.projectiles = [proj];

      manager.checkEnemyProjectileVsPlayer(state);

      expect(state.players[0].isAlive).toBe(false);
      expect(state.players[0].health).toBe(0);
      expect(state.players[0].stats.deaths).toBe(1);
    });

    it('player projectile is ignored', () => {
      const state = makeState();
      state.players[0].position = { x: 400, y: 5900 };
      state.tankStates!.player1.elevation = 0;

      const proj = makeProjectile(400, 5900, 'player', 0);
      state.projectiles = [proj];

      const healthBefore = state.players[0].health;
      manager.checkEnemyProjectileVsPlayer(state);

      expect(state.players[0].health).toBe(healthBefore);
    });
  });

  // --- Projectile survival through update pipeline ---

  describe('enemy projectiles survive updateAllProjectiles', () => {
    it('enemy bullet at world coords is not killed by screen-space bounds', () => {
      const state = makeState();
      const gn = manager.createFromPlacements([
        { id: 'gn-1', type: 'gun-nest', position: { x: 400, y: 5800 }, elevation: 0 },
      ])[0];
      gn.fireCooldown = 0;
      gn.aimAngle = Math.PI / 2;
      state.mapEnemies = [gn];
      state.players[0].position = { x: 400, y: 5900 };

      // Enemy fires
      manager.update(state, 0.016);
      expect(state.projectiles.length).toBe(1);

      // Run the projectile update pipeline (which includes bounds checks)
      updateAllProjectiles(state, 0.016);

      // Projectile should survive — not killed by screen-space bounds
      expect(state.projectiles.length).toBe(1);
      expect(state.projectiles[0].isActive).toBe(true);
    });
  });

  // --- Dead enemies ---

  describe('dead enemies', () => {
    it('dead enemies do not fire', () => {
      const state = makeState();
      const gn = manager.createFromPlacements([
        { id: 'gn-1', type: 'gun-nest', position: { x: 400, y: 5800 }, elevation: 0 },
      ])[0];
      gn.isAlive = false;
      gn.fireCooldown = 0;
      state.mapEnemies = [gn];
      state.players[0].position = { x: 400, y: 5900 };

      manager.update(state, 0.5);

      expect(state.projectiles.length).toBe(0);
    });

    it('dead enemies are not hit by projectiles', () => {
      const state = makeState();
      const gn = manager.createFromPlacements([
        { id: 'gn-1', type: 'gun-nest', position: { x: 400, y: 5800 }, elevation: 0 },
      ])[0];
      gn.isAlive = false;
      state.mapEnemies = [gn];

      const proj = makeProjectile(400, 5800, 'player', 0);
      state.projectiles = [proj];

      manager.checkProjectileCollisions(state);

      expect(proj.hasCollided).toBe(false);
    });
  });

  // --- Rocket Copter ---

  describe('rocket copter', () => {
    it('creates with correct defaults', () => {
      const enemies = manager.createFromPlacements([
        { id: 'rc-1', type: 'rocket-copter', position: { x: 500, y: 5000 }, elevation: 0 },
      ]);
      const rc = enemies[0];
      expect(rc.health).toBe(ROCKET_COPTER_HEALTH);
      expect(rc.collisionRadius).toBe(ROCKET_COPTER_COLLISION_RADIUS);
      expect(rc.scoreValue).toBe(ROCKET_COPTER_SCORE_VALUE);
      expect(rc.isAerial).toBe(true);
      expect(rc.behaviorState).toBe('patrol');
      expect(rc.velocity).toBeDefined();
    });

    it('patrols horizontally and reverses at bounds', () => {
      const state = makeState();
      const rc = manager.createFromPlacements([
        { id: 'rc-1', type: 'rocket-copter', position: { x: 500, y: 5800 }, elevation: 0 },
      ])[0];
      rc.patrolMaxX = 510; // very close to max
      rc.fireCooldown = 99999;
      state.mapEnemies = [rc];
      // Place player far away so copter stays in patrol
      state.players[0].position = { x: 500, y: 6500 };

      // Move right to exceed patrolMaxX
      rc.position.x = 511;
      manager.update(state, 0.016);

      // Should have reversed direction (velocity.x should be negative)
      expect(rc.velocity!.x).toBeLessThan(0);
    });

    it('engages when player is within range', () => {
      const state = makeState();
      const rc = manager.createFromPlacements([
        { id: 'rc-1', type: 'rocket-copter', position: { x: 500, y: 5800 }, elevation: 0 },
      ])[0];
      rc.fireCooldown = 99999;
      state.mapEnemies = [rc];
      // Place player within engage range
      state.players[0].position = { x: 500, y: 5800 + ROCKET_COPTER_ENGAGE_RANGE - 50 };

      manager.update(state, 0.016);

      expect(rc.behaviorState).toBe('engage');
    });

    it('returns to patrol when player moves out of range', () => {
      const state = makeState();
      const rc = manager.createFromPlacements([
        { id: 'rc-1', type: 'rocket-copter', position: { x: 500, y: 5800 }, elevation: 0 },
      ])[0];
      rc.behaviorState = 'engage';
      rc.fireCooldown = 99999;
      state.mapEnemies = [rc];
      // Place player far beyond disengage range (1.3x engage range)
      state.players[0].position = { x: 500, y: 5800 + ROCKET_COPTER_ENGAGE_RANGE * 2 };

      manager.update(state, 0.016);

      expect(rc.behaviorState).toBe('patrol');
    });

    it('fires rocket while engaged and cooldown ready', () => {
      const state = makeState();
      const rc = manager.createFromPlacements([
        { id: 'rc-1', type: 'rocket-copter', position: { x: 500, y: 5800 }, elevation: 0 },
      ])[0];
      rc.behaviorState = 'engage';
      rc.fireCooldown = 0;
      rc.aimAngle = Math.PI / 2;
      state.mapEnemies = [rc];
      state.players[0].position = { x: 500, y: 5900 };

      manager.update(state, 0.016);

      expect(state.projectiles.length).toBe(1);
      expect(state.projectiles[0].elevation).toBe(2); // aerial projectile
      expect(rc.fireCooldown).toBe(ROCKET_COPTER_FIRE_RATE);
    });

    it('does not fire while in patrol state', () => {
      const state = makeState();
      const rc = manager.createFromPlacements([
        { id: 'rc-1', type: 'rocket-copter', position: { x: 500, y: 5800 }, elevation: 0 },
      ])[0];
      rc.behaviorState = 'patrol';
      rc.fireCooldown = 0;
      state.mapEnemies = [rc];
      state.players[0].position = { x: 500, y: 6500 }; // far away

      manager.update(state, 0.016);

      expect(state.projectiles.length).toBe(0);
    });
  });

  // --- Laser Copter ---

  describe('laser copter', () => {
    it('creates with correct defaults', () => {
      const enemies = manager.createFromPlacements([
        { id: 'lc-1', type: 'laser-copter', position: { x: 500, y: 5000 }, elevation: 0 },
      ]);
      const lc = enemies[0];
      expect(lc.health).toBe(LASER_COPTER_HEALTH);
      expect(lc.collisionRadius).toBe(LASER_COPTER_COLLISION_RADIUS);
      expect(lc.scoreValue).toBe(LASER_COPTER_SCORE_VALUE);
      expect(lc.isAerial).toBe(true);
      expect(lc.behaviorState).toBe('patrol');
    });

    it('fires rapid laser while engaged', () => {
      const state = makeState();
      const lc = manager.createFromPlacements([
        { id: 'lc-1', type: 'laser-copter', position: { x: 500, y: 5800 }, elevation: 0 },
      ])[0];
      lc.behaviorState = 'engage';
      lc.fireCooldown = 0;
      lc.aimAngle = Math.PI / 2;
      state.mapEnemies = [lc];
      state.players[0].position = { x: 500, y: 5900 };

      manager.update(state, 0.016);

      expect(state.projectiles.length).toBe(1);
      expect(lc.fireCooldown).toBe(LASER_COPTER_FIRE_RATE);
    });
  });

  // --- Spread Bomber ---

  describe('spread bomber', () => {
    it('creates with correct defaults', () => {
      const enemies = manager.createFromPlacements([
        { id: 'sb-1', type: 'spread-bomber', position: { x: 600, y: 5000 }, elevation: 0 },
      ]);
      const sb = enemies[0];
      expect(sb.health).toBe(SPREAD_BOMBER_HEALTH);
      expect(sb.collisionRadius).toBe(SPREAD_BOMBER_COLLISION_RADIUS);
      expect(sb.scoreValue).toBe(SPREAD_BOMBER_SCORE_VALUE);
      expect(sb.isAerial).toBe(true);
      expect(sb.behaviorState).toBe('flythrough');
      expect(sb.spawnY).toBe(5000);
    });

    it('moves south (increasing Y)', () => {
      const state = makeState();
      const sb = manager.createFromPlacements([
        { id: 'sb-1', type: 'spread-bomber', position: { x: 600, y: 5800 }, elevation: 0 },
      ])[0];
      sb.fireCooldown = 99999;
      state.mapEnemies = [sb];
      const yBefore = sb.position.y;

      manager.update(state, 0.1);

      expect(sb.position.y).toBeGreaterThan(yBefore);
    });

    it('drops 5-projectile spread when cooldown ready', () => {
      const state = makeState();
      const sb = manager.createFromPlacements([
        { id: 'sb-1', type: 'spread-bomber', position: { x: 600, y: 5800 }, elevation: 0 },
      ])[0];
      sb.fireCooldown = 0;
      state.mapEnemies = [sb];

      manager.update(state, 0.016);

      expect(state.projectiles.length).toBe(SPREAD_BOMBER_SPREAD_COUNT);
      // All projectiles should be aerial (elevation 2)
      for (const proj of state.projectiles) {
        expect(proj.elevation).toBe(2);
      }
    });

    it('re-enters from above viewport when exiting bottom', () => {
      const state = makeState();
      const sb = manager.createFromPlacements([
        { id: 'sb-1', type: 'spread-bomber', position: { x: 600, y: 5000 }, elevation: 0 },
      ])[0];
      sb.fireCooldown = 99999;
      // Place bomber past bottom of viewport
      sb.position.y = state.camera!.worldY + 1300;
      state.mapEnemies = [sb];

      manager.update(state, 0.016);

      // Should have re-entered above the camera viewport
      expect(sb.position.y).toBeLessThan(state.camera!.worldY);
    });
  });

  // --- Homing Bomber ---

  describe('homing bomber', () => {
    it('creates with correct defaults', () => {
      const enemies = manager.createFromPlacements([
        { id: 'hb-1', type: 'homing-bomber', position: { x: 600, y: 5000 }, elevation: 0 },
      ]);
      const hb = enemies[0];
      expect(hb.health).toBe(HOMING_BOMBER_HEALTH);
      expect(hb.collisionRadius).toBe(HOMING_BOMBER_COLLISION_RADIUS);
      expect(hb.scoreValue).toBe(HOMING_BOMBER_SCORE_VALUE);
      expect(hb.isAerial).toBe(true);
      expect(hb.behaviorState).toBe('flythrough');
    });

    it('fires homing missile toward player', () => {
      const state = makeState();
      const hb = manager.createFromPlacements([
        { id: 'hb-1', type: 'homing-bomber', position: { x: 600, y: 5800 }, elevation: 0 },
      ])[0];
      hb.fireCooldown = 0;
      state.mapEnemies = [hb];
      state.players[0].position = { x: 600, y: 5900 };

      manager.update(state, 0.016);

      expect(state.projectiles.length).toBe(1);
      expect(state.projectiles[0].isHoming).toBe(true);
      expect(state.projectiles[0].turnRate).toBeDefined();
      expect(state.projectiles[0].elevation).toBe(2);
    });

    it('homing missiles render as green (type = missile)', () => {
      const state = makeState();
      const hb = manager.createFromPlacements([
        { id: 'hb-1', type: 'homing-bomber', position: { x: 600, y: 5800 }, elevation: 0 },
      ])[0];
      hb.fireCooldown = 0;
      state.mapEnemies = [hb];
      state.players[0].position = { x: 600, y: 5900 };

      manager.update(state, 0.016);

      expect(state.projectiles[0].type).toBe('missile');
    });
  });

  // --- Hover Tank ---

  describe('hover tank', () => {
    it('creates with correct defaults', () => {
      const enemies = manager.createFromPlacements([
        { id: 'ht-1', type: 'hover-tank', position: { x: 500, y: 5000 }, elevation: 0 },
      ]);
      const ht = enemies[0];
      expect(ht.health).toBe(HOVER_TANK_HEALTH);
      expect(ht.collisionRadius).toBe(HOVER_TANK_COLLISION_RADIUS);
      expect(ht.scoreValue).toBe(HOVER_TANK_SCORE_VALUE);
      expect(ht.isAerial).toBe(false);
      expect(ht.behaviorState).toBe('patrol');
    });

    it('patrols horizontally', () => {
      const state = makeState();
      const ht = manager.createFromPlacements([
        { id: 'ht-1', type: 'hover-tank', position: { x: 500, y: 5800 }, elevation: 0 },
      ])[0];
      ht.fireCooldown = 99999;
      state.mapEnemies = [ht];
      const xBefore = ht.position.x;

      manager.update(state, 0.1);

      expect(ht.position.x).not.toBe(xBefore);
    });

    it('reverses at patrol bounds', () => {
      const state = makeState();
      const ht = manager.createFromPlacements([
        { id: 'ht-1', type: 'hover-tank', position: { x: 500, y: 5800 }, elevation: 0 },
      ])[0];
      ht.patrolMaxX = 510;
      ht.position.x = 511;
      ht.fireCooldown = 99999;
      state.mapEnemies = [ht];

      manager.update(state, 0.016);

      expect(ht.velocity!.x).toBeLessThan(0);
    });

    it('fires plasma when cooldown ready and player in range', () => {
      const state = makeState();
      const ht = manager.createFromPlacements([
        { id: 'ht-1', type: 'hover-tank', position: { x: 500, y: 5800 }, elevation: 0 },
      ])[0];
      ht.fireCooldown = 0;
      ht.aimAngle = Math.PI / 2;
      state.mapEnemies = [ht];
      state.players[0].position = { x: 500, y: 5900 };

      manager.update(state, 0.016);

      expect(state.projectiles.length).toBe(1);
      expect(state.projectiles[0].type).toBe('plasma');
      expect(ht.fireCooldown).toBe(HOVER_TANK_FIRE_RATE);
    });

    it('is pushed out of boulders during patrol', () => {
      const state = makeState();
      const ht = manager.createFromPlacements([
        { id: 'ht-1', type: 'hover-tank', position: { x: 500, y: 5800 }, elevation: 0 },
      ])[0];
      ht.fireCooldown = 99999;
      state.mapEnemies = [ht];
      // Place a boulder overlapping the hover tank
      state.map = {
        totalHeight: 8000,
        surfaceTexture: 'mars-surface',
        startPosition: { x: 600, y: 7800 },
        finishLineY: 200,
        objects: [
          { id: 'b-test', type: 'boulder', position: { x: 500, y: 5800 }, width: 200, height: 200, collisionRadius: 80, sprite: 'rocks-1' },
        ],
        clouds: [],
        dustEffects: [],
        cliffs: [],
        enemyPlacements: [],
      };

      manager.update(state, 0.016);

      // Tank should have been pushed away from boulder center
      const dx = ht.position.x - 500;
      const dy = ht.position.y - 5800;
      const dist = Math.sqrt(dx * dx + dy * dy);
      expect(dist).toBeGreaterThanOrEqual(80 + HOVER_TANK_COLLISION_RADIUS - 1);
    });

    it('reverses direction when hitting a boulder', () => {
      const state = makeState();
      const ht = manager.createFromPlacements([
        { id: 'ht-1', type: 'hover-tank', position: { x: 505, y: 5800 }, elevation: 0 },
      ])[0];
      ht.fireCooldown = 99999;
      const initialVx = ht.velocity!.x;
      state.mapEnemies = [ht];
      // Place a boulder close enough to collide
      state.map = {
        totalHeight: 8000,
        surfaceTexture: 'mars-surface',
        startPosition: { x: 600, y: 7800 },
        finishLineY: 200,
        objects: [
          { id: 'b-test', type: 'boulder', position: { x: 500, y: 5800 }, width: 200, height: 200, collisionRadius: 80, sprite: 'rocks-1' },
        ],
        clouds: [],
        dustEffects: [],
        cliffs: [],
        enemyPlacements: [],
      };

      manager.update(state, 0.016);

      // Velocity should have reversed
      expect(ht.velocity!.x).toBe(-initialVx);
    });

    it('ignores destroyed destructible rocks', () => {
      const state = makeState();
      const ht = manager.createFromPlacements([
        { id: 'ht-1', type: 'hover-tank', position: { x: 500, y: 5800 }, elevation: 0 },
      ])[0];
      ht.fireCooldown = 99999;
      const xBefore = ht.position.x;
      state.mapEnemies = [ht];
      state.map = {
        totalHeight: 8000,
        surfaceTexture: 'mars-surface',
        startPosition: { x: 600, y: 7800 },
        finishLineY: 200,
        objects: [
          { id: 'dr-test', type: 'destructible-rock', position: { x: 500, y: 5800 }, width: 40, height: 40, health: 0, maxHealth: 200, collisionRadius: 20, sprite: 'rocks-3' },
        ],
        clouds: [],
        dustEffects: [],
        cliffs: [],
        enemyPlacements: [],
      };

      manager.update(state, 0.1);

      // Should have moved normally (not pushed out) since rock is destroyed
      expect(ht.position.x).not.toBe(xBefore);
    });

    it('respects elevation for collisions (ground enemy)', () => {
      const state = makeState();
      const ht = manager.createFromPlacements([
        { id: 'ht-1', type: 'hover-tank', position: { x: 400, y: 5800 }, elevation: 1 },
      ])[0];
      state.mapEnemies = [ht];

      // Projectile at elevation 0 should miss elevation 1 hover tank
      const proj = makeProjectile(400, 5800, 'player', 0);
      state.projectiles = [proj];

      manager.checkProjectileCollisions(state);

      expect(proj.hasCollided).toBe(false);
    });
  });

  // --- Aerial collision rules ---

  describe('aerial collision rules', () => {
    it('player projectile hits aerial enemy regardless of elevation', () => {
      const state = makeState();
      const rc = manager.createFromPlacements([
        { id: 'rc-1', type: 'rocket-copter', position: { x: 400, y: 5800 }, elevation: 0 },
      ])[0];
      rc.health = 10;
      state.mapEnemies = [rc];

      // Projectile at elevation 0 hitting aerial enemy should still connect
      const proj = makeProjectile(400, 5800, 'player', 0);
      state.projectiles = [proj];

      manager.checkProjectileCollisions(state);

      expect(proj.hasCollided).toBe(true);
      expect(rc.isAlive).toBe(false);
    });

    it('player projectile at elevation 1 hits aerial enemy', () => {
      const state = makeState();
      const sb = manager.createFromPlacements([
        { id: 'sb-1', type: 'spread-bomber', position: { x: 400, y: 5800 }, elevation: 0 },
      ])[0];
      sb.health = 10;
      state.mapEnemies = [sb];

      const proj = makeProjectile(400, 5800, 'player', 1);
      state.projectiles = [proj];

      manager.checkProjectileCollisions(state);

      expect(proj.hasCollided).toBe(true);
    });

    it('aerial projectiles (elevation 2) hit ground players', () => {
      const state = makeState();
      state.players[0].position = { x: 400, y: 5900 };
      state.tankStates!.player1.elevation = 0;

      const proj = makeProjectile(400, 5900, 'enemy', 2);
      proj.damage = 30;
      state.projectiles = [proj];

      const healthBefore = state.players[0].health;
      manager.checkEnemyProjectileVsPlayer(state);

      expect(proj.hasCollided).toBe(true);
      expect(state.players[0].health).toBe(healthBefore - 30);
    });

    it('aerial projectiles (elevation 2) hit high-ground players', () => {
      const state = makeState();
      state.players[0].position = { x: 400, y: 5900 };
      state.tankStates!.player1.elevation = 1;

      const proj = makeProjectile(400, 5900, 'enemy', 2);
      proj.damage = 30;
      state.projectiles = [proj];

      const healthBefore = state.players[0].health;
      manager.checkEnemyProjectileVsPlayer(state);

      expect(proj.hasCollided).toBe(true);
      expect(state.players[0].health).toBe(healthBefore - 30);
    });
  });
});
