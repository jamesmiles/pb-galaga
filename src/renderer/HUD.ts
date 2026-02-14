import type { GameState } from '../types';
import { GAME_WIDTH } from '../engine/constants';

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
  ctx.fillText(`Wave ${state.currentWave}`, GAME_WIDTH / 2, 24);

  // FPS counters (top-left, green)
  ctx.font = '12px monospace';
  ctx.fillStyle = '#88ff88';
  ctx.textAlign = 'left';
  ctx.fillText(`Engine: ${engineFps} | Render: ${renderFps}`, 10, 20);

  ctx.restore();
}
