import type { Vector2D, TankState, Player } from '../../types';
import { TANK_BODY_WIDTH, TANK_BODY_HEIGHT, TANK_TURRET_LENGTH } from '../../engine/constants';

/**
 * Draw a tank at the given screen position.
 * Procedural Canvas 2D: rectangular body, circular turret base, barrel.
 */
export function drawTank(
  ctx: CanvasRenderingContext2D,
  screenPos: Vector2D,
  tank: TankState,
  player: Player,
): void {
  const isP1 = player.id === 'player1';
  const bodyColor = isP1 ? '#cc2222' : '#2244cc';
  const bodyDark = isP1 ? '#881111' : '#112288';
  const turretColor = isP1 ? '#ff4444' : '#4488ff';
  const barrelColor = '#999999';
  const barrelDark = '#666666';
  const glowColor = isP1 ? '#ff4444' : '#4488ff';

  // Invulnerability flash: skip drawing every other 100ms
  if (player.isInvulnerable) {
    const flash = Math.floor(player.invulnerabilityTimer / 100) % 2;
    if (flash === 1) return;
  }

  ctx.save();
  ctx.translate(screenPos.x, screenPos.y);

  // --- Tank body (rotated to heading) ---
  ctx.save();
  // heading: 0 = east, PI/2 = north; canvas rotation: 0 = right, negative = up
  ctx.rotate(-tank.heading);

  // Neon glow
  ctx.shadowBlur = 8;
  ctx.shadowColor = glowColor;

  // Main body rectangle
  const hw = TANK_BODY_WIDTH / 2;
  const hh = TANK_BODY_HEIGHT / 2;
  ctx.fillStyle = bodyColor;
  ctx.fillRect(-hh, -hw, TANK_BODY_HEIGHT, TANK_BODY_WIDTH);

  // Tread stripes on sides
  ctx.fillStyle = bodyDark;
  ctx.fillRect(-hh, -hw, TANK_BODY_HEIGHT, 5);        // Left tread
  ctx.fillRect(-hh, hw - 5, TANK_BODY_HEIGHT, 5);     // Right tread

  // Forward indicator (lighter front edge)
  ctx.fillStyle = turretColor;
  ctx.fillRect(hh - 4, -hw + 5, 4, TANK_BODY_WIDTH - 10);

  ctx.shadowBlur = 0;
  ctx.restore();

  // --- Turret (rotated to turret angle) ---
  ctx.save();
  ctx.rotate(-tank.turretAngle);

  // Turret base circle
  ctx.shadowBlur = 6;
  ctx.shadowColor = glowColor;
  ctx.fillStyle = turretColor;
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();

  // Barrel (extends from center outward along turret angle)
  const recoilOffset = tank.turretRecoil * 4; // Recoil pulls barrel back
  const barrelX = 8 - recoilOffset;
  const barrelW = TANK_TURRET_LENGTH - 8 + recoilOffset;

  // Dark barrel edge (shadow)
  ctx.shadowBlur = 0;
  ctx.fillStyle = barrelDark;
  ctx.fillRect(barrelX, -3, barrelW, 6);

  // Main barrel body (lighter grey)
  ctx.fillStyle = barrelColor;
  ctx.fillRect(barrelX, -2, barrelW, 4);

  // Barrel highlight stripe (metallic sheen)
  ctx.fillStyle = '#cccccc';
  ctx.fillRect(barrelX, -1, barrelW, 1.5);

  // Muzzle tip
  ctx.fillStyle = '#bbbbbb';
  ctx.fillRect(TANK_TURRET_LENGTH - 2, -3, 2, 6);

  ctx.shadowBlur = 0;
  ctx.restore();

  ctx.restore();
}
