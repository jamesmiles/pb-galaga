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

    // Draw ship as a triangle (inspired by copilot's design)
    ctx.fillStyle = colors.fill;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y - 14);      // Nose (top)
    ctx.lineTo(pos.x - 12, pos.y + 12); // Left wing
    ctx.lineTo(pos.x + 12, pos.y + 12); // Right wing
    ctx.closePath();
    ctx.fill();

    // Cockpit accent
    ctx.shadowBlur = 0;
    ctx.fillStyle = colors.cockpit;
    ctx.fillRect(pos.x - 2, pos.y - 2, 4, 6);

    // Engine glow (small bright dots at the back)
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#ffaa22';
    ctx.fillStyle = '#ffff44';
    ctx.fillRect(pos.x - 5, pos.y + 10, 3, 3);
    ctx.fillRect(pos.x + 2, pos.y + 10, 3, 3);
    ctx.shadowBlur = 0;

    ctx.restore();
  }
}
