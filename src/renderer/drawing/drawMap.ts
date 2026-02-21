import type { MapConfig, CameraState } from '../../types';
import { GAME_WIDTH, GAME_HEIGHT } from '../../engine/constants';
import { isInViewport } from '../../engine/CameraManager';
import cloud1Url from '../../overlays/cloud-1.png';
import cloud2Url from '../../overlays/cloud-2.png';
import cloud4Url from '../../overlays/cloud-4.png';

// Eagerly preload cloud images at module load time (guarded for test env)
const cloudImageMap: Record<string, HTMLImageElement> = {};
if (typeof Image !== 'undefined') {
  for (const [name, url] of Object.entries({ 'cloud-1': cloud1Url, 'cloud-2': cloud2Url, 'cloud-4': cloud4Url })) {
    const img = new Image();
    img.src = url;
    cloudImageMap[name] = img;
  }
}

/** Simple hash for deterministic values from world coordinates. */
function tileHash(wx: number, wy: number): number {
  let h = (wx * 374761 + wy * 668265) | 0;
  h = ((h >> 16) ^ h) * 0x45d9f3b | 0;
  h = ((h >> 16) ^ h) * 0x45d9f3b | 0;
  return ((h >> 16) ^ h) >>> 0;
}

/**
 * Draw the Mars surface with soft blended patches over a warm base.
 * Uses radial gradients and low-alpha overlays for a natural sandy feel.
 */
