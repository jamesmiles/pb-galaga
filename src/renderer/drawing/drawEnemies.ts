import type { Enemy } from '../../types';
import { lerpPosition } from '../InterpolationUtils';

/** Color config per enemy type. */
const ENEMY_COLORS: Record<string, { fill: string; glow: string; accent: string }> = {
  A: { fill: '#00ff44', glow: '#00ff44', accent: '#44ee66' },
  B: { fill: '#00ccff', glow: '#00ccff', accent: '#44bbee' },
  C: { fill: '#ff5500', glow: '#ff5500', accent: '#ff8822' },
  D: { fill: '#ff00ff', glow: '#ff00ff', accent: '#ff66ff' },
  E: { fill: '#ffff00', glow: '#ffff00', accent: '#ffff66' },
};

/**
 * Draw all enemies using procedural Canvas 2D shapes with neon glow.
 */
export function drawEnemies(
  ctx: CanvasRenderingContext2D,
  enemies: Enemy[],
  prevEnemies: Map<string, Enemy>,
  alpha: number,
): void {
  for (const enemy of enemies) {
    if (!enemy.isAlive) continue;

    const prev = prevEnemies.get(enemy.id);
    const pos = prev ? lerpPosition(prev.position, enemy.position, alpha) : enemy.position;

    const colors = ENEMY_COLORS[enemy.type] || ENEMY_COLORS.A;

    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = colors.glow;

    if (enemy.type === 'A') {
      drawEnemyA(ctx, pos.x, pos.y, colors);
    } else if (enemy.type === 'B') {
      drawEnemyB(ctx, pos.x, pos.y, colors);
    } else if (enemy.type === 'C') {
      drawEnemyC(ctx, pos.x, pos.y, colors);
    } else if (enemy.type === 'D') {
      drawEnemyD(ctx, pos.x, pos.y, colors);
    } else {
      drawEnemyE(ctx, pos.x, pos.y, colors);
    }

    ctx.restore();
  }
}

/** Type A: Bug-like alien transport — dome + body + tentacles */
function drawEnemyA(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  colors: { fill: string; accent: string },
): void {
  ctx.fillStyle = colors.fill;

  // Dome
  ctx.fillRect(x - 4, y - 12, 8, 4);
  // Body
  ctx.fillRect(x - 8, y - 8, 16, 10);
  // Lower
  ctx.fillRect(x - 6, y + 2, 12, 4);

  // Tentacles
  ctx.fillRect(x - 10, y + 6, 4, 5);
  ctx.fillRect(x + 6, y + 6, 4, 5);
  ctx.fillRect(x - 2, y + 6, 4, 5);

  // Accent highlights
  ctx.fillStyle = colors.accent;
  ctx.fillRect(x - 2, y - 10, 4, 2);

  // Eyes (red)
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ff2222';
  ctx.fillRect(x - 5, y - 5, 3, 3);
  ctx.fillRect(x + 2, y - 5, 3, 3);

  // Eye pupils (white)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 4, y - 4, 1, 1);
  ctx.fillRect(x + 3, y - 4, 1, 1);
}

/** Type B: Armored slow fighter — wider, tankier shape */
function drawEnemyB(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  colors: { fill: string; accent: string },
): void {
  ctx.fillStyle = colors.fill;

  // Wide dome
  ctx.fillRect(x - 8, y - 12, 16, 4);
  // Upper body (armored)
  ctx.fillRect(x - 10, y - 8, 20, 6);
  // Mid body
  ctx.fillRect(x - 12, y - 2, 24, 8);
  // Lower
  ctx.fillRect(x - 8, y + 6, 16, 4);

  // Armor plates (darker)
  ctx.fillStyle = '#006699';
  ctx.fillRect(x - 10, y - 2, 4, 4);
  ctx.fillRect(x + 6, y - 2, 4, 4);

  // Eyes (orange/menacing)
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffaa22';
  ctx.fillRect(x - 6, y - 6, 4, 3);
  ctx.fillRect(x + 2, y - 6, 4, 3);

  // Eye cores
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 5, y - 5, 2, 1);
  ctx.fillRect(x + 3, y - 5, 2, 1);

  // Accent
  ctx.fillStyle = colors.accent;
  ctx.fillRect(x - 4, y + 2, 8, 2);
}

