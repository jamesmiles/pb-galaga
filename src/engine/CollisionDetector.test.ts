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
});
