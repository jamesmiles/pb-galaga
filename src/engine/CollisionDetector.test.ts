import { describe, it, expect } from 'vitest';
import { detectCollisions } from './CollisionDetector';
import { createInitialState, createPlayer } from './StateManager';
import { createEnemyA } from '../objects/enemies/enemyA/code/EnemyA';
import { createLaser, createEnemyLaser } from '../objects/projectiles/laser/code/Laser';
import { createBullet } from '../objects/projectiles/bullet/code/Bullet';

describe('CollisionDetector', () => {
  describe('player-enemy collisions', () => {
    it('detects collision when player and enemy overlap', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isInvulnerable = false;
      player.position = { x: 100, y: 100 };
      state.players = [player];

      const enemy = createEnemyA(0, 0);
      enemy.position = { x: 100, y: 100 }; // Same position
      state.enemies = [enemy];

      detectCollisions(state);

      expect(player.isAlive).toBe(false);
      expect(enemy.isAlive).toBe(false);
    });

    it('does not collide when far apart', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isInvulnerable = false;
      player.position = { x: 100, y: 100 };
      state.players = [player];

      const enemy = createEnemyA(0, 0);
      enemy.position = { x: 400, y: 400 };
      state.enemies = [enemy];

      detectCollisions(state);

      expect(player.isAlive).toBe(true);
      expect(enemy.isAlive).toBe(true);
    });

    it('does not damage invulnerable player', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isInvulnerable = true;
      player.position = { x: 100, y: 100 };
      state.players = [player];

      const enemy = createEnemyA(0, 0);
      enemy.position = { x: 100, y: 100 };
      state.enemies = [enemy];

      detectCollisions(state);

      expect(player.isAlive).toBe(true);
      expect(player.health).toBe(player.maxHealth);
    });
  });

  describe('projectile-enemy collisions', () => {
    it('laser destroys enemy and awards score', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isInvulnerable = false;
      state.players = [player];

      const enemy = createEnemyA(0, 0);
      enemy.position = { x: 200, y: 200 };
      state.enemies = [enemy];

      const laser = createLaser({ x: 200, y: 200 }, { type: 'player', id: 'player1' });
      state.projectiles = [laser];

      detectCollisions(state);

      expect(enemy.isAlive).toBe(false);
      expect(laser.hasCollided).toBe(true);
      expect(laser.isActive).toBe(false);
      expect(player.score).toBe(100);
    });

    it('laser only hits one enemy', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      state.players = [player];

      const enemy1 = createEnemyA(0, 0);
      enemy1.position = { x: 200, y: 200 };
      const enemy2 = createEnemyA(0, 1);
      enemy2.position = { x: 200, y: 200 }; // Same position
      state.enemies = [enemy1, enemy2];

      const laser = createLaser({ x: 200, y: 200 }, { type: 'player', id: 'player1' });
      state.projectiles = [laser];

      detectCollisions(state);

      const deadCount = state.enemies.filter(e => !e.isAlive).length;
      expect(deadCount).toBe(1);
    });
  });

  describe('enemy projectile-player collisions', () => {
    it('enemy laser damages player and deactivates projectile', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isInvulnerable = false;
      player.position = { x: 200, y: 500 };
      state.players = [player];

      const enemyLaser = createEnemyLaser({ x: 200, y: 500 }, { type: 'enemy', id: 'enemy-1' });
      state.projectiles = [enemyLaser];

      detectCollisions(state);

      expect(player.health).toBe(player.maxHealth - enemyLaser.damage);
      expect(enemyLaser.hasCollided).toBe(true);
      expect(enemyLaser.isActive).toBe(false);
    });

    it('enemy bullet damages player and deactivates projectile', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isInvulnerable = false;
      player.position = { x: 200, y: 500 };
      state.players = [player];

      const bullet = createBullet({ x: 200, y: 500 }, { type: 'enemy', id: 'enemy-1' });
      state.projectiles = [bullet];

      detectCollisions(state);

      expect(player.health).toBe(player.maxHealth - bullet.damage);
      expect(bullet.hasCollided).toBe(true);
      expect(bullet.isActive).toBe(false);
    });

    it('enemy projectile kills player when health is low', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isInvulnerable = false;
      player.health = 30; // Less than laser damage (50)
      player.position = { x: 200, y: 500 };
      state.players = [player];

      const enemyLaser = createEnemyLaser({ x: 200, y: 500 }, { type: 'enemy', id: 'enemy-1' });
      state.projectiles = [enemyLaser];

      detectCollisions(state);

      expect(player.isAlive).toBe(false);
      expect(player.health).toBe(0);
    });

    it('does not damage invulnerable player', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isInvulnerable = true;
      player.position = { x: 200, y: 500 };
      state.players = [player];

      const enemyLaser = createEnemyLaser({ x: 200, y: 500 }, { type: 'enemy', id: 'enemy-1' });
      state.projectiles = [enemyLaser];

      detectCollisions(state);

      expect(player.isAlive).toBe(true);
      expect(player.health).toBe(player.maxHealth);
      expect(enemyLaser.isActive).toBe(true);
    });

    it('does not hit when far apart', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isInvulnerable = false;
      player.position = { x: 100, y: 100 };
      state.players = [player];

      const enemyLaser = createEnemyLaser({ x: 500, y: 500 }, { type: 'enemy', id: 'enemy-1' });
      state.projectiles = [enemyLaser];

      detectCollisions(state);

      expect(player.isAlive).toBe(true);
      expect(enemyLaser.isActive).toBe(true);
    });

    it('player projectiles do not hit players', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isInvulnerable = false;
      player.position = { x: 200, y: 500 };
      state.players = [player];

      const playerLaser = createLaser({ x: 200, y: 500 }, { type: 'player', id: 'player1' });
      state.projectiles = [playerLaser];
      state.enemies = []; // No enemies to hit

      detectCollisions(state);

      expect(player.isAlive).toBe(true);
      expect(playerLaser.isActive).toBe(true);
    });
  });

  describe('player-pickup collisions', () => {
    it('collects pickup when player overlaps', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.position = { x: 200, y: 200 };
      state.players = [player];

      state.weaponPickups = [{
        id: 'wp-1',
        category: 'primary' as const,
        currentWeapon: 'laser' as const,
        position: { x: 200, y: 200 },
        velocity: { x: 0, y: 60 },
        isActive: true,
        cycleTimer: 5000,
        lifetime: 0,
      }];

      detectCollisions(state);

      expect(state.weaponPickups[0].isActive).toBe(false);
    });

    it('does not collect when far apart', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.position = { x: 100, y: 100 };
      state.players = [player];

      state.weaponPickups = [{
        id: 'wp-1',
        category: 'primary' as const,
        currentWeapon: 'laser' as const,
        position: { x: 500, y: 500 },
        velocity: { x: 0, y: 60 },
        isActive: true,
        cycleTimer: 5000,
        lifetime: 0,
      }];

      detectCollisions(state);

      expect(state.weaponPickups[0].isActive).toBe(true);
    });
  });

  describe('player-asteroid collisions', () => {
    it('damages player and destroys asteroid on collision', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isInvulnerable = false;
      player.position = { x: 200, y: 200 };
      state.players = [player];

      state.asteroids = [{
        id: 'ast-1',
        size: 'small' as const,
        position: { x: 200, y: 200 },
        velocity: { x: 0, y: 50 },
        rotation: 0,
        rotationSpeed: 0.5,
        health: 100,
        maxHealth: 100,
        collisionRadius: 12,
        isAlive: true,
        scoreValue: 50,
      }];

      const healthBefore = player.health;
      detectCollisions(state);

      expect(player.health).toBeLessThan(healthBefore);
      expect(state.asteroids[0].isAlive).toBe(false);
    });

    it('does not damage invulnerable player', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      player.isInvulnerable = true;
      player.position = { x: 200, y: 200 };
      state.players = [player];

      state.asteroids = [{
        id: 'ast-1',
        size: 'small' as const,
        position: { x: 200, y: 200 },
        velocity: { x: 0, y: 50 },
        rotation: 0,
        rotationSpeed: 0.5,
        health: 100,
        maxHealth: 100,
        collisionRadius: 12,
        isAlive: true,
        scoreValue: 50,
      }];

      detectCollisions(state);

      expect(player.health).toBe(player.maxHealth);
    });
  });

  describe('projectile-asteroid collisions', () => {
    it('player projectile damages asteroid', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      state.players = [player];

      const laser = createLaser({ x: 200, y: 200 }, { type: 'player', id: 'player1' });
      state.projectiles = [laser];

      state.asteroids = [{
        id: 'ast-1',
        size: 'large' as const,
        position: { x: 200, y: 200 },
        velocity: { x: 0, y: 50 },
        rotation: 0,
        rotationSpeed: 0.5,
        health: 300,
        maxHealth: 300,
        collisionRadius: 24,
        isAlive: true,
        scoreValue: 150,
      }];

      detectCollisions(state);

      expect(laser.hasCollided).toBe(true);
      expect(state.asteroids[0].health).toBeLessThan(300);
      expect(state.asteroids[0].isAlive).toBe(true); // Not destroyed yet (300 - 50 = 250)
    });

    it('destroys asteroid at 0 HP and awards score', () => {
      const state = createInitialState();
      const player = createPlayer('player1');
      state.players = [player];

      const laser = createLaser({ x: 200, y: 200 }, { type: 'player', id: 'player1' });
      state.projectiles = [laser];

      state.asteroids = [{
        id: 'ast-1',
        size: 'small' as const,
        position: { x: 200, y: 200 },
        velocity: { x: 0, y: 50 },
        rotation: 0,
        rotationSpeed: 0.5,
        health: 30, // Less than laser damage (50)
        maxHealth: 100,
        collisionRadius: 12,
        isAlive: true,
        scoreValue: 50,
      }];

      detectCollisions(state);

      expect(state.asteroids[0].isAlive).toBe(false);
      expect(player.score).toBe(50); // Score awarded
    });

    it('enemy projectile passes through asteroid', () => {
      const state = createInitialState();
      state.players = [createPlayer('player1')];

      const bullet = createBullet({ x: 200, y: 200 }, { type: 'enemy', id: 'enemy-1' });
      state.projectiles = [bullet];

      state.asteroids = [{
        id: 'ast-1',
        size: 'small' as const,
        position: { x: 200, y: 200 },
        velocity: { x: 0, y: 50 },
        rotation: 0,
        rotationSpeed: 0.5,
        health: 100,
        maxHealth: 100,
        collisionRadius: 12,
        isAlive: true,
        scoreValue: 50,
      }];

      detectCollisions(state);

      expect(bullet.isActive).toBe(true);
      expect(bullet.hasCollided).toBe(false);
      expect(state.asteroids[0].health).toBe(100);
    });
  });
});
