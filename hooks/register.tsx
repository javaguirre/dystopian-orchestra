import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Orchestra } from '../types'

import { archiveFiles } from './archive.ts'
import { synthesize, toWav } from './music.ts'
import { SCORE_RATIO, STAGE_RATIO, score, stage } from './stage.ts'

const PANE = 'orquesta'
const STORE_KEY = 'game'
const WAV_PATH = '/tmp/dystopian-orchestra.wav'
const ARCHIVE_DIR = '$HOME/Tools/orchestra/obras'

const EMPTY: Orchestra = {
  notes: 0,
  earned: 0,
  violins: 0,
  drums: 0,
  conductors: 0,
  ovations: 0,
  measures: 0,
  score: [],
  fullScore: [],
  isPlaying: false,
  isPerforming: false,
  salt: 0,
}

const game = atom({ plugin: 'dystopian-orchestra', key: 'game' } as const, EMPTY)

type SectionId = 'violins' | 'drums' | 'conductors'

const SECTIONS: { id: SectionId; hotkey: string; name: string; base: number; effect: string }[] = [
  { id: 'violins', hotkey: '1', name: 'Músico del yermo', base: 15, effect: '+0.5 notas/s mientras el agente piensa' },
  { id: 'drums', hotkey: '2', name: 'Percusionista de chatarra', base: 100, effect: '+2 notas por herramienta usada' },
  { id: 'conductors', hotkey: '3', name: 'Director cíborg', base: 500, effect: '+25% notas por tokens generados' },
]

const MOVEMENTS = ['I. Allegro', 'II. Adagio', 'III. Scherzo', 'IV. Finale']

const multiplier = (o: Orchestra) => 1 + 0.1 * o.ovations
const goal = (o: Orchestra) => 1500 * 2 ** o.ovations
const progress = (o: Orchestra) => Math.min(1, o.earned / goal(o))
const cost = (base: number, owned: number) => Math.ceil(base * 1.15 ** owned)
const format = (n: number) => (n < 1000 ? n.toFixed(n < 10 ? 1 : 0) : `${(n / 1000).toFixed(1)}k`)

const earn = (o: Orchestra, amount: number): Orchestra => ({
  ...o,
  notes: o.notes + amount * multiplier(o),
  earned: o.earned + amount * multiplier(o),
})

const compose = (o: Orchestra): Orchestra => {
  const measure: number[] = []
  let step = o.score.at(-1) ?? 2
  for (let beat = 0; beat < 4; beat++) {
    step = Math.max(0, Math.min(7, step + Math.floor(Math.random() * 5) - 2))
    measure.push(step)
  }

  return {
    ...o,
    measures: o.measures + 1,
    score: [...o.score, ...measure].slice(-32),
    fullScore: [...o.fullScore, ...measure].slice(-512),
  }
}

const newSalt = () => 1 + Math.floor(Math.random() * 2 ** 31)

const change = async ($: EngineInterface, fn: (o: Orchestra) => Orchestra) => {
  await update($, game, fn)
  await $.store.set(STORE_KEY, await read($, game))
}

const archive = async ($: EngineInterface, o: Orchestra) => {
  for (const { file, command, content } of archiveFiles(o, new Date(await $.clock.now()))) {
    const { exitCode, stderr } = await $.process.run(
      ['/bin/sh', '-c', `mkdir -p "${ARCHIVE_DIR}" && ${command} > "${ARCHIVE_DIR}/$1"`, 'sh', file],
      { stdin: content, timeoutMs: 60000 },
    )
    if (exitCode !== 0) return stderr.slice(0, 120)
  }

  return undefined
}

const play = async ($: EngineInterface) => {
  const o = await read($, game)
  if (o.score.length === 0) {
    $.ui.toast('Aún no hay obra: lanza un prompt para que la orquesta componga')
    return
  }
  $.ui.toast('📻 La orquesta toca su obra entre las ruinas')
  await update($, game, x => ({ ...x, isPerforming: true }))
  const { exitCode, stderr } = await $.process
    .run(['/bin/sh', '-c', 'base64 -d > "$1" && afplay "$1"', 'sh', WAV_PATH], {
      stdin: toWav(synthesize(o)).toBase64(),
      timeoutMs: 20000,
    })
    .finally(() => update($, game, x => ({ ...x, isPerforming: false })))
  if (exitCode !== 0) {
    $.ui.toast(`La orquesta desafina: ${stderr.slice(0, 80)}`)
  }
}

