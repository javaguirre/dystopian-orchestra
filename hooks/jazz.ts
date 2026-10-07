import { dots, hsl, pixels, twoFrames } from './pixel.ts'
import type { Cast, Instrument, Point, Rarity, Sprite } from './pixel.ts'

const HEADS: Record<string, Sprite> = {
  fedora: ['...kkkkkk...', '..kaaaaaak..', '..kAAAAAAk..', 'kkkkkkkkkkkk', '.kssssssssk.', '.kskssskssk.', '.kssssssssk.', '..kssmmssk..', '...kkkkkk...'],
  shades: ['...kkkkkk...', '..kssssssk..', '.kssssssssk.', '.kssssssssk.', '.kkkkkkkkkk.', '.kkkksskkkk.', '.kssssssssk.', '..kssmmssk..', '...kkkkkk...'],
  beret: ['....kkkkk...', '..kkaaaaakk.', '.kaaaaaaaaak', '.kssssssssk.', '.kskssssksk.', '.kssssssssk.', '.kssmmmmssk.', '..ksshhssk..', '...kkhhkk...'],
  afro: ['..hhhhhhhh..', '.hhhhhhhhhh.', 'hhhhhhhhhhhh', 'hhkssssssshh', 'hksksssksskh', '.kssssssssk.', '.kssmmmmssk.', '..kssssssk..', '...kkkkkk...'],
  pompadour: ['...hhhhhh...', '..hhhhhhhhh.', '.khhhhhhhhk.', '.khsssssshk.', '.kskssssksk.', '.kssssssssk.', '.kssmmmmssk.', '..kssssssk..', '...kkkkkk...'],
  porkpie: ['............', '...kkkkkk...', '..kaaaaaak..', '..kAAAAAAk..', '.kkkkkkkkkk.', '.kkkksskkkk.', '.kssssssssk.', '..kssmmssk..', '...kkkkkk...'],
}

const BODIES: Record<string, Sprite> = {
  suit: ['.kaawwwwaak.', 'kaAaaxxaaAak', 'kaAaaxxaaAak', 'kaAaaaaaaAak', 'kaaaaaaaaaak', 'kaaaaaaaaaak', '.kmmmkkmmmk.', '.kmmk..kmmk.', '.kkkk..kkkk.'],
  vest: ['.kwwwxxwwwk.', 'kwwkaxxakwwk', 'kwwkaaaakwwk', 'kwwkayyakwwk', 'kwwkaaaakwwk', 'kkkkaaaakkkk', '.kmmmkkmmmk.', '.kmmk..kmmk.', '.kkkk..kkkk.'],
  tux: ['.kmmkwwkmmk.', 'kmMmkxxkmMmk', 'kmMmwwwwmMmk', 'kmMmwkkwmMmk', 'kmmmwwwwmmmk', 'kmmmmmmmmmmk', '.kmmmkkmmmk.', '.kmmk..kmmk.', '.kkkk..kkkk.'],
  gown: ['..kaksskak..', '.ksaaaaaask.', '.kaAaaaaAak.', '..kaaaaaak..', '..kaAaaAak..', '.kaaaaaaaak.', 'kaAaaaaaaAak', 'kaaaaaaaaaak', 'kkkkkkkkkkkk'],
  zoot: ['.kaakwwkaak.', 'kaAakxxkaAak', 'kaAaakkaaAak', 'kaAaaaaaaAak', 'kaAaaaaaaAak', 'kaAaaaaaaAak', 'kaaaakkaaaak', 'kaaak..kaaak', 'kkkkk..kkkkk'],
}

const ACCESSORIES: Record<string, { behind: string; front: string }> = {
  none: { behind: '', front: '' },
  flower: { behind: '', front: dots([[2, 10], [3, 11]], 'p') + dots([[2, 11]], 'y') },
  pocketSquare: { behind: '', front: dots([[8, 11], [9, 11], [9, 10]], 'w') },
  pearls: { behind: '', front: dots([[3, 9], [4, 10], [5, 10], [6, 10], [7, 10], [8, 9]], 'w') },
  watchChain: { behind: '', front: dots([[3, 13], [4, 14], [5, 14], [6, 14], [7, 13]], 'y') },
  scarf: { behind: '', front: dots([[3, 9], [4, 9], [5, 9], [6, 9], [7, 9], [8, 9], [8, 10], [8, 11]], 'x') },
}

const CROONER: Sprite = [
  '...kkkkkk...', '..kkkkkkkk..', '.kkkkkkkkkk.', '.kssssssssk.', '.kskssssksk.', '.kssssssssk.',
  '..kssmmssk..', '...kkkkkk...', '.kwwwkkwwwk.', 'kwwwkppkwwwk', 'kwwwwwwwwwwk', 'kwwwwwkwwwwk',
  'kwwwwwwwwwwk', 'kwwwwwwwwwwk', '.kmmmkkmmmk.', '.kmmk..kmmk.', '.kmmk..kmmk.', '.kkkk..kkkk.',
]

