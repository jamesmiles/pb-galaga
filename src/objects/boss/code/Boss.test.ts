import { describe, it, expect } from 'vitest';
import { createBoss } from './Boss';
import { BOSS_HEALTH, BOSS_TURRET_HEALTH, BOSS_WIDTH, BOSS_SCORE_VALUE, GAME_WIDTH } from '../../../engine/constants';

describe('Boss', () => {
  it('creates with 4 turrets', () => {
    const boss = createBoss();
    expect(boss.turrets.length).toBe(4);
  });

  it('turrets span the boss width', () => {
    const boss = createBoss();
    const turretXs = boss.turrets.map(t => t.offsetX);
    const leftmost = Math.min(...turretXs);
    const rightmost = Math.max(...turretXs);
    // Turrets should be distributed across the boss width
    expect(rightmost - leftmost).toBeGreaterThan(BOSS_WIDTH * 0.4);
  });

  it('has correct health values', () => {
    const boss = createBoss();
    expect(boss.health).toBe(BOSS_HEALTH);
    expect(boss.maxHealth).toBe(BOSS_HEALTH);
    for (const turret of boss.turrets) {
      expect(turret.health).toBe(BOSS_TURRET_HEALTH);
      expect(turret.maxHealth).toBe(BOSS_TURRET_HEALTH);
    }
  });

  it('starts in entering layer', () => {
    const boss = createBoss();
    expect(boss.layer).toBe('entering');
    expect(boss.isAlive).toBe(true);
  });

  it('has no death sequence initially', () => {
    const boss = createBoss();
    expect(boss.deathSequence).toBeNull();
  });

  it('has correct score value', () => {
    const boss = createBoss();
    expect(boss.scoreValue).toBe(BOSS_SCORE_VALUE);
  });

  it('starts above the screen', () => {
    const boss = createBoss();
    expect(boss.position.y).toBeLessThan(0);
  });

  it('is centered horizontally', () => {
    const boss = createBoss();
    expect(boss.position.x).toBe(GAME_WIDTH / 2);
  });

  it('has upper collision zones', () => {
    const boss = createBoss();
    expect(boss.upperCollisionZones.length).toBeGreaterThan(0);
  });

  it('turrets have unique IDs', () => {
    const boss = createBoss();
    const ids = new Set(boss.turrets.map(t => t.id));
    expect(ids.size).toBe(4);
  });
});
