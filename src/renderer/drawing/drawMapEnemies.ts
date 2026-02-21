import type { MapEnemy, CameraState } from '../../types';
import { worldToScreen, isInViewport } from '../../engine/CameraManager';
import { CLIFF_ELEVATION_SCALE } from '../../engine/constants';

/**
 * Draw all alive map enemies visible in the viewport.
 */
export function drawMapEnemies(
  ctx: CanvasRenderingContext2D,
  enemies: MapEnemy[],
  camera: CameraState,
): void {
  // Sort by elevation so low-ground enemies render first
  const sorted = [...enemies].filter(e => e.isAlive).sort((a, b) => a.elevation - b.elevation);

  for (const enemy of sorted) {
    if (!isInViewport(enemy.position.y, camera, 100)) continue;

    const screenPos = worldToScreen(enemy.position, camera);
    const elevationScale = 1.0 + CLIFF_ELEVATION_SCALE * enemy.elevation;

    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);
    if (elevationScale !== 1.0) ctx.scale(elevationScale, elevationScale);

    switch (enemy.type) {
      case 'gun-nest': drawGunNest(ctx, enemy); break;
      case 'turret': drawTurret(ctx, enemy); break;
      case 'popup-mine': drawPopupMine(ctx, enemy); break;
    }

    // Health bar when damaged (not for mines)
    if (enemy.type !== 'popup-mine' && enemy.health < enemy.maxHealth) {
      drawHealthBar(ctx, enemy);
    }

    ctx.restore();
  }
}

// --- Gun Nest ---

function drawGunNest(ctx: CanvasRenderingContext2D, enemy: MapEnemy): void {
  // Sandbag ring base
  ctx.shadowBlur = 6;
  ctx.shadowColor = '#ff6600';
  ctx.fillStyle = '#5a4030';
  ctx.beginPath();
  ctx.arc(0, 0, 15, 0, Math.PI * 2);
  ctx.fill();

  // Inner dark pit
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#2a1a10';
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.fill();

  // Sandbag texture bumps
  ctx.fillStyle = '#6b5040';
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const bx = Math.cos(angle) * 12;
    const by = Math.sin(angle) * 12;
    ctx.beginPath();
    ctx.arc(bx, by, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Rotating barrel
  ctx.save();
  ctx.rotate(enemy.aimAngle);

  // Barrel
  ctx.fillStyle = '#888888';
  ctx.fillRect(6, -2, 14, 4);
  ctx.fillStyle = '#666666';
  ctx.fillRect(6, -2.5, 14, 1);

  // Muzzle flash hint
  ctx.fillStyle = '#aaaaaa';
  ctx.fillRect(18, -3, 2, 6);

  ctx.restore();
}

// --- Turret ---

function drawTurret(ctx: CanvasRenderingContext2D, enemy: MapEnemy): void {
  // Armored square base
  ctx.shadowBlur = 6;
  ctx.shadowColor = '#0088ff';
  ctx.fillStyle = '#444444';
  ctx.fillRect(-18, -18, 36, 36);

  // Base border
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#555555';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-18, -18, 36, 36);

  // Corner rivets
  ctx.fillStyle = '#666666';
  for (const [rx, ry] of [[-14, -14], [14, -14], [-14, 14], [14, 14]]) {
    ctx.beginPath();
    ctx.arc(rx, ry, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dome turret
  ctx.shadowBlur = 4;
  ctx.shadowColor = '#0088ff';
  ctx.fillStyle = '#3366aa';
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();

  // Dome highlight
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#4488cc';
  ctx.beginPath();
  ctx.arc(-2, -2, 5, 0, Math.PI * 2);
  ctx.fill();

  // Rotating barrel
  ctx.save();
  ctx.rotate(enemy.aimAngle);

  // Heavy barrel
  ctx.fillStyle = '#777777';
  ctx.fillRect(8, -3, 18, 6);
  ctx.fillStyle = '#555555';
  ctx.fillRect(8, -3.5, 18, 1.5);

  // Muzzle
  ctx.fillStyle = '#999999';
  ctx.fillRect(24, -4, 3, 8);

  ctx.restore();
}

// --- Popup Mine ---

function drawPopupMine(ctx: CanvasRenderingContext2D, enemy: MapEnemy): void {
  if (!enemy.isActivated) {
    // Dormant: faint red circle flush with ground
    ctx.globalAlpha = 0.3;
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#ff0000';
    ctx.fillStyle = '#661111';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    return;
  }

  // Scale based on popup progress
  const scale = 0.3 + 0.7 * enemy.popupProgress;
  ctx.scale(scale, scale);

  // Pulsing glow (stronger during burst cooldown)
  const pulseAlpha = enemy.burstFired ? 0.3 : 0.6;
  ctx.shadowBlur = 8;
  ctx.shadowColor = `rgba(255, 0, 0, ${pulseAlpha})`;

  // Spiky octagonal mine body
  ctx.fillStyle = '#882222';
  ctx.beginPath();
  const spikes = 8;
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i / (spikes * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? 14 : 8;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Center danger indicator
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ff3333';
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();

  // Inner ring
  ctx.strokeStyle = '#cc1111';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.stroke();
}

// --- Health Bar ---

function drawHealthBar(ctx: CanvasRenderingContext2D, enemy: MapEnemy): void {
  const barWidth = 24;
  const barHeight = 3;
  const x = -barWidth / 2;
  const y = -enemy.collisionRadius - 8;
  const healthPct = enemy.health / enemy.maxHealth;

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(x, y, barWidth, barHeight);

  // Health fill
  ctx.fillStyle = healthPct > 0.5 ? '#44ff44' : healthPct > 0.25 ? '#ffaa00' : '#ff3333';
  ctx.fillRect(x, y, barWidth * healthPct, barHeight);
}
