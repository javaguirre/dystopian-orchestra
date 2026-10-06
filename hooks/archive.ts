import type { Orchestra } from '../types'

import { traitsOf } from './cast.ts'
import { describeKey, keyOf, noteName, synthesize, toWav } from './music.ts'
import type { Key } from './music.ts'
import { stage } from './stage.ts'

const MAX_ARCHIVED_NOTES = 128

const LABELS: Record<string, string> = {
  gasMask: 'máscara de gas',
  goggles: 'gafas y bufanda',
  visor: 'visor',
  welder: 'careta de soldador',
  bandaged: 'cara vendada',
  punk: 'cresta punk',
  robot: 'robot',
  plague: 'médico de la peste',
  cyclops: 'cíclope',
  helmet: 'casco militar',
  skull: 'calavera',
  coat: 'abrigo',
  rags: 'harapos',
  hazmat: 'traje químico',
  armor: 'armadura',
  jumpsuit: 'mono de trabajo',
  poncho: 'poncho',
  antenna: 'antena',
  headphones: 'cascos',
  backpack: 'mochila',
  spikes: 'hombreras con pinchos',
  chain: 'cadena',
  tank: 'bombona',
  violin: 'violín',
  cello: 'violonchelo',
  trumpet: 'trompeta',
  accordion: 'acordeón',
  guitar: 'guitarra de chatarra',
  flute: 'flauta',
  sax: 'saxofón',
  theremin: 'theremín',
  saw: 'sierra musical',
  keytar: 'keytar',
  barrel: 'bidón',
  lids: 'tapas de cubo',
  buckets: 'cubos',
  pipes: 'xilófono de tuberías',
  tire: 'neumático',
  gong: 'gong de alcantarilla',
  cans: 'latas',
}

const RARITY = { common: 'común', rare: 'raro', legendary: '**legendario**' }

const label = (name: string) => LABELS[name] ?? name

const pad = (n: number) => String(n).padStart(2, '0')

const stamp = (date: Date) => ({
  day: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
  time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
})

const rosterRows = (o: Orchestra) => {
  const section = (role: 'melodic' | 'percussion', count: number, name: string) =>
    Array.from({ length: count }, (_, index) => {
      const traits = traitsOf(role, index, o.salt)
      const look = [traits.head, traits.body, traits.accessory].filter(part => part !== 'none').map(label).join(' · ')
      return `| ${name} | ${look} | ${label(traits.instrument)} | ${RARITY[traits.rarity]} |`
    })
  const conductor = o.conductors > 0 ? [`| Dirección | director cíborg ×${o.conductors} | batuta de neón | común |`] : []

  return [...section('melodic', o.violins, 'Melódica'), ...section('percussion', o.drums, 'Percusión'), ...conductor]
}

const scoreRows = (score: number[], key: Key) =>
  Array.from({ length: Math.ceil(score.length / 4) }, (_, measure) => {
    const notes = score.slice(measure * 4, measure * 4 + 4).map(degree => noteName(key, degree))
    return `| ${measure + 1} | ${notes.join(' · ')} |`
  })

const markdown = (o: Orchestra, key: Key, when: { day: string; time: string }, name: string) =>
  [
    `# Sinfonía del Yermo nº ${o.ovations + 1}`,
    '',
    `![La banda que la creó](${name}.svg)`,
    '',
    `- **Estreno:** ${when.day} ${when.time}`,
    `- **Compases:** ${o.measures}`,
    `- **Notas ganadas:** ${Math.round(o.earned)}`,
    `- **Tonalidad:** ${describeKey(key)}`,
    `- **Audio:** [${name}.wav](${name}.wav)`,
    '',
    '## Plantilla',
    '',
    '| Sección | Músico | Instrumento | Rareza |',
    '| --- | --- | --- | --- |',
    ...rosterRows(o),
    '',
    '## Partitura',
    '',
    '| Compás | Notas |',
    '| --- | --- |',
    ...scoreRows(o.fullScore, key),
    '',
  ].join('\n')

const bandPortrait = (o: Orchestra) =>
  stage({ ...o, isPlaying: false, isPerforming: false }).replace('width="100%" height="100%"', 'width="1040" height="720"')

export const archiveFiles = (o: Orchestra, now: Date) => {
  const when = stamp(now)
  const key = keyOf(o.salt)
  const name = `sinfonia-del-yermo-n${o.ovations + 1}-${when.day}`
  const audio = toWav(synthesize({ ...o, score: o.fullScore }, { limit: MAX_ARCHIVED_NOTES }))

  return [
    { file: `${name}.wav`, command: 'base64 -d', content: audio.toBase64() },
    { file: `${name}.svg`, command: 'cat', content: bandPortrait(o) },
    { file: `${name}.md`, command: 'cat', content: markdown(o, key, when, name) },
  ]
}
