import { describe, it, expect } from 'vitest';
import {
  updateTurretTargeting,
  getHeadingTurretAngle,
  clampToNorthernArc,
  normalizeAngle,
  shortestAngleDiff,
  rotateToward,
} from './TurretTargeting';
import type { Player, TankState, MapEnemy } from '../../../types';
import { createTankState, createTankPlayer } from '../../../engine/StateManager';

// --- Helpers ---

function makePlayer(overrides: Partial<Player> = {}): Player {
  const p = createTankPlayer('player1');
  p.isInvulnerable = false;
  p.position = { x: 400, y: 400 };
  return { ...p, ...overrides };
}

function makeTank(overrides: Partial<TankState> = {}): TankState {
  return { ...createTankState(), ...overrides };
}

function makeEnemy(overrides: Partial<MapEnemy> = {}): MapEnemy {
  return {
    id: 'enemy-1',
    type: 'gun-nest',
    position: { x: 400, y: 200 },  // 200px north of default player
    elevation: 0,
    isAlive: true,
    health: 150,
    maxHealth: 150,
    collisionRadius: 16,
    scoreValue: 200,
    aimAngle: 0,
    fireCooldown: 0,
    fireRate: 300,
    isActivated: false,
    activationRange: 150,
    dormantTimer: 8000,
    popupProgress: 0,
    burstFired: false,
    cooldownTimer: 0,
    ...overrides,
  };
}

const PI = Math.PI;
const HALF_PI = PI / 2;

// --- Unit tests for math helpers ---

describe('normalizeAngle', () => {
  it('keeps angles in [-PI, PI] unchanged', () => {
    expect(normalizeAngle(0)).toBeCloseTo(0);
    expect(normalizeAngle(PI / 2)).toBeCloseTo(PI / 2);
    expect(normalizeAngle(-PI / 2)).toBeCloseTo(-PI / 2);
  });

  it('wraps angles outside [-PI, PI]', () => {
    expect(normalizeAngle(PI + 0.5)).toBeCloseTo(-PI + 0.5);
    expect(normalizeAngle(-PI - 0.5)).toBeCloseTo(PI - 0.5);
    expect(normalizeAngle(3 * PI)).toBeCloseTo(PI);
  });
});

describe('shortestAngleDiff', () => {
  it('returns 0 for same angle', () => {
    expect(shortestAngleDiff(1.0, 1.0)).toBeCloseTo(0);
  });

  it('returns positive for CCW rotation', () => {
    expect(shortestAngleDiff(0, PI / 2)).toBeCloseTo(PI / 2);
  });

  it('takes shortest path across PI boundary', () => {
    const diff = shortestAngleDiff(PI - 0.1, -PI + 0.1);
    expect(Math.abs(diff)).toBeCloseTo(0.2);
  });
});

describe('rotateToward', () => {
  it('snaps to target if within maxDelta', () => {
    expect(rotateToward(1.0, 1.05, 0.1)).toBeCloseTo(1.05);
  });

  it('advances by maxDelta if target is further', () => {
    expect(rotateToward(0, PI / 2, 0.1)).toBeCloseTo(0.1);
  });

  it('rotates in shorter direction', () => {
    // From near PI to near -PI should go CW (small step), not CCW
    const result = rotateToward(PI - 0.05, -PI + 0.05, 0.2);
    expect(result).toBeCloseTo(-PI + 0.05);
  });
});

describe('getHeadingTurretAngle', () => {
  it('heading north → turret north', () => {
    expect(getHeadingTurretAngle(HALF_PI)).toBeCloseTo(HALF_PI);
  });

  it('heading east → turret east', () => {
    expect(getHeadingTurretAngle(0)).toBeCloseTo(0);
  });

  it('heading west → turret west', () => {
    expect(getHeadingTurretAngle(PI)).toBeCloseTo(PI);
  });

  it('heading south → turret north (mirrored)', () => {
    expect(getHeadingTurretAngle(-HALF_PI)).toBeCloseTo(HALF_PI);
  });

  it('heading SE → turret NE (mirrored)', () => {
    expect(getHeadingTurretAngle(-PI / 4)).toBeCloseTo(PI / 4);
  });
});

describe('clampToNorthernArc', () => {
  it('keeps northern angles unchanged', () => {
    expect(clampToNorthernArc(PI / 4)).toBeCloseTo(PI / 4);
    expect(clampToNorthernArc(HALF_PI)).toBeCloseTo(HALF_PI);
  });

  it('mirrors southern angles', () => {
    expect(clampToNorthernArc(-PI / 4)).toBeCloseTo(PI / 4);
    expect(clampToNorthernArc(-HALF_PI)).toBeCloseTo(HALF_PI);
  });
});

// --- Integration tests for updateTurretTargeting ---

