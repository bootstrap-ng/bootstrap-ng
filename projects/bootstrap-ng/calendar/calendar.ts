import {
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  input,
  linkedSignal,
  LOCALE_ID,
  model,
  numberAttribute,
  output,
  Provider,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { configToken, provideConfig, uniqueId } from 'bootstrap-ng/util';
import { BsValueControl } from 'bootstrap-ng/forms';

/** How a calendar selects dates. `range` selects a start and an end date. */
export type BsDateSelectionMode = 'single' | 'multiple' | 'range';

/**
 * A calendar value: an ISO date (`YYYY-MM-DD`) or `null` in `single` mode, and an array
 * of ISO dates in `multiple` and `range` modes.
 */
export type BsDateValue = string | string[] | null;

/**
 * How weeks are numbered. `iso` follows ISO 8601: week 1 holds the year's first Thursday.
 * `simple` makes week 1 the week holding 1 January, with weeks starting on `firstWeekday`
 * (the US convention when weeks start on Sunday).
 */
export type BsWeekNumbering = 'iso' | 'simple';

interface CalendarDay {
  iso: string;
  day: number;
  /** `prev` or `next` for days of the neighboring months. */
  month: 'prev' | 'next' | null;
}

interface CalendarWeek {
  number: number;
  days: (CalendarDay | null)[];
}

interface CalendarMonth {
  id: string;
  year: number;
  month: number;
  weeks: CalendarWeek[];
}

const pad = (value: number) => String(value).padStart(2, '0');

/** Returns the ISO date of a local date, normalizing overflowing months and days. */
export function toIsoDate(year: number, month: number, day: number): string {
  const date = new Date(year, month, day);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parses an ISO date (`YYYY-MM-DD`) as a local date. Returns null when invalid. */
export function parseIsoDate(value: string | null | undefined): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value?.trim() ?? '');
  if (!match) {
    return null;
  }
  const [year, month, day] = [Number(match[1]), Number(match[2]) - 1, Number(match[3])];
  const date = new Date(year, month, day);
  return date.getMonth() === month && date.getDate() === day ? date : null;
}

/** Parses a date the component produced itself, so it is always valid. */
const requireDate = (iso: string): Date => {
  const date = parseIsoDate(iso);
  if (!date) {
    throw new Error(`Invalid ISO date: ${iso}`);
  }
  return date;
};

const addDays = (iso: string, days: number) => {
  const date = requireDate(iso);
  return toIsoDate(date.getFullYear(), date.getMonth(), date.getDate() + days);
};

const monthStart = (iso: string) => {
  const date = requireDate(iso);
  return toIsoDate(date.getFullYear(), date.getMonth(), 1);
};

const addMonths = (iso: string, months: number) => {
  const date = requireDate(iso);
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return toIsoDate(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay));
};

const DAY = 24 * 60 * 60 * 1000;

/** Days from 1 January of `year` to a date, counted in UTC to ignore daylight saving. */
const dayOfYear = (date: Date, year = date.getFullYear()) =>
  Math.round(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(year, 0, 1)) / DAY,
  );

/**
 * Returns the number of the week that starts on `weekStart`, a date that falls on
 * `firstWeekday` (0 for Sunday). With `iso` numbering a week that doesn't start on Monday
 * takes the number of its Thursday's ISO week, which holds most of its days.
 */
export function weekNumber(
  weekStart: Date,
  firstWeekday = 1,
  numbering: BsWeekNumbering = 'iso',
): number {
  const [year, month, day] = [weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate()];
  if (numbering === 'iso') {
    const thursday = new Date(year, month, day + ((4 - firstWeekday + 7) % 7));
    return Math.floor(dayOfYear(thursday) / 7) + 1;
  }
  // The week holding 1 January of the year the week ends in is week 1.
  const end = new Date(year, month, day + 6);
  const firstWeek = -((new Date(end.getFullYear(), 0, 1).getDay() - firstWeekday + 7) % 7);
  return Math.floor((dayOfYear(weekStart, end.getFullYear()) - firstWeek) / 7) + 1;
}

