import { DestroyRef, DOCUMENT, inject, Injectable } from '@angular/core';
import { MODAL_GUEST_ATTRIBUTE, modalHost } from './modal';

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
@Injectable({ providedIn: 'root' })
export class BsLiveAnnouncer {
  private readonly document = inject(DOCUMENT);
  private readonly regions = new Map<'polite' | 'assertive', HTMLElement>();
  /** Timers of the messages waiting to be written, per region. */
  private readonly pending = new Map<'polite' | 'assertive', ReturnType<typeof setTimeout>>();

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.clearPending();
      for (const region of this.regions.values()) {
        region.remove();
      }
      this.regions.clear();
    });
  }

  /** Announces `message`. `'assertive'` interrupts the screen reader, for errors. */
  announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
    const region = this.region(politeness);
    // A newer message replaces a pending one in the same region, but not in the other,
    // so a polite message doesn't drop an assertive error.
    clearTimeout(this.pending.get(politeness));
    // Clear first, so the same message is announced again, and write after a delay,
    // so a region that was just created is registered before its text changes. The other
    // region is cleared too, so only the newest message is read.
    for (const other of this.regions.values()) {
      other.textContent = '';
    }
    const text = message.trim();
    const timer = setTimeout(() => {
      this.pending.delete(politeness);
      region.textContent = text;
    }, ANNOUNCE_DELAY);
    this.pending.set(politeness, timer);
  }

  /** Clears pending and current announcements. */
  clear(): void {
    this.clearPending();
    for (const region of this.regions.values()) {
      region.textContent = '';
    }
  }

  private clearPending(): void {
    for (const timer of this.pending.values()) {
      clearTimeout(timer);
    }
    this.pending.clear();
  }

  private region(politeness: 'polite' | 'assertive'): HTMLElement {
    let region = this.regions.get(politeness);
    // Screen readers ignore a region outside an open modal dialog, which makes the
    // rest of the page inert, so the region moves into the dialog on top.
    const host = modalHost(this.document);
    if (!region?.isConnected) {
      region = this.document.createElement('div');
      region.className = 'visually-hidden';
      region.setAttribute('aria-live', politeness);
      region.setAttribute('aria-atomic', 'true');
      region.setAttribute(MODAL_GUEST_ATTRIBUTE, '');
      host.append(region);
      this.regions.set(politeness, region);
    } else if (region.parentElement !== host) {
      host.append(region);
    }
    return region;
  }
}
