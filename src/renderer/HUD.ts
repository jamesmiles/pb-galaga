import type { GameState } from '../types';
import { GAME_WIDTH, SECONDARY_WEAPON_DURATION } from '../engine/constants';

/**
 * Draw the HUD overlay (score, lives, wave, FPS) using Canvas 2D text.
 * Only visible during gameplay (not on menu screens).
 */
export function drawHUD(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  engineFps: number,
  renderFps: number,
): void {
  ctx.save();
  ctx.font = '16px monospace';

  // Player 1 score and lives (top-right)
  const p1 = state.players.find(p => p.id === 'player1');
  if (p1) {
    const label = state.gameMode === 'co-op' ? 'P1 ' : '';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText(`${label}Score: ${p1.score}`, GAME_WIDTH - 10, 24);
    ctx.fillText(`${label}Lives: ${p1.lives}`, GAME_WIDTH - 10, 44);
  }

  // Player 2 score and lives (below P1, in blue)
  const p2 = state.players.find(p => p.id === 'player2');
  if (p2) {
    ctx.fillStyle = '#4488ff';
    ctx.textAlign = 'right';
    ctx.fillText(`P2 Score: ${p2.score}`, GAME_WIDTH - 10, 68);
    ctx.fillText(`P2 Lives: ${p2.lives}`, GAME_WIDTH - 10, 88);
  }

  // Wave number (top-center)
  ctx.font = '14px monospace';
  ctx.fillStyle = '#aaaaaa';
  ctx.textAlign = 'center';
  ctx.fillText(`Level ${state.currentLevel} - Wave ${state.currentWave}`, GAME_WIDTH / 2, 24);

  // FPS counters (top-left, green)
  ctx.font = '12px monospace';
  ctx.fillStyle = '#88ff88';
  ctx.textAlign = 'left';
  ctx.fillText(`Engine: ${engineFps} | Render: ${renderFps}`, 10, 20);

  // Primary weapon display (bottom-left)
  if (p1) {
    ctx.font = '10px monospace';
    ctx.fillStyle = '#aaaaaa';
    ctx.textAlign = 'left';
    const primaryColor = p1.primaryWeapon === 'laser' ? '#4488ff' : '#ff4444';
    const levelDots = '\u2588'.repeat(p1.primaryLevel) + '\u2591'.repeat(4 - p1.primaryLevel);
    ctx.fillStyle = primaryColor;
    ctx.fillText(`${p1.primaryWeapon.toUpperCase()} ${levelDots}`, 10, 780);
  }

  // Secondary weapon timer (bottom-center bar)
  if (p1?.secondaryWeapon) {
    const barWidth = 100;
    const barHeight = 6;
    const barX = GAME_WIDTH / 2 - barWidth / 2;
    const barY = 780;
    const fill = Math.max(0, p1.secondaryTimer / SECONDARY_WEAPON_DURATION);
    const weaponColors: Record<string, string> = {
      rocket: '#aa44ff',
      missile: '#44ff44',
    };
    const color = weaponColors[p1.secondaryWeapon] ?? '#ffffff';

    // Background
    ctx.fillStyle = '#333333';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Fill
    ctx.fillStyle = color;
    ctx.fillRect(barX, barY, barWidth * fill, barHeight);

    // Label
    ctx.font = '10px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(p1.secondaryWeapon.toUpperCase(), GAME_WIDTH / 2, barY - 4);
  }

  // Shield/health bar (bottom-right)
  if (p1) {
    const barWidth = 80;
    const barHeight = 6;
    const barX = GAME_WIDTH - barWidth - 10;
    const barY = 780;
    const healthPct = Math.max(0, p1.health / p1.maxHealth);

    // Health bar color: green → yellow → red
    let barColor: string;
    if (healthPct > 0.6) barColor = '#44ff44';
    else if (healthPct > 0.3) barColor = '#ffff44';
    else barColor = '#ff4444';

    // Background
    ctx.fillStyle = '#333333';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Fill
    ctx.fillStyle = barColor;
    ctx.fillRect(barX, barY, barWidth * healthPct, barHeight);

    // Label
    ctx.font = '10px monospace';
    ctx.fillStyle = '#aaaaaa';
    ctx.textAlign = 'right';
    ctx.fillText('SHIELD', GAME_WIDTH - 10, barY - 4);
  }

  ctx.restore();
}
