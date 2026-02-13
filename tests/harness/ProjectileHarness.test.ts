import { describe, it, expect } from 'vitest';
import { ProjectileHarness } from '../../src/harness/ProjectileHarness';

describe('ProjectileHarness', () => {
  it('all default scenarios pass', () => {
    const harness = new ProjectileHarness();
    const results = harness.runAllScenarios();

    for (const result of results) {
      expect(result.passed, `Scenario failed: ${result.name}`).toBe(true);
    }
    expect(results.length).toBeGreaterThan(0);
  });
});
