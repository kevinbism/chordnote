import { useEffect, useId, useRef } from 'react'
import type { Dispatch } from 'react'
import { ChordInput } from './ChordInput'
import { ChordItem } from './ChordItem'
import type { SongAction } from '../../lib/song'
import type {
  ChordItem as ChordData,
  DisplayedChord,
  Section,
  Theme,
} from '../../types/song'

type SongSectionProps = {
  section: Section
  chords: DisplayedChord[]
  sectionNumber: number
  theme: Theme
  isTransposed: boolean
  titleRef: (input: HTMLInputElement | null) => void
  onRemoveSection: (sectionId: string) => void
  dispatch: Dispatch<SongAction>
}

export function SongSection({
  section,
  chords,
  sectionNumber,
  theme,
  isTransposed,
  titleRef,
  onRemoveSection,
  dispatch,
}: SongSectionProps) {
  const id = useId()
  const chordInputRef = useRef<HTMLInputElement>(null)
  const removeButtonRefs = useRef(new Map<string, HTMLButtonElement>())
  const pendingFocus = useRef<{ removedId: string; nextId: string | null } | null>(
    null,
  )

  useEffect(() => {
    const pending = pendingFocus.current

    if (!pending || chords.some((chord) => chord.id === pending.removedId)) {
      return
    }

    if (pending.nextId) {
      removeButtonRefs.current.get(pending.nextId)?.focus()
    } else {
      chordInputRef.current?.focus()
    }

    pendingFocus.current = null
  }, [chords])

  function handleAddChord(chord: ChordData) {
    dispatch({ type: 'chord-added', sectionId: section.id, chord })
  }

  function handleRemoveChord(chordId: string) {
    const index = chords.findIndex((chord) => chord.id === chordId)
    const nextId = chords[index + 1]?.id ?? chords[index - 1]?.id ?? null
    pendingFocus.current = { removedId: chordId, nextId }
    dispatch({ type: 'chord-removed', sectionId: section.id, chordId })
  }

  const sectionName = section.title.trim() || `section ${sectionNumber}`
  const titleId = `${id}-title`

  return (
    <section className="song-section" aria-labelledby={`${id}-heading`}>
      <div className="song-section__header">
        <h2 className="sr-only" id={`${id}-heading`}>
          {section.title.trim() || `Section ${sectionNumber}`}
        </h2>
        <span className="song-section__number" aria-hidden="true">
          {String(sectionNumber).padStart(2, '0')}
        </span>
        <div className="song-section__title-wrap">
          <label className="sr-only" htmlFor={titleId}>
            Section {sectionNumber} title
          </label>
          <input
            ref={titleRef}
            id={titleId}
            className="section-title-input"
            type="text"
            value={section.title}
            placeholder={`Section ${sectionNumber}`}
            autoComplete="off"
            onChange={(event) =>
              dispatch({
                type: 'section-renamed',
                sectionId: section.id,
                title: event.target.value,
              })
            }
          />
          <span className="song-section__meta">
            {section.chords.length === 0
              ? 'A new part of your song'
              : `${section.chords.length} chord${section.chords.length === 1 ? '' : 's'}`}
          </span>
        </div>
        <button
          type="button"
          className="button button--quiet song-section__remove"
          aria-label={`Remove ${sectionName}`}
          onClick={() => onRemoveSection(section.id)}
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="m5 5 10 10M15 5 5 15" />
          </svg>
          <span>Remove</span>
        </button>
      </div>

      {chords.length > 0 ? (
        <ol
          className="chord-progression"
          aria-label={`Chord progression, section ${sectionNumber}`}
        >
          {chords.map((chord, index) => (
            <ChordItem
              key={chord.id}
              chord={chord}
              position={index + 1}
              theme={theme}
              onRemove={() => handleRemoveChord(chord.id)}
              removeButtonRef={(button) => {
                if (button) {
                  removeButtonRefs.current.set(chord.id, button)
                } else {
                  removeButtonRefs.current.delete(chord.id)
                }
              }}
            />
          ))}
        </ol>
      ) : (
        <p className="section-empty">
          <span aria-hidden="true">✳</span>
          Start with a chord that sounds like you.
        </p>
      )}

      <ChordInput
        sectionNumber={sectionNumber}
        onAdd={handleAddChord}
        inputRef={chordInputRef}
        isTransposed={isTransposed}
      />
    </section>
  )
}
