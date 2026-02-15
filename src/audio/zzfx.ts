/**
 * ZzFX - Zuper Zmall Zound Zynth v1.3.1 by Frank Force
 * https://github.com/KilledByAPixel/ZzFX
 * MIT License
 *
 * Vendored and converted to TypeScript for pb-galaga.
 * This is a minimal procedural audio synth (~1KB) that generates
 * 8-bit sound effects from parameter arrays using WebAudio API.
 */

/** ZzFX parameter array type (20 elements). */
export type ZzFXParams = readonly number[];

/** Shared AudioContext — lazily created. */
let zzfxContext: AudioContext | undefined;

/** Master volume (0-1). */
let zzfxVolume = 0.3;

/**
 * Set the master volume.
 */
export function zzfxSetVolume(vol: number): void {
  zzfxVolume = vol;
}

/**
 * Play a ZzFX sound from parameters.
 * Returns the AudioBufferSourceNode (or undefined if no context).
 */
export function zzfx(...params: number[]): AudioBufferSourceNode | undefined {
  return zzfxPlay(zzfxGenerate(...params));
}

/**
 * Play a pre-generated audio buffer.
 */
export function zzfxPlay(buffer: number[]): AudioBufferSourceNode | undefined {
  if (!zzfxContext) {
    try {
      zzfxContext = new AudioContext();
    } catch {
      return undefined;
    }
  }

  const audioBuffer = zzfxContext.createBuffer(1, buffer.length, zzfxContext.sampleRate);
  const channelData = audioBuffer.getChannelData(0);
  for (let i = 0; i < buffer.length; i++) {
    channelData[i] = buffer[i];
  }

  const source = zzfxContext.createBufferSource();
  const gain = zzfxContext.createGain();
  gain.gain.value = zzfxVolume;
  source.buffer = audioBuffer;
  source.connect(gain);
  gain.connect(zzfxContext.destination);
  source.start();
  return source;
}

/**
 * Generate a ZzFX sound buffer from parameters.
 * Parameters: volume, randomness, frequency, attack, sustain, release,
 *   shape, shapeCurve, slide, deltaSlide, pitchJump, pitchJumpTime,
 *   repeatTime, noise, modulation, bitCrush, delay, sustainVolume,
 *   decay, tremolo
 */
export function zzfxGenerate(
  volume = 1,
  randomness = 0.05,
  frequency = 220,
  attack = 0,
  sustain = 0,
  release = 0.1,
  shape = 0,
  shapeCurve = 1,
  slide = 0,
  deltaSlide = 0,
  pitchJump = 0,
  pitchJumpTime = 0,
  repeatTime = 0,
  noise = 0,
  modulation = 0,
  bitCrush = 0,
  delay = 0,
  sustainVolume = 1,
  decay = 0,
  tremolo = 0,
): number[] {
  const sampleRate = 44100;
  const PI2 = Math.PI * 2;
  let startSlide = slide *= 500 * PI2 / sampleRate / sampleRate;
  let startFrequency = frequency *= (1 + randomness * 2 * Math.random() - randomness) * PI2 / sampleRate;
  let b: number[] = [];
  let t = 0;
  let tm = 0;
  let i = 0;
  let j = 1;
  let r = 0;
  let c = 0;
  let s = 0;
  let d: number;

  // Scale by sample rate
  attack = attack * sampleRate + 9;
  decay = decay * sampleRate + 9;
  sustain = sustain * sampleRate;
  release = release * sampleRate;
  delay = delay * sampleRate;
  deltaSlide *= 500 * PI2 / sampleRate ** 3;
  modulation *= PI2 / sampleRate;
  pitchJump *= PI2 / sampleRate;
  pitchJumpTime *= sampleRate;
  repeatTime = repeatTime * sampleRate | 0;

  const length = attack + decay + sustain + release + delay | 0;

  // Generate samples
  for (; i < length; b[i++] = s * volume) {
    if (++c >= 100) { // Bit crush
      c = 0;
      s = 0;
    }

    // Repeats
    if (repeatTime && !(++r % repeatTime)) {
      frequency = startFrequency;
      slide = startSlide;
      j = j || 1; // Reset pitch jump
    }

    // Pitch jump
    if (pitchJumpTime && !(j % pitchJumpTime)) {
      frequency += pitchJump;
      startFrequency += pitchJump;
      j = 0; // Stop pitch jump
    }

    // Slide
    frequency += slide += deltaSlide;

    // Oscillator
    t += frequency - frequency * noise * (Math.sin(i) ** 2 + 0.5);

    // Envelope
    const env =
      i < attack ? i / attack :
      i < attack + decay ? 1 + (sustainVolume - 1) * ((i - attack) / decay) :
      i < attack + decay + sustain ? sustainVolume :
      i < length - delay ? sustainVolume * (1 - ((i - attack - decay - sustain) / release)) :
      0;

    // Wave shape
    d = (
      shape === 0 ? Math.sin(t) : // Sine
      shape === 1 ? Math.sin(t) ** 3 : // Shaped sine
      shape === 2 ? ((t % PI2) > Math.PI ? -1 : 1) : // Square
      shape === 3 ? (((t % PI2) / PI2) * 2 - 1) : // Sawtooth
      Math.random() * 2 - 1 // Noise (shape >= 4)
    );

    // Tremolo
    d *= 1 - tremolo + tremolo * Math.sin(PI2 * i / sampleRate / (1 / (tremolo * 10 | 0)));

    // Modulation
    if (modulation) {
      tm += modulation;
      d *= Math.sin(tm);
    }

    // Bit crush
    if (bitCrush) {
      s += d * env - s;
      if (bitCrush >= 1) {
        // Only update every N samples
      }
    } else {
      s = d * env;
    }
  }

  return b;
}
