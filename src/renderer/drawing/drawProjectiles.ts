import type { Projectile } from '../../types';
import { lerpPosition } from '../InterpolationUtils';
import { BULLET_L5_COLLISION_RADIUS, SNAKE_L5_DAMAGE } from '../../engine/constants';

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
    } else if (proj.type === 'plasma') {
      drawTrails(ctx, pos.x, pos.y, nx, ny, '#ff00ff', 6, 10);
    } else if (proj.type === 'rocket') {
      drawTrails(ctx, pos.x, pos.y, nx, ny, '#aa44ff', 5, 10);
    } else if (proj.type === 'missile') {
      drawTrails(ctx, pos.x, pos.y, nx, ny, '#44ff44', 3, 6);
    } else if (proj.type === 'snake') {
      const isL5Snake = proj.damage >= SNAKE_L5_DAMAGE;
      drawTrails(ctx, pos.x, pos.y, nx, ny, '#00ffff', 8, isL5Snake ? 28 : 14);
    } else {
      const isPlayerBullet = proj.owner.type === 'player';
      const isL5Bullet = isPlayerBullet && proj.collisionRadius >= BULLET_L5_COLLISION_RADIUS;
      const trailColor = isPlayerBullet ? '#ff4444' : '#ff8800';
      const bw = isL5Bullet ? 8 : 4;
      const bh = isL5Bullet ? 12 : 6;
      drawTrails(ctx, pos.x, pos.y, nx, ny, trailColor, bw, bh);
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
    } else if (proj.type === 'plasma') {
      // Magenta plasma with heavy glow
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#ff00ff';
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(pos.x - 3, pos.y - 5, 6, 10);

      // Bright white core
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(pos.x - 1, pos.y - 3, 2, 6);
    } else if (proj.type === 'rocket') {
      // Purple rocket with flame glow
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#8800ff';
      ctx.fillStyle = '#aa44ff';
      ctx.fillRect(pos.x - 2.5, pos.y - 5, 5, 10);

      // White hot tip
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(pos.x - 1, pos.y - 5, 2, 3);

      // Flame tail
      ctx.fillStyle = '#cc88ff';
      ctx.fillRect(pos.x - 2, pos.y + 3, 4, 4);
    } else if (proj.type === 'missile') {
      // Green homing missile
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#44ff44';
      ctx.fillStyle = '#44ff44';
      ctx.fillRect(pos.x - 1.5, pos.y - 4, 3, 8);

      // Bright green exhaust
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#88ffaa';
      ctx.fillRect(pos.x - 1, pos.y + 2, 2, 3);
    } else if (proj.type === 'snake') {
      const isL5Snake = proj.damage >= SNAKE_L5_DAMAGE;
      const snakeH = isL5Snake ? 28 : 14;
      const snakeCoreH = isL5Snake ? 20 : 10;
      // Thick cyan beam with heavy glow
      ctx.shadowBlur = isL5Snake ? 24 : 16;
      ctx.shadowColor = '#00ffff';
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(pos.x - 4, pos.y - snakeH / 2, 8, snakeH);

      // Bright white core
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(pos.x - 2, pos.y - snakeCoreH / 2, 4, snakeCoreH);
    } else {
      // Bullet — color depends on owner
      const isPlayerBullet = proj.owner.type === 'player';
      const isL5Bullet = isPlayerBullet && proj.collisionRadius >= BULLET_L5_COLLISION_RADIUS;
      const color = isPlayerBullet ? '#ff4444' : '#ffff00';
      const glowColor = isPlayerBullet ? '#ff4444' : '#ff8800';

      const bw = isL5Bullet ? 8 : 4;
      const bh = isL5Bullet ? 12 : 6;
      const cw = isL5Bullet ? 4 : 2;
      const ch = isL5Bullet ? 8 : 4;

      ctx.shadowBlur = isL5Bullet ? 10 : 6;
      ctx.shadowColor = glowColor;
      ctx.fillStyle = color;
      ctx.fillRect(pos.x - bw / 2, pos.y - bh / 2, bw, bh);

      // Bright core
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(pos.x - cw / 2, pos.y - ch / 2, cw, ch);
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
