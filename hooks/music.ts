import type { Orchestra } from '../types'

import { generator, traitsOf } from './cast.ts'
import type { Traits } from './cast.ts'

const RATE = 22050
const TAU = Math.PI * 2

const SCALES = [
  [0, 3, 5, 7, 10, 12, 15, 17],
  [0, 1, 3, 5, 7, 8, 10, 12],
  [0, 2, 3, 5, 7, 8, 11, 12],
  [0, 2, 4, 6, 8, 10, 12, 14],
  [0, 3, 5, 6, 7, 10, 12, 15],
  [0, 1, 4, 5, 7, 8, 10, 12],
]

const ROOTS = [110, 116.54, 123.47, 130.81, 146.83]

const SCALE_NAMES = ['minor pentatonic', 'Phrygian', 'harmonic minor', 'whole tone', 'blues', 'Phrygian dominant']
const ROOT_SEMITONES = [9, 10, 11, 0, 2]
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export type Key = { scale: number; root: number; beat: number }

export const keyOf = (salt: number): Key => ({
  scale: salt % SCALES.length,
  root: (salt >>> 3) % ROOTS.length,
  beat: 0.16 + ((salt >>> 7) % 8) * 0.02,
})

export const noteName = (key: Key, degree: number) =>
  NOTE_NAMES[(ROOT_SEMITONES[key.root] + SCALES[key.scale][degree]) % 12]

export const describeKey = (key: Key) =>
  `${NOTE_NAMES[ROOT_SEMITONES[key.root]]} ${SCALE_NAMES[key.scale]} · ${Math.round(30 / key.beat)} bpm`

let next = Math.random

const random = (min: number, max: number) => min + next() * (max - min)
const chance = (probability: number) => next() < probability
const choose = <T>(list: T[]) => list[Math.floor(next() * list.length)]
const noise = () => next() * 2 - 1
const clampDegree = (degree: number) => Math.max(0, Math.min(7, degree))

type Note = { start: number; length: number; degree: number }
type Piece = { scale: number[]; root: number; beat: number; notes: Note[]; seconds: number }

const motif = (score: number[], limit: number) => {
  const source = score.length > 0 ? score.slice(-limit) : [2, 3, 4, 2]
  const notes = [...source]
  while (notes.length < 16) {
    const shift = choose([-1, 0, 0, 1])
    notes.push(...source.map(degree => clampDegree(degree + shift)))
  }

  return notes.slice(0, Math.max(16, source.length))
}

const compose = (score: number[], limit: number, key?: Key): Piece => {
  const beat = key ? key.beat : random(0.14, 0.3)
  const notes: Note[] = []
  let time = 0

  for (const degree of motif(score, limit)) {
    const roll = next()
    if (roll < 0.1) {
      time += beat
      continue
    }
    if (roll < 0.4) {
      notes.push({ start: time, length: beat / 2, degree })
      notes.push({ start: time + beat / 2, length: beat / 2, degree: clampDegree(degree + choose([-1, 1, 2])) })
      time += beat
      continue
    }
    const length = roll < 0.5 ? beat * 1.5 : beat
    notes.push({ start: time, length, degree })
    time += length
  }

  const scale = key ? SCALES[key.scale] : choose(SCALES)
  const root = key ? ROOTS[key.root] : choose(ROOTS)

  return { scale, root, beat, notes, seconds: time }
}

const frequency = (piece: Piece, degree: number, octave: number) =>
  piece.root * 2 ** ((piece.scale[clampDegree(degree)] + 12 * octave) / 12)

const envelope = (t: number, length: number, attack: number, release: number) =>
  Math.min(1, t / attack) * Math.min(1, Math.max(0, (length - t) / release))

const saw = (phase: number) => 2 * (phase % 1) - 1
const square = (phase: number, width = 0.5) => (phase % 1 < width ? 1 : -1)

type Voice = { sound: (f: number, t: number, length: number, vibrato: number) => number; brightness: number; tail: number }

