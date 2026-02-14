import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MusicManager } from './MusicManager';
import { SoundManager } from './SoundManager';

// Mock zzfx/zzfxm to avoid AudioContext in tests
vi.mock('./zzfx', () => ({
  zzfx: vi.fn(),
  zzfxGenerate: vi.fn(() => [0, 0, 0]),
  zzfxPlay: vi.fn(() => ({
    loop: false,
    stop: vi.fn(),
  })),
}));

vi.mock('./zzfxm', () => ({
  zzfxM: vi.fn(() => [0, 0, 0]),
}));

import { zzfxPlay } from './zzfx';
import { zzfxM } from './zzfxm';
const mockZzfxPlay = vi.mocked(zzfxPlay);
const mockZzfxM = vi.mocked(zzfxM);

describe('MusicManager', () => {
  beforeEach(() => {
    MusicManager.reset();
    SoundManager.reset();
    mockZzfxPlay.mockClear();
    mockZzfxM.mockClear();
    // Re-mock return value each time
    mockZzfxPlay.mockReturnValue({
      loop: false,
      stop: vi.fn(),
    } as unknown as AudioBufferSourceNode);
  });

  it('plays a track', () => {
    MusicManager.play('menu');
    expect(MusicManager.getCurrentTrack()).toBe('menu');
    expect(MusicManager.isPlaying()).toBe(true);
    expect(mockZzfxM).toHaveBeenCalledTimes(1);
    expect(mockZzfxPlay).toHaveBeenCalledTimes(1);
  });

  it('stops playback', () => {
    MusicManager.play('menu');
    MusicManager.stop();
    expect(MusicManager.getCurrentTrack()).toBeNull();
    expect(MusicManager.isPlaying()).toBe(false);
  });

  it('switches tracks when playing a different track', () => {
    MusicManager.play('menu');
    expect(MusicManager.getCurrentTrack()).toBe('menu');

    MusicManager.play('gameplay');
    expect(MusicManager.getCurrentTrack()).toBe('gameplay');
    // Should have rendered two different songs
    expect(mockZzfxM).toHaveBeenCalledTimes(2);
  });

  it('does not restart if same track is already playing', () => {
    MusicManager.play('menu');
    MusicManager.play('menu');
    // Should only render once
    expect(mockZzfxM).toHaveBeenCalledTimes(1);
  });

  it('does not produce audio when muted', () => {
    SoundManager.setMuted(true);
    MusicManager.play('menu');
    expect(MusicManager.getCurrentTrack()).toBe('menu');
    expect(MusicManager.isPlaying()).toBe(true);
    // Should not call zzfxM/zzfxPlay when muted
    expect(mockZzfxM).not.toHaveBeenCalled();
    expect(mockZzfxPlay).not.toHaveBeenCalled();
  });

  it('resumes audio when unmuted', () => {
    SoundManager.setMuted(true);
    MusicManager.play('gameplay');
    expect(mockZzfxPlay).not.toHaveBeenCalled();

    // Unmute
    MusicManager.onMuteChanged(false);
    expect(mockZzfxM).toHaveBeenCalledTimes(1);
    expect(mockZzfxPlay).toHaveBeenCalledTimes(1);
  });

  it('stops audio when muted during playback', () => {
    MusicManager.play('menu');
    const sourceNode = mockZzfxPlay.mock.results[0].value as unknown as { stop: ReturnType<typeof vi.fn> };

    MusicManager.onMuteChanged(true);
    expect(sourceNode.stop).toHaveBeenCalled();
  });

  it('reset stops everything', () => {
    MusicManager.play('gameplay');
    MusicManager.reset();
    expect(MusicManager.getCurrentTrack()).toBeNull();
    expect(MusicManager.isPlaying()).toBe(false);
  });

  it('getCurrentTrack returns null when nothing is playing', () => {
    expect(MusicManager.getCurrentTrack()).toBeNull();
  });

  it('isPlaying returns false initially', () => {
    expect(MusicManager.isPlaying()).toBe(false);
  });

  it('gameplay track renders without error', () => {
    MusicManager.play('gameplay');
    expect(mockZzfxM).toHaveBeenCalledTimes(1);
    // Verify song data was passed (array with instruments, patterns, sequence, BPM)
    const songData = mockZzfxM.mock.calls[0][0];
    expect(songData).toBeDefined();
    expect(Array.isArray(songData)).toBe(true);
  });

  it('menu track renders without error', () => {
    MusicManager.play('menu');
    expect(mockZzfxM).toHaveBeenCalledTimes(1);
    const songData = mockZzfxM.mock.calls[0][0];
    expect(songData).toBeDefined();
    expect(Array.isArray(songData)).toBe(true);
  });
});
