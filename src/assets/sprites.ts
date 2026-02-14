/**
 * Pixel art sprite data as base64-encoded PNG data URIs.
 * These are embedded so the game works from file:// without asset loading.
 *
 * Each sprite is a small pixel art image designed for the game's retro aesthetic.
 * Sprites are created programmatically and exported as data URIs.
 */

// 16x16 pixel art player ship (red) - classic arrow/fighter shape
// Drawn on a canvas and exported
export function createPlayerShipCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;

  // Main body (red)
  ctx.fillStyle = '#ff2222';
  // Nose
  ctx.fillRect(15, 2, 2, 4);
  // Upper fuselage
  ctx.fillRect(13, 6, 6, 4);
  // Mid fuselage
  ctx.fillRect(11, 10, 10, 6);
  // Lower fuselage
  ctx.fillRect(9, 16, 14, 4);
  // Wings
  ctx.fillRect(3, 20, 26, 4);
  ctx.fillRect(1, 24, 30, 2);
  // Engine section
  ctx.fillRect(11, 26, 4, 4);
  ctx.fillRect(17, 26, 4, 4);

  // Cockpit (dark blue)
  ctx.fillStyle = '#2244aa';
  ctx.fillRect(14, 8, 4, 4);

  // Highlights (brighter red/orange)
  ctx.fillStyle = '#ff6644';
  ctx.fillRect(15, 4, 2, 2);
  ctx.fillRect(13, 12, 2, 2);
  ctx.fillRect(17, 12, 2, 2);

  // Engine glow (orange/yellow)
  ctx.fillStyle = '#ffaa22';
  ctx.fillRect(12, 28, 2, 2);
  ctx.fillRect(18, 28, 2, 2);
  ctx.fillStyle = '#ffff44';
  ctx.fillRect(12, 30, 2, 2);
  ctx.fillRect(18, 30, 2, 2);

  return canvas;
}

// 24x24 pixel art enemy Type A - alien transport shape
export function createEnemyACanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 28;
  canvas.height = 28;
  const ctx = canvas.getContext('2d')!;

  // Main body (green)
  ctx.fillStyle = '#22cc44';
  // Top dome
  ctx.fillRect(10, 2, 8, 4);
  ctx.fillRect(8, 6, 12, 4);
  // Mid body
  ctx.fillRect(4, 10, 20, 6);
  // Lower body
  ctx.fillRect(6, 16, 16, 4);
  // Tentacles/legs
  ctx.fillRect(4, 20, 4, 4);
  ctx.fillRect(10, 20, 2, 4);
  ctx.fillRect(16, 20, 2, 4);
  ctx.fillRect(20, 20, 4, 4);

  // Eyes (dark/red)
  ctx.fillStyle = '#ff2222';
  ctx.fillRect(9, 8, 3, 3);
  ctx.fillRect(16, 8, 3, 3);

  // Eye pupils (white)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(10, 9, 1, 1);
  ctx.fillRect(17, 9, 1, 1);

  // Body highlights (lighter green)
  ctx.fillStyle = '#44ee66';
  ctx.fillRect(12, 4, 4, 2);
  ctx.fillRect(10, 12, 8, 2);

  // Dark accents
  ctx.fillStyle = '#118833';
  ctx.fillRect(6, 14, 2, 2);
  ctx.fillRect(20, 14, 2, 2);

  return canvas;
}

// Explosion animation frames (4 frames of expanding debris)
export function createExplosionFrames(): HTMLCanvasElement[] {
  const frames: HTMLCanvasElement[] = [];
  const colors = ['#ffff44', '#ff8822', '#ff4422', '#882222'];
  const sizes = [8, 16, 24, 28];

  for (let f = 0; f < 4; f++) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const s = sizes[f];
    const offset = (32 - s) / 2;

    // Outer glow
    ctx.fillStyle = colors[Math.min(f, 3)];
    ctx.fillRect(offset, offset, s, s);

    // Inner bright core (shrinks each frame)
    const coreSize = Math.max(4, s - f * 6);
    const coreOffset = (32 - coreSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(coreOffset, coreOffset, coreSize, coreSize);

    // Debris particles
    ctx.fillStyle = colors[Math.max(0, f - 1)];
    const spread = f * 4;
    for (let i = 0; i < 6 + f * 2; i++) {
      const angle = (i / (6 + f * 2)) * Math.PI * 2;
      const dist = spread + 2;
      const px = 16 + Math.cos(angle) * dist;
      const py = 16 + Math.sin(angle) * dist;
      ctx.fillRect(Math.floor(px), Math.floor(py), 2, 2);
    }

    frames.push(canvas);
  }

  return frames;
}

// Laser projectile (small bright cyan bar)
export function createLaserCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 4;
  canvas.height = 12;
  const ctx = canvas.getContext('2d')!;

  // Glow
  ctx.fillStyle = '#44ccff';
  ctx.fillRect(0, 0, 4, 12);

  // Core
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(1, 1, 2, 10);

  return canvas;
}
