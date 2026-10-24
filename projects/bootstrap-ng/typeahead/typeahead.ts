import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  createComponent,
  DestroyRef,
  Directive,
  DOCUMENT,
  ElementRef,
  EnvironmentInjector,
  inject,
  Injector,
  input,
  numberAttribute,
  output,
  Provider,
  signal,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  autoPosition,
  BsLiveAnnouncer,
  BsPlacement,
  configToken,
  provideConfig,
  uniqueId,
} from 'bootstrap-ng/util';

/** Anything with an RxJS-style `subscribe()`, such as an `Observable`. */
export interface BsSubscribable<T> {
  subscribe(observer: { next: (value: T) => void; error?: (error: unknown) => void }): {
    unsubscribe(): void;
  };
}

/**
 * Finds the suggestions for a search term. It can return them directly, as a
 * promise (for `fetch`), or as an observable (for `HttpClient`).
 */
export type BsTypeaheadSearch<T> = (
  term: string,
) => readonly T[] | Promise<readonly T[]> | BsSubscribable<readonly T[]>;

/** Context of a `bsTypeahead` item template. */
export interface BsTypeaheadItemContext<T> {
  /** The suggestion. */
  $implicit: T;
  /** The current search term, for highlighting. */
  term: string;
  /** The suggestion as text, from `formatter`. */
  text: string;
}

interface TextPart {
  text: string;
  match: boolean;
}

/** Splits `text` into parts that match `term` (case-insensitively) and parts that don't. */
function highlight(text: string, term: string): TextPart[] {
  const query = term.trim().toLowerCase();
  if (!query) {
    return [{ text, match: false }];
  }
  const parts: TextPart[] = [];
  const lower = text.toLowerCase();
  let index = 0;
  for (let found = lower.indexOf(query); found !== -1; found = lower.indexOf(query, index)) {
    if (found > index) {
      parts.push({ text: text.slice(index, found), match: false });
    }
    parts.push({ text: text.slice(found, found + query.length), match: true });
    index = found + query.length;
  }
  if (index < text.length) {
    parts.push({ text: text.slice(index), match: false });
  }
  return parts;
}

/** @internal The suggestion list of a `bsTypeahead`, rendered in a Bootstrap `.menu`. */
@Component({
  selector: 'bs-typeahead-popup',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'menu menu-scrollable show',
    role: 'listbox',
    '[id]': 'typeahead.listboxId',
    '[attr.aria-label]': 'typeahead.listLabel()',
    '(pointerdown)': '$event.preventDefault()',
  },
  template: `
    @for (item of typeahead.results(); track $index) {
      <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -- Focus stays in the input, which handles the keys and points at the option with aria-activedescendant. -->
      <div
        class="menu-item"
        role="option"
        [id]="typeahead.optionId($index)"
        [class.active]="$index === typeahead.activeIndex()"
        [attr.aria-selected]="$index === typeahead.activeIndex()"
        (click)="typeahead.select(item)"
        (pointermove)="typeahead.activeIndex.set($index)">
        @let text = typeahead.formatter()(item);
        @if (typeahead.itemTemplate(); as template) {
          <ng-container
            [ngTemplateOutlet]="template"
            [ngTemplateOutletContext]="{ $implicit: item, term: typeahead.term(), text }" />
        } @else {
          <!-- prettier-ignore -->
          <span>@for (part of highlight(text, typeahead.term()); track $index) {@if (part.match) {<strong>{{ part.text }}</strong>} @else {{{ part.text }}}}</span>
        }
      </div>
    }
  `,
})
export class BsTypeaheadPopup {
  readonly typeahead = inject(BsTypeahead);
  protected readonly highlight = highlight;
}

/** Defaults for the inputs of typeaheads. Inputs set on a component win over them. */
export interface BsTypeaheadConfig {
  /** Characters to type before searching. */
  minLength: number;
  /** Milliseconds to wait after the last keystroke before searching. */
  debounce: number;
  /** Where the list opens relative to the input. */
  placement: BsPlacement;
  /** Accessible label of the suggestion list. */
  listLabel: string;
  /** Text announced to screen readers when suggestions arrive. */
  resultsText: (count: number) => string;
}

/** The defaults set with `provideBsTypeaheadConfig()`. */
export const BS_TYPEAHEAD_CONFIG = configToken<BsTypeaheadConfig>('BS_TYPEAHEAD_CONFIG');

