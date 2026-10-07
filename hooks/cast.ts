import { DYSTOPIAN } from './dystopian.ts'
import { JAZZ } from './jazz.ts'
import { PX, dots, hop, pixels, twoFrames } from './pixel.ts'
import type { Cast, Rarity, Sprite } from './pixel.ts'
import type { Theme } from './themes.ts'

export { PX, pixels }

const CASTS: Record<Theme, Cast> = { dystopian: DYSTOPIAN, jazz: JAZZ }

const keys = <T>(record: Record<string, T>) => Object.keys(record)

const hash = (...parts: number[]) => {
  let h = 2166136261
  for (const part of parts) {
    h = Math.imul(h ^ part, 16777619)
    h = Math.imul(h ^ (h >>> 13), 0x5bd1e995)
    h ^= h >>> 15
  }
  return h >>> 0
}

export const generator = (seed: number) => {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Section = 'melodic' | 'percussion' | 'dancer'
export type Role = Section | 'conductor'

export type Traits = {
  instrument: string
  head: string
  body: string
  accessory: string
  style: string
  rarity: Rarity
  octave: number
  detune: number
  vibrato: number
}

export const traitsOf = (role: Section, index: number, salt: number, theme: Theme): Traits => {
  const cast = CASTS[theme]
  const next = generator(hash(salt, { melodic: 1, percussion: 2, dancer: 3 }[role], index))
  const pick = <T>(list: T[]) => list[Math.floor(next() * list.length)]
  const roll = next()
  const rarity = roll < 0.05 ? 'legendary' : roll < 0.2 ? 'rare' : 'common'
  const style = cast.style(next, rarity)

  const randomInstrument = pick(keys(role === 'melodic' ? cast.melodic : cast.percussion))
  const lineupInstrument = role === 'melodic' ? cast.lineup[index] : undefined

  return {
    instrument: lineupInstrument ?? randomInstrument,
    head: pick(keys(cast.heads)),
    body: pick(keys(cast.bodies)),
    accessory: next() < 0.35 ? 'none' : pick(keys(cast.accessories).slice(1)),
    style,
    rarity,
    octave: pick([-1, 0, 0, 0, 1]),
    detune: (next() - 0.5) * 0.012,
    vibrato: 0.5 + next() * 1.5,
  }
}

export const sprites = (theme: Theme) => {
  const cast = CASTS[theme]

  return (
    keys(cast.heads).map(name => `<g id="head-${name}">${pixels(cast.heads[name])}</g>`).join('') +
    keys(cast.bodies).map(name => `<g id="body-${name}">${pixels(cast.bodies[name], 0, 9)}</g>`).join('') +
    cast.conductors.map((conductor, i) => `<g id="sp-conductor-${i}">${pixels(conductor.sprite)}</g>`).join('')
  )
}

const conductorIndex = (salt: number, theme: Theme) =>
  Math.floor(generator(hash(salt, 4))() * CASTS[theme].conductors.length)

export const conductorOf = (salt: number, theme: Theme) => CASTS[theme].conductors[conductorIndex(salt, theme)]

const conductorStyle = (salt: number, theme: Theme) => CASTS[theme].style(generator(hash(salt, 5)), 'common')

export const isDancerInGown = (index: number, salt: number) => generator(hash(salt, 6, index))() < 0.4

const GOWN_SPIN_A: Sprite = ['...kaaaak...', '..kaAaaAak..', '..kaaaaaak..', '...kaaaak...', '..kaaaaaak..', '..kaAaaaak..', '.kaaaaaaaak.', 'kaaaAaaaaaak', 'kkkkkkkkkkkk']
const GOWN_SPIN_B: Sprite = ['...kaaaak...', '..kaAaaAak..', '..kaaaaaak..', '...kaaaak...', '...kaaaaak..', '...kaaAaaak.', '..kaaaaaaaak', '.kaaaaAaaaak', '.kkkkkkkkkkk']

const DANCE_ARMS_UP: Sprite = ['..kaaaaaak..', '.kaAaaaaAak.', '.kaaaaaaaak.', '..kaaaaaak..', '..kaaaaaak..', '.kaak..kaak.', '.kmk....kmk.', 'kmk......kmk', 'kk........kk']
const DANCE_KICK: Sprite = ['..kaaaaaak..', '.kaAaaaaAak.', '.kaaaaaaaak.', '..kaaaaaak..', '..kaaaaaak..', '..kaaaaaak..', '..kmk.kmmk..', '..kmk..kk...', '..kk........']

const armsUp = dots([[1, 9], [0, 8], [-1, 7], [10, 9], [11, 8], [12, 7]], 'a') + dots([[-1, 6], [12, 6]], 's')
const armsOut = dots([[1, 10], [0, 10], [-1, 10], [10, 10], [11, 10], [12, 10]], 'a') + dots([[-2, 9], [13, 11]], 's')

const sway = (isPlaying: boolean, delay: number) =>
  isPlaying
    ? `<animateTransform attributeName="transform" type="translate" values="0 0;-2 -1;0 0;2 -1" calcMode="discrete" dur="0.9s" begin="${delay}s" repeatCount="indefinite"/>`
    : ''

const dancer = (index: number, salt: number, theme: Theme, isPlaying: boolean, delay: number) => {
  const traits = traitsOf('dancer', index, salt, theme)
  const isInGown = isDancerInGown(index, salt)
  const poseA = pixels(isInGown ? GOWN_SPIN_A : DANCE_ARMS_UP, 0, 9) + armsUp
  const poseB = pixels(isInGown ? GOWN_SPIN_B : DANCE_KICK, 0, 9) + armsOut

  return (
    `<g style="${traits.style}"><g>${sway(isPlaying, delay)}` +
    `${twoFrames(poseA, poseB, isPlaying, 0.6, delay)}<use href="#head-${traits.head}"/></g></g>`
  )
}

const sparkle = (isPlaying: boolean, delay: number) =>
  twoFrames(dots([[1, -2], [10, -1]], 'y'), dots([[2, -3], [9, -3], [11, 1]], 'y'), isPlaying, 0.8, delay)

const musician = (role: Exclude<Section, 'dancer'>, index: number, salt: number, theme: Theme, isPlaying: boolean, delay: number) => {
  const cast = CASTS[theme]
  const traits = traitsOf(role, index, salt, theme)
  const instruments = role === 'melodic' ? cast.melodic : cast.percussion
  const accessory = cast.accessories[traits.accessory]

  return (
    `<g style="${traits.style}">${accessory.behind}` +
    `<use href="#body-${traits.body}"/><use href="#head-${traits.head}"/>${accessory.front}` +
    `${instruments[traits.instrument](isPlaying, delay)}` +
    `${traits.rarity === 'legendary' ? sparkle(isPlaying, delay) : ''}</g>`
  )
}

export const character = (
  x: number,
  y: number,
  role: Role,
  index: number,
  isPlaying: boolean,
  salt: number,
  theme: Theme,
) => {
  const delay = (index % 4) * 0.15
  const art =
    role === 'conductor'
      ? `<g style="${conductorStyle(salt, theme)}"><use href="#sp-conductor-${conductorIndex(salt, theme)}"/>${conductorOf(salt, theme).extra(isPlaying)}</g>`
      : role === 'dancer'
        ? dancer(index, salt, theme, isPlaying, delay)
        : musician(role, index, salt, theme, isPlaying, delay)

  return (
    `<g transform="translate(${x - 18} ${y - 54}) scale(${PX})"><g>${hop(isPlaying, delay)}` +
    `<rect x="1" y="17" width="10" height="1" fill="#000" opacity="0.45"/>${art}</g></g>`
  )
}
