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

    it('cross-elevation enemy projectile misses player', () => {
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
      expect(state.players[0].lives).toBeLessThan(3); // lost a life
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
});
