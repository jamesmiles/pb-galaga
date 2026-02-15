import { describe, it, expect } from 'vitest';
import { createBoss } from './Boss';
import { BOSS_HEALTH, BOSS_TURRET_HEALTH, BOSS_ROCKET_TURRET_HEALTH, BOSS_WIDTH, BOSS_SCORE_VALUE, GAME_WIDTH } from '../../../engine/constants';

describe('Boss', () => {
  it('creates with 6 turrets (4 bullet + 1 rocket + 1 homing)', () => {
    const boss = createBoss();
    expect(boss.turrets.length).toBe(6);
    expect(boss.turrets.filter(t => t.fireType === 'bullet').length).toBe(4);
    expect(boss.turrets.filter(t => t.fireType === 'rocket').length).toBe(1);
    expect(boss.turrets.filter(t => t.fireType === 'homing').length).toBe(1);
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
    const bulletTurrets = boss.turrets.filter(t => t.fireType === 'bullet');
    for (const turret of bulletTurrets) {
      expect(turret.health).toBe(BOSS_TURRET_HEALTH);
    }
    const rocketTurrets = boss.turrets.filter(t => t.fireType !== 'bullet');
    for (const turret of rocketTurrets) {
      expect(turret.health).toBe(BOSS_ROCKET_TURRET_HEALTH);
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
    expect(ids.size).toBe(6);
  });
});
