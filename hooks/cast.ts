export const PX = 3

type Sprite = string[]
type Point = [number, number]

const PALETTE: Record<string, string> = {
  k: '#07080b',
  m: '#24282c',
  M: '#4b5258',
  l: '#9dff5c',
  r: '#6e2b1f',
  R: '#a94a28',
  b: '#3b2a1e',
  B: '#7a5130',
  w: '#c7bfa8',
  c: '#2ee6d6',
  p: '#ff3d8b',
  y: '#e6c13d',
}

const VARIABLE: Record<string, string> = { a: '--a', A: '--A', e: '--e', s: '--s', i: '--i', I: '--I', x: '--x' }

const fill = (color: string) =>
  VARIABLE[color] ? `style="fill:var(${VARIABLE[color]})"` : `fill="${PALETTE[color]}"`

const paths = (byColor: Map<string, string[]>) =>
  [...byColor].map(([color, segments]) => `<path d="${segments.join('')}" ${fill(color)}/>`).join('')

const collect = (byColor: Map<string, string[]>, color: string, segment: string) =>
  byColor.set(color, [...(byColor.get(color) ?? []), segment])

export const pixels = (sprite: Sprite, ox = 0, oy = 0) => {
  const byColor = new Map<string, string[]>()
  sprite.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const color = row[x]
      let end = x
      while (end < row.length && row[end] === color) end++
      if (color !== '.') collect(byColor, color, `M${ox + x} ${oy + y}h${end - x}v1h${x - end}z`)
      x = end
    }
  })

  return paths(byColor)
}

const dots = (points: Point[], color: string) =>
  `<path d="${points.map(([x, y]) => `M${x} ${y}h1v1h-1z`).join('')}" ${fill(color)}/>`

const diagonal = (fromX: number, fromY: number, length: number, slope: number): Point[] =>
  Array.from({ length }, (_, i) => [fromX + i, fromY - Math.round(i * slope)])

const twoFrames = (a: string, b: string, isPlaying: boolean, dur: number, delay: number) =>
  isPlaying
    ? `<g>${a}<animate attributeName="opacity" values="1;0" calcMode="discrete" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/></g>` +
      `<g opacity="0">${b}<animate attributeName="opacity" values="0;1" calcMode="discrete" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/></g>`
    : a

const hop = (isPlaying: boolean, delay: number) =>
  isPlaying
    ? `<animateTransform attributeName="transform" type="translate" values="0 0;0 -1" calcMode="discrete" dur="0.6s" begin="${delay}s" repeatCount="indefinite"/>`
    : ''

const HEADS: Record<string, Sprite> = {
  gasMask: ['...kkkkkk...', '..kaaaaaak..', '.kaaaaaaaak.', '.kammmmmmak.', '.kmeemmeemk.', '.kmeemmeemk.', '.kmmmMMmmmk.', '..kmmMMmmk..', '..kkmrrmkk..'],
  goggles: ['...kkkkkk...', '..kaaaaaak..', '.kaAaaaaAak.', '.kkkkkkkkkk.', '.keekkkkeek.', '.kssssssssk.', '.kxxxxxxxxk.', '..kxxxxxxk..', '...kkxxkk...'],
  visor: ['...kkkkkk...', '..kMMMMMMk..', '.kMMMMMMMMk.', '.keeeeeeeek.', '.kMMMMMMMMk.', '..kMMkkMMk..', '...kkMMkk...', '....kMMk....', '...kkkkkk...'],
  welder: ['...kkkkkk...', '..kxxxxxxk..', '.kxxxxxxxxk.', 'kkkkkkkkkkkk', '.kMMMMMMMMk.', '.kMkeeeekMk.', '.kMMMMMMMMk.', '..kMMMMMMk..', '...kkkkkk...'],
  bandaged: ['...kkkkkk...', '..kaaaaaak..', '.kaaAAAAaak.', '.kaAwwwwAak.', '.kawekkewak.', '.kawwwwwwak.', '.kaAwkkwAak.', '..kawwwwak..', '...kkkkkk...'],
  punk: ['....kxxk....', '...kxxxxk...', '..kkxxxxkk..', '.kssssssssk.', '.kkkkssseek.', '.kssssssssk.', '.ksskkkkssk.', '..kssssssk..', '...kkkkkk...'],
  robot: ['...kkkkkk...', '..kMMMMMMk..', '.kMMMMMMMMk.', '.kMkkMMkkMk.', '.kMkeMMekMk.', '.kMkkMMkkMk.', '.kMMMMMMMMk.', '.kMkMkMkMMk.', '..kkkkkkkk..'],
  plague: ['...kkkkkk...', '..kaaaaaak..', '.kaaaaaaaak.', 'kkkkkkkkkkkk', '.kmeemmeemk.', '.kmmmmmmmmk.', '..kmmwwwwwwk', '...kmmwwwk..', '....kkkkk...'],
  cyclops: ['...kkkkkk...', '..kaaaaaak..', '.kaAaaaaAak.', '.kaakkkkaak.', '.kakeeeekak.', '.kakeekekak.', '.kaakkkkaak.', '..kammmmak..', '...kkkkkk...'],
  helmet: ['...kkkkkk...', '..kaaaaaak..', '.kaaaaaaaak.', 'kaaaaaaaaaak', 'kkkkkkkkkkkk', '.kseesseesk.', '.kssssssssk.', '.kmmmmmmmmk.', '..kkkkkkkk..'],
  skull: ['...kkkkkk...', '..kwwwwwwk..', '.kwwwwwwwwk.', '.kwkkwwkkwk.', '.kwkewwekwk.', '.kwwwkkwwwk.', '..kwwwwwwk..', '..kwkwkwkk..', '...kkkkkk...'],
}

