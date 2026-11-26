import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { PrintSongSheet } from '../print/PrintSongSheet'
import { ClearSongDialog } from './ClearSongDialog'
import { PrintDialog } from './PrintDialog'
import { SongSection } from './SongSection'
import { TransposeControls } from './TransposeControls'
import { createInitialSong, songReducer } from '../../lib/song'
import { deriveDisplayedChord } from '../../lib/transpose'
import type { DisplayedSection, PrintFormat, Theme } from '../../types/song'

type SongEditorProps = {
  theme: Theme
}

export function SongEditor({ theme }: SongEditorProps) {
  const [initialSectionId] = useState(() => crypto.randomUUID())
  const [song, dispatch] = useReducer(songReducer, initialSectionId, createInitialSong)
  const [printFormat, setPrintFormat] = useState<PrintFormat>('diagrams')
  const [printRequestId, setPrintRequestId] = useState(0)
  const [printError, setPrintError] = useState<string | null>(null)
  const sectionTitleRefs = useRef(new Map<string, HTMLInputElement>())
  const addSectionRef = useRef<HTMLButtonElement>(null)
  const pendingSectionFocus = useRef<string | null | undefined>(undefined)
  const displaySections = useMemo<DisplayedSection[]>(
    () =>
      song.sections.map((section) => ({
        ...section,
        displayedChords: section.chords.map((chord) =>
          deriveDisplayedChord(chord, song.transposeSemitones),
        ),
      })),
    [song.sections, song.transposeSemitones],
  )

  useEffect(() => {
    const target = pendingSectionFocus.current

    if (target === undefined) {
      return
    }

    pendingSectionFocus.current = undefined
    if (target) {
      sectionTitleRefs.current.get(target)?.focus()
    } else {
      addSectionRef.current?.focus()
    }
  }, [song.sections])

  useEffect(() => {
    if (printRequestId === 0) {
      return
    }

    let cancelled = false

    async function printSong() {
      await document.fonts.ready
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve())
      })

      if (!cancelled) {
        window.print()
      }
    }

    void printSong().catch((error: unknown) => {
      console.error('Unable to open the browser print dialog.', error)
      setPrintError('The print dialog could not be opened. Please try again.')
    })

    return () => {
      cancelled = true
    }
  }, [printRequestId])

  function addSection() {
    const section = {
      id: crypto.randomUUID(),
      title: '',
      chords: [],
    }
    pendingSectionFocus.current = section.id
    dispatch({ type: 'section-added', section })
  }

  function removeSection(sectionId: string) {
    const index = song.sections.findIndex((section) => section.id === sectionId)
    const nextSection =
      song.sections[index + 1] ?? song.sections[index - 1] ?? null
    pendingSectionFocus.current = nextSection?.id ?? null
    dispatch({ type: 'section-removed', sectionId })
  }

  function resetSong() {
    dispatch({ type: 'reset', sectionId: crypto.randomUUID() })
    setPrintError(null)
  }

  function preparePrint(format: PrintFormat) {
    setPrintFormat(format)
    setPrintError(null)
    setPrintRequestId((current) => current + 1)
  }

  return (
    <>
      <main className="song-editor screen-only mx-auto w-full max-w-[74rem] px-4 sm:px-6 lg:px-8">
        <section className="editor-intro" aria-labelledby="editor-heading">
          <p className="eyebrow">
            <span className="eyebrow__dot" aria-hidden="true" />
            YOUR GUITAR SONGBOOK
          </p>
          <h1 id="editor-heading">A little room for your next song.</h1>
          <p className="editor-intro__copy">
            Gather the parts, find the chords, and keep the good bits close.
          </p>
        </section>

        <section className="song-workspace" aria-label="Song editor">
          <div className="song-title-row">
            <div className="song-title-row__mark" aria-hidden="true">
              <svg viewBox="0 0 28 28" fill="none">
                <path d="M8 4v20M14 4v20M20 4v20M5 10h18M5 18h18" />
                <circle cx="14" cy="10" r="2" />
                <circle cx="20" cy="18" r="2" />
              </svg>
            </div>
            <div className="song-title-row__field">
              <label className="song-title-row__label" htmlFor="song-title">
                SONG TITLE
              </label>
              <input
                id="song-title"
                className="song-title-input"
                type="text"
                value={song.title}
                onChange={(event) =>
                  dispatch({
                    type: 'title-changed',
                    title: event.target.value,
                  })
                }
                placeholder="Untitled song"
                autoComplete="off"
              />
            </div>
            <span className="song-title-row__note">A work in progress</span>
          </div>

          <div className="workspace-divider" aria-hidden="true" />

          <div className="song-toolbar" aria-label="Song tools">
            <div className="song-toolbar__transpose">
              <span className="toolbar-label">TRANSPOSE</span>
              <TransposeControls
                offset={song.transposeSemitones}
                onTransposeDown={() => dispatch({ type: 'transpose-down' })}
                onTransposeUp={() => dispatch({ type: 'transpose-up' })}
              />
            </div>
            <div className="song-toolbar__actions">
              <ClearSongDialog onClear={resetSong} />
              <PrintDialog format={printFormat} onPrint={preparePrint} />
            </div>
          </div>

          {printError && (
            <p className="print-error" role="status">
              {printError}
            </p>
          )}

          <div className="workspace-divider workspace-divider--section" />

          <div className="sections-list">
            {displaySections.map((section, index) => (
              <SongSection
                key={section.id}
                section={section}
                chords={section.displayedChords}
                sectionNumber={index + 1}
                theme={theme}
                isTransposed={song.transposeSemitones !== 0}
                titleRef={(input) => {
                  if (input) {
                    sectionTitleRefs.current.set(section.id, input)
                  } else {
                    sectionTitleRefs.current.delete(section.id)
                  }
                }}
                onRemoveSection={removeSection}
                dispatch={dispatch}
              />
            ))}
          </div>

          <button
            ref={addSectionRef}
            type="button"
            className="add-section-button"
            onClick={addSection}
          >
            <span className="add-section-button__icon" aria-hidden="true">
              +
            </span>
            <span>Add a section</span>
            <span className="add-section-button__detail">
              Verse, chorus, bridge — anything goes
            </span>
          </button>
        </section>
      </main>

      <PrintSongSheet
        title={song.title}
        transposeSemitones={song.transposeSemitones}
        sections={displaySections}
        format={printFormat}
      />
    </>
  )
}
