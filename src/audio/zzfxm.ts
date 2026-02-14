/**
 * ZzFXM - Zuper Zmall Zound Muzik v2.0.3 by Keith Clark and Frank Force
 * https://github.com/keithclark/ZzFXM
 * MIT License
 *
 * Vendored and converted to TypeScript for pb-galaga.
 * Tiny music renderer (~500 bytes) that plays multi-channel
 * chiptune patterns using ZzFX as its audio backend.
 */

import { zzfxGenerate, zzfxPlay } from './zzfx';

/**
 * ZzFXM song format types.
 * A song is: [instruments, patterns, sequence, bpm]
 * - instruments: array of ZzFX parameter arrays
 * - patterns: array of channel arrays, each channel is [note, instrument, ...]
 * - sequence: order of patterns to play
 * - bpm: beats per minute
 */
export type ZzFXMInstrument = (number | undefined)[];
export type ZzFXMPattern = (number | undefined)[][];
export type ZzFXMSong = [ZzFXMInstrument[], ZzFXMPattern[], number[][], number];

/**
 * Render a ZzFXM song to an audio buffer array (one per channel, interleaved).
 * Returns a merged mono buffer suitable for zzfxPlay().
 */
export function zzfxM(song: ZzFXMSong): number[] {
  const [instruments, patterns, sequence, bpm] = song;
  const samplesPerBeat = (bpm / 60 * 44100 / 4) | 0; // samples per row
  const songLength = sequence[0].length;
  const channelCount = patterns[0]?.length ?? 0;

  // Output buffers per channel
  const channelBuffers: number[][] = [];
  for (let c = 0; c < channelCount; c++) {
    channelBuffers.push([]);
  }

  // Track state per channel
  const channelState: { note: number; instrument: number }[] = [];
  for (let c = 0; c < channelCount; c++) {
    channelState.push({ note: 0, instrument: 0 });
  }

  // Render each pattern in sequence
  for (let seqIdx = 0; seqIdx < songLength; seqIdx++) {
    for (let c = 0; c < channelCount; c++) {
      const patternIdx = sequence[c][seqIdx];
      const pattern = patterns[patternIdx];
      if (!pattern || !pattern[c]) continue;

      const channel = pattern[c];
      const rowCount = channel.length / 3 | 0; // each row: note, instrument, _

      for (let row = 0; row < rowCount; row++) {
        const note = channel[row * 3];
        const inst = channel[row * 3 + 1];

        if (note !== undefined && note > 0 && inst !== undefined) {
          // Get instrument params and modify frequency for note
          const params = [...(instruments[inst] || [])];
          // param[2] is frequency — scale by note (semitone-based)
          const baseFreq = params[2] || 220;
          params[2] = baseFreq * (2 ** ((note - 60) / 12));

          const samples = zzfxGenerate(...params as number[]);
          const trimmed = samples.slice(0, samplesPerBeat);

          // Write samples into channel buffer at correct position
          const offset = channelBuffers[c].length;
          const padTo = (seqIdx * rowCount + row) * samplesPerBeat;

          // Pad with silence if needed
          while (channelBuffers[c].length < padTo) {
            channelBuffers[c].push(0);
          }

          for (let s = 0; s < trimmed.length; s++) {
            if (channelBuffers[c].length <= padTo + s) {
              channelBuffers[c].push(trimmed[s]);
            } else {
              channelBuffers[c][padTo + s] += trimmed[s];
            }
          }
        } else {
          // Silence for this row — pad
          const padTo = (seqIdx * rowCount + row + 1) * samplesPerBeat;
          while (channelBuffers[c].length < padTo) {
            channelBuffers[c].push(0);
          }
        }
      }
    }
  }

  // Mix all channels into mono
  const maxLen = Math.max(...channelBuffers.map(b => b.length), 0);
  const mixed: number[] = new Array(maxLen).fill(0);
  for (const buf of channelBuffers) {
    for (let i = 0; i < buf.length; i++) {
      mixed[i] += buf[i];
    }
  }

  // Normalize to prevent clipping
  if (channelCount > 1) {
    const scale = 1 / channelCount;
    for (let i = 0; i < mixed.length; i++) {
      mixed[i] *= scale;
    }
  }

  return mixed;
}
