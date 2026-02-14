/** Canvas 2D particle explosion system with alpha fade, neon glow, and light flashes. */

import { GAME_WIDTH, GAME_HEIGHT } from '../../engine/constants';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

interface Flash {
  x: number;
  y: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
  isScreenFlash: boolean;
}

/** Color presets per entity type for explosion particles. */
const EXPLOSION_COLORS: Record<string, string[]> = {
  A: ['#00ff44', '#66ff88', '#ffffff'],
  B: ['#00ccff', '#55ddff', '#ffffff'],
  C: ['#ff5500', '#ff9933', '#ffffff'],
  player: ['#ff3344', '#ff7755', '#ffffff'],
  default: ['#ffcc00', '#ff5500', '#ffffff'],
};

/** Primary glow color per entity type for screen flashes. */
const FLASH_COLORS: Record<string, string> = {
  A: '#00ff44',
  B: '#00ccff',
  C: '#ff5500',
  player: '#ff3344',
  default: '#ffcc00',
};

export class ParticleSystem {
  private particles: Particle[] = [];
  private flashes: Flash[] = [];
  private explodedEntities: Set<string> = new Set();
  private impactedProjectiles: Set<string> = new Set();

  // Screen shake state
  shakeOffsetX = 0;
  shakeOffsetY = 0;
  private shakeTimer = 0;
  private shakeDuration = 0;
  private shakeIntensity = 0;

  /**
   * Emit an explosion burst at the given position.
   * Deduplicates by entityId to prevent duplicate explosions.
   */
  emit(x: number, y: number, entityId: string, entityType: string): void {
    if (this.explodedEntities.has(entityId)) return;
    this.explodedEntities.add(entityId);

    const colors = EXPLOSION_COLORS[entityType] || EXPLOSION_COLORS.default;
    const isPlayer = entityType === 'player';
    const count = isPlayer ? 35 : 20;
    const speedRange = isPlayer ? 200 : 150;
    const lifespan = isPlayer ? 600 : 400;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * speedRange;
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: lifespan,
        maxLife: lifespan,
        size: 2 + Math.random() * 3,
      });
    }

    // Screen shake on player death
    if (isPlayer) {
      this.shakeTimer = 0;
      this.shakeDuration = 150;
      this.shakeIntensity = 4;
    }
  }

  /**
   * Emit a localized impact flash at a collision point.
   * Deduplicates by projectile ID.
   */
  emitImpactFlash(x: number, y: number, projectileId: string, color: string = '#ffffff'): void {
    if (this.impactedProjectiles.has(projectileId)) return;
    this.impactedProjectiles.add(projectileId);

    this.flashes.push({
      x, y,
      radius: 20,
      color,
      life: 60,
      maxLife: 60,
      isScreenFlash: false,
    });
  }

  /** Update particle positions, lifetimes, flashes, and screen shake. */
  update(dt: number): void {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      const dtSec = dt / 1000;
      p.x += p.vx * dtSec;
      p.y += p.vy * dtSec;
      // Slight gravity pull downward
      p.vy += 50 * dtSec;
      // Slow down
      p.vx *= 0.99;
      p.vy *= 0.99;
      p.life -= dt;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update flashes
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      this.flashes[i].life -= dt;
      if (this.flashes[i].life <= 0) {
        this.flashes.splice(i, 1);
      }
    }

    // Update screen shake
    if (this.shakeTimer < this.shakeDuration) {
      this.shakeTimer += dt;
      const remaining = 1 - this.shakeTimer / this.shakeDuration;
      this.shakeOffsetX = (Math.random() - 0.5) * 2 * this.shakeIntensity * remaining;
      this.shakeOffsetY = (Math.random() - 0.5) * 2 * this.shakeIntensity * remaining;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
  }

  /** Draw all active particles and flashes with alpha fade and glow. */
  draw(ctx: CanvasRenderingContext2D): void {
    // Draw flashes first (behind particles)
    for (const flash of this.flashes) {
      const alpha = Math.max(0, flash.life / flash.maxLife);
      ctx.save();

      if (flash.isScreenFlash) {
        // Full-screen additive flash
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = alpha * 0.12;
        ctx.fillStyle = flash.color;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      } else {
        // Localized impact flash with radial gradient
        ctx.globalCompositeOperation = 'lighter';
        const gradient = ctx.createRadialGradient(
          flash.x, flash.y, 0,
          flash.x, flash.y, flash.radius,
        );
        gradient.addColorStop(0, flash.color);
        gradient.addColorStop(1, 'transparent');
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(flash.x, flash.y, flash.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // Draw particles
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      // Glow on brighter particles (early in life)
      if (alpha > 0.5) {
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
      }

      ctx.fillRect(
        Math.floor(p.x - p.size / 2),
        Math.floor(p.y - p.size / 2),
        Math.ceil(p.size),
        Math.ceil(p.size),
      );

      ctx.restore();
    }
  }

  /** Clear explosion tracking (call on game restart). */
  clearTracking(): void {
    this.explodedEntities.clear();
    this.impactedProjectiles.clear();
    this.particles = [];
    this.flashes = [];
    this.shakeTimer = 0;
    this.shakeDuration = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
  }

  get activeCount(): number {
    return this.particles.length;
  }

  get flashCount(): number {
    return this.flashes.length;
  }
}
