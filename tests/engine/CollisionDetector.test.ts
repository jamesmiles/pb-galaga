import { describe, it, expect } from 'vitest';
import {
  checkCircleCollision,
  detectPlayerEnemyCollisions,
  detectProjectileEnemyCollisions,
  detectProjectilePlayerCollisions,
  processCollisions,
} from '../../src/engine/CollisionDetector';
import { createInitialState } from '../../src/engine/StateManager';
import { createPlayer } from '../../src/objects/player/code/PlayerShip';
import { createEnemyA } from '../../src/objects/enemies/enemyA/code/EnemyA';
import { createLaser } from '../../src/objects/projectiles/laser/code/Laser';
import { STRAIGHT_DOWN } from '../../src/engine/FlightPathUtils';

describe('checkCircleCollision', () => {
  it('detects overlapping circles', () => {
    expect(checkCircleCollision({ x: 0, y: 0 }, 10, { x: 5, y: 0 }, 10)).toBe(true);
  });

  it('detects touching circles', () => {
    expect(checkCircleCollision({ x: 0, y: 0 }, 5, { x: 10, y: 0 }, 5)).toBe(true);
  });

  it('rejects non-overlapping circles', () => {
    expect(checkCircleCollision({ x: 0, y: 0 }, 5, { x: 100, y: 0 }, 5)).toBe(false);
  });

  it('detects identical positions', () => {
    expect(checkCircleCollision({ x: 50, y: 50 }, 1, { x: 50, y: 50 }, 1)).toBe(true);
  });
});

describe('detectPlayerEnemyCollisions', () => {
  it('detects when player and enemy overlap', () => {
    const player = createPlayer();
    player.position = { x: 100, y: 100 };
    const enemy = createEnemyA(STRAIGHT_DOWN, { x: 105, y: 100 });

    const pairs = detectPlayerEnemyCollisions([player], [enemy]);
    expect(pairs).toHaveLength(1);
    expect(pairs[0].entityAId).toBe('player1');
  });

  it('skips invulnerable players', () => {
    const player = createPlayer();
    player.position = { x: 100, y: 100 };
    player.isInvulnerable = true;
    const enemy = createEnemyA(STRAIGHT_DOWN, { x: 100, y: 100 });

    const pairs = detectPlayerEnemyCollisions([player], [enemy]);
    expect(pairs).toHaveLength(0);
  });

  it('skips dead players', () => {
    const player = createPlayer();
    player.isAlive = false;
    player.position = { x: 100, y: 100 };
    const enemy = createEnemyA(STRAIGHT_DOWN, { x: 100, y: 100 });

    const pairs = detectPlayerEnemyCollisions([player], [enemy]);
    expect(pairs).toHaveLength(0);
  });
});

describe('detectProjectileEnemyCollisions', () => {
  it('detects player laser hitting enemy', () => {
    const laser = createLaser({ type: 'player', id: 'player1' }, { x: 100, y: 100 });
    const enemy = createEnemyA(STRAIGHT_DOWN, { x: 100, y: 100 });

    const pairs = detectProjectileEnemyCollisions([laser], [enemy]);
    expect(pairs).toHaveLength(1);
  });

  it('skips enemy projectiles against enemies (friendly fire)', () => {
    const laser = createLaser({ type: 'enemy', id: 'e1' }, { x: 100, y: 100 });
    const enemy = createEnemyA(STRAIGHT_DOWN, { x: 100, y: 100 });

    const pairs = detectProjectileEnemyCollisions([laser], [enemy]);
    expect(pairs).toHaveLength(0);
  });

  it('skips already collided projectiles', () => {
    const laser = createLaser({ type: 'player', id: 'player1' }, { x: 100, y: 100 });
    laser.hasCollided = true;
    const enemy = createEnemyA(STRAIGHT_DOWN, { x: 100, y: 100 });

    const pairs = detectProjectileEnemyCollisions([laser], [enemy]);
    expect(pairs).toHaveLength(0);
  });
});

describe('processCollisions', () => {
  it('player-enemy collision: both take damage, enemy destroyed, score awarded', () => {
    const state = createInitialState();
    state.gameStatus = 'playing';
    const player = state.players[0];
    player.position = { x: 100, y: 100 };
    player.isAlive = true;
    player.score = 0;

    const enemy = createEnemyA(STRAIGHT_DOWN, { x: 105, y: 100 });
    state.enemies.push(enemy);

    processCollisions(state);

    expect(enemy.isAlive).toBe(false);
    expect(player.score).toBe(100); // enemy scoreValue
  });

  it('laser-enemy collision: enemy takes damage, laser removed', () => {
    const state = createInitialState();
    state.gameStatus = 'playing';

    const enemy = createEnemyA(STRAIGHT_DOWN, { x: 100, y: 100 });
    state.enemies.push(enemy);

    const laser = createLaser({ type: 'player', id: 'player1' }, { x: 100, y: 100 });
    state.projectiles.push(laser);

    processCollisions(state);

    expect(laser.hasCollided).toBe(true);
    expect(laser.isActive).toBe(false);
    expect(enemy.health).toBeLessThan(50); // took 25 damage
  });

  it('laser kills enemy: score awarded to player', () => {
    const state = createInitialState();
    state.gameStatus = 'playing';
    state.players[0].score = 0;

    const enemy = createEnemyA(STRAIGHT_DOWN, { x: 100, y: 100 });
    enemy.health = 25; // one hit kill
    state.enemies.push(enemy);

    const laser = createLaser({ type: 'player', id: 'player1' }, { x: 100, y: 100 });
    state.projectiles.push(laser);

    processCollisions(state);

    expect(enemy.isAlive).toBe(false);
    expect(state.players[0].score).toBe(100);
  });
});
