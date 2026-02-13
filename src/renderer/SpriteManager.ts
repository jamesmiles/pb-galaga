import Phaser from 'phaser';
import type { Player, Enemy, Projectile, Star } from '../types';

/** Manages mapping between game entities and Phaser game objects. */
export class SpriteManager {
  private scene: Phaser.Scene;
  private playerSprites: Map<string, Phaser.GameObjects.Graphics> = new Map();
  private enemySprites: Map<string, Phaser.GameObjects.Graphics> = new Map();
  private projectileSprites: Map<string, Phaser.GameObjects.Graphics> = new Map();
  private starSprites: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Draw or update a player sprite (red/blue triangle). */
  updatePlayer(player: Player, x: number, y: number, rotation: number): void {
    let gfx = this.playerSprites.get(player.id);
    if (!gfx) {
      gfx = this.scene.add.graphics();
      this.playerSprites.set(player.id, gfx);
    }

    gfx.clear();

    if (!player.isAlive) {
      gfx.setVisible(false);
      return;
    }

    // Invulnerability flashing
    if (player.isInvulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
      gfx.setVisible(false);
      return;
    }

    gfx.setVisible(true);
    const color = player.shipColor === 'red' ? 0xff3333 : 0x3333ff;

    gfx.setPosition(x, y);
    gfx.setRotation(rotation);

    // Draw ship triangle
    gfx.fillStyle(color, 1);
    gfx.fillTriangle(0, -15, -10, 10, 10, 10);

    // Thruster glow
    if (player.isThrusting) {
      gfx.fillStyle(0xff8800, 0.8);
      gfx.fillTriangle(-5, 10, 5, 10, 0, 18);
    }
  }

  /** Draw or update an enemy sprite (green diamond). */
  updateEnemy(enemy: Enemy, x: number, y: number, rotation: number): void {
    let gfx = this.enemySprites.get(enemy.id);
    if (!gfx) {
      gfx = this.scene.add.graphics();
      this.enemySprites.set(enemy.id, gfx);
    }

    gfx.clear();

    if (!enemy.isAlive) {
      gfx.setVisible(false);
      return;
    }

    gfx.setVisible(true);
    gfx.setPosition(x, y);
    gfx.setRotation(rotation);

    // Draw enemy diamond
    gfx.fillStyle(0x33ff33, 1);
    gfx.fillTriangle(0, -12, -10, 0, 0, 12);
    gfx.fillTriangle(0, -12, 10, 0, 0, 12);

    // Outline
    gfx.lineStyle(1, 0x00cc00, 0.8);
    gfx.strokeTriangle(0, -12, -10, 0, 0, 12);
  }

  /** Draw or update a projectile sprite (yellow rectangle). */
  updateProjectile(proj: Projectile, x: number, y: number): void {
    let gfx = this.projectileSprites.get(proj.id);
    if (!gfx) {
      gfx = this.scene.add.graphics();
      this.projectileSprites.set(proj.id, gfx);
    }

    gfx.clear();

    if (!proj.isActive) {
      gfx.setVisible(false);
      return;
    }

    gfx.setVisible(true);
    gfx.setPosition(x, y);

    // Laser: bright narrow rectangle
    const isPlayerLaser = proj.owner.type === 'player';
    const color = isPlayerLaser ? 0xffff33 : 0xff3333;
    gfx.fillStyle(color, 1);
    gfx.fillRect(-1.5, -8, 3, 16);

    // Glow effect
    gfx.fillStyle(color, 0.3);
    gfx.fillRect(-3, -10, 6, 20);
  }

  /** Draw all stars as a single graphics layer. */
  drawStars(stars: Star[]): void {
    if (!this.starSprites) {
      this.starSprites = this.scene.add.graphics();
      this.starSprites.setDepth(-1); // Behind everything
    }

    this.starSprites.clear();

    for (const star of stars) {
      const alpha = star.brightness;
      const size = star.size;

      this.starSprites.fillStyle(0xffffff, alpha);
      this.starSprites.fillCircle(star.position.x, star.position.y, size);
    }
  }

  /** Remove sprites for entities no longer in state. */
  cleanup(activePlayerIds: Set<string>, activeEnemyIds: Set<string>, activeProjectileIds: Set<string>): void {
    for (const [id, gfx] of this.enemySprites) {
      if (!activeEnemyIds.has(id)) {
        gfx.destroy();
        this.enemySprites.delete(id);
      }
    }
    for (const [id, gfx] of this.projectileSprites) {
      if (!activeProjectileIds.has(id)) {
        gfx.destroy();
        this.projectileSprites.delete(id);
      }
    }
  }

  destroy(): void {
    for (const gfx of this.playerSprites.values()) gfx.destroy();
    for (const gfx of this.enemySprites.values()) gfx.destroy();
    for (const gfx of this.projectileSprites.values()) gfx.destroy();
    this.starSprites?.destroy();
    this.playerSprites.clear();
    this.enemySprites.clear();
    this.projectileSprites.clear();
    this.starSprites = null;
  }
}
