import type { ChordItem, Section, Song } from '../types/song'

export const MIN_TRANSPOSE = -11
export const MAX_TRANSPOSE = 11

export type SongAction =
  | { type: 'title-changed'; title: string }
  | { type: 'section-added'; section: Section }
  | { type: 'section-renamed'; sectionId: string; title: string }
  | { type: 'section-removed'; sectionId: string }
  | { type: 'chord-added'; sectionId: string; chord: ChordItem }
  | { type: 'chord-removed'; sectionId: string; chordId: string }
  | { type: 'transpose-up' }
  | { type: 'transpose-down' }
  | { type: 'reset'; sectionId: string }

export function createInitialSong(sectionId: string): Song {
  return {
    title: '',
    sections: [{ id: sectionId, title: '', chords: [] }],
    transposeSemitones: 0,
  }
}

export function songReducer(song: Song, action: SongAction): Song {
  switch (action.type) {
    case 'title-changed':
      return { ...song, title: action.title }
    case 'section-added':
      return { ...song, sections: [...song.sections, action.section] }
    case 'section-renamed':
      return {
        ...song,
        sections: song.sections.map((section) =>
          section.id === action.sectionId
            ? { ...section, title: action.title }
            : section,
        ),
      }
    case 'section-removed':
      return {
        ...song,
        sections: song.sections.filter(
          (section) => section.id !== action.sectionId,
        ),
      }
    case 'chord-added':
      return {
        ...song,
        sections: song.sections.map((section) =>
          section.id === action.sectionId
            ? { ...section, chords: [...section.chords, action.chord] }
            : section,
        ),
      }
    case 'chord-removed':
      return {
        ...song,
        sections: song.sections.map((section) =>
          section.id === action.sectionId
            ? {
                ...section,
                chords: section.chords.filter(
                  (chord) => chord.id !== action.chordId,
                ),
              }
            : section,
        ),
      }
    case 'transpose-up':
      return song.transposeSemitones >= MAX_TRANSPOSE
        ? song
        : { ...song, transposeSemitones: song.transposeSemitones + 1 }
    case 'transpose-down':
      return song.transposeSemitones <= MIN_TRANSPOSE
        ? song
        : { ...song, transposeSemitones: song.transposeSemitones - 1 }
    case 'reset':
      return createInitialSong(action.sectionId)
  }
}
