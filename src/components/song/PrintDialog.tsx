import { useId, useRef, useState } from 'react'
import type { SyntheticEvent } from 'react'
import type { PrintFormat } from '../../types/song'

type PrintDialogProps = {
  format: PrintFormat
  onPrint: (format: PrintFormat) => void
}

export function PrintDialog({ format, onPrint }: PrintDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const id = useId()
  const [draftFormat, setDraftFormat] = useState<PrintFormat>(format)
  const titleId = `${id}-title`
  const descriptionId = `${id}-description`
  const diagramsId = `${id}-diagrams`
  const namesId = `${id}-names`

  function openDialog() {
    const dialog = dialogRef.current

    if (dialog && !dialog.open) {
      setDraftFormat(format)
      dialog.returnValue = ''
      dialog.showModal()
    }
  }

  function handleClose(event: SyntheticEvent<HTMLDialogElement>) {
    const dialog = event.currentTarget
    const shouldPrint = dialog.returnValue === 'print'
    dialog.returnValue = ''

    if (shouldPrint) {
      onPrint(draftFormat)
    }
  }

  return (
    <>
      <button
        type="button"
        className="button button--primary"
        onClick={openDialog}
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M6 7V3.5h8V7m-8 7H4.5v-6h11v6H14m-8-2h8v6H6v-6Z" />
          <path d="M13.5 9.5h.01" />
        </svg>
        <span>Print</span>
        <span className="button__shortcut" aria-hidden="true">
          ↗
        </span>
      </button>

      <dialog
        ref={dialogRef}
        className="modal print-dialog"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClose={handleClose}
      >
        <div className="modal__eyebrow">Ready for the music stand</div>
        <h1 id={titleId}>Choose your print layout</h1>
        <p id={descriptionId}>
          Both formats use your current transposition and are set up for A4
          paper.
        </p>

        <form className="print-format-list" method="dialog">
          <label className="print-format-option" htmlFor={diagramsId}>
            <input
              id={diagramsId}
              type="radio"
              name={`${id}-format`}
              value="diagrams"
              checked={draftFormat === 'diagrams'}
              autoFocus
              onChange={() => setDraftFormat('diagrams')}
            />
            <span className="print-format-option__icon" aria-hidden="true">
              <svg viewBox="0 0 28 28" fill="none">
                <path d="M6 5v18M11 5v18M16 5v18M21 5v18M4 10h19M4 16h19" />
                <circle cx="11" cy="10" r="2" />
                <circle cx="16" cy="16" r="2" />
              </svg>
            </span>
            <span className="print-format-option__copy">
              <strong>Chord diagrams</strong>
              <span>Chord names with their guitar shapes</span>
            </span>
            <span className="print-format-option__radio" aria-hidden="true" />
          </label>

          <label className="print-format-option" htmlFor={namesId}>
            <input
              id={namesId}
              type="radio"
              name={`${id}-format`}
              value="names"
              checked={draftFormat === 'names'}
              onChange={() => setDraftFormat('names')}
            />
            <span className="print-format-option__icon print-format-option__icon--names" aria-hidden="true">
              <span>Am</span>
              <span>F</span>
              <span>C</span>
            </span>
            <span className="print-format-option__copy">
              <strong>Chord names only</strong>
              <span>Lightweight progressions with no diagrams</span>
            </span>
            <span className="print-format-option__radio" aria-hidden="true" />
          </label>
          <div className="modal__actions">
            <button
              className="button button--outline"
              type="submit"
              value="cancel"
            >
              Cancel
            </button>
            <button
              className="button button--primary"
              type="submit"
              value="print"
            >
              Print song
            </button>
          </div>
        </form>
      </dialog>
    </>
  )
}