/**
 * Sets defaults for the inputs of typeaheads, for the whole app in `bootstrapApplication()`,
 * or for part of it in a component's `providers`.
 *
 * ```ts
 * providers: [provideBsTypeaheadConfig({ debounce: 300 })]
 * ```
 */
export function provideBsTypeaheadConfig(config: Partial<BsTypeaheadConfig>): Provider {
  return provideConfig(BS_TYPEAHEAD_CONFIG, config);
}

/**
 * Suggests values while the user types in a text input. The user can pick a
 * suggestion or keep their own text. The input stays a native input, so bind it to
 * a form like any other.
 *
 * ```html
 * <input bsFormControl [bsTypeahead]="search" aria-label="Country" [formControl]="country" />
 * ```
 *
 * ```ts
 * search = (term: string) => COUNTRIES.filter((c) => c.toLowerCase().includes(term.toLowerCase()));
 * ```
 *
 * The search can return an array, a promise or an observable. Follows the ARIA
 * combobox pattern: arrow keys move through the suggestions, Enter picks one and
 * Escape closes the list.
 */
@Directive({
  selector: 'input[bsTypeahead]',
  exportAs: 'bsTypeahead',
  host: {
    role: 'combobox',
    autocomplete: 'off',
    'aria-autocomplete': 'list',
    '[attr.aria-expanded]': 'isOpen()',
    '[attr.aria-controls]': 'isOpen() ? listboxId : null',
    '[attr.aria-activedescendant]': 'activeDescendant()',
    '(input)': 'onInput($event)',
    '(keydown)': 'onKeydown($event)',
    '(blur)': 'close()',
  },
})
export class BsTypeahead<T = unknown> {
  private readonly config = inject(BS_TYPEAHEAD_CONFIG);
  private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly injector = inject(Injector);
  private readonly announcer = inject(BsLiveAnnouncer);

  /** Finds the suggestions for a search term. */
  readonly search = input.required<BsTypeaheadSearch<T>>({ alias: 'bsTypeahead' });
  /** Turns a suggestion into the text shown in the list and put in the input. */
  readonly formatter = input<(item: T) => string>(String);
  /** Custom template for each suggestion. Its context is `BsTypeaheadItemContext`. */
  readonly itemTemplate = input<TemplateRef<BsTypeaheadItemContext<T>> | null>(null);
  /** Characters to type before searching. */
  readonly minLength = input(this.config.minLength ?? 1, { transform: numberAttribute });
  /** Milliseconds to wait after the last keystroke before searching. */
  readonly debounce = input(this.config.debounce ?? 200, { transform: numberAttribute });
  /** Where the list opens relative to the input. */
  readonly placement = input<BsPlacement>(this.config.placement ?? 'bottom-start');
  /** Accessible label of the suggestion list. */
  readonly listLabel = input(this.config.listLabel ?? 'Suggestions');
  /** Text announced to screen readers when suggestions arrive. */
  readonly resultsText = input(
    this.config.resultsText ??
      ((count: number) =>
        count === 0
          ? 'No suggestions'
          : count === 1
            ? '1 suggestion available'
            : `${count} suggestions available`),
  );

  /** Emits the suggestion the user picked, after the input is updated. */
  readonly itemSelect = output<T>();

  /** @internal Current suggestions. */
  readonly results = signal<readonly T[]>([]);
  /** @internal Index of the highlighted suggestion, or -1. */
  readonly activeIndex = signal(-1);
  /** @internal The term the current suggestions are for. */
  readonly term = signal('');
  /** @internal */
  readonly listboxId = uniqueId('bs-typeahead');

  private readonly open = signal(false);
  /** Whether the suggestion list is showing. */
  readonly isOpen = this.open.asReadonly();

  protected readonly activeDescendant = computed(() => {
    const index = this.activeIndex();
    return this.isOpen() && index >= 0 ? this.optionId(index) : null;
  });