const VOICES: Record<string, Voice> = {
  violin: {
    sound: (f, t, n, v) => 0.45 * saw(f * t + 0.03 * v * Math.sin(TAU * 5.5 * t)) * envelope(t, n, 0.06, 0.08),
    brightness: 0.35,
    tail: 0,
  },
  cello: {
    sound: (f, t, n) => 0.5 * (0.6 * saw((f / 2) * t) + 0.4 * saw((f / 2) * 1.004 * t)) * envelope(t, n, 0.09, 0.1),
    brightness: 0.12,
    tail: 0,
  },
  trumpet: {
    sound: (f, t, n) => 0.32 * square(f * t * (1 - 0.04 * Math.exp(-t * 30)), 0.3) * envelope(t, n, 0.03, 0.05),
    brightness: 0.4,
    tail: 0,
  },
  accordion: {
    sound: (f, t, n) =>
      0.2 * (square(f * t) + square(f * 1.007 * t)) * (0.8 + 0.2 * Math.sin(TAU * 6 * t)) * envelope(t, n, 0.04, 0.05),
    brightness: 0.25,
    tail: 0,
  },
  flute: {
    sound: (f, t, n, v) =>
      0.4 * (Math.sin(TAU * (2 * f * t + 0.012 * v * Math.sin(TAU * 5 * t))) + 0.12 * noise()) * envelope(t, n, 0.08, 0.1),
    brightness: 1,
    tail: 0,
  },
  guitar: {
    sound: (f, t) => {
      let sample = 0
      for (let k = 1; k <= 5; k++) sample += (Math.sin(TAU * k * f * t) / k) * Math.exp(-t * (3 + 2 * k))
      return 0.45 * sample
    },
    brightness: 1,
    tail: 0.4,
  },
  sax: {
    sound: (f, t, n, v) =>
      0.3 * (square(f * t + 0.01 * v * Math.sin(TAU * 5 * t), 0.4) + 0.6 * saw(f * t) + 0.15 * noise()) * envelope(t, n, 0.04, 0.06),
    brightness: 0.3,
    tail: 0,
  },
  theremin: {
    sound: (f, t, n, v) => 0.45 * Math.sin(TAU * (f * t + 0.08 * v * Math.sin(TAU * 6.5 * t))) * envelope(t, n, 0.12, 0.12),
    brightness: 1,
    tail: 0.1,
  },
  saw: {
    sound: (f, t, n, v) =>
      0.4 * (Math.sin(TAU * (2 * f * t + 0.15 * v * Math.sin(TAU * 3.5 * t))) + 0.05 * noise()) * envelope(t, n, 0.15, 0.15),
    brightness: 1,
    tail: 0.15,
  },
  keytar: {
    sound: (f, t, n) => 0.3 * square(f * (Math.floor(t * 18) % 2 ? 2 : 1) * t, 0.25) * envelope(t, n, 0.005, 0.03),
    brightness: 0.5,
    tail: 0,
  },
  synth: {
    sound: (f, t, n) =>
      0.45 * Math.sin(TAU * f * t + 2 * Math.exp(-t * 4) * Math.sin(TAU * 2 * f * t)) * envelope(t, n, 0.005, 0.05),
    brightness: 1,
    tail: 0.2,
  },
}

const lowpass = (buffer: Float32Array, amount: number) => {
  let previous = 0
  for (let i = 0; i < buffer.length; i++) {
    previous += amount * (buffer[i] - previous)
    buffer[i] = previous
  }
}

const addInto = (mix: Float32Array, buffer: Float32Array, gain: number) => {
  for (let i = 0; i < mix.length; i++) mix[i] += buffer[i] * gain
}

const renderVoice = (piece: Piece, voice: Voice, part: number, traits: Pick<Traits, 'octave' | 'detune' | 'vibrato'>, length: number) => {
  const buffer = new Float32Array(length)
  for (const note of piece.notes) {
    const degree = part === 1 ? note.degree - 2 : note.degree
    const f = frequency(piece, degree, (part === 2 ? 0 : 1) + traits.octave) * (1 + traits.detune)
    const noteLength = note.length + voice.tail
    const start = Math.floor(note.start * RATE)
    for (let i = 0; i < noteLength * RATE && start + i < length; i++) {
      buffer[start + i] += voice.sound(f, i / RATE, noteLength, traits.vibrato)
    }
  }
  if (voice.brightness < 1) lowpass(buffer, voice.brightness)

  return buffer
}

type Hit = (t: number, f: number) => number

const HITS: Record<string, { hit: Hit; onBeat: (step: number) => boolean; density: number }> = {
  barrel: {
    hit: t => 0.9 * Math.sin(TAU * (40 + 110 * Math.exp(-t * 25)) * t) * Math.exp(-t * 9),
    onBeat: step => step % 8 === 0,
    density: 0.18,
  },
  lids: { hit: t => 0.3 * noise() * Math.exp(-t * 5), onBeat: step => step % 16 === 0, density: 0.06 },
  buckets: {
    hit: t => 0.55 * (0.6 * noise() + 0.4 * Math.sin(TAU * 190 * t)) * Math.exp(-t * 18),
    onBeat: step => step % 8 === 4,
    density: 0.12,
  },
  pipes: {
    hit: (t, f) => 0.3 * Math.sin(TAU * f * t + 2.5 * Math.exp(-t * 6) * Math.sin(TAU * f * 1.41 * t)) * Math.exp(-t * 5),
    onBeat: step => step % 4 === 2,
    density: 0.3,
  },
  gong: {
    hit: t =>
      0.35 * Math.exp(-t * 2) * [1, 1.48, 2.1, 2.9].reduce((sum, ratio) => sum + Math.sin(TAU * 85 * ratio * t) / ratio, 0),
    onBeat: step => step % 32 === 0,
    density: 0.02,
  },
  cans: { hit: t => 0.22 * noise() * Math.exp(-t * 40), onBeat: step => step % 2 === 1, density: 0.5 },
  tire: {
    hit: t => 0.7 * (Math.sin(TAU * 60 * t) * Math.exp(-t * 20) + 0.5 * noise() * Math.exp(-t * 50)),
    onBeat: () => false,
    density: 0.3,
  },
}

