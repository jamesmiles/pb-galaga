import { FIXED_TIMESTEP, MAX_ACCUMULATED } from './constants';

export type UpdateCallback = (dt: number) => void;
export type RenderCallback = (alpha: number) => void;

export class GameLoop {
  private accumulator = 0;
  private lastTimestamp = 0;
  private running = false;
  private animationFrameId: number | null = null;

  private updateFn: UpdateCallback;
  private renderFn: RenderCallback;

  constructor(updateFn: UpdateCallback, renderFn: RenderCallback) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.accumulator = 0;
    this.lastTimestamp = performance.now();
    this.animationFrameId = requestAnimationFrame((ts) => this.tick(ts));
  }

  stop(): void {
    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  tick(timestamp: number): void {
    if (!this.running) return;

    let elapsed = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    // Spiral-of-death guard
    if (elapsed > MAX_ACCUMULATED) {
      elapsed = MAX_ACCUMULATED;
    }

    this.accumulator += elapsed;

    // Fixed time step updates
    while (this.accumulator >= FIXED_TIMESTEP) {
      this.updateFn(FIXED_TIMESTEP);
      this.accumulator -= FIXED_TIMESTEP;
    }

    // Interpolation alpha for rendering
    const alpha = this.accumulator / FIXED_TIMESTEP;
    this.renderFn(alpha);

    this.animationFrameId = requestAnimationFrame((ts) => this.tick(ts));
  }

  /** Advance N fixed time steps without requestAnimationFrame (for headless testing). */
  tickHeadless(steps: number): void {
    for (let i = 0; i < steps; i++) {
      this.updateFn(FIXED_TIMESTEP);
    }
  }

  isRunning(): boolean {
    return this.running;
  }
}
