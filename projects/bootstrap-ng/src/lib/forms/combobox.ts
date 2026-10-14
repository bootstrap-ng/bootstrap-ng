import {
  afterRenderEffect,
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  signal,
  untracked,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BsMenu } from '../menu/menu';
import { BsControl } from './control';
import { BsFormControlSize } from './form-control';
import { BsValueControl } from './value-control';

/** Lowercases text and strips accents, for search matching. */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/**
 * The options menu of a `bsCombobox`: a `bsMenu` that wraps its options in a
 * `role="listbox"` element. Put `bsComboboxOption` buttons in it, and optionally a
 * `bsComboboxSearch` input in a `.combobox-search`, `.menu-header` group labels and a
 * `bsComboboxNoResults` message. The search and the message stay outside the listbox,
 * which may only contain options.
 */
@Component({
  selector: '[bsComboboxMenu]',
  exportAs: 'bsComboboxMenu',
  hostDirectives: [{ directive: BsMenu, inputs: ['placement'] }],
  template: `
    <ng-content select=".combobox-search" />
    <!-- eslint-disable-next-line @angular-eslint/template/no-inline-styles -- Bootstrap has no gap utility for this variable. -->
    <div
      role="listbox"
      class="d-flex flex-column"
      style="gap: var(--bs-menu-gap)"
      [id]="listboxId()"
      [attr.aria-multiselectable]="combobox()?.multiple() || null"
      [attr.aria-labelledby]="combobox()?.id()">
      <ng-content />
    </div>
    <ng-content select="[bsComboboxNoResults]" />
  `,
  host: {
    '(focusout)': 'combobox()?.onFocusout($event)',
  },
})
export class BsComboboxMenu {
  /** @internal */
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  /** The menu's `BsMenu`, which opens, closes and positions it. */
  readonly menu = inject(BsMenu, { self: true });
  /** Shows a check mark on selected options. Always on in `multiple` comboboxes. */
  readonly check = input(false, { transform: booleanAttribute });

  /** @internal */
  readonly combobox = signal<BsCombobox | null>(null);
  /** Id of the listbox around the options. */
  readonly listboxId = computed(() => `${this.menu.id()}-listbox`);
  /** @internal */
  readonly options = signal<BsComboboxOption[]>([]);
  /** Current search text, lowercased and without accents. */
  readonly query = signal('');
  /** Whether no option matches the search. */
  readonly noResults = computed(() => {
    const options = this.options();
    return options.length > 0 && options.every((option) => option.filteredOut());
  });

  /** @internal */
  register(option: BsComboboxOption): () => void {
    untracked(() => this.options.update((options) => [...options, option]));
    return () => this.options.update((options) => options.filter((o) => o !== option));
  }
}

/**
 * An option in a `bsComboboxMenu`. Its content can be anything: text, an icon, a
 * `.menu-item-content` with a description. The combobox shows the option's `label`,
 * which defaults to its first `.menu-item-content` span or its text.
 *
 * ```html
 * <button bsComboboxOption value="us">United States</button>
 * ```
 */
@Component({
  selector: 'button[bsComboboxOption]',
  exportAs: 'bsComboboxOption',
  template: `
    <ng-content />
    @if (showCheck()) {
      <svg
        class="menu-item-check"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        viewBox="0 0 16 16"
        aria-hidden="true">
        <path d="m2 7 4 5 8-8" />
      </svg>
    }
  `,
  host: {
    class: 'menu-item',
    type: 'button',
    role: 'option',
    // The listbox is one tab stop: arrow keys move between options, Tab leaves the menu.
    tabindex: '-1',
    '[class.selected]': 'selected()',
    '[attr.aria-selected]': 'selected()',
    '[attr.aria-disabled]': 'disabled() || null',
    '[disabled]': 'disabled()',
    '[class.d-none]': 'filteredOut()',
    '(click)': 'onClick($event)',
  },
})
export class BsComboboxOption {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly menu = inject(BsComboboxMenu);

  /** The value the combobox takes when this option is selected. */
  readonly value = input.required<unknown>();
  /** Text shown in the combobox when selected. Defaults to the option's text. */
  readonly label = input<string | undefined>(undefined);
  /** Disables the option. */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly text = signal('');
  /** Text shown in the combobox when this option is selected. */
  readonly displayLabel = computed(() => this.label() ?? this.text());
  /** Whether the option is selected. */
  readonly selected = computed(() => this.menu.combobox()?.isSelected(this.value()) ?? false);
  /** Whether the search hides the option. */
  readonly filteredOut = computed(() => {
    const query = this.menu.query();
    return !!query && !normalize(this.searchText()).includes(query);
  });
  protected readonly showCheck = computed(
    () => this.menu.check() || !!this.menu.combobox()?.multiple(),
  );
  private readonly searchText = signal('');

