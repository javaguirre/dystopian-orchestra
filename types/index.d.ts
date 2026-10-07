export type Orchestra = {
  notes: number
  earned: number
  dancers: number
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
  theme: 'dystopian' | 'jazz' | null
  isConfirmingReset: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'dystopian-orchestra': { game: Orchestra }
  }
}
