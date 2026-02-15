import { describe, it, expect } from 'vitest';
import { level5 } from './level5';

describe('Level 5 config', () => {
  it('has 5 waves', () => {
    expect(level5.waves.length).toBe(5);
  });

  it('is named Defeat Mars Colony', () => {
    expect(level5.name).toBe('Defeat Mars Colony');
  });

  it('wave 5 is a boss spawn', () => {
    const wave5 = level5.waves[4];
    expect(wave5.bossSpawn).toBe(true);
  });

  it('wave 2 introduces Enemy F', () => {
    const wave2 = level5.waves[1];
    const hasF = wave2.slots?.some(s => s.type === 'F');
    expect(hasF).toBe(true);
  });

  it('wave 4 has all enemy types', () => {
    const wave4 = level5.waves[3];
    const types = new Set(wave4.slots?.map(s => s.type));
    expect(types.has('A')).toBe(true);
    expect(types.has('B')).toBe(true);
    expect(types.has('C')).toBe(true);
    expect(types.has('D')).toBe(true);
    expect(types.has('E')).toBe(true);
    expect(types.has('F')).toBe(true);
  });

  it('wave 1 uses x-formation', () => {
    expect(level5.waves[0].formation).toBe('x-formation');
  });

  it('non-boss waves have enemy slots', () => {
    for (let i = 0; i < 4; i++) {
      const wave = level5.waves[i];
      expect(wave.slots!.length).toBeGreaterThan(0);
    }
  });

  it('level number is 5', () => {
    expect(level5.levelNumber).toBe(5);
  });
});