const renderPercussion = (piece: Piece, name: string, length: number) => {
  const { hit, onBeat, density } = HITS[name]
  const buffer = new Float32Array(length)
  const step = piece.beat / 2
  const hitLength = Math.floor(1.2 * RATE)

  for (let index = 0; index * step < piece.seconds; index++) {
    if (!onBeat(index) && !chance(density)) continue
    const f = frequency(piece, Math.floor(random(0, 8)), 2)
    const start = Math.floor(index * step * RATE)
    for (let i = 0; i < hitLength && start + i < length; i++) buffer[start + i] += hit(i / RATE, f)
  }

  return buffer
}

const renderDrone = (piece: Piece, length: number) => {
  const buffer = new Float32Array(length)
  const f = piece.root / 2
  for (let i = 0; i < length; i++) {
    const t = i / RATE
    buffer[i] = 0.18 * (saw(f * t) + saw(f * 1.006 * t)) * Math.min(1, t / 0.8)
  }
  lowpass(buffer, 0.05)

  return buffer
}

const glitch = (mix: Float32Array, piece: Piece, amount: number) => {
  const segment = Math.floor((piece.beat / 2) * RATE)

  for (let start = 0; start + segment < mix.length; start += segment) {
    const roll = next() / amount
    if (roll < 0.12) {
      const slice = mix.slice(start, start + Math.floor(segment / 4))
      for (let i = 0; i < segment; i++) mix[start + i] = slice[i % slice.length]
    } else if (roll < 0.2) {
      mix.subarray(start, start + segment).reverse()
    } else if (roll < 0.34) {
      const hold = Math.floor(random(2, 10))
      const levels = 2 ** Math.floor(random(2, 5))
      for (let i = 0; i < segment; i++) {
        const held = mix[start + i - (i % hold)]
        mix[start + i] = Math.round(held * levels) / levels
      }
    } else if (roll < 0.4) {
      mix.fill(0, start + Math.floor(segment / 3), start + segment)
    } else if (roll < 0.5) {
      const f = random(30, 90)
      for (let i = 0; i < segment; i++) mix[start + i] *= Math.sin((TAU * f * i) / RATE)
    }
  }

  for (let i = 0; i < mix.length; i++) {
    if (chance(0.0004 * amount)) mix[i] += noise() * 0.4
  }

  if (chance(amount)) tapeStop(mix, Math.floor(0.7 * RATE))
}

const tapeStop = (mix: Float32Array, length: number) => {
  const from = Math.max(0, mix.length - length)
  const source = mix.slice(from)
  let position = 0
  for (let i = 0; i < source.length; i++) {
    const speed = 1 - i / source.length
    mix[from + i] = source[Math.floor(position)] ?? 0
    position += speed
  }
}

const master = (mix: Float32Array, drive: number) => {
  let peak = 0
  for (let i = 0; i < mix.length; i++) {
    mix[i] = Math.tanh(mix[i] * drive) / Math.tanh(drive)
    peak = Math.max(peak, Math.abs(mix[i]))
  }
  const gain = peak > 0 ? 0.9 / peak : 1
  for (let i = 0; i < mix.length; i++) mix[i] *= gain
}

export const synthesize = (o: Orchestra, options: { limit?: number } = {}): Float32Array => {
  next = generator(o.salt)
  const piece = compose(o.score, options.limit ?? 16, keyOf(o.salt))
  const length = Math.floor((piece.seconds + 0.6) * RATE)
  const mix = new Float32Array(length)
  const melodic = Math.min(o.violins, 8)
  const percussion = Math.min(o.drums, 5)

  if (melodic === 0) addInto(mix, renderVoice(piece, VOICES.synth, 0, { octave: 0, detune: 0, vibrato: 1 }, length), 0.6)
  for (let index = 0; index < melodic; index++) {
    const traits = traitsOf('melodic', index, o.salt)
    addInto(mix, renderVoice(piece, VOICES[traits.instrument], index % 3, traits, length), 0.7 / Math.sqrt(melodic))
  }
  for (let index = 0; index < percussion; index++) {
    addInto(mix, renderPercussion(piece, traitsOf('percussion', index, o.salt).instrument, length), 0.6)
  }
  if (o.conductors > 0) addInto(mix, renderDrone(piece, length), 1)

  const amount = Math.min(0.95, 0.35 + 0.1 * o.ovations + 0.25 * Math.min(o.conductors, 2))
  glitch(mix, piece, amount)
  master(mix, 1.5 + amount)

  return mix
}

export const toWav = (samples: Float32Array): Uint8Array => {
  const bytes = new Uint8Array(44 + samples.length * 2)
  const view = new DataView(bytes.buffer)
  const text = (offset: number, value: string) =>
    [...value].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)))

  text(0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  text(8, 'WAVE')
  text(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, RATE, true)
  view.setUint32(28, RATE * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  text(36, 'data')
  view.setUint32(40, samples.length * 2, true)
  samples.forEach((s, i) => view.setInt16(44 + i * 2, Math.round(32767 * Math.max(-1, Math.min(1, s))), true))

  return bytes
}
