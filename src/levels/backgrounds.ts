import earthUrl from '../backgrounds/earth.png';
import moonUrl from '../backgrounds/moon.png';
import moonSmallUrl from '../backgrounds/moon-small.png';
import asteroidsBrownUrl from '../backgrounds/asteroids-brown.png';
import asteroidsBlueUrl from '../backgrounds/asteroids-blue.png';
import asteroidsPurpleUrl from '../backgrounds/asteroids-purple.png';
import marsUrl from '../backgrounds/mars.png';

export interface BackgroundObjectConfig {
  url: string;
  x: number;
  y: number;
  scale: number;
  alpha: number;
  scrollSpeed: number;
}

/**
 * Per-level background object configs. Objects start below the screen and
 * drift upward. `y` controls entry stagger (higher = enters later),
 * `scrollSpeed` controls drift rate in px/s.
 */
export const LEVEL_BACKGROUNDS: Record<number, BackgroundObjectConfig[]> = {
  1: [],
  2: [
    { url: earthUrl, x: 400, y: 100, scale: 1.8, alpha: 0.15, scrollSpeed: 12 },
  ],
  3: [
    { url: moonUrl, x: 300, y: 50, scale: 1.4, alpha: 0.2, scrollSpeed: 15 },
  ],
  4: [
    { url: asteroidsBrownUrl, x: 200, y: 0, scale: 1.0, alpha: 0.18, scrollSpeed: 18 },
    { url: asteroidsBlueUrl, x: 550, y: 300, scale: 0.8, alpha: 0.14, scrollSpeed: 14 },
    { url: asteroidsPurpleUrl, x: 650, y: 600, scale: 0.7, alpha: 0.1, scrollSpeed: 10 },
  ],
  5: [
    { url: marsUrl, x: 350, y: 80, scale: 1.6, alpha: 0.18, scrollSpeed: 8 },
    { url: moonSmallUrl, x: 620, y: 500, scale: 0.5, alpha: 0.12, scrollSpeed: 12 },
  ],
};