const BODIES: Record<string, Sprite> = {
  coat: ['.kaakkkkaak.', 'kaAaakkaaAak', 'kaAaaaaaaAak', 'kaAaxxaaaaAk', 'kaaaaaaaaaak', 'kaaaaaaaaaak', '.kaaakkaaak.', '.kbbk..kbbk.', '.kkkk..kkkk.'],
  rags: ['.kwwkaakwwk.', 'kwwwwkkwwwwk', 'kwwwwaawwwwk', 'kwwawwwwawwk', 'kwwwwaawwwwk', 'kkwwwwwwwwkk', '.kbbbkkbbbk.', '.kbbk..kbbk.', '.kkkk..kkkk.'],
  hazmat: ['.kaaaaaaaak.', 'kAaaaaaaaaAk', 'kAakkkkkkaAk', 'kAakxxxxkaAk', 'kAakkkkkkaAk', 'kAaaaaaaaaAk', '.kaaakkaaak.', '.kmmk..kmmk.', '.kkkk..kkkk.'],
  armor: ['.kMMkkkkMMk.', 'kMMMakkaMMMk', 'kMaaaaaaaaMk', 'kMakkkkkkaMk', 'kMaaaaaaaaMk', 'kMakkkkkkaMk', '.kaaakkaaak.', '.kmmk..kmmk.', '.kkkk..kkkk.'],
  jumpsuit: ['.kaakxxkaak.', 'kaAaaxxaaAak', 'kaAaaxxaaAak', 'kaAaaxxaaAak', 'kaaaaxxaaaak', 'kaaaaaaaaaak', '.kaaakkaaak.', '.kxxk..kxxk.', '.kkkk..kkkk.'],
  poncho: ['.kaaaaaaaak.', 'kaaxaaaaxaak', 'kaaaxaaxaaak', 'kaaaaxxaaaak', 'kaaaaaaaaaak', 'kkaaaaaaaakk', '..kkkkkkkk..', '..kbk..kbk..', '..kkk..kkk..'],
}

const ACCESSORIES: Record<string, { behind: string; front: string }> = {
  none: { behind: '', front: '' },
  antenna: { behind: '', front: dots([[6, -1], [6, -2], [6, -3]], 'k') + dots([[6, -4]], 'x') },
  headphones: { behind: '', front: dots(diagonal(3, -1, 6, 0), 'k') + dots([[1, 3], [1, 4], [1, 5], [10, 3], [10, 4], [10, 5]], 'x') },
  backpack: { behind: pixels(['kkkk', 'kMMk', 'kxMk', 'kMMk', 'kMMk', 'kkkk'], 10, 9), front: '' },
  spikes: { behind: '', front: dots([[0, 9], [-1, 8], [11, 9], [12, 8]], 'M') },
  chain: { behind: '', front: dots([[3, 10], [4, 11], [5, 11], [6, 11], [7, 11], [8, 10]], 'y') },
  tank: { behind: pixels(['.kk.', 'kxxk', 'kxxk', 'kxxk', 'kxxk', '.kk.'], 10, 8), front: '' },
}

const CONDUCTOR: Sprite = [
  '...kkkkkk...', '..kMMMMMMk..', '.kMMMMMMMMk.', '.kcccccccck.', '.kMMMMMMMMk.', '..kMMppMMk..',
  '...kkMMkk...', '.kkkkkkkkkk.', 'kmmmkppkmmmk', 'kmmmmkkmmmmk', 'kmmmmmmmmmmk', 'kmmcmmmmcmmk',
  'kmmmmmmmmmmk', 'kmmmmmmmmmmk', 'kmmmmkkmmmmk', '.kmmk..kmmk.', '.kmmk..kmmk.', '.kkkk..kkkk.',
]

