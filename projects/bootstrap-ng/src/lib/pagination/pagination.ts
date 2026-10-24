import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  numberAttribute,
  Provider,
} from '@angular/core';
import { BsTheme, themeClass } from '../util/theme';
import { configToken, provideConfig } from '../util/config';

type PageItem = { type: 'page'; page: number } | { type: 'ellipsis'; key: string };

/** Defaults for the inputs of paginations. Inputs set on a component win over them. */
export interface BsPaginationConfig {
  /** Most page buttons to show, including the first and last page. At least 5. */
  maxPages: number;
  /** Size of the pagination. */
  size: 'sm' | 'md' | 'lg';
  /** Visible text of the previous button. */
  previousText: string;
  /** Visible text of the next button. */
  nextText: string;
  /** Accessible label of the previous button, for when `previousText` is an icon. */
  previousLabel: string | null;
  /** Accessible label of the next button, for when `nextText` is an icon. */
  nextLabel: string | null;
}

/** The defaults set with `provideBsPaginationConfig()`. */
export const BS_PAGINATION_CONFIG = configToken<BsPaginationConfig>('BS_PAGINATION_CONFIG');

/**
 * Sets defaults for the inputs of paginations, for the whole app in `bootstrapApplication()`,
 * or for part of it in a component's `providers`.
 *
 * ```ts
 * providers: [provideBsPaginationConfig({ previousText: 'Précédent', nextText: 'Suivant' })]
 * ```
 */
export function provideBsPaginationConfig(config: Partial<BsPaginationConfig>): Provider {
  return provideConfig(BS_PAGINATION_CONFIG, config);
}

/**
 * Page navigation. Renders Bootstrap's `.pagination` list inside the `<nav>` it is
 * applied to, with previous and next buttons and an ellipsis when there are more
 * pages than `maxPages`. Give the `<nav>` an `aria-label` that says what it pages.
 *
 * ```html
 * <nav bsPagination [(page)]="page" [pageCount]="20" aria-label="Search results pages"></nav>
 * ```
 */
@Component({
  selector: 'nav[bsPagination]',
  exportAs: 'bsPagination',
  template: `
    <ul class="pagination" [class]="classes()">
      <li class="page-item" [class.disabled]="current() <= 1">
        <button
          type="button"
          class="page-link"
          [disabled]="current() <= 1"
          [attr.aria-label]="previousLabel()"
          (click)="step(-1)">
          {{ previousText() }}
        </button>
      </li>
      @for (item of items(); track item.type === 'page' ? item.page : item.key) {
        @if (item.type === 'page') {
          <li class="page-item" [class.active]="item.page === current()">
            <button
              type="button"
              class="page-link"
              [attr.aria-current]="item.page === current() ? 'page' : null"
              (click)="select(item.page)">
              {{ item.page }}
            </button>
          </li>
        } @else {
          <li class="page-item disabled" aria-hidden="true">
            <span class="page-link">…</span>
          </li>
        }
      }
      <li class="page-item" [class.disabled]="current() >= lastPage()">
        <button
          type="button"
          class="page-link"
          [disabled]="current() >= lastPage()"
          [attr.aria-label]="nextLabel()"
          (click)="step(1)">
          {{ nextText() }}
        </button>
      </li>
    </ul>
  `,
})
export class BsPagination {
  private readonly config = inject(BS_PAGINATION_CONFIG);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);

  /** Current page, starting at 1. Supports `[(page)]`. */
  readonly page = model(1);
  /** Number of pages. */
  readonly pageCount = input.required({ transform: numberAttribute });
  /** Most page buttons to show, including the first and last page. At least 5. */
  readonly maxPages = input(this.config.maxPages ?? 7, { transform: numberAttribute });
  /** Size of the pagination. */
  readonly size = input<'sm' | 'md' | 'lg'>(this.config.size ?? 'md');
  /** Theme color of the active page and focus styles. */
  readonly theme = input<BsTheme | null>(null);
  /** Visible text of the previous button. */
  readonly previousText = input(this.config.previousText ?? 'Previous');
  /** Visible text of the next button. */
  readonly nextText = input(this.config.nextText ?? 'Next');
  /** Accessible label of the previous button, for when `previousText` is an icon. */
  readonly previousLabel = input<string | null>(this.config.previousLabel ?? null);
  /** Accessible label of the next button, for when `nextText` is an icon. */
  readonly nextLabel = input<string | null>(this.config.nextLabel ?? null);

  protected readonly classes = computed(() =>
    [themeClass(this.theme()), this.size() === 'md' ? '' : `pagination-${this.size()}`]
      .filter(Boolean)
      .join(' '),
  );

  /** Last selectable page: `pageCount` rounded down, and at least 1. */
  protected readonly lastPage = computed(() => Math.max(Math.floor(this.pageCount()), 1));

  /** Current page clamped to the available pages, for example after `pageCount` shrinks. */
  readonly current = computed(() => Math.min(Math.max(this.page(), 1), this.lastPage()));

  protected readonly items = computed<PageItem[]>(() => {
    const count = Math.max(0, Math.floor(this.pageCount()));
    const max = Math.max(5, Math.floor(this.maxPages()));
    const current = this.current();
    const pages = (from: number, to: number): PageItem[] =>
      Array.from({ length: to - from + 1 }, (_, i) => ({ type: 'page', page: from + i }));

    if (count <= max) {
      return pages(1, count);
    }
    // Slots between the first and last page, one of which may be an ellipsis.
    const inner = max - 2;
    if (current <= inner - 1) {
      return [...pages(1, inner), { type: 'ellipsis', key: 'end' }, ...pages(count, count)];
    }
    if (current >= count - inner + 2) {
      return [
        ...pages(1, 1),
        { type: 'ellipsis', key: 'start' },
        ...pages(count - inner + 1, count),
      ];
    }
    const around = inner - 2;
    const start = current - Math.floor((around - 1) / 2);
    return [
      ...pages(1, 1),
      { type: 'ellipsis', key: 'start' },
      ...pages(start, start + around - 1),
      { type: 'ellipsis', key: 'end' },
      ...pages(count, count),
    ];
  });

  /** Goes to `page`, clamped to the available pages. */
  select(page: number): void {
    const next = Math.min(Math.max(page, 1), this.lastPage());
    if (next !== this.page()) {
      this.page.set(next);
    }
  }

  /**
   * Goes to the previous or next page. When that disables the button, focus moves to
   * the current page so it isn't lost.
   */
  protected step(delta: -1 | 1): void {
    this.select(this.current() + delta);
    const current = this.current();
    if (current === 1 || current === this.lastPage()) {
      afterNextRender(
        () => this.element.querySelector<HTMLElement>('[aria-current="page"]')?.focus(),
        { injector: this.injector },
      );
    }
  }
}
