export type Theme = 'dystopian' | 'jazz'

type Section = { name: string; effect: string }

export type ThemeCopy = {
  label: string
  piece: string
  title: string
  pieceTitle: string
  fileName: string
  sections: { dancers: Section; violins: Section; drums: Section; conductors: Section }
  rehearsing: string
  idle: string
  playing: string
  ovation: string
  movements: string[]
  conductor: string
  conductorTool: string
  portraitAlt: string
}

const EFFECTS = {
  dancers: '+0.2 notes/s while the agent thinks',
  violins: '+0.5 notes/s while the agent thinks',
  drums: '+2 notes per tool call',
  conductors: '+25% notes from generated tokens',
}

export const THEMES: Record<Theme, ThemeCopy> = {
  dystopian: {
    label: '📻 Dystopian orchestra',
    piece: 'symphony',
    title: 'Dystopian Orchestra — New symphony',
    pieceTitle: 'Wasteland Symphony',
    fileName: 'wasteland-symphony',
    sections: {
      dancers: { name: 'Ruin raver', effect: EFFECTS.dancers },
      violins: { name: 'Wasteland musician', effect: EFFECTS.violins },
      drums: { name: 'Scrap percussionist', effect: EFFECTS.drums },
      conductors: { name: 'Cyborg conductor', effect: EFFECTS.conductors },
    },
    rehearsing: '📻 The orchestra rehearses among the ruins while Claude thinks…',
    idle: '🌫️ Silence in the wasteland: send a prompt',
    playing: '📻 The orchestra plays its piece among the ruins',
    ovation: '👏 Standing ovation!',
    movements: ['Allegro', 'Adagio', 'Scherzo', 'Finale'],
    conductor: 'cyborg conductor',
    conductorTool: 'neon baton',
    portraitAlt: 'Ruined stage with the orchestra',
  },
  jazz: {
    label: '🎷 Jazz band',
    piece: 'session',
    title: 'Midnight Jazz Club — New session',
    pieceTitle: 'Midnight Session',
    fileName: 'midnight-session',
    sections: {
      dancers: { name: 'Swing dancer', effect: EFFECTS.dancers },
      violins: { name: 'Soloist', effect: EFFECTS.violins },
      drums: { name: 'Rhythm section player', effect: EFFECTS.drums },
      conductors: { name: 'Crooning bandleader', effect: EFFECTS.conductors },
    },
    rehearsing: '🎷 The band warms up in the smoky club while Claude thinks…',
    idle: '🕯️ The club is quiet: send a prompt',
    playing: '🎷 The band swings through its tune',
    ovation: '👏 The club goes wild!',
    movements: ['Head', 'Solos', 'Trading fours', 'Out chorus'],
    conductor: 'crooning bandleader',
    conductorTool: 'vintage microphone',
    portraitAlt: 'Smoky jazz club stage with the band',
  },
}