  constructor() {
    inject(DestroyRef).onDestroy(this.menu.register(this));
    afterRenderEffect(() => {
      const content = this.element.querySelector('.menu-item-content > span:first-child');
      this.text.set((content ?? this.element).textContent.trim());
      this.searchText.set(this.element.textContent);
    });
  }

  /** Focuses the option. */
  focus(): void {
    this.element.focus();
  }

  protected onClick(event: MouseEvent): void {
    // Keep the menu's outside-click handler from closing a multiple combobox.
    event.stopPropagation();
    this.menu.combobox()?.select(this.value());
  }
}

/**
 * Search field inside a `bsComboboxMenu`. Filters the options by their text, ignoring
 * case and accents. Wrap it in a `.combobox-search`.
 */
@Directive({
  selector: 'input[bsComboboxSearch]',
  host: {
    class: 'form-control combobox-search-input',
    autocomplete: 'off',
    '(input)': 'menu.query.set(normalizeValue())',
    '(keydown)': 'onKeydown($event)',
  },
})
export class BsComboboxSearch {
  private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  protected readonly menu = inject(BsComboboxMenu);

  constructor() {
    // Clear the search and focus the field when the menu opens.
    let open = false;
    afterRenderEffect(() => {
      const isOpen = this.menu.menu.isOpen();
      if (isOpen && !open) {
        this.element.value = '';
        this.menu.query.set('');
        this.element.focus();
      }
      open = isOpen;
    });
  }

  protected normalizeValue(): string {
    return normalize(this.element.value.trim());
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.element
        .closest('.menu')
        ?.querySelector<HTMLElement>('.menu-item:not(.d-none):not(:disabled)')
        ?.focus();
    }
  }
}

/** Message shown in a `bsComboboxMenu` when no option matches the search. */
@Directive({
  selector: '[bsComboboxNoResults]',
  host: {
    class: 'combobox-no-results',
    role: 'status',
    '[class.d-none]': '!menu.noResults()',
  },
})
export class BsComboboxNoResults {
  protected readonly menu = inject(BsComboboxMenu);
}

/**
 * A select-like button that opens a `bsComboboxMenu` of rich options, with optional
 * search and multiple selection. Bind its value with `[formControl]`, `[(ngModel)]`,
 * `[formField]` or `[(value)]`: the selected option's `value`, or an array of values
 * with `multiple`. Set `name` to also submit the value with a native form.
 *
 * ```html
 * <button bsCombobox [menu]="countries" placeholder="Pick a country…" [formControl]="country"></button>
 * <div bsComboboxMenu #countries="bsComboboxMenu">
 *   <button bsComboboxOption value="us">United States</button>
 *   <button bsComboboxOption value="ca">Canada</button>
 * </div>
 * ```
 */
@Component({
  selector: 'button[bsCombobox]',
  exportAs: 'bsCombobox',
  hostDirectives: [{ directive: BsControl, inputs: ['id', 'validation'] }],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BsCombobox), multi: true },
  ],
  template: `
    <span class="combobox-value" [class.combobox-placeholder]="!selectedOptions().length">
      {{ text() }}
    </span>
    <svg
      class="combobox-caret"
      width="10"
      height="16"
      viewBox="0 0 10 16"
      fill="none"
      aria-hidden="true">
      <path
        d="M0.46967 5.46967C0.762563 5.17678 1.23744 5.17678 1.53033 5.46967L5 8.93934L8.46967 5.46967C8.76256 5.17678 9.23744 5.17678 9.53033 5.46967C9.82322 5.76256 9.82322 6.23744 9.53033 6.53033L5.53033 10.5303C5.23744 10.8232 4.76256 10.8232 4.46967 10.5303L0.46967 6.53033C0.176777 6.23744 0.176777 5.76256 0.46967 5.46967Z"
        fill="currentcolor" />
    </svg>
    @if (name()) {
      <input type="hidden" [name]="name()" [value]="submitValue()" />
    }
  `,
  host: {
    type: 'button',
    '[class]': 'classes()',
    'aria-haspopup': 'listbox',
    '[attr.aria-expanded]': 'isOpen()',
    '[attr.aria-controls]': 'menu().listboxId()',
    '[disabled]': 'isDisabled()',
    '(click)': 'toggle()',
    '(keydown)': 'onKeydown($event)',
    '(focusout)': 'onFocusout($event)',
  },
})
export class BsCombobox extends BsValueControl<unknown> {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly control = inject(BsControl, { self: true });