export const register: Register = on => {
  let rehearsalNotes = 0

  const collect = (o: Orchestra) => {
    const collected = earn(o, rehearsalNotes)
    rehearsalNotes = 0
    return collected
  }

  on('session.start', async ($, e, next) => {
    const saved = (await $.store.get(STORE_KEY)) as Orchestra | undefined
    if (saved) {
      await update($, game, () => ({ ...EMPTY, ...saved, isPlaying: false, isPerforming: false }))
    }
    await change($, x => ({ ...x, salt: x.salt || newSalt(), fullScore: x.fullScore.length > 0 ? x.fullScore : x.score }))
    await $.command.register({ name: 'orquesta', description: 'Abre la Orquesta del Yermo' })
    void $.ui.open({ id: PANE, title: 'Orquesta del Yermo — Nueva obra' })
    $.clock.every(1000, () => {
      void (async () => {
        const o = await read($, game)
        if (o.isPlaying) rehearsalNotes += 0.2 + 0.5 * o.violins
      })()
    })

    return next(e)
  })

  on('command.run', { command: 'orquesta' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Orquesta del Yermo — Nueva obra' })

    return { text: 'La orquesta ocupa las ruinas.' }
  })

  on('turn.start', async ($, e, next) => {
    await change($, o => ({ ...o, isPlaying: true }))

    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    await change($, o => compose(earn(collect(o), 1 + 2 * o.drums)))

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const tokens = e.usage?.output_tokens ?? 0
    await change($, o => ({
      ...earn(collect(o), (tokens / 40) * (1 + 0.25 * o.conductors)),
      isPlaying: e.agentId ? o.isPlaying : false,
    }))

    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const o = await read($, game)
    const pct = progress(o)
    const isReady = pct >= 1
    const movement = isReady ? '¡Lista para el estreno!' : MOVEMENTS[Math.floor(pct * 4)]

    const buy = (id: SectionId, base: number) =>
      change($, x => {
        const price = cost(base, x[id])
        return x.notes < price ? x : { ...x, notes: x.notes - price, [id]: x[id] + 1 }
      })

    const premiere = async () => {
      const failure = await archive($, await read($, game))
      if (failure !== undefined) {
        $.ui.toast(`No se pudo guardar la obra: ${failure}`)
        return
      }
      await change($, x => ({ ...EMPTY, ovations: x.ovations + 1, salt: newSalt() }))
      $.ui.toast(`👏 ¡Ovación en pie! ✦ ${o.ovations + 1} · obra guardada en ~/Tools/orchestra/obras`)
    }

    const drawing = (source: string, alt: string, ratio: number) => {
      if (e.surface === 'terminal') return null
      const { Svg } = $.ui.resolve(e)
      const width = Math.max(320, Math.min(1000, e.props.bodyColumns * 8))
      return <Svg source={source} alt={alt} width={width} height={Math.round(width * ratio)} isInteractive />
    }

    return (
      <Box flexDirection="column" gap={1}>
        <Text>{o.isPlaying ? '📻 La orquesta ensaya entre las ruinas mientras Claude piensa…' : '🌫️ Silencio en el yermo: lanza un prompt'}</Text>
        <Text bold>
          ♪ {format(o.notes)} notas · ✦ {o.ovations} ovaciones
        </Text>
        {drawing(stage(o), 'Escenario en ruinas con la orquesta', STAGE_RATIO)}
        <Box flexDirection="column">
          <Text bold>Secciones</Text>
          {SECTIONS.map(section => (
            <Box flexDirection="column">
              <Box flexDirection="row" gap={1}>
                <Button
                  key={section.id}
                  hotkey={section.hotkey}
                  label={`Fichar (${cost(section.base, o[section.id])})`}
                  dimColor={o.notes < cost(section.base, o[section.id])}
                  onPress={() => buy(section.id, section.base)}
                />
                <Text bold>
                  {section.name} ×{o[section.id]}
                </Text>
              </Box>
              <Text dimColor> {section.effect}</Text>
            </Box>
          ))}
        </Box>
        <Box flexDirection="column">
          <Text bold>La nueva obra</Text>
          <Text>
            {movement} · {Math.floor(pct * 100)}% · {o.measures} compases
          </Text>
          <Box flexDirection="row" gap={1}>
            <Button key="play" hotkey="p" label="▶ Escuchar la obra" onPress={() => void play($)} />
            {isReady && <Button key="premiere" variant="primary" label="Estrenar la sinfonía (+1 ✦)" onPress={premiere} />}
          </Box>
          <Text dimColor>El estreno reinicia la orquesta; cada ✦ da +10% de notas para siempre.</Text>
        </Box>
        {drawing(score(o, pct), 'Partitura de la obra en curso', SCORE_RATIO)}
      </Box>
    )
  })
}
