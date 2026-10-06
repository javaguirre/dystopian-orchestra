export type Orchestra = {
  notes: number
  earned: number
  violins: number
  drums: number
  conductors: number
  ovations: number
  measures: number
  score: number[]
  fullScore: number[]
  isPlaying: boolean
  isPerforming: boolean
  salt: number
}

declare module 'claude-code' {
  interface PluginState {
    'orquesta-minion': { game: Orchestra }
  }
}
