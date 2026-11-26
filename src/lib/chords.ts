import { isValidChordName } from '@chordkit/parser'
import { getGuitarDiagram } from './chordkit'

export type ChordValidation =
  | {
      valid: true
      originalName: string
      diagramAvailable: boolean
    }
  | {
      valid: false
      error: string
    }

export function validateChordInput(input: string): ChordValidation {
  const originalName = input.trim()

  if (originalName.length === 0) {
    return { valid: false, error: 'Enter a chord name to add it.' }
  }

  if (!isValidChordName(originalName)) {
    return {
      valid: false,
      error: "That chord name isn't recognized. Try Am, Dm7 or G/B.",
    }
  }

  return {
    valid: true,
    originalName,
    diagramAvailable: getGuitarDiagram(originalName) !== undefined,
  }
}
