import { zzfxPlay } from './zzfx';
import { zzfxM, type ZzFXMSong } from './zzfxm';
import { SoundManager } from './SoundManager';

/** Available music tracks. */
export type MusicTrack = 'menu' | 'gameplay';

/**
 * Simple chiptune song data in ZzFXM format.
 * [instruments, patterns, sequence, bpm]
 *
 * Each instrument is a ZzFX param array.
 * Patterns contain [note, instrument, _] triples per row per channel.
 * Notes use MIDI-style numbering (60 = middle C).
 */

// Menu theme: slow, atmospheric, 2-channel, 90 BPM
const MENU_SONG: ZzFXMSong = [
  // Instruments
  [
    // 0: Soft pad (sine, slow attack)
    [0.3, 0, 220, 0.1, 0.3, 0.2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.7, 0.05, 0],
    // 1: Bass (square, punchy)
    [0.25, 0, 110, 0, 0.15, 0.1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.02, 0],
  ],
  // Patterns
  [
    // Pattern 0: Intro/verse
    [
      // Channel 0: Melody (pad)
      [60, 0, 0, 64, 0, 0, 67, 0, 0, 64, 0, 0, 60, 0, 0, 62, 0, 0, 65, 0, 0, 62, 0, 0],
      // Channel 1: Bass
      [48, 1, 0, 0, undefined, 0, 48, 1, 0, 0, undefined, 0, 45, 1, 0, 0, undefined, 0, 45, 1, 0, 0, undefined, 0],
    ],
    // Pattern 1: Variation
    [
      // Channel 0: Melody variation
      [65, 0, 0, 67, 0, 0, 69, 0, 0, 67, 0, 0, 65, 0, 0, 64, 0, 0, 62, 0, 0, 60, 0, 0],
      // Channel 1: Bass
      [41, 1, 0, 0, undefined, 0, 41, 1, 0, 0, undefined, 0, 43, 1, 0, 0, undefined, 0, 48, 1, 0, 0, undefined, 0],
    ],
  ],
  // Sequence (per channel)
  [
    [0, 1, 0, 1], // Channel 0 plays pattern 0, 1, 0, 1
    [0, 1, 0, 1], // Channel 1 plays pattern 0, 1, 0, 1
  ],
  90, // BPM
];

// Gameplay theme: fast, energetic, 2-channel, 140 BPM
const GAMEPLAY_SONG: ZzFXMSong = [
  // Instruments
  [
    // 0: Lead (shaped sine, bright)
    [0.3, 0, 440, 0, 0.1, 0.08, 1, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0.6, 0.02, 0],
    // 1: Bass (square, heavy)
    [0.3, 0, 110, 0, 0.1, 0.06, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.02, 0],
  ],
  // Patterns
  [
    // Pattern 0: Main riff
    [
      // Channel 0: Fast lead
      [72, 0, 0, 72, 0, 0, 74, 0, 0, 76, 0, 0, 79, 0, 0, 76, 0, 0, 74, 0, 0, 72, 0, 0],
      // Channel 1: Driving bass
      [48, 1, 0, 48, 1, 0, 48, 1, 0, 48, 1, 0, 50, 1, 0, 50, 1, 0, 52, 1, 0, 48, 1, 0],
    ],
    // Pattern 1: Bridge
    [
      // Channel 0: Bridge melody
      [76, 0, 0, 79, 0, 0, 81, 0, 0, 79, 0, 0, 76, 0, 0, 74, 0, 0, 72, 0, 0, 74, 0, 0],
      // Channel 1: Bridge bass
      [53, 1, 0, 53, 1, 0, 55, 1, 0, 55, 1, 0, 50, 1, 0, 50, 1, 0, 48, 1, 0, 48, 1, 0],
    ],
  ],
  // Sequence
  [
    [0, 0, 1, 0], // Channel 0
    [0, 0, 1, 0], // Channel 1
  ],
  140, // BPM
];

const TRACKS: Record<MusicTrack, ZzFXMSong> = {
  menu: MENU_SONG,
  gameplay: GAMEPLAY_SONG,
};

/**
 * Manages background music playback.
 * Uses ZzFXM to render chiptune songs from compact data arrays.
 * Shares mute state with SoundManager.
 */
export class MusicManager {
  private static currentTrack: MusicTrack | null = null;
  private static sourceNode: AudioBufferSourceNode | null = null;
  private static playing = false;

  /** Play a music track on loop. Stops any currently playing track first. */
  static play(track: MusicTrack): void {
    // Stop current if different track or not playing
    if (MusicManager.currentTrack !== track || !MusicManager.playing) {
      MusicManager.stop();
    } else {
      return; // Already playing this track
    }

    MusicManager.currentTrack = track;

    if (SoundManager.isMuted()) {
      MusicManager.playing = true;
      return; // Track is set but don't actually play audio
    }

    MusicManager.startPlayback(track);
  }

  /** Stop the current track. */
  static stop(): void {
    if (MusicManager.sourceNode) {
      try {
        MusicManager.sourceNode.stop();
      } catch {
        // Already stopped
      }
      MusicManager.sourceNode = null;
    }
    MusicManager.currentTrack = null;
    MusicManager.playing = false;
  }

  /** Get the currently active track (null if none). */
  static getCurrentTrack(): MusicTrack | null {
    return MusicManager.currentTrack;
  }

  /** Check if music is currently playing. */
  static isPlaying(): boolean {
    return MusicManager.playing;
  }

  /** Called when mute state changes — pause/resume music accordingly. */
  static onMuteChanged(muted: boolean): void {
    if (muted) {
      // Stop audio playback but remember track
      if (MusicManager.sourceNode) {
        try {
          MusicManager.sourceNode.stop();
        } catch {
          // Already stopped
        }
        MusicManager.sourceNode = null;
      }
    } else if (MusicManager.currentTrack && MusicManager.playing) {
      // Resume playback
      MusicManager.startPlayback(MusicManager.currentTrack);
    }
  }

  /** Reset to initial state. */
  static reset(): void {
    MusicManager.stop();
  }

  private static startPlayback(track: MusicTrack): void {
    const song = TRACKS[track];
    if (!song) return;

    try {
      const buffer = zzfxM(song);
      const node = zzfxPlay(buffer);
      if (node) {
        node.loop = true;
        MusicManager.sourceNode = node;
        MusicManager.playing = true;
      }
    } catch {
      // Silently fail if AudioContext unavailable (headless, etc.)
      MusicManager.playing = true; // Still mark as "playing" logically
    }
  }
}
