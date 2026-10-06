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
  s: '#9a7a62',
  c: '#2ee6d6',
  p: '#ff3d8b',
  y: '#e6c13d',
}

const VARIABLE: Record<string, string> = { a: '--a', A: '--A', e: '--e' }

const fill = (color: string) =>
  VARIABLE[color] ? `style="fill:var(${VARIABLE[color]})"` : `fill="${PALETTE[color]}"`

export const pixels = (sprite: Sprite, ox = 0, oy = 0) =>
  sprite
    .flatMap((row, y) => {
      const runs: string[] = []
      let x = 0
      while (x < row.length) {
        const color = row[x]
        let end = x
        while (end < row.length && row[end] === color) end++
        if (color !== '.') {
          runs.push(`<rect x="${ox + x}" y="${oy + y}" width="${end - x}" height="1" ${fill(color)}/>`)
        }
        x = end
      }
      return runs
    })
    .join('')

const dots = (points: Point[], color: string) =>
  points.map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1" ${fill(color)}/>`).join('')

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
  gasMask: [
    '...kkkkkk...',
    '..kaaaaaak..',
    '.kaaaaaaaak.',
    '.kammmmmmak.',
    '.kmeemmeemk.',
    '.kmeemmeemk.',
    '.kmmmMMmmmk.',
    '..kmmMMmmk..',
    '..kkmrrmkk..',
  ],
  goggles: [
    '...kkkkkk...',
    '..kaaaaaak..',
    '.kaAaaaaAak.',
    '.kkkkkkkkkk.',
    '.keekkkkeek.',
    '.kssssssssk.',
    '.krrrrrrrrk.',
    '..kRrrrrRk..',
    '...kkrrkk...',
  ],
  visor: [
    '...kkkkkk...',
    '..kMMMMMMk..',
    '.kMMMMMMMMk.',
    '.keeeeeeeek.',
    '.kMMMMMMMMk.',
    '..kMMkkMMk..',
    '...kkMMkk...',
    '....kMMk....',
    '...kkkkkk...',
  ],
  welder: [
    '...kkkkkk...',
    '..kyyyyyyk..',
    '.kyyyyyyyyk.',
    'kkkkkkkkkkkk',
    '.kMMMMMMMMk.',
    '.kMkeeeekMk.',
    '.kMMMMMMMMk.',
    '..kMMMMMMk..',
    '...kkkkkk...',
  ],
  bandaged: [
    '...kkkkkk...',
    '..kaaaaaak..',
    '.kaaAAAAaak.',
    '.kaAwwwwAak.',
    '.kawekkewak.',
    '.kawwwwwwak.',
    '.kaAwkkwAak.',
    '..kawwwwak..',
    '...kkkkkk...',
  ],
  punk: [
    '....kppk....',
    '...kppppk...',
    '..kkppppkk..',
    '.kssssssssk.',
    '.kkkkssseek.',
    '.kssssssssk.',
    '.ksskkkkssk.',
    '..kssssssk..',
    '...kkkkkk...',
  ],
}

const BODIES: Record<string, Sprite> = {
  coat: [
    '.kaakkkkaak.',
    'kaAaakkaaAak',
    'kaAaaaaaaAak',
    'kaAayyaaaaAk',
    'kaaaaaaaaaak',
    'kaaaaaaaaaak',
    '.kaaakkaaak.',
    '.kbbk..kbbk.',
    '.kkkk..kkkk.',
  ],
  rags: [
    '.kwwkaakwwk.',
    'kwwwwkkwwwwk',
    'kwwwwaawwwwk',
    'kwwawwwwawwk',
    'kwwwwaawwwwk',
    'kkwwwwwwwwkk',
    '.kbbbkkbbbk.',
    '.kbbk..kbbk.',
    '.kkkk..kkkk.',
  ],
  hazmat: [
    '.kaaaaaaaak.',
    'kAaaaaaaaaAk',
    'kAakkkkkkaAk',
    'kAakyyyykaAk',
    'kAakkkkkkaAk',
    'kAaaaaaaaaAk',
    '.kaaakkaaak.',
    '.kmmk..kmmk.',
    '.kkkk..kkkk.',
  ],
}

const CONDUCTOR: Sprite = [
  '...kkkkkk...',
  '..kMMMMMMk..',
  '.kMMMMMMMMk.',
  '.kcccccccck.',
  '.kMMMMMMMMk.',
  '..kMMppMMk..',
  '...kkMMkk...',
  '.kkkkkkkkkk.',
  'kmmmkppkmmmk',
  'kmmmmkkmmmmk',
  'kmmmmmmmmmmk',
  'kmmcmmmmcmmk',
  'kmmmmmmmmmmk',
  'kmmmmmmmmmmk',
  'kmmmmkkmmmmk',
  '.kmmk..kmmk.',
  '.kmmk..kmmk.',
  '.kkkk..kkkk.',
]

