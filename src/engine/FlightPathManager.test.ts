import { describe, it, expect } from 'vitest';
import { evaluateBezier, generateFlightPaths, updateFlightPaths, allEnemiesSettled } from './FlightPathManager';
import { createEnemyA } from '../objects/enemies/enemyA/code/EnemyA';
import { createEnemyB } from '../objects/enemies/enemyB/code/EnemyB';
import { createEnemyC } from '../objects/enemies/enemyC/code/EnemyC';
import { initFormation } from './FormationManager';
import type { FormationType, FormationState, Enemy, GameState } from '../types';
import { StateManager } from './StateManager';

function makeEnemies(count: number, rows: number, cols: number): Enemy[] {
  const enemies: Enemy[] = [];
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (idx >= count) break;
      enemies.push(createEnemyA(r, c));
      idx++;
    }
  }
  return enemies;
}

function makeState(enemies: Enemy[], formation: FormationState): GameState {
  const sm = new StateManager();
  const state = sm.currentState;
  state.enemies = enemies;
  state.formation = formation;
  state.gameStatus = 'playing';
  return state;
}

describe('evaluateBezier', () => {
  it('returns start point at t=0', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 50, y: 100 },
      { x: 100, y: 100 },
      { x: 200, y: 0 },
    ];
    const result = evaluateBezier(points, 0);
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(0);
  });

  it('returns end point at t=1', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 50, y: 100 },
      { x: 100, y: 100 },
      { x: 200, y: 50 },
    ];
    const result = evaluateBezier(points, 1);
    expect(result.x).toBeCloseTo(200);
    expect(result.y).toBeCloseTo(50);
  });

  it('returns midpoint for a straight line at t=0.5', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 100 },
    ];
    const result = evaluateBezier(points, 0.5);
    expect(result.x).toBeCloseTo(50);
    expect(result.y).toBeCloseTo(50);
  });

  it('handles quadratic bezier (3 points)', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 50, y: 100 },
      { x: 100, y: 0 },
    ];
    const result = evaluateBezier(points, 0.5);
    expect(result.x).toBeCloseTo(50);
    expect(result.y).toBeCloseTo(50);
  });
});

describe('generateFlightPaths', () => {
  const formationTypes: FormationType[] = ['w-curve', 'chiral', 'diagonal', 'side-wave', 'm-shape', 'inverted-v'];

  for (const type of formationTypes) {
    it(`generates paths for ${type} formation`, () => {
      const enemies = makeEnemies(12, 3, 4);
      const formation = initFormation(3, 4);
      // Move formation into visible range so target slots are on-screen
      formation.offsetY = 50;

      generateFlightPaths(type, enemies, formation);

      for (const enemy of enemies) {
        expect(enemy.flightPathState).not.toBeNull();
        expect(enemy.flightPathState!.progress).toBe(0);
        expect(enemy.flightPathState!.controlPoints.length).toBeGreaterThanOrEqual(2);
        expect(enemy.flightPathState!.speed).toBeGreaterThan(0);
        expect(enemy.flightPathState!.targetSlot.x).toBeGreaterThan(0);
      }
    });
  }

  it('does not generate paths for grid formation', () => {
    const enemies = makeEnemies(8, 2, 4);
    const formation = initFormation(2, 4);

    generateFlightPaths('grid', enemies, formation);

    for (const enemy of enemies) {
      expect(enemy.flightPathState).toBeNull();
    }
  });
});

describe('updateFlightPaths', () => {
  it('advances enemy progress along the curve', () => {
    const enemies = makeEnemies(4, 1, 4);
    const formation = initFormation(1, 4);
    formation.offsetY = 100;
    generateFlightPaths('diagonal', enemies, formation);

    const state = makeState(enemies, formation);

    const initialProgress = enemies[0].flightPathState!.progress;
    updateFlightPaths(state, 0.1); // 100ms

    expect(enemies[0].flightPathState).not.toBeNull();
    expect(enemies[0].flightPathState!.progress).toBeGreaterThan(initialProgress);
  });

  it('snaps enemy to formation slot when progress reaches 1', () => {
    const enemies = makeEnemies(1, 1, 1);
    const formation = initFormation(1, 1);
    formation.offsetY = 100;
    generateFlightPaths('diagonal', enemies, formation);

    const state = makeState(enemies, formation);
    const target = enemies[0].flightPathState!.targetSlot;

    // Force progress near completion
    enemies[0].flightPathState!.progress = 0.99;
    updateFlightPaths(state, 10); // Large dt to force completion

    expect(enemies[0].flightPathState).toBeNull();
    expect(enemies[0].position.x).toBeCloseTo(target.x);
    expect(enemies[0].position.y).toBeCloseTo(target.y);
  });

  it('does not update dead enemies', () => {
    const enemies = makeEnemies(2, 1, 2);
    const formation = initFormation(1, 2);
    formation.offsetY = 100;
    generateFlightPaths('w-curve', enemies, formation);

    enemies[0].isAlive = false;
    const state = makeState(enemies, formation);

    const deadProgress = enemies[0].flightPathState!.progress;
    updateFlightPaths(state, 0.1);

    expect(enemies[0].flightPathState!.progress).toBe(deadProgress);
  });
});

describe('allEnemiesSettled', () => {
  it('returns true when no enemies have flight paths', () => {
    const enemies = makeEnemies(4, 1, 4);
    expect(allEnemiesSettled(enemies)).toBe(true);
  });

  it('returns false when enemies have active flight paths', () => {
    const enemies = makeEnemies(4, 1, 4);
    const formation = initFormation(1, 4);
    formation.offsetY = 100;
    generateFlightPaths('chiral', enemies, formation);

    expect(allEnemiesSettled(enemies)).toBe(false);
  });

  it('returns true when only dead enemies have flight paths', () => {
    const enemies = makeEnemies(2, 1, 2);
    const formation = initFormation(1, 2);
    formation.offsetY = 100;
    generateFlightPaths('diagonal', enemies, formation);

    enemies[0].isAlive = false;
    enemies[1].isAlive = false;

    expect(allEnemiesSettled(enemies)).toBe(true);
  });
});
