/**
 * The open modal dialog on top, or `body` when none is open. A modal dialog makes the
 * rest of the page inert and covers it with its backdrop, so content that must stay
 * visible and usable while one is open, such as toasts and live regions, goes inside it.
 */
export function modalHost(document: Document): HTMLElement {
  const dialogs = document.querySelectorAll<HTMLDialogElement>('dialog:modal');
  return dialogs[dialogs.length - 1] ?? document.body;
}

/**
 * Marks content that moves into the modal dialog on top, such as the toast container and
 * live regions, so it moves out again when that dialog closes.
 */
export const MODAL_GUEST_ATTRIBUTE = 'data-bs-modal-guest';

/**
 * Moves the marked content out of a dialog that closed, into the modal dialog now on top
 * or `body`, so it isn't removed with the dialog.
 */
export function releaseModalGuests(dialog: HTMLElement): void {
  const guests = dialog.querySelectorAll(`:scope > [${MODAL_GUEST_ATTRIBUTE}]`);
  if (guests.length) {
    modalHost(dialog.ownerDocument).append(...guests);
  }
}