const COATS: [string, string][] = [
  ['#3d4536', '#5e6a4c'],
  ['#5a2a1c', '#8a4527'],
  ['#222c3d', '#3a4a63'],
  ['#3a3a3a', '#5c5c5c'],
  ['#8a7a1c', '#c4ad2c'],
  ['#3a2540', '#5e3d68'],
  ['#1e3b3a', '#2f5e5b'],
]

const EYES = ['#9dff5c', '#2ee6d6', '#ff3d8b', '#ffb03d', '#e8e8e8']

type Instrument = (isPlaying: boolean, delay: number) => string

const VIOLIN: Sprite = ['kk......', 'kBBk....', '.kBrBk..', '..kBBBk.', '...kBBk.', '....kk..']
const CELLO: Sprite = ['..kk..', '..kk..', '..kk..', '.kBBk.', 'kBBBBk', 'kBrrBk', '.kBBk.', 'kBBBBk', 'kBBBBk', 'kBrrBk', '.kBBk.', '..kk..', '..k...']
const TRUMPET: Sprite = ['.......yy', 'kyyyyyyyy', '..ky.k.yy', '.......yy']
const GUITAR: Sprite = ['.kRRk.', 'kRRRRk', 'kRkkRk', 'kRRRRk', '.kkkk.']
const BARREL: Sprite = [
  '.kkkkkkkkkkkk.',
  'kmMMMMMMMMMMmk',
  'kkkkkkkkkkkkkk',
  'kRRrrRRrrRRrrk',
  'kykkykkykkykkk',
  'kRrrRRrrRRrrRk',
  'krrRRrrRRrrRRk',
  'kkkkkkkkkkkkkk',
]
const LID: Sprite = ['.k.', 'kMk', 'kMk', 'kMk', 'kMk', '.k.']
const BUCKET: Sprite = ['..kkk..', '.kMMMk.', '.kMMMk.', 'kMMMMMk', 'kMMMMMk', 'kkkkkkk']
const RUST_BUCKET: Sprite = ['..kkk..', '.kRRRk.', '.kRRRk.', 'kRRrRRk', 'kRRRRRk', 'kkkkkkk']
const TIRE: Sprite = [
  '..kkkkkkkkkk..',
  '.kmmmmmmmmmmk.',
  'kmmkkkkkkkkmmk',
  'kmkMMMMMMMMkmk',
  'kmmkkkkkkkkmmk',
  '.kmmmmmmmmmmk.',
  '..kkkkkkkkkk..',
]

const puff = (x: number, y: number) => dots([[x, y], [x + 1, y - 1], [x + 2, y - 3]], 'w')

const MELODIC: Record<string, Instrument> = {
  violin: (isPlaying, delay) =>
    pixels(VIOLIN, -4, 8) +
    twoFrames(dots(diagonal(-5, 15, 9, 0.7), 'w'), dots(diagonal(-2, 15, 9, 0.7), 'w'), isPlaying, 0.5, delay),
  cello: (isPlaying, delay) =>
    pixels(CELLO, -4, 5) +
    twoFrames(dots(diagonal(-8, 12, 10, 0), 'w'), dots(diagonal(-5, 12, 10, 0), 'w'), isPlaying, 0.7, delay),
  trumpet: (isPlaying, delay) => pixels(TRUMPET, 8, 5) + twoFrames('', puff(18, 5), isPlaying, 0.5, delay),
  accordion: (isPlaying, delay) =>
    twoFrames(
      pixels(Array(4).fill('kMMkRwRwRkMMk'), -1, 9),
      pixels(Array(4).fill('kMMkRwRkMMk'), 0, 9),
      isPlaying,
      0.8,
      delay,
    ),
  guitar: (isPlaying, delay) =>
    pixels(GUITAR, -3, 10) +
    dots(diagonal(3, 11, 9, 0.7), 'b') +
    dots([[12, 4], [13, 4]], 'k') +
    twoFrames(dots([[0, 11]], 's'), dots([[0, 13]], 's'), isPlaying, 0.3, delay),
  flute: (isPlaying, delay) =>
    dots(diagonal(5, 7, 13, 0), 'M') +
    dots([[9, 7], [11, 7], [13, 7]], 'k') +
    twoFrames('', dots([[19, 5], [20, 4]], 'l'), isPlaying, 0.6, delay),
}

