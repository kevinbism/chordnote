import { PrintSection } from './PrintSection'
import type { DisplayedSection, PrintFormat } from '../../types/song'

type PrintSongSheetProps = {
  title: string
  transposeSemitones: number
  sections: DisplayedSection[]
  format: PrintFormat
}

export function PrintSongSheet({
  title,
  transposeSemitones,
  sections,
  format,
}: PrintSongSheetProps) {
  return (
    <article
      className="print-sheet"
      data-print-layout={format}
      aria-label="Printable song sheet"
    >
      <header className="print-sheet__header">
        <p className="print-sheet__brand">chordnote</p>
        <h1>{title.trim() || 'Untitled song'}</h1>
        <p className="print-sheet__subtitle">
          Guitar song sheet
          {transposeSemitones !== 0 && (
            <span>
              {' '}
              · Transposed{' '}
              {transposeSemitones > 0
                ? `+${transposeSemitones}`
                : transposeSemitones}{' '}
              semitones
            </span>
          )}
        </p>
      </header>

      {sections.length === 0 ? (
        <p className="print-sheet__empty">No sections in this song yet.</p>
      ) : (
        <div className="print-song-sections">
          {sections.map((section, index) => (
            <PrintSection
              key={section.id}
              section={section}
              sectionNumber={index + 1}
              format={format}
            />
          ))}
        </div>
      )}

      <footer className="print-sheet__footer">
        Made with chordnote
      </footer>
    </article>
  )
}