export function drawMapSurface(
  ctx: CanvasRenderingContext2D,
  _map: MapConfig,
  camera: CameraState,
): void {
  // Warm sandy base
  ctx.fillStyle = '#5c3d2e';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Layer soft colour patches at different scales for natural blending
  const patchConfigs = [
    { spacing: 120, radius: 90, alpha: 0.15, colors: ['#6b4a38', '#785540', '#4a3228'] },
    { spacing: 80,  radius: 60, alpha: 0.12, colors: ['#634230', '#5a3a2a', '#6f4d3a'] },
    { spacing: 200, radius: 140, alpha: 0.1,  colors: ['#785540', '#5c3d2e', '#4e3525'] },
  ];

  for (const cfg of patchConfigs) {
    const startWorldY = Math.floor(camera.worldY / cfg.spacing) * cfg.spacing - cfg.radius;
    const endWorldY = camera.worldY + GAME_HEIGHT + cfg.radius;
    const startWorldX = Math.floor(camera.worldX / cfg.spacing) * cfg.spacing - cfg.radius;
    const endWorldX = camera.worldX + GAME_WIDTH + cfg.radius;

    for (let wy = startWorldY; wy < endWorldY; wy += cfg.spacing) {
      for (let wx = startWorldX; wx < endWorldX; wx += cfg.spacing) {
        const hash = tileHash(wx, wy);
        // Offset position so patches don't align to a grid
        const ox = ((hash >> 4) % 60) - 30;
        const oy = ((hash >> 10) % 60) - 30;
        const cx = (wx + ox) - camera.worldX;
        const cy = (wy + oy) - camera.worldY;
        const r = cfg.radius * (0.7 + ((hash >> 16) % 30) / 100);

        const color = cfg.colors[hash % cfg.colors.length];

        ctx.save();
        ctx.globalAlpha = cfg.alpha;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
        ctx.restore();
      }
    }
  }

  // Sparse small pebble marks for fine detail
  const detailSpacing = 64;
  const startDetailY = Math.floor(camera.worldY / detailSpacing) * detailSpacing;
  const endDetailY = camera.worldY + GAME_HEIGHT + detailSpacing;
  const startDetailX = Math.floor(camera.worldX / detailSpacing) * detailSpacing;
  const endDetailX = camera.worldX + GAME_WIDTH + detailSpacing;

  for (let wy = startDetailY; wy < endDetailY; wy += detailSpacing) {
    for (let wx = startDetailX; wx < endDetailX; wx += detailSpacing) {
      const hash = tileHash(wx + 7, wy + 13);
      if ((hash % 4) !== 0) continue; // ~25% density

      const screenX = wx - camera.worldX;
      const screenY = wy - camera.worldY;
      const ox = (hash >> 4) % detailSpacing;
      const oy = (hash >> 10) % detailSpacing;
      const r = 1.5 + (hash >> 16) % 3;

      ctx.fillStyle = (hash % 2 === 0) ? '#4a3225' : '#6b5040';
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(screenX + ox, screenY + oy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
}

/**
 * Draw map objects (boulders, destructible rocks, decorations).
 * Only draws objects within the visible viewport.
 */
export function drawMapObjects(
  ctx: CanvasRenderingContext2D,
  map: MapConfig,
  camera: CameraState,
): void {
  for (const obj of map.objects) {
    if (!isInViewport(obj.position.y, camera, 100)) continue;

    // Skip destroyed destructible rocks
    if (obj.type === 'destructible-rock' && obj.health !== undefined && obj.health <= 0) continue;

    const screenX = obj.position.x - camera.worldX;
    const screenY = obj.position.y - camera.worldY;

    ctx.save();
    ctx.translate(screenX, screenY);

    if (obj.type === 'boulder') {
      drawBoulder(ctx, obj.width, obj.height);
    } else if (obj.type === 'destructible-rock') {
      drawDestructibleRock(ctx, obj.width, obj.height, obj.health, obj.maxHealth);
    } else if (obj.type === 'decoration') {
      drawDecoration(ctx, obj.width, obj.height);
    }

    ctx.restore();
  }
}

function drawBoulder(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const r = Math.min(w, h) / 2;
  const sides = 8 + Math.floor(w % 3); // 8-10 sides for variation
  const seed = (w * 7 + h * 13) | 0; // deterministic variation per boulder

  // Dark imposing fill
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#1a0e06';
  ctx.fillStyle = '#3a2818';
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2;
    const wobble = 0.78 + 0.22 * Math.sin(i * 2.9 + seed * 0.1);
    const px = Math.cos(angle) * r * wobble;
    const py = Math.sin(angle) * r * wobble;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Darker edge detail
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#2a1a10';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Surface crater marks (2-3 based on size)
  ctx.fillStyle = '#2a1a10';
  ctx.beginPath();
  ctx.arc(r * 0.2, -r * 0.2, r * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-r * 0.25, r * 0.1, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  if (r > 25) {
    ctx.beginPath();
    ctx.arc(r * 0.05, r * 0.3, r * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle highlight on top edge
  ctx.strokeStyle = '#4a3828';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.7, -Math.PI * 0.8, -Math.PI * 0.2);
  ctx.stroke();
}

function drawDestructibleRock(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  health?: number, maxHealth?: number,
): void {
  const r = Math.min(w, h) / 2;
  const sides = 5 + Math.floor(w % 2); // 5-6 sides
  const seed = (w * 11 + h * 7) | 0;

  // Medium brown/tan — shifts darker as health drops
  const healthPct = (health !== undefined && maxHealth) ? health / maxHealth : 1;
  const base = Math.floor(120 + 40 * healthPct);
  ctx.fillStyle = `rgb(${base}, ${Math.floor(base * 0.72)}, ${Math.floor(base * 0.5)})`;

  // Orange glow signals "interactive/destructible"
  ctx.shadowBlur = 5;
  ctx.shadowColor = `rgba(255, 102, 0, ${0.4 + 0.3 * (1 - healthPct)})`;
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2;
    const wobble = 0.88 + 0.12 * Math.sin(i * 2.7 + seed * 0.1);
    const px = Math.cos(angle) * r * wobble;
    const py = Math.sin(angle) * r * wobble;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Top highlight for 3D feel
  ctx.shadowBlur = 0;
  ctx.strokeStyle = `rgba(200, 170, 140, ${0.3 * healthPct})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, -r * 0.1, r * 0.5, -Math.PI * 0.85, -Math.PI * 0.15);
  ctx.stroke();

  // Crack lines — more as health drops
  if (healthPct < 0.7) {
    ctx.strokeStyle = '#331100';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, -r * 0.2);
    ctx.lineTo(r * 0.15, r * 0.25);
    ctx.stroke();
  }
  if (healthPct < 0.5) {
    ctx.beginPath();
    ctx.moveTo(r * 0.2, -r * 0.3);
    ctx.lineTo(-r * 0.1, r * 0.35);
    ctx.stroke();
  }
  if (healthPct < 0.3) {
    ctx.beginPath();
    ctx.moveTo(-r * 0.35, r * 0.05);
    ctx.lineTo(r * 0.3, -r * 0.1);
    ctx.stroke();
  }
}

function drawDecoration(_ctx: CanvasRenderingContext2D, _w: number, _h: number): void {
  // Disabled — may be replaced with sprites later
}

/**
 * Draw clouds using PNG sprite images, slightly transparent.
 */
export function drawClouds(
  ctx: CanvasRenderingContext2D,
  map: MapConfig,
  camera: CameraState,
): void {
  for (const cloud of map.clouds) {
    if (!isInViewport(cloud.position.y, camera, 200)) continue;

    const img = cloudImageMap[cloud.sprite];
    if (!img || !img.complete) continue;

    const screenX = cloud.position.x - camera.worldX;
    const screenY = cloud.position.y - camera.worldY;

    ctx.save();
    ctx.globalAlpha = cloud.alpha;
    ctx.drawImage(
      img,
      screenX - cloud.width / 2,
      screenY - cloud.height / 2,
      cloud.width,
      cloud.height,
    );
    ctx.restore();
  }
}

/**
 * Draw dust effects as small wispy shapes.
 */
export function drawDustEffects(
  ctx: CanvasRenderingContext2D,
  map: MapConfig,
  camera: CameraState,
): void {
  for (const dust of map.dustEffects) {
    if (!isInViewport(dust.position.y, camera, 150)) continue;

    const screenX = dust.position.x - camera.worldX;
    const screenY = dust.position.y - camera.worldY;

    ctx.save();
    ctx.globalAlpha = dust.alpha;
    ctx.fillStyle = '#aa7755';

    // Wispy ellipse
    ctx.beginPath();
    ctx.ellipse(screenX, screenY, dust.width / 2, dust.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

/**
 * Draw the finish line as a dashed line across the screen.
 */
export function drawFinishLine(
  ctx: CanvasRenderingContext2D,
  finishY: number,
  camera: CameraState,
): void {
  if (!isInViewport(finishY, camera, 50)) return;

  const screenY = finishY - camera.worldY;

  ctx.save();
  ctx.strokeStyle = '#44ff44';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 10]);
  ctx.shadowBlur = 4;
  ctx.shadowColor = '#44ff44';

  ctx.beginPath();
  ctx.moveTo(0, screenY);
  ctx.lineTo(GAME_WIDTH, screenY);
  ctx.stroke();

  // Label
  ctx.setLineDash([]);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#44ff44';
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('FINISH', GAME_WIDTH / 2, screenY - 8);

  ctx.restore();
}
