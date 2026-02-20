import type { BossState } from '../../types';

/**
 * Draw the Tank Boss — "Mars Siege Tank".
 * Tank hull with tread segments, central dome turret.
 */
export function drawTankBossLower(ctx: CanvasRenderingContext2D, boss: BossState): void {
  const cx = boss.position.x;
  const cy = boss.position.y;
  const hw = boss.width / 2;
  const hh = boss.height / 2;

  ctx.save();

  // Main hull body
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#ff4422';
  ctx.fillStyle = '#553322';
  ctx.fillRect(cx - hw * 0.7, cy - hh * 0.6, hw * 1.4, hh * 1.2);

  // Armored front plate
  ctx.fillStyle = '#664433';
  ctx.fillRect(cx - hw * 0.5, cy + hh * 0.3, hw * 1.0, hh * 0.35);

  // Track housings (left and right)
  ctx.fillStyle = '#332211';
  ctx.fillRect(cx - hw * 0.9, cy - hh * 0.5, hw * 0.25, hh * 1.0);
  ctx.fillRect(cx + hw * 0.65, cy - hh * 0.5, hw * 0.25, hh * 1.0);

  // Track detail lines
  ctx.fillStyle = '#444433';
  for (let i = 0; i < 5; i++) {
    const ty = cy - hh * 0.4 + i * hh * 0.2;
    ctx.fillRect(cx - hw * 0.88, ty, hw * 0.21, 2);
    ctx.fillRect(cx + hw * 0.67, ty, hw * 0.21, 2);
  }

  ctx.shadowBlur = 0;
  ctx.restore();
}

export function drawTankBossUpper(ctx: CanvasRenderingContext2D, boss: BossState): void {
  const cx = boss.position.x;
  const cy = boss.position.y;

  ctx.save();

  // Draw tread turret health bars + turret shapes
  const treadTurrets = boss.turrets.slice(0, 4);
  for (const turret of treadTurrets) {
    if (!turret.isAlive) continue;

    ctx.shadowBlur = 6;
    ctx.shadowColor = '#ff8844';

    // Tread turret body
    ctx.fillStyle = '#886644';
    ctx.fillRect(turret.position.x - 12, turret.position.y - 8, 24, 16);

    // Turret barrel
    ctx.fillStyle = '#aa8866';
    ctx.fillRect(turret.position.x - 2, turret.position.y + 8, 4, 12);

    // Health bar
    ctx.shadowBlur = 0;
    const barW = 24;
    const healthPct = turret.health / turret.maxHealth;
    ctx.fillStyle = '#333333';
    ctx.fillRect(turret.position.x - barW / 2, turret.position.y - 14, barW, 3);
    ctx.fillStyle = healthPct > 0.5 ? '#44ff44' : healthPct > 0.25 ? '#ffff00' : '#ff4444';
    ctx.fillRect(turret.position.x - barW / 2, turret.position.y - 14, barW * healthPct, 3);
  }

  // Central dome (bridge target)
  const allTreadsDead = treadTurrets.every(t => !t.isAlive);
  const dome = boss.turrets.find(t => t.id === 'tank-dome');

  ctx.shadowBlur = 10;
  ctx.shadowColor = allTreadsDead ? '#ff2222' : '#884422';

  // Dome base
  ctx.fillStyle = allTreadsDead ? '#882222' : '#664422';
  ctx.beginPath();
  ctx.arc(cx, cy, 30, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(cx - 30, cy, 60, 10);

  // Dome cannon (points downward toward player)
  if (allTreadsDead && dome?.isAlive) {
    ctx.fillStyle = '#aa3333';
    ctx.fillRect(cx - 3, cy + 10, 6, 20);
    // Cannon glow
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ff4444';
    ctx.fillStyle = '#ff6644';
    ctx.fillRect(cx - 2, cy + 28, 4, 4);
  }

  // Dome eye/viewport
  ctx.shadowBlur = 0;
  ctx.fillStyle = allTreadsDead ? '#ff4444' : '#ffaa22';
  ctx.fillRect(cx - 8, cy - 8, 16, 4);

  // Bridge health bar (shown when dome is targetable)
  if (allTreadsDead && boss.health > 0) {
    const barW = 60;
    const healthPct = boss.health / boss.maxHealth;
    ctx.fillStyle = '#333333';
    ctx.fillRect(cx - barW / 2, cy - 42, barW, 4);
    ctx.fillStyle = healthPct > 0.5 ? '#44ff44' : healthPct > 0.25 ? '#ffff00' : '#ff4444';
    ctx.fillRect(cx - barW / 2, cy - 42, barW * healthPct, 4);
  }

  ctx.restore();
}