const sticks = (isUp: boolean, hitY: number) =>
  isUp
    ? dots([[1, 9], [0, 8], [-1, 7], [-2, 6]], 'w') + dots([[10, 9], [11, 8], [12, 7], [13, 6]], 'w')
    : dots([[1, 10], [1, 11], [2, hitY - 1], [2, hitY]], 'w') + dots([[10, 10], [10, 11], [9, hitY - 1], [9, hitY]], 'w')

const pipes = (isLeftMallet: boolean) => {
  const columns = Array.from({ length: 7 }, (_, i) => {
    const height = 7 - i % 4
    return Array.from({ length: height }, (_, row) => [-2 + i * 2, 18 - height + row] as Point)
  }).flat()
  const mallet = isLeftMallet ? [[1, 10], [1, 11]] : [[9, 11], [9, 12]]

  return dots([[-3, 18], [13, 18]], 'k') + dots(columns, 'y') + dots(mallet as Point[], 'p')
}

const PERCUSSION: Record<string, Instrument> = {
  barrel: (isPlaying, delay) => twoFrames(sticks(true, 13), sticks(false, 13), isPlaying, 0.3, delay) + pixels(BARREL, -1, 13),
  lids: (isPlaying, delay) =>
    twoFrames(
      pixels(LID, -3, 7) + pixels(LID, 12, 7),
      pixels(LID, 3, 5) + pixels(LID, 6, 5) + dots([[5, 3], [4, 2], [6, 2]], 'y'),
      isPlaying,
      0.6,
      delay,
    ),
  buckets: (isPlaying, delay) =>
    twoFrames(sticks(true, 12), sticks(false, 12), isPlaying, 0.35, delay) + pixels(BUCKET, -3, 12) + pixels(RUST_BUCKET, 7, 12),
  pipes: (isPlaying, delay) => twoFrames(pipes(true), pipes(false), isPlaying, 0.4, delay),
  tire: (isPlaying, delay) =>
    twoFrames(dots([[2, 11], [9, 11]], 's'), dots([[3, 12], [8, 12]], 's'), isPlaying, 0.3, delay) + pixels(TIRE, -1, 12),
}

const keys = <T>(record: Record<string, T>) => Object.keys(record)

const pick = <T>(list: T[], seed: number) => list[Math.floor(seed * list.length) % list.length]

const noise = (seed: number) => {
  const value = Math.sin(seed * 78.233 + 12.9898) * 43758.5453
  return value - Math.floor(value)
}

export const SPRITES =
  keys(HEADS).map(name => `<g id="head-${name}">${pixels(HEADS[name])}</g>`).join('') +
  keys(BODIES).map(name => `<g id="body-${name}">${pixels(BODIES[name], 0, 9)}</g>`).join('') +
  `<g id="sp-conductor">${pixels(CONDUCTOR)}</g>`

export type Role = 'melodic' | 'percussion' | 'conductor'

const baton = (isRight: boolean) =>
  isRight
    ? dots([[11, 9], [12, 8], [13, 7], [14, 6]], 'p') + dots([[15, 5]], 'c')
    : dots([[11, 9], [11, 8], [10, 7], [10, 6]], 'p') + dots([[9, 5]], 'c')

const musician = (role: Exclude<Role, 'conductor'>, seed: number, isPlaying: boolean, delay: number) => {
  const instruments = role === 'melodic' ? MELODIC : PERCUSSION
  const instrument = instruments[pick(keys(instruments), noise(seed + 1))]
  const [coat, light] = pick(COATS, noise(seed + 2))
  const style = `--a:${coat};--A:${light};--e:${pick(EYES, noise(seed + 3))}`

  return (
    `<g style="${style}">` +
    `<use href="#body-${pick(keys(BODIES), noise(seed + 5))}"/>` +
    `<use href="#head-${pick(keys(HEADS), noise(seed + 6))}"/>` +
    `${instrument(isPlaying, delay)}</g>`
  )
}

export const character = (x: number, y: number, role: Role, index: number, isPlaying: boolean, generation: number) => {
  const delay = (index % 4) * 0.15
  const seed = index * 31 + generation * 977 + (role === 'percussion' ? 500 : 0)
  const art =
    role === 'conductor'
      ? '<use href="#sp-conductor"/>' + twoFrames(baton(true), baton(false), isPlaying, 0.9, 0)
      : musician(role, seed, isPlaying, delay)

  return (
    `<g transform="translate(${x - 18} ${y - 54}) scale(${PX})"><g>${hop(isPlaying, delay)}` +
    `<rect x="1" y="17" width="10" height="1" fill="#000" opacity="0.45"/>${art}</g></g>`
  )
}
