import { Location, ViewportScroller } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BsButton, BsCloseButton, BsDialogClose, BsDrawer } from 'bootstrap-ng';
import { filter, map } from 'rxjs';
import { NAV } from './nav';
import { DocsSearch } from './search';
import { DocsThemeToggle } from './theme-toggle';
import { DocsToc } from './toc';

@Component({
  selector: 'docs-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    BsButton,
    BsCloseButton,
    BsDialogClose,
    BsDrawer,
    DocsSearch,
    DocsThemeToggle,
    DocsToc,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The homepage fills the viewport below the header so its content can center vertically. Its
  // backdrop is dark in both color modes, so the page always uses dark mode for light text.
  host: {
    '[class]': "isHome() ? 'd-flex flex-column min-vh-100 fg-body' : 'd-block'",
    '[attr.data-bs-theme]': "isHome() ? 'dark' : null",
  },
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // Start from the browser's URL rather than `/`, so hydrating a prerendered page renders the
  // same layout the server did instead of replacing it.
  private readonly url = toSignal(
    inject(Router).events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: inject(Location).path(true) || '/' },
  );

  private readonly location = inject(Location);
  protected readonly nav = NAV;
  protected readonly menuOpen = signal(false);

  constructor() {
    const scroller = inject(ViewportScroller);
    const location = inject(DOCUMENT).location;
    // Keep headings clear of the sticky header when scrolling to a #fragment.
    scroller.setOffset([0, 72]);
    // The router skips anchor scrolling while it hydrates a prerendered page, and it turns off
    // the browser's own scroll restoration, so scroll to the fragment of the first page here.
    afterNextRender(() => {
      const fragment = decodeURIComponent(location.hash.slice(1));
      if (fragment) {
        scroller.scrollToAnchor(fragment);
      }
    });
  }

  /**
   * The skip link's target on this page. A bare `#content` would resolve against
   * `<base href>` and load the home page.
   */
  protected skipHref(): string {
    return `${this.location.prepareExternalUrl(this.url().split('#')[0] ?? '/')}#content`;
  }

  /** Whether the current page is in a top-level section, such as `components`. */
  protected isSection(section: string): boolean {
    return this.url().startsWith(`/${section}/`);
  }

  protected isHome(): boolean {
    return this.url() === '/' || this.url().startsWith('/#');
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
