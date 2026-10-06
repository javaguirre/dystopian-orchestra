import type { Orchestra } from '../types'

import { PX, SPRITES, character, pixels } from './cast.ts'
import type { Role } from './cast.ts'

const W = 520

const NOTE = ['..ll.', '..l.l', '..l..', 'lll..', 'lll..']
const EMPTY_CRATE = ['kkkkkkkk', 'kBbBbBbk', 'kbBbBbBk', 'kBbBbBbk', 'kkkkkkkk']
const PODIUM = ['kkkkkkkkkkkkkkkk', 'kyykyykyykyykyyk', 'kmmmmmmmmmmmmmmk', 'kMmmmmmmmmmmmmMk', 'kkkkkkkkkkkkkkkk']

const emptySpot = (x: number, y: number) =>
  `<g transform="translate(${x - 12} ${y - 15}) scale(${PX})" opacity="0.5">${pixels(EMPTY_CRATE)}</g>`

const isMoving = (o: Orchestra) => o.isPlaying || o.isPerforming

const section = (positions: [number, number][], role: Role, o: Orchestra, spot: [number, number]) =>
  positions.length === 0
    ? emptySpot(...spot)
    : positions.map(([x, y], i) => character(x, y, role, i, isMoving(o), o.salt)).join('')

const arc = (count: number, centerX: number, baseY: number, spread: number, depth: number): [number, number][] =>
  Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0 : (i / (count - 1)) * 2 - 1
    return [Math.round(centerX + t * spread), Math.round(baseY - (1 - t * t) * depth)]
  })

const noise = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

const skyline = () => {
  const buildings: string[] = []
  let x = 0
  let index = 0
  while (x < W) {
    const width = Math.min(W - x, 24 + Math.floor(noise(index + 1) * 5) * 8)
    const height = 60 + Math.floor(noise(index + 50) * 9) * 10
    const top = 210 - height
    buildings.push(`<rect x="${x}" y="${top}" width="${width}" height="${height}" fill="${index % 2 ? '#141a1f' : '#10151a'}"/>`)
    for (let wy = top + 8; wy < 200; wy += 9) {
      for (let wx = x + 5; wx < x + width - 5; wx += 8) {
        const roll = noise(wx * 7 + wy)
        if (roll > 0.82) {
          const color = roll > 0.97 ? '#ff3d8b' : roll > 0.93 ? '#2ee6d6' : '#c9a24a'
          buildings.push(`<rect x="${wx}" y="${wy}" width="3" height="3" fill="${color}" opacity="0.7"/>`)
        }
      }
    }
    if (noise(index + 9) > 0.6) {
      buildings.push(`<rect x="${x + 4}" y="${top - 12}" width="2" height="12" fill="#10151a"/><rect x="${x + 4}" y="${top - 14}" width="2" height="2" fill="#ff3d3d"/>`)
    }
    x += width + 2
    index++
  }

  return buildings.join('')
}

const SKYLINE = skyline()

const RUBBLE = Array.from({ length: 26 }, (_, i) => {
  const x = Math.floor(noise(i + 200) * W)
  const y = 250 + Math.floor(noise(i + 300) * 100)
  const size = 3 + Math.floor(noise(i + 400) * 3) * 3
  return `<rect x="${x}" y="${y}" width="${size}" height="${Math.max(3, size - 3)}" fill="${i % 3 ? '#2b2a27' : '#3a3833'}"/>`
}).join('')

const floatingNotes = (isPlaying: boolean) => {
  if (!isPlaying) return ''

  return Array.from({ length: 6 }, (_, i) => {
    const x = 70 + i * 72
    const delay = i * 0.5
    return (
      `<g opacity="0"><animateTransform attributeName="transform" type="translate" values="${x} 230;${x} 200;${x} 170;${x} 140" calcMode="discrete" dur="2.4s" begin="${delay}s" repeatCount="indefinite"/>` +
      `<animate attributeName="opacity" values="0;0.9;0.7;0" calcMode="discrete" dur="2.4s" begin="${delay}s" repeatCount="indefinite"/>` +
      `<g transform="scale(${PX})">${pixels(NOTE)}</g></g>`
    )
  }).join('')
}