const microphone = (isUp: boolean) =>
  dots(Array.from({ length: 12 }, (_, i) => [14, 6 + i] as Point), 'M') +
  pixels(['kk', 'MM', 'kk'], 13, 3) +
  (isUp ? dots([[12, 5], [11, 6]], 's') : dots([[12, 8], [11, 9]], 's'))

const TRUMPET: Sprite = ['.......II', 'kIIIIIIII', '..kI.k.II', '.......II']
const BASS: Sprite = ['...kk...', '...kk...', '...kk...', '...kk...', '..kIIk..', '.kIIIIk.', 'kIIkkIIk', '.kIIIIk.', '.kIIIIk.', 'kIIkkIIk', 'kIIIIIIk', '.kIIIIk.', '..kkkk..', '...k....']
const ARCHTOP: Sprite = ['.kIIIk.', 'kIIIIIk', 'kIkIkIk', 'kIIIIIk', '.kkkkk.']
const RHODES: Sprite = ['kkkkkkkkkkkkkk', 'kiiiiiiiiiiiik', 'kwkwkwwkwkwkwk', 'kwwwwwwwwwwwwk', 'kkkkkkkkkkkkkk', '.k..........k.', '.k..........k.']
const KICK: Sprite = ['..kkkkkk..', '.kwwwwwwk.', 'kwwxxxxwwk', 'kwwxwwxwwk', 'kwwxxxxwwk', '.kwwwwwwk.', '..kkkkkk..']
const SNARE: Sprite = ['kkkkk', 'kIIIk', 'kkkkk']
const CONGA: Sprite = ['.kkkk.', 'kwwwwk', 'kiiiik', 'kIiiIk', 'kiiiik', 'kIiiIk', '.kiik.', '.kiik.']
const BONGO: Sprite = ['kkkk', 'kwwk', 'kiik', '.kk.']
const VIBES: Sprite = [
  'IIkIIkIIkIIkIIkII',
  'IIkIIkIIkIIkIIkII',
  'y..y..y..y..y..y.',
  'y..y..y..y..y..y.',
  'k...............k',
  'k...............k',
]

const puff = (x: number, y: number) => dots([[x, y], [x + 1, y - 1], [x + 2, y - 3]], 'w')

const slide = (end: number) =>
  dots(Array.from({ length: end - 6 }, (_, i) => [7 + i, 7] as Point), 'I') +
  dots(Array.from({ length: end - 4 }, (_, i) => [5 + i, 9] as Point), 'I') +
  dots([[end, 8], [end, 9]], 'I')

const MELODIC: Record<string, Instrument> = {
  sax: (isPlaying, delay) =>
    dots([[7, 7], [7, 8], [8, 9], [8, 10], [8, 11], [8, 12], [8, 13], [7, 14], [6, 15]], 'i') +
    dots([[5, 15], [4, 14], [3, 13], [3, 12], [4, 12], [2, 12]], 'I') +
    dots([[8, 10], [8, 12]], 'k') +
    twoFrames('', puff(1, 10), isPlaying, 0.5, delay),
  trumpet: (isPlaying, delay) => pixels(TRUMPET, 8, 5) + twoFrames('', puff(18, 5), isPlaying, 0.5, delay),
  trombone: (isPlaying, delay) =>
    pixels(['..II', 'IIII', 'IIII', '..II'], 16, 4) + twoFrames(slide(14), slide(19), isPlaying, 0.7, delay),
  clarinet: (isPlaying, delay) =>
    dots([[6, 7], [6, 8], [6, 9], [5, 10], [5, 11], [5, 12], [5, 13], [5, 14]], 'm') +
    dots([[6, 9], [5, 11], [5, 13]], 'M') +
    dots([[4, 15], [5, 15], [6, 15]], 'm') +
    twoFrames('', dots([[2, 13], [1, 12]], 'w'), isPlaying, 0.55, delay),
  bass: (isPlaying, delay) =>
    pixels(BASS, -5, 4) + twoFrames(dots([[0, 11]], 's'), dots([[1, 12]], 's'), isPlaying, 0.3, delay),
  piano: (isPlaying, delay) =>
    pixels(RHODES, -1, 11) + twoFrames(dots([[2, 10], [8, 10]], 's'), dots([[4, 10], [10, 10]], 's'), isPlaying, 0.25, delay),
  archtop: (isPlaying, delay) =>
    pixels(ARCHTOP, -3, 10) +
    dots([[4, 11], [5, 10], [6, 10], [7, 9], [8, 8], [9, 8], [10, 7], [11, 6]], 'b') +
    dots([[12, 5], [13, 5]], 'k') +
    twoFrames(dots([[0, 11]], 's'), dots([[0, 13]], 's'), isPlaying, 0.35, delay),
}

