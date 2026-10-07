import type { Orchestra } from '../types'

import { PX, character, pixels, sprites } from './cast.ts'
import type { Role } from './cast.ts'
import { THEMES } from './themes.ts'
import type { Theme } from './themes.ts'

const W = 520

const themeOf = (o: Orchestra): Theme => o.theme ?? 'dystopian'

const isMoving = (o: Orchestra) => o.isPlaying || o.isPerforming

const arc = (count: number, centerX: number, baseY: number, spread: number, depth: number): [number, number][] =>
  Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0 : (i / (count - 1)) * 2 - 1
    return [Math.round(centerX + t * spread), Math.round(baseY - (1 - t * t) * depth)]
  })

const noise = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

const floatingNotes = (isPlaying: boolean, note: string[]) => {
  if (!isPlaying) return ''

  return Array.from({ length: 6 }, (_, i) => {
    const x = 70 + i * 72
    const delay = i * 0.5
    return (
      `<g opacity="0"><animateTransform attributeName="transform" type="translate" values="${x} 230;${x} 200;${x} 170;${x} 140" calcMode="discrete" dur="2.4s" begin="${delay}s" repeatCount="indefinite"/>` +
      `<animate attributeName="opacity" values="0;0.9;0.7;0" calcMode="discrete" dur="2.4s" begin="${delay}s" repeatCount="indefinite"/>` +
      `<g transform="scale(${PX})">${pixels(note)}</g></g>`
    )
  }).join('')
}

