import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SoundManager, type SoundEffect } from './SoundManager';

// Mock zzfx to avoid AudioContext in tests
vi.mock('./zzfx', () => ({
  zzfx: vi.fn(),
}));

import { zzfx } from './zzfx';
const mockZzfx = vi.mocked(zzfx);

// Mock Audio for MP3 SFX tests
const audioInstances: MockAudio[] = [];

class MockAudio {
  src = '';
  volume = 1;
  currentTime = 0;
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();
  constructor(url?: string) {
    if (url) this.src = url;
    audioInstances.push(this);
  }
}

describe('SoundManager', () => {
  beforeEach(() => {
    SoundManager.reset();
    mockZzfx.mockClear();
    audioInstances.length = 0;
    vi.stubGlobal('Audio', MockAudio);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('plays a sound effect by calling zzfx', () => {
    SoundManager.play('playerFire');
    expect(mockZzfx).toHaveBeenCalledTimes(1);
  });

  it('plays different effects with different params', () => {
    SoundManager.play('playerFire');
    const playerFireArgs = mockZzfx.mock.calls[0];

    mockZzfx.mockClear();
    SoundManager.play('enemyFire');
    const enemyFireArgs = mockZzfx.mock.calls[0];

    // Different sound effects should have different parameters
    expect(playerFireArgs).not.toEqual(enemyFireArgs);
  });

  it('does not call zzfx when muted', () => {
    SoundManager.setMuted(true);
    SoundManager.play('explosion');
    expect(mockZzfx).not.toHaveBeenCalled();
  });

  it('resumes playing after unmuting', () => {
    SoundManager.setMuted(true);
    SoundManager.play('explosion');
    SoundManager.setMuted(false);
    SoundManager.play('explosion');
    expect(mockZzfx).toHaveBeenCalledTimes(1);
  });

  it('toggleMute toggles state and returns new value', () => {
    expect(SoundManager.isMuted()).toBe(false);
    const result1 = SoundManager.toggleMute();
    expect(result1).toBe(true);
    expect(SoundManager.isMuted()).toBe(true);
    const result2 = SoundManager.toggleMute();
    expect(result2).toBe(false);
    expect(SoundManager.isMuted()).toBe(false);
  });

  it('isMuted returns current mute state', () => {
    expect(SoundManager.isMuted()).toBe(false);
    SoundManager.setMuted(true);
    expect(SoundManager.isMuted()).toBe(true);
  });

  it('init is idempotent', () => {
    SoundManager.init();
    SoundManager.init();
    SoundManager.play('menuSelect');
    expect(mockZzfx).toHaveBeenCalledTimes(1);
  });

  it('reset clears muted state', () => {
    SoundManager.setMuted(true);
    SoundManager.reset();
    expect(SoundManager.isMuted()).toBe(false);
  });

  it('has presets for all sound effects', () => {
    const effects: SoundEffect[] = ['playerFire', 'enemyFire', 'explosion', 'playerDeath', 'menuSelect', 'hitA', 'hitB', 'hitC', 'hitD', 'hitE', 'typeKey', 'snakeBeam'];
    for (const effect of effects) {
      const preset = SoundManager.getPreset(effect);
      expect(preset).toBeDefined();
      expect(preset!.length).toBeGreaterThan(0);
    }
  });

  it('all effects call zzfx successfully', () => {
    const effects: SoundEffect[] = ['playerFire', 'enemyFire', 'explosion', 'playerDeath', 'menuSelect', 'hitA', 'hitB', 'hitC', 'hitD', 'hitE', 'typeKey', 'snakeBeam'];
    for (const effect of effects) {
      SoundManager.play(effect);
    }
    expect(mockZzfx).toHaveBeenCalledTimes(12);
  });

  it('hit sounds have distinct parameters per enemy type', () => {
    const hitA = SoundManager.getPreset('hitA');
    const hitB = SoundManager.getPreset('hitB');
    const hitC = SoundManager.getPreset('hitC');
    const hitD = SoundManager.getPreset('hitD');
    const hitE = SoundManager.getPreset('hitE');
    expect(hitA).toBeDefined();
    expect(hitB).toBeDefined();
    expect(hitC).toBeDefined();
    expect(hitD).toBeDefined();
    expect(hitE).toBeDefined();
    // Each type should have different frequency (param index 2)
    expect(hitA![2]).not.toBe(hitB![2]);
    expect(hitB![2]).not.toBe(hitC![2]);
    expect(hitC![2]).not.toBe(hitD![2]);
    expect(hitD![2]).not.toBe(hitE![2]);
  });

  it('hitB is louder than hitA (armored enemy)', () => {
    const hitA = SoundManager.getPreset('hitA')!;
    const hitB = SoundManager.getPreset('hitB')!;
    // Volume is param index 0
    expect(hitB[0]).toBeGreaterThan(hitA[0] as number);
  });

  it('hitE is the loudest hit sound (strategic bomber)', () => {
    const hitD = SoundManager.getPreset('hitD')!;
    const hitE = SoundManager.getPreset('hitE')!;
    expect(hitE[0]).toBeGreaterThan(hitD[0] as number);
  });

  // --- MP3 SFX tests ---

  it('cannonFire plays via MP3 (not zzfx)', () => {
    SoundManager.play('cannonFire');
    expect(mockZzfx).not.toHaveBeenCalled();
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].src).toBe('audio/cannon-fire.mp3');
    expect(audioInstances[0].play).toHaveBeenCalled();
  });

  it('plasmaFire plays via MP3 (not zzfx)', () => {
    SoundManager.play('plasmaFire');
    expect(mockZzfx).not.toHaveBeenCalled();
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].src).toBe('audio/plasma-fire.mp3');
    expect(audioInstances[0].play).toHaveBeenCalled();
  });

  it('MP3 SFX reuses cached Audio element on repeated plays', () => {
    SoundManager.play('cannonFire');
    SoundManager.play('cannonFire');
    // Only one Audio element created, reused on second play
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].play).toHaveBeenCalledTimes(2);
    expect(audioInstances[0].currentTime).toBe(0);
  });

  it('MP3 SFX respects mute', () => {
    SoundManager.setMuted(true);
    SoundManager.play('cannonFire');
    expect(audioInstances).toHaveLength(0);
  });

  it('MP3 SFX cache cleared on reset', () => {
    SoundManager.play('cannonFire');
    expect(audioInstances).toHaveLength(1);
    SoundManager.reset();
    SoundManager.play('cannonFire');
    // New Audio element after reset
    expect(audioInstances).toHaveLength(2);
  });
});
