import { ChordChart, ChordProgression } from '@chordkit/react'
import { getGuitarTheme } from '../../lib/chordkit'
import type { DisplayedSection, PrintFormat } from '../../types/song'

type PrintSectionProps = {
  section: DisplayedSection
  sectionNumber: number
  format: PrintFormat
}

export function PrintSection({
  section,
  sectionNumber,
  format,
}: PrintSectionProps) {
  const sectionTitle = section.title.trim() || 'Untitled section'
  const chords = section.displayedChords
  const canUseProgression =
    chords.length > 0 &&
    chords.length <= 4 &&
    chords.every((chord) => chord.diagram !== null)
  const isLong = chords.length > 4

  return (
    <section
      className={`print-song-section${isLong ? ' print-song-section--long' : ''}`}
      aria-labelledby={`print-section-${sectionNumber}`}
    >
      <h2 id={`print-section-${sectionNumber}`}>
        <span>{String(sectionNumber).padStart(2, '0')}</span>
        {sectionTitle}
      </h2>

      {chords.length === 0 ? (
        <p className="print-section__empty">No chords added.</p>
      ) : format === 'names' ? (
        <ol className="print-name-progression">
          {chords.map((chord, index) => (
            <li key={chord.id}>
              {index > 0 && (
                <span className="print-name-progression__separator" aria-hidden="true">
                  →
                </span>
              )}
              <span>{chord.name}</span>
            </li>
          ))}
        </ol>
      ) : canUseProgression ? (
        <div className="print-progression">
          <ChordProgression
            chords={chords.flatMap((chord) =>
              chord.diagram ? [chord.diagram] : [],
            )}
            instrument="guitar"
            theme={getGuitarTheme('light')}
            chordWidth={126}
            spacing={10}
            showTuning={false}
          />
        </div>
      ) : (
        <ol className="print-diagram-list">
          {chords.map((chord) => (
            <li className="print-diagram-item" key={chord.id}>
              <p>{chord.name}</p>
              {chord.diagram ? (
                <ChordChart
                  chord={chord.diagram}
                  instrument="guitar"
                  theme={getGuitarTheme('light')}
                  width={140}
                  showTuning={false}
                  ariaTitle={`${chord.name} guitar chord diagram`}
                />
              ) : (
                <span className="print-diagram-unavailable">
                  Diagram unavailable
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
