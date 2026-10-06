# Dystopian Orchestra

A [Claude Code](https://claude.com/claude-code) mod: an idle game in which a wasteland orchestra composes a glitchy symphony while Claude works.

![The band](docs/band.svg)

Every prompt you send makes the orchestra rehearse, every tool Claude calls writes a new measure, and every finished turn pays out in notes. Spend them hiring musicians, finish the symphony, premiere it, and start again with a new band.

![The score](docs/score.svg)

## How it plays

| When | Notes earned | Boosted by |
| --- | --- | --- |
| Every second Claude is thinking | 0.2 + 0.5 per melodic musician | Wasteland musician |
| Every tool call (it also composes a measure) | 1 + 2 per percussionist | Scrap percussionist |
| Every finished turn | output tokens ÷ 40 × (1 + 0.25 per conductor) | Cyborg conductor |

- Each hire costs 15% more than the last one in its section.
- The symphony is ready to premiere once you have earned 1500 × 2^premieres notes.
- Premiering resets the orchestra but grants an ovation (✦), worth +10% notes forever.

## The band

Each orchestra has a hidden salt. Every musician's look and sound is derived from a hash of that salt, their section and their seat, so the band stays the same across reloads and changes with each new symphony.

- 11 heads, 6 outfits, 7 accessories, generated coat, eye and skin colours.
- 10 melodic instruments (violin, cello, trumpet, accordion, scrap guitar, flute, sax, theremin, musical saw, keytar) and 7 percussion ones (oil barrel, bin lids, buckets, pipe xylophone, tyre, manhole gong, cans).
- Rarity: rare musicians get a neon instrument, legendary ones a golden instrument, glowing eyes and sparkles.
- The hash also sets each musician's octave, detune and vibrato.

## The music

Press **▶ Listen to the piece** to hear the latest 16 notes. The mod synthesises a WAV in the plugin itself and plays it with `afplay`.

- The scale, root and tempo come from the orchestra's salt, so a piece sounds the same until new measures are written or new musicians join.
- Each instrument has its own voice, and the conductor adds a drone and more glitch: stutters, reversed slices, bit-crushing, dropouts, ring modulation, radio crackle and tape stops.

## The archive

Premiering a symphony writes three files to `~/Tools/orchestra/symphonies/`:

- `wasteland-symphony-n<N>-<date>.md`: date, key, the full roster and the complete score, measure by measure.
- `.wav`: the whole piece (up to its last 128 notes).
- `.svg`: a still portrait of the band that played it, embedded in the markdown.

## Install

Requires a Claude Code build with function-hook mods (2.1.286 or later; the API is early access). The pixel-art stage and score render in the desktop app's Code tab; the terminal shows the text controls only.

```bash
git clone git@github.com:javaguirre/dystopian-orchestra.git
claude --plugin-dir ./dystopian-orchestra
```

Open the pane with `/orchestra`.

The mod runs a few host commands: `afplay` and `base64` to play music, and `mkdir`, `cat` and `base64` to write the archive. Audio playback is macOS only.

## Layout

| Path | What it holds |
| --- | --- |
| `hooks/register.tsx` | Hooks, game state, the pane and its buttons |
| `hooks/cast.ts` | Pixel-art sprites and the musician hash |
| `hooks/stage.ts` | The stage and score drawings |
| `hooks/music.ts` | The synthesiser and glitch effects |
| `hooks/archive.ts` | The markdown, WAV and portrait written on premiere |
| `types/index.d.ts` | The game state contract |
