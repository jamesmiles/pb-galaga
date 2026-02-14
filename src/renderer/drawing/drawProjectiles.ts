import type { Projectile } from '../../types';
import { lerpPosition } from '../InterpolationUtils';

/** Trail afterimage opacity levels (newest to oldest). */
const TRAIL_OPACITIES = [0.35, 0.2, 0.1, 0.04];
/** Spacing between trail segments in pixels. */
const TRAIL_SPACING = 8;

/**
 * Draw all active projectiles with type-specific colors, glow, and trailing afterimages.
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

    // Compute trail direction (normalized velocity)
    const vx = proj.velocity.x;
    const vy = proj.velocity.y;
    const vLen = Math.sqrt(vx * vx + vy * vy);
    const nx = vLen > 0 ? vx / vLen : 0;
    const ny = vLen > 0 ? vy / vLen : -1; // Default upward for stationary

    // Draw trails (additive blending)
    if (proj.type === 'laser') {
      drawTrails(ctx, pos.x, pos.y, nx, ny, '#00ffff', 4, 12);
    } else {
      const isPlayerBullet = proj.owner.type === 'player';
      const trailColor = isPlayerBullet ? '#00ffff' : '#ff8800';
      drawTrails(ctx, pos.x, pos.y, nx, ny, trailColor, 4, 6);
    }

    // Draw main projectile
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

function drawTrails(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  nx: number, ny: number,
  color: string,
  width: number, height: number,
): void {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  for (let i = 0; i < TRAIL_OPACITIES.length; i++) {
    const offset = (i + 1) * TRAIL_SPACING;
    const trailX = x - nx * offset;
    const trailY = y - ny * offset;
    const scale = 1 - (i + 1) * 0.15; // Shrink trail segments

    ctx.globalAlpha = TRAIL_OPACITIES[i];
    ctx.fillStyle = color;
    const w = width * scale;
    const h = height * scale;
    ctx.fillRect(trailX - w / 2, trailY - h / 2, w, h);
  }

  ctx.restore();
}
