import { describe, it, expect } from 'vitest';
import { level3 } from './level3';

describe('Level 3 — Moon Battle', () => {
  it('is level number 3', () => {
    expect(level3.levelNumber).toBe(3);
  });

  it('is named "Moon Battle"', () => {
    expect(level3.name).toBe('Moon Battle');
  });

  it('has 7 waves', () => {
    expect(level3.waves.length).toBe(7);
  });

  it('wave numbers are sequential 1–6', () => {
    for (let i = 0; i < level3.waves.length; i++) {
      expect(level3.waves[i].waveNumber).toBe(i + 1);
    }
  });

  it('introduces Enemy D (type D appears in at least one wave)', () => {
    const hasTypeD = level3.waves.some(w =>
      w.slots?.some(s => s.type === 'D'),
    );
    expect(hasTypeD).toBe(true);
  });

  it('does not include Enemy E (reserved for level 4)', () => {
    const hasTypeE = level3.waves.some(w =>
      w.slots?.some(s => s.type === 'E'),
    );
    expect(hasTypeE).toBe(false);
  });
});
