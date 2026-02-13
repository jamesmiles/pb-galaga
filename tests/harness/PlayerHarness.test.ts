import { describe, it, expect } from 'vitest';
import { PlayerHarness } from '../../src/harness/PlayerHarness';

describe('PlayerHarness', () => {
  it('all default scenarios pass', () => {
    const harness = new PlayerHarness();
    const results = harness.runAllScenarios();

    for (const result of results) {
      expect(result.passed, `Scenario failed: ${result.name}`).toBe(true);
    }
    expect(results.length).toBeGreaterThan(0);
  });

  it('can start game and move player', () => {
    const harness = new PlayerHarness();
    harness.startGame();
    const startX = harness.getState().players[0].position.x;

    harness.injectInput('player1', { left: false, right: true, up: false, down: false, fire: false });
    harness.tick(30);

    expect(harness.getState().players[0].position.x).toBeGreaterThan(startX);
  });
});
