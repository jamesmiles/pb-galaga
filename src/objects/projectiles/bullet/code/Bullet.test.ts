import { describe, it, expect } from 'vitest';
import { createBullet } from './Bullet';
import { createLaser, updateProjectile, updateAllProjectiles } from '../../laser/code/Laser';
import { createInitialState } from '../../../../engine/StateManager';
import { BULLET_SPEED, BULLET_DAMAGE, BULLET_COLLISION_RADIUS, GAME_HEIGHT } from '../../../../engine/constants';

describe('Bullet', () => {
  describe('createBullet', () => {
    it('creates a bullet at the given position', () => {
      const bullet = createBullet({ x: 100, y: 200 }, { type: 'enemy', id: 'enemy-1' });
      expect(bullet.position.x).toBe(100);
      expect(bullet.position.y).toBe(200);
      expect(bullet.type).toBe('bullet');
      expect(bullet.isActive).toBe(true);
    });

    it('moves downward (positive Y velocity)', () => {
      const bullet = createBullet({ x: 100, y: 200 }, { type: 'enemy', id: 'enemy-1' });
      expect(bullet.velocity.y).toBe(BULLET_SPEED);
      expect(bullet.velocity.y).toBeGreaterThan(0);
    });

    it('has correct damage and collision radius', () => {
      const bullet = createBullet({ x: 0, y: 0 }, { type: 'enemy', id: 'enemy-1' });
      expect(bullet.damage).toBe(BULLET_DAMAGE);
      expect(bullet.collisionRadius).toBe(BULLET_COLLISION_RADIUS);
    });

    it('generates unique IDs', () => {
      const a = createBullet({ x: 0, y: 0 }, { type: 'enemy', id: 'e1' });
      const b = createBullet({ x: 0, y: 0 }, { type: 'enemy', id: 'e2' });
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('bullet movement (reuses updateProjectile)', () => {
    it('moves bullet downward', () => {
      const bullet = createBullet({ x: 100, y: 100 }, { type: 'enemy', id: 'e1' });
      updateProjectile(bullet, 1 / 60);
      expect(bullet.position.y).toBeGreaterThan(100);
    });

    it('increments lifetime', () => {
      const bullet = createBullet({ x: 100, y: 100 }, { type: 'enemy', id: 'e1' });
      updateProjectile(bullet, 1 / 60);
      expect(bullet.lifetime).toBeGreaterThan(0);
    });

    it('deactivates when off-screen (below)', () => {
      const bullet = createBullet({ x: 100, y: GAME_HEIGHT + 25 }, { type: 'enemy', id: 'e1' });
      updateProjectile(bullet, 1 / 60);
      expect(bullet.isActive).toBe(false);
    });

    it('deactivates when lifetime expires', () => {
      const bullet = createBullet({ x: 100, y: 100 }, { type: 'enemy', id: 'e1' });
      bullet.lifetime = bullet.maxLifetime;
      updateProjectile(bullet, 1 / 60);
      expect(bullet.isActive).toBe(false);
    });
  });

  describe('mixed projectile updates', () => {
    it('handles bullets and lasers in the same state', () => {
      const state = createInitialState();
      const bullet = createBullet({ x: 100, y: 100 }, { type: 'enemy', id: 'e1' });
      const laser = createLaser({ x: 200, y: 300 }, { type: 'player', id: 'player1' });
      state.projectiles = [bullet, laser];

      updateAllProjectiles(state, 1 / 60);

      expect(state.projectiles.length).toBe(2);
      // Bullet moved down, laser moved up
      expect(state.projectiles[0].position.y).toBeGreaterThan(100);
      expect(state.projectiles[1].position.y).toBeLessThan(300);
    });
  });
});
