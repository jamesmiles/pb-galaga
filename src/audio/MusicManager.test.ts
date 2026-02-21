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

// Mock HTMLAudioElement for MP3 tests
const audioInstances: MockAudio[] = [];

class MockAudio {
  src = '';
  loop = false;
  volume = 1;
  currentTime = 0;
  preload = '';
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();

  constructor(url?: string) {
    if (url) this.src = url;
    audioInstances.push(this);
  }
}

vi.stubGlobal('Audio', MockAudio);

describe('MusicManager', () => {
  beforeEach(() => {
    MusicManager.reset();
    MusicManager.clearCache();
    SoundManager.reset();
    mockZzfxPlay.mockClear();
    mockZzfxM.mockClear();
    audioInstances.length = 0;
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

    MusicManager.play('level1');
    expect(MusicManager.getCurrentTrack()).toBe('level1');
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
    MusicManager.play('level1');
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
    MusicManager.play('level1');
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
    MusicManager.play('level1');
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

  it('level2 track renders without error', () => {
    MusicManager.play('level2');
    expect(mockZzfxM).toHaveBeenCalledTimes(1);
    const songData = mockZzfxM.mock.calls[0][0];
    expect(songData).toBeDefined();
    expect(Array.isArray(songData)).toBe(true);
  });

  it('level3 track renders without error', () => {
    MusicManager.play('level3');
    expect(mockZzfxM).toHaveBeenCalledTimes(1);
    const songData = mockZzfxM.mock.calls[0][0];
    expect(songData).toBeDefined();
    expect(Array.isArray(songData)).toBe(true);
  });

  it('level4 track renders without error', () => {
    MusicManager.play('level4');
    expect(mockZzfxM).toHaveBeenCalledTimes(1);
    const songData = mockZzfxM.mock.calls[0][0];
    expect(songData).toBeDefined();
    expect(Array.isArray(songData)).toBe(true);
  });

  // --- MP3 playback tests ---

  describe('MP3 tracks', () => {
    it('level6 uses MP3 path, not ZzFXM', () => {
      MusicManager.play('level6');
      // MP3 tracks should NOT use ZzFXM rendering
      expect(mockZzfxM).not.toHaveBeenCalled();
      expect(mockZzfxPlay).not.toHaveBeenCalled();
      // Should create an Audio element with correct URL
      expect(audioInstances).toHaveLength(1);
      expect(audioInstances[0].src).toBe('audio/sector-9-overdrive.mp3');
      expect(audioInstances[0].play).toHaveBeenCalled();
      expect(MusicManager.getCurrentTrack()).toBe('level6');
      expect(MusicManager.isPlaying()).toBe(true);
    });

    it('preload creates Audio element for MP3 tracks', () => {
      MusicManager.preload('level6');
      expect(audioInstances).toHaveLength(1);
      expect(audioInstances[0].src).toBe('audio/sector-9-overdrive.mp3');
    });

    it('preload is a no-op for ZzFXM tracks', () => {
      MusicManager.preload('level1');
      expect(audioInstances).toHaveLength(0);
    });

    it('MP3 track loops', () => {
      MusicManager.play('level6');
      expect(audioInstances[0].loop).toBe(true);
    });

    it('MP3 track volume is set correctly', () => {
      MusicManager.play('level6');
      expect(audioInstances[0].volume).toBe(0.66);
    });

    it('MP3 track respects mute state', () => {
      SoundManager.setMuted(true);
      MusicManager.play('level6');
      // Audio element may be created but play() should not be called
      const audio = audioInstances[0];
      if (audio) {
        expect(audio.play).not.toHaveBeenCalled();
      }
      // Track should be logically set
      expect(MusicManager.getCurrentTrack()).toBe('level6');
      expect(MusicManager.isPlaying()).toBe(true);
    });

    it('MP3 track pauses on mute', () => {
      MusicManager.play('level6');
      MusicManager.onMuteChanged(true);
      expect(audioInstances[0].pause).toHaveBeenCalled();
    });

    it('MP3 track resumes on unmute', () => {
      MusicManager.play('level6');
      audioInstances[0].play.mockClear();
      MusicManager.onMuteChanged(true);
      MusicManager.onMuteChanged(false);
      expect(audioInstances[0].play).toHaveBeenCalled();
    });

    it('stop resets MP3 element', () => {
      MusicManager.play('level6');
      MusicManager.stop();
      expect(audioInstances[0].pause).toHaveBeenCalled();
      expect(audioInstances[0].currentTime).toBe(0);
      expect(MusicManager.getCurrentTrack()).toBeNull();
    });

    it('reuses cached Audio element on replay', () => {
      MusicManager.play('level6');
      MusicManager.stop();
      MusicManager.play('level6');
      // Should only create one Audio element (cached)
      expect(audioInstances).toHaveLength(1);
    });
  });
});
