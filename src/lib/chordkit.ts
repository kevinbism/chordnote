import { guitar } from '@chordkit/dictionary'
import { parseChordName } from '@chordkit/parser'
import { semitonesBetween } from '@chordkit/theory'
import { resolveTheme } from 'chordkit'
import type { ChordDiagram, ThemeInput } from 'chordkit'
import type { Theme } from '../types/song'

const guitarThemes: Record<Theme, ThemeInput> = {
  light: {
    ...resolveTheme('light'),
    fontFamily: '"Instrument Sans Variable", "Instrument Sans", sans-serif',
  },
  dark: {
    ...resolveTheme('dark'),
    fontFamily: '"Instrument Sans Variable", "Instrument Sans", sans-serif',
  },
}

export function getGuitarTheme(theme: Theme): ThemeInput {
  return guitarThemes[theme]
}

function samePitch(first: string | undefined, second: string | undefined) {
  if (first === undefined || second === undefined) {
    return first === second
  }

  return semitonesBetween(first, second) === 0
}

function matchesDictionaryChord(name: string, dictionaryName: string) {
  const chord = parseChordName(name)
  const dictionaryChord = parseChordName(dictionaryName)

  return (
    chord !== null &&
    dictionaryChord !== null &&
    chord.quality === dictionaryChord.quality &&
    chord.extensions.length === dictionaryChord.extensions.length &&
    chord.extensions.every(
      (extension, index) => extension === dictionaryChord.extensions[index],
    ) &&
    samePitch(chord.root, dictionaryChord.root) &&
    samePitch(chord.bass, dictionaryChord.bass)
  )
}

export function getGuitarDiagram(name: string): ChordDiagram | undefined {
  for (const [dictionaryName, diagram] of Object.entries(guitar)) {
    if (matchesDictionaryChord(name, dictionaryName)) {
      return { ...diagram, name }
    }
  }

  return undefined
}
