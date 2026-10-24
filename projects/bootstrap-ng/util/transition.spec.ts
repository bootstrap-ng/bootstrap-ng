import { getTransitionDuration, waitForTransition } from './transition';

describe('transition utilities', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.append(element);
  });

  afterEach(() => element.remove());

  describe('getTransitionDuration', () => {
    it('returns 0 without a transition', () => {
      expect(getTransitionDuration(element)).toBe(0);
    });

    it('adds the first duration and delay in milliseconds', () => {
      element.style.transition = 'opacity 0.2s linear 0.1s, transform 1s';
      expect(getTransitionDuration(element)).toBeCloseTo(300);
    });

    it('counts a delay on its own', () => {
      element.style.transitionDelay = '50ms';
      expect(getTransitionDuration(element)).toBeCloseTo(50);
    });
  });

  describe('waitForTransition', () => {
    it('resolves at once without a transition', async () => {
      let resolved = false;
      void waitForTransition(element).then(() => (resolved = true));
      await Promise.resolve();
      expect(resolved).toBe(true);
    });

    it('resolves on the element’s own transitionend', async () => {
      element.style.transition = 'opacity 10s';
      let resolved = false;
      const done = waitForTransition(element).then(() => (resolved = true));

      const child = document.createElement('span');
      element.append(child);
      child.dispatchEvent(new Event('transitionend', { bubbles: true }));
      await Promise.resolve();
      expect(resolved).toBe(false);

      element.dispatchEvent(new Event('transitionend'));
      await done;
      expect(resolved).toBe(true);
    });

    it('falls back to a timer when transitionend never fires', async () => {
      vi.useFakeTimers();
      try {
        element.style.transition = 'opacity 0.1s';
        let resolved = false;
        const done = waitForTransition(element).then(() => (resolved = true));
        await vi.advanceTimersByTimeAsync(50);
        expect(resolved).toBe(false);
        await vi.advanceTimersByTimeAsync(60);
        await done;
        expect(resolved).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
