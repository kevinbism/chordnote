type TransposeControlsProps = {
  offset: number
  onTransposeDown: () => void
  onTransposeUp: () => void
}

export function TransposeControls({
  offset,
  onTransposeDown,
  onTransposeUp,
}: TransposeControlsProps) {
  return (
    <div className="transpose-controls">
      <button
        type="button"
        className="transpose-button"
        aria-label="Transpose down one semitone"
        disabled={offset <= -11}
        onClick={onTransposeDown}
      >
        <span aria-hidden="true">−</span>
      </button>
      <div
        className="transpose-value"
        aria-live="polite"
        aria-atomic="true"
      >
        <strong>{offset > 0 ? `+${offset}` : offset}</strong>
        <span>
          {offset === 0
            ? 'original key'
            : `semitone${Math.abs(offset) === 1 ? '' : 's'}`}
        </span>
      </div>
      <button
        type="button"
        className="transpose-button"
        aria-label="Transpose up one semitone"
        disabled={offset >= 11}
        onClick={onTransposeUp}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  )
}
