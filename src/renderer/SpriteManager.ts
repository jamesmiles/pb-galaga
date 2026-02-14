import Phaser from 'phaser';
import {
  createPlayerShipCanvas,
  createEnemyACanvas,
  createExplosionFrames,
  createLaserCanvas,
} from '../assets/sprites';

/**
 * Manages sprite textures — generates pixel art canvases
 * and registers them as Phaser textures.
 */
export function registerTextures(scene: Phaser.Scene): void {
  const textures = scene.textures;

  // Player ship
  if (!textures.exists('player-ship')) {
    const shipCanvas = createPlayerShipCanvas();
    textures.addCanvas('player-ship', shipCanvas);
  }

  // Enemy Type A
  if (!textures.exists('enemy-a')) {
    const enemyCanvas = createEnemyACanvas();
    textures.addCanvas('enemy-a', enemyCanvas);
  }

  // Laser projectile
  if (!textures.exists('laser')) {
    const laserCanvas = createLaserCanvas();
    textures.addCanvas('laser', laserCanvas);
  }

  // Explosion frames
  const explosionCanvases = createExplosionFrames();
  for (let i = 0; i < explosionCanvases.length; i++) {
    const key = `explosion-${i}`;
    if (!textures.exists(key)) {
      textures.addCanvas(key, explosionCanvases[i]);
    }
  }
}
