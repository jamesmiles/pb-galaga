import { describe, it, expect } from 'vitest';
import { TankTrailEffect } from './TankTrailEffect';
import type { Player, TankState } from '../../types';

function makePlayer(id: string, x: number, y: number): Player {
  return {
    id,
    shipColor: 'red',
    position: { x, y },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    isAlive: true,
    isInvulnerable: false,
    invulnerabilityTimer: 0,
    lives: 3,
    score: 0,
    health: 100,
    maxHealth: 100,
    primaryWeapon: 'bullet',
    primaryLevel: 1,
    secondaryWeapon: null,
    secondaryTimer: 0,
    secondaryCooldown: 0,
    fireCooldown: 0,
    isThrusting: false,
    isFiring: false,
    collisionState: 'none',
    input: { left: false, right: false, up: false, down: false, fire: false },
    deathSequence: null,
    stats: { kills: 0, deaths: 0, powerupsCollected: 0, respawns: 0 },
    levelStats: { kills: 0, deaths: 0, powerupsCollected: 0, respawns: 0 },
  } as Player;
}

function makeTankState(speed = 0, heading = 0): TankState {
  return {
    heading,
    turretAngle: heading,
    turretRecoil: 0,
    speed,
    turnRate: 2.5,
    acceleration: 150,
    maxSpeed: 200,
    reverseMaxSpeed: 80,
    friction: 120,
  };
}