type Instrument = (isPlaying: boolean, delay: number) => string

const VIOLIN: Sprite = ['kk......', 'kIIk....', '.kIiIk..', '..kIIIk.', '...kIIk.', '....kk..']
const CELLO: Sprite = ['..kk..', '..kk..', '..kk..', '.kIIk.', 'kIIIIk', 'kIiiIk', '.kIIk.', 'kIIIIk', 'kIIIIk', 'kIiiIk', '.kIIk.', '..kk..', '..k...']
const TRUMPET: Sprite = ['.......II', 'kIIIIIIII', '..kI.k.II', '.......II']
const GUITAR: Sprite = ['.kIIk.', 'kIIIIk', 'kIkkIk', 'kIIIIk', '.kkkk.']
const BARREL: Sprite = ['.kkkkkkkkkkkk.', 'kmMMMMMMMMMMmk', 'kkkkkkkkkkkkkk', 'kIIiiIIiiIIiik', 'kykkykkykkykkk', 'kIiiIIiiIIiiIk', 'kiiIIiiIIiiIIk', 'kkkkkkkkkkkkkk']
const LID: Sprite = ['.k.', 'kIk', 'kIk', 'kIk', 'kIk', '.k.']
const BUCKET: Sprite = ['..kkk..', '.kIIIk.', '.kIIIk.', 'kIIiIIk', 'kIIIIIk', 'kkkkkkk']
const RUST_BUCKET: Sprite = ['..kkk..', '.kRRRk.', '.kRRRk.', 'kRRrRRk', 'kRRRRRk', 'kkkkkkk']
const TIRE: Sprite = ['..kkkkkkkkkk..', '.kmmmmmmmmmmk.', 'kmmkkkkkkkkmmk', 'kmkIIIIIIIIkmk', 'kmmkkkkkkkkmmk', '.kmmmmmmmmmmk.', '..kkkkkkkkkk..']
const THEREMIN: Sprite = ['kkkkk', 'kiiik', 'kIIIk', 'kkkkk', '.k.k.', '.k.k.']
const KEYTAR: Sprite = ['kkkkkkkkkkkkkk', 'kwkwkwkwkwkIIk', 'kkkkkkkkkkkkkk']
const GONG: Sprite = ['..kkk..', '.kIIIk.', 'kIiiiIk', 'kIiIiIk', 'kIiiiIk', '.kIIIk.', '..kkk..']
const CAN: Sprite = ['kk', 'II', 'Ii', 'kk']

const puff = (x: number, y: number) => dots([[x, y], [x + 1, y - 1], [x + 2, y - 3]], 'w')

const MELODIC: Record<string, Instrument> = {
  violin: (isPlaying, delay) =>
    pixels(VIOLIN, -4, 8) + twoFrames(dots(diagonal(-5, 15, 9, 0.7), 'w'), dots(diagonal(-2, 15, 9, 0.7), 'w'), isPlaying, 0.5, delay),
  cello: (isPlaying, delay) =>
    pixels(CELLO, -4, 5) + twoFrames(dots(diagonal(-8, 12, 10, 0), 'w'), dots(diagonal(-5, 12, 10, 0), 'w'), isPlaying, 0.7, delay),
  trumpet: (isPlaying, delay) => pixels(TRUMPET, 8, 5) + twoFrames('', puff(18, 5), isPlaying, 0.5, delay),
  accordion: (isPlaying, delay) =>
    twoFrames(pixels(Array(4).fill('kIIkxwxwxkIIk'), -1, 9), pixels(Array(4).fill('kIIkxwxkIIk'), 0, 9), isPlaying, 0.8, delay),
  guitar: (isPlaying, delay) =>
    pixels(GUITAR, -3, 10) + dots(diagonal(3, 11, 9, 0.7), 'b') + dots([[12, 4], [13, 4]], 'k') +
    twoFrames(dots([[0, 11]], 's'), dots([[0, 13]], 's'), isPlaying, 0.3, delay),
  flute: (isPlaying, delay) =>
    dots(diagonal(5, 7, 13, 0), 'I') + dots([[9, 7], [11, 7], [13, 7]], 'k') + twoFrames('', dots([[19, 5], [20, 4]], 'l'), isPlaying, 0.6, delay),
  sax: (isPlaying, delay) =>
    dots([[7, 7], [7, 8], [8, 9], [8, 10], [8, 11], [8, 12], [8, 13], [7, 14], [6, 15]], 'i') +
    dots([[5, 15], [4, 14], [3, 13], [3, 12], [4, 12], [2, 12]], 'I') + dots([[8, 10], [8, 12]], 'k') +
    twoFrames('', puff(1, 10), isPlaying, 0.5, delay),
  theremin: (isPlaying, delay) =>
    pixels(THEREMIN, 11, 11) + dots([[15, 10], [15, 9], [15, 8], [15, 7], [15, 6]], 'M') +
    twoFrames(dots([[13, 6]], 's') + dots([[14, 4], [16, 4]], 'x'), dots([[13, 8]], 's') + dots([[14, 6], [16, 6], [17, 5]], 'x'), isPlaying, 0.45, delay),
  saw: (isPlaying, delay) =>
    dots([[2, 16], [3, 15], [4, 14], [5, 14], [6, 13], [7, 13], [8, 12], [9, 11]], 'M') + dots([[1, 16], [0, 17]], 'i') +
    twoFrames(dots(diagonal(4, 11, 7, 0), 'w'), dots(diagonal(6, 11, 7, 0), 'w'), isPlaying, 0.6, delay),
  keytar: (isPlaying, delay) =>
    pixels(KEYTAR, -2, 10) + twoFrames(dots([[2, 9], [7, 9]], 's'), dots([[3, 10], [8, 9]], 's'), isPlaying, 0.25, delay),
}

