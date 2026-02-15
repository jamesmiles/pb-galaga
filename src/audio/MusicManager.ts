import { zzfxPlay } from './zzfx';
import { zzfxM, type ZzFXMSong } from './zzfxm';
import { SoundManager } from './SoundManager';

/** Available music tracks. */
export type MusicTrack = 'menu' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5';

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

// Level 1 theme: airy space synth, 3-channel, 105 BPM
// Pentatonic scale (C-D-E-G-A) for a dreamy, open feel
const LEVEL1_SONG: ZzFXMSong = [
  // Instruments
  [
    // 0: Warm sine pad (slow attack, long sustain for atmospheric feel)
    [0.25, 0, 220, 0.12, 0.35, 0.25, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.6, 0.08, 0],
    // 1: Deep sub-bass (sine, gentle pulse)
    [0.2, 0, 55, 0.02, 0.2, 0.15, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.04, 0],
    // 2: Soft arpeggiated shimmer (shaped sine, light tremolo)
    [0.15, 0, 440, 0.01, 0.1, 0.12, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.4, 0.03, 0.3],
  ],
  // Patterns — pentatonic MIDI: C=60, D=62, E=64, G=67, A=69
  [
    // Pattern 0: Floating pad + bass pulse
    [
      // Channel 0: Pad (long notes with rests)
      [60, 0, 0, 0, undefined, 0, 64, 0, 0, 0, undefined, 0, 67, 0, 0, 0, undefined, 0, 64, 0, 0, 0, undefined, 0],
      // Channel 1: Sub-bass
      [48, 1, 0, 0, undefined, 0, 48, 1, 0, 0, undefined, 0, 43, 1, 0, 0, undefined, 0, 45, 1, 0, 0, undefined, 0],
      // Channel 2: Shimmer arpeggio
      [72, 2, 0, 0, undefined, 0, 76, 2, 0, 0, undefined, 0, 79, 2, 0, 0, undefined, 0, 76, 2, 0, 0, undefined, 0],
    ],
    // Pattern 1: Rising variation
    [
      // Channel 0: Higher pad melody
      [64, 0, 0, 0, undefined, 0, 67, 0, 0, 0, undefined, 0, 69, 0, 0, 0, undefined, 0, 67, 0, 0, 0, undefined, 0],
      // Channel 1: Walking bass
      [45, 1, 0, 0, undefined, 0, 43, 1, 0, 0, undefined, 0, 48, 1, 0, 0, undefined, 0, 45, 1, 0, 0, undefined, 0],
      // Channel 2: Shimmer variation
      [79, 2, 0, 0, undefined, 0, 81, 2, 0, 0, undefined, 0, 84, 2, 0, 0, undefined, 0, 79, 2, 0, 0, undefined, 0],
    ],
    // Pattern 2: Sparse breathing room
    [
      // Channel 0: Minimal pad
      [60, 0, 0, 0, undefined, 0, 0, undefined, 0, 0, undefined, 0, 62, 0, 0, 0, undefined, 0, 0, undefined, 0, 0, undefined, 0],
      // Channel 1: Sub-bass octave
      [36, 1, 0, 0, undefined, 0, 0, undefined, 0, 0, undefined, 0, 40, 1, 0, 0, undefined, 0, 0, undefined, 0, 0, undefined, 0],
      // Channel 2: Gentle arpeggiation
      [72, 2, 0, 0, undefined, 0, 0, undefined, 0, 0, undefined, 0, 74, 2, 0, 0, undefined, 0, 0, undefined, 0, 0, undefined, 0],
    ],
  ],
  // Sequence
  [
    [0, 0, 1, 2, 0, 1], // Channel 0
    [0, 0, 1, 2, 0, 1], // Channel 1
    [0, 0, 1, 2, 0, 1], // Channel 2
  ],
  105, // BPM — spacious and airy
];

