import type { BossState } from '../../types';

/**
 * Draw the boss lower hull — muted, behind the player.
 * This is the wide flat base the player flies OVER.
 */
export function drawBossLower(ctx: CanvasRenderingContext2D, boss: BossState): void {
  if (!boss.isAlive && !boss.deathSequence) return;

  const { x, y } = boss.position;
  const halfW = boss.width / 2;
  const halfH = boss.height / 2;

  ctx.save();
  ctx.globalAlpha = 0.5;

  // Dark muted hull — no glow
  ctx.fillStyle = '#1a2233';
  ctx.beginPath();
  ctx.moveTo(x - halfW, y - halfH * 0.3);
  ctx.lineTo(x - halfW * 0.7, y - halfH);
  ctx.lineTo(x + halfW * 0.7, y - halfH);
  ctx.lineTo(x + halfW, y - halfH * 0.3);
  ctx.lineTo(x + halfW * 0.9, y + halfH);
  ctx.lineTo(x - halfW * 0.9, y + halfH);
  ctx.closePath();
  ctx.fill();

  // Hull panel lines
  ctx.strokeStyle = '#2a3344';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - halfW * 0.5, y - halfH * 0.5);
  ctx.lineTo(x - halfW * 0.5, y + halfH * 0.8);
  ctx.moveTo(x + halfW * 0.5, y - halfH * 0.5);
  ctx.lineTo(x + halfW * 0.5, y + halfH * 0.8);
  ctx.moveTo(x - halfW * 0.8, y);
  ctx.lineTo(x + halfW * 0.8, y);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw the boss upper layer — turrets and bridge, in front of the player.
 * Bright with glow effects for 3D depth illusion.
 */
export function drawBossUpper(ctx: CanvasRenderingContext2D, boss: BossState): void {
  if (!boss.isAlive && !boss.deathSequence) return;

  const { x, y } = boss.position;

  // Draw turrets
  for (const turret of boss.turrets) {
    ctx.save();

    if (turret.isAlive) {
      // Active turret — bright with glow
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#ff8800';

      // Turret base
      ctx.fillStyle = '#885500';
      ctx.fillRect(turret.position.x - 14, turret.position.y - 10, 28, 20);

      // Turret barrel
      ctx.fillStyle = '#aa6600';
      ctx.fillRect(turret.position.x - 4, turret.position.y + 8, 8, 14);

      // Turret cap
      ctx.fillStyle = '#ffaa44';
      ctx.beginPath();
      ctx.arc(turret.position.x, turret.position.y, 10, 0, Math.PI * 2);
      ctx.fill();

      // Health indicator
      ctx.shadowBlur = 0;
      const healthPct = turret.health / turret.maxHealth;
      const indicatorW = 20;
      ctx.fillStyle = '#333333';
      ctx.fillRect(turret.position.x - indicatorW / 2, turret.position.y - 16, indicatorW, 3);
      ctx.fillStyle = healthPct > 0.5 ? '#44ff44' : '#ff4444';
      ctx.fillRect(turret.position.x - indicatorW / 2, turret.position.y - 16, indicatorW * healthPct, 3);
    } else {
      // Destroyed turret — burned husk
      ctx.fillStyle = '#332211';
      ctx.fillRect(turret.position.x - 12, turret.position.y - 8, 24, 16);
      ctx.fillStyle = '#221100';
      ctx.beginPath();
      ctx.arc(turret.position.x, turret.position.y, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw bridge (central command)
  const allTurretsDead = boss.turrets.every(t => !t.isAlive);

  ctx.save();
  if (allTurretsDead && boss.health > 0) {
    // Exposed bridge — pulsing red, vulnerable
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff0000';
    ctx.fillStyle = '#882222';
  } else {
    // Protected bridge — dim
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#4466aa';
    ctx.fillStyle = '#334466';
  }

  // Bridge structure
  const bridgeW = boss.width * 0.2;
  const bridgeH = boss.height * 0.25;
  ctx.fillRect(x - bridgeW / 2, y + boss.height * 0.15, bridgeW, bridgeH);

  // Command window
  ctx.shadowBlur = 0;
  const windowColor = allTurretsDead ? '#ff4444' : '#4488ff';
  ctx.fillStyle = windowColor;
  ctx.fillRect(x - bridgeW * 0.3, y + boss.height * 0.2, bridgeW * 0.6, bridgeH * 0.4);

  // Bridge health bar (only when exposed)
  if (allTurretsDead && boss.health > 0) {
    const barW = bridgeW;
    const healthPct = boss.health / boss.maxHealth;
    ctx.fillStyle = '#333333';
    ctx.fillRect(x - barW / 2, y + boss.height * 0.1, barW, 4);
    ctx.fillStyle = healthPct > 0.3 ? '#ff4444' : '#ff0000';
    ctx.fillRect(x - barW / 2, y + boss.height * 0.1, barW * healthPct, 4);
  }

  ctx.restore();
}

/**
 * Draw life pickups as heart icons.
 */
export function drawLifePickups(ctx: CanvasRenderingContext2D, pickups: { position: { x: number; y: number }; isActive: boolean }[], time: number): void {
  for (const pickup of pickups) {
    if (!pickup.isActive) continue;

    const { x, y } = pickup.position;
    const pulse = 0.8 + 0.2 * Math.sin(time * 0.005);
    const scale = 8 * pulse;

    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff4466';
    ctx.fillStyle = '#ff2244';

    // Heart shape using arcs + triangle
    ctx.beginPath();
    ctx.moveTo(x, y + scale * 0.4);
    ctx.bezierCurveTo(x - scale, y - scale * 0.3, x - scale * 0.5, y - scale, x, y - scale * 0.4);
    ctx.bezierCurveTo(x + scale * 0.5, y - scale, x + scale, y - scale * 0.3, x, y + scale * 0.4);
    ctx.fill();

    ctx.restore();
  }
}
