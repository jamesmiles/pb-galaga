import { describe, it, expect } from 'vitest';
import { createBackground, updateBackground } from '../../../src/objects/environment/Background';
import { GAME_HEIGHT, STAR_COUNT, STAR_DEPTH_LAYERS } from '../../../src/engine/constants';

describe('Background', () => {
  it('creates correct number of stars', () => {
    const bg = createBackground();
    const expectedPerLayer = Math.floor(STAR_COUNT / STAR_DEPTH_LAYERS.length);
    expect(bg.stars.length).toBe(expectedPerLayer * STAR_DEPTH_LAYERS.length);
  });

  it('stars have valid properties', () => {
    const bg = createBackground();
    for (const star of bg.stars) {
      expect(star.position.x).toBeGreaterThanOrEqual(0);
      expect(star.position.y).toBeGreaterThanOrEqual(0);
      expect(star.depth).toBeGreaterThan(0);
      expect(star.size).toBeGreaterThan(0);
      expect(star.brightness).toBeGreaterThan(0);
    }
  });

  it('stars at different depths exist', () => {
    const bg = createBackground();
    const depths = new Set(bg.stars.map(s => s.depth));
    expect(depths.size).toBe(STAR_DEPTH_LAYERS.length);
  });

  it('scrolls stars downward', () => {
    const bg = createBackground();
    const starY = bg.stars[0].position.y;
    const starDepth = bg.stars[0].depth;

    updateBackground(bg, 1.0); // 1 second

    // Star should have moved down by scrollSpeed * depth
    expect(bg.stars[0].position.y).toBeCloseTo(starY + bg.scrollSpeed * starDepth, 1);
  });

  it('near stars move faster than far stars', () => {
    const bg = createBackground();

    // Find a near star and a far star
    const nearStar = bg.stars.find(s => s.depth === 1.0)!;
    const farStar = bg.stars.find(s => s.depth === 0.2)!;
    const nearY = nearStar.position.y;
    const farY = farStar.position.y;

    updateBackground(bg, 1.0);

    const nearDelta = nearStar.position.y - nearY;
    const farDelta = farStar.position.y - farY;
    expect(nearDelta).toBeGreaterThan(farDelta);
  });

  it('wraps stars that go off screen', () => {
    const bg = createBackground();
    // Place a star near bottom
    bg.stars[0].position.y = GAME_HEIGHT - 1;

    // Update enough to push it off screen
    updateBackground(bg, 1.0);

    // Should wrap to top
    expect(bg.stars[0].position.y).toBeLessThan(GAME_HEIGHT);
  });

  it('all stars remain within bounds after many updates', () => {
    const bg = createBackground();

    for (let i = 0; i < 600; i++) {
      updateBackground(bg, 1/60);
    }

    for (const star of bg.stars) {
      expect(star.position.y).toBeLessThanOrEqual(GAME_HEIGHT);
      expect(star.position.y).toBeGreaterThanOrEqual(0);
    }
  });
});
