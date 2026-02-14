import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WeaponPickupManager } from './WeaponPickupManager';
import { createInitialState } from './StateManager';
import { WEAPON_PICKUP_CYCLE_INTERVAL, WEAPON_PICKUP_LIFETIME, WEAPON_PICKUP_SPEED } from './constants';

describe('WeaponPickupManager', () => {
  let manager: WeaponPickupManager;

  beforeEach(() => {
    manager = new WeaponPickupManager();
  });

  describe('maybeSpawnPickup', () => {
    it('spawns a pickup when random rolls below drop chance', () => {
      const state = createInitialState();
      vi.spyOn(Math, 'random').mockReturnValue(0.05); // Below 0.15 threshold

      manager.maybeSpawnPickup(state, { x: 200, y: 300 });

      expect(state.weaponPickups.length).toBe(1);
      expect(state.weaponPickups[0].position.x).toBe(200);
      expect(state.weaponPickups[0].position.y).toBe(300);
      expect(state.weaponPickups[0].isActive).toBe(true);

      vi.restoreAllMocks();
    });

    it('does not spawn when random rolls above drop chance', () => {
      const state = createInitialState();
      vi.spyOn(Math, 'random').mockReturnValue(0.5); // Above 0.15

      manager.maybeSpawnPickup(state, { x: 200, y: 300 });

      expect(state.weaponPickups.length).toBe(0);

      vi.restoreAllMocks();
    });

    it('spawns with downward velocity', () => {
      const state = createInitialState();
      vi.spyOn(Math, 'random').mockReturnValue(0.01);

      manager.maybeSpawnPickup(state, { x: 100, y: 100 });

      expect(state.weaponPickups[0].velocity.y).toBe(WEAPON_PICKUP_SPEED);

      vi.restoreAllMocks();
    });
  });

  describe('updatePickups', () => {
    it('moves pickups downward', () => {
      const state = createInitialState();
      vi.spyOn(Math, 'random').mockReturnValue(0.01);
      manager.maybeSpawnPickup(state, { x: 100, y: 100 });
      vi.restoreAllMocks();

      const startY = state.weaponPickups[0].position.y;
      manager.updatePickups(state, 1000); // 1 second

      expect(state.weaponPickups[0].position.y).toBeGreaterThan(startY);
    });

    it('despawns after lifetime expires', () => {
      const state = createInitialState();
      vi.spyOn(Math, 'random').mockReturnValue(0.01);
      manager.maybeSpawnPickup(state, { x: 100, y: 100 });
      vi.restoreAllMocks();

      manager.updatePickups(state, WEAPON_PICKUP_LIFETIME + 1);

      expect(state.weaponPickups.length).toBe(0);
    });

    it('cycles primary weapon type', () => {
      const state = createInitialState();
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.01) // below drop chance
        .mockReturnValueOnce(0.3)  // < 0.7 = primary
        .mockReturnValueOnce(0.1); // < 0.5 = laser
      manager.maybeSpawnPickup(state, { x: 100, y: 100 });
      vi.restoreAllMocks();

      expect(state.weaponPickups[0].category).toBe('primary');
      const initialWeapon = state.weaponPickups[0].currentWeapon;

      manager.updatePickups(state, WEAPON_PICKUP_CYCLE_INTERVAL + 1);

      expect(state.weaponPickups[0].currentWeapon).not.toBe(initialWeapon);
    });

    it('cycles secondary weapon type', () => {
      const state = createInitialState();
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.01) // below drop chance
        .mockReturnValueOnce(0.9)  // >= 0.7 = secondary
        .mockReturnValueOnce(0.1); // < 0.5 = rocket
      manager.maybeSpawnPickup(state, { x: 100, y: 100 });
      vi.restoreAllMocks();

      expect(state.weaponPickups[0].category).toBe('secondary');
      expect(state.weaponPickups[0].currentWeapon).toBe('rocket');

      manager.updatePickups(state, WEAPON_PICKUP_CYCLE_INTERVAL + 1);

      expect(state.weaponPickups[0].currentWeapon).toBe('missile');
    });

    it('removes inactive pickups', () => {
      const state = createInitialState();
      vi.spyOn(Math, 'random').mockReturnValue(0.01);
      manager.maybeSpawnPickup(state, { x: 100, y: 100 });
      vi.restoreAllMocks();

      state.weaponPickups[0].isActive = false;
      manager.updatePickups(state, 16);

      expect(state.weaponPickups.length).toBe(0);
    });
  });
});
