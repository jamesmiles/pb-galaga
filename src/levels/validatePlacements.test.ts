import { describe, it, expect } from 'vitest';
import { validateEnemyPlacements } from './validatePlacements';
import { level6Map } from './level6';
import { level7Map } from './level7';

describe('validateEnemyPlacements', () => {
  it('all level 6 enemy placements should be clear of obstacles', () => {
    const issues = validateEnemyPlacements(level6Map, level6Map.enemyPlacements ?? []);
    if (issues.length > 0) {
      const msg = issues.map(i => `  ${i.enemyId}: ${i.reason}`).join('\n');
      expect.fail(`Placement issues found:\n${msg}`);
    }
  });

  it('should detect enemy inside a boulder', () => {
    const fakePlacements = [
      { id: 'test-1', type: 'gun-nest' as const, position: { x: 300, y: 6100 }, elevation: 0 },
    ];
    const issues = validateEnemyPlacements(level6Map, fakePlacements);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].reason).toContain('boulder');
  });

  it('should detect enemy on a ramp tile', () => {
    // cliff-01 ramp-south-north at col:1, row:2 → world x=528-656, y=4456-4584
    const fakePlacements = [
      { id: 'test-2', type: 'turret' as const, position: { x: 590, y: 4500 }, elevation: 0 },
    ];
    const issues = validateEnemyPlacements(level6Map, fakePlacements);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0].reason).toContain('ramp');
  });

  it('should accept enemy on cliff surface tile', () => {
    // cliff-01 surface at col:1, row:1 → world x=528-656, y=4328-4456
    const fakePlacements = [
      { id: 'test-3', type: 'gun-nest' as const, position: { x: 590, y: 4380 }, elevation: 1 },
    ];
    const issues = validateEnemyPlacements(level6Map, fakePlacements);
    expect(issues.length).toBe(0);
  });

  it('all level 7 ground enemy placements should be clear of obstacles', () => {
    // Filter to ground-only placements (aerial enemies float above obstacles)
    const groundPlacements = (level7Map.enemyPlacements ?? []).filter(
      p => !['rocket-copter', 'laser-copter', 'spread-bomber', 'homing-bomber'].includes(p.type),
    );
    const issues = validateEnemyPlacements(level7Map, groundPlacements);
    if (issues.length > 0) {
      const msg = issues.map(i => `  ${i.enemyId}: ${i.reason}`).join('\n');
      expect.fail(`Level 7 placement issues found:\n${msg}`);
    }
  });
});