type Backdrop = {
  background: string
  defs: string
  back: string
  riser: string
  conductorSpot: string
  front: string
  frame: string
  note: string[]
  emptySeat: string[]
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

const dystopian = (o: Orchestra): Backdrop => {
  const hazard = Array.from({ length: 27 }, (_, i) => `<rect x="${i * 20}" y="240" width="10" height="5" fill="#e6c13d"/>`).join('')
  const struts = [124, 190, 256, 322, 390].map(x => `<rect x="${x}" y="218" width="6" height="22" fill="#25282b"/>`).join('')

  return {
    background: '#0a0e12',
    defs:
      '<linearGradient id="smog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0e12"/><stop offset="0.7" stop-color="#1f2b25"/><stop offset="1" stop-color="#34402f"/></linearGradient>' +
      '<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4740"/><stop offset="1" stop-color="#1c1b18"/></linearGradient>',
    back: `<rect width="${W}" height="360" fill="url(#smog)"/>
<rect x="430" y="30" width="24" height="24" fill="#b8c26a" opacity="0.35"/><rect x="434" y="34" width="16" height="16" fill="#d8e08a" opacity="0.4"/>
${SKYLINE}
<rect x="0" y="0" width="22" height="240" fill="#0c0f12"/><rect x="${W - 22}" y="0" width="22" height="240" fill="#0c0f12"/>
<path d="M22 0 h476 v14 h-30 v10 h-40 v-10 h-120 v6 h-60 v-6 h-226z" fill="#0c0f12"/>
<g><rect x="170" y="22" width="180" height="26" fill="#0b0d10" stroke="#ff3d8b" stroke-width="2"/>
<text x="260" y="40" text-anchor="middle" font-family="Courier New, monospace" font-weight="bold" font-size="13" letter-spacing="2" fill="#ff3d8b">SYMPHONY Nº ${o.ovations + 1}</text></g>
<rect x="196" y="48" width="2" height="16" fill="#2a2d31"/><rect x="322" y="48" width="2" height="16" fill="#2a2d31"/>
<rect x="0" y="245" width="${W}" height="115" fill="url(#ground)"/>${hazard}<rect x="0" y="238" width="${W}" height="2" fill="#07080b"/>
${RUBBLE}`,
    riser: `<rect x="118" y="208" width="284" height="8" fill="#2c2f33"/><rect x="118" y="216" width="284" height="2" fill="#07080b"/>${struts}
<path d="M130 218 l60 20 M196 218 l60 20 M262 218 l60 20 M328 218 l60 20" stroke="#25282b" stroke-width="3"/>
${searchlights(isMoving(o))}`,
    conductorSpot: `<g transform="translate(236 330) scale(${PX})">${pixels(['kkkkkkkkkkkkkkkk', 'kyykyykyykyykyyk', 'kmmmmmmmmmmmmmmk', 'kMmmmmmmmmmmmmMk', 'kkkkkkkkkkkkkkkk'])}</g>`,
    front: '',
    frame: '#2ee6d6',
    note: ['..ll.', '..l.l', '..l..', 'lll..', 'lll..'],
    emptySeat: ['kkkkkkkk', 'kBbBbBbk', 'kbBbBbBk', 'kBbBbBbk', 'kkkkkkkk'],
  }
}

const BRICKS =
  '<pattern id="bricks" width="24" height="12" patternUnits="userSpaceOnUse"><rect width="24" height="12" fill="#0e0a14"/>' +
  '<rect x="1" y="1" width="22" height="4" fill="#1d1422"/><rect x="-11" y="7" width="22" height="4" fill="#191120"/><rect x="13" y="7" width="22" height="4" fill="#211626"/></pattern>'

const VELVET =
  '<pattern id="velvet" width="16" height="10" patternUnits="userSpaceOnUse"><rect width="16" height="10" fill="#1c0610"/><rect x="2" width="6" height="10" fill="#2e0a18"/><rect x="4" width="2" height="10" fill="#45122a" opacity="0.6"/></pattern>'

const SOFT = 'shape-rendering="geometricPrecision"'

const NIGHT_DEFS =
  BRICKS +
  VELVET +
  '<linearGradient id="boards" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1a14"/><stop offset="1" stop-color="#0a0608"/></linearGradient>' +
  '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070b1c"/><stop offset="1" stop-color="#1b2a55"/></linearGradient>' +
  '<radialGradient id="smoke"><stop offset="0" stop-color="#c8d4ff" stop-opacity="0.16"/><stop offset="1" stop-color="#c8d4ff" stop-opacity="0"/></radialGradient>' +
  '<radialGradient id="glow"><stop offset="0" stop-color="#ffb35c" stop-opacity="0.35"/><stop offset="1" stop-color="#ffb35c" stop-opacity="0"/></radialGradient>' +
  '<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb8ff" stop-opacity="0.22"/><stop offset="1" stop-color="#9fb8ff" stop-opacity="0.02"/></linearGradient>' +
  '<radialGradient id="vignette" cx="0.5" cy="0.62" r="0.75"><stop offset="0.45" stop-color="#05060d" stop-opacity="0"/><stop offset="1" stop-color="#05060d" stop-opacity="0.75"/></radialGradient>'

const window = () => {
  const towers = [[78, 150, 18], [98, 128, 14], [114, 142, 20], [136, 120, 12], [150, 138, 18]]
    .map(([x, top, width]) => `<rect x="${x}" y="${top}" width="${width}" height="${190 - top}" fill="#0a0f22"/>`)
    .join('')
  const lights = Array.from({ length: 14 }, (_, i) => {
    const x = 80 + Math.floor(noise(i + 700) * 84)
    const y = 130 + Math.floor(noise(i + 800) * 52)
    return `<rect x="${x}" y="${y}" width="2" height="2" fill="#ffcf7a" opacity="${0.4 + noise(i + 900) * 0.5}"/>`
  }).join('')

  return (
    '<rect x="72" y="92" width="104" height="100" fill="url(#sky)"/>' +
    `<circle cx="148" cy="116" r="11" fill="#f2e8c4" opacity="0.9" ${SOFT}/><circle cx="152" cy="113" r="10" fill="#0f1836" opacity="0.55" ${SOFT}/>` +
    towers + lights +
    '<rect x="70" y="90" width="108" height="4" fill="#120c10"/><rect x="70" y="190" width="108" height="5" fill="#120c10"/>' +
    '<rect x="70" y="90" width="4" height="104" fill="#120c10"/><rect x="174" y="90" width="4" height="104" fill="#120c10"/>' +
    '<rect x="122" y="92" width="3" height="100" fill="#120c10"/><rect x="72" y="140" width="104" height="3" fill="#120c10"/>'
  )
}

const bar = () => {
  const bottles = Array.from({ length: 9 }, (_, i) => {
    const x = 350 + i * 13
    const shelf = i % 2 ? 128 : 160
    const color = ['#2f5a3a', '#6b3a1a', '#3a2a5a', '#8a6a2a'][i % 4]
    return `<rect x="${x}" y="${shelf - 16}" width="6" height="16" fill="${color}"/><rect x="${x + 2}" y="${shelf - 21}" width="2" height="5" fill="${color}"/><rect x="${x + 1}" y="${shelf - 14}" width="1" height="8" fill="#ffcf7a" opacity="0.35"/>`
  }).join('')

  return `<rect x="344" y="128" width="124" height="3" fill="#2a1a12"/><rect x="344" y="160" width="124" height="3" fill="#2a1a12"/>${bottles}`
}

const smoke = (layer: number) =>
  Array.from({ length: 4 }, (_, i) => {
    const x = 60 + i * 130 + layer * 40
    const y = 120 + layer * 70 + (i % 2) * 30
    const duration = 38 + i * 9 + layer * 7
    const drift = (i % 2 ? -1 : 1) * (60 + layer * 20)
    return (
      `<ellipse cx="${x}" cy="${y}" rx="${110 - layer * 20}" ry="${34 - layer * 6}" fill="url(#smoke)" ${SOFT}>` +
      `<animateTransform attributeName="transform" type="translate" values="0 0;${drift} -8;0 0" dur="${duration}s" repeatCount="indefinite"/></ellipse>`
    )
  }).join('')

const table = (x: number) =>
  `<ellipse cx="${x}" cy="352" rx="34" ry="9" fill="#06040a" ${SOFT}/><rect x="${x - 3}" y="352" width="6" height="10" fill="#06040a"/>` +
  `<circle cx="${x}" cy="342" r="16" fill="url(#glow)" ${SOFT}/><rect x="${x - 2}" y="338" width="4" height="8" fill="#e8dcc0"/><rect x="${x - 1}" y="335" width="2" height="3" fill="#ffcc66"/>`

const jazz = (o: Orchestra): Backdrop => {
  const planks = Array.from({ length: 8 }, (_, i) => `<rect x="0" y="${246 + i * 14}" width="${W}" height="1" fill="#000" opacity="0.5"/>`).join('')

  return {
    background: '#07060c',
    defs: NIGHT_DEFS,
    back: `<rect width="${W}" height="245" fill="url(#bricks)"/>
${window()}
${bar()}
<text x="260" y="66" text-anchor="middle" font-family="Brush Script MT, Snell Roundhand, cursive" font-size="54" fill="none" stroke="#3fb8ff" stroke-width="7" opacity="0.18">Jazz</text>
<text x="260" y="66" text-anchor="middle" font-family="Brush Script MT, Snell Roundhand, cursive" font-size="54" fill="#8fdcff">Jazz</text>
<text x="260" y="88" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="11" letter-spacing="3" fill="#e88aa8">late night · session nº ${o.ovations + 1}</text>
<rect x="0" y="245" width="${W}" height="115" fill="url(#boards)"/>${planks}<rect x="0" y="242" width="${W}" height="3" fill="#3a2418"/>
<rect x="0" y="0" width="44" height="300" fill="url(#velvet)"/><rect x="${W - 44}" y="0" width="44" height="300" fill="url(#velvet)"/>
<path d="M0 0 h${W} v18 ${Array.from({ length: 13 }, () => 'q-20 14 -40 0').join(' ')}z" fill="url(#velvet)"/>
${smoke(0)}`,
    riser: `<rect x="110" y="208" width="300" height="10" fill="#24140c"/><rect x="110" y="208" width="300" height="1" fill="#5a3a24"/><rect x="110" y="218" width="300" height="24" fill="#140a06"/>
<path d="M230 0 L120 300 L400 300 L290 0z" fill="url(#beam)" ${SOFT}/>`,
    conductorSpot: `<ellipse cx="260" cy="332" rx="40" ry="8" fill="#ffcf7a" opacity="0.18" ${SOFT}/>`,
    front: `${[40, 140, 380, 480].map(table).join('')}${smoke(1)}${smoke(2)}<rect width="${W}" height="360" fill="url(#vignette)"/>`,
    frame: '#3a4a7a',
    note: ['..cc.', '..c.c', '..c..', 'ccc..', 'ccc..'],
    emptySeat: ['.kkkkkk.', 'kBBBBBBk', '.kkkkkk.', '..k..k..', '..k..k..', '.kk..kk.'],
  }
}

const DANCE_FLOOR: [number, number][] = [[100, 330], [420, 330], [175, 334], [345, 334]]

const BACKDROPS: Record<Theme, (o: Orchestra) => Backdrop> = { dystopian, jazz }

const section = (positions: [number, number][], role: Role, o: Orchestra, spot: [number, number], seat: string[]) =>
  positions.length === 0
    ? `<g transform="translate(${spot[0] - 12} ${spot[1] - 15}) scale(${PX})" opacity="0.5">${pixels(seat)}</g>`
    : positions.map(([x, y], i) => character(x, y, role, i, isMoving(o), o.salt, themeOf(o))).join('')

export const stage = (o: Orchestra) => {
  const theme = themeOf(o)
  const backdrop = BACKDROPS[theme](o)
  const violinCount = Math.min(o.violins, 8)
  const drumCount = Math.min(o.drums, 5)
  const violins = arc(violinCount, 260, 306, Math.min(180, 27 * (violinCount - 1)), 30)
  const drums = arc(drumCount, 260, 222, Math.min(130, 34 * (drumCount - 1)), 6)

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 360" width="100%" height="100%" overflow="hidden" style="display:block;background:${backdrop.background}" shape-rendering="crispEdges">
<defs>${backdrop.defs}${sprites(theme)}</defs>
${backdrop.back}
${backdrop.riser}
${section(drums, 'percussion', o, [260, 208], backdrop.emptySeat)}
${section(violins, 'melodic', o, [260, 300], backdrop.emptySeat)}
${backdrop.conductorSpot}
${section(o.conductors > 0 ? [[260, 331]] : [], 'conductor', o, [260, 330], backdrop.emptySeat)}
${DANCE_FLOOR.slice(0, Math.min(o.dancers ?? 0, 4)).map(([x, y], i) => character(x, y, 'dancer', i, isMoving(o), o.salt, theme)).join('')}
${floatingNotes(isMoving(o), backdrop.note)}
${backdrop.front}
<rect width="${W}" height="360" fill="none" stroke="${backdrop.frame}" stroke-opacity="0.35" stroke-width="2"/>
</svg>`
}

const STAFF_STEPS = [0, 1, 2, 4, 5, 7, 8, 9]

type Sheet = {
  paper: string
  border: string
  ink: string
  dim: string
  font: string
  title: string
  measures: string
  empty: string
  isCrt: boolean
  isRound: boolean
}

const SHEETS: Record<Theme, (o: Orchestra) => Sheet> = {
  dystopian: o => ({
    paper: '#060a06',
    border: '#2a2d31',
    ink: '#9dff5c',
    dim: '#1d2a1c',
    font: 'Courier New, monospace',
    title: `// SCORE · WASTELAND SYMPHONY Nº ${o.ovations + 1}`,
    measures: `${o.measures} MEASURES`,
    empty: '&gt; AWAITING SIGNAL… EVERY TOOL CALL WRITES A MEASURE_',
    isCrt: true,
    isRound: false,
  }),
  jazz: o => ({
    paper: '#0d1226',
    border: '#1c2440',
    ink: '#e9dfc6',
    dim: '#232c48',
    font: 'Georgia, serif',
    title: `Lead sheet · Midnight Session Nº ${o.ovations + 1}`,
    measures: `${o.measures} bars`,
    empty: 'The band is waiting for the first tool call…',
    isCrt: false,
    isRound: true,
  }),
}

