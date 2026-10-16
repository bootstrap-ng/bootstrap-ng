import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  DOCUMENT,
  DestroyRef,
  inject,
  Injector,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

interface DocsTocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/** Distance from the top of the viewport at which a heading becomes the current section. */
const ACTIVE_OFFSET = 96;

/**
 * "On this page" navigation built from the `h2` and `h3` section headings (`docsHeading`) in the
 * main content. Headings inside examples, such as a drawer's title, are left out. The link for
 * the section being read is highlighted as the page scrolls.
 */
@Component({
  selector: 'docs-toc',
  imports: [RouterLink],
  host: {
    '(window:scroll)': 'scheduleUpdate()',
    '(window:resize)': 'scheduleUpdate()',
  },
  template: `
    @if (items().length) {
      <nav class="docs-toc position-sticky overflow-auto py-9 fs-sm" aria-label="On this page">
        <ul class="list-unstyled m-0 border-start">
          @for (item of items(); track item.id) {
            <li>
              <a
                class="d-block pe-4 text-decoration-none"
                [class.ps-4]="item.level === 2"
                [class.ps-7]="item.level === 3"
                [class.active]="item.id === active()"
                [class.fw-semibold]="item.id === active()"
                [routerLink]="[]"
                [fragment]="item.id"
                [attr.aria-current]="item.id === active() ? 'location' : null">
                {{ item.text }}
              </a>
            </li>
          }
        </ul>
      </nav>
    }
  `,
  styleUrl: './toc.scss',
})
export class DocsToc {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  protected readonly items = signal<DocsTocItem[]>([]);
  protected readonly active = signal<string | null>(null);

  private headings: HTMLElement[] = [];
  private frame = 0;

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
      return;
    }
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.collectAfterRender());
    this.collectAfterRender();
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.frame));
  }

  protected scheduleUpdate(): void {
    if (this.frame || !this.headings.length) {
      return;
    }
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.updateActive();
    });
  }

  private collectAfterRender(): void {
    afterNextRender({ read: () => this.collect() }, { injector: this.injector });
  }

  private collect(): void {
    this.headings = Array.from(
      this.document.querySelectorAll<HTMLElement>(
        '#content h2[docsHeading], #content h3[docsHeading]',
      ),
    );
    this.items.set(
      this.headings.map((heading) => ({
        id: heading.id,
        text: heading.textContent.trim(),
        level: heading.tagName === 'H3' ? 3 : 2,
      })),
    );
    this.updateActive();
  }

  /** The current section is the last heading scrolled past. At the page end it's the last one. */
  private updateActive(): void {
    const view = this.document.defaultView;
    const first = this.headings[0];
    if (!view || !first) {
      this.active.set(null);
      return;
    }
    const atBottom =
      view.innerHeight + view.scrollY >= this.document.documentElement.scrollHeight - 2;
    let current = first;
    for (const heading of this.headings) {
      if (heading.getBoundingClientRect().top <= ACTIVE_OFFSET) {
        current = heading;
      }
    }
    if (atBottom) {
      // Sections near the end can't scroll to the top. Keep a linked section if it's in view.
      const linked = this.headings.find((h) => `#${h.id}` === view.location.hash);
      const inView = linked && linked.getBoundingClientRect().top < view.innerHeight;
      current = inView ? linked : (this.headings.at(-1) ?? first);
    }
    this.active.set(current.id);
  }
}
