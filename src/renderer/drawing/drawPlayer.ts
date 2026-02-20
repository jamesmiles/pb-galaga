import type { Player } from '../../types';
import { lerpPosition } from '../InterpolationUtils';

/** Color config per ship color. */
const SHIP_COLORS: Record<string, { fill: string; glow: string; cockpit: string }> = {
  red: { fill: '#ff3344', glow: '#ff3344', cockpit: '#2244aa' },
  blue: { fill: '#0099ff', glow: '#0099ff', cockpit: '#aa2244' },
};

/**
 * Draw all player ships using procedural Canvas 2D shapes with neon glow.
 */
export function drawPlayers(
  ctx: CanvasRenderingContext2D,
  players: Player[],
  prevPlayers: Map<string, Player>,
  alpha: number,
  currentTime: number,
): void {
  for (const player of players) {
    if (!player.isAlive) continue;

    // Skip rendering during death sequence
    if (player.deathSequence?.active) continue;

    const prev = prevPlayers.get(player.id);
    const pos = prev ? lerpPosition(prev.position, player.position, alpha) : player.position;

    const colors = SHIP_COLORS[player.shipColor] || SHIP_COLORS.red;

    ctx.save();

    // Invulnerability flashing
    if (player.isInvulnerable) {
      const flash = Math.floor(currentTime / 100) % 2 === 0;
      ctx.globalAlpha = flash ? 1 : 0.3;
    }

    // Neon glow
    ctx.shadowBlur = 12;
    ctx.shadowColor = colors.glow;

    if (player.movementMode === 'tank') {
      drawPlayerTank(ctx, pos.x, pos.y, colors);
    } else {
      drawPlayerShip(ctx, pos.x, pos.y, colors);
    }

    ctx.restore();
  }
}

/** Draw the standard spaceship. */
function drawPlayerShip(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  colors: { fill: string; glow: string; cockpit: string },
): void {
  // Ship triangle
  ctx.fillStyle = colors.fill;
  ctx.beginPath();
  ctx.moveTo(x, y - 14);      // Nose (top)
  ctx.lineTo(x - 12, y + 12); // Left wing
  ctx.lineTo(x + 12, y + 12); // Right wing
  ctx.closePath();
  ctx.fill();

  // Cockpit accent
  ctx.shadowBlur = 0;
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(x - 2, y - 2, 4, 6);

  // Engine glow
  ctx.shadowBlur = 6;
  ctx.shadowColor = '#ffaa22';
  ctx.fillStyle = '#ffff44';
  ctx.fillRect(x - 5, y + 10, 3, 3);
  ctx.fillRect(x + 2, y + 10, 3, 3);
  ctx.shadowBlur = 0;
}

/** Draw the player tank (Mars ground mode). */
function drawPlayerTank(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  colors: { fill: string; glow: string; cockpit: string },
): void {
  // Tank hull (rectangular)
  ctx.fillStyle = colors.fill;
  ctx.fillRect(x - 14, y - 4, 28, 14);

  // Track sections (darker, on sides)
  ctx.fillStyle = '#333333';
  ctx.fillRect(x - 16, y + 2, 4, 10);
  ctx.fillRect(x + 12, y + 2, 4, 10);

  // Track detail lines
  ctx.fillStyle = '#555555';
  ctx.fillRect(x - 15, y + 4, 2, 2);
  ctx.fillRect(x - 15, y + 8, 2, 2);
  ctx.fillRect(x + 13, y + 4, 2, 2);
  ctx.fillRect(x + 13, y + 8, 2, 2);

  // Turret dome (on top)
  ctx.fillStyle = colors.fill;
  ctx.beginPath();
  ctx.arc(x, y - 4, 8, Math.PI, 0);
  ctx.fill();

  // Barrel (pointing up)
  ctx.fillStyle = colors.cockpit;
  ctx.fillRect(x - 2, y - 18, 4, 14);

  // Barrel tip
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 2, y - 19, 4, 2);

  // Exhaust glow (rear of tank)
  ctx.shadowBlur = 6;
  ctx.shadowColor = '#ffaa22';
  ctx.fillStyle = '#ffff44';
  ctx.fillRect(x - 10, y + 10, 3, 3);
  ctx.fillRect(x + 7, y + 10, 3, 3);
  ctx.shadowBlur = 0;
}