// Level 2 theme: upbeat rock, 3-channel, 130 BPM
// Driving rhythm with power chord melody
const LEVEL2_SONG: ZzFXMSong = [
  // Instruments
  [
    // 0: Overdriven guitar (sawtooth, punchy)
    [0.4, 0, 220, 0.01, 0.15, 0.1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.7, 0.02, 0],
    // 1: Bass guitar (square, deep)
    [0.3, 0, 110, 0.01, 0.2, 0.12, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.6, 0.03, 0],
    // 2: Drums (noise-based percussion)
    [0.35, 0, 100, 0, 0.02, 0.05, 4, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0.3, 0.01, 0],
  ],
  // Patterns
  [
    // Pattern 0: Driving verse
    [
      // Channel 0: Power chord melody
      [64, 0, 0, 67, 0, 0, 71, 0, 0, 67, 0, 0, 64, 0, 0, 69, 0, 0, 67, 0, 0, 64, 0, 0],
      // Channel 1: Bass guitar
      [40, 1, 0, 0, undefined, 0, 40, 1, 0, 0, undefined, 0, 45, 1, 0, 0, undefined, 0, 43, 1, 0, 0, undefined, 0],
      // Channel 2: Drums
      [60, 2, 0, 0, undefined, 0, 60, 2, 0, 60, 2, 0, 60, 2, 0, 0, undefined, 0, 60, 2, 0, 60, 2, 0],
    ],
    // Pattern 1: Chorus
    [
      // Channel 0: Higher energy melody
      [71, 0, 0, 72, 0, 0, 74, 0, 0, 72, 0, 0, 69, 0, 0, 67, 0, 0, 64, 0, 0, 67, 0, 0],
      // Channel 1: Driving bass
      [45, 1, 0, 45, 1, 0, 43, 1, 0, 0, undefined, 0, 40, 1, 0, 40, 1, 0, 43, 1, 0, 0, undefined, 0],
      // Channel 2: Drums
      [60, 2, 0, 60, 2, 0, 60, 2, 0, 0, undefined, 0, 60, 2, 0, 60, 2, 0, 60, 2, 0, 60, 2, 0],
    ],
  ],
  // Sequence
  [
    [0, 1, 0, 1], // Channel 0
    [0, 1, 0, 1], // Channel 1
    [0, 1, 0, 1], // Channel 2
  ],
  130, // BPM
];

// Level 3 theme: crazy synth, 3-channel, 140 BPM
// Rapid arpeggios, chromatic runs, off-beat patterns
const LEVEL3_SONG: ZzFXMSong = [
  // Instruments
  [
    // 0: Arpeggiated synth (detuned square, fast)
    [0.3, 0.1, 440, 0, 0.08, 0.06, 2, 1, 0.5, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.01, 0],
    // 1: Wobble bass (frequency-modulated)
    [0.35, 0, 80, 0.02, 0.2, 0.15, 0, 1, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0.6, 0.04, 0],
    // 2: Fast hi-hats (noise, short)
    [0.2, 0, 200, 0, 0.01, 0.02, 4, 1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0.2, 0, 0],
  ],
  // Patterns
  [
    // Pattern 0: Arpeggio frenzy
    [
      // Channel 0: Rapid arpeggios (chromatic)
      [72, 0, 0, 75, 0, 0, 79, 0, 0, 82, 0, 0, 79, 0, 0, 75, 0, 0, 73, 0, 0, 70, 0, 0],
      // Channel 1: Wobble bass
      [36, 1, 0, 0, undefined, 0, 36, 1, 0, 0, undefined, 0, 39, 1, 0, 0, undefined, 0, 34, 1, 0, 0, undefined, 0],
      // Channel 2: Hi-hats
      [80, 2, 0, 80, 2, 0, 80, 2, 0, 80, 2, 0, 80, 2, 0, 80, 2, 0, 80, 2, 0, 80, 2, 0],
    ],
    // Pattern 1: Chromatic run variation
    [
      // Channel 0: Descending chromatic run
      [84, 0, 0, 82, 0, 0, 80, 0, 0, 78, 0, 0, 76, 0, 0, 74, 0, 0, 72, 0, 0, 75, 0, 0],
      // Channel 1: Off-beat bass
      [0, undefined, 0, 39, 1, 0, 0, undefined, 0, 36, 1, 0, 0, undefined, 0, 34, 1, 0, 0, undefined, 0, 36, 1, 0],
      // Channel 2: Hi-hat syncopation
      [80, 2, 0, 0, undefined, 0, 80, 2, 0, 80, 2, 0, 0, undefined, 0, 80, 2, 0, 80, 2, 0, 0, undefined, 0],
    ],
  ],
  // Sequence
  [
    [0, 1, 0, 1], // Channel 0
    [0, 1, 0, 1], // Channel 1
    [0, 1, 0, 1], // Channel 2
  ],
  140, // BPM
];

