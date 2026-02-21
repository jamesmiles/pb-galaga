import { describe, it, expect } from 'vitest';
import { createCannonShell } from './Cannon';
import { updateProjectile } from '../../laser/code/Laser';
import { CANNON_SPEED, CANNON_DAMAGE, CANNON_COLLISION_RADIUS, CANNON_RANGE } from '../../../../engine/constants';

const owner = { type: 'player' as const, id: 'player1' };

describe('Cannon Shell', () => {
  describe('createCannonShell', () => {
    it('creates a shell at the given position', () => {
      const shell = createCannonShell({ x: 400, y: 6000 }, Math.PI / 2, owner);
      expect(shell.position.x).toBe(400);
      expect(shell.position.y).toBe(6000);
      expect(shell.type).toBe('cannon-shell');
      expect(shell.isActive).toBe(true);
      expect(shell.hasCollided).toBe(false);
    });

    it('has correct damage and collision radius', () => {
      const shell = createCannonShell({ x: 0, y: 0 }, 0, owner);
      expect(shell.damage).toBe(CANNON_DAMAGE);
      expect(shell.collisionRadius).toBe(CANNON_COLLISION_RADIUS);
    });

    it('generates unique IDs', () => {
      const a = createCannonShell({ x: 0, y: 0 }, 0, owner);
      const b = createCannonShell({ x: 0, y: 0 }, 0, owner);
      expect(a.id).not.toBe(b.id);
    });

    it('has maxLifetime derived from range / speed', () => {
      const shell = createCannonShell({ x: 0, y: 0 }, 0, owner);
      const expectedLifetime = (CANNON_RANGE / CANNON_SPEED) * 1000;
      expect(shell.maxLifetime).toBe(expectedLifetime);
    });

    it('does not have arcGravity', () => {
      const shell = createCannonShell({ x: 0, y: 0 }, 0, owner);
      expect(shell.arcGravity).toBeUndefined();
    });
  });

  describe('direction from turret angle', () => {
    it('fires north (PI/2) — negative Y velocity', () => {
      const shell = createCannonShell({ x: 400, y: 6000 }, Math.PI / 2, owner);
      expect(shell.velocity.y).toBeLessThan(0);
      expect(Math.abs(shell.velocity.x)).toBeLessThan(0.01);
    });

    it('fires east (0) — positive X velocity', () => {
      const shell = createCannonShell({ x: 400, y: 6000 }, 0, owner);
      expect(shell.velocity.x).toBeCloseTo(CANNON_SPEED);
      expect(Math.abs(shell.velocity.y)).toBeLessThan(0.01);
    });

    it('fires northwest (3PI/4) — negative X and negative Y', () => {
      const shell = createCannonShell({ x: 400, y: 6000 }, (3 * Math.PI) / 4, owner);
      expect(shell.velocity.x).toBeLessThan(0);
      expect(shell.velocity.y).toBeLessThan(0);
    });
  });

  describe('movement and lifetime', () => {
    it('moves in the firing direction', () => {
      const shell = createCannonShell({ x: 400, y: 6000 }, Math.PI / 2, owner);
      const startY = shell.position.y;
      updateProjectile(shell, 1 / 60);
      expect(shell.position.y).toBeLessThan(startY);
      expect(shell.isActive).toBe(true);
    });

    it('travels approximately CANNON_RANGE before expiring', () => {
      const shell = createCannonShell({ x: 400, y: 6000 }, Math.PI / 2, owner);
      const startY = shell.position.y;
      const dt = 1 / 60;

      // Step until hasCollided (terminal range)
      let steps = 0;
      while (!shell.hasCollided && steps < 10000) {
        updateProjectile(shell, dt);
        steps++;
      }

      const distanceTraveled = Math.abs(shell.position.y - startY);
      // Should be within ~10% of CANNON_RANGE (accounting for discrete timesteps)
      expect(distanceTraveled).toBeGreaterThan(CANNON_RANGE * 0.9);
      expect(distanceTraveled).toBeLessThan(CANNON_RANGE * 1.1);
    });

    it('sets hasCollided at terminal range (ground impact)', () => {
      const shell = createCannonShell({ x: 400, y: 6000 }, Math.PI / 2, owner);
      const dt = 1 / 60;

      while (!shell.hasCollided) {
        updateProjectile(shell, dt);
      }

      // hasCollided is true but shell is still active for one frame
      expect(shell.hasCollided).toBe(true);
      expect(shell.isActive).toBe(true);
    });

    it('deactivates one frame after hasCollided (renderer detection window)', () => {
      const shell = createCannonShell({ x: 400, y: 6000 }, Math.PI / 2, owner);
      const dt = 1 / 60;

      while (!shell.hasCollided) {
        updateProjectile(shell, dt);
      }

      // One more tick: hasCollided check deactivates it
      updateProjectile(shell, dt);
      expect(shell.isActive).toBe(false);
    });

    it('stays in world-space bounds (not killed by screen-space check)', () => {
      // Shell at world Y=6000 firing north — should NOT be killed by GAME_HEIGHT check
      const shell = createCannonShell({ x: 400, y: 6000 }, Math.PI / 2, owner);
      updateProjectile(shell, 1 / 60);
      expect(shell.isActive).toBe(true);
      expect(shell.position.y).toBeGreaterThan(800); // Still well above screen-space bounds
    });
  });
});
