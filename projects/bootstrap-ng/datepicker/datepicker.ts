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
import {
  AbstractControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { autoPosition, BsPlacement, configToken, provideConfig, uniqueId } from 'bootstrap-ng/util';
import {
  BS_CALENDAR_CONFIG,
  BsCalendar,
  BsDateSelectionMode,
  BsDateValue,
  BsWeekNumbering,
  parseIsoDate,
  selectedDates,
} from 'bootstrap-ng/calendar';
import { BsFormControlSize, BsValueControl } from 'bootstrap-ng/forms';
import { parseFormattedDate } from './date-parser';

/** How a datepicker shows dates: `Intl.DateTimeFormat` options or a function. */
export type BsDateFormat = Intl.DateTimeFormatOptions | BsDateFormatter;

/** Formats a date for a datepicker. */
export type BsDateFormatter = (date: Date, locale: string | undefined) => string;

/**
 * Reads one typed date for a datepicker: returns it as `YYYY-MM-DD`, or null for text
 * that isn't a date it can read.
 */
export type BsDateParser = (text: string, locale: string | undefined) => string | null;

/**
 * Why the text typed in a datepicker wasn't accepted: it isn't a date (`parse`), a date is
 * before `min` or after `max` (`out-of-range`) or turned off by `dateDisabled` (`disabled`),
 * or it has the wrong number of dates for the selection mode (`count`).
 */
export type BsDateTextError = 'parse' | 'out-of-range' | 'disabled' | 'count';

/** Typed text that a datepicker didn't accept, and why. */
export interface BsDateTextInvalid {
  text: string;
  reason: BsDateTextError;
}

/** What a datepicker does with typed text it doesn't accept. */
export type BsDateInvalidBehavior = 'revert' | 'keep';

/** The formats that `wareki` datepickers also read, such as 令和8年11月27日 and 令和8/11/27. */
const WAREKI_FORMATS: Intl.DateTimeFormatOptions[] = (['long', 'numeric'] as const).map(
  (month) => ({ calendar: 'japanese', era: 'long', year: 'numeric', month, day: 'numeric' }),
);

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
  /** Shows years in the calendar as Japanese era years (Wareki), such as 令和8年（2026）. */
  wareki: boolean;
  /** Locale for dates and month and day names, such as `en-US`, instead of `LOCALE_ID`. */
  locale: string;
  /** How selected dates are shown. Defaults to the locale's short date. */
  dateFormat: BsDateFormat | null;
  /** Reads typed dates, before the built-in parsing. */
  dateParser: BsDateParser | null;
  /** What happens to typed text that isn't accepted: put back or kept to fix. */
  invalidBehavior: BsDateInvalidBehavior;
  /** Where the calendar opens. */
  placement: BsPlacement;
  /** Accessible name of the calendar popup. */
  calendarLabel: string;
  /** Size of an input datepicker. */
  size: BsFormControlSize;
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
 * and dates can also be typed as `YYYY-MM-DD`, in the numeric or month-name format set
 * with `dateFormat` options, or in any format a `dateParser` reads. On macOS and iPadOS the input gets
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
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => BsDatepicker), multi: true },
  ],
  host: {
    // An input with a popup calendar is a combobox (the APG date picker combobox).
    '[attr.role]': 'isInput ? "combobox" : null',
    'aria-haspopup': 'dialog',
    '[attr.aria-expanded]': 'isOpen()',
    '[attr.aria-controls]': 'isOpen() ? calendarId : null',
    '[disabled]': 'isDisabled()',
    '[class.form-control-sm]': 'isInput && size() === "sm"',
    '[class.form-control-lg]': 'isInput && size() === "lg"',
    '(focus)': 'onFocus()',
    '(click)': 'onClick()',
    '(keydown)': 'onKeydown($event)',
    '(change)': 'onTextChange()',
    '(focusout)': 'onFocusout($event)',
  },
})
export class BsDatepicker extends BsValueControl<BsDateValue> implements Validator {
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
   * Shows years in the calendar as Japanese era years (Wareki), such as 令和8年（2026）.
   * Use with a Japanese `locale`. To show the selected date with its era too, set
   * `dateFormat` to options with `calendar: 'japanese'`.
   */
  readonly wareki = input(this.config.wareki ?? false, { transform: booleanAttribute });
  /**
   * Locale for dates and month and day names, such as `en-US`. Defaults to Angular's
   * `LOCALE_ID`; `undefined` uses the browser's language.
   */
  readonly locale = input<string | undefined>(this.config.locale ?? this.localeId);
  /** How selected dates are shown. Defaults to the locale's short date. */
  readonly dateFormat = input<BsDateFormat | null>(this.config.dateFormat ?? null);
  /**
   * Reads typed dates, such as ones in the format a `dateFormat` function shows. Dates it
   * returns null for are read in the `dateFormat` options' format, as wareki dates with
   * `wareki`, or as `YYYY-MM-DD`. Each date of a range or multiple selection is read on its
   * own, and still checked against `min`, `max` and `dateDisabled`.
   */
  readonly dateParser = input<BsDateParser | null>(this.config.dateParser ?? null);
  /**
   * What happens to typed text that isn't accepted. `revert` puts the selected dates back;
   * `keep` leaves the text to fix, clears the value and sets `textError`, which forms see as
   * a `bsDate` validation error.
   */
  readonly invalidBehavior = input<BsDateInvalidBehavior>(this.config.invalidBehavior ?? 'revert');
  /** Emits typed text that isn't accepted, and why. */
  readonly textInvalid = output<BsDateTextInvalid>();
  private readonly textErrorState = signal<BsDateTextError | null>(null);
  /**
   * Why the typed text kept in the input (with `invalidBehavior="keep"`) isn't accepted, or
   * null while it is. Cleared by accepted text, a picked date or a new value.
   */
  readonly textError = this.textErrorState.asReadonly();
  /** Forces a color mode for the calendar: `light` or `dark`. */
  readonly colorMode = input<'light' | 'dark' | null>(null);
  /** Where the calendar opens. */
  readonly placement = input<BsPlacement>(this.config.placement ?? 'bottom-start');
  /** Accessible name of the calendar popup. */
  readonly calendarLabel = input(this.config.calendarLabel ?? 'Choose date');
  /**
   * Size of an input datepicker: adds `.form-control-sm` or `.form-control-lg`. Buttons
   * ignore it; size them with `bsButton`'s own `size`.
   */
  readonly size = input<BsFormControlSize>(this.config.size ?? 'md');

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
  private invalidTextValue: BsDateValue | undefined;
  private onValidatorChange: () => void = () => undefined;

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
      const textError = this.textError();
      if (this.element instanceof HTMLInputElement) {
        // Text that isn't accepted stays, to be fixed, with `invalidBehavior="keep"`.
        if (!textError) {
          this.element.value = display;
        }
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
      // A new value replaces text that wasn't accepted.
      const value = this.value();
      if (value !== this.invalidTextValue) {
        untracked(() => this.setTextError(null));
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

  override writeValue(value: BsDateValue | null | undefined): void {
    this.setTextError(null);
    super.writeValue(value);
  }

  /** @internal Reports text kept with `invalidBehavior="keep"` as a `bsDate` error. */
  validate(_control: AbstractControl): ValidationErrors | null {
    const reason = this.textError();
    return reason ? { bsDate: { reason } } : null;
  }

  /** @internal */
  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
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
    if (text === this.display() && !this.textError()) {
      return;
    }
    const dates = this.readText(text);
    if (typeof dates === 'string') {
      this.textInvalid.emit({ text, reason: dates });
      if (this.invalidBehavior() === 'keep') {
        this.setTextError(dates);
        this.invalidTextValue = this.emptyValue;
        this.updateValue(this.invalidTextValue);
      } else {
        // Put the current value back.
        this.element.value = this.display();
      }
      return;
    }
    this.setTextError(null);
    const mode = this.selectionMode();
    const value: BsDateValue =
      mode === 'single'
        ? (dates[0] ?? null)
        : mode === 'multiple'
          ? [...new Set(dates)].sort()
          : [...dates].sort();
    this.updateValue(value);
    // Show the formatted dates, even when they match the current value and the
    // display effect doesn't run again.
    this.element.value = this.display();
  }

  /** Reads typed text as ISO dates, or returns why it can't. */
  private readText(text: string): string[] | BsDateTextError {
    if (!text) {
      return [];
    }
    const mode = this.selectionMode();
    const count = mode === 'single' ? 1 : mode === 'range' ? 2 : Infinity;
    const whole = this.readDate(text);
    const dates = whole ? [whole] : [];
    if (!whole) {
      dates.push(...this.readIsoHyphenRange(text, mode));
      if (!dates.length) {
        // Keep the separators, to join back dates that contain them, such as "Nov 27, 2026".
        const tokens = text.split(/(\s*(?:,|–|—|\s-\s|\bto\b)\s*)/);
        for (let start = 0; start < tokens.length;) {
          // The longest run of tokens from `start` that is a date. Even tokens are text.
          let end = tokens.length - 1;
          let date = this.readDate(tokens.slice(start).join(''));
          while (!date && end > start) {
            end -= 2;
            date = this.readDate(tokens.slice(start, end + 1).join(''));
          }
          if (!date) {
            return 'parse';
          }
          dates.push(date);
          start = end + 2;
        }
      }
    }
    // A range needs both dates. Its start alone would be a half range in the form.
    if (dates.length > count || (mode === 'range' && dates.length === 1)) {
      return 'count';
    }
    const min = this.min();
    const max = this.max();
    if (dates.some((iso) => (!!min && iso < min) || (!!max && iso > max))) {
      return 'out-of-range';
    }
    const dateDisabled = this.dateDisabled();
    return dateDisabled && dates.some((iso) => dateDisabled(iso)) ? 'disabled' : dates;
  }

  /** Reads a range typed as `YYYY-MM-DD-YYYY-MM-DD`. */
  private readIsoHyphenRange(text: string, mode: BsDateSelectionMode): string[] {
    if (mode !== 'range') {
      return [];
    }
    const rangeMatch = /^(\d{4}-\d{2}-\d{2})-(\d{4}-\d{2}-\d{2})$/.exec(text.trim());
    const rawStart = rangeMatch?.[1];
    const rawEnd = rangeMatch?.[2];
    if (!rawStart || !rawEnd) {
      return [];
    }
    const start = this.readDate(rawStart);
    const end = this.readDate(rawEnd);
    return start && end ? [start, end] : [];
  }

  /** Reads one typed date with `dateParser`, the `dateFormat` options, wareki or as ISO. */
  private readDate(text: string): string | null {
    const part = text.trim();
    if (!part) {
      return null;
    }
    const locale = this.locale();
    const parsed = this.dateParser()?.(part, locale)?.trim();
    if (parsed && parseIsoDate(parsed)) {
      return parsed;
    }
    const format = this.dateFormat();
    return (
      (format && typeof format === 'object' ? parseFormattedDate(part, locale, format) : null) ??
      (this.wareki() ? this.readWareki(part, locale) : null) ??
      (parseIsoDate(part) ? part : null)
    );
  }

  private readWareki(text: string, locale: string | undefined): string | null {
    for (const format of WAREKI_FORMATS) {
      const iso = parseFormattedDate(text, locale, format);
      if (iso) {
        return iso;
      }
    }
    return null;
  }

  private setTextError(error: BsDateTextError | null): void {
    if (untracked(this.textErrorState) !== error) {
      this.textErrorState.set(error);
      this.invalidTextValue = undefined;
      this.onValidatorChange();
    }
  }

  protected onFocusout(event: Event): void {
    const next = (event as FocusEvent).relatedTarget as Node | null;
    if (next && !this.contains(next)) {
      this.hide();
    }
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
      wareki: this.wareki(),
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

    const valueSub = calendar.instance.value.subscribe((value) => {
      // A range's start date stays in the calendar until its end date is picked, so the
      // form never gets a half range, and dismissing the popup keeps the previous range.
      if (this.selectionMode() !== 'range' || selectedDates(value).length !== 1) {
        this.setTextError(null);
        this.updateValue(value);
      }
    });
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
      () => host.removeEventListener('keydown', onKeydown),
      () => host.removeEventListener('focusout', onFocusout),
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
