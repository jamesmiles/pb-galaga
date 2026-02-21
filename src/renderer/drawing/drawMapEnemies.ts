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
  // Sort by elevation so low-ground enemies render first; aerial enemies last
  const sorted = [...enemies].filter(e => e.isAlive).sort((a, b) => {
    const aElev = a.isAerial ? 10 : a.elevation;
    const bElev = b.isAerial ? 10 : b.elevation;
    return aElev - bElev;
  });

  for (const enemy of sorted) {
    const margin = enemy.isAerial ? 400 : 100;
    if (!isInViewport(enemy.position.y, camera, margin)) continue;

    const screenPos = worldToScreen(enemy.position, camera);
    const elevationScale = enemy.isAerial ? 1.0 : 1.0 + CLIFF_ELEVATION_SCALE * enemy.elevation;

    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);
    if (elevationScale !== 1.0) ctx.scale(elevationScale, elevationScale);

    switch (enemy.type) {
      case 'gun-nest': drawGunNest(ctx, enemy); break;
      case 'turret': drawTurret(ctx, enemy); break;
      case 'popup-mine': drawPopupMine(ctx, enemy); break;
      case 'rocket-copter': drawRocketCopter(ctx, enemy); break;
      case 'laser-copter': drawLaserCopter(ctx, enemy); break;
      case 'spread-bomber': drawSpreadBomber(ctx, enemy); break;
      case 'homing-bomber': drawHomingBomber(ctx, enemy); break;
      case 'hover-tank': drawHoverTank(ctx, enemy); break;
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

// --- Rocket Copter ---

function drawRocketCopter(ctx: CanvasRenderingContext2D, enemy: MapEnemy): void {
  const engaged = enemy.behaviorState === 'engage';

  // Shadow on ground
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(3, 5, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Body (dark green military)
  ctx.shadowBlur = engaged ? 8 : 4;
  ctx.shadowColor = '#ff6600';
  ctx.fillStyle = '#2a4a2a';
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cockpit (orange glow)
  ctx.shadowBlur = engaged ? 6 : 2;
  ctx.shadowColor = '#ff8800';
  ctx.fillStyle = '#cc6600';
  ctx.beginPath();
  ctx.ellipse(-6, 0, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail boom
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#1e3a1e';
  ctx.fillRect(10, -2, 12, 4);

  // Tail rotor
  ctx.fillStyle = '#555555';
  ctx.fillRect(20, -5, 2, 10);

  // Rocket pods (left and right)
  ctx.fillStyle = '#444444';
  ctx.fillRect(-4, -11, 8, 3);
  ctx.fillRect(-4, 8, 8, 3);

  // Spinning main rotor (animated)
  const rotorAngle = (Date.now() / 60) % (Math.PI * 2);
  ctx.save();
  ctx.rotate(rotorAngle);
  ctx.strokeStyle = '#88888888';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-20, 0);
  ctx.lineTo(20, 0);
  ctx.stroke();
  ctx.restore();
}

// --- Laser Copter ---

function drawLaserCopter(ctx: CanvasRenderingContext2D, enemy: MapEnemy): void {
  const engaged = enemy.behaviorState === 'engage';

  // Shadow on ground
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(3, 5, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Body (gray/silver)
  ctx.shadowBlur = engaged ? 8 : 4;
  ctx.shadowColor = '#00ccff';
  ctx.fillStyle = '#555566';
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cockpit (cyan glow)
  ctx.shadowBlur = engaged ? 6 : 2;
  ctx.shadowColor = '#00eeff';
  ctx.fillStyle = '#00aacc';
  ctx.beginPath();
  ctx.ellipse(-5, 0, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail boom
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#444455';
  ctx.fillRect(8, -1.5, 10, 3);

  // Tail rotor
  ctx.fillStyle = '#666666';
  ctx.fillRect(17, -4, 2, 8);

  // Chin-mounted laser turret (follows aim)
  ctx.save();
  ctx.translate(0, 6);
  ctx.rotate(enemy.aimAngle);
  ctx.fillStyle = '#00cccc';
  ctx.fillRect(0, -1.5, 10, 3);
  ctx.fillStyle = engaged ? '#00ffff' : '#008888';
  ctx.beginPath();
  ctx.arc(10, 0, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Spinning main rotor (faster than rocket copter)
  const rotorAngle = (Date.now() / 40) % (Math.PI * 2);
  ctx.save();
  ctx.rotate(rotorAngle);
  ctx.strokeStyle = '#88888888';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-18, 0);
  ctx.lineTo(18, 0);
  ctx.stroke();
  ctx.restore();
}

// --- Spread Bomber ---

function drawSpreadBomber(ctx: CanvasRenderingContext2D, enemy: MapEnemy): void {
  // Shadow
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(4, 8, 16, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Stealth body (angular, dark)
  ctx.shadowBlur = 6;
  ctx.shadowColor = '#ff2200';
  ctx.fillStyle = '#2a2a2a';
  ctx.beginPath();
  // Angular stealth shape
  ctx.moveTo(0, -20);   // Nose
  ctx.lineTo(22, 8);    // Right wing tip
  ctx.lineTo(14, 12);   // Right wing inner
  ctx.lineTo(4, 16);    // Right tail
  ctx.lineTo(-4, 16);   // Left tail
  ctx.lineTo(-14, 12);  // Left wing inner
  ctx.lineTo(-22, 8);   // Left wing tip
  ctx.closePath();
  ctx.fill();

  // Wing edge highlights
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#444444';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Engine glow (red, at rear)
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#ff3300';
  ctx.fillStyle = '#ff4400';
  ctx.beginPath();
  ctx.ellipse(-2, 14, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(2, 14, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Bomb bay indicator (pulsing)
  const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 200);
  ctx.shadowBlur = 4 * pulse;
  ctx.shadowColor = '#ff0000';
  ctx.fillStyle = `rgba(255, 0, 0, ${0.3 + 0.3 * pulse})`;
  ctx.beginPath();
  ctx.ellipse(0, 4, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

// --- Homing Bomber ---

function drawHomingBomber(ctx: CanvasRenderingContext2D, enemy: MapEnemy): void {
  // Shadow
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(4, 8, 18, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Darker stealth body (swept wings)
  ctx.shadowBlur = 6;
  ctx.shadowColor = '#8800ff';
  ctx.fillStyle = '#1a1a2a';
  ctx.beginPath();
  ctx.moveTo(0, -24);   // Nose
  ctx.lineTo(26, 6);    // Right wing tip
  ctx.lineTo(16, 10);   // Right wing inner
  ctx.lineTo(6, 18);    // Right tail
  ctx.lineTo(-6, 18);   // Left tail
  ctx.lineTo(-16, 10);  // Left wing inner
  ctx.lineTo(-26, 6);   // Left wing tip
  ctx.closePath();
  ctx.fill();

  // Wing edge
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#333344';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Engine glow (purple)
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#aa00ff';
  ctx.fillStyle = '#9900ff';
  ctx.beginPath();
  ctx.ellipse(-3, 16, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(3, 16, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Missile hardpoints (visible under wings)
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#555555';
  ctx.fillRect(-16, 4, 6, 2);
  ctx.fillRect(10, 4, 6, 2);

  // Missile tips
  ctx.fillStyle = '#cc00cc';
  ctx.beginPath();
  ctx.arc(-13, 5, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(13, 5, 1.5, 0, Math.PI * 2);
  ctx.fill();
}

// --- Hover Tank ---

function drawHoverTank(ctx: CanvasRenderingContext2D, enemy: MapEnemy): void {
  // Hover glow underneath (pulsing blue)
  const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 150);
  ctx.shadowBlur = 10 * pulse;
  ctx.shadowColor = '#0066ff';
  ctx.fillStyle = `rgba(0, 100, 255, ${0.15 + 0.1 * pulse})`;
  ctx.beginPath();
  ctx.ellipse(0, 4, 20, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Armored body (olive/brown rectangle)
  ctx.shadowBlur = 4;
  ctx.shadowColor = '#886622';
  ctx.fillStyle = '#5a5030';
  ctx.fillRect(-16, -12, 32, 24);

  // Armor plating detail
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#6a6040';
  ctx.lineWidth = 1;
  ctx.strokeRect(-16, -12, 32, 24);
  ctx.strokeRect(-14, -10, 28, 20);

  // Front face
  ctx.fillStyle = '#4a4020';
  ctx.fillRect(-14, -12, 28, 4);

  // Turret dome
  ctx.shadowBlur = 3;
  ctx.shadowColor = '#886622';
  ctx.fillStyle = '#6a5a40';
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();

  // Rotating barrel
  ctx.save();
  ctx.rotate(enemy.aimAngle);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#777766';
  ctx.fillRect(6, -2.5, 16, 5);
  ctx.fillStyle = '#555544';
  ctx.fillRect(6, -3, 16, 1.5);
  // Muzzle
  ctx.fillStyle = '#999988';
  ctx.fillRect(20, -3.5, 3, 7);
  ctx.restore();

  // Hover skirt edges (side panels)
  ctx.fillStyle = '#3a3a4a';
  ctx.fillRect(-18, -8, 3, 16);
  ctx.fillRect(15, -8, 3, 16);
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
