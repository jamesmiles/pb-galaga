import earthUrl from '../backgrounds/earth.png';
import moonUrl from '../backgrounds/moon.png';
import moonSmallUrl from '../backgrounds/moon-small.png';
import asteroidsBrownUrl from '../backgrounds/asteroids-brown.png';
import asteroidsBlueUrl from '../backgrounds/asteroids-blue.png';
import asteroidsPurpleUrl from '../backgrounds/asteroids-purple.png';

export interface BackgroundObjectConfig {
  url: string;
  x: number;
  y: number;
  scale: number;
  alpha: number;
  scrollSpeed: number;
}

/** Per-level background object configs. Drawn behind starfield for parallax depth. */
export const LEVEL_BACKGROUNDS: Record<number, BackgroundObjectConfig[]> = {
  1: [],
  2: [
    { url: earthUrl, x: 400, y: 500, scale: 1.8, alpha: 0.15, scrollSpeed: 3 },
  ],
  3: [
    { url: moonUrl, x: 300, y: 400, scale: 1.4, alpha: 0.2, scrollSpeed: 5 },
    { url: moonSmallUrl, x: 600, y: 250, scale: 0.6, alpha: 0.12, scrollSpeed: 2 },
  ],
  4: [
    { url: asteroidsBrownUrl, x: 200, y: 350, scale: 1.0, alpha: 0.18, scrollSpeed: 6 },
    { url: asteroidsBlueUrl, x: 550, y: 550, scale: 0.8, alpha: 0.14, scrollSpeed: 4 },
    { url: asteroidsPurpleUrl, x: 650, y: 200, scale: 0.7, alpha: 0.1, scrollSpeed: 3 },
  ],
};
