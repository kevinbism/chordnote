import { guitar } from '@chordkit/dictionary'
import { describe, expect, it } from 'vitest'
import { deriveDisplayedChord, transposeChordName } from './transpose'

function item(originalName: string) {
  return { id: originalName, originalName }
}

describe('transposeChordName', () => {
  it.each([
    ['Am', 1, 'A#m'],
    ['Am', -1, 'G#m'],
    ['G/B', 1, 'G#/C'],
    ['Cm7b5', 2, 'Dm7b5'],
    ['Bbmaj7', -2, 'Abmaj7'],
  ])('transposes %s by %i semitones to %s', (name, offset, result) => {
    expect(transposeChordName(name, offset)).toBe(result)
  })

  it('retains the exact original spelling at offset zero', () => {
    expect(transposeChordName('Bbmaj7', 0)).toBe('Bbmaj7')
  })

  it.each([-12, 12, 1.5])('rejects an out-of-range offset: %i', (offset) => {
    expect(() => transposeChordName('Am', offset)).toThrow(RangeError)
  })
})

describe('deriveDisplayedChord', () => {
  it('prefers a dictionary shape in the displayed key', () => {
    const result = deriveDisplayedChord(item('D'), 2)

    expect(result.name).toBe('E')
    expect(result.diagram?.name).toBe('E')
    expect(result.diagram?.open).toEqual(guitar.E?.open)
  })

  it('transposes an original dictionary shape when the target key has no entry', () => {
    const original = JSON.stringify(guitar.Am)
    const result = deriveDisplayedChord(item('Am'), 1)

    expect(result.name).toBe('A#m')
    expect(result.diagram?.name).toBe('A#m')
    expect(result.diagram?.position).toBeGreaterThan(0)
    expect(JSON.stringify(guitar.Am)).toBe(original)
  })

  it('keeps parser-valid chords without shapes in the displayed progression', () => {
    expect(deriveDisplayedChord(item('Cmaj7'), 0)).toMatchObject({
      name: 'Cmaj7',
      diagram: null,
    })
    expect(deriveDisplayedChord(item('G/B'), 1)).toMatchObject({
      name: 'G#/C',
      diagram: null,
    })
  })

  it('derives repeated changes from the original chord name', () => {
    const chord = item('Am')

    expect(deriveDisplayedChord(chord, 1).name).toBe('A#m')
    expect(deriveDisplayedChord(chord, 2).name).toBe('Bm')
    expect(deriveDisplayedChord(chord, 0).name).toBe('Am')
    expect(chord.originalName).toBe('Am')
  })
})
