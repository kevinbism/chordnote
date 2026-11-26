import { ChordChart } from '@chordkit/react'
import { getGuitarTheme } from '../../lib/chordkit'
import type { DisplayedChord, Theme } from '../../types/song'

type ChordItemProps = {
  chord: DisplayedChord
  position: number
  theme: Theme
  onRemove: () => void
  removeButtonRef: (button: HTMLButtonElement | null) => void
}

export function ChordItem({
  chord,
  position,
  theme,
  onRemove,
  removeButtonRef,
}: ChordItemProps) {
  return (
    <li className="progression-item">
      <article
        className={`chord-card${chord.diagram ? '' : ' chord-card--unavailable'}`}
      >
        <div className="chord-card__topline">
          <span className="chord-card__position" aria-hidden="true">
            {String(position).padStart(2, '0')}
          </span>
          <button
            ref={removeButtonRef}
            type="button"
            className="icon-button chord-card__remove"
            aria-label={`Remove ${chord.name} chord`}
            onClick={onRemove}
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
          </button>
        </div>
        {chord.diagram ? (
          <ChordChart
            chord={chord.diagram}
            instrument="guitar"
            theme={getGuitarTheme(theme)}
            width={156}
            showTuning={false}
            ariaTitle={`${chord.name} guitar chord diagram`}
          />
        ) : (
          <div className="chord-card__unavailable-note">
            <p className="chord-card__name">{chord.name}</p>
            <span className="chord-card__unavailable-mark" aria-hidden="true">
              ↗
            </span>
            <span>Diagram unavailable</span>
          </div>
        )}
      </article>
    </li>
  )
}
