import type { ChordDiagram } from 'chordkit'

export type ChordItem = {
  id: string
  originalName: string
}

export type Section = {
  id: string
  title: string
  chords: ChordItem[]
}

export type Song = {
  title: string
  sections: Section[]
  transposeSemitones: number
}

export type DisplayedChord = ChordItem & {
  name: string
  diagram: ChordDiagram | null
}

export type DisplayedSection = Section & {
  displayedChords: DisplayedChord[]
}

export type PrintFormat = 'diagrams' | 'names'
export type Theme = 'light' | 'dark'
