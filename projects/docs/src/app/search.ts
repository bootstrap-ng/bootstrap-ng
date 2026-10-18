import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  DOCUMENT,
  ElementRef,
  inject,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { BsCloseButton, BsDialog, BsDialogClose } from 'bootstrap-ng';

/** The parts of Pagefind's browser API that the search dialog uses. */
interface Pagefind {
  options(options: { baseUrl: string }): Promise<void>;
  debouncedSearch(
    query: string,
  ): Promise<{ results: { data(): Promise<PagefindResult> }[] } | null>;
}

interface PagefindResult {
  url: string;
  excerpt: string;
  meta: { title?: string };
  sub_results: { url: string; title: string; excerpt: string }[];
}

export interface DocsSearchResult {
  url: string;
  path: string;
  title: string;
  excerpt: string;
}

type SearchStatus = 'idle' | 'loading' | 'ready' | 'unavailable';

const MAX_RESULTS = 8;

/**
 * Site search powered by Pagefind. The index is built from the prerendered pages after
 * `ng build`, so search works on the built site but not in `ng serve`.
 */
@Component({
  selector: 'docs-search',
  imports: [BsCloseButton, BsDialog, BsDialogClose],
  host: {
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
  template: `
    <button
      type="button"
      class="docs-search-button d-flex align-items-center gap-3 border rounded-5 bg-1 fg-2 text-start"
      [attr.aria-label]="'Search docs ' + shortcutLabel()"
      aria-keyshortcuts="Control+K Meta+K /"
      (click)="open()">
      <svg class="flex-shrink-0" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <path
          fill="currentColor"
          d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398l3.85 3.85a1 1 0 0 0 1.415-1.415l-3.85-3.85zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
      </svg>
      <span class="d-none md:d-inline flex-grow-1 text-nowrap">Search docs…</span>
      <kbd
        class="d-none md:d-inline border rounded-4 bg-body fg-2 fs-xs shadow-none"
        aria-hidden="true"
        >{{ shortcutLabel() }}</kbd
      >
    </button>

    <dialog
      bsDialog
      #dialog="bsDialog"
      class="docs-search-dialog"
      aria-labelledby="docs-search-title"
      (shown)="input.focus()">
      <div class="dialog-header">
        <h2 class="dialog-title h5" id="docs-search-title">Search the docs</h2>
        <button bsCloseButton bsDialogClose></button>
      </div>
      <div class="dialog-body">
        <input
          #input
          type="search"
          class="form-control"
          placeholder="Search components and guides"
          aria-label="Search"
          aria-describedby="docs-search-status"
          [value]="query()"
          (input)="search(input.value)" />
        <p
          id="docs-search-status"
          class="mt-3 mb-0 fs-sm fg-2"
          [class.visually-hidden]="!statusText()"
          role="status">
          {{ statusText() }}
        </p>
        @if (results().length) {
          <ul class="docs-search-results list-unstyled d-flex flex-column gap-1 mt-4 mb-0">
            @for (result of results(); track result.url) {
              <li>
                <a
                  class="d-block py-3 px-4 rounded-4 text-decoration-none"
                  [href]="result.url"
                  (click)="go($event, result)">
                  <span class="d-block fw-semibold fg-body">{{ result.title }}</span>
                  <span class="d-block fs-sm fg-2" [innerHTML]="result.excerpt"></span>
                </a>
              </li>
            }
          </ul>
        }
      </div>
    </dialog>
  `,
  styleUrl: './search.scss',
})
export class DocsSearch {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly dialog = viewChild.required(BsDialog);
  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('input');

  protected readonly query = signal('');
  protected readonly results = signal<DocsSearchResult[]>([]);
  protected readonly status = signal<SearchStatus>('idle');
  /** "Ctrl K", or "⌘K" on Apple platforms. Set after hydration so both renders match. */
  protected readonly shortcutLabel = signal('Ctrl K');

  private pagefind?: Promise<Pagefind | null>;

  constructor() {
    afterNextRender(() => {
      if (/Mac|iPhone|iPad/.test(this.document.defaultView?.navigator.platform ?? '')) {
        this.shortcutLabel.set('⌘K');
      }
    });
  }

  protected open(): void {
    if (this.dialog().isOpen()) {
      this.searchInput().nativeElement.focus();
      return;
    }
    this.dialog().show();
    void this.load();
  }

  protected async search(query: string): Promise<void> {
    this.query.set(query);
    const pagefind = await this.load();
    if (!pagefind) {
      return;
    }
    if (!query.trim()) {
      this.results.set([]);
      this.status.set('idle');
      return;
    }
    this.status.set('loading');
    const search = await pagefind.debouncedSearch(query);
    if (!search) {
      // A newer query replaced this one.
      return;
    }
    const data = await Promise.all(search.results.slice(0, MAX_RESULTS).map((r) => r.data()));
    this.results.set(data.map((result) => this.toResult(result)));
    this.status.set('ready');
  }

  protected go(event: MouseEvent, result: DocsSearchResult): void {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    this.dialog().hide();
    void this.router.navigateByUrl(result.path);
  }

  protected statusText(): string {
    switch (this.status()) {
      case 'unavailable':
        return 'Search is available on the built site. Run npm run build:docs to create the index.';
      case 'loading':
        return 'Searching…';
      case 'ready': {
        const count = this.results().length;
        return count ? `${count} result${count === 1 ? '' : 's'}` : 'No results';
      }
      default:
        return '';
    }
  }

  /** Opens search with Ctrl+K or ⌘K, or with "/" when focus is not in a text field. */
  protected onDocumentKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.open();
      return;
    }
    const target = event.target as HTMLElement | null;
    const typing = target?.closest('input, textarea, select, [contenteditable="true"]');
    if (event.key === '/' && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      this.open();
    }
  }

  private load(): Promise<Pagefind | null> {
    if (!this.isBrowser) {
      return Promise.resolve(null);
    }
    this.pagefind ??= (async () => {
      try {
        const url = new URL('pagefind/pagefind.js', this.document.baseURI).href;
        const pagefind = (await import(/* @vite-ignore */ url)) as Pagefind;
        await pagefind.options({ baseUrl: this.basePath() });
        return pagefind;
      } catch {
        this.status.set('unavailable');
        return null;
      }
    })();
    return this.pagefind;
  }

  /** Links to the best matching section of a page when Pagefind found one. */
  private toResult(result: PagefindResult): DocsSearchResult {
    const pageTitle = result.meta.title?.replace(/ · bootstrap-ng$/, '') ?? result.url;
    const section = result.sub_results.find((sub) => sub.url.includes('#'));
    const url = section?.url ?? result.url;
    return {
      url,
      path: this.routerPath(url),
      title: section ? `${pageTitle} › ${section.title}` : pageTitle,
      excerpt: section?.excerpt ?? result.excerpt,
    };
  }

  private basePath(): string {
    return new URL(this.document.baseURI).pathname;
  }

  /** Turns a Pagefind result URL such as `/bootstrap-ng/components/alert/` into a router path. */
  private routerPath(url: string): string {
    const base = this.basePath();
    const path = url.startsWith(base) ? url.slice(base.length) : url.replace(/^\//, '');
    return `/${path.replace(/index\.html(?=$|#)/, '').replace(/\/(?=$|#)/, '')}`;
  }
}