describe('TankTrailEffect', () => {
  describe('constructor', () => {
    it('starts with no active tracks or dust', () => {
      const effect = new TankTrailEffect();
      expect(effect.activeTrackCount).toBe(0);
      expect(effect.activeDustCount).toBe(0);
    });
  });

  describe('track marks', () => {
    it('emits track marks when tank is moving', () => {
      const effect = new TankTrailEffect();
      const players = [makePlayer('player1', 400, 5000)];
      const tankStates = { player1: makeTankState(200, 0) };

      // Simulate enough movement to cover TRACK_SPACING (15px)
      // At 200 px/s, 16.667ms per frame, need ~5 frames to travel 15px
      for (let i = 0; i < 10; i++) {
        players[0].position.x += 200 * 0.016667;
        effect.update(16.667, players, tankStates);
      }

      expect(effect.activeTrackCount).toBeGreaterThan(0);
    });

    it('does not emit tracks when tank is stationary', () => {
      const effect = new TankTrailEffect();
      const players = [makePlayer('player1', 400, 5000)];
      const tankStates = { player1: makeTankState(0, 0) };

      for (let i = 0; i < 60; i++) {
        effect.update(16.667, players, tankStates);
      }

      expect(effect.activeTrackCount).toBe(0);
    });

    it('fades tracks over 5 seconds', () => {
      const effect = new TankTrailEffect();
      const players = [makePlayer('player1', 400, 5000)];
      const tankStates = { player1: makeTankState(200, 0) };

      // Emit some tracks
      for (let i = 0; i < 10; i++) {
        players[0].position.x += 200 * 0.016667;
        effect.update(16.667, players, tankStates);
      }
      expect(effect.activeTrackCount).toBeGreaterThan(0);

      // Stop moving and advance time past track lifetime (5000ms)
      tankStates.player1.speed = 0;
      for (let i = 0; i < 320; i++) {
        effect.update(16.667, players, tankStates);
      }

      expect(effect.activeTrackCount).toBe(0);
    });

    it('overwrites oldest marks when ring buffer is full', () => {
      const effect = new TankTrailEffect();
      const players = [makePlayer('player1', 400, 5000)];
      const tankStates = { player1: makeTankState(200, 0) };

      // Generate lots of track marks (more than buffer size of 200)
      // At 200 px/s with 15px spacing, need 200 * 15 / 200 = 15 seconds
      for (let i = 0; i < 1000; i++) {
        players[0].position.x += 200 * 0.016667;
        effect.update(16.667, players, tankStates);
      }

      // Should not exceed buffer size
      expect(effect.activeTrackCount).toBeLessThanOrEqual(200);
    });
  });

  describe('dust particles', () => {
    it('emits dust when tank is moving above threshold', () => {
      const effect = new TankTrailEffect();
      const players = [makePlayer('player1', 400, 5000)];
      const tankStates = { player1: makeTankState(150, 0) };

      for (let i = 0; i < 30; i++) {
        effect.update(16.667, players, tankStates);
      }

      expect(effect.activeDustCount).toBeGreaterThan(0);
    });

    it('does not emit dust when speed is below threshold', () => {
      const effect = new TankTrailEffect();
      const players = [makePlayer('player1', 400, 5000)];
      const tankStates = { player1: makeTankState(5, 0) }; // below 10 threshold

      for (let i = 0; i < 30; i++) {
        effect.update(16.667, players, tankStates);
      }

      expect(effect.activeDustCount).toBe(0);
    });

    it('dust fades out over lifetime', () => {
      const effect = new TankTrailEffect();
      const players = [makePlayer('player1', 400, 5000)];
      const tankStates = { player1: makeTankState(150, 0) };

      // Emit some dust
      for (let i = 0; i < 20; i++) {
        effect.update(16.667, players, tankStates);
      }
      expect(effect.activeDustCount).toBeGreaterThan(0);

      // Stop and let dust expire (max life 800ms)
      tankStates.player1.speed = 0;
      for (let i = 0; i < 60; i++) {
        effect.update(16.667, players, tankStates);
      }

      expect(effect.activeDustCount).toBe(0);
    });
  });

  describe('draw', () => {
    it('draws tracks and dust with fill calls', () => {
      const effect = new TankTrailEffect();
      const players = [makePlayer('player1', 400, 5000)];
      const tankStates = { player1: makeTankState(200, 0) };

      for (let i = 0; i < 30; i++) {
        players[0].position.x += 200 * 0.016667;
        effect.update(16.667, players, tankStates);
      }

      let fillRectCalls = 0;
      let arcCalls = 0;
      const mockCtx = {
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
        beginPath: () => {},
        arc: () => { arcCalls++; },
        fill: () => {},
        fillRect: (..._args: number[]) => { fillRectCalls++; },
        globalAlpha: 1,
        fillStyle: '',
      } as unknown as CanvasRenderingContext2D;

      const camera = { worldX: 0, worldY: 4600, targetX: 0, targetY: 4600, smoothSpeed: 3 };
      effect.draw(mockCtx, camera);

      expect(fillRectCalls).toBeGreaterThan(0); // track marks
      expect(arcCalls).toBeGreaterThan(0);      // dust particles
    });
  });

  describe('reset', () => {
    it('clears all tracks and dust', () => {
      const effect = new TankTrailEffect();
      const players = [makePlayer('player1', 400, 5000)];
      const tankStates = { player1: makeTankState(200, 0) };

      for (let i = 0; i < 30; i++) {
        players[0].position.x += 200 * 0.016667;
        effect.update(16.667, players, tankStates);
      }
      expect(effect.activeTrackCount).toBeGreaterThan(0);
      expect(effect.activeDustCount).toBeGreaterThan(0);

      effect.reset();

      expect(effect.activeTrackCount).toBe(0);
      expect(effect.activeDustCount).toBe(0);
    });
  });

  describe('update edge cases', () => {
    it('handles dt <= 0 gracefully', () => {
      const effect = new TankTrailEffect();
      const players = [makePlayer('player1', 400, 5000)];
      const tankStates = { player1: makeTankState(200, 0) };

      effect.update(0, players, tankStates);
      effect.update(-16, players, tankStates);
      expect(effect.activeTrackCount).toBe(0);
      expect(effect.activeDustCount).toBe(0);
    });

    it('handles undefined tankStates gracefully', () => {
      const effect = new TankTrailEffect();
      const players = [makePlayer('player1', 400, 5000)];

      effect.update(16.667, players, undefined);
      expect(effect.activeTrackCount).toBe(0);
    });

    it('skips dead players', () => {
      const effect = new TankTrailEffect();
      const players = [makePlayer('player1', 400, 5000)];
      players[0].isAlive = false;
      const tankStates = { player1: makeTankState(200, 0) };

      for (let i = 0; i < 30; i++) {
        effect.update(16.667, players, tankStates);
      }

      expect(effect.activeTrackCount).toBe(0);
      expect(effect.activeDustCount).toBe(0);
    });
  });
});
