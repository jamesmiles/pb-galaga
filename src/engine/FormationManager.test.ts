import { describe, it, expect } from 'vitest';
import { initFormation, updateFormation, hasOverlappingEnemies, updateEnemyPositions } from './FormationManager';
import { createEnemyA } from '../objects/enemies/enemyA/code/EnemyA';
import { createInitialState } from './StateManager';
import { GAME_WIDTH, FORMATION_CELL_WIDTH, FORMATION_CELL_HEIGHT } from './constants';

function setupFormation(rows = 5, cols = 8) {
  const state = createInitialState();
  state.formation = initFormation(rows, cols);
  const enemies = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      enemies.push(createEnemyA(r, c));
    }
  }
  state.enemies = enemies;
  return state;
}

describe('FormationManager', () => {
  describe('initFormation', () => {
    it('creates a formation with correct dimensions', () => {
      const f = initFormation(5, 8);
      expect(f.rows).toBe(5);
      expect(f.cols).toBe(8);
      expect(f.direction).toBe(1);
    });

    it('starts formation above the screen', () => {
      const f = initFormation(5, 8);
      expect(f.offsetY).toBeLessThan(0);
    });

    it('centers formation horizontally', () => {
      const f = initFormation(5, 8);
      const totalWidth = 8 * FORMATION_CELL_WIDTH;
      const expectedX = (GAME_WIDTH - totalWidth) / 2;
      expect(f.offsetX).toBe(expectedX);
    });
  });

  describe('updateFormation', () => {
    it('descends formation into view', () => {
      const state = setupFormation();
      const startY = state.formation.offsetY;

      // Tick until formation enters screen
      for (let i = 0; i < 300; i++) {
        updateFormation(state, 1 / 60);
      }

      expect(state.formation.offsetY).toBeGreaterThan(startY);
      expect(state.formation.offsetY).toBeGreaterThan(0);
    });

    it('moves formation horizontally after entering', () => {
      const state = setupFormation();
      state.formation.offsetY = 30; // Already on screen

      const startX = state.formation.offsetX;
      updateFormation(state, 1 / 60);

      // Should move right (direction = 1)
      expect(state.formation.offsetX).toBeGreaterThan(startX);
    });

    it('reverses direction when hitting screen edge', () => {
      const state = setupFormation(1, 1);
      state.formation.offsetY = 30;
      state.formation.offsetX = GAME_WIDTH - FORMATION_CELL_WIDTH - 1;
      state.formation.direction = 1;

      // Tick until it reverses
      for (let i = 0; i < 60; i++) {
        updateFormation(state, 1 / 60);
      }

      expect(state.formation.direction).toBe(-1);
    });

    it('increases speed as enemies are destroyed', () => {
      const state = setupFormation(2, 4);
      state.formation.offsetY = 30;
      const initialSpeed = state.formation.speed;

      // Kill half the enemies
      for (let i = 0; i < 4; i++) {
        state.enemies[i].isAlive = false;
      }

      updateFormation(state, 1 / 60);
      expect(state.formation.speed).toBeGreaterThan(initialSpeed);
    });

    it('does nothing when no alive enemies', () => {
      const state = setupFormation(2, 2);
      state.formation.offsetY = 30;
      for (const e of state.enemies) e.isAlive = false;

      const startX = state.formation.offsetX;
      updateFormation(state, 1 / 60);
      expect(state.formation.offsetX).toBe(startX);
    });
  });

  describe('enemy positions', () => {
    it('positions enemies in a grid without overlap', () => {
      const state = setupFormation(5, 8);
      state.formation.offsetY = 30;
      updateEnemyPositions(state);

      expect(hasOverlappingEnemies(state)).toBe(false);

      // Check grid spacing
      const alive = state.enemies.filter(e => e.isAlive);
      for (let i = 0; i < alive.length; i++) {
        for (let j = i + 1; j < alive.length; j++) {
          const dx = Math.abs(alive[i].position.x - alive[j].position.x);
          const dy = Math.abs(alive[i].position.y - alive[j].position.y);
          // Enemies in different grid slots should be at least cellWidth/cellHeight apart
          if (alive[i].formationRow === alive[j].formationRow) {
            expect(dx).toBeGreaterThanOrEqual(FORMATION_CELL_WIDTH - 1);
          }
          if (alive[i].formationCol === alive[j].formationCol) {
            expect(dy).toBeGreaterThanOrEqual(FORMATION_CELL_HEIGHT - 1);
          }
        }
      }
    });

    it('maintains grid positions when enemies are destroyed (gaps appear)', () => {
      const state = setupFormation(3, 3);
      state.formation.offsetY = 30;
      updateEnemyPositions(state);

      const positionsBefore = state.enemies.map(e => ({ ...e.position }));

      // Kill the center enemy
      state.enemies[4].isAlive = false;
      updateEnemyPositions(state);

      // Remaining enemies should keep their positions
      for (let i = 0; i < state.enemies.length; i++) {
        if (i === 4) continue; // Skip killed enemy
        expect(state.enemies[i].position.x).toBe(positionsBefore[i].x);
        expect(state.enemies[i].position.y).toBe(positionsBefore[i].y);
      }
    });
  });
});
