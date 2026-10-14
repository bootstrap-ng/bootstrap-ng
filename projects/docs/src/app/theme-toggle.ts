import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  effect,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { BsButton } from 'bootstrap-ng';

type ColorMode = 'light' | 'dark';

const STORAGE_KEY = 'docs-color-mode';

/** Switches between the light and dark Bootstrap color modes. */
@Component({
  selector: 'docs-theme-toggle',
  imports: [BsButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      bsButton="text"
      size="sm"
      icon
      [attr.aria-label]="label()"
      [title]="label()"
      (click)="toggle()">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        @if (mode() === 'dark') {
          <path
            d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708" />
        } @else {
          <path
            d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278" />
        }
      </svg>
    </button>
  `,
})
export class DocsThemeToggle {
  private readonly document = inject(DOCUMENT);

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly mode = signal<ColorMode>(this.initialMode());

  constructor() {
    effect(() => {
      const mode = this.mode();
      // Prerendered pages leave the mode to the inline script in index.html.
      if (!this.isBrowser) {
        return;
      }
      this.document.documentElement.setAttribute('data-bs-theme', mode);
    });
  }

  protected label(): string {
    return this.mode() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  }

  protected toggle(): void {
    this.mode.update((mode) => (mode === 'dark' ? 'light' : 'dark'));
    // Only a choice the user made is saved, so the site keeps following the system until then.
    try {
      localStorage.setItem(STORAGE_KEY, this.mode());
    } catch {
      // Storage can be unavailable, for example in private browsing.
    }
  }

  private initialMode(): ColorMode {
    if (!this.isBrowser) {
      return 'light';
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {
      // Fall through to the system preference.
    }
    return this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
}
