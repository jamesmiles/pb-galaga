import { describe, it, expect } from 'vitest';
import { level2 } from './level2';
import type { FormationType } from '../types';

describe('Level 2 Config', () => {
  it('has levelNumber 2', () => {
    expect(level2.levelNumber).toBe(2);
  });

  it('has a name', () => {
    expect(level2.name).toBe('Earth Defence');
  });

  it('has 6 waves', () => {
    expect(level2.waves).toHaveLength(6);
  });

  it('uses all 6 new formation types across waves', () => {
    const formationTypes = new Set<FormationType>();
    for (const wave of level2.waves) {
      if (wave.formation) formationTypes.add(wave.formation);
    }
    expect(formationTypes.has('w-curve')).toBe(true);
    expect(formationTypes.has('chiral')).toBe(true);
    expect(formationTypes.has('diagonal')).toBe(true);
    expect(formationTypes.has('side-wave')).toBe(true);
    expect(formationTypes.has('m-shape')).toBe(true);
    expect(formationTypes.has('inverted-v')).toBe(true);
  });

  it('has sequential wave numbers', () => {
    for (let i = 0; i < level2.waves.length; i++) {
      expect(level2.waves[i].waveNumber).toBe(i + 1);
    }
  });

  it('all waves use slot-based placement with valid types', () => {
    for (const wave of level2.waves) {
      expect(wave.slots).toBeDefined();
      expect(wave.slots!.length).toBeGreaterThan(0);
      for (const slot of wave.slots!) {
        expect(['A', 'B', 'C']).toContain(slot.type);
        expect(slot.row).toBeGreaterThanOrEqual(0);
        expect(slot.col).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('has no duplicate slot positions within a wave', () => {
    for (const wave of level2.waves) {
      const positions = new Set<string>();
      for (const slot of wave.slots!) {
        const key = `${slot.row},${slot.col}`;
        expect(positions.has(key)).toBe(false);
        positions.add(key);
      }
    }
  });
});