// Level 4 theme: drum and bass, 3-channel, 165 BPM
// Syncopated patterns, sub bass hits, fast snare rolls
const LEVEL4_SONG: ZzFXMSong = [
  // Instruments
  [
    // 0: Stabby synth (sawtooth, sharp attack)
    [0.35, 0, 330, 0, 0.05, 0.04, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.01, 0],
    // 1: Deep sub bass (sine, heavy)
    [0.4, 0, 55, 0.01, 0.25, 0.2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.7, 0.05, 0],
    // 2: Breakbeat drums (noise, varied)
    [0.3, 0, 150, 0, 0.02, 0.03, 4, 1, 0, 0, 0, 0, 0, 2.5, 0, 0, 0, 0.3, 0.01, 0],
  ],
  // Patterns
  [
    // Pattern 0: Syncopated stabs + sub bass
    [
      // Channel 0: Stabby synth (syncopated)
      [72, 0, 0, 0, undefined, 0, 75, 0, 0, 72, 0, 0, 0, undefined, 0, 77, 0, 0, 72, 0, 0, 0, undefined, 0],
      // Channel 1: Sub bass hits
      [36, 1, 0, 0, undefined, 0, 0, undefined, 0, 36, 1, 0, 0, undefined, 0, 0, undefined, 0, 34, 1, 0, 0, undefined, 0],
      // Channel 2: Fast breakbeat
      [60, 2, 0, 60, 2, 0, 0, undefined, 0, 60, 2, 0, 60, 2, 0, 60, 2, 0, 0, undefined, 0, 60, 2, 0],
    ],
    // Pattern 1: Snare roll + bass drop
    [
      // Channel 0: Ascending stabs
      [75, 0, 0, 77, 0, 0, 79, 0, 0, 0, undefined, 0, 82, 0, 0, 79, 0, 0, 77, 0, 0, 75, 0, 0],
      // Channel 1: Heavy sub bass
      [36, 1, 0, 36, 1, 0, 0, undefined, 0, 0, undefined, 0, 34, 1, 0, 34, 1, 0, 0, undefined, 0, 36, 1, 0],
      // Channel 2: Fast snare rolls
      [60, 2, 0, 60, 2, 0, 60, 2, 0, 60, 2, 0, 60, 2, 0, 60, 2, 0, 60, 2, 0, 60, 2, 0],
    ],
  ],
  // Sequence
  [
    [0, 1, 0, 1], // Channel 0
    [0, 1, 0, 1], // Channel 1
    [0, 1, 0, 1], // Channel 2
  ],
  165, // BPM
];

// Level 5 theme: epic boss battle, 3-channel, 175 BPM
// Aggressive stabs, heavy bass drops, relentless rhythm
const LEVEL5_SONG: ZzFXMSong = [
  // Instruments
  [
    // 0: Aggressive lead synth (square, distorted)
    [0.4, 0.1, 330, 0, 0.06, 0.05, 2, 1, 0.3, 0, 0, 0, 0, 0, 0, 0, 0, 0.6, 0.02, 0],
    // 1: Heavy sub bass (sine, punishing)
    [0.45, 0, 55, 0.01, 0.3, 0.25, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.7, 0.06, 0],
    // 2: Rapid snare/kick (noise, aggressive)
    [0.35, 0, 120, 0, 0.02, 0.04, 4, 1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0.3, 0.01, 0],
  ],
  // Patterns
  [
    // Pattern 0: Boss approach — menacing stabs
    [
      // Channel 0: Stabby lead
      [72, 0, 0, 72, 0, 0, 0, undefined, 0, 75, 0, 0, 72, 0, 0, 0, undefined, 0, 79, 0, 0, 77, 0, 0],
      // Channel 1: Pounding bass
      [36, 1, 0, 0, undefined, 0, 36, 1, 0, 0, undefined, 0, 34, 1, 0, 34, 1, 0, 36, 1, 0, 0, undefined, 0],
      // Channel 2: Relentless drums
      [60, 2, 0, 60, 2, 0, 60, 2, 0, 0, undefined, 0, 60, 2, 0, 60, 2, 0, 60, 2, 0, 60, 2, 0],
    ],
    // Pattern 1: Battle intensity — chromatic chaos
    [
      // Channel 0: Aggressive chromatic riffs
      [79, 0, 0, 77, 0, 0, 75, 0, 0, 77, 0, 0, 82, 0, 0, 79, 0, 0, 75, 0, 0, 72, 0, 0],
      // Channel 1: Heavy drops
      [36, 1, 0, 36, 1, 0, 0, undefined, 0, 34, 1, 0, 36, 1, 0, 0, undefined, 0, 39, 1, 0, 36, 1, 0],
      // Channel 2: Double-time hits
      [60, 2, 0, 60, 2, 0, 60, 2, 0, 60, 2, 0, 60, 2, 0, 60, 2, 0, 60, 2, 0, 60, 2, 0],
    ],
  ],
  // Sequence
  [
    [0, 1, 0, 1], // Channel 0
    [0, 1, 0, 1], // Channel 1
    [0, 1, 0, 1], // Channel 2
  ],
  175, // BPM — intense boss battle
];

const TRACKS: Record<MusicTrack, ZzFXMSong> = {
  menu: MENU_SONG,
  level1: LEVEL1_SONG,
  level2: LEVEL2_SONG,
  level3: LEVEL3_SONG,
  level4: LEVEL4_SONG,
  level5: LEVEL5_SONG,
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
