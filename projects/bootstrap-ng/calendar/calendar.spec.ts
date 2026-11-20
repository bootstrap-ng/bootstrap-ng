import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import fc from 'fast-check';
import {
  BsCalendar,
  provideBsCalendarConfig,
  BsDateSelectionMode,
  BsDateValue,
  BsWeekNumbering,
  parseIsoDate,
  toIsoDate,
  weekNumber,
} from './calendar';

describe('calendar date helpers', () => {
  it('formats and parses ISO dates', () => {
    expect(toIsoDate(2026, 0, 32)).toBe('2026-02-01');
    expect(parseIsoDate('2026-02-30')).toBeNull();
    expect(parseIsoDate('2026-06-10')?.getDate()).toBe(10);
    expect(parseIsoDate('nope')).toBeNull();
  });

  it('numbers ISO 8601 weeks', () => {
    // 2026 starts on a Thursday, so its week 1 starts on 29 December 2025.
    expect(weekNumber(new Date(2025, 11, 29))).toBe(1);
    expect(weekNumber(new Date(2026, 5, 8))).toBe(24);
    // 2027 starts on a Friday, so its first days are in week 53 of 2026.
    expect(weekNumber(new Date(2026, 11, 28))).toBe(53);
    expect(weekNumber(new Date(2027, 0, 4))).toBe(1);
    // Weeks starting on Sunday take the number of the ISO week holding most of their days.
    expect(weekNumber(new Date(2026, 5, 7), 0)).toBe(24);
    expect(weekNumber(new Date(2027, 0, 3), 0)).toBe(1);
  });

  it('numbers weeks from 1 January', () => {
    expect(weekNumber(new Date(2025, 11, 28), 0, 'simple')).toBe(1);
    expect(weekNumber(new Date(2026, 0, 4), 0, 'simple')).toBe(2);
    expect(weekNumber(new Date(2026, 11, 20), 0, 'simple')).toBe(52);
    // The week holding 1 January 2027 is week 1, though it starts in 2026.
    expect(weekNumber(new Date(2026, 11, 27), 0, 'simple')).toBe(1);
    expect(weekNumber(new Date(2025, 11, 29), 1, 'simple')).toBe(1);
    expect(weekNumber(new Date(2026, 5, 8), 1, 'simple')).toBe(24);
  });
});

describe('calendar date helpers (property-based)', () => {
  const DAY = 24 * 60 * 60 * 1000;
  // Local dates from year 1000, so `new Date(year, …)` doesn't map 2-digit years to 19xx.
  const localDate = fc
    .date({ min: new Date(1000, 0, 1), max: new Date(9999, 11, 1), noInvalidDate: true })
    .map((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()));
  const firstWeekday = fc.integer({ min: 0, max: 6 });
  const startOfWeek = (date: Date, weekday: number) =>
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() - ((date.getDay() - weekday + 7) % 7),
    );
  const nextWeek = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7);

  /** A textbook ISO 8601 week number, computed in UTC. */
  const isoWeek = (date: Date) => {
    const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    utc.setUTCDate(utc.getUTCDate() + 4 - (utc.getUTCDay() || 7));
    const yearStart = Date.UTC(utc.getUTCFullYear(), 0, 1);
    return Math.ceil(((utc.getTime() - yearStart) / DAY + 1) / 7);
  };

  it('round-trips dates through toIsoDate and parseIsoDate', () => {
    fc.assert(
      fc.property(localDate, (date) => {
        const iso = toIsoDate(date.getFullYear(), date.getMonth(), date.getDate());
        expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(parseIsoDate(iso)?.getTime()).toBe(date.getTime());
      }),
    );
  });

  it('parses any string to null or the date it spells', () => {
    // Years from 1000: `new Date()` reads years 0 to 99 as 1900 to 1999.
    const isoLike = fc
      .tuple(
        fc.integer({ min: 1000, max: 9999 }),
        fc.integer({ min: 0, max: 99 }),
        fc.integer({ min: 0, max: 99 }),
      )
      .map(([y, m, d]) => [y, m, d].map((n, i) => String(n).padStart(i ? 2 : 4, '0')).join('-'));
    fc.assert(
      fc.property(fc.oneof(fc.string(), isoLike), (value) => {
        const date = parseIsoDate(value);
        const iso = date && toIsoDate(date.getFullYear(), date.getMonth(), date.getDate());
        expect(iso === null || iso === value.trim()).toBe(true);
      }),
    );
  });

  it('matches ISO 8601 week numbers for weeks starting on Monday', () => {
    fc.assert(
      fc.property(localDate, (date) => {
        expect(weekNumber(startOfWeek(date, 1))).toBe(isoWeek(date));
      }),
    );
  });

  it('numbers consecutive weeks one apart, restarting at week 1', () => {
    const numbering = fc.constantFrom<BsWeekNumbering>('iso', 'simple');
    fc.assert(
      fc.property(localDate, firstWeekday, numbering, (date, weekday, mode) => {
        const start = startOfWeek(date, weekday);
        const week = weekNumber(start, weekday, mode);
        const next = weekNumber(nextWeek(start), weekday, mode);
        expect(week).toBeGreaterThanOrEqual(1);
        expect(week).toBeLessThanOrEqual(mode === 'iso' ? 53 : 54);
        expect(next === week + 1 || (next === 1 && week >= 52)).toBe(true);
      }),
    );
  });

  it('makes the week holding 1 January week 1 with simple numbering', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1000, max: 9999 }), firstWeekday, (year, weekday) => {
        expect(weekNumber(startOfWeek(new Date(year, 0, 1), weekday), weekday, 'simple')).toBe(1);
      }),
    );
  });
});

