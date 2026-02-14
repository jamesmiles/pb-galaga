import { describe, it, expect } from 'vitest';
import { level4 } from './level4';

describe('Level 4 — Asteroid Belt', () => {
  it('is level number 4', () => {
    expect(level4.levelNumber).toBe(4);
  });

  it('is named "Asteroid Belt"', () => {
    expect(level4.name).toBe('Asteroid Belt');
  });

  it('has 6 waves', () => {
    expect(level4.waves.length).toBe(6);
  });

  it('wave numbers are sequential 1–6', () => {
    for (let i = 0; i < level4.waves.length; i++) {
      expect(level4.waves[i].waveNumber).toBe(i + 1);
    }
  });

  it('includes Enemy D from level 3', () => {
    const hasTypeD = level4.waves.some(w =>
      w.slots?.some(s => s.type === 'D'),
    );
    expect(hasTypeD).toBe(true);
  });

  it('introduces Enemy E (type E appears in at least one wave)', () => {
    const hasTypeE = level4.waves.some(w =>
      w.slots?.some(s => s.type === 'E'),
    );
    expect(hasTypeE).toBe(true);
  });
});
