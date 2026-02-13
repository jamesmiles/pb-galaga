import type { BackgroundState, Star } from '../../types';
import { STAR_COUNT, STAR_SCROLL_SPEED, STAR_DEPTH_LAYERS, GAME_WIDTH, GAME_HEIGHT } from '../../engine/constants';

/** Create initial background with procedurally generated stars. */
export function createBackground(): BackgroundState {
  const stars: Star[] = [];
  const starsPerLayer = Math.floor(STAR_COUNT / STAR_DEPTH_LAYERS.length);

  for (const depth of STAR_DEPTH_LAYERS) {
    for (let i = 0; i < starsPerLayer; i++) {
      stars.push({
        position: {
          x: Math.random() * GAME_WIDTH,
          y: Math.random() * GAME_HEIGHT,
        },
        depth,
        size: 0.5 + depth * 2, // larger when closer
        brightness: 0.3 + depth * 0.7, // brighter when closer
      });
    }
  }

  return {
    stars,
    scrollSpeed: STAR_SCROLL_SPEED,
  };
}

/** Update background stars with parallax scrolling. */
export function updateBackground(bg: BackgroundState, dtSeconds: number): void {
  for (const star of bg.stars) {
    // Scroll downward, speed proportional to depth
    star.position.y += bg.scrollSpeed * star.depth * dtSeconds;

    // Wrap around when star goes off bottom
    if (star.position.y > GAME_HEIGHT) {
      star.position.y = 0;
      star.position.x = Math.random() * GAME_WIDTH;
    }
  }
}
