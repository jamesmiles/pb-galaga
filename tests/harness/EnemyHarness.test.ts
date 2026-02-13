import { describe, it, expect } from 'vitest';
import { EnemyHarness } from '../../src/harness/EnemyHarness';

describe('EnemyHarness', () => {
  it('all default scenarios pass', () => {
    const harness = new EnemyHarness();
    const results = harness.runAllScenarios();

    for (const result of results) {
      expect(result.passed, `Scenario failed: ${result.name}`).toBe(true);
    }
    expect(results.length).toBeGreaterThan(0);
  });
});
