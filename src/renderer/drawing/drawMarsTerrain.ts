import { GAME_WIDTH, GAME_HEIGHT } from '../../engine/constants';

/** Seeded pseudo-random for consistent terrain features. */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Draw procedural Mars terrain background.
 * Dark rust-red sky gradient with rocky ground features.
 * Subtly scrolls vertically for motion feel.
 */
export function drawMarsTerrain(
  ctx: CanvasRenderingContext2D,
  scrollOffset: number,
): void {
  // Sky gradient: dark red-black at top to darker rust at bottom
  const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
  gradient.addColorStop(0, '#0d0202');
  gradient.addColorStop(0.3, '#1a0505');
  gradient.addColorStop(0.7, '#281008');
  gradient.addColorStop(1.0, '#331111');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Ground plane (bottom third)
  const groundY = GAME_HEIGHT * 0.7;
  const groundGradient = ctx.createLinearGradient(0, groundY, 0, GAME_HEIGHT);
  groundGradient.addColorStop(0, '#3d1a0a');
  groundGradient.addColorStop(0.4, '#4a2010');
  groundGradient.addColorStop(1.0, '#2d1208');
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, groundY, GAME_WIDTH, GAME_HEIGHT - groundY);

  // Terrain edge line (jagged horizon)
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let x = 0; x <= GAME_WIDTH; x += 20) {
    const jitter = seededRandom(x * 0.1 + scrollOffset * 0.001) * 12 - 6;
    ctx.lineTo(x, groundY + jitter);
  }
  ctx.lineTo(GAME_WIDTH, GAME_HEIGHT);
  ctx.lineTo(0, GAME_HEIGHT);
  ctx.closePath();
  ctx.fillStyle = '#4a2010';
  ctx.fill();

  // Rocky features (craters, boulders) — scrolling slowly
  const wrapOffset = (scrollOffset * 0.02) % 200;
  ctx.save();
  ctx.globalAlpha = 0.3;

  for (let i = 0; i < 8; i++) {
    const baseX = seededRandom(i * 17) * GAME_WIDTH;
    const baseY = groundY + 20 + seededRandom(i * 31) * (GAME_HEIGHT - groundY - 40);
    const craterR = 8 + seededRandom(i * 47) * 15;
    const yOff = ((wrapOffset + i * 25) % 200) - 100;

    ctx.beginPath();
    ctx.arc(baseX, baseY + yOff * 0.05, craterR, 0, Math.PI * 2);
    ctx.fillStyle = '#2a0f06';
    ctx.fill();

    // Crater rim highlight
    ctx.beginPath();
    ctx.arc(baseX, baseY + yOff * 0.05, craterR, Math.PI * 0.8, Math.PI * 1.7);
    ctx.strokeStyle = '#5a3020';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Distant mountains/hills (silhouette in mid-ground)
  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  ctx.moveTo(0, groundY + 10);
  for (let x = 0; x <= GAME_WIDTH; x += 40) {
    const hillH = seededRandom(x * 0.07 + 0.5) * 60 + 10;
    ctx.lineTo(x, groundY - hillH);
  }
  ctx.lineTo(GAME_WIDTH, groundY + 10);
  ctx.closePath();
  ctx.fillStyle = '#221008';
  ctx.fill();

  ctx.restore();

  // Subtle dust haze near ground
  ctx.save();
  const hazeGradient = ctx.createLinearGradient(0, GAME_HEIGHT - 60, 0, GAME_HEIGHT);
  hazeGradient.addColorStop(0, 'transparent');
  hazeGradient.addColorStop(1, 'rgba(80, 40, 20, 0.15)');
  ctx.fillStyle = hazeGradient;
  ctx.fillRect(0, GAME_HEIGHT - 60, GAME_WIDTH, 60);
  ctx.restore();
}
