import { GAME_WIDTH, GAME_HEIGHT } from '../../engine/constants';

interface WindParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  size: number;
  active: boolean;
}

const POOL_SIZE = 100;
const BASE_SPAWN_RATE = 12;            // particles/second at density 1.0
const BASE_WIND_SPEED = -90;           // px/s (leftward)
const WIND_JITTER = 30;               // +/- per-particle speed randomness
const MAX_GUST_EXTRA = -80;           // Additional px/s during peak gusts
const MIN_LIFE = 3000;                // ms
const MAX_LIFE = 6000;                // ms
const MIN_LENGTH = 15;                // px
const MAX_LENGTH = 50;                // px
const MIN_SIZE = 0.5;                 // circle radius
const MAX_SIZE = 2.0;
const MIN_ALPHA = 0.08;
const MAX_ALPHA = 0.25;
const PARTICLE_COLOR = '#ccaa88';      // Warm Martian dust tone
const MAX_DT = 100;                    // ms — clamp to prevent spawn bursts

/**
 * Passive wind particle overlay for Episode 2 (Mars levels).
 *
 * Self-contained render-only effect — owns its own state, follows
 * the same update(dt) / draw(ctx) pattern as ParticleSystem.
 * Thin streaks drift right-to-left with organic gusting behaviour
 * driven by layered sine waves.
 */
export class WindParticleOverlay {
  private pool: WindParticle[];
  private spawnAccumulator = 0;
  private gustPhase = Math.random() * 100; // start at random phase so each session feels different

  constructor() {
    this.pool = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      this.pool.push({
        x: 0, y: 0, vx: 0, vy: 0,
        length: 0, maxAlpha: 0,
        life: 0, maxLife: 1,
        size: 1, active: false,
      });
    }
  }

  update(dt: number, cameraDx = 0, cameraDy = 0): void {
    if (dt <= 0) return;
    const clampedDt = Math.min(dt, MAX_DT);
    const dtSec = clampedDt / 1000;

    // Advance gust phase
    this.gustPhase += dtSec;
    const t = this.gustPhase;

    // Layered sine waves for organic wind variation
    const gustFactor = (
      0.4 * Math.sin(t * 0.3) +
      0.3 * Math.sin(t * 0.7 + 1.3) +
      0.3 * Math.sin(t * 1.9 + 0.7)
    ); // range [-1, 1]

    const gustSpeed = MAX_GUST_EXTRA * Math.max(0, gustFactor); // only add speed on positive gusts

    // Density variation (slower oscillation)
    const densityFactor = 0.7 + 1.3 * (0.5 + 0.5 * Math.sin(t * 0.2 + 2.1)); // range [0.7, 2.0]

    // Turbulence (vertical scatter strength)
    const turbulence = 10 + 30 * (0.5 + 0.5 * Math.sin(t * 0.15 + 0.5)); // range [10, 40]

    // Update active particles
    for (const p of this.pool) {
      if (!p.active) continue;

      p.x += p.vx * dtSec - cameraDx;
      p.y += p.vy * dtSec - cameraDy;
      p.life -= clampedDt;

      if (p.life <= 0 || p.x + p.length < 0 || p.y < -100 || p.y > GAME_HEIGHT + 100) {
        p.active = false;
      }
    }

    // Spawn new particles
    this.spawnAccumulator += BASE_SPAWN_RATE * densityFactor * dtSec;

    while (this.spawnAccumulator >= 1) {
      this.spawnAccumulator -= 1;
      this.spawnParticle(gustSpeed, turbulence);
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = PARTICLE_COLOR;

    for (const p of this.pool) {
      if (!p.active) continue;

      // Fade envelope: fade in over first 20%, fade out over last 80%
      const lifeRatio = p.life / p.maxLife;
      const fadeIn = Math.min(1, (1 - lifeRatio) / 0.2);
      const fadeOut = Math.min(1, lifeRatio / 0.8);
      const alpha = p.maxAlpha * fadeIn * fadeOut;

      if (alpha < 0.005) continue;

      ctx.globalAlpha = alpha;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  reset(): void {
    for (const p of this.pool) {
      p.active = false;
    }
    this.spawnAccumulator = 0;
    this.gustPhase = Math.random() * 100;
  }

  get activeCount(): number {
    let count = 0;
    for (const p of this.pool) {
      if (p.active) count++;
    }
    return count;
  }

  private spawnParticle(gustSpeed: number, turbulence: number): void {
    // Find an inactive particle slot
    const p = this.pool.find(p => !p.active);
    if (!p) return;

    p.active = true;
    p.x = GAME_WIDTH + Math.random() * 50;           // spawn just off right edge
    p.y = Math.random() * GAME_HEIGHT;                // random vertical position
    p.vx = BASE_WIND_SPEED + gustSpeed + (Math.random() * 2 - 1) * WIND_JITTER;
    p.vy = (Math.random() * 2 - 1) * turbulence;     // slight vertical drift
    p.length = MIN_LENGTH + Math.random() * (MAX_LENGTH - MIN_LENGTH);
    p.maxAlpha = MIN_ALPHA + Math.random() * (MAX_ALPHA - MIN_ALPHA);
    p.maxLife = MIN_LIFE + Math.random() * (MAX_LIFE - MIN_LIFE);
    p.life = p.maxLife;
    p.size = MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE);
  }
}
