import type { BackgroundState, Star } from '../../types';
import { GAME_WIDTH, GAME_HEIGHT, STAR_COUNT, STAR_BASE_SCROLL_SPEED } from '../../engine/constants';

/** Generate initial star field. */
export function createBackground(): BackgroundState {
  const stars: Star[] = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(createStar());
  }
  return {
    stars,
    scrollSpeed: STAR_BASE_SCROLL_SPEED,
  };
}

function createStar(): Star {
  const depth = Math.random() * 0.8 + 0.2; // 0.2 to 1.0
  return {
    position: {
      x: Math.random() * GAME_WIDTH,
      y: Math.random() * GAME_HEIGHT,
    },
    depth,
    size: depth * 2 + 0.5, // Closer = bigger
    brightness: depth * 0.6 + 0.4,
  };
}

/** Update star positions (parallax scrolling). */
export function updateBackground(bg: BackgroundState, dtSeconds: number): void {
  for (const star of bg.stars) {
    // Scroll speed varies by depth (closer stars move faster)
    star.position.y += bg.scrollSpeed * star.depth * dtSeconds;

    // Wrap around screen
    if (star.position.y > GAME_HEIGHT) {
      star.position.y -= GAME_HEIGHT;
      star.position.x = Math.random() * GAME_WIDTH;
    }
  }
}
