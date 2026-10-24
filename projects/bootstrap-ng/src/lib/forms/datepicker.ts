import {
  ApplicationRef,
  booleanAttribute,
  Component,
  ComponentRef,
  computed,
  contentChild,
  createComponent,
  DestroyRef,
  Directive,
  DOCUMENT,
  effect,
  ElementRef,
  EnvironmentInjector,
  forwardRef,
  inject,
  input,
  LOCALE_ID,
  linkedSignal,
  model,
  numberAttribute,
  output,
  Provider,
  signal,
  untracked,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { autoPosition, BsPlacement } from '../util/floating';
import { uniqueId } from '../util/id';
import {
  BS_CALENDAR_CONFIG,
  BsCalendar,
  BsDateSelectionMode,
  BsDateValue,
  BsWeekNumbering,
  parseIsoDate,
  selectedDates,
} from './calendar';
import { BsValueControl } from './value-control';
import { configToken, provideConfig } from '../util/config';

/** How a datepicker shows dates: `Intl.DateTimeFormat` options or a function. */
export type BsDateFormat = Intl.DateTimeFormatOptions | BsDateFormatter;

/** Formats a date for a datepicker. */
export type BsDateFormatter = (date: Date, locale: string | undefined) => string;

/**
 * Defaults for the inputs of datepickers. Inputs set on a component win over them. Options
 * left out here fall back to the calendar defaults set with `provideBsCalendarConfig()`,
 * which also set the labels of the calendar that datepickers open.
 */
export interface BsDatepickerConfig {
  /** First day of the week: 0 for Sunday, 1 for Monday. */
  firstWeekday: number;
  /** Number of months shown side by side. */
  monthsCount: number;
  /** Shows the week numbers before each week. */
  weekNumbers: boolean;
  /** How weeks are numbered: ISO 8601 or from 1 January. */
  weekNumbering: BsWeekNumbering;
  /** Locale for dates and month and day names, such as `en-US`, instead of `LOCALE_ID`. */
  locale: string;
  /** How selected dates are shown. Defaults to the locale's short date. */
  dateFormat: BsDateFormat | null;
  /** Where the calendar opens. */
  placement: BsPlacement;
  /** Accessible name of the calendar popup. */
  calendarLabel: string;
}

/** The defaults set with `provideBsDatepickerConfig()`. */
export const BS_DATEPICKER_CONFIG = configToken<BsDatepickerConfig>('BS_DATEPICKER_CONFIG');

/**
 * Sets defaults for the inputs of datepickers, for the whole app in `bootstrapApplication()`,
 * or for part of it in a component's `providers`.
 *
 * ```ts
 * providers: [provideBsDatepickerConfig({ dateFormat: { dateStyle: 'medium' } })]
 * ```
 */
export function provideBsDatepickerConfig(config: Partial<BsDatepickerConfig>): Provider {
  return provideConfig(BS_DATEPICKER_CONFIG, config);
}

/**
 * Opens a `bsCalendar` popup from an input or a button, like Bootstrap’s datepicker.
 * The value is an ISO date (`YYYY-MM-DD`), or an array of them in `multiple` and
 * `range` modes: bind it with `[formControl]`, `[(ngModel)]`, `[formField]` or
 * `[(value)]`.
 *
 * On an input, the calendar opens on focus and click; Arrow Down moves focus into it,
 * and dates can also be typed as `YYYY-MM-DD`. On macOS and iPadOS the input gets
 * `inputmode="numeric"` (unless it has its own) for an on-screen keyboard with the keys
 * a date needs. On a button, a click opens the calendar and focuses it. Escape, a click
 * outside or moving focus away closes it.
 *
 * ```html
 * <input type="text" bsFormControl bsDatepicker autocomplete="off" [formControl]="date" />
 * ```
 */
@Directive({
  selector: 'input[bsDatepicker], button[bsDatepicker]',
  exportAs: 'bsDatepicker',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BsDatepicker), multi: true },
  ],
  host: {
    // An input with a popup calendar is a combobox (the APG date picker combobox).
    '[attr.role]': 'isInput ? "combobox" : null',
    'aria-haspopup': 'dialog',
    '[attr.aria-expanded]': 'isOpen()',
    '[attr.aria-controls]': 'isOpen() ? calendarId : null',
    '[disabled]': 'isDisabled()',
    '(focus)': 'onFocus()',
    '(click)': 'onClick()',
    '(keydown)': 'onKeydown($event)',
    '(change)': 'onTextChange()',
    '(focusout)': 'onFocusout($event)',
  },
})
export class BsDatepicker extends BsValueControl<BsDateValue> {
  private readonly config = { ...inject(BS_CALENDAR_CONFIG), ...inject(BS_DATEPICKER_CONFIG) };
  private readonly localeId = inject(LOCALE_ID);
  private readonly element =
    inject<ElementRef<HTMLInputElement | HTMLButtonElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);

  /** The selected date or dates. Supports two-way binding with `[(value)]`. */
  readonly value = model<BsDateValue>(null);
  protected get emptyValue(): BsDateValue {
    return this.selectionMode() === 'single' ? null : [];
  }

  /** How dates are selected. */
  readonly selectionMode = input<BsDateSelectionMode>('single');
  /** Earliest selectable date, as `YYYY-MM-DD`. */
  readonly min = input<string | null>(null);
  /** Latest selectable date, as `YYYY-MM-DD`. */
  readonly max = input<string | null>(null);
  /** Returns true for dates that can't be selected, such as weekends. */
  readonly dateDisabled = input<((iso: string) => boolean) | null>(null);
  /** First day of the week: 0 for Sunday, 1 for Monday. */
  readonly firstWeekday = input(this.config.firstWeekday ?? 1, { transform: numberAttribute });
  /** Number of months shown side by side. */
  readonly monthsCount = input(this.config.monthsCount ?? 1, { transform: numberAttribute });
  /** Shows the week numbers before each week. */
  readonly weekNumbers = input(this.config.weekNumbers ?? false, { transform: booleanAttribute });
  /** How weeks are numbered: ISO 8601 or from 1 January. */
  readonly weekNumbering = input<BsWeekNumbering>(this.config.weekNumbering ?? 'iso');
  /**
   * Locale for dates and month and day names, such as `en-US`. Defaults to Angular's
   * `LOCALE_ID`; `undefined` uses the browser's language.
   */
  readonly locale = input<string | undefined>(this.config.locale ?? this.localeId);
  /** How selected dates are shown. Defaults to the locale's short date. */
  readonly dateFormat = input<BsDateFormat | null>(this.config.dateFormat ?? null);
  /** Forces a color mode for the calendar: `light` or `dark`. */
  readonly colorMode = input<'light' | 'dark' | null>(null);
  /** Where the calendar opens. */
  readonly placement = input<BsPlacement>(this.config.placement ?? 'bottom-start');
  /** Accessible name of the calendar popup. */
  readonly calendarLabel = input(this.config.calendarLabel ?? 'Choose date');

  /** Opens the calendar. */
  // eslint-disable-next-line @angular-eslint/no-input-rename -- `open` state pattern, see AGENTS.md
  readonly openInput = input(false, { alias: 'open', transform: booleanAttribute });
  /** Emits when the calendar opens or closes. */
  readonly openChange = output<boolean>();
  private readonly openState = linkedSignal(() => this.openInput());
  /** Whether the calendar is open. */
  readonly isOpen = this.openState.asReadonly();

  /** The selected dates as text, or an empty string. */
  readonly display = computed(() => {
    const dates = selectedDates(this.value()).map((iso) => this.format(iso));
    return dates.join(this.selectionMode() === 'range' ? ' – ' : ', ');
  });

  protected readonly isInput = this.element instanceof HTMLInputElement;
  /** @internal */
  readonly calendarId = uniqueId('bs-datepicker');
  private readonly displayElement = contentChild(forwardRef(() => BsDatepickerDisplay));
  private readonly calendarRef = signal<ComponentRef<BsCalendar> | null>(null);
  private focusOnOpen = false;
  private returningFocus = false;
  private cleanups: (() => void)[] = [];
  private originalContent: Node[] | null = null;

  constructor() {
    super();
    // iPadOS reports a macOS user agent, and its numeric keyboard has every key a typed
    // date needs. iPhones report their own user agent and keep the default keyboard,
    // because their numeric keypad has no `-`.
    const userAgent = this.document.defaultView?.navigator.userAgent ?? '';
    if (
      this.isInput &&
      !this.element.hasAttribute('inputmode') &&
      userAgent.includes('Macintosh')
    ) {
      this.element.setAttribute('inputmode', 'numeric');
    }

    effect(() => {
      // Inputs show the dates as their value; buttons without a `bsDatepickerDisplay`
      // show them as their text.
      const display = this.display();
      if (this.element instanceof HTMLInputElement) {
        this.element.value = display;
      } else if (!this.displayElement()) {
        if (display) {
          // Keep the original content, to show it again when the value is cleared.
          this.originalContent ??= [...this.element.childNodes];
          this.element.textContent = display;
        } else if (this.originalContent) {
          this.element.replaceChildren(...this.originalContent);
          this.originalContent = null;
        }
      }
    });

    effect(() => {
      if (this.isOpen()) {
        untracked(() => this.createCalendar());
      } else {
        this.destroyCalendar();
      }
    });

    effect(() => {
      const calendar = this.calendarRef();
      const inputs = this.calendarInputs();
      if (calendar) {
        for (const [name, value] of Object.entries(inputs)) {
          calendar.setInput(name, value);
        }
      }
    });

    effect(() => {
      const host = this.calendarRef()?.location.nativeElement as HTMLElement | undefined;
      host?.setAttribute('aria-label', this.calendarLabel());
    });

    inject(DestroyRef).onDestroy(() => this.destroyCalendar());
  }

  /** Opens the calendar. */
  show(): void {
    if (!this.isOpen() && !this.isDisabled()) {
      this.openState.set(true);
      this.openChange.emit(true);
    }
  }

  /** Closes the calendar. */
  hide(): void {
    if (this.isOpen()) {
      this.openState.set(false);
      this.openChange.emit(false);
      this.markTouched();
    }
  }

  /** Opens or closes the calendar. */
  toggle(): void {
    if (this.isOpen()) {
      this.hide();
    } else {
      this.show();
    }
  }

  /** Opens the calendar and moves focus into it. */
  focusCalendar(): void {
    const calendar = this.calendarRef();
    if (calendar) {
      calendar.instance.focus();
    } else {
      // The calendar is created by an effect, so focus it once it is.
      this.focusOnOpen = true;
      this.show();
    }
  }

  protected onFocus(): void {
    if (this.element instanceof HTMLInputElement && !this.returningFocus) {
      this.show();
    }
  }

  protected onClick(): void {
    if (this.element instanceof HTMLInputElement) {
      this.show();
    } else if (this.isOpen()) {
      this.hide();
    } else {
      this.focusCalendar();
    }
  }

  protected onKeydown(event: Event): void {
    if (!(event instanceof KeyboardEvent)) {
      return;
    }
    if (event.key === 'ArrowDown' && this.element instanceof HTMLInputElement) {
      event.preventDefault();
      this.focusCalendar();
    } else if (event.key === 'Escape' && this.isOpen()) {
      event.preventDefault();
      this.hide();
    }
  }

  protected onTextChange(): void {
    if (!(this.element instanceof HTMLInputElement)) {
      return;
    }
    const text = this.element.value.trim();
    if (text === this.display()) {
      return;
    }
    const parts = text ? text.split(/\s*(?:,|–|—|\s-\s|\bto\b)\s*/) : [];
    const valid = parts.every((part) => parseIsoDate(part) && !this.isDateDisabled(part.trim()));
    const mode = this.selectionMode();
    const count = mode === 'single' ? 1 : mode === 'range' ? 2 : Infinity;
    if (!valid || parts.length > count) {
      // Put the current value back.
      this.element.value = this.display();
      return;
    }
    const dates = parts.map((part) => part.trim());
    this.updateValue(mode === 'single' ? (dates[0] ?? null) : [...dates].sort());
  }

  protected onFocusout(event: Event): void {
    const next = (event as FocusEvent).relatedTarget as Node | null;
    if (next && !this.contains(next)) {
      this.hide();
    }
  }

  /** Whether a date can't be selected because of `min`, `max` or `dateDisabled`. */
  private isDateDisabled(iso: string): boolean {
    const min = this.min();
    const max = this.max();
    return (!!min && iso < min) || (!!max && iso > max) || !!this.dateDisabled()?.(iso);
  }

  private calendarInputs(): Record<string, unknown> {
    return {
      value: this.value(),
      selectionMode: this.selectionMode(),
      min: this.min(),
      max: this.max(),
      dateDisabled: this.dateDisabled(),
      firstWeekday: this.firstWeekday(),
      monthsCount: this.monthsCount(),
      weekNumbers: this.weekNumbers(),
      weekNumbering: this.weekNumbering(),
      locale: this.locale(),
      colorMode: this.colorMode(),
      disabled: this.isDisabled(),
    };
  }

  private format(iso: string): string {
    const date = parseIsoDate(iso);
    if (!date) {
      return iso;
    }
    const format = this.dateFormat();
    const locale = this.locale();
    if (typeof format === 'function') {
      return format(date, locale);
    }
    if (this.element instanceof HTMLInputElement && !format) {
      // Inputs show ISO dates, so what they show can also be typed.
      return iso;
    }
    return new Intl.DateTimeFormat(locale, format ?? { dateStyle: 'medium' }).format(date);
  }

  private contains(node: Node): boolean {
    return (
      this.element.contains(node) ||
      !!(this.calendarRef()?.location.nativeElement as HTMLElement | undefined)?.contains(node)
    );
  }

  private get reference(): HTMLElement {
    return this.element.closest<HTMLElement>('.form-adorn') ?? this.element;
  }

  private createCalendar(): void {
    if (this.calendarRef()) {
      return;
    }
    const host = this.document.createElement('div');
    host.id = this.calendarId;
    host.setAttribute('role', 'dialog');
    host.setAttribute('aria-label', this.calendarLabel());
    host.setAttribute('data-vc-input', '');
    host.setAttribute('data-vc-position', 'bottom');
    // Next to the input (or its form adorn), so it follows it in the tab order and
    // inherits its color mode, but outside any label.
    const reference = this.reference;
    (reference.closest('label') ?? reference).after(host);

    const calendar = createComponent(BsCalendar, {
      environmentInjector: this.environmentInjector,
      hostElement: host,
    });
    for (const [name, value] of Object.entries(this.calendarInputs())) {
      calendar.setInput(name, value);
    }
    this.appRef.attachView(calendar.hostView);
    this.calendarRef.set(calendar);
    if (this.focusOnOpen) {
      this.focusOnOpen = false;
      calendar.instance.focus();
    }

    const valueSub = calendar.instance.value.subscribe((value) => this.updateValue(value));
    const completeSub = calendar.instance.selectionComplete.subscribe(() => {
      this.hide();
      this.returnFocus();
    });
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.hide();
        this.returnFocus();
      }
    };
    const onFocusout = (event: FocusEvent) => this.onFocusout(event);
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!this.contains(target) && !this.reference.contains(target)) {
        this.hide();
      }
    };
    host.addEventListener('keydown', onKeydown);
    host.addEventListener('focusout', onFocusout);
    this.document.addEventListener('click', onDocumentClick, true);

    this.cleanups = [
      () => valueSub.unsubscribe(),
      () => completeSub.unsubscribe(),
      () => this.document.removeEventListener('click', onDocumentClick, true),
      autoPosition(reference, host, () => ({ placement: this.placement(), offset: 4 })),
    ];
  }

  private destroyCalendar(): void {
    const calendar = untracked(this.calendarRef);
    if (!calendar) {
      return;
    }
    const calendarElement = calendar.location.nativeElement as HTMLElement;
    const focusInside = calendarElement.contains(this.document.activeElement);
    this.cleanups.forEach((cleanup) => cleanup());
    this.cleanups = [];
    this.appRef.detachView(calendar.hostView);
    calendar.destroy();
    calendarElement.remove();
    this.calendarRef.set(null);
    if (focusInside) {
      this.returnFocus();
    }
  }

  /** Focuses the trigger without reopening the calendar. */
  private returnFocus(): void {
    this.returningFocus = true;
    this.element.focus({ preventScroll: true });
    this.returningFocus = false;
  }
}

/**
 * The text of a `bsDatepicker` button, which shows the selected dates. Its content is
 * shown while no date is selected, so icons next to it stay in place.
 *
 * ```html
 * <button type="button" bsButton="outline" theme="secondary" bsDatepicker>
 *   <svg …></svg>
 *   <span bsDatepickerDisplay>Select date</span>
 * </button>
 * ```
 */
@Component({
  selector: '[bsDatepickerDisplay]',
  template: `
    @if (datepicker.display(); as text) {
      {{ text }}
    } @else {
      <ng-content />
    }
  `,
})
export class BsDatepickerDisplay {
  protected readonly datepicker = inject(BsDatepicker);
}