/** Type C: Fast aggressive fighter — pointed, sleek shape */
function drawEnemyC(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  colors: { fill: string; accent: string },
): void {
  ctx.fillStyle = colors.fill;

  // Pointed nose
  ctx.beginPath();
  ctx.moveTo(x, y - 12);
  ctx.lineTo(x - 6, y - 4);
  ctx.lineTo(x + 6, y - 4);
  ctx.closePath();
  ctx.fill();

  // Body
  ctx.fillRect(x - 8, y - 4, 16, 6);

  // Swept wings
  ctx.fillRect(x - 14, y + 2, 28, 4);

  // Tail fins
  ctx.fillRect(x - 4, y + 6, 8, 4);

  // Wing tips (accent color)
  ctx.fillStyle = colors.accent;
  ctx.fillRect(x - 14, y + 4, 4, 2);
  ctx.fillRect(x + 10, y + 4, 4, 2);

  // Eyes (green)
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#44ff44';
  ctx.fillRect(x - 4, y - 2, 3, 2);
  ctx.fillRect(x + 1, y - 2, 3, 2);
}

/** Type D: Curved Fighter — crescent/bracket shape, concave side facing down */
function drawEnemyD(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  colors: { fill: string; accent: string },
): void {
  ctx.fillStyle = colors.fill;

  // Crescent body — outer arc
  ctx.beginPath();
  ctx.arc(x, y + 4, 12, Math.PI * 1.15, Math.PI * 1.85);
  ctx.lineTo(x + 8, y - 8);
  ctx.arc(x, y + 4, 8, Math.PI * 1.85, Math.PI * 1.15, true);
  ctx.closePath();
  ctx.fill();

  // Left horn tip
  ctx.fillRect(x - 13, y - 8, 4, 6);
  // Right horn tip
  ctx.fillRect(x + 9, y - 8, 4, 6);

  // Central cannon mount
  ctx.fillStyle = colors.accent;
  ctx.fillRect(x - 3, y + 8, 6, 5);

  // Eye (inner glow)
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 2, y - 2, 4, 3);
  ctx.fillStyle = '#ff00ff';
  ctx.fillRect(x - 1, y - 1, 2, 1);
}

/** Type E: Strategic Bomber — wide flying wing / stealth bomber shape */
function drawEnemyE(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  colors: { fill: string; accent: string },
): void {
  ctx.fillStyle = colors.fill;

  // Flying wing — main chevron body (flipped: nose faces downward)
  ctx.beginPath();
  ctx.moveTo(x, y + 8);           // Nose (bottom)
  ctx.lineTo(x - 18, y - 6);      // Left wingtip
  ctx.lineTo(x - 14, y - 10);     // Left wing trailing
  ctx.lineTo(x - 4, y - 2);       // Left inner
  ctx.lineTo(x, y - 6);           // Center notch
  ctx.lineTo(x + 4, y - 2);       // Right inner
  ctx.lineTo(x + 14, y - 10);     // Right wing trailing
  ctx.lineTo(x + 18, y - 6);      // Right wingtip
  ctx.closePath();
  ctx.fill();

  // Engine vents (accent)
  ctx.fillStyle = colors.accent;
  ctx.fillRect(x - 8, y - 5, 3, 3);
  ctx.fillRect(x + 5, y - 5, 3, 3);

  // Cockpit slit
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ff4444';
  ctx.fillRect(x - 3, y + 2, 6, 2);

  // Wingtip accents
  ctx.fillStyle = colors.accent;
  ctx.fillRect(x - 17, y - 8, 3, 2);
  ctx.fillRect(x + 14, y - 8, 3, 2);
}
