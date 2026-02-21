import type { Player, TankState, CameraState } from '../../types';
import { TANK_BODY_WIDTH, GAME_WIDTH, GAME_HEIGHT } from '../../engine/constants';

// --- Track marks ---

interface TrackMark {
  leftX: number;   // Left tread world position
  leftY: number;
  rightX: number;  // Right tread world position
  rightY: number;
  heading: number;
  age: number;     // ms since creation
  active: boolean;
}

const TRACK_BUFFER_SIZE = 200;
const TRACK_SPACING = 15;          // px between track marks
const TRACK_LIFETIME = 5000;       // ms before fully faded
const TRACK_START_ALPHA = 0.25;
const TRACK_COLOR = '#3a2a1a';
const TRACK_WIDTH = 5;             // px width of each tread mark
const TRACK_LENGTH = 6;            // px length along heading
const TREAD_OFFSET = TANK_BODY_WIDTH / 2 - 2; // match tread stripe position in drawTank

// --- Dust particles ---

interface DustParticle {
  worldX: number;
  worldY: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  active: boolean;
}

const DUST_POOL_SIZE = 60;
const DUST_SPEED_THRESHOLD = 10;   // min |speed| to emit dust
const DUST_SPAWN_INTERVAL = 80;    // ms between dust emissions per player
const DUST_MIN_LIFE = 400;         // ms
const DUST_MAX_LIFE = 800;         // ms
const DUST_MIN_SIZE = 1;           // radius
const DUST_MAX_SIZE = 3;
const DUST_COLOR = '#7a5533';
const DUST_MAX_ALPHA = 0.3;
const MAX_DT = 100;                // ms — clamp for tab backgrounding

/**
 * Tank trail effect for Episode 2.
 *
 * Manages two sub-systems:
 * 1. Track marks — tread impressions stamped into the ground, fading over 5s
 * 2. Dust particles — small circles kicked up from treads while moving
 *
 * All positions stored in world coordinates; draw() converts via camera.
 */
export class TankTrailEffect {
  // Track marks (ring buffer)
  private tracks: TrackMark[] = [];
  private trackHead = 0;

  // Per-player distance accumulators for track spacing
  private distAccum: Record<string, number> = {};

  // Dust particles (pool)
  private dustPool: DustParticle[] = [];

  // Per-player dust spawn timers
  private dustTimers: Record<string, number> = {};

  constructor() {
    for (let i = 0; i < TRACK_BUFFER_SIZE; i++) {
      this.tracks.push({
        leftX: 0, leftY: 0, rightX: 0, rightY: 0,
        heading: 0, age: 0, active: false,
      });
    }
    for (let i = 0; i < DUST_POOL_SIZE; i++) {
      this.dustPool.push({
        worldX: 0, worldY: 0, vx: 0, vy: 0,
        size: 1, life: 0, maxLife: 1, active: false,
      });
    }
  }

