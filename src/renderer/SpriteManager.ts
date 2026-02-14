import Phaser from 'phaser';
import {
  createPlayerShipCanvas,
  createPlayerShipBlueCanvas,
  createEnemyACanvas,
  createEnemyBCanvas,
  createEnemyCCanvas,
  createExplosionFrames,
  createLaserCanvas,
  createBulletCanvas,
  createParticleCanvas,
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

  // Player ship (blue)
  if (!textures.exists('player-ship-blue')) {
    const blueShipCanvas = createPlayerShipBlueCanvas();
    textures.addCanvas('player-ship-blue', blueShipCanvas);
  }

  // Enemy Type A
  if (!textures.exists('enemy-a')) {
    const enemyCanvas = createEnemyACanvas();
    textures.addCanvas('enemy-a', enemyCanvas);
  }

  // Enemy Type B
  if (!textures.exists('enemy-b')) {
    const enemyBCanvas = createEnemyBCanvas();
    textures.addCanvas('enemy-b', enemyBCanvas);
  }

  // Enemy Type C
  if (!textures.exists('enemy-c')) {
    const enemyCCanvas = createEnemyCCanvas();
    textures.addCanvas('enemy-c', enemyCCanvas);
  }

  // Laser projectile
  if (!textures.exists('laser')) {
    const laserCanvas = createLaserCanvas();
    textures.addCanvas('laser', laserCanvas);
  }

  // Bullet projectile
  if (!textures.exists('bullet')) {
    const bulletCanvas = createBulletCanvas();
    textures.addCanvas('bullet', bulletCanvas);
  }

  // Particle (for explosion emitters)
  if (!textures.exists('particle')) {
    const particleCanvas = createParticleCanvas();
    textures.addCanvas('particle', particleCanvas);
  }

  // Explosion frames (legacy, kept for compatibility)
  const explosionCanvases = createExplosionFrames();
  for (let i = 0; i < explosionCanvases.length; i++) {
    const key = `explosion-${i}`;
    if (!textures.exists(key)) {
      textures.addCanvas(key, explosionCanvases[i]);
    }
  }
}
