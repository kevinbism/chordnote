import { useId, useRef, useState } from 'react'
import type { FormEvent, RefObject } from 'react'
import { validateChordInput } from '../../lib/chords'
import type { ChordItem } from '../../types/song'

type ChordInputProps = {
  sectionNumber: number
  onAdd: (chord: ChordItem) => void
  inputRef: RefObject<HTMLInputElement | null>
  isTransposed: boolean
}

export function ChordInput({
  sectionNumber,
  onAdd,
  inputRef,
  isTransposed,
}: ChordInputProps) {
  const id = useId()
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isComposing, setIsComposing] = useState(false)
  const helpId = `${id}-help`
  const errorId = `${id}-error`
  const composingRef = useRef(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isComposing || composingRef.current) {
      return
    }

    const result = validateChordInput(value)

    if (!result.valid) {
      setError(result.error)
      return
    }

    onAdd({
      id: crypto.randomUUID(),
      originalName: result.originalName,
    })
    setValue('')
    setError(null)
  }

  return (
    <form className="chord-form" onSubmit={handleSubmit} noValidate>
      <label className="sr-only" htmlFor={`${id}-input`}>
        Add a chord to section {sectionNumber}
      </label>
      <div className="chord-form__row">
        <div className="chord-form__input-wrap">
          <span className="chord-form__symbol" aria-hidden="true">
            +
          </span>
          <input
            ref={inputRef}
            id={`${id}-input`}
            className="text-input chord-form__input"
            type="text"
            value={value}
            placeholder="Type a chord name"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${helpId} ${errorId}` : helpId}
            onChange={(event) => {
              setValue(event.target.value)
              if (error) setError(null)
            }}
            onCompositionStart={() => {
              composingRef.current = true
              setIsComposing(true)
            }}
            onCompositionEnd={() => {
              composingRef.current = false
              setIsComposing(false)
            }}
          />
        </div>
        <button className="button button--add-chord" type="submit">
          <span>Add chord</span>
          <span className="button__plus" aria-hidden="true">
            +
          </span>
        </button>
      </div>
      <p className="field-hint" id={helpId}>
        One chord per entry, like Am, Dm7 or G/B.
        {isTransposed && ' New chords are entered in the original key.'}
      </p>
      {error && (
        <p className="field-error" id={errorId} aria-live="polite">
          {error}
        </p>
      )}
    </form>
  )
}
