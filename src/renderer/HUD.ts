import type { GameState, Player } from '../types';
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

  // Bottom HUD: weapon & shield status bars
  const coop = state.gameMode === 'co-op' && p2;
  if (p1) {
    if (coop) {
      // Co-op: P1 left half, P2 right half
      drawPlayerStatusBar(ctx, p1, 'left');
      drawPlayerStatusBar(ctx, p2!, 'right');
    } else {
      // Single player: spread across full width
      drawPlayerStatusBar(ctx, p1, 'full');
    }
  }

  ctx.restore();
}

/** Draw primary weapon, secondary timer bar, and shield bar for one player. */
function drawPlayerStatusBar(
  ctx: CanvasRenderingContext2D,
  player: Player,
  side: 'left' | 'right' | 'full',
): void {
  const barY = 780;
  const barHeight = 6;
  const isP2 = player.id === 'player2';
  const tintColor = isP2 ? '#4488ff' : '#ffffff';

  // Layout depends on side
  let primaryX: number;
  let primaryAlign: CanvasTextAlign;
  let secondaryBarX: number;
  let secondaryLabelX: number;
  let shieldBarX: number;
  let shieldLabelX: number;
  let shieldLabelAlign: CanvasTextAlign;
  const secondaryBarWidth = 100;
  const shieldBarWidth = 80;

  if (side === 'left') {
    // P1: primary far-left, secondary left-center, shield center-left
    primaryX = 10;
    primaryAlign = 'left';
    secondaryBarX = 150;
    secondaryLabelX = 200;
    shieldBarX = 290;
    shieldLabelX = 370;
    shieldLabelAlign = 'right';
  } else if (side === 'right') {
    // P2: shield center-right, secondary right-center, primary far-right
    primaryX = GAME_WIDTH - 10;
    primaryAlign = 'right';
    secondaryBarX = GAME_WIDTH - 250;
    secondaryLabelX = GAME_WIDTH - 200;
    shieldBarX = GAME_WIDTH - 370;
    shieldLabelX = GAME_WIDTH - 290;
    shieldLabelAlign = 'left';
  } else {
    // Full width (single player): same as original layout
    primaryX = 10;
    primaryAlign = 'left';
    secondaryBarX = GAME_WIDTH / 2 - secondaryBarWidth / 2;
    secondaryLabelX = GAME_WIDTH / 2;
    shieldBarX = GAME_WIDTH - shieldBarWidth - 10;
    shieldLabelX = GAME_WIDTH - 10;
    shieldLabelAlign = 'right';
  }

  // Primary weapon
  ctx.font = '10px monospace';
  ctx.textAlign = primaryAlign;
  const primaryColor = player.primaryWeapon === 'laser' ? '#4488ff' : '#ff4444';
  const levelDots = '\u2588'.repeat(player.primaryLevel) + '\u2591'.repeat(4 - player.primaryLevel);
  ctx.fillStyle = primaryColor;
  ctx.fillText(`${player.primaryWeapon.toUpperCase()} ${levelDots}`, primaryX, barY);

  // Secondary weapon timer bar
  if (player.secondaryWeapon) {
    const fill = Math.max(0, player.secondaryTimer / SECONDARY_WEAPON_DURATION);
    const weaponColors: Record<string, string> = {
      rocket: '#aa44ff',
      missile: '#44ff44',
    };
    const color = weaponColors[player.secondaryWeapon] ?? '#ffffff';

    ctx.fillStyle = '#333333';
    ctx.fillRect(secondaryBarX, barY, secondaryBarWidth, barHeight);
    ctx.fillStyle = color;
    ctx.fillRect(secondaryBarX, barY, secondaryBarWidth * fill, barHeight);

    ctx.font = '10px monospace';
    ctx.fillStyle = tintColor;
    ctx.textAlign = 'center';
    ctx.fillText(player.secondaryWeapon.toUpperCase(), secondaryLabelX, barY - 4);
  }

  // Shield/health bar
  const healthPct = Math.max(0, player.health / player.maxHealth);
  let barColor: string;
  if (healthPct > 0.6) barColor = '#44ff44';
  else if (healthPct > 0.3) barColor = '#ffff44';
  else barColor = '#ff4444';

  ctx.fillStyle = '#333333';
  ctx.fillRect(shieldBarX, barY, shieldBarWidth, barHeight);
  ctx.fillStyle = barColor;
  ctx.fillRect(shieldBarX, barY, shieldBarWidth * healthPct, barHeight);

  ctx.font = '10px monospace';
  ctx.fillStyle = isP2 ? '#4488ff' : '#aaaaaa';
  ctx.textAlign = shieldLabelAlign;
  ctx.fillText('SHIELD', shieldLabelX, barY - 4);
}