/** Dates of a value, as an array. */
export function selectedDates(value: BsDateValue): string[] {
  return (Array.isArray(value) ? value : value ? [value] : []).filter((iso) => parseIsoDate(iso));
}

/** Defaults for the inputs of calendars. Inputs set on a component win over them. */
export interface BsCalendarConfig {
  /** First day of the week: 0 for Sunday, 1 for Monday. */
  firstWeekday: number;
  /** Number of months shown side by side. */
  monthsCount: number;
  /** Locale for month and day names, such as `en-US`, instead of `LOCALE_ID`. */
  locale: string;
  /** Accessible name of the previous month button. */
  prevLabel: string;
  /** Accessible name of the next month button. */
  nextLabel: string;
  /** Hides the neighboring months' days. */
  hideOutsideDays: boolean;
  /** Shows the week numbers before each week. */
  weekNumbers: boolean;
  /** How weeks are numbered: ISO 8601 or from 1 January. */
  weekNumbering: BsWeekNumbering;
  /** Accessible name of the week numbers column. */
  weekLabel: string;
}

/** The defaults set with `provideBsCalendarConfig()`. */
export const BS_CALENDAR_CONFIG = configToken<BsCalendarConfig>('BS_CALENDAR_CONFIG');

/**
 * Sets defaults for the inputs of calendars, for the whole app in `bootstrapApplication()`,
 * or for part of it in a component's `providers`.
 *
 * ```ts
 * providers: [provideBsCalendarConfig({ firstWeekday: 0, weekNumbers: true })]
 * ```
 */
export function provideBsCalendarConfig(config: Partial<BsCalendarConfig>): Provider {
  return provideConfig(BS_CALENDAR_CONFIG, config);
}

/**
 * A calendar for picking dates, shown inline. It renders the markup that Bootstrap’s
 * datepicker styles (Bootstrap wraps Vanilla Calendar Pro; bootstrap-ng renders the
 * calendar in Angular). Bind it with `[formControl]`, `[(ngModel)]`, `[formField]` or
 * `[(value)]`. For a popup, use `bsDatepicker` on an input or button.
 *
 * The dates form an ARIA grid: arrow keys move by day and week, Home and End to the
 * start and end of the week, Page Up and Page Down by month (with Shift, by year).
 *
 * ```html
 * <div bsCalendar selectionMode="range" [monthsCount]="2" [(value)]="stay"></div>
 * ```
 */
