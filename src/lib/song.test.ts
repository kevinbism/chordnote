import { describe, expect, it } from 'vitest'
import {
  createInitialSong,
  MAX_TRANSPOSE,
  MIN_TRANSPOSE,
  songReducer,
} from './song'

describe('songReducer', () => {
  it('appends sections without replacing the existing section', () => {
    const song = createInitialSong('section-1')
    const updated = songReducer(song, {
      type: 'section-added',
      section: { id: 'section-2', title: 'Bridge', chords: [] },
    })

    expect(updated.sections.map((section) => section.id)).toEqual([
      'section-1',
      'section-2',
    ])
  })

  it('removes only the requested chord and keeps duplicate chord order', () => {
    const song = {
      ...createInitialSong('section-1'),
      sections: [
        {
          id: 'section-1',
          title: 'Verse',
          chords: [
            { id: 'first', originalName: 'Am' },
            { id: 'removed', originalName: 'F' },
            { id: 'last', originalName: 'Am' },
          ],
        },
      ],
    }

    const updated = songReducer(song, {
      type: 'chord-removed',
      sectionId: 'section-1',
      chordId: 'removed',
    })

    expect(updated.sections[0]?.chords).toEqual([
      { id: 'first', originalName: 'Am' },
      { id: 'last', originalName: 'Am' },
    ])
  })

  it('keeps transposition inside the agreed range', () => {
    const atTop = {
      ...createInitialSong('section-1'),
      transposeSemitones: MAX_TRANSPOSE,
    }
    const atBottom = {
      ...createInitialSong('section-1'),
      transposeSemitones: MIN_TRANSPOSE,
    }

    expect(songReducer(atTop, { type: 'transpose-up' })).toBe(atTop)
    expect(songReducer(atTop, { type: 'transpose-down' }).transposeSemitones).toBe(
      MAX_TRANSPOSE - 1,
    )
    expect(songReducer(atBottom, { type: 'transpose-down' })).toBe(atBottom)
    expect(
      songReducer(atBottom, { type: 'transpose-up' }).transposeSemitones,
    ).toBe(MIN_TRANSPOSE + 1)
  })

  it('resets the title, sections, chords and transposition to one new section', () => {
    const song = {
      title: 'Old song',
      transposeSemitones: 4,
      sections: [
        {
          id: 'old-section',
          title: 'Verse',
          chords: [{ id: 'chord-1', originalName: 'Am' }],
        },
      ],
    }

    expect(
      songReducer(song, { type: 'reset', sectionId: 'new-section' }),
    ).toEqual({
      title: '',
      transposeSemitones: 0,
      sections: [{ id: 'new-section', title: '', chords: [] }],
    })
  })
})