const sticks = (isUp: boolean, hitY: number) =>
  isUp
    ? dots([[1, 9], [0, 8], [-1, 7], [-2, 6]], 'w') + dots([[10, 9], [11, 8], [12, 7], [13, 6]], 'w')
    : dots([[1, 10], [1, 11], [2, hitY - 1], [2, hitY]], 'w') + dots([[10, 10], [10, 11], [9, hitY - 1], [9, hitY]], 'w')

const pipes = (isLeftMallet: boolean) => {
  const columns = Array.from({ length: 7 }, (_, i) => {
    const height = 7 - (i % 4)
    return Array.from({ length: height }, (_, row) => [-2 + i * 2, 18 - height + row] as Point)
  }).flat()
  const mallet: Point[] = isLeftMallet ? [[1, 10], [1, 11]] : [[9, 11], [9, 12]]

  return dots([[-3, 18], [13, 18]], 'k') + dots(columns, 'I') + dots(mallet, 'x')
}

const PERCUSSION: Record<string, Instrument> = {
  barrel: (isPlaying, delay) => twoFrames(sticks(true, 13), sticks(false, 13), isPlaying, 0.3, delay) + pixels(BARREL, -1, 13),
  lids: (isPlaying, delay) =>
    twoFrames(pixels(LID, -3, 7) + pixels(LID, 12, 7), pixels(LID, 3, 5) + pixels(LID, 6, 5) + dots([[5, 3], [4, 2], [6, 2]], 'y'), isPlaying, 0.6, delay),
  buckets: (isPlaying, delay) =>
    twoFrames(sticks(true, 12), sticks(false, 12), isPlaying, 0.35, delay) + pixels(BUCKET, -3, 12) + pixels(RUST_BUCKET, 7, 12),
  pipes: (isPlaying, delay) => twoFrames(pipes(true), pipes(false), isPlaying, 0.4, delay),
  tire: (isPlaying, delay) =>
    twoFrames(dots([[2, 11], [9, 11]], 's'), dots([[3, 12], [8, 12]], 's'), isPlaying, 0.3, delay) + pixels(TIRE, -1, 12),
  gong: (isPlaying, delay) =>
    dots([[-4, 14], [-4, 15], [-4, 16], [-4, 17]], 'M') + pixels(GONG, -7, 7) +
    twoFrames(dots([[0, 10], [-1, 9]], 'w'), dots([[-1, 10], [-2, 10]], 'w') + dots([[-9, 6], [-9, 14], [1, 6]], 'x'), isPlaying, 0.9, delay),
  cans: (isPlaying, delay) =>
    twoFrames(pixels(CAN, -2, 7) + pixels(CAN, 12, 7), pixels(CAN, -2, 10) + pixels(CAN, 12, 10) + dots([[-3, 9], [15, 9]], 'w'), isPlaying, 0.2, delay),
}

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

