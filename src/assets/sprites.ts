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
  ctx.fillStyle = '#ff3344';
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
  ctx.fillStyle = '#ff7755';
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

// 32x32 pixel art player ship (blue) - same shape, blue color scheme
export function createPlayerShipBlueCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;

  // Main body (blue)
  ctx.fillStyle = '#0099ff';
  ctx.fillRect(15, 2, 2, 4);
  ctx.fillRect(13, 6, 6, 4);
  ctx.fillRect(11, 10, 10, 6);
  ctx.fillRect(9, 16, 14, 4);
  ctx.fillRect(3, 20, 26, 4);
  ctx.fillRect(1, 24, 30, 2);
  ctx.fillRect(11, 26, 4, 4);
  ctx.fillRect(17, 26, 4, 4);

  // Cockpit (dark red)
  ctx.fillStyle = '#aa2244';
  ctx.fillRect(14, 8, 4, 4);

  // Highlights (brighter blue/cyan)
  ctx.fillStyle = '#55ccff';
  ctx.fillRect(15, 4, 2, 2);
  ctx.fillRect(13, 12, 2, 2);
  ctx.fillRect(17, 12, 2, 2);

  // Engine glow (cyan/white)
  ctx.fillStyle = '#00ddff';
  ctx.fillRect(12, 28, 2, 2);
  ctx.fillRect(18, 28, 2, 2);
  ctx.fillStyle = '#aaffff';
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
  ctx.fillStyle = '#00ff44';
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
  ctx.fillStyle = '#66ff88';
  ctx.fillRect(12, 4, 4, 2);
  ctx.fillRect(10, 12, 8, 2);

  // Dark accents
  ctx.fillStyle = '#009933';
  ctx.fillRect(6, 14, 2, 2);
  ctx.fillRect(20, 14, 2, 2);

  return canvas;
}

// 28x28 pixel art enemy Type B - armored slow fighter (blue/green)
export function createEnemyBCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;

  // Main body (blue/teal)
  ctx.fillStyle = '#00ccff';
  // Top dome (wider/tougher looking)
  ctx.fillRect(8, 2, 16, 4);
  ctx.fillRect(6, 6, 20, 4);
  // Mid body (armored)
  ctx.fillRect(4, 10, 24, 8);
  // Lower body
  ctx.fillRect(6, 18, 20, 4);
  // Legs/stabilizers
  ctx.fillRect(2, 22, 6, 4);
  ctx.fillRect(12, 22, 8, 4);
  ctx.fillRect(24, 22, 6, 4);

  // Armor plates (darker blue)
  ctx.fillStyle = '#0088aa';
  ctx.fillRect(6, 12, 4, 4);
  ctx.fillRect(22, 12, 4, 4);
  ctx.fillRect(12, 8, 8, 2);

  // Eyes (yellow/orange - menacing)
  ctx.fillStyle = '#ffaa22';
  ctx.fillRect(9, 7, 4, 3);
  ctx.fillRect(19, 7, 4, 3);

  // Eye cores
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(10, 8, 2, 1);
  ctx.fillRect(20, 8, 2, 1);

  // Body highlights (lighter cyan)
  ctx.fillStyle = '#55ddff';
  ctx.fillRect(14, 4, 4, 2);
  ctx.fillRect(10, 14, 12, 2);

  return canvas;
}

// 28x28 pixel art enemy Type C - fast aggressive fighter (red/orange)
export function createEnemyCCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 28;
  canvas.height = 28;
  const ctx = canvas.getContext('2d')!;

  // Main body (red/orange - aggressive)
  ctx.fillStyle = '#ff5500';
  // Pointed nose
  ctx.fillRect(12, 2, 4, 4);
  // Upper body (sleek)
  ctx.fillRect(10, 6, 8, 4);
  // Mid body
  ctx.fillRect(6, 10, 16, 4);
  // Wings (swept back)
  ctx.fillRect(2, 14, 24, 4);
  // Tail
  ctx.fillRect(10, 18, 8, 4);
  ctx.fillRect(8, 22, 4, 4);
  ctx.fillRect(16, 22, 4, 4);

  // Wing tips (orange)
  ctx.fillStyle = '#ff9933';
  ctx.fillRect(2, 16, 4, 2);
  ctx.fillRect(22, 16, 4, 2);

  // Eyes (green - alien)
  ctx.fillStyle = '#44ff44';
  ctx.fillRect(10, 8, 3, 2);
  ctx.fillRect(15, 8, 3, 2);

  // Nose highlight
  ctx.fillStyle = '#ff7744';
  ctx.fillRect(13, 3, 2, 2);

  // Engine glow
  ctx.fillStyle = '#ffaa22';
  ctx.fillRect(9, 24, 2, 2);
  ctx.fillRect(17, 24, 2, 2);

  return canvas;
}

// Explosion animation frames (4 frames of expanding debris)
export function createExplosionFrames(): HTMLCanvasElement[] {
  const frames: HTMLCanvasElement[] = [];
  const colors = ['#ffffff', '#ffcc00', '#ff5500', '#ff2200'];
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

// Bullet projectile (small yellow/orange circle)
export function createBulletCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 6;
  canvas.height = 6;
  const ctx = canvas.getContext('2d')!;

  // Outer glow (orange)
  ctx.fillStyle = '#ff8800';
  ctx.fillRect(1, 0, 4, 6);
  ctx.fillRect(0, 1, 6, 4);

  // Inner core (yellow)
  ctx.fillStyle = '#ffff00';
  ctx.fillRect(2, 1, 2, 4);
  ctx.fillRect(1, 2, 4, 2);

  return canvas;
}

// Particle texture (4x4 bright white circle for particle emitters)
export function createParticleCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 4;
  canvas.height = 4;
  const ctx = canvas.getContext('2d')!;

  // Soft circular particle
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(1, 0, 2, 4);
  ctx.fillRect(0, 1, 4, 2);

  return canvas;
}

// Laser projectile (small bright cyan bar)
export function createLaserCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 4;
  canvas.height = 12;
  const ctx = canvas.getContext('2d')!;

  // Glow
  ctx.fillStyle = '#00ffff';
  ctx.fillRect(0, 0, 4, 12);

  // Core
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(1, 1, 2, 10);

  return canvas;
}
