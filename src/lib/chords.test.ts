import { describe, expect, it } from 'vitest'
import { validateChordInput } from './chords'
import { getGuitarDiagram } from './chordkit'

describe('validateChordInput', () => {
  it.each(['Am', 'F', 'C', 'G', 'Dm7', 'Cmaj7', 'G/B'])(
    'accepts the parser-supported chord %s',
    (name) => {
      expect(validateChordInput(name)).toMatchObject({
        valid: true,
        originalName: name,
      })
    },
  )

  it('distinguishes an unsupported diagram from an invalid name', () => {
    expect(validateChordInput(' Cmaj7 ')).toEqual({
      valid: true,
      originalName: 'Cmaj7',
      diagramAvailable: false,
    })
    expect(validateChordInput('G/B')).toMatchObject({
      valid: true,
      diagramAvailable: false,
    })
    expect(validateChordInput('Am')).toMatchObject({
      valid: true,
      diagramAvailable: true,
    })
  })

  it.each(['', '   ', 'hello', 'Bridge', 'Am F'])(
    'rejects invalid input %j',
    (value) => {
      expect(validateChordInput(value).valid).toBe(false)
    },
  )
})

describe('getGuitarDiagram', () => {
  it('preserves the requested spelling without mutating a dictionary shape', () => {
    const diagram = getGuitarDiagram('C')
    const alias = getGuitarDiagram('Cmaj')

    expect(diagram?.name).toBe('C')
    expect(alias?.name).toBe('Cmaj')
    expect(alias).not.toBe(diagram)
  })

  it('never drops a slash bass or a chord extension to find a shape', () => {
    expect(getGuitarDiagram('G/B')).toBeUndefined()
    expect(getGuitarDiagram('Cmaj7')).toBeUndefined()
  })
})
