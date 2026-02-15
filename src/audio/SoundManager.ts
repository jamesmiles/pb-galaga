import { zzfx, type ZzFXParams } from './zzfx';

/** Named sound effects. */
export type SoundEffect = 'playerFire' | 'enemyFire' | 'explosion' | 'playerDeath' | 'menuSelect' | 'hitA' | 'hitB' | 'hitC' | 'hitD' | 'hitE' | 'hitF' | 'typeKey' | 'asteroidHit' | 'asteroidExplode' | 'missileWhistle' | 'bossExplosion' | 'lifePickup';

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
  // Type A hit: quick crisp pop (weakest enemy)
  hitA: [0.5, 0.02, 600, 0, 0.03, 0.06, 3, 1, 15, 0, 0, 0, 0, 0.3, 0, 0, 0, 0.4, 0.04, 0],
  // Type B hit: heavy metallic crunch (armored)
  hitB: [0.7, 0.04, 300, 0, 0.06, 0.15, 3, 1, -8, -2, 0, 0, 0, 0.8, 0, 0, 0, 0.3, 0.1, 0],
  // Type C hit: sharp shattering crack (fast fighter)
  hitC: [0.6, 0.03, 500, 0, 0.04, 0.08, 3, 1, 25, 3, 100, 0.02, 0, 0.5, 0, 0, 0, 0.4, 0.05, 0],
  // Type D hit: resonant plasma thud (curved fighter)
  hitD: [0.7, 0.03, 250, 0.01, 0.08, 0.18, 3, 1, -5, -1, 0, 0, 0, 0.6, 0, 0, 0, 0.3, 0.12, 0],
  // Type E hit: deep heavy boom (strategic bomber)
  hitE: [0.8, 0.05, 180, 0.01, 0.1, 0.25, 3, 1, -8, -2, 0, 0, 0, 0.9, 0, 0, 0, 0.2, 0.15, 0],
  // Keyboard typing click
  typeKey: [0.15, 0.01, 1200, 0, 0.005, 0.01, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.8, 0.005, 0],
  // Asteroid hit: dull dirt thud (low frequency, short, gritty)
  asteroidHit: [0.5, 0.04, 150, 0, 0.04, 0.08, 3, 1, -3, 0, 0, 0, 0, 0.7, 0, 0, 0, 0.3, 0.06, 0],
  // Asteroid explode: crumbling dirt burst (deep rumble with noise)
  asteroidExplode: [0.7, 0.06, 100, 0.01, 0.1, 0.3, 3, 1, -6, -1, 0, 0, 0, 1, 0, 0, 0, 0.2, 0.15, 0],
  // Type F hit: deep resonant boom (stealth bomber, louder)
  hitF: [0.9, 0.06, 120, 0.02, 0.12, 0.3, 3, 1, -10, -3, 0, 0, 0, 1, 0, 0, 0, 0.2, 0.18, 0],
  // Missile whistle: eerie rising whistle (enemy homing missile in-flight)
  missileWhistle: [0.3, 0.02, 600, 0.05, 0.2, 0.15, 0, 1, 30, 5, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.1, 0.2],
  // Boss explosion: massive deep boom with reverb (max volume, very long sustain)
  bossExplosion: [3, 0.12, 40, 0.04, 0.5, 1.2, 3, 1, -12, -4, 0, 0, 0, 2, 0, 0, 0.2, 0.25, 0.4, 0],
  // Life pickup: bright cheerful chime
  lifePickup: [0.4, 0, 800, 0, 0.02, 0.08, 0, 1, 10, 0, 400, 0.02, 0, 0, 0, 0, 0, 0.7, 0.02, 0],
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