const noteGlyph = (x: number, step: number, sheet: Sheet) => {
  const y = 96 - (STAFF_STEPS[step] - 2) * 5
  const isStemUp = STAFF_STEPS[step] < 6
  const stem = isStemUp
    ? `<rect x="${x + 4}" y="${y - 26}" width="2" height="26" fill="${sheet.ink}"/>`
    : `<rect x="${x - 6}" y="${y}" width="2" height="26" fill="${sheet.ink}"/>`
  const ledger = step === 0 ? `<rect x="${x - 9}" y="105" width="18" height="2" fill="${sheet.ink}" opacity="0.6"/>` : ''
  const head = sheet.isRound
    ? `<ellipse cx="${x}" cy="${y + 0.5}" rx="6" ry="4.2" fill="${sheet.ink}" transform="rotate(-20 ${x} ${y})" shape-rendering="geometricPrecision"/>`
    : `<rect x="${x - 6}" y="${y - 3}" width="12" height="7" fill="${sheet.ink}"/>`

  return `${ledger}${head}${stem}`
}

export const STAGE_RATIO = 360 / W
export const SCORE_RATIO = 170 / W

export const score = (o: Orchestra, progress: number) => {
  const theme = themeOf(o)
  const sheet = SHEETS[theme](o)
  const notes = o.score.slice(-16)
  const staffLines = [56, 66, 76, 86, 96]
    .map(y => `<rect x="28" y="${y}" width="${W - 56}" height="1" fill="${sheet.ink}" opacity="0.35"/>`)
    .join('')
  const glyphs = notes.map((step, i) => noteGlyph(Math.round(96 + i * 25.5), step, sheet)).join('')
  const bars = [0, 1, 2, 3]
    .map(i => `<rect x="${96 + i * 102 + 89}" y="56" width="2" height="41" fill="${sheet.ink}" opacity="0.5"/>`)
    .join('')
  const movement = Math.min(3, Math.floor(progress * 4))
  const segments = Array.from({ length: 40 }, (_, i) => {
    const isLit = i < Math.round(progress * 40)
    return `<rect x="${40 + i * 11}" y="126" width="9" height="8" fill="${isLit ? sheet.ink : sheet.dim}"/>`
  }).join('')
  const labels = THEMES[theme].movements.map((name, i) => {
    const x = 40 + i * 110 + 55
    const opacity = i <= movement ? 1 : 0.35
    const text = sheet.isCrt ? name.toUpperCase() : name
    return `<text x="${x}" y="153" text-anchor="middle" font-family="${sheet.font}" font-size="10" fill="${sheet.ink}" opacity="${opacity}">${['I', 'II', 'III', 'IV'][i]}. ${text}</text>`
  }).join('')
  const empty =
    notes.length === 0
      ? `<text x="${W / 2}" y="82" text-anchor="middle" font-family="${sheet.font}" font-size="11" fill="${sheet.ink}" opacity="0.7">${sheet.empty}</text>`
      : ''
  const scanlines = sheet.isCrt
    ? Array.from({ length: 41 }, (_, i) => `<rect x="4" y="${4 + i * 4}" width="${W - 8}" height="1" fill="#000" opacity="0.25"/>`).join('')
    : ''
  const titleStyle = sheet.isCrt ? 'font-weight="bold"' : 'font-style="italic"'

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 170" width="100%" height="100%" overflow="hidden" style="display:block;background:${sheet.paper}" shape-rendering="crispEdges">
<rect x="0" y="0" width="${W}" height="170" fill="${sheet.border}"/><rect x="4" y="4" width="${W - 8}" height="162" fill="${sheet.paper}"/>
<text x="28" y="32" font-family="${sheet.font}" ${titleStyle} font-size="14" fill="${sheet.ink}">${sheet.title}</text>
<text x="${W - 28}" y="32" text-anchor="end" font-family="${sheet.font}" font-size="11" fill="${sheet.ink}" opacity="0.7">${sheet.measures}</text>
${staffLines}<text x="34" y="98" font-family="Georgia, serif" font-size="46" fill="${sheet.ink}" opacity="0.8">𝄞</text>
${bars}${glyphs}${empty}
${segments}
${labels}
${scanlines}
<rect x="4" y="4" width="${W - 8}" height="162" fill="none" stroke="${sheet.ink}" stroke-opacity="0.25"/>
</svg>`
}
