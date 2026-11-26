import { useRef } from 'react'
import type { SyntheticEvent } from 'react'

type ClearSongDialogProps = {
  onClear: () => void
}

export function ClearSongDialog({ onClear }: ClearSongDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const descriptionId = 'clear-song-description'
  const titleId = 'clear-song-title'

  function openDialog() {
    const dialog = dialogRef.current

    if (dialog && !dialog.open) {
      dialog.returnValue = ''
      dialog.showModal()
    }
  }

  function handleClose(event: SyntheticEvent<HTMLDialogElement>) {
    const dialog = event.currentTarget
    const confirmed = dialog.returnValue === 'clear'
    dialog.returnValue = ''

    if (confirmed) {
      onClear()
    }
  }

  return (
    <>
      <button
        type="button"
        className="button button--outline"
        onClick={openDialog}
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M4.5 6.5h11m-9.5 0 .6 10h6.8l.6-10M8 6.5V4h4v2.5m-3 3v4m2-4v4" />
        </svg>
        <span>Clear song</span>
      </button>

      <dialog
        ref={dialogRef}
        className="modal"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClose={handleClose}
      >
        <div className="modal__eyebrow">Start fresh</div>
        <h1 id={titleId}>Clear this song?</h1>
        <p id={descriptionId}>
          Your title, sections and chords will be removed. Your theme preference
          will stay the same.
        </p>
        <form className="modal__actions" method="dialog">
          <button className="button button--outline" value="cancel" autoFocus>
            Keep editing
          </button>
          <button className="button button--danger" value="clear">
            Clear song
          </button>
        </form>
      </dialog>
    </>
  )
}
