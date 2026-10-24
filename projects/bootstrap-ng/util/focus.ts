const TABBABLE =
  'a[href], area[href], button, input, select, textarea, summary, iframe, [contenteditable], [tabindex]';

/** Elements under `root` that Tab reaches, in document order. */
export function tabbables(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(TABBABLE)).filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.matches(':disabled, [inert] *, input[type="hidden"]') &&
      element.getClientRects().length > 0,
  );
}

/**
 * The element Tab reaches after (or, with `backward`, before) `element`, leaving out
 * everything inside `element` and the `skip` elements, and staying inside a modal dialog.
 */
export function adjacentTabbable(
  element: Element,
  backward = false,
  skip: readonly Element[] = [],
): HTMLElement | null {
  // A modal dialog makes the rest of the page unreachable.
  const scope = element.closest('dialog:modal') ?? element.ownerDocument;
  const outside = tabbables(scope).filter(
    (candidate) =>
      !element.contains(candidate) && !skip.some((container) => container.contains(candidate)),
  );
  const following = (candidate: HTMLElement) =>
    Boolean(element.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_FOLLOWING);
  return backward
    ? (outside.filter((candidate) => !following(candidate)).at(-1) ?? null)
    : (outside.find(following) ?? null);
}
