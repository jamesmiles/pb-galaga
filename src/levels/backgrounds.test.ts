import { describe, it, expect } from 'vitest';
import { LEVEL_BACKGROUNDS } from './backgrounds';

describe('LEVEL_BACKGROUNDS', () => {
  it('no level should contain duplicate celestial body types', () => {
    for (const [level, configs] of Object.entries(LEVEL_BACKGROUNDS)) {
      // Extract base celestial body name from URL (e.g. "moon.png" and "moon-small.png" both → "moon")
      const bodyTypes = configs.map(c => {
        const filename = c.url.split('/').pop() ?? c.url;
        // Strip size suffixes (-small, -large) and extension to get base type
        // Keep color suffixes (e.g. asteroids-brown vs asteroids-blue are distinct)
        return filename.replace(/-(small|large)/, '').replace(/\.\w+$/, '');
      });

      const seen = new Set<string>();
      for (const body of bodyTypes) {
        expect(seen.has(body), `Level ${level} has duplicate celestial body type "${body}"`).toBe(false);
        seen.add(body);
      }
    }
  });
});
