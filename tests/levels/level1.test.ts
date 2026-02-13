import { describe, it, expect } from 'vitest';
import { LEVEL_1 } from '../../src/levels/level1';
import { validateLevelConfig } from '../../src/levels/LevelConfig';

describe('Level 1 Configuration', () => {
  it('passes validation', () => {
    expect(validateLevelConfig(LEVEL_1)).toBe(true);
  });

  it('is level 1 named First Contact', () => {
    expect(LEVEL_1.levelNumber).toBe(1);
    expect(LEVEL_1.name).toBe('First Contact');
  });

  it('has one wave', () => {
    expect(LEVEL_1.waves).toHaveLength(1);
  });

  it('wave has 12 Type A enemies', () => {
    const wave = LEVEL_1.waves[0];
    expect(wave.enemies).toHaveLength(1);
    expect(wave.enemies[0].type).toBe('A');
    expect(wave.enemies[0].count).toBe(12);
  });

  it('wave uses swarm formation', () => {
    expect(LEVEL_1.waves[0].enemies[0].formation).toBe('swarm');
  });

  it('wave has spawn delay between enemies', () => {
    expect(LEVEL_1.waves[0].enemies[0].spawnDelay).toBeGreaterThan(0);
  });
});
