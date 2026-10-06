export type Orchestra = {
  notes: number
  earned: number
  violins: number
  drums: number
  conductors: number
  ovations: number
  measures: number
  score: number[]
  isPlaying: boolean
  isPerforming: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'orquesta-minion': { game: Orchestra }
  }
}