describe('BsCalendar', () => {
  @Component({
    imports: [BsCalendar, ReactiveFormsModule],
    template: `
      <div
        bsCalendar
        locale="en-US"
        [selectionMode]="mode()"
        [monthsCount]="months()"
        [colorMode]="colorMode()"
        min="2026-06-03"
        [formControl]="date"
        (selectionComplete)="completed.set($event)"></div>
    `,
  })
  class Host {
    readonly mode = signal<BsDateSelectionMode>('single');
    readonly months = signal(1);
    readonly colorMode = signal<'light' | 'dark' | null>(null);
    date = new FormControl<BsDateValue>('2026-06-10');
    readonly completed = signal<BsDateValue>(null);
  }

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement.querySelector('[bsCalendar]');
    const button = (iso: string) =>
      host.querySelector<HTMLButtonElement>(`[data-vc-date-btn][data-iso="${iso}"]`)!;
    const cell = (iso: string) => host.querySelector<HTMLElement>(`[data-vc-date="${iso}"]`)!;
    return { fixture, host, button, cell, component: fixture.componentInstance };
  }

  it('renders Bootstrap datepicker markup for the value month', async () => {
    const { host, cell, button } = await setup();
    expect(host.getAttribute('data-vc')).toBe('calendar');
    expect(host.querySelector('[data-vc="month"]')!.textContent.trim()).toBe('June');
    expect(host.querySelector('[data-vc="year"]')!.textContent.trim()).toBe('2026');
    expect(host.querySelector('[role="grid"]')).not.toBeNull();
    expect(host.querySelectorAll('[data-vc-week-day]')).toHaveLength(7);
    expect(host.querySelector('[data-vc-week-day]')!.textContent?.trim()).toBe('Mon');
    expect(host.querySelector('[data-vc-week-day]')!.getAttribute('aria-label')).toBe('Monday');
    expect(host.querySelector('[data-vc-week-day]')!.hasAttribute('title')).toBe(false);
    expect(cell('2026-06-10').hasAttribute('data-vc-date-selected')).toBe(true);
    expect(cell('2026-06-10').getAttribute('aria-selected')).toBe('true');
    expect(cell('2026-06-02').hasAttribute('data-vc-date-disabled')).toBe(true);
    expect(button('2026-06-10').tabIndex).toBe(0);
    expect(button('2026-06-11').tabIndex).toBe(-1);
    expect(button('2026-06-10').getAttribute('aria-label')).toBe('Wednesday, June 10, 2026');
  });

  it('inherits the color mode unless colorMode forces one', async () => {
    const { fixture, host, component } = await setup();
    expect(host.style.colorScheme).toBe('inherit');
    expect(host.hasAttribute('data-bs-theme')).toBe(false);
    component.colorMode.set('dark');
    await fixture.whenStable();
    expect(host.style.colorScheme).toBe('');
    expect(host.getAttribute('data-bs-theme')).toBe('dark');
  });

  it('selects a date and ignores disabled ones', async () => {
    const { fixture, button, component } = await setup();
    button('2026-06-12').click();
    await fixture.whenStable();
    expect(component.date.value).toBe('2026-06-12');
    expect(component.completed()).toBe('2026-06-12');
    expect(component.date.touched).toBe(true);
    button('2026-06-02').click();
    await fixture.whenStable();
    expect(component.date.value).toBe('2026-06-12');
  });

  it('selects ranges and multiple dates', async () => {
    const { fixture, button, cell, component } = await setup();
    component.mode.set('range');
    component.date.setValue([]);
    await fixture.whenStable();
    button('2026-06-15').click();
    await fixture.whenStable();
    expect(component.completed()).toBeNull();
    button('2026-06-12').click();
    await fixture.whenStable();
    expect(component.date.value).toEqual(['2026-06-12', '2026-06-15']);
    expect(component.completed()).toEqual(['2026-06-12', '2026-06-15']);
    expect(cell('2026-06-12').getAttribute('data-vc-date-selected')).toBe('first');
    expect(cell('2026-06-13').getAttribute('data-vc-date-selected')).toBe('middle');
    expect(cell('2026-06-15').getAttribute('data-vc-date-selected')).toBe('last');

    component.mode.set('multiple');
    component.date.setValue([]);
    await fixture.whenStable();
    button('2026-06-20').click();
    await fixture.whenStable();
    button('2026-06-18').click();
    await fixture.whenStable();
    expect(component.date.value).toEqual(['2026-06-18', '2026-06-20']);
    button('2026-06-20').click();
    await fixture.whenStable();
    expect(component.date.value).toEqual(['2026-06-18']);
  });

  it('keeps the view when a range ends in another month', async () => {
    const { fixture, host, button, component } = await setup();
    component.mode.set('range');
    component.date.setValue([]);
    await fixture.whenStable();
    button('2026-06-28').click();
    await fixture.whenStable();
    host.querySelector<HTMLButtonElement>('[data-vc-arrow="next"]')!.click();
    await fixture.whenStable();
    button('2026-07-03').click();
    await fixture.whenStable();
    expect(component.date.value).toEqual(['2026-06-28', '2026-07-03']);
    expect(host.querySelector('[data-vc="month"]')!.textContent.trim()).toBe('July');
    expect(button('2026-07-03').tabIndex).toBe(0);

    component.mode.set('multiple');
    component.date.setValue(['2026-07-03']);
    await fixture.whenStable();
    host.querySelector<HTMLButtonElement>('[data-vc-arrow="next"]')!.click();
    await fixture.whenStable();
    button('2026-08-12').click();
    await fixture.whenStable();
    expect(component.date.value).toEqual(['2026-07-03', '2026-08-12']);
    expect(host.querySelector('[data-vc="month"]')!.textContent.trim()).toBe('August');
    expect(button('2026-08-12').tabIndex).toBe(0);
  });

  it('marks the control touched when focus leaves the calendar', async () => {
    const { fixture, button, component } = await setup();
    const outside = document.createElement('button');
    document.body.append(outside);
    button('2026-06-10').dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: button('2026-06-11') }),
    );
    await fixture.whenStable();
    expect(component.date.touched).toBe(false);
    button('2026-06-11').dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: outside }),
    );
    await fixture.whenStable();
    expect(component.date.touched).toBe(true);
    outside.remove();
  });

  it('moves focus with the keyboard and changes month', async () => {
    const { fixture, host, button } = await setup();
    const key = async (iso: string, name: string, shiftKey = false) => {
      button(iso).dispatchEvent(
        new KeyboardEvent('keydown', { key: name, shiftKey, bubbles: true }),
      );
      await fixture.whenStable();
    };
    button('2026-06-10').focus();
    await key('2026-06-10', 'ArrowRight');
    expect(document.activeElement).toBe(button('2026-06-11'));
    await key('2026-06-11', 'ArrowDown');
    expect(document.activeElement).toBe(button('2026-06-18'));
    await key('2026-06-18', 'Home');
    expect(document.activeElement).toBe(button('2026-06-15'));
    await key('2026-06-15', 'End');
    expect(document.activeElement).toBe(button('2026-06-21'));
    await key('2026-06-21', 'PageDown');
    expect(host.querySelector('[data-vc="month"]')!.textContent.trim()).toBe('July');
    expect(document.activeElement).toBe(button('2026-07-21'));
    expect(button('2026-07-21').tabIndex).toBe(0);
    await key('2026-07-21', 'PageUp', true);
    expect(host.querySelector('[data-vc="year"]')!.textContent.trim()).toBe('2025');
    expect(document.activeElement).toBe(button('2025-07-21'));
  });

  it('swaps Arrow Left and Right in right-to-left layouts, and moves by week and year', async () => {
    const { fixture, host, button } = await setup();
    const key = async (iso: string, name: string, shiftKey = false) => {
      const event = new KeyboardEvent('keydown', {
        key: name,
        shiftKey,
        bubbles: true,
        cancelable: true,
      });
      button(iso).dispatchEvent(event);
      await fixture.whenStable();
      return event;
    };
    button('2026-06-10').focus();
    await key('2026-06-10', 'ArrowLeft');
    expect(document.activeElement).toBe(button('2026-06-09'));
    await key('2026-06-09', 'ArrowUp');
    expect(document.activeElement).toBe(button('2026-06-02'));

    host.dir = 'rtl';
    await key('2026-06-02', 'ArrowLeft');
    expect(document.activeElement).toBe(button('2026-06-03'));
    await key('2026-06-03', 'ArrowRight');
    expect(document.activeElement).toBe(button('2026-06-02'));
    host.dir = '';

    await key('2026-06-02', 'PageDown', true);
    expect(host.querySelector('[data-vc="year"]')!.textContent.trim()).toBe('2027');
    expect(document.activeElement).toBe(button('2027-06-02'));
    // Other keys, such as letters, are left alone.
    expect((await key('2027-06-02', 'a')).defaultPrevented).toBe(false);
  });

  it('previews a range while hovering its end', async () => {
    const { fixture, button, cell, component } = await setup();
    component.mode.set('range');
    component.date.setValue(['2026-06-10']);
    await fixture.whenStable();
    const hover = (iso: string) => cell(iso).getAttribute('data-vc-date-hover');

    button('2026-06-13').dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    expect(hover('2026-06-10')).toBe('first');
    expect(hover('2026-06-11')).toBe('');
    expect(hover('2026-06-13')).toBe('last');
    expect(cell('2026-06-14').hasAttribute('data-vc-date-hover')).toBe(false);

    // Hovering before the start previews the range backwards.
    button('2026-06-07').dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    expect(hover('2026-06-07')).toBe('first');
    expect(hover('2026-06-10')).toBe('last');

    // Hovering the start itself previews nothing.
    button('2026-06-10').dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    expect(cell('2026-06-10').hasAttribute('data-vc-date-hover')).toBe(false);

    button('2026-06-10').dispatchEvent(new MouseEvent('mouseleave'));
    await fixture.whenStable();
    expect(cell('2026-06-10').hasAttribute('data-vc-date-hover')).toBe(false);
  });

  it('resets to an empty array in range mode', async () => {
    const { fixture, cell, component } = await setup();
    component.mode.set('range');
    component.date.setValue(['2026-06-10', '2026-06-12']);
    await fixture.whenStable();
    component.date.reset();
    await fixture.whenStable();
    const calendar = fixture.debugElement.query(By.directive(BsCalendar))
      .componentInstance as BsCalendar;
    expect(calendar.value()).toEqual([]);
    expect(cell('2026-06-10').hasAttribute('data-vc-date-selected')).toBe(false);
  });

  it('changes month with the arrow buttons and shows several months', async () => {
    const { fixture, host, component } = await setup();
    host.querySelector<HTMLButtonElement>('[data-vc-arrow="next"]')!.click();
    await fixture.whenStable();
    expect(host.querySelector('[data-vc="month"]')!.textContent.trim()).toBe('July');
    expect(host.querySelector('[data-vc-arrow="prev"]')!.getAttribute('aria-label')).toBe(
      'Previous month',
    );
    component.months.set(2);
    await fixture.whenStable();
    const months = Array.from(host.querySelectorAll('[data-vc="month"]')).map((m) =>
      m.textContent.trim(),
    );
    expect(months).toEqual(['July', 'August']);
    // Days of neighboring months are hidden when several months are shown.
    expect(host.querySelector('[data-vc-date-month]')).toBeNull();
  });

  it('keeps focus on the arrow buttons after a key that stays on the same date', async () => {
    const { fixture, host, button } = await setup();
    // 2026-06-15 is a Monday, so Home keeps it.
    button('2026-06-15').focus();
    await fixture.whenStable();
    button('2026-06-15').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true }),
    );
    await fixture.whenStable();
    expect(document.activeElement).toBe(button('2026-06-15'));
    const next = host.querySelector<HTMLButtonElement>('[data-vc-arrow="next"]')!;
    next.focus();
    next.click();
    await fixture.whenStable();
    expect(host.querySelector('[data-vc="month"]')!.textContent.trim()).toBe('July');
    expect(document.activeElement).toBe(next);
  });

  it('shows week numbers as row headers', async () => {
    @Component({
      imports: [BsCalendar],
      template: `<div
        bsCalendar
        locale="en-US"
        value="2027-01-10"
        [weekNumbers]="weekNumbers()"
        [weekNumbering]="numbering()"
        [firstWeekday]="firstWeekday()"></div>`,
    })
    class WeekHost {
      readonly weekNumbers = signal(false);
      readonly numbering = signal<BsWeekNumbering>('iso');
      readonly firstWeekday = signal(1);
    }
    const fixture = TestBed.createComponent(WeekHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement;
    const numbers = () =>
      Array.from(host.querySelectorAll('[data-vc-week-number]')).map((n) => n.textContent.trim());
    const row = () => host.querySelector<HTMLElement>('[data-vc-dates="row"]')!;
    expect(numbers()).toEqual([]);
    expect(host.querySelector('[data-vc-week-numbers="title"]')).toBeNull();
    expect(row().style.gridTemplateColumns).toBe('');

    fixture.componentInstance.weekNumbers.set(true);
    await fixture.whenStable();
    // 2027 starts on a Friday, so its first days are in ISO week 53 of 2026.
    expect(numbers()).toEqual(['53', '1', '2', '3', '4']);
    const title = host.querySelector('[data-vc-week-numbers="title"]')!;
    expect(title.getAttribute('role')).toBe('columnheader');
    expect(title.getAttribute('aria-label')).toBe('Week');
    expect(row().firstElementChild!.getAttribute('role')).toBe('rowheader');
    expect(row().style.gridTemplateColumns).toBe('1.5rem repeat(7, 1fr)');
    expect(host.querySelector<HTMLElement>('[data-vc="week"]')!.style.gridTemplateColumns).toBe(
      '1.5rem repeat(7, 1fr)',
    );

    fixture.componentInstance.firstWeekday.set(0);
    fixture.componentInstance.numbering.set('simple');
    await fixture.whenStable();
    expect(numbers()).toEqual(['1', '2', '3', '4', '5', '6']);
  });

  it('keeps a tab stop in the grid after picking a day of the previous month', async () => {
    @Component({
      imports: [BsCalendar],
      template: `<div bsCalendar locale="en-US" selectionMode="multiple" [(value)]="value"></div>`,
    })
    class MultipleHost {
      readonly value = signal<BsDateValue>(['2026-01-10']);
    }
    const fixture = TestBed.createComponent(MultipleHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const host: HTMLElement = fixture.nativeElement;
    const button = (iso: string) =>
      host.querySelector<HTMLButtonElement>(`[data-vc-date-btn][data-iso="${iso}"]`)!;
    button('2025-12-30').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toEqual(['2025-12-30', '2026-01-10']);
    expect(host.querySelector('[data-vc="month"]')!.textContent.trim()).toBe('January');
    const stops = host.querySelectorAll<HTMLButtonElement>('[data-vc-date-btn][tabindex="0"]');
    expect(stops).toHaveLength(1);
    expect(stops[0]).toBe(button('2026-01-10'));
  });

  describe('month and year views', () => {
    const key = async (fixture: { whenStable(): Promise<void> }, target: Element, name: string) => {
      target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
      await fixture.whenStable();
    };

    async function pickerSetup() {
      const ctx = await setup();
      const { host } = ctx;
      const headerMonth = () => host.querySelector<HTMLButtonElement>('button[data-vc="month"]')!;
      const headerYear = () => host.querySelector<HTMLButtonElement>('button[data-vc="year"]')!;
      const month = (index: number) =>
        host.querySelector<HTMLButtonElement>(`[data-vc-months-month="${index}"]`)!;
      const year = (value: number) =>
        host.querySelector<HTMLButtonElement>(`[data-vc-years-year="${value}"]`)!;
      const yearsGrid = () => host.querySelector('[data-vc="years"]')!;
      return { ...ctx, headerMonth, headerYear, month, year, yearsGrid };
    }

    it('picks a month from the month view', async () => {
      const { fixture, host, headerMonth, month, button, component } = await pickerSetup();
      const hint = host.querySelector(`#${headerMonth().getAttribute('aria-describedby')}`)!;
      expect(hint.textContent.trim()).toBe('Choose month');
      expect(hint.classList).toContain('visually-hidden');
      headerMonth().click();
      await fixture.whenStable();
      expect(host.querySelector('[data-vc-date-btn]')).toBeNull();
      expect(host.querySelector('[data-vc-arrow]')).toBeNull();
      const grid = host.querySelector('[data-vc="months"]')!;
      expect(grid.getAttribute('role')).toBe('grid');
      expect(host.querySelector(`#${grid.getAttribute('aria-labelledby')}`)!.textContent).toContain(
        '2026',
      );
      expect(host.querySelectorAll('[data-vc-months="row"]')).toHaveLength(3);
      expect(host.querySelectorAll('[data-vc-months-month]')).toHaveLength(12);
      expect(month(5).textContent.trim()).toBe('Jun');
      // No aria-label: the visible short name is the accessible name (WCAG 2.5.3).
      expect(month(5).hasAttribute('aria-label')).toBe(false);
      expect(month(5).hasAttribute('data-vc-months-month-selected')).toBe(true);
      expect(month(5).parentElement!.getAttribute('aria-selected')).toBe('true');
      expect(month(5).tabIndex).toBe(0);
      expect(document.activeElement).toBe(month(5));
      // min is 2026-06-03, so the months before June can't be picked.
      expect(month(4).getAttribute('aria-disabled')).toBe('true');
      month(4).click();
      await fixture.whenStable();
      expect(host.querySelector('[data-vc="months"]')).not.toBeNull();

      month(8).click();
      await fixture.whenStable();
      expect(headerMonth().textContent.trim()).toBe('September');
      expect(component.date.value).toBe('2026-06-10');
      expect(document.activeElement).toBe(button('2026-09-10'));
    });

    it('returns to the days when the month is clicked again or on Escape', async () => {
      const { fixture, host, headerMonth, month, button } = await pickerSetup();
      headerMonth().click();
      await fixture.whenStable();
      headerMonth().click();
      await fixture.whenStable();
      expect(host.querySelector('[data-vc="months"]')).toBeNull();
      expect(document.activeElement).toBe(button('2026-06-10'));
      headerMonth().click();
      await fixture.whenStable();
      await key(fixture, month(5), 'Escape');
      expect(host.querySelector('[data-vc="months"]')).toBeNull();
      expect(document.activeElement).toBe(button('2026-06-10'));
    });

    it('moves focus among the months with the keyboard', async () => {
      const { fixture, headerMonth, headerYear, month } = await pickerSetup();
      headerMonth().click();
      await fixture.whenStable();
      await key(fixture, month(5), 'ArrowRight');
      expect(document.activeElement).toBe(month(6));
      await key(fixture, month(6), 'ArrowDown');
      expect(document.activeElement).toBe(month(10));
      await key(fixture, month(10), 'Home');
      expect(document.activeElement).toBe(month(8));
      await key(fixture, month(8), 'End');
      expect(document.activeElement).toBe(month(11));
      // End again stays put.
      await key(fixture, month(11), 'End');
      expect(document.activeElement).toBe(month(11));
      await key(fixture, month(11), 'ArrowRight');
      expect(headerYear().textContent.trim()).toBe('2027');
      expect(document.activeElement).toBe(month(0));
      expect(month(5).hasAttribute('data-vc-months-month-selected')).toBe(false);
      await key(fixture, month(0), 'ArrowUp');
      expect(headerYear().textContent.trim()).toBe('2026');
      expect(document.activeElement).toBe(month(8));
      await key(fixture, month(8), 'PageDown');
      expect(headerYear().textContent.trim()).toBe('2027');
      await key(fixture, month(8), 'PageUp');
      expect(headerYear().textContent.trim()).toBe('2026');
      await key(fixture, month(8), 'ArrowLeft');
      expect(document.activeElement).toBe(month(7));
      // Other keys are left alone.
      const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      month(7).dispatchEvent(tab);
      expect(tab.defaultPrevented).toBe(false);
    });

    it('picks a year from the year view', async () => {
      const { fixture, host, headerYear, headerMonth, year, button, yearsGrid } =
        await pickerSetup();
      headerYear().click();
      await fixture.whenStable();
      expect(host.querySelectorAll('[data-vc-years-year]')).toHaveLength(15);
      expect(host.querySelectorAll('[data-vc-years="row"]')).toHaveLength(3);
      expect(yearsGrid().getAttribute('aria-label')).toBe('2019 – 2033');
      expect(headerYear().textContent.trim()).toBe('2026');
      expect(year(2026).hasAttribute('data-vc-years-year-selected')).toBe(true);
      expect(document.activeElement).toBe(year(2026));
      expect(year(2025).getAttribute('aria-disabled')).toBe('true');
      const next = host.querySelector<HTMLButtonElement>('[data-vc-arrow="next"]')!;
      const prev = host.querySelector<HTMLButtonElement>('[data-vc-arrow="prev"]')!;
      expect(next.getAttribute('aria-label')).toBe('Next years');
      expect(prev.getAttribute('aria-label')).toBe('Previous years');
      next.click();
      await fixture.whenStable();
      expect(yearsGrid().getAttribute('aria-label')).toBe('2034 – 2048');
      expect(year(2041).tabIndex).toBe(0);
      prev.click();
      await fixture.whenStable();
      year(2025).click();
      await fixture.whenStable();
      expect(host.querySelector('[data-vc="years"]')).not.toBeNull();
      year(2030).click();
      await fixture.whenStable();
      expect(headerMonth().textContent.trim()).toBe('June');
      expect(headerYear().textContent.trim()).toBe('2030');
      expect(document.activeElement).toBe(button('2030-06-10'));
    });

    it('moves focus among the years with the keyboard, across pages', async () => {
      const { fixture, host, headerYear, year, yearsGrid } = await pickerSetup();
      headerYear().click();
      await fixture.whenStable();
      await key(fixture, year(2026), 'ArrowDown');
      expect(document.activeElement).toBe(year(2031));
      await key(fixture, year(2031), 'ArrowDown');
      expect(yearsGrid().getAttribute('aria-label')).toBe('2034 – 2048');
      expect(document.activeElement).toBe(year(2036));
      await key(fixture, year(2036), 'Home');
      expect(document.activeElement).toBe(year(2034));
      await key(fixture, year(2034), 'ArrowLeft');
      expect(yearsGrid().getAttribute('aria-label')).toBe('2019 – 2033');
      expect(document.activeElement).toBe(year(2033));
      await key(fixture, year(2033), 'PageUp');
      expect(yearsGrid().getAttribute('aria-label')).toBe('2004 – 2018');
      expect(document.activeElement).toBe(year(2018));
      await key(fixture, year(2018), 'PageDown');
      await key(fixture, year(2033), 'ArrowUp');
      expect(document.activeElement).toBe(year(2028));
      await key(fixture, year(2028), 'End');
      expect(document.activeElement).toBe(year(2028));
      await key(fixture, year(2028), 'ArrowRight');
      expect(document.activeElement).toBe(year(2029));
      await key(fixture, year(2029), 'Escape');
      expect(host.querySelector('[data-vc="years"]')).toBeNull();
    });

    it('switches between the month and year views', async () => {
      const { fixture, host, headerMonth, headerYear, month, year, yearsGrid } =
        await pickerSetup();
      headerMonth().click();
      await fixture.whenStable();
      await key(fixture, month(5), 'PageDown');
      headerYear().click();
      await fixture.whenStable();
      // The years are centered on the year the month view showed.
      expect(yearsGrid().getAttribute('aria-label')).toBe('2020 – 2034');
      expect(document.activeElement).toBe(year(2027));
      headerMonth().click();
      await fixture.whenStable();
      expect(host.querySelector('[data-vc="months"]')).not.toBeNull();
      expect(headerYear().textContent.trim()).toBe('2027');
      expect(document.activeElement).toBe(month(5));
      headerYear().click();
      await fixture.whenStable();
      headerYear().click();
      await fixture.whenStable();
      expect(host.querySelector('[data-vc="years"]')).toBeNull();
      expect(host.querySelector('[data-vc-date-btn]')).not.toBeNull();
    });

    it('clamps a picked year to min and max', async () => {
      const { fixture, host, headerMonth, headerYear, year } = await pickerSetup();
      host.querySelector<HTMLButtonElement>('[data-vc-arrow="prev"]')!.click();
      await fixture.whenStable();
      // May 2026 is before min (2026-06-03): picking 2026 again shows June.
      headerYear().click();
      await fixture.whenStable();
      year(2026).click();
      await fixture.whenStable();
      expect(headerMonth().textContent.trim()).toBe('June');

      TestBed.resetTestingModule();
      @Component({
        imports: [BsCalendar],
        template: `<div bsCalendar locale="en-US" value="2026-10-31" max="2027-02-14"></div>`,
      })
      class MaxHost {}
      const maxFixture = TestBed.createComponent(MaxHost);
      maxFixture.autoDetectChanges();
      await maxFixture.whenStable();
      const root: HTMLElement = maxFixture.nativeElement;
      root.querySelector<HTMLButtonElement>('button[data-vc="year"]')!.click();
      await maxFixture.whenStable();
      expect(root.querySelector('[data-vc-years-year="2028"]')!.getAttribute('aria-disabled')).toBe(
        'true',
      );
      root.querySelector<HTMLButtonElement>('[data-vc-years-year="2027"]')!.click();
      await maxFixture.whenStable();
      expect(root.querySelector('[data-vc="month"]')!.textContent.trim()).toBe('February');
      // The focused day is kept, within the shorter month.
      expect(document.activeElement?.getAttribute('data-iso')).toBe('2027-02-28');
    });

    it('picks a month for the column whose header was clicked', async () => {
      const { fixture, host, component, month } = await pickerSetup();
      component.months.set(2);
      await fixture.whenStable();
      host.querySelectorAll<HTMLButtonElement>('button[data-vc="month"]')[1].click();
      await fixture.whenStable();
      expect(month(6).hasAttribute('data-vc-months-month-selected')).toBe(true);
      month(9).click();
      await fixture.whenStable();
      const months = Array.from(host.querySelectorAll('[data-vc="month"]')).map((m) =>
        m.textContent.trim(),
      );
      expect(months).toEqual(['September', 'October']);
    });

    it('can turn the month and year buttons off', async () => {
      @Component({
        imports: [BsCalendar],
        template: `<div
          bsCalendar
          locale="en-US"
          value="2026-06-10"
          [monthSelection]="false"
          yearSelection="false"></div>`,
      })
      class PlainHost {}
      const fixture = TestBed.createComponent(PlainHost);
      fixture.autoDetectChanges();
      await fixture.whenStable();
      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelector('[data-vc="month"]')!.tagName).toBe('SPAN');
      expect(root.querySelector('[data-vc="year"]')!.tagName).toBe('SPAN');
      expect(root.querySelector('.visually-hidden')).toBeNull();
    });

    it('takes labels from provideBsCalendarConfig()', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideBsCalendarConfig({
            monthSelectionLabel: 'Monat wählen',
            yearSelectionLabel: 'Jahr wählen',
            prevYearsLabel: 'Frühere Jahre',
            nextYearsLabel: 'Spätere Jahre',
          }),
        ],
      });
      const { fixture, host, headerYear } = await pickerSetup();
      const hint = host.querySelector(`#${headerYear().getAttribute('aria-describedby')}`)!;
      expect(hint.textContent.trim()).toBe('Jahr wählen');
      headerYear().click();
      await fixture.whenStable();
      expect(host.querySelector('[data-vc-arrow="next"]')!.getAttribute('aria-label')).toBe(
        'Spätere Jahre',
      );
    });

    describe('Japanese era years (wareki)', () => {
      @Component({
        imports: [BsCalendar],
        template: `<div
          bsCalendar
          [locale]="locale()"
          [value]="value()"
          [yearSelection]="yearSelection()"
          wareki></div>`,
      })
      class WarekiHost {
        readonly locale = signal('ja-JP');
        readonly value = signal('2026-03-31');
        readonly yearSelection = signal(true);
      }

      async function warekiSetup() {
        const fixture = TestBed.createComponent(WarekiHost);
        fixture.autoDetectChanges();
        await fixture.whenStable();
        const root: HTMLElement = fixture.nativeElement;
        const header = () => root.querySelector('[data-vc-header="content"]')!;
        const headerYear = () => root.querySelector<HTMLElement>('[data-vc="year"]')!;
        const year = (value: number) =>
          root.querySelector<HTMLButtonElement>(`[data-vc-years-year="${value}"]`)!;
        return { fixture, root, header, headerYear, year, component: fixture.componentInstance };
      }

      it('shows the era year before the month in the header', async () => {
        const { fixture, header, headerYear, component } = await warekiSetup();
        expect(headerYear().textContent.trim()).toBe('令和8年（2026）');
        // Japanese puts the year first: 令和8年（2026） 3月.
        expect(header().firstElementChild).toBe(headerYear());
        expect(header().textContent.replace(/\s+/g, '')).toBe('令和8年（2026）3月');
        // The era changed on 1 May 2019.
        component.value.set('2019-04-30');
        await fixture.whenStable();
        expect(headerYear().textContent.trim()).toBe('平成31年（2019）');
        component.value.set('2019-05-01');
        await fixture.whenStable();
        expect(headerYear().textContent.trim()).toMatch(/^令和(元|1)年（2019）$/);
        component.yearSelection.set(false);
        await fixture.whenStable();
        expect(headerYear().tagName).toBe('SPAN');
        expect(headerYear().textContent.trim()).toMatch(/^令和(元|1)年（2019）$/);
      });

      it('lists era years in three columns in the year view', async () => {
        const { fixture, root, headerYear, year } = await warekiSetup();
        headerYear().click();
        await fixture.whenStable();
        const grid = root.querySelector<HTMLElement>('[data-vc="years"]')!;
        expect(grid.style.getPropertyValue('--bs-vc-columns')).toBe('3');
        expect(root.querySelectorAll('[data-vc-years="row"]')).toHaveLength(5);
        expect(year(2024).textContent.replace(/\s+/g, '')).toBe('令和6年（2024）');
        expect(year(2024).querySelector('span')!.textContent).toBe('（2024）');
        expect(year(2026).hasAttribute('data-vc-years-year-selected')).toBe(true);
        // A year with two eras is named after the era it ends in.
        expect(year(2019).textContent.replace(/\s+/g, '')).toMatch(/^令和(元|1)年（2019）$/);
        expect(grid.getAttribute('aria-label')).toMatch(
          /^令和(元|1)年（2019） – 令和15年（2033）$/,
        );
        root.querySelector<HTMLButtonElement>('[data-vc-arrow="prev"]')!.click();
        await fixture.whenStable();
        expect(year(2018).textContent.replace(/\s+/g, '')).toBe('平成30年（2018）');
        expect(grid.getAttribute('aria-label')).toBe('平成16年（2004） – 平成30年（2018）');
        root.querySelector<HTMLButtonElement>('[data-vc-arrow="next"]')!.click();
        await fixture.whenStable();
        // Arrow Down moves by a row of three.
        year(2026).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        await fixture.whenStable();
        expect(document.activeElement).toBe(year(2029));
        year(2024).click();
        await fixture.whenStable();
        expect(headerYear().textContent.trim()).toBe('令和6年（2024）');
      });

      it('uses the locale for era names', async () => {
        const { fixture, header, headerYear, component } = await warekiSetup();
        component.locale.set('en-US');
        await fixture.whenStable();
        expect(headerYear().textContent.trim()).toBe('8 Reiwa (2026)');
        expect(header().firstElementChild).toBe(headerYear());
        headerYear().click();
        await fixture.whenStable();
        expect(
          header().ownerDocument.querySelector('[data-vc-years-year="2026"] span')!.textContent,
        ).toBe('(2026)');
      });

      it('can be turned on with provideBsCalendarConfig()', async () => {
        TestBed.configureTestingModule({ providers: [provideBsCalendarConfig({ wareki: true })] });
        @Component({
          imports: [BsCalendar],
          template: `<div bsCalendar locale="ja-JP" value="2026-03-31"></div>`,
        })
        class ConfigHost {}
        const fixture = TestBed.createComponent(ConfigHost);
        fixture.autoDetectChanges();
        await fixture.whenStable();
        const root: HTMLElement = fixture.nativeElement;
        expect(root.querySelector('[data-vc="year"]')!.textContent.trim()).toBe('令和8年（2026）');
      });
    });

    it('keeps the control untouched when its focused header button is replaced', async () => {
      const { fixture, headerMonth, component } = await pickerSetup();
      headerMonth().focus();
      headerMonth().click();
      await fixture.whenStable();
      expect(component.date.touched).toBe(false);
    });
  });
});
