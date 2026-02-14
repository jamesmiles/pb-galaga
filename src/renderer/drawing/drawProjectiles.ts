import type { Projectile } from '../../types';
import { lerpPosition } from '../InterpolationUtils';

/**
 * Draw all active projectiles with type-specific colors and glow.
 * Player lasers are cyan; enemy bullets are yellow/orange.
 */
export function drawProjectiles(
  ctx: CanvasRenderingContext2D,
  projectiles: Projectile[],
  prevProjectiles: Map<string, Projectile>,
  alpha: number,
): void {
  for (const proj of projectiles) {
    if (!proj.isActive) continue;

    const prev = prevProjectiles.get(proj.id);
    const pos = prev ? lerpPosition(prev.position, proj.position, alpha) : proj.position;

    ctx.save();

    if (proj.type === 'laser') {
      // Cyan laser beam with glow
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00ffff';
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(pos.x - 2, pos.y - 6, 4, 12);

      // Bright white core
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(pos.x - 1, pos.y - 5, 2, 10);
    } else {
      // Bullet — color depends on owner
      const isPlayerBullet = proj.owner.type === 'player';
      const color = isPlayerBullet ? '#00ffff' : '#ffff00';
      const glowColor = isPlayerBullet ? '#00ffff' : '#ff8800';

      ctx.shadowBlur = 6;
      ctx.shadowColor = glowColor;
      ctx.fillStyle = color;
      ctx.fillRect(pos.x - 2, pos.y - 3, 4, 6);

      // Bright core
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(pos.x - 1, pos.y - 2, 2, 4);
    }

    ctx.restore();
  }
}