const generator = (seed: number) => {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SKINS = ['#9a7a62', '#6b4a36', '#c49a7a', '#7d8a6a', '#8f8f99', '#b07a8a']

const MATERIALS: [string, string][] = [
  ['#5a3a20', '#7a5130'],
  ['#6e2b1f', '#a94a28'],
  ['#5d656d', '#a8b0b8'],
  ['#8a8270', '#d6ccb2'],
  ['#2b3a2b', '#4f6b4a'],
]

const hsl = (hue: number, saturation: number, lightness: number) => `hsl(${Math.round(hue)} ${saturation}% ${lightness}%)`

type Section = 'melodic' | 'percussion'
export type Role = Section | 'conductor'

export type Traits = {
  instrument: string
  head: string
  body: string
  accessory: string
  style: string
  rarity: 'common' | 'rare' | 'legendary'
  octave: number
  detune: number
  vibrato: number
}

export const traitsOf = (role: Section, index: number, salt: number): Traits => {
  const next = generator(hash(salt, role === 'melodic' ? 1 : 2, index))
  const pick = <T>(list: T[]) => list[Math.floor(next() * list.length)]
  const roll = next()
  const rarity = roll < 0.05 ? 'legendary' : roll < 0.2 ? 'rare' : 'common'
  const coatHue = next() * 360
  const coatSaturation = next() < 0.2 ? 55 : 15 + Math.floor(next() * 20)
  const coatLightness = 20 + Math.floor(next() * 12)
  const neonHue = next() * 360
  const [material, materialLight] =
    rarity === 'legendary' ? ['#a87a12', '#f2c94c'] : rarity === 'rare' ? [hsl(neonHue, 90, 40), hsl(neonHue, 95, 62)] : pick(MATERIALS)
  const eyes = rarity === 'legendary' ? '#fff3a0' : hsl(next() * 360, 90, 60)
  const style = [
    `--a:${hsl(coatHue, coatSaturation, coatLightness)}`,
    `--A:${hsl(coatHue, coatSaturation, coatLightness + 12)}`,
    `--e:${eyes}`,
    `--s:${pick(SKINS)}`,
    `--i:${material}`,
    `--I:${materialLight}`,
    `--x:${hsl(next() * 360, 70, 55)}`,
  ].join(';')
  const accessoryNames = keys(ACCESSORIES)

  return {
    instrument: pick(keys(role === 'melodic' ? MELODIC : PERCUSSION)),
    head: pick(keys(HEADS)),
    body: pick(keys(BODIES)),
    accessory: next() < 0.35 ? 'none' : pick(accessoryNames.slice(1)),
    style,
    rarity,
    octave: pick([-1, 0, 0, 0, 1]),
    detune: (next() - 0.5) * 0.012,
    vibrato: 0.5 + next() * 1.5,
  }
}

export const SPRITES =
  keys(HEADS).map(name => `<g id="head-${name}">${pixels(HEADS[name])}</g>`).join('') +
  keys(BODIES).map(name => `<g id="body-${name}">${pixels(BODIES[name], 0, 9)}</g>`).join('') +
  `<g id="sp-conductor">${pixels(CONDUCTOR)}</g>`

const baton = (isRight: boolean) =>
  isRight
    ? dots([[11, 9], [12, 8], [13, 7], [14, 6]], 'p') + dots([[15, 5]], 'c')
    : dots([[11, 9], [11, 8], [10, 7], [10, 6]], 'p') + dots([[9, 5]], 'c')

const sparkle = (isPlaying: boolean, delay: number) =>
  twoFrames(dots([[1, -2], [10, -1]], 'y'), dots([[2, -3], [9, -3], [11, 1]], 'y'), isPlaying, 0.8, delay)

const musician = (role: Section, index: number, salt: number, isPlaying: boolean, delay: number) => {
  const traits = traitsOf(role, index, salt)
  const instruments = role === 'melodic' ? MELODIC : PERCUSSION
  const accessory = ACCESSORIES[traits.accessory]

  return (
    `<g style="${traits.style}">${accessory.behind}` +
    `<use href="#body-${traits.body}"/><use href="#head-${traits.head}"/>${accessory.front}` +
    `${instruments[traits.instrument](isPlaying, delay)}` +
    `${traits.rarity === 'legendary' ? sparkle(isPlaying, delay) : ''}</g>`
  )
}

export const character = (x: number, y: number, role: Role, index: number, isPlaying: boolean, salt: number) => {
  const delay = (index % 4) * 0.15
  const art =
    role === 'conductor'
      ? '<use href="#sp-conductor"/>' + twoFrames(baton(true), baton(false), isPlaying, 0.9, 0)
      : musician(role, index, salt, isPlaying, delay)

  return (
    `<g transform="translate(${x - 18} ${y - 54}) scale(${PX})"><g>${hop(isPlaying, delay)}` +
    `<rect x="1" y="17" width="10" height="1" fill="#000" opacity="0.45"/>${art}</g></g>`
  )
}
