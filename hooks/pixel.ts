export const PX = 3

export type Sprite = string[]
export type Point = [number, number]

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

const VARIABLE: Record<string, string> = { a: '--a', A: '--A', e: '--e', s: '--s', i: '--i', I: '--I', x: '--x', h: '--h' }

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

export const dots = (points: Point[], color: string) =>
  `<path d="${points.map(([x, y]) => `M${x} ${y}h1v1h-1z`).join('')}" ${fill(color)}/>`

export const diagonal = (fromX: number, fromY: number, length: number, slope: number): Point[] =>
  Array.from({ length }, (_, i) => [fromX + i, fromY - Math.round(i * slope)])

export const twoFrames = (a: string, b: string, isPlaying: boolean, dur: number, delay: number) =>
  isPlaying
    ? `<g>${a}<animate attributeName="opacity" values="1;0" calcMode="discrete" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/></g>` +
      `<g opacity="0">${b}<animate attributeName="opacity" values="0;1" calcMode="discrete" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/></g>`
    : a

export const hop = (isPlaying: boolean, delay: number) =>
  isPlaying
    ? `<animateTransform attributeName="transform" type="translate" values="0 0;0 -1" calcMode="discrete" dur="0.6s" begin="${delay}s" repeatCount="indefinite"/>`
    : ''

export type Instrument = (isPlaying: boolean, delay: number) => string

export type Rarity = 'common' | 'rare' | 'legendary'

export type Cast = {
  heads: Record<string, Sprite>
  bodies: Record<string, Sprite>
  accessories: Record<string, { behind: string; front: string }>
  melodic: Record<string, Instrument>
  percussion: Record<string, Instrument>
  lineup: string[]
  conductors: { name: string; sprite: Sprite; extra: (isPlaying: boolean) => string; octave: number }[]
  style: (next: () => number, rarity: Rarity) => string
}

export const hsl = (hue: number, saturation: number, lightness: number) =>
  `hsl(${Math.round(hue)} ${saturation}% ${lightness}%)`