const sticks = (isUp: boolean) =>
  isUp
    ? dots([[1, 9], [0, 8], [-1, 7]], 'w') + dots([[10, 9], [11, 8], [12, 7]], 'w')
    : dots([[1, 10], [0, 11], [-1, 11]], 'w') + dots([[10, 10], [11, 9], [12, 8]], 'w')

const vibesMallets = (isLeft: boolean) =>
  isLeft ? dots([[1, 10], [1, 11], [2, 10]], 'x') : dots([[9, 10], [9, 11], [10, 10]], 'x')

const PERCUSSION: Record<string, Instrument> = {
  kit: (isPlaying, delay) =>
    pixels(SNARE, -4, 11) +
    dots([[12, 7], [13, 7], [14, 7], [15, 7], [16, 7], [17, 7]], 'y') +
    dots(Array.from({ length: 9 }, (_, i) => [14, 8 + i] as Point), 'M') +
    twoFrames(sticks(true), sticks(false), isPlaying, 0.35, delay) +
    pixels(KICK, 1, 11),
  congas: (isPlaying, delay) =>
    pixels(CONGA, -4, 10) + pixels(CONGA, 9, 10) +
    twoFrames(dots([[0, 9], [10, 9]], 's'), dots([[0, 10], [10, 10]], 's'), isPlaying, 0.3, delay),
  vibes: (isPlaying, delay) => pixels(VIBES, -3, 12) + twoFrames(vibesMallets(true), vibesMallets(false), isPlaying, 0.4, delay),
  bongos: (isPlaying, delay) =>
    pixels(BONGO, 1, 11) + pixels(BONGO, 6, 11) +
    twoFrames(dots([[2, 10], [8, 10]], 's'), dots([[3, 11], [7, 11]], 's'), isPlaying, 0.25, delay),
  ride: (isPlaying, delay) =>
    dots(Array.from({ length: 11 }, (_, i) => [-3, 7 + i] as Point), 'M') +
    twoFrames(
      dots([[-7, 6], [-6, 6], [-5, 6], [-4, 6], [-3, 6], [-2, 6], [-1, 6], [0, 6]], 'y') + dots([[1, 9], [0, 8]], 'w'),
      dots([[-7, 7], [-6, 7], [-5, 6], [-4, 6], [-3, 6], [-2, 6], [-1, 5], [0, 5]], 'y') + dots([[1, 9], [0, 7]], 'w'),
      isPlaying,
      0.35,
      delay,
    ),
}

const SKINS = ['#f1c9a5', '#d9a47a', '#b27a52', '#8a5a3b', '#5e3b26', '#3f271a']
const HAIR = ['#1a1410', '#3a2414', '#6b4423', '#b8862e', '#8c8c8c', '#2a1a3a']
const MATERIALS: [string, string][] = [
  ['#a8801c', '#e8c25a'],
  ['#8a9098', '#d8dde2'],
  ['#6b3a1e', '#a0622d'],
  ['#1a1a1a', '#3a3a3a'],
  ['#c9b48a', '#efe0bc'],
]
const SUITS = [
  [220, 25, 22],
  [0, 0, 14],
  [350, 45, 30],
  [35, 30, 35],
  [150, 20, 22],
  [270, 25, 26],
  [40, 15, 70],
]

const style = (next: () => number, rarity: Rarity) => {
  const pick = <T>(list: T[]) => list[Math.floor(next() * list.length)]
  const [hue, saturation, lightness] = pick(SUITS)
  const [material, materialLight] =
    rarity === 'legendary' ? ['#a87a12', '#f2c94c'] : rarity === 'rare' ? ['#8a4a2a', '#d98a5a'] : pick(MATERIALS)

  return [
    `--a:${hsl(hue, saturation, lightness)}`,
    `--A:${hsl(hue, saturation, lightness + 10)}`,
    `--e:${rarity === 'legendary' ? '#fff3a0' : '#1a1410'}`,
    `--s:${pick(SKINS)}`,
    `--h:${pick(HAIR)}`,
    `--i:${material}`,
    `--I:${materialLight}`,
    `--x:${hsl(next() * 360, 65, 50)}`,
  ].join(';')
}

export const JAZZ: Cast = {
  heads: HEADS,
  bodies: BODIES,
  accessories: ACCESSORIES,
  melodic: MELODIC,
  percussion: PERCUSSION,
  conductor: { sprite: CROONER, extra: isPlaying => twoFrames(microphone(true), microphone(false), isPlaying, 0.8, 0) },
  style,
}