  update(
    dt: number,
    players: Player[],
    tankStates: Record<string, TankState> | undefined,
  ): void {
    if (dt <= 0 || !tankStates) return;
    const clampedDt = Math.min(dt, MAX_DT);
    const dtSec = clampedDt / 1000;

    // Age existing tracks
    for (const mark of this.tracks) {
      if (!mark.active) continue;
      mark.age += clampedDt;
      if (mark.age >= TRACK_LIFETIME) {
        mark.active = false;
      }
    }

    // Update dust particles
    for (const p of this.dustPool) {
      if (!p.active) continue;
      p.worldX += p.vx * dtSec;
      p.worldY += p.vy * dtSec;
      p.life -= clampedDt;
      if (p.life <= 0) {
        p.active = false;
      }
    }

    // Process each player
    for (const player of players) {
      if (!player.isAlive) continue;
      const tank = tankStates[player.id];
      if (!tank) continue;

      const absSpeed = Math.abs(tank.speed);

      // --- Track marks (distance-based) ---
      if (absSpeed > 0) {
        if (this.distAccum[player.id] === undefined) {
          this.distAccum[player.id] = 0;
        }
        this.distAccum[player.id] += absSpeed * dtSec;

        while (this.distAccum[player.id] >= TRACK_SPACING) {
          this.distAccum[player.id] -= TRACK_SPACING;
          this.emitTrackMark(player.position.x, player.position.y, tank.heading);
        }
      }

      // --- Dust particles (time-based, scaled by speed) ---
      if (absSpeed > DUST_SPEED_THRESHOLD) {
        if (this.dustTimers[player.id] === undefined) {
          this.dustTimers[player.id] = 0;
        }
        this.dustTimers[player.id] += clampedDt;

        // Faster speed = shorter interval between dust emissions
        const speedRatio = absSpeed / 200; // normalize to max speed
        const interval = DUST_SPAWN_INTERVAL / Math.max(0.3, speedRatio);

        while (this.dustTimers[player.id] >= interval) {
          this.dustTimers[player.id] -= interval;
          this.emitDust(player.position.x, player.position.y, tank.heading);
        }
      } else {
        // Reset timer when stationary
        this.dustTimers[player.id] = 0;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, camera: CameraState): void {
    // Draw track marks first (on the ground)
    this.drawTracks(ctx, camera);
    // Draw dust particles on top
    this.drawDust(ctx, camera);
  }

  reset(): void {
    for (const mark of this.tracks) mark.active = false;
    this.trackHead = 0;
    this.distAccum = {};
    for (const p of this.dustPool) p.active = false;
    this.dustTimers = {};
  }

  get activeTrackCount(): number {
    let count = 0;
    for (const m of this.tracks) if (m.active) count++;
    return count;
  }

  get activeDustCount(): number {
    let count = 0;
    for (const p of this.dustPool) if (p.active) count++;
    return count;
  }

  // --- Private ---

  private emitTrackMark(worldX: number, worldY: number, heading: number): void {
    const mark = this.tracks[this.trackHead];
    this.trackHead = (this.trackHead + 1) % TRACK_BUFFER_SIZE;

    const perpX = Math.cos(heading + Math.PI / 2);
    const perpY = -Math.sin(heading + Math.PI / 2);

    mark.leftX = worldX + perpX * TREAD_OFFSET;
    mark.leftY = worldY + perpY * TREAD_OFFSET;
    mark.rightX = worldX - perpX * TREAD_OFFSET;
    mark.rightY = worldY - perpY * TREAD_OFFSET;
    mark.heading = heading;
    mark.age = 0;
    mark.active = true;
  }

  private emitDust(worldX: number, worldY: number, heading: number): void {
    // Emit 2-3 particles from rear tread area
    const count = 2 + Math.floor(Math.random() * 2);
    const perpX = Math.cos(heading + Math.PI / 2);
    const perpY = -Math.sin(heading + Math.PI / 2);
    // Rear of tank (opposite to heading direction)
    const rearX = worldX - Math.cos(heading) * 18;
    const rearY = worldY + Math.sin(heading) * 18;

    for (let i = 0; i < count; i++) {
      const p = this.dustPool.find(p => !p.active);
      if (!p) return;

      // Random offset along the tread width
      const treadSide = (Math.random() - 0.5) * 2 * TREAD_OFFSET;
      p.worldX = rearX + perpX * treadSide + (Math.random() - 0.5) * 6;
      p.worldY = rearY + perpY * treadSide + (Math.random() - 0.5) * 6;
      p.vx = (Math.random() - 0.5) * 30;
      p.vy = -10 - Math.random() * 20; // drift upward (negative Y = up in world)
      p.size = DUST_MIN_SIZE + Math.random() * (DUST_MAX_SIZE - DUST_MIN_SIZE);
      p.maxLife = DUST_MIN_LIFE + Math.random() * (DUST_MAX_LIFE - DUST_MIN_LIFE);
      p.life = p.maxLife;
      p.active = true;
    }
  }

  private drawTracks(ctx: CanvasRenderingContext2D, camera: CameraState): void {
    ctx.save();
    ctx.fillStyle = TRACK_COLOR;

    for (const mark of this.tracks) {
      if (!mark.active) continue;

      const alpha = TRACK_START_ALPHA * (1 - mark.age / TRACK_LIFETIME);
      if (alpha < 0.005) continue;

      // Viewport culling
      const screenLX = mark.leftX - camera.worldX;
      const screenLY = mark.leftY - camera.worldY;
      const screenRX = mark.rightX - camera.worldX;
      const screenRY = mark.rightY - camera.worldY;

      const margin = 50;
      const anyVisible =
        (screenLX > -margin && screenLX < GAME_WIDTH + margin &&
         screenLY > -margin && screenLY < GAME_HEIGHT + margin) ||
        (screenRX > -margin && screenRX < GAME_WIDTH + margin &&
         screenRY > -margin && screenRY < GAME_HEIGHT + margin);
      if (!anyVisible) continue;

      ctx.globalAlpha = alpha;

      // Draw left tread mark
      ctx.save();
      ctx.translate(screenLX, screenLY);
      ctx.rotate(-mark.heading);
      ctx.fillRect(-TRACK_LENGTH / 2, -TRACK_WIDTH / 2, TRACK_LENGTH, TRACK_WIDTH);
      ctx.restore();

      // Draw right tread mark
      ctx.save();
      ctx.translate(screenRX, screenRY);
      ctx.rotate(-mark.heading);
      ctx.fillRect(-TRACK_LENGTH / 2, -TRACK_WIDTH / 2, TRACK_LENGTH, TRACK_WIDTH);
      ctx.restore();
    }

    ctx.restore();
  }

  private drawDust(ctx: CanvasRenderingContext2D, camera: CameraState): void {
    ctx.save();
    ctx.fillStyle = DUST_COLOR;

    for (const p of this.dustPool) {
      if (!p.active) continue;

      const alpha = DUST_MAX_ALPHA * (p.life / p.maxLife);
      if (alpha < 0.005) continue;

      const screenX = p.worldX - camera.worldX;
      const screenY = p.worldY - camera.worldY;

      // Viewport culling
      if (screenX < -20 || screenX > GAME_WIDTH + 20 ||
          screenY < -20 || screenY > GAME_HEIGHT + 20) continue;

      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(screenX, screenY, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
