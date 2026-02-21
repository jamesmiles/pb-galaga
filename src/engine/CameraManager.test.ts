import { describe, it, expect } from 'vitest';
import { createCamera, updateCamera, worldToScreen, isInViewport } from './CameraManager';
import type { Player } from '../types';
import { CAMERA_PLAYER_ANCHOR_Y, CAMERA_PLAYER_ANCHOR_X, GAME_WIDTH } from './constants';

function makePlayer(x: number, y: number, id: 'player1' | 'player2' = 'player1'): Player {
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
  };
}

describe('CameraManager', () => {
  describe('createCamera', () => {
    it('initializes worldY and targetY from startWorldY', () => {
      const cam = createCamera(5400);
      expect(cam.worldY).toBe(5400);
      expect(cam.targetY).toBe(5400);
    });

    it('initializes worldX and targetX from startWorldX', () => {
      const cam = createCamera(5400, 200);
      expect(cam.worldX).toBe(200);
      expect(cam.targetX).toBe(200);
    });

    it('defaults worldX to 0 when not provided', () => {
      const cam = createCamera(5400);
      expect(cam.worldX).toBe(0);
      expect(cam.targetX).toBe(0);
    });
  });

  describe('updateCamera — vertical (existing behavior)', () => {
    it('follows player northward (decreasing Y)', () => {
      const cam = createCamera(5400);
      const player = makePlayer(600, 5800);
      updateCamera(cam, [player], 1 / 60);

      // Target should be player.y - anchorY
      expect(cam.targetY).toBe(5800 - CAMERA_PLAYER_ANCHOR_Y);
      // Camera should move toward target
      expect(cam.worldY).toBeLessThan(5400);
    });

    it('clamps worldY to 0 minimum', () => {
      const cam = createCamera(10);
      const player = makePlayer(600, 100);
      // Run many frames to converge
      for (let i = 0; i < 300; i++) {
        updateCamera(cam, [player], 1 / 60);
      }
      expect(cam.worldY).toBeGreaterThanOrEqual(0);
    });

    it('does not update when no alive players', () => {
      const cam = createCamera(5400, 200);
      const dead = makePlayer(600, 5800);
      dead.isAlive = false;
      updateCamera(cam, [dead], 1 / 60);
      expect(cam.worldY).toBe(5400);
      expect(cam.worldX).toBe(200);
    });
  });

  describe('updateCamera — horizontal', () => {
    it('centers on player X position', () => {
      const cam = createCamera(5400, 0);
      const player = makePlayer(600, 5800);
      updateCamera(cam, [player], 1 / 60, 1200);

      // Target should be playerX - anchorX = 600 - 400 = 200
      expect(cam.targetX).toBe(600 - CAMERA_PLAYER_ANCHOR_X);
    });

    it('smooth-follows when player moves east', () => {
      const cam = createCamera(5400, 0);
      const player = makePlayer(800, 5800);

      // Run several frames
      for (let i = 0; i < 60; i++) {
        updateCamera(cam, [player], 1 / 60, 1200);
      }

      // Camera should have moved right significantly
      expect(cam.worldX).toBeGreaterThan(100);
    });

    it('smooth-follows when player moves west', () => {
      const cam = createCamera(5400, 200);
      const player = makePlayer(300, 5800);

      for (let i = 0; i < 60; i++) {
        updateCamera(cam, [player], 1 / 60, 1200);
      }

      // Camera should have moved left (toward 0)
      expect(cam.worldX).toBeLessThan(200);
    });

    it('clamps worldX to 0 minimum', () => {
      const cam = createCamera(5400, 100);
      const player = makePlayer(50, 5800);

      for (let i = 0; i < 300; i++) {
        updateCamera(cam, [player], 1 / 60, 1200);
      }

      expect(cam.worldX).toBe(0);
    });

    it('clamps worldX to mapWidth - GAME_WIDTH maximum', () => {
      const mapWidth = 1200;
      const cam = createCamera(5400, 0);
      const player = makePlayer(1150, 5800);

      for (let i = 0; i < 300; i++) {
        updateCamera(cam, [player], 1 / 60, mapWidth);
      }

      expect(cam.worldX).toBeLessThanOrEqual(mapWidth - GAME_WIDTH);
    });

    it('centers on average X of multiple alive players', () => {
      const cam = createCamera(5400, 0);
      const p1 = makePlayer(300, 5800, 'player1');
      const p2 = makePlayer(700, 5800, 'player2');

      updateCamera(cam, [p1, p2], 1 / 60, 1200);

      // Average X = 500, target = 500 - 400 = 100
      expect(cam.targetX).toBe(100);
    });

    it('ignores dead players for X averaging', () => {
      const cam = createCamera(5400, 0);
      const p1 = makePlayer(300, 5800, 'player1');
      const p2 = makePlayer(900, 5800, 'player2');
      p2.isAlive = false;

      updateCamera(cam, [p1, p2], 1 / 60, 1200);

      // Only p1 at X=300, target = 300 - 400 = -100, clamped to 0
      expect(cam.targetX).toBe(300 - CAMERA_PLAYER_ANCHOR_X);
    });

    it('stays at 0 when mapWidth equals GAME_WIDTH (no scrolling)', () => {
      const cam = createCamera(5400, 0);
      const player = makePlayer(600, 5800);

      for (let i = 0; i < 60; i++) {
        updateCamera(cam, [player], 1 / 60, GAME_WIDTH);
      }

      // maxX = 800 - 800 = 0, so clamped to 0
      expect(cam.worldX).toBe(0);
    });
  });

  describe('worldToScreen', () => {
    it('offsets both X and Y by camera position', () => {
      const cam = createCamera(5000, 200);
      const screen = worldToScreen({ x: 600, y: 5400 }, cam);
      expect(screen.x).toBe(400); // 600 - 200
      expect(screen.y).toBe(400); // 5400 - 5000
    });

    it('returns world position when camera is at origin', () => {
      const cam = createCamera(0, 0);
      const screen = worldToScreen({ x: 300, y: 500 }, cam);
      expect(screen.x).toBe(300);
      expect(screen.y).toBe(500);
    });
  });

  describe('isInViewport', () => {
    it('returns true for Y within viewport', () => {
      const cam = createCamera(5000);
      expect(isInViewport(5400, cam)).toBe(true);
    });

    it('returns false for Y far above viewport', () => {
      const cam = createCamera(5000);
      expect(isInViewport(4800, cam)).toBe(false);
    });

    it('returns true within margin', () => {
      const cam = createCamera(5000);
      // screenY = 4950 - 5000 = -50, within default margin 100
      expect(isInViewport(4950, cam, 100)).toBe(true);
    });
  });
});
