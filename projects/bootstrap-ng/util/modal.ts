/**
 * The open modal dialog on top, or `body` when none is open. A modal dialog makes the
 * rest of the page inert and covers it with its backdrop, so content that must stay
 * visible and usable while one is open, such as toasts and live regions, goes inside it.
 */
export function modalHost(document: Document): HTMLElement {
  const dialogs = document.querySelectorAll<HTMLDialogElement>('dialog:modal');
  return dialogs[dialogs.length - 1] ?? document.body;
}
