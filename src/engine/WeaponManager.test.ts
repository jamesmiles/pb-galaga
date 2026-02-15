import { describe, it, expect } from 'vitest';
import { upgradeWeapon, updateSecondaryTimer } from './WeaponManager';
import type { Player, WeaponPickup } from '../types';
import { createPlayer } from './StateManager';
import { SECONDARY_WEAPON_DURATION } from './constants';

function makePickup(category: 'primary' | 'secondary', weapon: string): WeaponPickup {
  return {
    id: 'wp-1',
    category,
    currentWeapon: weapon as WeaponPickup['currentWeapon'],
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    isActive: true,
    cycleTimer: 0,
    lifetime: 0,
  };
}

describe('upgradeWeapon', () => {
  describe('primary weapons', () => {
    it('upgrades same primary type from level 1 to 2', () => {
      const p = createPlayer('player1');
      expect(p.primaryWeapon).toBe('bullet');
      expect(p.primaryLevel).toBe(1);
      upgradeWeapon(p, makePickup('primary', 'bullet'));
      expect(p.primaryLevel).toBe(2);
    });

    it('upgrades through all levels: 1→2→3→4', () => {
      const p = createPlayer('player1');
      upgradeWeapon(p, makePickup('primary', 'bullet'));
      expect(p.primaryLevel).toBe(2);
      upgradeWeapon(p, makePickup('primary', 'bullet'));
      expect(p.primaryLevel).toBe(3);
      upgradeWeapon(p, makePickup('primary', 'bullet'));
      expect(p.primaryLevel).toBe(4);
    });

    it('caps at level 4', () => {
      const p = createPlayer('player1');
      p.primaryLevel = 4;
      upgradeWeapon(p, makePickup('primary', 'bullet'));
      expect(p.primaryLevel).toBe(4);
    });

    it('switches primary type but keeps power level', () => {
      const p = createPlayer('player1');
      p.primaryLevel = 3;
      upgradeWeapon(p, makePickup('primary', 'laser'));
      expect(p.primaryWeapon).toBe('laser');
      expect(p.primaryLevel).toBe(3);
    });

    it('switches back to bullet keeps power level', () => {
      const p = createPlayer('player1');
      p.primaryWeapon = 'laser';
      p.primaryLevel = 2;
      upgradeWeapon(p, makePickup('primary', 'bullet'));
      expect(p.primaryWeapon).toBe('bullet');
      expect(p.primaryLevel).toBe(2);
    });
  });

  describe('secondary weapons', () => {
    it('sets secondary weapon and timer', () => {
      const p = createPlayer('player1');
      expect(p.secondaryWeapon).toBeNull();
      upgradeWeapon(p, makePickup('secondary', 'rocket'));
      expect(p.secondaryWeapon).toBe('rocket');
      expect(p.secondaryTimer).toBe(SECONDARY_WEAPON_DURATION);
    });

    it('refreshes timer when same secondary type collected', () => {
      const p = createPlayer('player1');
      p.secondaryWeapon = 'rocket';
      p.secondaryTimer = 10000;
      upgradeWeapon(p, makePickup('secondary', 'rocket'));
      expect(p.secondaryWeapon).toBe('rocket');
      expect(p.secondaryTimer).toBe(SECONDARY_WEAPON_DURATION);
    });

    it('replaces secondary when different type collected', () => {
      const p = createPlayer('player1');
      p.secondaryWeapon = 'rocket';
      p.secondaryTimer = 30000;
      upgradeWeapon(p, makePickup('secondary', 'missile'));
      expect(p.secondaryWeapon).toBe('missile');
      expect(p.secondaryTimer).toBe(SECONDARY_WEAPON_DURATION);
    });

    it('resets cooldown on pickup', () => {
      const p = createPlayer('player1');
      p.secondaryCooldown = 300;
      upgradeWeapon(p, makePickup('secondary', 'rocket'));
      expect(p.secondaryCooldown).toBe(0);
    });
  });
});

describe('updateSecondaryTimer', () => {
  it('counts down the secondary timer', () => {
    const p = createPlayer('player1');
    p.secondaryWeapon = 'rocket';
    p.secondaryTimer = 5000;
    updateSecondaryTimer(p, 1000);
    expect(p.secondaryTimer).toBe(4000);
  });

  it('clears secondary weapon when timer expires', () => {
    const p = createPlayer('player1');
    p.secondaryWeapon = 'missile';
    p.secondaryTimer = 500;
    updateSecondaryTimer(p, 600);
    expect(p.secondaryWeapon).toBeNull();
    expect(p.secondaryTimer).toBe(0);
    expect(p.secondaryCooldown).toBe(0);
  });

  it('does nothing when no secondary weapon', () => {
    const p = createPlayer('player1');
    updateSecondaryTimer(p, 1000);
    expect(p.secondaryWeapon).toBeNull();
    expect(p.secondaryTimer).toBe(0);
  });
});
