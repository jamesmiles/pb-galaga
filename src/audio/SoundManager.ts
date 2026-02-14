import { zzfx, type ZzFXParams } from './zzfx';

/** Named sound effects. */
export type SoundEffect = 'playerFire' | 'enemyFire' | 'explosion' | 'playerDeath' | 'menuSelect';

/**
 * ZzFX parameter presets for each sound effect.
 * Designed for retro 8-bit arcade feel.
 * Format: [volume, randomness, frequency, attack, sustain, release, shape, shapeCurve,
 *          slide, deltaSlide, pitchJump, pitchJumpTime, repeatTime, noise, modulation,
 *          bitCrush, delay, sustainVolume, decay, tremolo]
 */
const SOUND_PRESETS: Record<SoundEffect, ZzFXParams> = {
  // Short high-pitched laser pew
  playerFire: [0.5, 0.01, 800, 0, 0.02, 0.04, 2, 1, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.02, 0],
  // Lower-pitched enemy fire
  enemyFire: [0.4, 0.02, 400, 0, 0.02, 0.06, 2, 1, -10, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.02, 0],
  // Medium explosion boom
  explosion: [0.6, 0.05, 200, 0, 0.06, 0.2, 3, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0.3, 0.1, 0],
  // Long dramatic death explosion
  playerDeath: [0.8, 0.05, 150, 0.01, 0.15, 0.4, 3, 1, -5, 0, 0, 0, 0, 1, 0, 0, 0.1, 0.2, 0.15, 0],
  // Quick menu blip
  menuSelect: [0.3, 0, 600, 0, 0.01, 0.02, 0, 1, 0, 0, 200, 0.01, 0, 0, 0, 0, 0, 0.8, 0, 0],
};

/**
 * Manages sound effects for the game.
 * Uses ZzFX for procedural audio generation.
 * Headless-safe: does nothing if AudioContext is unavailable.
 */
export class SoundManager {
  private static muted = false;
  private static initialized = false;

  /** Initialize the sound system. Safe to call multiple times. */
  static init(): void {
    SoundManager.initialized = true;
  }

  /** Play a named sound effect. No-op if muted. */
  static play(effect: SoundEffect): void {
    if (SoundManager.muted) return;

    const params = SOUND_PRESETS[effect];
    if (!params) return;

    try {
      zzfx(...params as number[]);
    } catch {
      // Silently fail if AudioContext unavailable (headless, etc.)
    }
  }

  /** Set muted state. */
  static setMuted(muted: boolean): void {
    SoundManager.muted = muted;
  }

  /** Query muted state. */
  static isMuted(): boolean {
    return SoundManager.muted;
  }

  /** Toggle mute on/off. Returns new muted state. */
  static toggleMute(): boolean {
    SoundManager.muted = !SoundManager.muted;
    return SoundManager.muted;
  }

  /** Reset to defaults. */
  static reset(): void {
    SoundManager.muted = false;
    SoundManager.initialized = false;
  }

  /** Get the preset params for a sound effect (for testing). */
  static getPreset(effect: SoundEffect): ZzFXParams | undefined {
    return SOUND_PRESETS[effect];
  }
}