  private popup: ComponentRef<BsTypeaheadPopup> | null = null;
  private stopPositioning: (() => void) | undefined;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private subscription: { unsubscribe(): void } | undefined;
  /** Bumped on every search, so a slow answer to an old search is dropped. */
  private request = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.cancel();
      this.close();
    });
  }

  /** @internal */
  optionId(index: number): string {
    return `${this.listboxId}-${index}`;
  }

  /** Picks a suggestion: puts it in the input, closes the list and emits `itemSelect`. */
  select(item: T): void {
    this.cancel();
    this.element.value = this.formatter()(item);
    // Let `ngModel`, reactive and signal forms see the new value. `onInput` ignores it.
    this.element.dispatchEvent(new CustomEvent('input', { bubbles: true, detail: 'bsTypeahead' }));
    this.close();
    this.itemSelect.emit(item);
  }

  /** Closes the suggestion list. */
  close(): void {
    this.cancel();
    this.hidePopup();
  }

  /** Hides the list but keeps a running search, which may still answer. */
  private hidePopup(): void {
    this.open.set(false);
    this.activeIndex.set(-1);
    this.stopPositioning?.();
    this.stopPositioning = undefined;
    if (this.popup) {
      this.appRef.detachView(this.popup.hostView);
      this.popup.destroy();
      this.popup = null;
    }
  }

  protected onInput(event: Event): void {
    if (event instanceof CustomEvent && event.detail === 'bsTypeahead') {
      return;
    }
    this.cancel();
    const term = this.element.value;
    if (term.trim().length < this.minLength()) {
      this.close();
      return;
    }
    const delay = this.debounce();
    if (delay > 0) {
      this.timer = setTimeout(() => {
        this.run(term);
      }, delay);
    } else {
      this.run(term);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.results().length;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        if (!this.isOpen()) {
          // Opens the list for the current text.
          if (this.element.value.trim().length >= this.minLength()) {
            event.preventDefault();
            this.cancel();
            this.run(this.element.value);
          }
          return;
        }
        event.preventDefault();
        const step = event.key === 'ArrowDown' ? 1 : -1;
        const index = this.activeIndex();
        // Moving past either end returns to the input, as in the ARIA pattern.
        const next = index === -1 ? (step === 1 ? 0 : count - 1) : index + step;
        this.activeIndex.set(next >= 0 && next < count ? next : -1);
        this.scrollActiveIntoView();
        break;
      }
      case 'Enter': {
        const index = this.activeIndex();
        if (this.isOpen() && index >= 0) {
          event.preventDefault();
          // `index` is in range while the list is open.
          this.select(this.results()[index] as T);
        }
        break;
      }
      case 'Escape':
        if (this.isOpen()) {
          event.preventDefault();
          // Keep an Escape that closes the list from also closing a parent dialog.
          event.stopPropagation();
          this.close();
        }
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  private run(term: string): void {
    const request = ++this.request;
    const apply = (results: readonly T[]) => {
      if (request === this.request && this.document.activeElement === this.element) {
        this.show(term, results);
      }
    };
    const answer = this.search()(term);
    if (Array.isArray(answer)) {
      apply(answer as readonly T[]);
    } else if (answer instanceof Promise) {
      void answer.then(apply, () => undefined);
    } else {
      this.subscription = (answer as BsSubscribable<readonly T[]>).subscribe({
        next: apply,
        error: () => undefined,
      });
    }
  }

  private show(term: string, results: readonly T[]): void {
    this.term.set(term);
    this.results.set(results);
    this.activeIndex.set(-1);
    this.announcer.announce(this.resultsText()(results.length));
    if (!results.length) {
      this.hidePopup();
      return;
    }
    this.open.set(true);
    if (!this.popup) {
      this.createPopup();
    }
  }

  private createPopup(): void {
    const popup = createComponent(BsTypeaheadPopup, {
      environmentInjector: this.environmentInjector,
      elementInjector: this.injector,
    });
    this.appRef.attachView(popup.hostView);
    const element = popup.location.nativeElement as HTMLElement;
    element.style.minWidth = `${this.element.offsetWidth}px`;
    (this.element.closest('dialog[open]') ?? this.document.body).append(element);
    popup.changeDetectorRef.detectChanges();
    this.popup = popup;
    this.stopPositioning = autoPosition(this.element, element, () => ({
      placement: this.placement(),
      offset: 2,
    }));
  }

  private scrollActiveIntoView(): void {
    const id = this.activeDescendant();
    if (id) {
      this.document.getElementById(id)?.scrollIntoView({ block: 'nearest' });
    }
  }

  private cancel(): void {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.subscription?.unsubscribe();
    this.subscription = undefined;
    this.request++;
  }
}
