import { describe, it, expect } from 'vitest';
import { createPlasmaBolt } from './PlasmaBolt';
import { createCannonShell } from '../../cannon/code/Cannon';
import { updateProjectile } from '../../laser/code/Laser';
import { PLASMA_BOLT_SPEED, PLASMA_BOLT_DAMAGE, PLASMA_BOLT_COLLISION_RADIUS, PLASMA_BOLT_RANGE } from '../../../../engine/constants';

const owner = { type: 'player' as const, id: 'player2' };

describe('Plasma Bolt', () => {
  describe('createPlasmaBolt', () => {
    it('creates a bolt at the given position', () => {
      const bolt = createPlasmaBolt({ x: 400, y: 6000 }, Math.PI / 2, owner);
      expect(bolt.position.x).toBe(400);
      expect(bolt.position.y).toBe(6000);
      expect(bolt.type).toBe('plasma-bolt');
      expect(bolt.isActive).toBe(true);
      expect(bolt.hasCollided).toBe(false);
    });

    it('has correct damage and collision radius', () => {
      const bolt = createPlasmaBolt({ x: 0, y: 0 }, 0, owner);
      expect(bolt.damage).toBe(PLASMA_BOLT_DAMAGE);
      expect(bolt.collisionRadius).toBe(PLASMA_BOLT_COLLISION_RADIUS);
    });

    it('generates unique IDs', () => {
      const a = createPlasmaBolt({ x: 0, y: 0 }, 0, owner);
      const b = createPlasmaBolt({ x: 0, y: 0 }, 0, owner);
      expect(a.id).not.toBe(b.id);
    });

    it('has maxLifetime derived from range / speed', () => {
      const bolt = createPlasmaBolt({ x: 0, y: 0 }, 0, owner);
      const expectedLifetime = (PLASMA_BOLT_RANGE / PLASMA_BOLT_SPEED) * 1000;
      expect(bolt.maxLifetime).toBe(expectedLifetime);
    });

    it('does not have arcGravity', () => {
      const bolt = createPlasmaBolt({ x: 0, y: 0 }, 0, owner);
      expect(bolt.arcGravity).toBeUndefined();
    });

    it('has higher damage than cannon', () => {
      // Plasma is the short-range high-damage option
      expect(PLASMA_BOLT_DAMAGE).toBeGreaterThan(80); // cannon damage
    });

    it('has shorter range than cannon', () => {
      expect(PLASMA_BOLT_RANGE).toBeLessThan(400); // cannon range
    });
  });

  describe('direction from turret angle', () => {
    it('fires north (PI/2) — negative Y velocity', () => {
      const bolt = createPlasmaBolt({ x: 400, y: 6000 }, Math.PI / 2, owner);
      expect(bolt.velocity.y).toBeLessThan(0);
      expect(Math.abs(bolt.velocity.x)).toBeLessThan(0.01);
    });

    it('fires west (PI) — negative X velocity', () => {
      const bolt = createPlasmaBolt({ x: 400, y: 6000 }, Math.PI, owner);
      expect(bolt.velocity.x).toBeLessThan(0);
      expect(Math.abs(bolt.velocity.y)).toBeLessThan(0.01);
    });
  });

  describe('movement and lifetime', () => {
    it('moves in the firing direction', () => {
      const bolt = createPlasmaBolt({ x: 400, y: 6000 }, Math.PI / 2, owner);
      const startY = bolt.position.y;
      updateProjectile(bolt, 1 / 60);
      expect(bolt.position.y).toBeLessThan(startY);
      expect(bolt.isActive).toBe(true);
    });

    it('travels approximately PLASMA_BOLT_RANGE before expiring', () => {
      const bolt = createPlasmaBolt({ x: 400, y: 6000 }, Math.PI / 2, owner);
      const startY = bolt.position.y;
      const dt = 1 / 60;

      let steps = 0;
      while (!bolt.hasCollided && steps < 10000) {
        updateProjectile(bolt, dt);
        steps++;
      }

      const distanceTraveled = Math.abs(bolt.position.y - startY);
      expect(distanceTraveled).toBeGreaterThan(PLASMA_BOLT_RANGE * 0.9);
      expect(distanceTraveled).toBeLessThan(PLASMA_BOLT_RANGE * 1.1);
    });

    it('sets hasCollided at terminal range (ground impact)', () => {
      const bolt = createPlasmaBolt({ x: 400, y: 6000 }, Math.PI / 2, owner);
      const dt = 1 / 60;

      while (!bolt.hasCollided) {
        updateProjectile(bolt, dt);
      }

      expect(bolt.hasCollided).toBe(true);
      expect(bolt.isActive).toBe(true); // Stays active one frame
    });

    it('deactivates one frame after hasCollided', () => {
      const bolt = createPlasmaBolt({ x: 400, y: 6000 }, Math.PI / 2, owner);
      const dt = 1 / 60;

      while (!bolt.hasCollided) {
        updateProjectile(bolt, dt);
      }

      updateProjectile(bolt, dt);
      expect(bolt.isActive).toBe(false);
    });

    it('expires sooner than cannon (shorter range)', () => {
      const cannon = createCannonShell({ x: 400, y: 6000 }, Math.PI / 2, owner);
      const bolt = createPlasmaBolt({ x: 400, y: 6000 }, Math.PI / 2, owner);

      expect(bolt.maxLifetime).toBeLessThan(cannon.maxLifetime);
    });
  });
});
