import { describe, it, expect, beforeEach } from 'vitest';
import { createLaser, updateProjectile, resetLaserIdCounter } from '../../../src/objects/projectiles/laser/code/Laser';
import { LASER_SPEED, LASER_DAMAGE, LASER_MAX_LIFETIME } from '../../../src/engine/constants';

describe('Laser', () => {
  beforeEach(() => {
    resetLaserIdCounter();
  });

  it('creates laser with correct properties', () => {
    const laser = createLaser({ type: 'player', id: 'player1' }, { x: 100, y: 200 });

    expect(laser.type).toBe('laser');
    expect(laser.owner).toEqual({ type: 'player', id: 'player1' });
    expect(laser.position).toEqual({ x: 100, y: 200 });
    expect(laser.speed).toBe(LASER_SPEED);
    expect(laser.damage).toBe(LASER_DAMAGE);
    expect(laser.isActive).toBe(true);
    expect(laser.lifetime).toBe(0);
  });

  it('player laser moves upward', () => {
    const laser = createLaser({ type: 'player', id: 'player1' }, { x: 100, y: 200 });
    expect(laser.velocity.y).toBeLessThan(0);

    updateProjectile(laser, 1/60);
    expect(laser.position.y).toBeLessThan(200);
  });

  it('enemy laser moves downward', () => {
    const laser = createLaser({ type: 'enemy', id: 'e1' }, { x: 100, y: 200 });
    expect(laser.velocity.y).toBeGreaterThan(0);

    updateProjectile(laser, 1/60);
    expect(laser.position.y).toBeGreaterThan(200);
  });

  it('lifetime increases with updates', () => {
    const laser = createLaser({ type: 'player', id: 'player1' }, { x: 100, y: 300 });
    updateProjectile(laser, 0.5);

    expect(laser.lifetime).toBeGreaterThan(0);
  });

  it('deactivates when lifetime exceeded', () => {
    const laser = createLaser({ type: 'player', id: 'player1' }, { x: 100, y: 300 });

    // Advance past max lifetime
    updateProjectile(laser, (LASER_MAX_LIFETIME / 1000) + 0.1);

    expect(laser.isActive).toBe(false);
  });

  it('deactivates when off screen', () => {
    const laser = createLaser({ type: 'player', id: 'player1' }, { x: 100, y: 0 });

    // Move upward past top of screen
    for (let i = 0; i < 10; i++) {
      updateProjectile(laser, 1/60);
    }

    // After enough frames, laser should be off screen and deactivated
    // At 500 px/sec upward, after ~0.1s it moves ~50px. Still on screen.
    // Need more frames
    for (let i = 0; i < 600; i++) {
      updateProjectile(laser, 1/60);
    }

    expect(laser.isActive).toBe(false);
  });

  it('does not update inactive laser', () => {
    const laser = createLaser({ type: 'player', id: 'player1' }, { x: 100, y: 300 });
    laser.isActive = false;
    const startY = laser.position.y;

    updateProjectile(laser, 1/60);
    expect(laser.position.y).toBe(startY);
  });

  it('generates unique IDs', () => {
    const l1 = createLaser({ type: 'player', id: 'player1' }, { x: 0, y: 0 });
    const l2 = createLaser({ type: 'player', id: 'player1' }, { x: 0, y: 0 });
    expect(l1.id).not.toBe(l2.id);
  });
});
