/**
 * Returns the first transition duration plus delay of an element, in milliseconds.
 * Mirrors Bootstrap's `getTransitionDurationFromElement` helper.
 */
export function getTransitionDuration(element: Element): number {
  const { transitionDuration, transitionDelay } = getComputedStyle(element);
  const duration = Number.parseFloat(transitionDuration.split(',')[0] ?? '');
  const delay = Number.parseFloat(transitionDelay.split(',')[0] ?? '');

  if (!duration && !delay) {
    return 0;
  }

  return ((duration || 0) + (delay || 0)) * 1000;
}

/**
 * Resolves once the element's CSS transition ends. Resolves at once when the element
 * has no transition, and falls back to a timer in case `transitionend` never fires.
 */
export function waitForTransition(element: Element): Promise<void> {
  const duration = getTransitionDuration(element);

  if (duration === 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) {
        return;
      }
      done = true;
      element.removeEventListener('transitionend', onEnd);
      clearTimeout(timer);
      resolve();
    };
    const onEnd = (event: Event) => {
      if (event.target === element) {
        finish();
      }
    };
    const timer = setTimeout(finish, duration + 5);
    element.addEventListener('transitionend', onEnd);
  });
}
