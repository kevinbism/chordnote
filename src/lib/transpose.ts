import { formatChordName, parseChordName } from '@chordkit/parser'
import { transpose, transposeNote } from '@chordkit/theory'
import { getGuitarDiagram } from './chordkit'
import { MAX_TRANSPOSE, MIN_TRANSPOSE } from './song'
import type { ChordItem, DisplayedChord } from '../types/song'

export function transposeChordName(name: string, semitones: number): string {
  if (!Number.isInteger(semitones)) {
    throw new RangeError('The transposition offset must be an integer.')
  }

  if (semitones < MIN_TRANSPOSE || semitones > MAX_TRANSPOSE) {
    throw new RangeError(
      `The transposition offset must stay between ${MIN_TRANSPOSE} and ${MAX_TRANSPOSE}.`,
    )
  }

  if (semitones === 0) {
    return name
  }

  const chord = parseChordName(name)

  if (!chord) {
    throw new Error(`Cannot transpose an invalid chord name: "${name}".`)
  }

  return formatChordName({
    ...chord,
    root: transposeNote(chord.root, semitones),
    bass:
      chord.bass === undefined
        ? undefined
        : transposeNote(chord.bass, semitones),
  })
}

export function deriveDisplayedChord(
  chord: ChordItem,
  semitones: number,
): DisplayedChord {
  const name = transposeChordName(chord.originalName, semitones)
  const dictionaryDiagram = getGuitarDiagram(name)

  if (dictionaryDiagram) {
    return { ...chord, name, diagram: dictionaryDiagram }
  }

  const originalDiagram = getGuitarDiagram(chord.originalName)

  if (originalDiagram) {
    return {
      ...chord,
      name,
      diagram: {
        ...transpose(originalDiagram, semitones, 'guitar'),
        name,
      },
    }
  }

  return { ...chord, name, diagram: null }
}
