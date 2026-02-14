import Phaser from 'phaser';

/** Color presets per entity type for explosion particles. */
const EXPLOSION_COLORS: Record<string, number[]> = {
  A: [0x00ff44, 0x66ff88, 0xffffff], // Green enemy
  B: [0x00ccff, 0x55ddff, 0xffffff], // Cyan enemy
  C: [0xff5500, 0xff9933, 0xffffff], // Orange enemy
  player: [0xff3344, 0xff7755, 0xffffff], // Red player
  default: [0xffcc00, 0xff5500, 0xffffff], // Generic yellow/orange
};

/**
 * Triggers a particle burst explosion at the given position.
 * Uses Phaser's particle emitter with ADD blend mode for hot glow.
 */
export function triggerParticleExplosion(
  scene: Phaser.Scene,
  x: number,
  y: number,
  entityType: string,
): void {
  const colors = EXPLOSION_COLORS[entityType] || EXPLOSION_COLORS.default;
  const isPlayer = entityType === 'player';
  const particleCount = isPlayer ? 40 : 25;

  const emitter = scene.add.particles(x, y, 'particle', {
    speed: { min: 60, max: isPlayer ? 200 : 150 },
    angle: { min: 0, max: 360 },
    scale: { start: isPlayer ? 1.5 : 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: isPlayer ? 600 : 400,
    blendMode: Phaser.BlendModes.ADD,
    tint: colors,
    quantity: particleCount,
    emitting: false,
  });

  emitter.setDepth(20);
  emitter.explode(particleCount);

  // Camera shake on player death
  if (isPlayer) {
    scene.cameras.main.shake(100, 0.008);
  }

  // Auto-cleanup after particles expire
  scene.time.delayedCall(isPlayer ? 700 : 500, () => {
    emitter.destroy();
  });
}
