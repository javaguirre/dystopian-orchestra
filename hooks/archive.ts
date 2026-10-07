import type { Orchestra } from '../types'

import { conductorOf, isDancerInGown, traitsOf } from './cast.ts'
import { describeKey, keyOf, noteName, synthesize, toWav } from './music.ts'
import type { Key } from './music.ts'
import { stage } from './stage.ts'
import { THEMES } from './themes.ts'
import type { Theme } from './themes.ts'

const MAX_ARCHIVED_NOTES = 128

const LABELS: Record<string, string> = {
  gasMask: 'gas mask',
  goggles: 'goggles and scarf',
  visor: 'visor',
  welder: 'welding mask',
  bandaged: 'bandaged face',
  punk: 'punk mohawk',
  robot: 'robot',
  plague: 'plague doctor',
  cyclops: 'cyclops',
  helmet: 'army helmet',
  skull: 'skull',
  coat: 'coat',
  rags: 'rags',
  hazmat: 'hazmat suit',
  armor: 'armor',
  jumpsuit: 'jumpsuit',
  poncho: 'poncho',
  antenna: 'antenna',
  headphones: 'headphones',
  backpack: 'backpack',
  spikes: 'spiked shoulders',
  chain: 'chain',
  tank: 'gas tank',
  violin: 'violin',
  cello: 'cello',
  trumpet: 'trumpet',
  accordion: 'accordion',
  guitar: 'scrap guitar',
  flute: 'flute',
  sax: 'saxophone',
  theremin: 'theremin',
  saw: 'musical saw',
  keytar: 'keytar',
  barrel: 'oil barrel',
  lids: 'bin lids',
  buckets: 'buckets',
  pipes: 'pipe xylophone',
  tire: 'tyre',
  gong: 'manhole gong',
  cans: 'cans',
  fedora: 'fedora',
  shades: 'shades',
  beret: 'beret and goatee',
  afro: 'afro',
  pompadour: 'pompadour',
  porkpie: 'porkpie hat',
  suit: 'suit',
  vest: 'vest and shirtsleeves',
  tux: 'tuxedo',
  gown: 'evening gown',
  zoot: 'zoot suit',
  flower: 'boutonniere',
  pocketSquare: 'pocket square',
  pearls: 'pearls',
  watchChain: 'watch chain',
  scarf: 'silk scarf',
  trombone: 'trombone',
  clarinet: 'clarinet',
  bass: 'double bass',
  piano: 'electric piano',
  archtop: 'archtop guitar',
  kit: 'drum kit',
  guttedPiano: 'gutted piano',
  washtubBass: 'washtub bass',
  dentedSax: 'taped-up saxophone',
  bentTrumpet: 'bent trumpet',
  congas: 'congas',
  vibes: 'vibraphone',
  bongos: 'bongos',
  ride: 'ride cymbal and brushes',
}

const RARITY = { common: 'common', rare: 'rare', legendary: '**legendary**' }

const label = (name: string) => LABELS[name] ?? name

const themeOf = (o: Orchestra): Theme => o.theme ?? 'dystopian'

const pad = (n: number) => String(n).padStart(2, '0')

const stamp = (date: Date) => ({
  day: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
  time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
})

const rosterRows = (o: Orchestra) => {
  const section = (role: 'melodic' | 'percussion', count: number, name: string) =>
    Array.from({ length: count }, (_, index) => {
      const traits = traitsOf(role, index, o.salt, themeOf(o))
      const look = [traits.head, traits.body, traits.accessory].filter(part => part !== 'none').map(label).join(' · ')
      return `| ${name} | ${look} | ${label(traits.instrument)} | ${RARITY[traits.rarity]} |`
    })
  const copy = THEMES[themeOf(o)]
  const conductor = o.conductors > 0 ? [`| Leading | ${conductorOf(o.salt, themeOf(o)).name} ×${o.conductors} | ${copy.conductorTool} | common |`] : []

  const dancers = Array.from({ length: o.dancers ?? 0 }, (_, index) => {
    const traits = traitsOf('dancer', index, o.salt, themeOf(o))
    const outfit = isDancerInGown(index, o.salt) ? 'long dress' : 'dance outfit'
    return `| Dancing | ${label(traits.head)} · ${outfit} | — | ${RARITY[traits.rarity]} |`
  })

  return [...section('melodic', o.violins, 'Melodic'), ...section('percussion', o.drums, 'Percussion'), ...dancers, ...conductor]
}

const scoreRows = (score: number[], key: Key) =>
  Array.from({ length: Math.ceil(score.length / 4) }, (_, measure) => {
    const notes = score.slice(measure * 4, measure * 4 + 4).map(degree => noteName(key, degree))
    return `| ${measure + 1} | ${notes.join(' · ')} |`
  })

const markdown = (o: Orchestra, key: Key, when: { day: string; time: string }, name: string) =>
  [
    `# ${THEMES[themeOf(o)].pieceTitle} Nº ${o.ovations + 1}`,
    '',
    `![The band that played it](${name}.svg)`,
    '',
    `- **Premiered:** ${when.day} ${when.time}`,
    `- **Measures:** ${o.measures}`,
    `- **Notes earned:** ${Math.round(o.earned)}`,
    `- **Key:** ${describeKey(key)}`,
    `- **Audio:** [${name}.wav](${name}.wav)`,
    '',
    '## Band',
    '',
    '| Section | Musician | Instrument | Rarity |',
    '| --- | --- | --- | --- |',
    ...rosterRows(o),
    '',
    '## Score',
    '',
    '| Measure | Notes |',
    '| --- | --- |',
    ...scoreRows(o.fullScore, key),
    '',
  ].join('\n')

const bandPortrait = (o: Orchestra) =>
  stage({ ...o, isPlaying: false, isPerforming: false }).replace('width="100%" height="100%"', 'width="1040" height="720"')

export const archiveFiles = (o: Orchestra, now: Date) => {
  const when = stamp(now)
  const key = keyOf(o.salt, themeOf(o))
  const name = `${THEMES[themeOf(o)].fileName}-n${o.ovations + 1}-${when.day}`
  const audio = toWav(synthesize({ ...o, score: o.fullScore }, { limit: MAX_ARCHIVED_NOTES }))

  return [
    { file: `${name}.wav`, command: 'base64 -d', content: audio.toBase64() },
    { file: `${name}.svg`, command: 'cat', content: bandPortrait(o) },
    { file: `${name}.md`, command: 'cat', content: markdown(o, key, when, name) },
  ]
}