  /** The selected value, or an array of values with `multiple`. Supports `[(value)]`. */
  readonly value = model<unknown>(null);
  protected get emptyValue(): unknown {
    return this.multiple() ? [] : null;
  }

  /** The menu of options. */
  readonly menu = input.required<BsComboboxMenu>();
  /** Selects several values. Options toggle and the menu stays open. */
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Text shown while nothing is selected. */
  readonly placeholder = input('');
  /** Name of a hidden input that submits the value with a native form. */
  readonly name = input<string | null>(null);
  /** Size of the button. */
  readonly size = input<BsFormControlSize>('md');
  /** Compares option values with the selected value. */
  readonly compareWith = input<(a: unknown, b: unknown) => boolean>(Object.is);
  /** Text shown when several options are selected. */
  readonly countText = input((count: number) => `${count} selected`);

  /** Element id, used for the menu's `aria-labelledby`. */
  readonly id = computed(() => this.control.id());
  /** Whether the menu is open. */
  readonly isOpen = computed(() => this.menu().menu.isOpen());

  protected readonly selectedOptions = computed(() =>
    this.menu()
      .options()
      .filter((option) => this.isSelected(option.value())),
  );
  protected readonly text = computed(() => {
    const options = this.selectedOptions();
    if (!options.length) {
      return this.placeholder();
    }
    return options.length > 1
      ? this.countText()(options.length)
      : (options[0]?.displayLabel() ?? this.placeholder());
  });
  protected readonly submitValue = computed(() => {
    const value = this.value();
    // Option values are strings or numbers in practice; the type allows anything.
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return Array.isArray(value) ? value.join(',') : value == null ? '' : String(value);
  });
  protected readonly classes = computed(() => {
    const size = this.size();
    return size === 'md'
      ? 'form-control combobox-toggle'
      : `form-control form-control-${size} combobox-toggle`;
  });

  constructor() {
    super();
    effect((onCleanup) => {
      const menu = this.menu();
      menu.combobox.set(this);
      menu.menu.registerToggle(this.element);
      onCleanup(() => {
        menu.combobox.set(null);
        menu.menu.registerToggle(null);
      });
    });
  }

  /** Whether a value is selected. */
  isSelected(value: unknown): boolean {
    const current = this.value();
    const compare = this.compareWith();
    return Array.isArray(current) && this.multiple()
      ? current.some((item) => compare(item, value))
      : current != null && compare(current, value);
  }

  /** Selects a value. With `multiple`, toggles it. */
  select(value: unknown): void {
    if (this.multiple()) {
      const current = Array.isArray(this.value()) ? (this.value() as unknown[]) : [];
      const compare = this.compareWith();
      this.updateValue(
        this.isSelected(value)
          ? current.filter((item) => !compare(item, value))
          : [...current, value],
      );
      return;
    }
    this.updateValue(value);
    this.hide();
    this.element.focus();
  }

  /** Opens the menu and focuses the selected option, or the first one. */
  show(): void {
    this.menu().menu.show();
    this.focusSelected();
  }

  hide(): void {
    this.menu().menu.hide();
  }

  toggle(): void {
    if (this.isOpen()) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * @internal Marks the control touched when focus leaves both the toggle and the menu,
   * not when it moves between them.
   */
  onFocusout(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (
      next instanceof Node &&
      (this.element.contains(next) || this.menu().element.contains(next))
    ) {
      return;
    }
    this.markTouched();
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        this.show();
        break;
      case 'Escape':
        if (this.isOpen()) {
          event.preventDefault();
          this.hide();
        }
        break;
    }
  }

  private focusSelected(): void {
    // Wait for the menu to render, and leave focus in a search field.
    requestAnimationFrame(() => {
      const menu = this.menu();
      if (!menu.menu.isOpen() || menu.options().length === 0) {
        return;
      }
      const active = this.element.ownerDocument.activeElement;
      if (
        active instanceof HTMLInputElement &&
        active.matches('[bsComboboxSearch], .combobox-search-input')
      ) {
        return;
      }
      const option = this.selectedOptions()[0] ?? menu.options().find((o) => !o.disabled());
      option?.focus();
    });
  }
}