describe('updateTurretTargeting', () => {
  it('turret follows heading when no enemies', () => {
    const player = makePlayer();
    const tank = makeTank({ heading: PI / 4, turretAngle: HALF_PI });
    updateTurretTargeting(player, tank, [], 1 / 60);
    // turretTargetAngle should be heading-derived
    expect(tank.turretTargetAngle).toBeCloseTo(PI / 4);
    expect(tank.targetEnemyId).toBeNull();
  });

  it('acquires target in narrow cone ahead', () => {
    const player = makePlayer({ position: { x: 400, y: 400 } });
    const tank = makeTank({ heading: HALF_PI }); // Facing north
    // Enemy directly north, 200px away
    const enemy = makeEnemy({ position: { x: 400, y: 200 } });
    updateTurretTargeting(player, tank, [enemy], 1 / 60);
    expect(tank.targetEnemyId).toBe('enemy-1');
  });

  it('does not acquire target outside acquisition cone', () => {
    const player = makePlayer({ position: { x: 400, y: 400 } });
    const tank = makeTank({ heading: HALF_PI }); // Facing north
    // Enemy far to the east (outside ~20° cone)
    const enemy = makeEnemy({ position: { x: 700, y: 350 } });
    updateTurretTargeting(player, tank, [enemy], 1 / 60);
    expect(tank.targetEnemyId).toBeNull();
  });

  it('retains target when player turns within retention cone', () => {
    const player = makePlayer({ position: { x: 400, y: 400 } });
    const tank = makeTank({ heading: HALF_PI, targetEnemyId: 'enemy-1' });
    const enemy = makeEnemy({ position: { x: 400, y: 200 } }); // North

    // Turn tank body slightly east (still within ~69° retention cone)
    tank.heading = HALF_PI - 0.5; // ~60° from north → target at 90° is ~30° off
    updateTurretTargeting(player, tank, [enemy], 1 / 60);
    expect(tank.targetEnemyId).toBe('enemy-1');
  });

  it('clears target when player turns beyond retention cone', () => {
    const player = makePlayer({ position: { x: 400, y: 400 } });
    const tank = makeTank({ heading: HALF_PI, targetEnemyId: 'enemy-1' });
    const enemy = makeEnemy({ position: { x: 400, y: 200 } }); // North (turret angle ~90°)

    // Turn tank body far past east — heading -PI/2 mirrors to PI/2, but enemy at PI/2 means diff=0
    // Need heading where headingAngle and target differ by > 135° (2.356 rad)
    // Enemy is at turret angle PI/2. headingAngle at PI (west) gives diff = PI/2 ≈ 1.57 — still within 2.356
    // headingAngle at 0 (east) gives diff = PI/2 ≈ 1.57 — still within 2.356
    // The only way to exceed 135° half-angle: target at PI/2, heading giving angle near 0 or PI
    // Actually with 270° total cone, nearly all northern arc is covered.
    // Set heading to produce headingAngle near PI (west): diff from PI/2 = PI/2 ≈ 1.57 < 2.356 — still in.
    // To exceed: need diff > 2.356 which is impossible in [0,PI] range (max diff = PI ≈ 3.14... wait that works)
    // headingAngle=0 (east), target at PI (west): diff = PI ≈ 3.14 > 2.356 ✓
    // But enemy at (400,200) from (400,400) is angle PI/2, not PI.
    // Enemy at (200, 400) from (400, 400) is angle PI (west). Heading 0 → headingAngle 0 (east). diff = PI > 2.356.
    const westEnemy = makeEnemy({ position: { x: 200, y: 400 } }); // Due west
    tank.heading = 0; // Due east → headingAngle = 0
    tank.targetEnemyId = 'enemy-1';
    updateTurretTargeting(player, tank, [westEnemy], 1 / 60);
    expect(tank.targetEnemyId).toBeNull();
  });

  it('clears target when enemy dies', () => {
    const player = makePlayer({ position: { x: 400, y: 400 } });
    const tank = makeTank({ heading: HALF_PI, targetEnemyId: 'enemy-1' });
    const enemy = makeEnemy({ position: { x: 400, y: 200 }, isAlive: false });
    updateTurretTargeting(player, tank, [enemy], 1 / 60);
    expect(tank.targetEnemyId).toBeNull();
  });

  it('clears target when enemy goes out of range', () => {
    const player = makePlayer({ position: { x: 400, y: 400 } });
    const tank = makeTank({ heading: HALF_PI, targetEnemyId: 'enemy-1' });
    // Enemy 600px north (> 500px max range)
    const enemy = makeEnemy({ position: { x: 400, y: -200 } });
    updateTurretTargeting(player, tank, [enemy], 1 / 60);
    expect(tank.targetEnemyId).toBeNull();
  });

  it('clears target on elevation mismatch', () => {
    const player = makePlayer({ position: { x: 400, y: 400 } });
    const tank = makeTank({ heading: HALF_PI, targetEnemyId: 'enemy-1', elevation: 0 });
    const enemy = makeEnemy({ position: { x: 400, y: 200 }, elevation: 1 });
    updateTurretTargeting(player, tank, [enemy], 1 / 60);
    expect(tank.targetEnemyId).toBeNull();
  });

  it('does not acquire target with elevation mismatch', () => {
    const player = makePlayer({ position: { x: 400, y: 400 } });
    const tank = makeTank({ heading: HALF_PI, elevation: 0 });
    const enemy = makeEnemy({ position: { x: 400, y: 200 }, elevation: 1 });
    updateTurretTargeting(player, tank, [enemy], 1 / 60);
    expect(tank.targetEnemyId).toBeNull();
  });

  it('acquires closest enemy when multiple in cone', () => {
    const player = makePlayer({ position: { x: 400, y: 400 } });
    const tank = makeTank({ heading: HALF_PI });
    const far = makeEnemy({ id: 'enemy-far', position: { x: 400, y: 100 } }); // 300px
    const near = makeEnemy({ id: 'enemy-near', position: { x: 400, y: 250 } }); // 150px
    updateTurretTargeting(player, tank, [far, near], 1 / 60);
    expect(tank.targetEnemyId).toBe('enemy-near');
  });

  it('new target in acquisition cone overrides current lock', () => {
    const player = makePlayer({ position: { x: 400, y: 400 } });
    const tank = makeTank({ heading: HALF_PI, targetEnemyId: 'enemy-far' });
    const far = makeEnemy({ id: 'enemy-far', position: { x: 400, y: 100 } });
    const near = makeEnemy({ id: 'enemy-near', position: { x: 400, y: 250 } });
    updateTurretTargeting(player, tank, [far, near], 1 / 60);
    // Acquisition picks closest in cone — overrides
    expect(tank.targetEnemyId).toBe('enemy-near');
  });

  it('turret smoothly rotates toward target over multiple frames', () => {
    const player = makePlayer({ position: { x: 400, y: 400 } });
    // Tank facing nearly north (PI/2 + 0.15), turret starts there
    const startAngle = HALF_PI + 0.15;
    const tank = makeTank({ heading: startAngle, turretAngle: startAngle });
    // Enemy directly north, 200px away — angle PI/2, within 0.35 cone of PI/2+0.15
    const enemy = makeEnemy({ position: { x: 400, y: 200 } });

    // First frame: acquires and starts rotating
    updateTurretTargeting(player, tank, [enemy], 1 / 60);
    expect(tank.targetEnemyId).toBe('enemy-1');
    // turretAngle should have moved toward target but not reached it in one frame
    expect(tank.turretAngle).not.toBeCloseTo(startAngle, 2);

    // After many frames, should converge on target angle
    for (let i = 0; i < 60; i++) {
      updateTurretTargeting(player, tank, [enemy], 1 / 60);
    }
    // Should be close to PI/2 (angle to enemy directly north)
    expect(tank.turretAngle).toBeCloseTo(HALF_PI, 1);
  });

  it('turret returns to heading when target is lost', () => {
    const player = makePlayer({ position: { x: 400, y: 400 } });
    const tank = makeTank({
      heading: PI / 4,
      turretAngle: HALF_PI, // Currently aimed north
      targetEnemyId: 'enemy-1',
    });
    // Enemy is dead
    const enemy = makeEnemy({ isAlive: false });

    // Should clear lock and start rotating back to heading-derived angle (PI/4)
    updateTurretTargeting(player, tank, [enemy], 1 / 60);
    expect(tank.targetEnemyId).toBeNull();
    expect(tank.turretTargetAngle).toBeCloseTo(PI / 4);
    // turretAngle should start moving toward PI/4
    expect(tank.turretAngle).toBeLessThan(HALF_PI);
  });

  it('targets enemies south because turret mirrors to northern arc', () => {
    const player = makePlayer({ position: { x: 400, y: 400 } });
    const tank = makeTank({ heading: -HALF_PI }); // Facing south → headingAngle mirrors to PI/2
    // Enemy directly south, 200px away — mirrored angle is PI/2 (north)
    const enemy = makeEnemy({ position: { x: 400, y: 600 } });
    updateTurretTargeting(player, tank, [enemy], 1 / 60);
    // Turret mirrors, so enemy south IS acquirable when heading south
    expect(tank.targetEnemyId).toBe('enemy-1');
  });

  it('does not acquire dead enemies', () => {
    const player = makePlayer({ position: { x: 400, y: 400 } });
    const tank = makeTank({ heading: HALF_PI });
    const enemy = makeEnemy({ position: { x: 400, y: 200 }, isAlive: false });
    updateTurretTargeting(player, tank, [enemy], 1 / 60);
    expect(tank.targetEnemyId).toBeNull();
  });
});
