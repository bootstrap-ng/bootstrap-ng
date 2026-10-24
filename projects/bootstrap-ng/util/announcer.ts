import { DestroyRef, DOCUMENT, inject, Service } from '@angular/core';

/** Time between clearing a live region and writing the new message. */
const ANNOUNCE_DELAY = 100;

/**
 * Reads messages out to screen reader users through visually hidden live regions that
 * stay on the page. Screen readers often miss a live region that is added or shown
 * together with its text, so toasts and carousels announce through this service.
 *
 * ```ts
 * inject(BsLiveAnnouncer).announce('3 results found');
 * ```
 */
@Service()
export class BsLiveAnnouncer {
  private readonly document = inject(DOCUMENT);
  private readonly regions = new Map<'polite' | 'assertive', HTMLElement>();
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.timer);
      for (const region of this.regions.values()) {
        region.remove();
      }
      this.regions.clear();
    });
  }

  /** Announces `message`. `'assertive'` interrupts the screen reader, for errors. */
  announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
    const region = this.region(politeness);
    clearTimeout(this.timer);
    // Clear first, so the same message is announced again, and write after a delay,
    // so a region that was just created is registered before its text changes.
    for (const other of this.regions.values()) {
      other.textContent = '';
    }
    this.timer = setTimeout(() => (region.textContent = message.trim()), ANNOUNCE_DELAY);
  }

  /** Clears pending and current announcements. */
  clear(): void {
    clearTimeout(this.timer);
    for (const region of this.regions.values()) {
      region.textContent = '';
    }
  }

  private region(politeness: 'polite' | 'assertive'): HTMLElement {
    let region = this.regions.get(politeness);
    if (!region?.isConnected) {
      region = this.document.createElement('div');
      region.className = 'visually-hidden';
      region.setAttribute('aria-live', politeness);
      region.setAttribute('aria-atomic', 'true');
      this.document.body.append(region);
      this.regions.set(politeness, region);
    }
    return region;
  }
}