@Component({
  selector: '[bsCalendar]',
  exportAs: 'bsCalendar',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BsCalendar), multi: true },
  ],
  template: `
    <div data-vc="controls">
      <button
        type="button"
        data-vc-arrow="prev"
        [attr.aria-label]="prevLabel()"
        (click)="moveView(-1)"></button>
      <button
        type="button"
        data-vc-arrow="next"
        [attr.aria-label]="nextLabel()"
        (click)="moveView(1)"></button>
    </div>
    <div data-vc="grid">
      @for (month of months(); track month.id) {
        <div data-vc="column">
          <div data-vc="header">
            <div data-vc-header="content" aria-live="polite" [id]="month.id">
              <span data-vc="month">{{ monthName(month) }}</span>
              <span data-vc="year">{{ month.year }}</span>
            </div>
          </div>
          <div
            data-vc="content"
            role="grid"
            [attr.aria-labelledby]="month.id"
            [attr.aria-multiselectable]="selectionMode() === 'single' ? null : true">
            <div data-vc="week" role="row" [style.grid-template-columns]="gridColumns()">
              @if (weekNumbers()) {
                <abbr
                  data-vc-week-numbers="title"
                  class="text-decoration-none d-flex align-items-center justify-content-center fs-xs fw-semibold fg-3"
                  role="columnheader"
                  [attr.aria-label]="weekLabel()"
                  >#</abbr
                >
              }
              @for (day of weekDays(); track day.short) {
                <abbr
                  data-vc-week-day
                  class="text-decoration-none"
                  role="columnheader"
                  [attr.aria-label]="day.long"
                  >{{ day.short }}</abbr
                >
              }
            </div>
            <div data-vc="dates" role="rowgroup">
              @for (week of month.weeks; track $index) {
                <div data-vc-dates="row" role="row" [style.grid-template-columns]="gridColumns()">
                  @if (weekNumbers()) {
                    <div
                      data-vc-week-number
                      role="rowheader"
                      class="d-flex align-items-center justify-content-center fs-xs fw-semibold fg-3">
                      {{ week.number }}
                    </div>
                  }
                  @for (day of week.days; track $index) {
                    @if (day) {
                      <div
                        role="gridcell"
                        [attr.data-vc-date]="day.iso"
                        [attr.data-vc-date-month]="day.month"
                        [attr.data-vc-date-today]="day.iso === today ? '' : null"
                        [attr.data-vc-date-disabled]="
                          isDisabled() || isDateDisabled(day.iso) ? '' : null
                        "
                        [attr.data-vc-date-selected]="selectedState(day.iso)"
                        [attr.data-vc-date-hover]="hoverState(day.iso)"
                        [attr.aria-selected]="selectedState(day.iso) !== null">
                        <button
                          type="button"
                          data-vc-date-btn
                          [attr.data-iso]="day.iso"
                          [tabIndex]="day.iso === tabStop() && !day.month ? 0 : -1"
                          [attr.aria-label]="dateLabel(day.iso)"
                          [attr.aria-current]="day.iso === today ? 'date' : null"
                          [attr.aria-disabled]="isDisabled() || isDateDisabled(day.iso) || null"
                          (click)="pick(day.iso)"
                          (keydown)="onKeydown($event, day.iso)"
                          (mouseenter)="hovered.set(day.iso)"
                          (mouseleave)="hovered.set(null)"
                          (focus)="focused.set(day.iso)">
                          {{ day.day }}
                        </button>
                      </div>
                    } @else {
                      <div data-vc-date role="gridcell"></div>
                    }
                  }
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  host: {
    'data-vc': 'calendar',
    '[attr.data-bs-theme]': 'colorMode()',
    // Bootstrap's datepicker CSS sets `color-scheme: light dark`, which follows the OS
    // color mode instead of the page's `data-bs-theme`; inherit the page's instead.
    '[style.color-scheme]': 'colorMode() ? null : "inherit"',
    '(focusout)': 'onFocusout($event)',
  },
})
export class BsCalendar extends BsValueControl<BsDateValue> {
  private readonly config = inject(BS_CALENDAR_CONFIG);
  private readonly localeId = inject(LOCALE_ID);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

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
  /**
   * Locale for month and day names, such as `en-US`. Defaults to Angular's `LOCALE_ID`;
   * `undefined` uses the browser's language.
   */
  readonly locale = input<string | undefined>(this.config.locale ?? this.localeId);
  /** Forces a color mode for the calendar: `light` or `dark`. */
  readonly colorMode = input<'light' | 'dark' | null>(null);
  /** Accessible name of the previous month button. */
  readonly prevLabel = input(this.config.prevLabel ?? 'Previous month');
  /** Accessible name of the next month button. */
  readonly nextLabel = input(this.config.nextLabel ?? 'Next month');
  /** Hides the neighboring months' days. */
  readonly hideOutsideDays = input(this.config.hideOutsideDays ?? false, {
    transform: booleanAttribute,
  });
  /** Shows the week numbers before each week. */
  readonly weekNumbers = input(this.config.weekNumbers ?? false, { transform: booleanAttribute });
  /** How weeks are numbered: ISO 8601 or from 1 January. */
  readonly weekNumbering = input<BsWeekNumbering>(this.config.weekNumbering ?? 'iso');
  /** Accessible name of the week numbers column. */
  readonly weekLabel = input(this.config.weekLabel ?? 'Week');

  /** Emits when the user completes a selection: a date, or a range's end date. */
  readonly selectionComplete = output<BsDateValue>();

  protected readonly today = toIsoDate(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
  );
  private readonly dates = computed(() => selectedDates(this.value()));
  /**
   * First day of the first month shown. Follows the value unless one of its dates is
   * already in view or it was cleared.
   */
  protected readonly view = linkedSignal<string[], string>({
    source: this.dates,
    computation: (dates, previous) => {
      if (previous && (!dates.length || dates.some((iso) => this.isInView(iso, previous.value)))) {
        return previous.value;
      }
      return monthStart(dates[0] ?? this.today);
    },
  });
  /** Date that is in the tab order and gets focus. */
  protected readonly focused = linkedSignal<string[], string>({
    source: this.dates,
    computation: (dates, previous) =>
      previous && this.isInView(previous.value) ? previous.value : (dates[0] ?? this.today),
  });
  /** Date in the tab order: always a day of the months in view. */
  protected readonly tabStop = computed(() => {
    const view = this.view();
    const inView = (iso: string) => this.isInView(iso, view);
    const focused = this.focused();
    if (inView(focused)) {
      return focused;
    }
    return this.dates().find(inView) ?? (inView(this.today) ? this.today : view);
  });
  protected readonly hovered = signal<string | null>(null);
  private focusPending = false;
  private readonly idPrefix = uniqueId('bs-calendar');

  protected readonly weekDays = computed(() => {
    const locale = this.locale();
    const short = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const long = new Intl.DateTimeFormat(locale, { weekday: 'long' });
    // 2023-01-01 was a Sunday.
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(2023, 0, 1 + ((i + this.firstWeekday()) % 7));
      return { short: short.format(date), long: long.format(date) };
    });
  });

  /** Adds a column for the week numbers to Bootstrap's seven-column rows. */
  protected readonly gridColumns = computed(() =>
    this.weekNumbers() ? '1.5rem repeat(7, 1fr)' : null,
  );

  protected readonly months = computed<CalendarMonth[]>(() => {
    const start = requireDate(this.view());
    const count = Math.max(1, this.monthsCount());
    const outside = count === 1 && !this.hideOutsideDays();
    return Array.from({ length: count }, (_, i) => {
      const year = new Date(start.getFullYear(), start.getMonth() + i, 1).getFullYear();
      const month = new Date(start.getFullYear(), start.getMonth() + i, 1).getMonth();
      const offset = (new Date(year, month, 1).getDay() - this.firstWeekday() + 7) % 7;
      const length = new Date(year, month + 1, 0).getDate();
      const cells = Math.ceil((offset + length) / 7) * 7;
      const days = Array.from({ length: cells }, (_, cell): CalendarDay | null => {
        const day = cell - offset + 1;
        const date = new Date(year, month, day);
        const kind = day < 1 ? 'prev' : day > length ? 'next' : null;
        if (kind && !outside) {
          return null;
        }
        return { iso: toIsoDate(year, month, day), day: date.getDate(), month: kind };
      });
      const weeks = Array.from({ length: cells / 7 }, (_, w) => ({
        number: weekNumber(
          new Date(year, month, w * 7 - offset + 1),
          this.firstWeekday(),
          this.weekNumbering(),
        ),
        days: days.slice(w * 7, w * 7 + 7),
      }));
      return { id: `${this.idPrefix}-${year}-${month}`, year, month, weeks };
    });
  });

  constructor() {
    super();
    afterRenderEffect(() => {
      this.focused();
      if (this.focusPending) {
        this.focusPending = false;
        this.focusDate();
      }
    });
  }

  /** Moves focus into the calendar, to the selected date or today. */
  focus(): void {
    if (!this.focusDate()) {
      afterNextRender(() => this.focusDate(), { injector: this.injector });
    }
  }

  /** Whether a date can't be selected because of `min`, `max` or `dateDisabled`. */
  isDateDisabled(iso: string): boolean {
    const min = this.min();
    const max = this.max();
    return (!!min && iso < min) || (!!max && iso > max) || !!this.dateDisabled()?.(iso);
  }

  /** Created once per locale, because the grid labels every day on each render. */
  private readonly monthFormat = computed(
    () => new Intl.DateTimeFormat(this.locale(), { month: 'long' }),
  );
  private readonly dateFormat = computed(
    () => new Intl.DateTimeFormat(this.locale(), { dateStyle: 'full' }),
  );

  protected monthName(month: CalendarMonth): string {
    return this.monthFormat().format(new Date(month.year, month.month, 1));
  }

  protected dateLabel(iso: string): string {
    return this.dateFormat().format(requireDate(iso));
  }

  protected selectedState(iso: string): string | null {
    const dates = this.dates();
    if (this.selectionMode() !== 'range') {
      return dates.includes(iso) ? '' : null;
    }
    const start = dates[0];
    if (!start) {
      return null;
    }
    const end = dates[1] ?? start;
    if (iso < start || iso > end) {
      return null;
    }
    if (start === end) {
      return 'first-and-last';
    }
    return iso === start ? 'first' : iso === end ? 'last' : 'middle';
  }

  protected hoverState(iso: string): string | null {
    const dates = this.dates();
    const hovered = this.hovered();
    const selected = dates[0];
    if (this.selectionMode() !== 'range' || dates.length !== 1 || !selected || !hovered) {
      return null;
    }
    const [from, to] = [selected, hovered].sort() as [string, string];
    if (iso < from || iso > to || from === to) {
      return null;
    }
    return iso === from ? 'first' : iso === to ? 'last' : '';
  }

  protected moveView(months: number): void {
    this.view.set(addMonths(this.view(), months));
    const focused = this.focused();
    if (!this.isInView(focused)) {
      this.focused.set(addMonths(focused, months));
    }
  }

  protected pick(iso: string): void {
    if (this.isDisabled() || this.isDateDisabled(iso)) {
      return;
    }
    this.focused.set(iso);
    const dates = this.dates();
    switch (this.selectionMode()) {
      case 'single':
        this.updateValue(iso);
        this.selectionComplete.emit(iso);
        break;
      case 'multiple':
        this.updateValue(
          dates.includes(iso) ? dates.filter((d) => d !== iso) : [...dates, iso].sort(),
        );
        break;
      case 'range':
        if (dates.length === 1) {
          const range = [dates[0] ?? iso, iso].sort();
          this.updateValue(range);
          this.selectionComplete.emit(range);
        } else {
          this.updateValue([iso]);
        }
        break;
    }
    this.markTouched();
  }

  protected onFocusout(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (!(next instanceof Node) || !this.element.contains(next)) {
      this.markTouched();
    }
  }

  protected onKeydown(event: KeyboardEvent, iso: string): void {
    const weekday = (requireDate(iso).getDay() - this.firstWeekday() + 7) % 7;
    let next: string;
    switch (event.key) {
      case 'ArrowLeft':
        next = addDays(iso, this.isRtl() ? 1 : -1);
        break;
      case 'ArrowRight':
        next = addDays(iso, this.isRtl() ? -1 : 1);
        break;
      case 'ArrowUp':
        next = addDays(iso, -7);
        break;
      case 'ArrowDown':
        next = addDays(iso, 7);
        break;
      case 'Home':
        next = addDays(iso, -weekday);
        break;
      case 'End':
        next = addDays(iso, 6 - weekday);
        break;
      case 'PageUp':
        next = addMonths(iso, event.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        next = addMonths(iso, event.shiftKey ? 12 : 1);
        break;
      default:
        return;
    }
    event.preventDefault();
    if (next === this.focused()) {
      // The signal won't change, so focus the date now rather than after a render.
      this.focusDate();
    } else {
      this.focusPending = true;
      this.focused.set(next);
    }
    if (!this.isInView(next)) {
      const date = requireDate(next);
      const first = requireDate(this.view());
      const forward = date > first;
      const count = Math.max(1, this.monthsCount());
      this.view.set(
        forward
          ? toIsoDate(date.getFullYear(), date.getMonth() - count + 1, 1)
          : toIsoDate(date.getFullYear(), date.getMonth(), 1),
      );
    }
  }

  private isInView(iso: string, start = this.view()): boolean {
    return iso >= start && iso < addMonths(start, Math.max(1, this.monthsCount()));
  }

  private focusDate(): boolean {
    const button = this.element.querySelector<HTMLElement>(
      `[data-vc-date-btn][data-iso="${this.tabStop()}"]`,
    );
    button?.focus();
    return !!button;
  }

  private isRtl(): boolean {
    return getComputedStyle(this.element).direction === 'rtl';
  }
}
