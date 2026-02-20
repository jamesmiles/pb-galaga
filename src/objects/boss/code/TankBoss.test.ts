import { describe, it, expect } from 'vitest';
import { createTankBoss } from './TankBoss';
import {
  TANK_BOSS_WIDTH, TANK_BOSS_HEIGHT, TANK_BOSS_BRIDGE_HEALTH,
  TANK_BOSS_TREAD_HEALTH, TANK_BOSS_SCORE_VALUE, GAME_WIDTH,
} from '../../../engine/constants';

describe('TankBoss', () => {
  it('creates with tank variant and correct dimensions', () => {
    const boss = createTankBoss();
    expect(boss.variant).toBe('tank');
    expect(boss.width).toBe(TANK_BOSS_WIDTH);
    expect(boss.height).toBe(TANK_BOSS_HEIGHT);
    expect(boss.isAlive).toBe(true);
    expect(boss.layer).toBe('entering');
  });

  it('starts off-screen to the right', () => {
    const boss = createTankBoss();
    expect(boss.position.x).toBeGreaterThan(GAME_WIDTH);
  });

  it('has bridge health as main health pool', () => {
    const boss = createTankBoss();
    expect(boss.health).toBe(TANK_BOSS_BRIDGE_HEALTH);
    expect(boss.maxHealth).toBe(TANK_BOSS_BRIDGE_HEALTH);
  });

  it('has 4 alive tread turrets', () => {
    const boss = createTankBoss();
    const aliveTreads = boss.turrets.filter(t => t.isAlive);
    expect(aliveTreads).toHaveLength(4);
    for (const tread of aliveTreads) {
      expect(tread.health).toBe(TANK_BOSS_TREAD_HEALTH);
      expect(tread.fireType).toBe('bullet');
    }
  });

  it('has a dome turret that starts inactive', () => {
    const boss = createTankBoss();
    const dome = boss.turrets.find(t => t.id === 'tank-dome');
    expect(dome).toBeDefined();
    expect(dome!.isAlive).toBe(false);
    expect(dome!.fireType).toBe('homing');
  });

  it('has correct score value', () => {
    const boss = createTankBoss();
    expect(boss.scoreValue).toBe(TANK_BOSS_SCORE_VALUE);
  });

  it('has at least one upper collision zone', () => {
    const boss = createTankBoss();
    expect(boss.upperCollisionZones.length).toBeGreaterThan(0);
  });
});