const sign = (o: Orchestra) => {
  return (
    `<g><rect x="170" y="22" width="180" height="26" fill="#0b0d10" stroke="#ff3d8b" stroke-width="2"/>` +
    `<text x="260" y="40" text-anchor="middle" font-family="Courier New, monospace" font-weight="bold" font-size="13" letter-spacing="2" fill="#ff3d8b">SINFONÍA Nº ${o.ovations + 1}</text></g>` +
    '<rect x="196" y="48" width="2" height="16" fill="#2a2d31"/><rect x="322" y="48" width="2" height="16" fill="#2a2d31"/>'
  )
}

const searchlights = (isPlaying: boolean) => {
  const sweep = (from: number, to: number, cx: number) =>
    isPlaying
      ? `<animateTransform attributeName="transform" type="rotate" values="${from} ${cx} 0;${to} ${cx} 0;${from} ${cx} 0" dur="6s" repeatCount="indefinite"/>`
      : ''

  return (
    `<path d="M60 0 L20 360 L140 360z" fill="#d8ffe0" opacity="0.05">${sweep(-6, 10, 60)}</path>` +
    `<path d="M460 0 L380 360 L500 360z" fill="#d8ffe0" opacity="0.05">${sweep(6, -10, 460)}</path>`
  )
}

export const stage = (o: Orchestra) => {
  const violinCount = Math.min(o.violins, 8)
  const drumCount = Math.min(o.drums, 5)
  const violins = arc(violinCount, 260, 306, Math.min(180, 27 * (violinCount - 1)), 30)
  const drums = arc(drumCount, 260, 222, Math.min(130, 34 * (drumCount - 1)), 6)
  const hazard = Array.from({ length: 27 }, (_, i) => `<rect x="${i * 20}" y="240" width="10" height="5" fill="#e6c13d"/>`).join('')
  const struts = [124, 190, 256, 322, 390].map(x => `<rect x="${x}" y="218" width="6" height="22" fill="#25282b"/>`).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 360" width="100%" height="100%" overflow="hidden" style="display:block;background:#0a0e12" shape-rendering="crispEdges">
<defs><linearGradient id="smog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0e12"/><stop offset="0.7" stop-color="#1f2b25"/><stop offset="1" stop-color="#34402f"/></linearGradient>
<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4740"/><stop offset="1" stop-color="#1c1b18"/></linearGradient>${SPRITES}</defs>
<rect width="${W}" height="360" fill="url(#smog)"/>
<rect x="430" y="30" width="24" height="24" fill="#b8c26a" opacity="0.35"/><rect x="434" y="34" width="16" height="16" fill="#d8e08a" opacity="0.4"/>
${SKYLINE}
<rect x="0" y="0" width="22" height="240" fill="#0c0f12"/><rect x="${W - 22}" y="0" width="22" height="240" fill="#0c0f12"/>
<path d="M22 0 h476 v14 h-30 v10 h-40 v-10 h-120 v6 h-60 v-6 h-226z" fill="#0c0f12"/>
${sign(o)}
<rect x="0" y="245" width="${W}" height="115" fill="url(#ground)"/>${hazard}<rect x="0" y="238" width="${W}" height="2" fill="#07080b"/>
${RUBBLE}
<rect x="118" y="208" width="284" height="8" fill="#2c2f33"/><rect x="118" y="216" width="284" height="2" fill="#07080b"/>${struts}
<path d="M130 218 l60 20 M196 218 l60 20 M262 218 l60 20 M328 218 l60 20" stroke="#25282b" stroke-width="3"/>
${searchlights(isMoving(o))}
${section(drums, 'percussion', o, [260, 208])}
${section(violins, 'melodic', o, [260, 300])}
<g transform="translate(236 330) scale(${PX})">${pixels(PODIUM)}</g>
${section(o.conductors > 0 ? [[260, 331]] : [], 'conductor', o, [260, 330])}
${floatingNotes(isMoving(o))}
<rect width="${W}" height="360" fill="none" stroke="#2ee6d6" stroke-opacity="0.35" stroke-width="2"/>
</svg>`
}

const STAFF_STEPS = [0, 1, 2, 4, 5, 7, 8, 9]
const MOVEMENT_NAMES = ['ALLEGRO', 'ADAGIO', 'SCHERZO', 'FINALE']
const PHOSPHOR = '#9dff5c'

const noteBlock = (x: number, step: number) => {
  const y = 96 - (STAFF_STEPS[step] - 2) * 5
  const isStemUp = STAFF_STEPS[step] < 6
  const stem = isStemUp
    ? `<rect x="${x + 4}" y="${y - 26}" width="2" height="26" fill="${PHOSPHOR}"/>`
    : `<rect x="${x - 6}" y="${y}" width="2" height="26" fill="${PHOSPHOR}"/>`
  const ledger = step === 0 ? `<rect x="${x - 9}" y="105" width="18" height="2" fill="${PHOSPHOR}" opacity="0.6"/>` : ''

  return `${ledger}<rect x="${x - 6}" y="${y - 3}" width="12" height="7" fill="${PHOSPHOR}"/>${stem}`
}

export const STAGE_RATIO = 360 / W
export const SCORE_RATIO = 170 / W

export const score = (o: Orchestra, progress: number) => {
  const notes = o.score.slice(-16)
  const staffLines = [56, 66, 76, 86, 96]
    .map(y => `<rect x="28" y="${y}" width="${W - 56}" height="1" fill="${PHOSPHOR}" opacity="0.35"/>`)
    .join('')
  const glyphs = notes.map((step, i) => noteBlock(Math.round(96 + i * 25.5), step)).join('')
  const bars = [0, 1, 2, 3]
    .map(i => `<rect x="${96 + i * 102 + 89}" y="56" width="2" height="41" fill="${PHOSPHOR}" opacity="0.5"/>`)
    .join('')
  const movement = Math.min(3, Math.floor(progress * 4))
  const segments = Array.from({ length: 40 }, (_, i) => {
    const isLit = i < Math.round(progress * 40)
    return `<rect x="${40 + i * 11}" y="126" width="9" height="8" fill="${isLit ? PHOSPHOR : '#1d2a1c'}"/>`
  }).join('')
  const labels = MOVEMENT_NAMES.map((name, i) => {
    const x = 40 + i * 110 + 55
    const opacity = i <= movement ? 1 : 0.35
    return `<text x="${x}" y="153" text-anchor="middle" font-family="Courier New, monospace" font-size="10" fill="${PHOSPHOR}" opacity="${opacity}">${['I', 'II', 'III', 'IV'][i]}. ${name}</text>`
  }).join('')
  const empty =
    notes.length === 0
      ? `<text x="${W / 2}" y="82" text-anchor="middle" font-family="Courier New, monospace" font-size="11" fill="${PHOSPHOR}" opacity="0.7">&gt; ESPERANDO SEÑAL… CADA HERRAMIENTA ESCRIBE UN COMPÁS_</text>`
      : ''
  const scanlines = Array.from({ length: 41 }, (_, i) => `<rect x="4" y="${4 + i * 4}" width="${W - 8}" height="1" fill="#000" opacity="0.25"/>`).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 170" width="100%" height="100%" overflow="hidden" style="display:block;background:#060a06" shape-rendering="crispEdges">
<rect x="0" y="0" width="${W}" height="170" fill="#2a2d31"/><rect x="4" y="4" width="${W - 8}" height="162" fill="#060a06"/>
<text x="28" y="32" font-family="Courier New, monospace" font-weight="bold" font-size="14" fill="${PHOSPHOR}">// PARTITURA · SINFONÍA DEL YERMO Nº ${o.ovations + 1}</text>
<text x="${W - 28}" y="32" text-anchor="end" font-family="Courier New, monospace" font-size="11" fill="${PHOSPHOR}" opacity="0.7">${o.measures} COMPASES</text>
${staffLines}<text x="34" y="98" font-family="Georgia, serif" font-size="46" fill="${PHOSPHOR}" opacity="0.8">𝄞</text>
${bars}${glyphs}${empty}
${segments}
${labels}
${scanlines}
<rect x="4" y="4" width="${W - 8}" height="162" fill="none" stroke="${PHOSPHOR}" stroke-opacity="0.25"/>
</svg>`
}
